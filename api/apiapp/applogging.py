#!/usr/bin/python
###########################################################################################
# applogging - define logging for the application
#
#       Date            Author          Reason
#       ----            ------          ------
#       10/09/14        Lou King        Create
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
applogging - define logging for the application
================================================
'''
# standard

# pypi

# module specific needs
from app import app

#----------------------------------------------------------------------
def setlogging():
#----------------------------------------------------------------------

    # set up logging
    ADMINS = ['lking@pobox.com']
    if not app.debug:
        import logging
        from logging.handlers import SMTPHandler
        from logging import Formatter
        from logging.handlers import TimedRotatingFileHandler
        mail_handler = SMTPHandler('localhost',
                                   'noreply@steeplechasers.org',
                                   ADMINS, '[steepsapi] exception encountered')
        if 'LOGGING_LEVEL_MAIL' in app.config:
            mailloglevel = app.config['LOGGING_LEVEL_MAIL']
        else:
            mailloglevel = logging.ERROR
        mail_handler.setLevel(mailloglevel)
        mail_handler.setFormatter(Formatter('''
        Message type:       %(levelname)s
        Location:           %(pathname)s:%(lineno)d
        Module:             %(module)s
        Function:           %(funcName)s
        Time:               %(asctime)s
        
        Message:
        
        %(message)s
        '''))
        app.logger.addHandler(mail_handler)
        app.config['LOGGING_MAIL_HANDLER'] = mail_handler
        
        logpath = None
        if 'LOGGING_PATH' in app.config:
            logpath = app.config['LOGGING_PATH']
            
        if logpath:
            # file rotates every Monday
            file_handler = TimedRotatingFileHandler(logpath,when='W0',delay=True)
            if 'LOGGING_LEVEL_FILE' in app.config:
                fileloglevel = app.config['LOGGING_LEVEL_FILE']
            else:
                fileloglevel = logging.WARNING
            file_handler.setLevel(fileloglevel)
            app.logger.addHandler(file_handler)
            app.config['LOGGING_FILE_HANDLER'] = file_handler
            
            file_handler.setFormatter(Formatter(
                '%(asctime)s %(levelname)s: %(message)s '
                '[in %(pathname)s:%(lineno)d]'
            ))
            
            # this is needed for any INFO or DEBUG logging
            app.logger.setLevel(logging.DEBUG)
    
