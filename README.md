backbone.googleapis
==================== 
### _UNDER DEVELOPMENT_

[Test Page / Live Demo](https://hrovira.github.io/Backbone.GoogleAPIs)

Backbone.js Models for Google Drive

This library extends Backbone.js Model to adapt the semantics of the [Google Drive API v2](https://developers.google.com/drive/v2/reference/)

## Table Of Contents
  * [Notes](#notes)
    * Expectations
    * Not Implemented
    * Renamed Functions
  * [Backbone.GoogleAPIs](#this-api)
    * Class API Descriptions
    * Class Hierarchy
    * Published Events
  * [Usage](#usage)
    * Bower
    * Require.JS (AMD)
    * Plain HTML/Javascript

----------------------
### <a name="notes">Notes</a>
#### Expectations
  * Using a Server-Side Authorization Scheme
     * Supposes web client is connecting to Google Drive through a server-side proxy that handles the OAUTH2 flow
     * https://developers.google.com/drive/web/auth/web-server
     * Web-client code must provide a global uri that maps/extends google drive URLs
        * e.g. /service_proxy/googleapis/drive/v2 -> https://www.googleapis.com/drive/v2
  * Using a Client-Side Authorization Scheme
     * Supposes web client is using Google Drive Libraries that handles the OAUTH2 flow
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

### <a name="this-api">Backbone.GoogleAPIs API</a>

#### Global Options
  * Service Root
  * Authorization Headers

#### Model (extends Backbone.Model)
  * Requires _kind_ to be set at initialization

| Function       | Description           | Options |
| -------------- | --------------------- | ------- |
| initialize     |                       |         |
| url            |                       |         |
| fetch          |                       |         |
| insert         |                       |         |
| patch          |                       |         |
| update         |                       |         |
| delete         |                       |         |

#### List (extends Backbone.Model)
  * Requires _kind_ to be set at initialization
  * Expects one of the _list_ kinds (e.g. drive#commentList, drive#fileList)

| Function       | Description           | Options |
| -------------- | --------------------- | ------- |
| initialize     |                       |         |
| url            |                       |         |
| fetch          |                       |         |
| list           |                       |         |

#### ChangeList (extends Backbone.GoogleAPIs.List)
  * Defaults _kind_ to _"drive#changeList"_

| Function       | Description           | Options |
| -------------- | --------------------- | ------- |
| initialize     |                       |         |
| url            |                       |         |
| list           |                       |         |
| poll           |                       | delayInMillis |

#### File (extends Backbone.GoogleAPIs.Model)
  * Defaults _kind_ to _"drive#file"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
| copy             |                       |         |
| insert           |                       |         |
| update           |                       |         |
| touch            |                       |         |
| trash            |                       |         |
| untrash          |                       |         |
| childReferences  |                       |         |
| parentReferences |                       |         |
| permissions      |                       |         |
| revisions        |                       |         |
| comments         |                       |         |

#### Folder (extends Backbone.GoogleAPIs.Drive.File)
  * Defaults _kind_ to _"drive#file"_
  * Defaults _parent_ to _"root"_
  * Defaults _mimeType_ to _"application/vnd.google-apps.folder"_

| Function       | Description           | Options |
| -------------- | --------------------- | ------- |
| initialize     |                       |         |

#### <a name="class-hierarchy">Class Hierarchy</a>
  * Model
     * File
         * Folder
  * List
     * ChangeList

### <a name="published-events">Published Events</a>
  * Model
  * List
  * ChangeList
  * File
  * Folder

---------

## <a name="usage">Usage</a>

### Bower
```bash
    bower install backbone.googleapis
```

### Require.JS (AMD)
```javascript
    define(["jquery", "underscore", "backbone", "backbone.googledrive"],
        function ($, _, Backbone) {
            var fileInstance = new Backbone.GoogleAPIs.Drive.File({});
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
            var CustomModel = Backbone.GoogleAPIs.Model.extend({ });
        });
    </script>
```