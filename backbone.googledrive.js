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

        var BasicModel = Backbone.Model.extend({
            "initialize": function() {
                Backbone.Model.prototype.initialize.call(this);

                _.bindAll(this, "url", "fetch", "insert", "patch", "update", "delete");
            },
            "url": function() {
                if (_.isEmpty(this.get("kind"))) return _BiG_.__drive_url() + "/files";
                if (_BiG_.__is_kind(this, "drive#about")) return _BiG_.__drive_url() + "/about";

                var id = this.get("id");
                if (_BiG_.__is_kind(this, "drive#app")) return _BiG_.__drive_url() + "/apps/" + id;
                if (_BiG_.__is_kind(this, "drive#change")) return _BiG_.__drive_url() + "/changes/" + id;

                var baseUrl = _BiG_.__drive_url() + "/files/" + this.get("fileId");
                if (_BiG_.__is_kind(this, "drive#childReference")) return baseUrl + "/children/" + id;
                if (_BiG_.__is_kind(this, "drive#parentReference")) return baseUrl + "/parents/" + id;
                if (_BiG_.__is_kind(this, "drive#permission")) return baseUrl + "/permissions/" + id;
                if (_BiG_.__is_kind(this, "drive#revision")) return baseUrl + "/revisions/" + id;
                if (_BiG_.__is_kind(this, "drive#property")) {
                    var propertyKey = this.get("propertyKey");
                    return baseUrl + "/properties/" + propertyKey;
                }

                if (_BiG_.__is_kind(this, "drive#comment")) return baseUrl + "/comments/" + id;
                if (_BiG_.__is_kind(this, "drive#commentReply")) {
                    var cId = this.get("commentId");
                    return baseUrl + "/comments/" + cId + "/replies/" + id;
                }
                return _BiG_.__drive_url() + "/files";
            },
            "fetch": function(options) {
                options = options || {};

                var pkg = {
                    "url": this.url(),
                    "dataType": "json",
                    "contentType": "application/json",
                    "headers": _.extend({}, options["headers"], _BiG_.__oauth_headers())
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
                if (_.isEmpty(this.get("kind"))) return _BiG_.__drive_url() + "/files";
                if (_BiG_.__is_kind(this, "drive#appList")) return _BiG_.__drive_url() + "/apps";
                if (_BiG_.__is_kind(this, "drive#changeList")) {
                    var largestChangeId = parseInt(this.get("largestChangeId"));
                    if (!_.isNaN(largestChangeId)) {
                        return _BiG_.__drive_url() + "/changes?startChangeId=" + (largestChangeId + 1);
                    }
                    return _BiG_.__drive_url() + "/changes";
                }

                if (_BiG_.__is_kind(this, "drive#fileList")) return _BiG_.__drive_url() + "/files";
                if (_BiG_.__is_kind(this, "drive#appList")) return _BiG_.__drive_url() + "/apps";

                var baseUrl = _BiG_.__drive_url() + "/files/" + this.get("fileId");
                if (_BiG_.__is_kind(this, "drive#childList")) return baseUrl + "/children";
                if (_BiG_.__is_kind(this, "drive#parentList")) return baseUrl + "/parents";
                if (_BiG_.__is_kind(this, "drive#permissionList")) return baseUrl + "/permissions";
                if (_BiG_.__is_kind(this, "drive#revisionList")) return baseUrl + "/revisions";
                if (_BiG_.__is_kind(this, "drive#propertyList")) return baseUrl + "/properties";

                if (_BiG_.__is_kind(this, "drive#commentList")) return baseUrl + "/comments";
                if (_BiG_.__is_kind(this, "drive#commentReplyList")) {
                    var cId = this.get("commentId");
                    return baseUrl + "/comments/" + cId + "/replies";
                }

                return _BiG_.__drive_url() + "/files";
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
                    "headers": _.extend({}, options["headers"], _BiG_.__oauth_headers()),
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

                if (_.has(options, "query")) {
                    var queryable = [
                        "drive#changeList",
                        "drive#childList",
                        "drive#parentList",
                        "drive#permissionList"
                    ];
                    if (_BiG_.__is_kind(this, queryable)) {
                        _.extend(pkg, {
                            "data": _.extend({}, options["query"]),
                            "traditional": true
                        });
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
                    return _BiG_.__drive_url() + "/changes?startChangeId=" + (largestChangeId + 1);
                }
                return _BiG_.__drive_url() + "/changes";
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

            "initialize": function(options) {
                options = options || {};
                this.set("project", options.project);
                BasicModel.prototype.initialize.call(this, options);
            },

            "url": function() {
                var DEFAULT_TO_NEW_BUCKET = _BiG_.__storage_url() + "/b";
                if (_.isEmpty(this.get("kind"))) return DEFAULT_TO_NEW_BUCKET;

                var bucket_id = this.get("id");
                var bucket_name = this.get("id");
                if (!bucket_id) return DEFAULT_TO_NEW_BUCKET;

                var bucket_url = _BiG_.__storage_url() + "/b/" + bucket_id;
                if (_BiG_.__is_kind(this, "storage#bucket")) return bucket_url;

                var object_id = this.get("id");
                if (_BiG_.__is_kind(this, "storage#object")) {
                    if (this.get("isUpload")) return _BiG_.__storage_upload_url() + "/b/" + bucket_id + "/o";
                    if (object_id) return bucket_url + "/o/" + object_id;
                    return bucket_url + "/o";
                }

                var entity_id = this.get("id");
                if (_BiG_.__is_kind(this, "storage#bucketAccessControl")) {
                    if (entity_id) return bucket_url + "/acl/" + entity_id;
                    return bucket_url + "/acl";
                }

                if (_BiG_.__is_kind(this, "storage#objectAccessControl")) {
                    if (this.get("defaultObjectAcl"))  {
                        if (entity_id) return bucket_url + "/defaultObjectAcl/" + entity_id;
                        return bucket_url + "/defaultObjectAcl";
                    }

                    if (object_id) {
                        if (entity_id) return bucket_url + "/o/" + object_id + "/acl/" + entity_id;
                        return bucket_url + "/o/" + object_id + "/acl";
                    }
                }

                return DEFAULT_TO_NEW_BUCKET;
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
                // list
                    // GET https://www.googleapis.com/storage/v1/b (#buckets)
                    // GET https://www.googleapis.com/storage/v1/b/{bucket}/o (#objects)
                    // GET https://www.googleapis.com/storage/v1/b/{bucket}/acl (#bucket ACLs)
                    // GET https://www.googleapis.com/storage/v1/b/{bucket}/defaultObjectAcl (may only return one?)
            }
        });

        var UserInfoModel = BasicModel.extend({
            "url": function() {
                return _BiG_.__userinfo_url();
            }
        });

        _BiG_ = Backbone.Model.extend({
            "defaults": {
                "version": "0.0.1",
                "GoogleApisUrl": "https://www.googleapis.com"
            },

            "Model": BasicModel,
            "List": ListModel,
            "Drive": {
                "ChangeList": ChangeListModel,
                "File": FileModel,
                "Folder": FolderModel
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
                "ObjectACLList": CloudStorageList
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

            "__drive_url": function() {
                return this.get("GoogleApisUrl") + "/drive/v2";
            },

            "__storage_url": function() {
                return this.get("GoogleApisUrl") + "/storage/v1";
            },

            "__storage_upload_url": function() {
                return this.get("GoogleApisUrl") + "/upload/storage/v1";
            },

            "__userinfo_url": function() {
                return this.get("GoogleApisUrl") + "/oauth2/v1/userinfo";
            },

            "__oauth_headers": function() {
                if (!_.isEmpty(this.get("access_token"))) {
                    return { "Authorization": "Bearer " + this.get("access_token") };
                }
                return {};
            },

            "__is_kind": function (m, targetKind) {
                if (_.isUndefined(m)) return false;
                if (_.isEmpty(targetKind)) return false;
                return _.contains(_.flatten([targetKind]), m.get("kind"));
            }
        });

        Backbone.GoogleAPIs = _BiG_;
        return _BiG_;
    });