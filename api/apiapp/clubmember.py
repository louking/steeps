###########################################################################################
# clubmember - api for members of club
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
import json
from tempfile import NamedTemporaryFile
import traceback

# pypi
import flask
from flask import make_response,request
from flask.views import MethodView

# home grown
from . import app
from apicommon import failure_response, success_response

# required for this module
from runningclub.summarizemembers import summarize_memberstats, summarize_membersinfo

#######################################################################
class AjaxMemberInfo(MethodView):
#######################################################################
    
    #----------------------------------------------------------------------
    def get(self):
    #----------------------------------------------------------------------
        try:
            # get the club and cache
            club = app.config['STEEPSAPI_RACLUB']
            membercache = app.config['STEEPSAPI_MEMBERCACHE']
            raprivuser = app.config['RAPRIVUSER']
            rakey = app.config['RAKEY']
            rasecret = app.config['RASECRET']

            # get the summarized statistics
            memberinfo = summarize_membersinfo(club, membercachefile=membercache, raprivuser=raprivuser, key=rakey, secret=rasecret)
            memberinfo = ''.join(memberinfo)

            # it's all good
            return success_response(data=memberinfo)
        
        except Exception,e:
            # er, not so good
            cause = traceback.format_exc()
            app.logger.error(traceback.format_exc())
            return failure_response(cause=cause)

#----------------------------------------------------------------------
app.add_url_rule('/_memberinfo',view_func=AjaxMemberInfo.as_view('_memberinfo'),methods=['GET'])
#----------------------------------------------------------------------

#######################################################################
class AjaxMemberStats(MethodView):
#######################################################################
    
    #----------------------------------------------------------------------
    def get(self):
    #----------------------------------------------------------------------
        try:
            # get the club and cache
            club = app.config['STEEPSAPI_RACLUB']
            membercache = app.config['STEEPSAPI_MEMBERCACHE']
            raprivuser = app.config['RAPRIVUSER']
            rakey = app.config['RAKEY']
            rasecret = app.config['RASECRET']

            # get the summarized statistics
            memberstats = summarize_memberstats(club, membercachefile=membercache, raprivuser=raprivuser, key=rakey, secret=rasecret)

            # it's all good
            return success_response(data=memberstats)
        
        except Exception,e:
            # er, not so good
            cause = traceback.format_exc()
            app.logger.error(traceback.format_exc())
            return failure_response(cause=cause)

#----------------------------------------------------------------------
app.add_url_rule('/_memberstats',view_func=AjaxMemberStats.as_view('_memberstats'),methods=['GET'])
#----------------------------------------------------------------------