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
# pylint: disable=C,R,W
from flask_appbuilder.security.registerviews import RegisterUserDBView
from flask_appbuilder.security.forms import RegisterUserDBForm
from flask_appbuilder.fieldwidgets import BS3TextFieldWidget
from wtforms import StringField
from wtforms.validators import DataRequired
from flask_babel import lazy_gettext

email_subject = 'SolarBI - Email Confirmation '


class SolarRegisterUserDBForm(RegisterUserDBForm):
    organization = StringField(lazy_gettext('Organisation'),
                               validators=[DataRequired()],
                               widget=BS3TextFieldWidget())


class SolarRegisterUserDBView(RegisterUserDBView):
    form = SolarRegisterUserDBForm

    email_subject = email_subject

    # def form_post(self, form):
