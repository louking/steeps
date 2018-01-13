###########################################################################################
# config - retrieve configuration for steeps api
#
#       Date            Author          Reason
#       ----            ------          ------
#       01/11/18        Lou King        Create
#
#   Copyright 2018 Lou King.  All rights reserved
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

# homegrown
from loutilities.configparser import getitems

#----------------------------------------------------------------------
def getconfig(configfile):
#----------------------------------------------------------------------
    '''
    get configuratoin from configfile

    :param configfile: file containing configuration, formatted per 
        python ConfigParser
    :rtype: dict with configuration key, value pairs
    '''

    # combine app and runsignup sections
    config = getitems(configfile, 'app')
    config.update(getitems(configfile, 'runsignup'))

    return config
