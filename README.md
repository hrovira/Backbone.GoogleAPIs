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
  * [Backbone.GoogleAPIs](#this-api)
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

### <a name="this-api">Backbone.GoogleAPIs API</a>

#### Global Options
  * Service Root
  * Authorization Headers

#### Backbone.GoogleAPIs.Model (extends Backbone.Model)
  * Requires _kind_ to be set at initialization

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| fetch            |                       |         |
| insert           |                       |         |
| patch            |                       |         |
| update           |                       |         |
| delete           |                       |         |

#### Backbone.GoogleAPIs.List (extends Backbone.Model)
  * Requires _kind_ to be set at initialization
  * Expects one of the _list_ kinds (e.g. drive#commentList, drive#fileList)

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| fetch            |                       |         |
| list             |                       |         |

#### Google Drive

#### Backbone.GoogleAPIs.Drive.File (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/drive/v2/reference/files
  * Defaults _kind_ to _"drive#file"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| copy             |                       |         |
| delete           |                       |         |
| emptyTrash       |                       |         |
| get              | use 'fetch' instead   |         |
| insert           |                       |         |
| patch            |                       |         |
| touch            |                       |         |
| trash            |                       |         |
| untrash          |                       |         |
| update           |                       |         |
|                  |                       |         |
| childReferences  |                       |         |
| parentReferences |                       |         |
| permissions      |                       |         |
| revisions        |                       |         |
| comments         |                       |         |

#### Backbone.GoogleAPIs.Drive.FileList (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/changes/list
  * Defaults _kind_ to _"drive#fileList"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       | maxResults, pageToken, projection, q |

#### Backbone.GoogleAPIs.Drive.About (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/about
  * Defaults _kind_ to _"drive#about"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
|                  |                       |         |
| get              | use 'fetch' instead   |         |

#### Backbone.GoogleAPIs.Drive.Change (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/drive/v2/reference/changes/list
  * Defaults _kind_ to _"drive#change"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
|                  |                       |         |
| get              | use 'fetch' instead   |         |

#### Backbone.GoogleAPIs.Drive.ChangeList (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/changes/list
  * Defaults _kind_ to _"drive#changeList"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       | includeDeleted, includeSubscribed, maxResults, pageToken, startChangeId |
|                  |                       |         |
| poll             |                       | delayInMillis |
| unpoll           |                       |         |

#### Backbone.GoogleAPIs.Drive.ChildReference (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/drive/v2/reference/children
  * Defaults _kind_ to _"drive#childReference"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| get              | use 'fetch' instead   |         |
| insert           |                       |         |
| delete           |                       |         |

#### Backbone.GoogleAPIs.Drive.ChildList (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/children
  * Defaults _kind_ to _"drive#childList"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       | maxResults, pageToken, q |

#### Backbone.GoogleAPIs.Drive.ParentReference (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/drive/v2/reference/parents
  * Defaults _kind_ to _"drive#parentReference"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| get              | use 'fetch' instead   |         |
| insert           |                       |         |
| delete           |                       |         |

#### Backbone.GoogleAPIs.Drive.ParentList (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/parents
  * Defaults _kind_ to _"drive#parentList"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       |         |

#### Backbone.GoogleAPIs.Drive.Permission (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/drive/v2/reference/permissions
  * Defaults _kind_ to _"drive#permission"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| delete           |                       |         |
| get              | use 'fetch' instead   |         |
| getIdForEmail    |                       |         |
| insert           |                       |         |
| patch            |                       |         |
| update           |                       |         |

#### Backbone.GoogleAPIs.Drive.PermissionList (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/permissions
  * Defaults _kind_ to _"drive#permissionList"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       |         |

#### Backbone.GoogleAPIs.Drive.Revision (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/drive/v2/reference/revisions
  * Defaults _kind_ to _"drive#revision"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| delete           |                       |         |
| get              | use 'fetch' instead   |         |
| patch            |                       |         |
| update           |                       |         |

#### Backbone.GoogleAPIs.Drive.RevisionList (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/revisions
  * Defaults _kind_ to _"drive#revisionList"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       |         |

#### Backbone.GoogleAPIs.Drive.App (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/drive/v2/reference/apps
  * Defaults _kind_ to _"drive#app"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| get              | use 'fetch' instead   |         |

#### Backbone.GoogleAPIs.Drive.AppList (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/apps
  * Defaults _kind_ to _"drive#appList"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       | appFilterExtensions, appFilterMimeTypes, languageCode |

#### Backbone.GoogleAPIs.Drive.Comment (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/drive/v2/reference/comments
  * Defaults _kind_ to _"drive#comment"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| delete           |                       |         |
| get              | use 'fetch' instead   |         |
| insert           |                       |         |
| patch            |                       |         |
| update           |                       |         |

#### Backbone.GoogleAPIs.Drive.CommentList (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/comments
  * Defaults _kind_ to _"drive#commentList"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       | includeDeleted, maxResults, pageToken, updatedMin |

#### Backbone.GoogleAPIs.Drive.CommentReply (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/drive/v2/reference/replies
  * Defaults _kind_ to _"drive#commentReply"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| delete           |                       |         |
| get              | use 'fetch' instead   |         |
| insert           |                       |         |
| patch            |                       |         |
| update           |                       |         |

#### Backbone.GoogleAPIs.Drive.CommentReplyList (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/replies
  * Defaults _kind_ to _"drive#commentReplyList"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       | includeDeleted, maxResults, pageToken |

#### Backbone.GoogleAPIs.Drive.Property (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/drive/v2/reference/properties
  * Defaults _kind_ to _"drive#property"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| delete           |                       |         |
| get              | use 'fetch' instead   |         |
| insert           |                       |         |
| patch            |                       |         |
| update           |                       |         |

#### Backbone.GoogleAPIs.Drive.PropertyList (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/drive/v2/reference/properties
  * Defaults _kind_ to _"drive#propertyList"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       |         |

#### Google Plus
#### Backbone.GoogleAPIs.Plus.Person (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/+/api/latest/people
  * Defaults _kind_ to _"plus#person"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| get              | use 'fetch' instead   |         |

#### Backbone.GoogleAPIs.Plus.PeopleFeed (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/+/api/latest/people
  * Defaults _kind_ to _"plus#peopleFeed"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| search           |                       | query, language, maxResults, pageToken |
| listByActivity   |                       | maxResults, pageToken |
| list             |                       | maxResults, orderBy, pageToken |

#### Backbone.GoogleAPIs.Plus.Activity (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/+/api/latest/activities
  * Defaults _kind_ to _"plus#activity"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| get              | use 'fetch' instead   |         |

#### Backbone.GoogleAPIs.Plus.ActivityFeed (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/+/api/latest/activities
  * Defaults _kind_ to _"plus#activityFeed"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| search           |                       | query, language, maxResults, orderBy, pageToken |
| list             |                       | maxResults, pageToken |

#### Backbone.GoogleAPIs.Plus.Comment (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/+/api/latest/activities
  * Defaults _kind_ to _"plus#comment"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| get              | use 'fetch' instead   |         |

#### Backbone.GoogleAPIs.Plus.CommentFeed (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/+/api/latest/activities
  * Defaults _kind_ to _"plus#commentFeed"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       | maxResults, pageToken, sortOrder |


#### Backbone.GoogleAPIs.Plus.Moment (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/+/api/latest/moments
  * Defaults _kind_ to _"plus#moment"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| insert           |                       |         |
| remove           |                       |         |

#### Backbone.GoogleAPIs.Plus.MomentsFeed (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/+/api/latest/moments
  * Defaults _kind_ to _"plus#momentsFeed"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       | maxResults, pageToken, targetUrl, type |

#### Google Cloud Storage
#### Backbone.GoogleAPIs.Storage.Bucket (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/storage/docs/json_api/v1/buckets
  * Defaults _kind_ to _"storage#bucket"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| delete           |                       |         |
| get              | use 'fetch' instead   |         |
| insert           |                       |         |
| patch            |                       |         |
| update           |                       |         |

#### Backbone.GoogleAPIs.Storage.Buckets (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/storage/docs/json_api/v1/buckets
  * Defaults _kind_ to _"storage#buckets"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       | maxResults, pageToken, projection |

#### Backbone.GoogleAPIs.Storage.Object (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/storage/docs/json_api/v1/objects
  * Defaults _kind_ to _"storage#object"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| compose          |                       |         |
| copy             |                       |         |
| delete           |                       |         |
| get              | use 'fetch' instead   |         |
| insert           |                       |         |
| patch            |                       |         |
| update           |                       |         |

#### Backbone.GoogleAPIs.Storage.Objects (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/storage/docs/json_api/v1/objects
  * Defaults _kind_ to _"storage#objects"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       | delimiter, maxResults, pageToken, prefix, projection, versions |

#### Backbone.GoogleAPIs.Storage.BucketAccessControl (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/storage/docs/json_api/v1/bucketAccessControls
  * Defaults _kind_ to _"storage#bucketAccessControl"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| delete           |                       |         |
| get              | use 'fetch' instead   |         |
| insert           |                       |         |
| patch            |                       |         |
| update           |                       |         |

#### Backbone.GoogleAPIs.Storage.BucketAccessControls (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/storage/docs/json_api/v1/bucketAccessControls
  * Defaults _kind_ to _"storage#bucketAccessControls"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       |         |

#### Backbone.GoogleAPIs.Storage.ObjectAccessControl (extends Backbone.GoogleAPIs.Model)
  * https://developers.google.com/storage/docs/json_api/v1/objectAccessControls
  * Defaults _kind_ to _"storage#objectAccessControl"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| delete           |                       |         |
| get              | use 'fetch' instead   |         |
| insert           |                       |         |
| patch            |                       |         |
| update           |                       |         |

#### Backbone.GoogleAPIs.Storage.ObjectAccessControls (extends Backbone.GoogleAPIs.List)
  * https://developers.google.com/storage/docs/json_api/v1/objectAccessControls
  * Defaults _kind_ to _"storage#objectAccessControls"_

| Function         | Description           | Options |
| ---------------- | --------------------- | ------- |
| initialize       |                       |         |
| url              |                       |         |
|                  |                       |         |
| list             |                       |         |

#### Auxiliary Classes
#### Backbone.GoogleAPIs.Drive.Folder (extends Backbone.GoogleAPIs.Drive.File)
  * Defaults _kind_ to _"drive#file"_
  * Defaults _parent_ to _"root"_
  * Defaults _mimeType_ to _"application/vnd.google-apps.folder"_

| Function       | Description           | Options |
| -------------- | --------------------- | ------- |
| initialize     |                       |         |

#### Backbone.GoogleAPIs.UserInfo (extends Backbone.GoogleAPIs.Model)

#### <a name="class-hierarchy">Class Hierarchy</a>
  * Model
     * Drive.File
         * Drive.Folder
     * UserInfo
  * List
     * Drive.ChangeList

### <a name="published-events">Published Events</a>
  * Model
  * List
  * ChangeList
  * File
  * Folder

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