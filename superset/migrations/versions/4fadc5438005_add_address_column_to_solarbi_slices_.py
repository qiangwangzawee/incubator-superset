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
"""Add address column to solarbi_slices table

Revision ID: 4fadc5438005
Revises: 9e4074ba4f81
Create Date: 2020-05-05 11:56:44.888067

"""

# revision identifiers, used by Alembic.
revision = '4fadc5438005'
down_revision = '9e4074ba4f81'

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # op.alter_column('annotation', 'layer_id',
    #            existing_type=mysql.INTEGER(display_width=11),
    #            nullable=False)
    # op.drop_constraint('slices_ibfk_1', 'slices', type_='foreignkey')
    # op.drop_constraint('slices_ibfk_2', 'slices', type_='foreignkey')
    # op.drop_column('slices', 'druid_datasource_id')
    # op.drop_column('slices', 'table_id')
    op.add_column('solarbi_slices', sa.Column('address', sa.Text(), nullable=True))
    # op.drop_index('table_name', table_name='tables')
    # op.create_unique_constraint(None, 'tables', ['database_id', 'table_name'])
    # op.drop_index('ix_tagged_object_object_id', table_name='tagged_object')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # op.create_index('ix_tagged_object_object_id', 'tagged_object', ['object_id'], unique=False)
    # op.drop_constraint(None, 'tables', type_='unique')
    # op.create_index('table_name', 'tables', ['table_name'], unique=True)
    op.drop_column('solarbi_slices', 'address')
    # op.add_column('slices', sa.Column('table_id', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True))
    # op.add_column('slices', sa.Column('druid_datasource_id', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True))
    # op.create_foreign_key('slices_ibfk_2', 'slices', 'tables', ['table_id'], ['id'])
    # op.create_foreign_key('slices_ibfk_1', 'slices', 'datasources', ['druid_datasource_id'], ['id'])
    # op.alter_column('annotation', 'layer_id',
    #            existing_type=mysql.INTEGER(display_width=11),
    #            nullable=True)
    # ### end Alembic commands ###
