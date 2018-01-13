#!/var/chroot/home/content/89/11476389/devhome/venv/bin/python

###########################################################################################
# apidispatch - dispatch base for api
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

from flup.server.fcgi import WSGIServer
from apiapp.app import app
import os.path

class ScriptNameStripper(object):
   def __init__(self, app):
       self.app = app

   def __call__(self, environ, start_response):
       environ['SCRIPT_NAME'] = '/api'    # edit here for non-standard location
       return self.app(environ, start_response)

import time
from loutilities import timeu
tu = timeu.asctime('%Y-%m-%d %H:%M:%S')

configpath = os.path.abspath('./steepsapi.cfg')
config = getconfig(configpath)
app.config.update(config)
app.configtime = tu.epoch2asc(time.time())
app.configpath = configpath

# must set up logging after setting configuration
from apiapp import applogging
applogging.setlogging()

# must be after setting app.config
app = ScriptNameStripper(app)

if __name__ == '__main__':
    # create the server
    server = WSGIServer(app)
    
    # and run it
    server.run()
