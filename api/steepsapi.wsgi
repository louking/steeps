###########################################################################################
# steepsapi.wsgi - run the web application
#
#       Date            Author          Reason
#       ----            ------          ------
#       07/21/17        Lou King        Create
#
#   Copyright 2017 Lou King
###########################################################################################

# use only standard libraries until virtualenv is activated
import os, sys
from ConfigParser import SafeConfigParser

# get virtualenv directory
config = SafeConfigParser()
thisdir = os.path.dirname(__file__)
configfile = os.path.join(thisdir, 'steepsapi.cfg')
config.readfp(open(configfile))
PROJECT_DIR = config.get('project', 'PROJECT_DIR')

# activate virtualenv
activate_this = os.path.join(PROJECT_DIR, 'bin', 'activate_this.py')
execfile(activate_this, dict(__file__=activate_this))
sys.path.append(PROJECT_DIR)
sys.path.append(thisdir)

# virtualenv activated, import rest of configuration
from apiapp import app as application
from apiapp.config import getconfig
import time
from loutilities import timeu
tu = timeu.asctime('%Y-%m-%d %H:%M:%S')

appconfig = getconfig(configfile)
application.config.update(appconfig)
application.configtime = tu.epoch2asc(time.time())
application.configpath = configfile

# must set up logging after setting configuration
from apiapp import applogging
applogging.setlogging()
