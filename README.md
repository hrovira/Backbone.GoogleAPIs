backbone.googleDrive
====================

Backbone.js Models for Google Drive

This library extends Backbone.js Model to adapt the semantics of the [Google Drive API v2](https://developers.google.com/drive/v2/reference/)

## Table Of Contents
  * [Notes](#notes)
    * Expectations
    * Not Implemented
    * Renamed Functions
  * [Backbone.GoogleDrive API](#this-api)
    * Class API Descriptions
    * Class Hierarchy
    * Published Events
  * [Usage Examples](#usage-examples)
    * Retrieve Files
    * Store Files
    * List Files
    * List Files in a Folder
    * Monitor Changes

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

### <a name="this-api">Backbone.GoogleDrive API</a>

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

#### ChangeList (extends Backbone.GoogleDrive.List)
  * Defaults _kind_ to _"drive#changeList"_

| Function       | Description           | Options |
| -------------- | --------------------- | ------- |
| initialize     |                       |         |
| url            |                       |         |
| list           |                       |         |
| poll           |                       | delayInMillis |

#### File (extends Backbone.GoogleDrive.Model)
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

#### Folder (extends Backbone.GoogleDrive.File)
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

## <a name="usage-examples">Usage Examples</a>

### Lookup About
```
    var model = new Backbone.GoogleDrive.Model({
        "kind": "drive#about"
    });
    model.on("change", function() {
        $(".about-container").html(HtmlTemplate(model.toJSON()));
    });
    model.fetch();
```

### List Apps
```
    var model = new Backbone.GoogleDrive.List({
        "kind": "drive#appsList"
    });
    model.on("change", function() {
        var apps = model.get("items");
        _.each(apps, function(app) {
            $("ul.apps-list").append(LineItemLinkTemplate(app));
        });
    });
    model.list();
```

### Retrieve File
```
    var model = new Backbone.GoogleDrive.File({
        "url": ""
    });
    model.fetch();
```

### Store File
```
    var model = new Backbone.GoogleDrive.File({
    });
    model.fetch();
```

### List Files
```
    var model = new Backbone.GoogleDrive.List({
    });
    model.fetch();
```

### List Files in a Folder
```
    var folder = new Backbone.GoogleDrive.Folder({
        "id": "generated_by_google, as seen in URLs"
    });

    var files = folder.files();
    files.on("change", function() {
        _.each(files.get("items"), function(file) {
            $("ul.file-list").append(LineItemLinkTemplate(file));
        });
    });
    files.list();
```

### Monitor Changes
```
    var model = new Backbone.GoogleDrive.ChangeList({});
    model.poll({ "delayInMillis": 5000 });
    model.on("change", function() {
        _.each(model.get("items"), function(item) {
            // trigger changes by item or item.file attributes
        });
    });
```
