(function(root, factory) {
  if (typeof exports === "object" && root.require) {
    module.exports = factory(require("jquery"), require("underscore"), require("backbone"));
  } else if (typeof define === "function" && define.amd) {
    define([ "jquery", "underscore", "backbone" ], function($, _, Backbone) {
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
                    _.delay(list_fn, options["delayInMillis"] || 7500); // TODO : Control timer from UI
                }, this);
                _.defer(list_fn);
            },

            "unpoll": function() {
                this.stopListening("list");
                this.set("active", false);
            },

            "__list_if_active": function() {
                if (this.get("active")) {
                    this.trigger("poll");
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
            "url": function() {
                var fileId = this.get("id");
                var url = _iM_.get("DriveUrl") + "/files";
                if (_.isEmpty(fileId)) return url;
                return url + "/" + fileId;
            },
            "copy": function(new_copy, options) {},
            "insert": function(options) {
                options = options || {};

                return $.ajax({
                    "method": "POST",
                    "url": _iM_.get("DriveUrl") + "/files?uploadType=multipart",
                    "headers": _.extend({}, options["headers"], OAuthHeaders(_iM_)),
                    "contentType": "application/json",
                    "dataType": "json",
                    "data": JSON.stringify(this.toJSON(), undefined, 2),
                    "success": function(json) {
                        this.set(json);
                    },
                    "error": function(e) {
                        this.trigger("error", this, e);
                    },
                    "context": this
                });
            },
            "update": function(options) {},
            "touch": function(options) {
                this.__simple_post(options, "touch");
            },
            "trash": function(options) {
                this.__simple_post(options, "trash");
            },
            "untrash": function(options) {
                this.__simple_post(options, "untrash");
            },
            "childReferences": function() {},
            "parentReferences": function() {},
            "permissions": function() {},
            "revisions": function() {},
            "comments": function() {},
            "contents": function(options) {
              if (_.isEmpty(this.get("downloadUrl"))) return;
              options = options || {};

              $.ajax({
                "method": "GET",
                "url": this.get("downloadUrl"),
                "headers": _.extend({}, options["headers"], OAuthHeaders(_iM_)),
                "traditional": true,
                "dataType": "json",
                "contentType": "application/json",
                "success": function (json) {
                    this.trigger("contents", json);
                },
                "context": this
              });
            },

            "__simple_post": function (options, verb) {
                if (!verb) return;
                if (!this.get("id")) return;
                options = options || {};

                return $.ajax({
                    "method": "POST",
                    "url": this.url() + "/" + verb,
                    "headers": _.extend({}, options["headers"], OAuthHeaders(_iM_)),
                    "dataType": "json",
                    "success": function (json) {
                        this.set(json);
                        this.trigger(verb + "ed", json);
                    },
                    "error": function(e) {
                        this.trigger("error", this, e);
                    },
                    "context": this
                });
            }
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
        var CSModel = BasicModel.extend({
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
                "Object": {
                    "compose": function(){},
                    "copy": function(){}
                }
            }
        });

        var CSList = ListModel.extend({
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

        var PlusModel = BasicModel.extend({
            "kinds": [ "plus#person", "plus#moment", "plus#activity", "plus#comment" ],

            "url": function() {
                var id = this.get("userId") || "me";
                if (IsKind(this, "plus#person")) return _iM_.get("PlusUrl") + "/people/" + id;
                return _iM_.get("PlusUrl") + "/people";
            }
        });

        var PlusFeed = ListModel.extend({
            "kinds": [ "plus#peopleFeed", "plus#momentsFeed", "plus#activityFeed", "plus#commentFeed" ],

            "url": function() {
                var id = this.get("userId") || "me";
                var collection = this.get("collection");
                if (IsKind(this, "plus#peopleFeed")) return _iM_.get("PlusUrl") + "/people/" + id + "/people/" + (collection || "visible");
                if (IsKind(this, "plus#activityFeed")) return _iM_.get("PlusUrl") + "/people/" + id + "/activities/" + (collection || "public");
                if (IsKind(this, "plus#momentsFeed")) return _iM_.get("PlusUrl") + "/people/" + id + "/moments/" + (collection || "vault");

                var activityId = this.get("activityId");
                if (IsKind(this, "plus#commentFeed")) return _iM_.get("PlusUrl") + "/activities/" + activityId + "/comments";

                return _iM_.get("PlusUrl") + "/people";
            }
        });

        var _InternalModel_ = Backbone.Model.extend({
            "defaults": {
                "version": "0.0.1"
            },

            "KindMap": {
                "drive#about": BasicModel,
                "drive#changeList": ChangeListModel,
                "drive#file": FileModel,
                "drive#fileList": ListModel,
                "drive#appList": ListModel,
                "plus#person": PlusModel,
                "plus#moment": PlusModel,
                "plus#activity": PlusModel,
                "plus#comment": PlusModel,
                "plus#peopleFeed": PlusFeed,
                "plus#momentsFeed": PlusFeed,
                "plus#activityFeed": PlusFeed,
                "plus#commentFeed": PlusFeed,
                "storage#bucket": CSModel,
                "storage#bucketAccessControl": CSModel,
                "storage#object": CSModel,
                "storage#objectAccessControl": CSModel,
                "storage#buckets": CSList,
                "storage#bucketAccessControls": CSList,
                "storage#objects": CSList,
                "storage#objectAccessControls": CSList
            },

            "ModelFactory": function(attributes, options) {
                attributes = attributes || {};
                options = options || {};

                var Model = this.KindMap[attributes["kind"]];
                if (Model) return new Model(attributes || {}, options);
                return new BasicModel(attributes, options);
            },

            "Model": BasicModel,
            "List": ListModel,
            "Drive": {
                "File": FileModel,
                "FileList": ListModel.extend({ "defaults": { "kind": "drive#fileList" } }),
                "About": BasicModel.extend({ "defaults": { "kind": "drive#about" } }),
                "Change": BasicModel.extend({ "defaults": { "kind": "drive#change" } }),
                "ChangeList": ChangeListModel,
                "ChildReference": BasicModel.extend({ "defaults": { "kind": "drive#childReference" } }),
                "ChildList": ListModel.extend({ "defaults": { "kind": "drive#childList" } }),
                "ParentReference": BasicModel.extend({ "defaults": { "kind": "drive#parentReference" } }),
                "ParentList": ListModel.extend({ "defaults": { "kind": "drive#parentList" } }),
                "Permission": BasicModel.extend({ "defaults": { "kind": "drive#permission" } }),
                "PermissionList": ListModel.extend({ "defaults": { "kind": "drive#permissionList" } }),
                "Revision": BasicModel.extend({ "defaults": { "kind": "drive#revision" } }),
                "RevisionList": ListModel.extend({ "defaults": { "kind": "drive#revisionList" } }),
                "App": BasicModel.extend({ "defaults": { "kind": "drive#app" } }),
                "AppList": ListModel.extend({ "defaults": { "kind": "drive#appList" } }),
                "Comment": BasicModel.extend({ "defaults": { "kind": "drive#comment" } }),
                "CommentList": ListModel.extend({ "defaults": { "kind": "drive#commentList" } }),
                "CommentReply": BasicModel.extend({ "defaults": { "kind": "drive#commentReply" } }),
                "CommentReplyList": ListModel.extend({ "defaults": { "kind": "drive#commentReplyList" } }),
                "Property": BasicModel.extend({ "defaults": { "kind": "drive#property" } }),
                "PropertyList": ListModel.extend({ "defaults": { "kind": "drive#propertyList" } }),
                "Folder": FolderModel,
                "Trash": Backbone.Model.extend({
                    "empty": function(options) {
                        options = options || {};

                        return $.ajax({
                            "method": "DELETE",
                            "url": _iM_.get("DriveUrl") + "/files/trash",
                            "headers": _.extend({}, options["headers"], OAuthHeaders(_iM_)),
                            "dataType": "json",
                            "success": function () {
                                this.set({ "empty": true });
                            },
                            "error": function(e) {
                                this.trigger("error", this, e);
                            },
                            "context": this
                        });
                    }
                })
            },
            "Plus": {
                "Person": PlusModel.extend({ "defaults": { "kind": "plus#person" } }),
                "PeopleFeed": PlusFeed.extend({ "defaults": { "kind": "plus#peopleFeed" } }),
                "Activity": PlusModel.extend({ "defaults": { "kind": "plus#activity" } }),
                "ActivityFeed": PlusFeed.extend({ "defaults": { "kind": "plus#activityFeed" } }),
                "Comment": PlusModel.extend({ "defaults": { "kind": "plus#comment" } }),
                "CommentFeed": PlusFeed.extend({ "defaults": { "kind": "plus#commentFeed" } }),
                "Moment": PlusModel.extend({ "defaults": { "kind": "plus#moment" } }),
                "MomentsFeed": PlusFeed.extend({ "defaults": { "kind": "plus#momentsFeed" } })
            },
            "UserInfo": BasicModel.extend({
                "url": function() {
                    return _iM_.get("UserInfoUrl");
                }
            }),
            "Storage": {
                "Bucket": CSModel.extend({ "defaults": { "kind": "storage#bucket" } }),
                "Buckets": CSList.extend({ "defaults": { "kind": "storage#buckets" } }),
                "Object": CSModel.extend({ "defaults": { "kind": "storage#object" } }),
                "Objects": CSList.extend({ "defaults": { "kind": "storage#objects" } }),
                "BucketAccessControl": CSModel.extend({ "defaults": { "kind": "storage#bucketAccessControl" } }),
                "BucketAccessControls": CSList.extend({ "defaults": { "kind": "storage#bucketAccessControls" } }),
                "ObjectAccessControl": CSModel.extend({ "defaults": { "kind": "storage#objectAccessControl" } }),
                "ObjectAccessControls": CSList.extend({ "defaults": { "kind": "storage#objectAccessControls" } })
            },
            "BigQuery": {},
            "Genomics": {},

            "initialize": function() {
                this.on("change:GoogleAPIsUrl", function() {
                    this.set("DriveUrl", this.get("GoogleAPIsUrl") + "/drive/v2");
                    this.set("PlusUrl", this.get("GoogleAPIsUrl") + "/plus/v1");
                    this.set("StorageUrl", this.get("GoogleAPIsUrl") + "/storage/v1/b");
                    this.set("StorageUploadUrl", this.get("GoogleAPIsUrl") + "/upload/storage/v1/b");
                    this.set("UserInfoUrl", this.get("GoogleAPIsUrl") + "/oauth2/v1/userinfo");
                }, this);
                this.set("GoogleAPIsUrl", "https://www.googleapis.com");
            }
        });

        return Backbone.GoogleAPIs = _iM_ = new _InternalModel_();
    });
