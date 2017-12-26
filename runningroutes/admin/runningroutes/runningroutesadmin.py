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
from pprint import pprint

# pypi
from flask import render_template, redirect, session, request, url_for, jsonify
from flask.views import MethodView, View
from apiclient import discovery # google api
from apiclient.errors import HttpError
from googlemaps.client import Client
from googlemaps.elevation import elevation_along_path, elevation
from googlemaps import convert
import numpy

# homegrown
from app import app
from loutilities.transform import Transform
from loutilities.googleauth import GoogleAuth, get_credentials
from loutilities.tables import CrudApi, CrudFiles, DataTablesEditor, dt_editor_response, _uploadmethod
from loutilities.geo import LatLng, GeoDistance, elevation_gain, calculateBearing
from request import addscripts

SHEETS_SERVICE = 'sheets'
SHEETS_VERSION = 'v4'
DRIVE_SERVICE = 'drive'
DRIVE_VERSION = 'v3'

APP_CRED_FOLDER = app.config['APP_CRED_FOLDER']
APP_EARTH_RADIUS = app.config['APP_EARTH_RADIUS']

debug = False

idlocker = RLock()
# see https://developers.google.com/maps/documentation/elevation/usage-limits
gelevclient = Client(key=app.config['GMAPS_ELEV_API_KEY'],queries_per_second=50)

# configuration
## note resolution is about 9.5 meters, so no need to have points
## closer than within that radius
FT_PER_SAMPLE = 60 # feet
MAX_SAMPLES = 512

# calculated
MI_PER_SAMPLE = FT_PER_SAMPLE / 5280.0
SAMPLES_PER_MILE = 5280 / FT_PER_SAMPLE # int
GELEV_MAX_MILES = MAX_SAMPLES*1.0 / SAMPLES_PER_MILE

class GoogleApiError(Exception): pass
class IdNotFound(Exception): pass

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
        if debug: print 'RunningRoutesTable.init()'

        # load credentials for us and for self.files instance
        credentials = get_credentials(APP_CRED_FOLDER)
        if not credentials:
            if debug: print "url_for('authorize') = {}".format(url_for('authorize'))
            return redirect('authorize')

        # set up form mapping
        self.dte = DataTablesEditor(self.dbmapping, self.formmapping)

        # set up services
        self.drive = discovery.build(DRIVE_SERVICE, DRIVE_VERSION, credentials=credentials)
        self.sheets = discovery.build(SHEETS_SERVICE, SHEETS_VERSION, credentials=credentials)

        # get the header, and all the values
        # TODO: maybe init() should just get the header, and open() should get all the values
        fid = self.app.config['RR_DB_SHEET_ID']
        result = self.sheets.spreadsheets().values().get(spreadsheetId=fid, range='routes').execute()
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
        if debug: print 'RunningRoutesTable.open()'

    #----------------------------------------------------------------------
    def nexttablerow(self):
    #----------------------------------------------------------------------
        '''
        must be overridden

        return next record, similar to csv.DictReader - raises StopIteration
        :rtype: dict with row data
        '''
        if debug: print 'RunningRoutesTable.nexttablerow()'

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
        if debug: print 'RunningRoutesTable.close()'

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
        if debug: print 'RunningRoutesTable.permission()'

        # self.sheets = discovery.build(SHEETS_SERVICE, SHEETS_VERSION, credentials=self.credentials)
        fid = self.app.config['RR_DB_SHEET_ID']
        try:
            routedb = self.drive.files().get(fileId=fid, fields='capabilities').execute()['capabilities']
            datafolder = self.sheets.spreadsheets().values().get(spreadsheetId=fid, range='datafolder').execute()
            folderid = datafolder['values'][0][0]
            datadb = self.drive.files().get(fileId=folderid, fields='capabilities').execute()['capabilities']
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
        if debug: print 'RunningRoutesTable.createrow()'

        # sheets = discovery.build(SHEETS_SERVICE, SHEETS_VERSION, credentials=self.credentials)
        fid = self.app.config['RR_DB_SHEET_ID']
        datafolder = self.sheets.spreadsheets().values().get(spreadsheetId=fid, range='datafolder').execute()

        # update nextrouteid within lock to prevent race condition
        with idlocker:
            idresult = self.sheets.spreadsheets().values().get(spreadsheetId=fid, range='nextrouteid').execute()
            nextid = int(idresult['values'][0][0])
            newid = nextid + 1
            result = self.sheets.spreadsheets().values().update(spreadsheetId=fid, range='nextrouteid', 
                body={'values':[[newid]]}, valueInputOption='USER_ENTERED').execute()

        # update turns sheet in data file with data from turns field
        fileid = formdata['fileid']
        turns = formdata['turns'].split('\n')
        self.sheets.spreadsheets().values().batchUpdate(spreadsheetId=fileid, body={
                'valueInputOption' : 'USER_ENTERED',
                'data' : [
                    { 'range' : 'turns', 'values' : [['turn']] + [[r.rstrip()] for r in turns]},
                ]
            }).execute()

        # make data row ready for prime time. make sure the row is in the same order as spreadsheet header
        dbrow = rowObj({'id':nextid})
        self.dte.set_dbrow(formdata, dbrow)
        ssrow = []
        for field in self.header:
            ssrow.append(getattr(dbrow, field))

        # append data to sheet
        self.sheets.spreadsheets().values().append(spreadsheetId=fid, range='routes', 
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
        if debug: print 'RunningRoutesTable.updaterow()'
        
        rowrange = self._findrow(thisid)

        # convert to db format and spreadsheet format
        dbrow = rowObj({'id':thisid})
        self.dte.set_dbrow(formdata, dbrow)
        ssrow = []
        for field in self.header:
            ssrow.append(getattr(dbrow, field))

        # update data to sheet
        dbid = self.app.config['RR_DB_SHEET_ID']
        self.sheets.spreadsheets().values().update(spreadsheetId=dbid, range=rowrange, 
            body={'values':[ssrow]}, valueInputOption='USER_ENTERED').execute()

        # update turns sheet in data file with data from turns field
        turnsid = formdata['fileid']
        turns = formdata['turns'].split('\n')
        # clear sheet - see https://developers.google.com/sheets/api/samples/sheet
        self.sheets.spreadsheets().values().clear(spreadsheetId=turnsid, range='turns', body={}).execute()
        self.sheets.spreadsheets().values().update(spreadsheetId=turnsid, 
            valueInputOption='USER_ENTERED',
            range='turns',
            body={
                'values' : [['turn']] + [[r.rstrip()] for r in turns],
            }).execute()

        # form response
        datarow = self.dte.get_response_data(dbrow)
        return datarow

    #----------------------------------------------------------------------
    def deleterow(self, thisid):
    #----------------------------------------------------------------------
        '''
        unused

        deletes row in database
        
        :param thisid: id of row to be updated
        :rtype: returned row for rendering, e.g., from DataTablesEditor.get_response_data()
        '''
        if debug: print 'RunningRoutesTable.deleterow()'

        pass

    #----------------------------------------------------------------------
    def _findrow(self, thisid):
    #----------------------------------------------------------------------
        '''
        return range for row matching thisid

        :param thisid: id to look for
        :rtype: range text for spreadsheet update
        '''
        fid = self.app.config['RR_DB_SHEET_ID']
        # ok to assume ids are in column a
        idrows = self.sheets.spreadsheets().values().get(spreadsheetId=fid, range='routes!a:a').execute()['values']
        # skip header row
        ids = [int(r[0]) for r in idrows[1:]]
        try:
            rownum = ids.index(thisid) + 2  # 1 based + 1 for header
        except ValueError:
            raise IdNotFound, 'could not find id {} in table'.format(thisid)

        # thisrow =  self.sheets.spreadsheets().values().get(spreadsheetId=fid, range='routes!{r}:{r}'.format(r=rownum)).execute()['values'][0]
        # row = dict(izip_longest(self.header,thisrow,fillvalue=''))

        return 'routes!{r}:{r}'.format(r=rownum)


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
        if debug: print 'RunningRoutesTable.render_template()'

        configfile = self.app.config['APP_JS_CONFIG']
        args = dict(
                    pagejsfiles = addscripts([
                                              configfile,
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
        if debug: print 'RunningRoutesTable.rollback()'
        
        pass


#######################################################################
class RunningRoutesFiles(CrudFiles):
#######################################################################

    #----------------------------------------------------------------------
    def __init__(self, **kwargs):
    #----------------------------------------------------------------------
        if debug: print 'RunningRoutesFiles.__init__() **kwargs={}'.format(kwargs)
        self.datafolderid = None
        super(RunningRoutesFiles, self).__init__(**kwargs)
        if debug: print 'RunningRoutesFiles self.app = {}'.format(self.app)


    #----------------------------------------------------------------------
    def upload(self):
    #----------------------------------------------------------------------
        if (debug): print 'RunningRoutesFiles.upload()'

        self._set_services()

        thisfile = request.files['upload']
        filename = thisfile.filename
        filetype = filename.split('.')[-1]

        filecontents = thisfile.readlines()
        thisfile.seek(0)
        latlng = LatLng(thisfile, filetype)
        locations = latlng.getpoints()

        thisss = self.sheets.spreadsheets().create(body={
                'properties' : { 'title' : filename },
                'sheets' : [
                    { 'properties' : { 'title' : filename } },
                    { 'properties' : { 'title' : 'path' } },
                    { 'properties' : { 'title' : 'turns' } },
                ]
            }).execute();
        
        # put file in appropriate folder
        # see https://stackoverflow.com/questions/42938990/google-sheets-api-create-or-move-spreadsheet-into-folder
        fileid = thisss['spreadsheetId']
        thisfile = self.drive.files().get( fileId=fileid, fields='parents' ).execute()
        parents = ','.join(thisfile['parents'])
        self.drive.files().update( fileId=fileid, removeParents=parents, addParents=self.datafolderid ).execute()

        # calculate distance in km
        geodist = GeoDistance(APP_EARTH_RADIUS)
        distance = 0.0
        maxinterval = app.config['APP_MAX_DIST_INTERVAL']/1000.0  # convert m to km
        locs = [locations[0]]
        # anno is list of [cumdist, inserted], where inserted is empty or 'inserted'
        anno = [[0, '']]
        for i in range(1,len(locations)):
            thisdist = geodist.haversineDistance(locations[i-1], locations[i], False)
            eachdist = thisdist
            # add additional points if the distance between these is longer than allowed
            if thisdist > maxinterval:
                numnew = int(thisdist / maxinterval)
                eachdist = thisdist / (numnew+1)
                bearing = calculateBearing(locations[i-1], locations[i])
                lastcoord = locations[i-1]
                for j in range(numnew):
                    distance += eachdist
                    anno.append([distance, 'inserted'])
                    # getDestinationLatLng expects distance in meters
                    newcoord = geodist.getDestinationLatLng(lastcoord, bearing, eachdist*1000)
                    locs.append(newcoord)
                    lastcoord = newcoord
            distance += eachdist
            anno.append([distance, ''])
            locs.append(locations[i])

        # convert to miles
        distance /= 1.609344

        # query for elevation points
        ## slice off locations which meet max sample requirements from google for each query
        pathlen = MAX_SAMPLES
        gelevs = []
        while len(locs) > 0:
            if debug: print 'len(locs) = {}'.format(len(locs))

            theselocs = locs[:pathlen]
            del locs[:pathlen]

            ## get this set of elevations
            elev = elevation(gelevclient, theselocs)
            gelevs += [[p['location']['lat'], p['location']['lng'], p['elevation'], p['resolution']] for p in elev]

        # calculate elevation gain
        elevations = numpy.array([float(p[2]) for p in gelevs])
        upthreshold = app.config['APP_ELEV_UPTHRESHOLD']
        downthreshold = app.config['APP_ELEV_DOWNTHRESHOLD']
        smoothwin = app.config['APP_SMOOTHING_WINDOW']

        ## first smooth the elevations using flat window
        ## see http://scipy-cookbook.readthedocs.io/items/SignalSmooth.html
        s = numpy.r_[elevations[smoothwin-1:0:-1],elevations,elevations[-2:-smoothwin-1:-1]]
        w = numpy.ones(smoothwin,'d')
        y=numpy.convolve(w/w.sum(),s,mode='valid')
        smoothed = y[(smoothwin/2):-(smoothwin/2)]
        # reference suggested below to 
        # smoothed = y[(smoothwin/2-1):-(smoothwin/2)]

        ## calculate the gain using the smoothed elevation profile
        gain = elevation_gain(smoothed, upthreshold=upthreshold, downthreshold=downthreshold)

        # combine gelevs with anno
        if len(gelevs) != len(anno) or len(gelevs) != len(smoothed):
            app.logger.debug('invalid list len len(gelevs)={} len(anno)={} len(smoothed)={}'.format(len(gelevs), len(anno), len(smoothed)))

        # construct rows we're going to save to the path sheet
        pathrows = []
        smoothedl = [[e] for e in smoothed]
        for i in range(len(gelevs)):
            try:
                pathrows.append(gelevs[i] + smoothedl[i] + anno[i])
            except IndexError:
                pathrows.append(gelevs[i])

        # update sheet with data values
        self.sheets.spreadsheets().values().batchUpdate(spreadsheetId=fileid, body={
                'valueInputOption' : 'USER_ENTERED',
                'data' : [
                    { 'range' : filename, 'values' : [['content']] + [[r.rstrip()] for r in filecontents]},
                    { 'range' : 'path',   'values' : [['lat', 'lng', 'orig ele', 'res', 'ele', 'cumdist(km)', 'inserted']] + pathrows },
                ]
            }).execute()

        return {
            'upload' : {'id': fileid },
            'files' : {
                'data' : {
                    fileid : {'filename': filename}
                },
            },
            # round for user-friendly display
            'elev' : int(round(gain)),
            'distance': '{:.1f}'.format(distance),
            'filename': filename,
            # start defaults to first point
            'location' : ', '.join(['{:.6f}'.format(ll) for ll in locations[0]])
        }

    #----------------------------------------------------------------------
    def list(self):
    #----------------------------------------------------------------------
        if (debug): print 'RunningRoutesFiles.list()'

        self._set_services()

        # list files whose parent is datafolderid
        table = 'data'
        filelist = {table:{}}
        datafiles = self.drive.files().list(q="'{}' in parents".format(self.datafolderid)).execute()
        while True:
            for thisfile in datafiles['files']:
                filelist[table][thisfile['id']] = {'filename' : thisfile['name']}

            if 'nextPageToken' not in datafiles: break
            datafiles = self.drive.files().list(q="'{}' in parents".format(self.datafolderid), pageToken=datafiles['nextPageToken']).execute()

        return filelist


    #----------------------------------------------------------------------
    def _set_services(self):
    #----------------------------------------------------------------------
        if (debug): print 'RunningRoutesFiles._set_services()'

        if not self.datafolderid:
            credentials = get_credentials(APP_CRED_FOLDER)
            self.drive = discovery.build(DRIVE_SERVICE, DRIVE_VERSION, credentials=credentials)
            self.sheets = discovery.build(SHEETS_SERVICE, SHEETS_VERSION, credentials=credentials)
            fid = self.app.config['RR_DB_SHEET_ID']
            datafolder = self.sheets.spreadsheets().values().get(spreadsheetId=fid, range='datafolder').execute()
            self.datafolderid = datafolder['values'][0][0]

#############################################
# google auth views
appscopes = [ 'https://www.googleapis.com/auth/plus.me',
              'https://www.googleapis.com/auth/spreadsheets',
              'https://www.googleapis.com/auth/drive' ]
googleauth = GoogleAuth(app, app.config['APP_CLIENT_SECRETS_FILE'], appscopes, 'admin', 
                        credfolder=APP_CRED_FOLDER, 
                        loginfo=app.logger.info, logdebug=app.logger.debug, logerror=app.logger.error)

#######################################################################
class Logout(View):
#######################################################################

    #----------------------------------------------------------------------
    def __init__( self, app ):
    #----------------------------------------------------------------------
        self.app = app
        self.app.add_url_rule('/admin/logout', view_func=self.logout, methods=['GET',])

    #----------------------------------------------------------------------
    def logout( self ):
    #----------------------------------------------------------------------
        googleauth.clear_credentials()
        return redirect('authorize')

#############################################
# logout handling
logout = Logout(app)

#############################################
# files handling
rrfiles = RunningRoutesFiles(
             app = app,
             uploadendpoint = 'admin/upload',
            )

#############################################
# admin views
admin_dbattrs = 'id,name,distance,start location,surface,elevation gain,map,fileid,description,active'.split(',')
admin_formfields = 'rowid,name,distance,location,surface,elev,map,fileid,description,active'.split(',')
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
                             buttons = ['create', 'edit'],
                             clientcolumns =  [
            { 'name': 'name',        'data': 'name',        'label': 'Route Name', 'fieldInfo': 'name you want to call this route' },
            { 'name': 'description', 'data': 'description', 'label': 'Description', 'fieldInfo' : 'optionally give details of where to meet here, e.g., name of the business' },
            { 'name': 'surface',     'data': 'surface',     'label': 'Surface',     'type': 'select',
                                                                            'options': ['road','trail','mixed']},
            { 'name': 'map',         'data': 'map',         'label': 'Route URL', 'fieldInfo': 'URL from mapmyrun, strava, etc., where route was created' },
            { 'name': 'turns',      'data': 'fileid',      'label': 'Turns',       
                    'ed' : {'type': 'textarea', 
                            'attr': {'placeholder': 'enter or paste turn by turn directions, carriage return between each turn'},
                           },
                    'dt' : {'visible': False},
            },
            { 'name': 'fileid',      'data': 'fileid',      'label': 'File',       
                    'ed' : {'type': 'upload', 
                            'fieldInfo': 'use GPX file downloaded from mapmyrun, strava, etc.',
                            'dragDrop': False,
                            'display': 'rendergpxfile()'},
                    'dt' : {'render': 'rendergpxfile()'},
            },
            { 'name': 'location',    'data': 'location',    'label': 'Start Location', 'fieldInfo' : 'start location from GPX file - you may override, e.g., with address. Please make sure this value is valid search location in Google maps'},
            { 'name': 'distance',    'data': 'distance',    'label': 'Distance (miles)', 'fieldInfo': 'calculated from GPX file - you may override'},
            { 'name': 'elev',        'data': 'elev',        'label': 'Elev Gain (ft)', 'fieldInfo': 'calculated from GPX file - you may override'},
            { 'name': 'active',      'data': 'active',      'label': 'Active',         'fieldInfo': 'when set to "deleted" will not show to users',
                    'ed' : {'type':'select', 'options':{'active':1, 'deleted':0}},
                    'dt' : {'render': 'renderactive()'},
            },
        ]);
rrtable.register()


#######################################################################
class RunningRoutesTurns(MethodView):
#######################################################################
    #----------------------------------------------------------------------
    def __init__(self, **kwargs):
    #----------------------------------------------------------------------
        # the args dict has all the defined parameters to 
        # caller supplied keyword args are used to update the defaults
        # all arguments are made into attributes for self
        if debug: print 'RunningRoutesTurns.__init__() **kwargs={}'.format(kwargs)

        self.kwargs = kwargs
        args = dict(app = None,
                    )
        args.update(kwargs)        
        for key in args:
            setattr(self, key, args[key])

        self.sheets = None

    #----------------------------------------------------------------------
    def register(self):
    #----------------------------------------------------------------------
        '''
        add endpoint to retrieve turns
        '''
        turns_view = self.as_view('admin/turns')
        self.app.add_url_rule('/admin/<fileid>/turns', view_func=turns_view, methods=['GET',])

    #----------------------------------------------------------------------
    @_uploadmethod()
    def get(self, fileid):
    #----------------------------------------------------------------------
        if debug: print 'RunningRoutesTurns.get() self = {}, fileid = {}'.format(self, fileid)
        self._set_services()

        values = self.sheets.spreadsheets().values().get(spreadsheetId=fileid, range='turns').execute()['values']
        # skip sheet header row
        turns = [r[0] for r in values[1:] if r]
        if debug: print 'RunningRoutesTurns.get() turns={}'.format(turns)
        self._responsedata = {'turns': '\n'.join(turns)}

    #----------------------------------------------------------------------
    def _set_services(self):
    #----------------------------------------------------------------------
        if (debug): print 'RunningRoutesFiles._set_services()'

        if not self.sheets:
            credentials = get_credentials(APP_CRED_FOLDER)
            self.sheets = discovery.build(SHEETS_SERVICE, SHEETS_VERSION, credentials=credentials)

#############################################
# turns handling
rrturns = RunningRoutesTurns(app=app)
rrturns.register()

