(function(root, factory) {
  if (typeof exports === "object" && root.require) {
    module.exports = factory(require("jQuery"), require("underscore"), require("backbone"));
  } else if (typeof define === "function" && define.amd) {
    define([ "jQuery", "underscore", "backbone" ], function($, _, Backbone) {
      return factory($ || root.$, _ || root._, Backbone || root.Backbone);
    });
  } else {
    factory($, _, Backbone);
  }
})(this, function($, _, Backbone) {
        var local_model = {};

        var IsKind = function(model, kind_s) {
            if (_.isUndefined(model)) return false;
            if (_.isEmpty(kind_s)) return false;
            return _.contains(_.flatten([kind_s]), model.get("kind"));
        };

        var OAuthHeaders = function(model) {
            if (!_.isEmpty(model.get("access_token"))) {
                return { "Authorization": "Bearer " + model.get("access_token") };
            }
            return {};
        };

        var BasicModel = Backbone.Model.extend({
            "initialize": function() {
                Backbone.Model.prototype.initialize.call(this);

                _.bindAll(this, "url", "fetch", "insert", "patch", "update", "delete");
            },
            "url": function() {
                if (_.isEmpty(this.get("kind"))) return _iM_.get("DriveUrl") + "/files";
                if (IsKind(this, "drive#about")) return _iM_.get("DriveUrl") + "/about";

                var id = this.get("id");
                if (IsKind(this, "drive#app")) return _iM_.get("DriveUrl") + "/apps/" + id;
                if (IsKind(this, "drive#change")) return _iM_.get("DriveUrl") + "/changes/" + id;

                var baseUrl = _iM_.get("DriveUrl") + "/files/" + this.get("fileId");
                if (IsKind(this, "drive#childReference")) return baseUrl + "/children/" + id;
                if (IsKind(this, "drive#parentReference")) return baseUrl + "/parents/" + id;
                if (IsKind(this, "drive#permission")) return baseUrl + "/permissions/" + id;
                if (IsKind(this, "drive#revision")) return baseUrl + "/revisions/" + id;
                if (IsKind(this, "drive#property")) {
                    var propertyKey = this.get("propertyKey");
                    return baseUrl + "/properties/" + propertyKey;
                }

                if (IsKind(this, "drive#comment")) return baseUrl + "/comments/" + id;
                if (IsKind(this, "drive#commentReply")) {
                    var cId = this.get("commentId");
                    return baseUrl + "/comments/" + cId + "/replies/" + id;
                }
                return _iM_.get("DriveUrl") + "/files";
            },
            "fetch": function(options) {
                options = options || {};

                var pkg = {
                    "url": this.url(),
                    "dataType": "json",
                    "contentType": "application/json",
                    "headers": _.extend({}, options["headers"], OAuthHeaders(_iM_))
                };

                return Backbone.Model.prototype.fetch.call(this, _.extend(pkg, options));
            },
            "insert": function(options) {},
            "patch": function(options) {},
            "update": function(options) {},
            "delete": function(options) {}
        });

        var ListModel = Backbone.Model.extend({
            "initialize": function() {
                Backbone.Model.prototype.initialize.call(this);

                _.bindAll(this, "url", "fetch", "list");
            },

            "url": function() {
                if (_.isEmpty(this.get("kind"))) return _iM_.get("DriveUrl") + "/files";
                if (IsKind(this, "drive#appList")) return _iM_.get("DriveUrl") + "/apps";
                if (IsKind(this, "drive#changeList")) {
                    var largestChangeId = parseInt(this.get("largestChangeId"));
                    if (!_.isNaN(largestChangeId)) {
                        return _iM_.get("DriveUrl") + "/changes?startChangeId=" + (largestChangeId + 1);
                    }
                    return _iM_.get("DriveUrl") + "/changes";
                }

                if (IsKind(this, "drive#fileList")) return _iM_.get("DriveUrl") + "/files";
                if (IsKind(this, "drive#appList")) return _iM_.get("DriveUrl") + "/apps";

                var baseUrl = _iM_.get("DriveUrl") + "/files/" + this.get("fileId");
                if (IsKind(this, "drive#childList")) return baseUrl + "/children";
                if (IsKind(this, "drive#parentList")) return baseUrl + "/parents";
                if (IsKind(this, "drive#permissionList")) return baseUrl + "/permissions";
                if (IsKind(this, "drive#revisionList")) return baseUrl + "/revisions";
                if (IsKind(this, "drive#propertyList")) return baseUrl + "/properties";

                if (IsKind(this, "drive#commentList")) return baseUrl + "/comments";
                if (IsKind(this, "drive#commentReplyList")) {
                    var cId = this.get("commentId");
                    return baseUrl + "/comments/" + cId + "/replies";
                }

                return _iM_.get("DriveUrl") + "/files";
            },

            "fetch": function(options) {
                return this.list(options);
            },

            "list": function(options) {
                options = options || {};

                var pkg = {
                    "url": this.url(),
                    "method": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "headers": _.extend({}, options["headers"], OAuthHeaders(_iM_)),
                    "success": function(json) {
                        this.set(json);
                        this.trigger("list");
                    },
                    "error": function(e) {
                        this.trigger("error", this, e, pkg);
                        this.trigger("list");
                    },
                    "context": this
                };

                if (_.has(options, "?")) {
                    var questionable = [
                        "drive#fileList",
                        "drive#changeList",
                        "drive#childList",
                        "drive#parentList",
                        "drive#permissionList"
                    ];
                    if (IsKind(this, questionable)) {
                        _.extend(pkg, { "data": _.extend({}, options["?"]), "traditional": true });
                    }
                }

                return $.ajax(pkg);
            }
        });

        var ChangeListModel = ListModel.extend({
            "defaults": {
                "kind": "drive#changeList",
                "active": true
            },

            "url": function() {
                var largestChangeId = parseInt(this.get("largestChangeId"));
                if (!_.isNaN(largestChangeId)) {
                    return _iM_.get("DriveUrl") + "/changes?startChangeId=" + (largestChangeId + 1);
                }
                return _iM_.get("DriveUrl") + "/changes";
            },

            "poll": function(options) {
                options = options || {};

                var list_fn = _.bind(this.__list_if_active, this);

                this.set("active", true);
                this.on("list", function() {
                    _.delay(list_fn, options["delayInMillis"] || 5000);
                }, this);
                _.defer(list_fn);
            },

            "unpoll": function() {
                this.stopListening("list");
                this.set("active", false);
            },

            "__list_if_active": function() {
                if (this.get("active")) {
                    this.list();
                }
            }
        });

        var FileModel = BasicModel.extend({
            "initialize": function() {
                BasicModel.prototype.initialize.call(this);

                _.bindAll(this, "url", "copy", "insert", "update");
                _.bindAll(this, "touch", "trash", "untrash");
                _.bindAll(this, "childReferences", "parentReferences");
                _.bindAll(this, "permissions", "revisions", "comments");
            },
            "url": function() {},
            "copy": function(new_copy, options) {},
            "insert": function(options) {},
            "update": function(options) {},
            "touch": function(options) {},
            "trash": function(options) {},
            "untrash": function(options) {},
            "childReferences": function() {},
            "parentReferences": function() {},
            "permissions": function() {},
            "revisions": function() {},
            "comments": function() {}
        });

        var FolderModel = FileModel.extend({
            "defaults": {
                "kind": "drive#file",
                "parents": [
                    { "id": "root" }
                ],
                "mimeType": "application/vnd.google-apps.folder"
            },

            "initialize": function() {
                FileModel.prototype.initialize.call(this);

                this.files = new ListModel({ "kind": "drive#fileList" })
            }
        });

        // @TODO : Implement based on https://developers.google.com/storage/docs/json_api/v1
    // @TODO : Creating buckets and objects depend on naming requirements (https://developers.google.com/storage/docs/bucketnaming#requirements)
    // - Perhaps insert is not supported by model at this time, create your buckets through their console? Or implement name check?
    // @TODO : Capture Project ID from list?
    // @TODO : Implement off v2
        var CloudStorageModel = BasicModel.extend({
            "kinds": [
                "storage#bucket",
                "storage#bucketAccessControl",
                "storage#object",
                "storage#objectAccessControl"
            ],
            "entities": [
                "user-userId",
                "user-emailAddress",
                "group-groupId",
                "group-emailAddress",
                "allUsers",
                "allAuthenticatedUsers"
            ],

            "initialize": function(options) {
                options = options || {};
                this.set("project", options.project);
                BasicModel.prototype.initialize.call(this, options);
            },

            "url": function() {
                if (_.isEmpty(this.get("kind"))) return _iM_.get("StorageUrl");

                var bucket_name = this.get("name");
                if (!bucket_name) return _iM_.get("StorageUrl");

                var bucket_url = _iM_.get("StorageUrl") + "/" + bucket_name;
                if (IsKind(this, "storage#bucket")) return bucket_url;

                var object_name = this.get("name");
                if (IsKind(this, "storage#object")) {
                    if (this.get("isUpload")) return _iM_.get("StorageUploadUrl") + "/" + bucket_name + "/o";
                    if (object_name) return bucket_url + "/o/" + object_name;
                    return bucket_url + "/o";
                }

                var entity = this.get("entity");
                if (IsKind(this, "storage#bucketAccessControl")) {
                    if (entity) return bucket_url + "/acl/" + entity;
                    return bucket_url + "/acl";
                }

                if (IsKind(this, "storage#objectAccessControl")) {
                    if (this.get("defaultObjectAcl"))  {
                        if (entity) return bucket_url + "/defaultObjectAcl/" + entity;
                        return bucket_url + "/defaultObjectAcl";
                    }

                    if (object_name) {
                        if (entity) return bucket_url + "/o/" + object_name + "/acl/" + entity;
                        return bucket_url + "/o/" + object_name + "/acl";
                    }
                }

                return _iM_.get("StorageUrl");
            },

            "delete": function(){},
            "insert": function(){},
            "patch": function(){},
            "update": function(){},

            "SubClasses": {
                "Bucket": {
                },
                "BucketACL": {
                },
                "Object": {
                    "compose": function(){},
                    "copy": function(){}
                },
                "ObjectACL": {
                }
            }
        });

        var CloudStorageList = ListModel.extend({
            "kinds": [
                "storage#buckets",
                "storage#bucketAccessControls",
                "storage#objects",
                "storage#objectAccessControls"
            ],
            "url": function () {
                var project_id = this.get("projectId");
                var q_fragment = "?project="  + project_id;

                var storage_url = _iM_.get("StorageUrl");

                if (_.isEmpty(this.get("kind"))) return storage_url;
                if (IsKind(this, "storage#buckets")) return storage_url + q_fragment;

                var bucket_id = this.get("id");
                if (!bucket_id) return storage_url + q_fragment;

                var bucket_name = this.get("id");
                var bucket_url = storage_url + "/" + bucket_id;

                if (IsKind(this, "storage#objects")) return bucket_url + "/o" + q_fragment;
                if (IsKind(this, "storage#bucketAccessControls")) return bucket_url + "/acl" + q_fragment;
                if (IsKind(this, "storage#bucketAccessControls")) {
                    return bucket_url + "/o/" + this.get("name") + "/acl" + q_fragment;
                }

                return _iM_.get("StorageUrl");
            }
        });

        var UserInfoModel = BasicModel.extend({
            "url": function() {
                return _iM_.get("UserInfoUrl");
            }
        });

        var PlusModel = BasicModel.extend({
            "kinds": [ "plus#person", "plus#moment", "plus#activity", "plus#comment" ]
        });

        var PlusFeed = ListModel.extend({
            "kinds": [ "plus#peopleFeed", "plus#momentsFeed", "plus#activityFeed", "plus#commentFeed" ]
        });

        var _InternalModel_ = Backbone.Model.extend({
            "defaults": {
                "version": "0.0.1"
            },

            "Model": BasicModel,
            "List": ListModel,
            "Drive": {
                "ChangeList": ChangeListModel,
                "File": FileModel,
                "Folder": FolderModel
            },
            "Plus": {
                "Person": PlusModel,
                "Moment": PlusModel,
                "Activity": PlusModel,
                "Comment": PlusModel,
                "PeopleFeed": PlusFeed,
                "MomentsFeed": PlusFeed,
                "ActivityFeed": PlusFeed,
                "CommentFeed": PlusFeed
            },
            "UserInfo": UserInfoModel,
            "CloudStorage": {
                "Bucket": CloudStorageModel,
                "BucketACL": CloudStorageModel,
                "Object": CloudStorageModel,
                "ObjectACL": CloudStorageModel,
                "BucketList": CloudStorageList,
                "BucketACLList": CloudStorageList,
                "ObjectList": CloudStorageList,
                "ObjectACLList": CloudStorageList,
                "Model": CloudStorageModel,
                "List": CloudStorageList
            },
            "BigQuery": {},
            "Genomics": {},
            "KindMap": {
                "drive#file": FileModel,
                "drive#fileList": FolderModel,
                "storage#bucket": CloudStorageModel,
                "storage#bucketAccessControl": CloudStorageModel,
                "storage#object": CloudStorageModel,
                "storage#objectAccessControl": CloudStorageModel,
                "storage#buckets": CloudStorageList,
                "storage#bucketAccessControls": CloudStorageList,
                "storage#objects": CloudStorageList,
                "storage#objectAccessControls": CloudStorageList
            },

            "initialize": function() {
                this.on("change:GoogleAPIsUrl", function() {
                    this.set("DriveUrl", this.get("GoogleAPIsUrl") + "/drive/v2");
                    this.set("StorageUrl", this.get("GoogleAPIsUrl") + "/storage/v1/b");
                    this.set("StorageUploadUrl", this.get("GoogleAPIsUrl") + "/upload/storage/v1/b");
                    this.set("UserInfoUrl", this.get("GoogleAPIsUrl") + "/oauth2/v1/userinfo");
                }, this);
                this.set("GoogleAPIsUrl", "https://www.googleapis.com");
            }
        });

        return Backbone.GoogleAPIs = _iM_ = new _InternalModel_();
    });