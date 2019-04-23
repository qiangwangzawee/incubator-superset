from flask_babel import lazy_gettext
from wtforms.validators import DataRequired, EqualTo, Email, ValidationError, NumberRange, Optional
from wtforms.ext.sqlalchemy.fields import QuerySelectField
from flask_babel import lazy_gettext as _
from flask_wtf.file import FileAllowed, FileField, FileRequired
from wtforms import (
    BooleanField, SelectField, StringField, PasswordField)


from flask_appbuilder.security.sqla.models import User
from flask_appbuilder.security.forms import DynamicForm
from flask_appbuilder.fieldwidgets import BS3TextFieldWidget, BS3PasswordFieldWidget
from flask_appbuilder.widgets import FormWidget, SearchWidget, ListWidget

from .models import Organization, OrgRegisterUser


class PasswordRecoverForm(DynamicForm):
    email = StringField(lazy_gettext('Email'), validators=[DataRequired(), Email()])


class RegisterInvitationForm(DynamicForm):
    organization = StringField(lazy_gettext('Organization'), widget=BS3TextFieldWidget(), render_kw={'readonly': True})
    inviter = StringField(lazy_gettext('Inviter'), widget=BS3TextFieldWidget(), render_kw={'readonly': True})
    role = StringField(lazy_gettext('Role'), widget=BS3TextFieldWidget(), render_kw={'readonly': True})
    group = StringField(lazy_gettext('Group'), widget=BS3TextFieldWidget(), render_kw={'readonly': True})
    first_name = StringField(lazy_gettext('First Name'), validators=[DataRequired()], widget=BS3TextFieldWidget())
    last_name = StringField(lazy_gettext('Last Name'), validators=[DataRequired()], widget=BS3TextFieldWidget())
    email = StringField(lazy_gettext('Email'), widget=BS3TextFieldWidget(), render_kw={'readonly': True})
    password = PasswordField(lazy_gettext('Password'),
                             description=lazy_gettext(
                                 'Please use a good password policy, this application does not check this for you'),
                             validators=[DataRequired()],
                             widget=BS3PasswordFieldWidget())
    conf_password = PasswordField(lazy_gettext('Confirm Password'),
                                  description=lazy_gettext('Please rewrite the password to confirm'),
                                  validators=[EqualTo('password', message=lazy_gettext('Passwords must match'))],
                                  widget=BS3PasswordFieldWidget())


def unique_required(form, field):
    from superset import db

    if field.name == "organization":
        if db.session.query(Organization).filter_by(organization_name=field.data).first() is not None or \
                        db.session.query(OrgRegisterUser).filter_by(organization=field.data).first() is not None:
            raise ValidationError("This organization name already exists")

    # if field.name == "username":
    #     if db.session.query(User).filter_by(username=field.data).first() is not None or \
    #                     db.session.query(OrgRegisterUser).filter_by(username=field.data).first() is not None:
    #         raise ValidationError("Username already exists")

    if field.name == "email":
        if db.session.query(User).filter_by(email=field.data).first() is not None or \
                        db.session.query(OrgRegisterUser).filter_by(email=field.data).first() is not None:
            raise ValidationError("Email already exists")


class SavvyRegisterUserDBForm(DynamicForm):
    organization = StringField(lazy_gettext('WorkPlace Name'),
                               validators=[DataRequired(), unique_required],
                               )
    email = StringField(lazy_gettext('Email'), validators=[DataRequired(), Email(), unique_required])
    password = PasswordField(lazy_gettext('Password'),
                             description=lazy_gettext(
                                 'Please use a good password policy, this application does not check this for you'),
                             validators=[DataRequired()],
                             )
    stay_login = BooleanField(lazy_gettext('Stay signed in'))


class SavvyRegisterInvitationUserDBForm(DynamicForm):
    role = SelectField(lazy_gettext('Invitation Role'))
    group = SelectField(lazy_gettext('Group'))
    email = StringField(lazy_gettext('Email'), validators=[DataRequired(), Email()], widget=BS3TextFieldWidget())
    # inviter_id = HiddenField(lazy_gettext('Inviter'))
    # organization = HiddenField(lazy_gettext('Organization'))


class SavvyGroupAddWidget(FormWidget):
    template = 'superset/models/group/add_widget.html'


class SavvySiteListWidget(ListWidget):
    template = 'superset/models/site/list_widget.html'


class SavvySiteSearchWidget(SearchWidget):
    template = 'superset/models/site/search_widget.html'


class SavvyRegisterFormWidget(FormWidget):
    template = 'appbuilder/general/security/register_form.html'




class CSVToSitesForm(DynamicForm):
    def get_all_organisations():
        from superset import db
        orgs = db.session.query(Organization).all()
        return orgs

    org = QuerySelectField(
        _('Organisation'),
        query_factory=get_all_organisations,
        get_pk=lambda a: a.id, get_label=lambda a: a.organization_name)

    csv_file = FileField(
        _('CSV File'),
        description=_('Select a CSV file to be uploaded to a database.'),
        validators=[
            FileRequired(), FileAllowed(['csv'], _('CSV Files Only!'))])


