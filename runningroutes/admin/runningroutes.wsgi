###########################################################################################
# runningroutes.wsgi - run the web application
#
#       Date            Author          Reason
#       ----            ------          ------
#       07/21/17        Lou King        Create
#
#   Copyright 2017 Lou King
###########################################################################################

import os, sys
from ConfigParser import SafeConfigParser

# get configuration
config = SafeConfigParser()
thisdir = os.path.dirname(__file__)
config.readfp(open(os.path.join(thisdir, 'runningroutes.cfg')))
PROJECT_DIR = config.get('project', 'PROJECT_DIR')

# activate virtualenv
activate_this = os.path.join(PROJECT_DIR, 'bin', 'activate_this.py')
execfile(activate_this, dict(__file__=activate_this))
sys.path.append(PROJECT_DIR)
sys.path.append(thisdir)

# debug - which user is starting this?
# goes to /var/log/httpd/error_log, per http://modwsgi.readthedocs.io/en/develop/user-guides/debugging-techniques.html
if False:
    from getpass import getuser
    print >> sys.stderr, 'runningroutes user = {}'.format(getuser())

from runningroutes import app as application
