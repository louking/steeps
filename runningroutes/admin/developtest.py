###########################################################################################
# developtest - run the web application
#
#       Date            Author          Reason
#       ----            ------          ------
#       12/01/17        Lou King        Create
#
#   Copyright 2017 Lou King
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
use this script to run the locally for debug

Usage::

    python developtest.py
'''

# standard
import pdb
import os
import os.path

# must set config file before importing app
os.environ['RR_CONFIG_FILE'] = 'develop.cfg'
from runningroutes import app

# must set up logging after setting configuration
from runningroutes import applogging
applogging.setlogging()

if __name__ == '__main__':
    # When running locally, disable OAuthlib's HTTPs verification.
    # ACTION ITEM for developers:
    #     When running in production *do not* leave this option enabled.
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

    app.run('localhost', 5000, debug=True)