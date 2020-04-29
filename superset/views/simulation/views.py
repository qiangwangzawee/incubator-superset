# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import json
import traceback
import logging
import os
import tempfile
from flask import flash, redirect, g, request
from flask_appbuilder.widgets import ListWidget
from flask_appbuilder import expose, has_access, SimpleFormView
from flask_appbuilder.urltools import get_filter_args
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_babel import lazy_gettext as _

from superset import app, db, event_logger, simulation_logger, celery_app
from superset.connectors.connector_registry import ConnectorRegistry
from superset.constants import RouteMethod
from superset.models.simulation import Assumption, Simulation, SimulationLog
from superset.utils import core as utils
from superset.views.base import check_ownership, DeleteMixin, SupersetModelView

from .forms import UploadAssumptionForm
from .assumption_process import process_assumptions
from .util import get_obg_s3_url

def upload_stream_write(form_file_field: "FileStorage", path: str):
    chunk_size = app.config["UPLOAD_CHUNK_SIZE"]
    with open(path, "bw") as file_description:
        while True:
            chunk = form_file_field.stream.read(chunk_size)
            if not chunk:
                break
            file_description.write(chunk)

@celery_app.task
def handle_assumption_process(path, name):
    assumption_file = db.session.query(Assumption).filter_by(name=name).one_or_none()
    try:
        process_assumptions(path, name)
        assumption_file.status = "Success"
        db.session.merge(assumption_file)
        db.session.commit()
        print('process finished')
    except Exception as e:
        assumption_file.status = "Error"
        assumption_file.status_detail = str(e)
        db.session.merge(assumption_file)
        db.session.commit()
        print(e)
    finally:
        os.remove(path)

class UploadAssumptionView(SimpleFormView):
    route_base = '/upload_assumption_file'
    form = UploadAssumptionForm
    form_template = "appbuilder/general/model/edit.html"
    form_title = "Upload assumption excel template"

    @simulation_logger.log_simulation('upload assumption')
    def form_post(self, form):
        print('uploaded success')
        import time
        time1 = time.time()
        excel_filename = form.excel_file.data.filename
        extension = os.path.splitext(excel_filename)[1].lower()
        path = tempfile.NamedTemporaryFile(
            dir=app.config["UPLOAD_FOLDER"], suffix=extension, delete=False
        ).name

        form.excel_file.data.filename = path
        name = form.name.data
        g.action_object = name
        g.action_object_type = 'Assumption'
        try:
            utils.ensure_path_exists(app.config["UPLOAD_FOLDER"])
            upload_stream_write(form.excel_file.data, path)
            # download_link = process_assumptions(path, name)
            handle_assumption_process.apply_async(args=[path, name])
            assumption_file = db.session.query(Assumption).filter_by(name=name).one_or_none()
            if not assumption_file:
                assumption_file = Assumption()
            assumption_file.name = name
            assumption_file.status = "Processing"
            # assumption_file.download_link = download_link
            db.session.merge(assumption_file)
            db.session.commit()
            message = "Upload success"
            style = 'info'
            g.result = 'Success'
            g.detail = None
        except Exception as e:
            traceback.print_exc()
            db.session.rollback()
            message = "Upload failed:" + str(e)
            style = 'danger'
            g.result = 'Failed'
            g.detail = message
        # os.remove(path)
        flash(message, style)
        flash("Time used:{}".format(time.time() - time1), 'info')
        # message = 'Upload success'

        return redirect('/upload_assumption_file/form')


class AssumptionListWidget(ListWidget):
    template = 'empower/widgets/list_assumption.html'

class AssumptionModelView(SupersetModelView):
    route_base = "/assuptionmodelview"
    datamodel = SQLAInterface(Assumption)
    include_route_methods = {RouteMethod.LIST, RouteMethod.EDIT, RouteMethod.DELETE, RouteMethod.INFO, RouteMethod.SHOW}
    formatters_columns = {'download_link': lambda x: '<button type="button">Download</>'}
    list_widget = AssumptionListWidget

    order_columns = ['name']
    list_columns = ['name', 'status', 'status_detail', 'download_link']
    label_columns = {'name':'Name','status':'Status','status_detail':'Status Detail', 'download_link':'Download'}



class SimulationModelView(
    SupersetModelView
):
    route_base = "/simulationmodelview"
    datamodel = SQLAInterface(Simulation)
    include_route_methods = RouteMethod.CRUD_SET

    list_columns = ['run_id', 'name','assumption', 'status']


    def _add(self):
        is_valid_form = True
        get_filter_args(self._filters)
        exclude_cols = self._filters.get_relation_cols()
        form = self.add_form.refresh()
        if request.method == "POST":
            if form.validate():

                # Calling add simulation
                self.add_simulation(form, exclude_cols)
            else:
                is_valid_form = False
        if is_valid_form:
            self.update_redirect()
        return self._get_add_widget(form=form, exclude_cols=exclude_cols)

    @simulation_logger.log_simulation('create simulation')
    def add_simulation(self, form, exclude_cols):
        self._fill_form_exclude_cols(exclude_cols, form)

        item = self.datamodel.obj()
        try:
            form.populate_obj(item)

            g.action_object = item.name
            g.action_object_type = 'Simulation'
            g.result = 'Failed'
            g.detail = None
        except Exception as e:
            flash(str(e), "danger")
            g.detail = str(e)
        else:
            if self.datamodel.add(item):
                g.result = 'Success'
                g.detail = None
            flash(*self.datamodel.message)
        finally:
            return None




class SimulationLogModelView(SupersetModelView):
    route_base = "/simulationlog"
    datamodel = SQLAInterface(SimulationLog)
    include_route_methods = {RouteMethod.LIST, RouteMethod.SHOW, RouteMethod.INFO}

    list_columns = ['user', 'action', 'action_object', 'dttm', 'result']
    order_columns = ['user', 'action_object', 'action_object_type','dttm']



