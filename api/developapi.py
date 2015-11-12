###########################################################################################
# localapi - run the web application
#
#       Date            Author          Reason
#       ----            ------          ------
#       10/10/15        Lou King        Create
#
#   Copyright 2015 Lou King
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

'''
use this script to run the steeps api locally for debug

Usage::

    python localapi.py
'''

# standard
import pdb
import os
import os.path

from apiapp import app

import time
from loutilities import timeu
tu = timeu.asctime('%Y-%m-%d %H:%M:%S')
os.environ['API_SETTINGS'] = os.path.abspath('./developapi.cfg')
app.config.from_envvar('API_SETTINGS')
app.configtime = tu.epoch2asc(time.time())
app.configpath = os.environ['API_SETTINGS']

# must set up logging after setting configuration
from apiapp import applogging
applogging.setlogging()

app.run()