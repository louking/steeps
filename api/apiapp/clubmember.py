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
import traceback
from collections import OrderedDict
from csv import DictWriter
import time
from datetime import datetime
from os.path import getmtime

# pypi
import flask
from flask import make_response,request
from flask.views import MethodView

# home grown
from . import app
from apicommon import failure_response, success_response
from running.runsignup import RunSignUp
from loutilities.transform import Transform
from loutilities.csvwt import wlist
from loutilities import timeu

ymd = timeu.asctime('%Y-%m-%d')
mdy = timeu.asctime('%m/%d/%Y')
cachet = timeu.asctime('%-m/%-d/%Y %-I:%M %p')

#----------------------------------------------------------------------
def members2file(club_id, mapping, key, secret, outfile=None): 
#----------------------------------------------------------------------
    '''
    convert members added per day (ordyears) to membercount per day in json format
    
    :param club_id: RunSignUp club id
    :param mapping: OrderedDict {'outfield1':'infield1', 'outfield2':outfunction(memberrec), ...}
    :param outfile: optional output file
    :param key: RunSignUp key
    :param secret: RunSignUp secret
    :rtype: lines from output file
    '''

    # pull in memberfile
    rsu = RunSignUp(key=key, secret=secret)
    rsu.open()
    members = rsu.members(club_id)
    rsu.close()
    
    # analyze mapping for outfields
    xform = Transform(mapping, sourceattr=False, targetattr=False)
    outfields = mapping.keys()

    # create writeable list, csv file
    memberlist = wlist()
    cmemberlist = DictWriter(memberlist, outfields)
    cmemberlist.writeheader()

    for thismember in members:
        outrow = {}
        xform.transform(thismember, outrow)
        cmemberlist.writerow(outrow)

    # write file if desired
    if outfile:
        with open(outfile,'wb') as out:
            out.writelines(memberlist)

    return memberlist

#----------------------------------------------------------------------
def _getdivision(member):
#----------------------------------------------------------------------
    '''
    gets division as of Jan 1 from RunSignUp record

    :param member: RunSignUp record
    :rtype: division text
    '''

    # use local time
    today = time.time()-time.timezone
    todaydt = timeu.epoch2dt(today)
    jan1 = datetime(todaydt.year, 1, 1)

    memberage = timeu.age(jan1, ymd.asc2dt(member['user']['dob']))

    # this must match grand prix configuration in membership database
    # TODO: add api to query this information from scoretility
    if memberage <= 13:
        div = '13 and under'
    elif memberage <= 29:
        div = '14-29'
    elif memberage <= 39:
        div = '30-39'
    elif memberage <= 49:
        div = '40-49'
    elif memberage <= 59:
        div = '50-59'
    elif memberage <= 69:
        div = '60-69'
    else:
        div = '70 and over'

    return div

#######################################################################
class AjaxMemberInfo(MethodView):
#######################################################################
    
    #----------------------------------------------------------------------
    def get(self):
    #----------------------------------------------------------------------
        try:
            # configuration file supplied -- pull credentials from the app section
            club = app.config['RSU_CLUB']
            membercachefile = app.config['RSU_CACHEFILE']
            memberstatsfile = app.config['RSU_STATSFILE']
            key = app.config['RSU_KEY']
            secret = app.config['RSU_SECRET']
    
            # get the summarized statistics
            mapping = OrderedDict([
                        ('First', lambda m: m['user']['first_name']), 
                        ('Last', lambda m: m['user']['last_name']), 
                        ('Div (age Jan 1)', _getdivision), 
                        ('Hometown', lambda m: '{}, {}'.format(m['user']['address']['city'], m['user']['address']['state'])), 
                        ('Expiration Date', lambda m: mdy.dt2asc(ymd.asc2dt(m['membership_end']))), 
                        ])
                        # for expiration date display convert yyyy-mm-dd to mm/dd/yyyy
            memberinfo = members2file(club, mapping, key, secret)
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
            memberstatsfile = app.config['RSU_STATSFILE']

            # get the summarized statistics, and time file was created
            with open(memberstatsfile, 'rb') as stats:
                memberstats_str = stats.read()
            mtime = getmtime(memberstatsfile) - time.timezone;
            cachetime = cachet.epoch2asc(mtime)

            # convert json
            memberstats = json.loads(memberstats_str)

            # it's all good
            return success_response(data=memberstats, cachetime=cachetime)
        
        except Exception,e:
            # er, not so good
            cause = traceback.format_exc()
            app.logger.error(traceback.format_exc())
            return failure_response(cause=cause)

#----------------------------------------------------------------------
app.add_url_rule('/_memberstats',view_func=AjaxMemberStats.as_view('_memberstats'),methods=['GET'])
#----------------------------------------------------------------------