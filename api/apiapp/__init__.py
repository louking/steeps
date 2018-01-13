###########################################################################################
# raceresultswebapp - package
#
#       Date            Author          Reason
#       ----            ------          ------
#       10/09/15        Lou King        Create
#
#   Copyright 2015 Lou King.  All rights reserved
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#
###########################################################################################

# standard
import os
import os.path

# pypi
import flask

# homegrown
from app import app
from loutilities.configparser import getitems

# tell jinja to remove linebreaks
app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True

# get configuration
# configpath = os.path.join(os.path.sep.join(os.path.dirname(__file__).split(os.path.sep)[:-1]), 'steepsapi.cfg')
# appconfig = getitems(configpath, 'app')
# app.config.update(appconfig)

# configure for debug
debug = app.config['DEBUG']
if debug:
    SECRET_KEY = 'flask development key'

# import all views
import clubmember
