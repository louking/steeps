###########################################################################################
# runningroutes - package
#
#       Date            Author          Reason
#       ----            ------          ------
#       12/05/17        Lou King        Create
#
#   Copyright 2017 Lou King.  All rights reserved
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
import os.path

# pypi

# homegrown
from app import app
from loutilities.configparser import getitems

# tell jinja to remove linebreaks
app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True

# define product name (don't import nav until after app.jinja_env.globals['_rrdb_productname'] set)
# TODO: this really should be set in runningroutes.cfg
app.jinja_env.globals['_rrdb_productname'] = '<span class="brand-all"><span class="brand-left">route</span><span class="brand-right">tility</span></span>'
app.jinja_env.globals['_rrdb_productname_text'] = 'routetility'

# get configuration
configfile = os.environ['RR_CONFIG_FILE']
configpath = os.path.join(os.path.sep.join(os.path.dirname(__file__).split(os.path.sep)[:-1]), configfile)
appconfig = getitems(configpath, 'app')
app.config.update(appconfig)

# set static, templates if configured
app.static_folder = appconfig.get('STATIC_FOLDER', 'static')
app.template_folder = appconfig.get('TEMPLATE_FOLDER', 'templates')
app.static_path = appconfig.get('STATIC_PATH', 'static')
app.template_path = appconfig.get('TEMPLATE_PATH', 'templates')

# configure for debug
debug = app.config['DEBUG']
if debug:
    app.config['SECRET_KEY'] = 'flask development key'

# nonview imports
import request

# import all views
import runningroutesadmin

# initialize versions for scripts
# need to force app context with test_request_context() else get
#    RuntimeError: Attempted to generate a URL without the application context being pushed.
# see http://kronosapiens.github.io/blog/2014/08/14/understanding-contexts-in-flask.html
# NOTE: with app_context() was not sufficient to prevent runtime error
with app.test_request_context():
    request.setscripts()