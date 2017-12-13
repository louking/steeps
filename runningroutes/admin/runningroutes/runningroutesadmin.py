###########################################################################################
# runningroutesadmin - administrative views for runningroutes database
#
#       Date            Author          Reason
#       ----            ------          ------
#       12/05/17        Lou King        Create
#
#   Copyright 2017 Lou King.  All rights reserved
###########################################################################################

# standard
import httplib2
from itertools import izip_longest
from threading import RLock
import traceback

# pypi
from flask import render_template, redirect, session, request, url_for, jsonify
from flask.views import MethodView
from apiclient import discovery # google api
from apiclient.errors import HttpError

# homegrown
from app import app
from loutilities.transform import Transform
from loutilities.googleauth import GoogleAuth, get_credentials
from loutilities.tables import CrudApi, CrudFiles, DataTablesEditor, dt_editor_response
from request import addscripts

SHEETS_SERVICE = 'sheets'
SHEETS_VERSION = 'v4'
DRIVE_SERVICE = 'drive'
DRIVE_VERSION = 'v3'

debug = True

idlocker = RLock()

########################################################################
class rowObj(dict):
########################################################################
    '''
    subclass dict to make it work like an object

    see http://goodcode.io/articles/python-dict-object/
    '''
    def __getattr__(self, name):
        if name in self:
            return self[name]
        else:
            raise AttributeError("No such attribute: " + name)

    def __setattr__(self, name, value):
        self[name] = value

    def __delattr__(self, name):
        if name in self:
            del self[name]
        else:
            raise AttributeError("No such attribute: " + name)

#######################################################################
class RunningRoutesTable(CrudApi):
#######################################################################

    #----------------------------------------------------------------------
    def init(self):
    #----------------------------------------------------------------------
        '''
        any processing which needs to be done at the beginning of any method
        '''
        # must authorize if not already authorized
        if 'credentials' not in session:
            if debug: print "url_for('authorize') = {}".format(url_for('authorize'))
            return redirect('authorize')

        # load credentials
        self.credentials = get_credentials()

        # set up form mapping
        self.dte = DataTablesEditor(self.dbmapping, self.formmapping)

        # get the header, and all the values
        # TODO: maybe init() should just get the header, and open() should get all the values
        sheets = discovery.build(SHEETS_SERVICE, SHEETS_VERSION, credentials=self.credentials)
        fid = self.app.config['RR_DB_SHEET_ID']
        result = sheets.spreadsheets().values().get(spreadsheetId=fid, range='routes').execute()
        self.values = iter(result.get('values', []))
        self.header = self.values.next()

        # indicate no redirect
        return None

    #----------------------------------------------------------------------
    def open(self):
    #----------------------------------------------------------------------
        '''
        open source of "csv" data
        '''
        if debug: print 'open()'

    #----------------------------------------------------------------------
    def nexttablerow(self):
    #----------------------------------------------------------------------
        '''
        must be overridden

        return next record, similar to csv.DictReader - raises StopIteration
        :rtype: dict with row data
        '''
        if debug: print 'nexttablerow()'
        thisrow = self.values.next()
        csvdata = dict(izip_longest(self.header,thisrow,fillvalue=''))
        dbrow = rowObj(csvdata)
        datarow = self.dte.get_response_data(dbrow)
        return datarow

    #----------------------------------------------------------------------
    def close(self):
    #----------------------------------------------------------------------
        '''
        must be overridden

        close source of "csv" data
        '''
        if debug: print 'close()'
        # nothing to do
        self.values = None

    #----------------------------------------------------------------------
    def permission(self):
    #----------------------------------------------------------------------
        '''
        must be overridden

        check for permission on data
        :rtype: boolean
        '''
        drive = discovery.build(DRIVE_SERVICE, DRIVE_VERSION, credentials=self.credentials)
        sheets = discovery.build(SHEETS_SERVICE, SHEETS_VERSION, credentials=self.credentials)
        fid = self.app.config['RR_DB_SHEET_ID']
        try:
            routedb = drive.files().get(fileId=fid, fields='capabilities').execute()['capabilities']
            datafolder = sheets.spreadsheets().values().get(spreadsheetId=fid, range='datafolder').execute()
            folderid = datafolder['values'][0][0]
            datadb = drive.files().get(fileId=folderid, fields='capabilities').execute()['capabilities']
            return routedb['canEdit'] and datadb['canEdit'] and datadb['canAddChildren']
        except HttpError:
            return False
        
    #----------------------------------------------------------------------
    def createrow(self, formdata):
    #----------------------------------------------------------------------
        '''
        must be overridden

        creates row in database
        
        :param formdata: data from create form
        :rtype: returned row for rendering, e.g., from DataTablesEditor.get_response_data()
        '''
        sheets = discovery.build(SHEETS_SERVICE, SHEETS_VERSION, credentials=self.credentials)
        fid = self.app.config['RR_DB_SHEET_ID']
        datafolder = sheets.spreadsheets().values().get(spreadsheetId=fid, range='datafolder').execute()

        # update nextrouteid within lock to prevent race condition
        with idlocker:
            idresult = sheets.spreadsheets().values().get(spreadsheetId=fid, range='nextrouteid').execute()
            nextid = int(idresult['values'][0][0])
            newid = nextid + 1
            result = sheets.spreadsheets().values().update(spreadsheetId=fid, range='nextrouteid', 
                body={'values':[[newid]]}, valueInputOption='USER_ENTERED').execute()

        # make data row ready for prime time. make sure the row is in the same order as spreadsheet header
        dbrow = rowObj({'id':nextid})
        self.dte.set_dbrow(formdata, dbrow)
        ssrow = []
        for field in self.header:
            ssrow.append(getattr(dbrow, field))

        # append data to sheet
        sheets.spreadsheets().values().append(spreadsheetId=fid, range='routes', 
            body={'values':[ssrow]}, valueInputOption='USER_ENTERED').execute()

        # and return the row
        return self.dte.get_response_data(dbrow)

    #----------------------------------------------------------------------
    def updaterow(self, thisid, formdata):
    #----------------------------------------------------------------------
        '''
        must be overridden

        updates row in database
        
        :param thisid: id of row to be updated
        :param formdata: data from create form
        :rtype: returned row for rendering, e.g., from DataTablesEditor.get_response_data()
        '''
        pass

    #----------------------------------------------------------------------
    def deleterow(self, thisid):
    #----------------------------------------------------------------------
        '''
        must be overridden

        deletes row in database
        
        :param thisid: id of row to be updated
        :rtype: returned row for rendering, e.g., from DataTablesEditor.get_response_data()
        '''
        pass

    #----------------------------------------------------------------------
    def upload(self, thisid=0):
    #----------------------------------------------------------------------
        '''
        uploads a file for a row in the database
        
        :param thisid: id of row
        :rtype: returned row for rendering, e.g., from DataTablesEditor.get_response_data()
        '''


    #----------------------------------------------------------------------
    def render_template(self, **kwargs):
    #----------------------------------------------------------------------
        '''
        renders flask template with appropriate parameters
        :param tabledata: list of data rows for rendering
        :rtype: flask.render_template()
        '''
        # the args dict has all the defined parameters to 
        # caller supplied keyword args are used to update the defaults
        # all arguments are made into attributes for self
        args = dict(
                    pagejsfiles = addscripts([
                                              'runningroute-admin.js',
                                              'datatables.js', 
                                              'buttons.colvis.js',     
                                             ]),
                    pagecssfiles = addscripts([
                                               'runningroute-admin.css',
                                              ])
                   )
        args.update(kwargs)        

        return render_template( 'datatables.html', **args )

    def rollback(self):
        '''
        may be overridden

        any processing which must be done on page abort or exception
        '''
        pass


#######################################################################
class RunningRoutesFiles(CrudFiles):
#######################################################################

    #----------------------------------------------------------------------
    def upload(self):
    #----------------------------------------------------------------------
        thisfile = request.files['upload']
        filename = thisfile.filename
        fileid = 417

        if (debug): print 'upload()'
        return {
            'upload' : {'id': fileid },
            'files' : {
                'data' : {
                    fileid : {'filename': filename}
                },
            },
            'elev' : 1243,
            'distance': 19.4,
            'filename': filename,
        }

    #----------------------------------------------------------------------
    def list(self):
    #----------------------------------------------------------------------
        table = 'data'
        filename = 'test list'
        fileid = 417

        if (debug): print 'list()'
        return {
            table : {
                fileid : {'filename': filename}
            },
        }

#############################################
# google auth views
appscopes = [ 'https://www.googleapis.com/auth/spreadsheets',
              'https://www.googleapis.com/auth/drive' ]
googleauth = GoogleAuth(app, app.config['APP_CLIENT_SECRETS_FILE'], appscopes, 'admin')
googleauth.register()

#############################################
# files handling
rrfiles = RunningRoutesFiles(
             app = app,
             uploadendpoint = 'admin/upload',
            )

#############################################
# admin views
admin_dbattrs = 'id,name,distance,start location,surface,elevation gain,map,fileid,description'.split(',')
admin_formfields = 'rowid,name,distance,location,surface,elev,map,fileid,description'.split(',')
admin_dbmapping = dict(zip(admin_dbattrs, admin_formfields))
admin_formmapping = dict(zip(admin_formfields, admin_dbattrs))
rrtable = RunningRoutesTable(app=app, 
                             pagename='Edit Routes', 
                             idSrc = 'rowid',
                             endpoint = 'admin',
                             files = rrfiles,
                             eduploadoption = {
                                'type': 'POST',
                                'url':  'admin/upload',
                             },
                             dbmapping = admin_dbmapping,
                             formmapping = admin_formmapping,
                             buttons = ['create', 'edit', 'remove'],
                             clientcolumns =  [
            { 'name': 'name',        'data': 'name',        'label': 'Route Name', 'fieldInfo': 'name you want to call this route' },
            { 'name': 'location',    'data': 'location',    'label': 'Start Location', 'fieldInfo' : 'full address or lat,long'},
            { 'name': 'description', 'data': 'description', 'label': 'Description', 'fieldInfo' : 'optionally give more details here, e.g., name of the business to meet at' },
            { 'name': 'surface',     'data': 'surface',     'label': 'Surface',     'type': 'select',
                                                                            'options': ['road','trail','mixed']},
            { 'name': 'map',         'data': 'map',         'label': 'Route URL', 'fieldInfo': 'URL from mapmyrun, strava, etc., where route was created' },
            { 'name': 'fileid',      'data': 'fileid',      'label': 'File',       
                    'ed': {'type': 'upload', 
                           'fieldInfo': 'use GPX file downloaded from mapmyrun, strava, etc.',
                           'dragDrop': False,
                           'display': "rendergpxfile()"}
            },
            { 'name': 'distance',    'data': 'distance',    'label': 'Distance (miles)', 'fieldInfo': 'calculated from GPX file, you may override'},
            { 'name': 'elev',        'data': 'elev',        'label': 'Elevation Gain', 'fieldInfo': 'calculated from GPX file, you may override'},
        ]);
rrtable.register()

