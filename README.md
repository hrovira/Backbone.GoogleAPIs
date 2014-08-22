backbone.googleapis
==================== 
#### _UNDER DEVELOPMENT_
[Test Page / Live Demo](https://hrovira.github.io/Backbone.GoogleAPIs)

## Table Of Contents
  * [Overview](#overview)
    * Supported Kinds
  * [Notes](#notes)
    * Dependencies
    * Expectations
    * Not Implemented
    * Renamed Functions
  * [Backbone.GoogleAPIs](APIs.md)
    * Class API Descriptions
        * Google Drive
        * Google Plus
        * Google Cloud Storage
    * Class Hierarchy
    * Published Events
  * [Usage](#usage)
    * Bower
    * Require.JS (AMD)
    * Plain HTML/Javascript


### <a name="overview">Overview - Backbone.js Models for Google APIs</a>
This library extends Backbone.js Model to provide CRUD operations compatible with the following Google APIs:
  * [Drive API v2](https://developers.google.com/drive/v2/reference/)
  * [OAuth2 API]()
  * [Plus API (+)]()
  * [Cloud Storage JSON API v1](https://developers.google.com/storage/docs/json_api/v1/)
  * [BigQuery]()
  * [GenomicsAPI]()

#### Supported Kinds
| drive#about | drive#app | drive#change | drive#childReference |
| ----------- | ----------- | ----------- | ----------- |
| drive#parentReference | drive#permission | drive#revision | drive#property |
| drive#comment | drive#commentReply | drive#appList | drive#changeList |
| drive#fileList | drive#appList | drive#childList | drive#parentList |
| drive#permissionList | drive#revisionList | drive#propertyList | drive#commentList |
| drive#commentReplyList | drive#file | | |
| storage#bucket | storage#bucketAccessControl | storage#object | storage#objectAccessControl |
| storage#buckets | storage#bucketAccessControls | storage#objects | storage#objectAccessControls |
| plus#person | plus#peopleFeed | plus#moment | plus#momentsFeed |
| plus#activity | plus#activityFeed | plus#comment | plus#commentFeed |

----------------------
### <a name="notes">Notes</a>
#### Dependencies
  * jQuery: ~2.0.3
  * Underscore.js: ~1.4.4
  * Backbone.js: ~1.0.0
  * Require.js: ~2.1.5

**_Ironically, Require.js is not actually a required dependency._** This library supports clients with and without AMD support


#### Expectations
  * Using a Server-Side Authorization Scheme
     * Supposes web client is connecting to Google APIs through a server-side proxy that handles the OAUTH2 flow
     * https://developers.google.com/drive/web/auth/web-server
     * Web-client code must provide a global uri that maps/extends google api URLs
        * e.g. /service_proxy/googleapis/drive/v2 -> https://www.googleapis.com/drive/v2
  * Using a Client-Side Authorization Scheme
     * Supposes web client is using Google API Libraries that handle the OAUTH2 flow
     * https://developers.google.com/drive/web/auth/web-client
     * https://developers.google.com/+/web/signin/add-button
     * perform OAUTH2 flows
     * Web-client code must provide request headers to this library

#### Not Implemented (requires Web Sockets Service)
  * Channels
  * Realtime
  * File.watch
  * Changes.watch (todo: integrate web sockets)

#### Renamed Functions
  * All Classes
      * 'get' -> use 'fetch' (to avoid conflict with Backbone.Model.get)
  * List
      * 'list' <-> 'fetch'

---------

## <a name="usage">Usage</a>

### Bower
```
    bower install backbone.googleapis
```

### Require.JS (AMD)
```
    define(["jquery", "underscore", "backbone", "backbone.googleapis"],
        function ($, _, Backbone) {
            var fileInstance = new Backbone.GoogleAPIs.Drive.File({});
            var otherFile = Backbone.GoogleAPIs.ModelFactory({ "kind": "drive#file" });
            var CustomModel = Backbone.GoogleAPIs.Model.extend({ });
        });
```

### Plain HTML/Javascript
```
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js"></script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min.js"></script>
    <script type="text/javascript" src="//rawgithub.com/hrovira/Backbone.GoogleAPIs/backbone.googleapis.js"></script>
    <script type="text/javascript">
        $( document ).ready(function() {
            var fileInstance = new Backbone.GoogleAPIs.Drive.File({});
            var otherFile = Backbone.GoogleAPIs.ModelFactory({ "kind": "drive#file" });
            var CustomModel = Backbone.GoogleAPIs.Model.extend({ });
        });
    </script>
```

### Instantiation Modes
```
    // model instance by kind
    var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "google#supported" });
    var list = Backbone.GoogleAPIs.ModelFactory({ "kind": "google#supportedList" });

    // model instance by class hierarcy
    var model = new Backbone.GoogleAPIs.Drive.File();
    var model = new Backbone.GoogleAPIs.Drive.ChangeList();
```