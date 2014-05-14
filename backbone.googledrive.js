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

        var __is_kind = function (m, targetKind) {
            if (_.isUndefined(m)) return false;
            if (_.isEmpty(targetKind)) return false;
            return _.contains(_.flatten([targetKind]), m.get("kind"));
        };

        var __base_url = function() {
            return Backbone.GoogleDrive.BaseUrl;
        };

        var __oauth_headers = function() {
            if (!_.isEmpty(Backbone.GoogleDrive.AccessToken)) {
                return { "Authorization": "Bearer " + Backbone.GoogleDrive.AccessToken };
            }
            return {};
        };

        var BasicModel = Backbone.Model.extend({
            "initialize": function() {
                Backbone.Model.prototype.initialize.call(this);

                _.bindAll(this, "url", "fetch", "insert", "patch", "update", "delete");
            },
            "url": function() {
                if (_.isEmpty(this.get("kind"))) return __base_url() + "/files";
                if (__is_kind(this, "drive#about")) return __base_url() + "/about";

                var id = this.get("id");
                if (__is_kind(this, "drive#app")) return __base_url() + "/apps/" + id;
                if (__is_kind(this, "drive#change")) return __base_url() + "/changes/" + id;

                var baseUrl = __base_url() + "/files/" + this.get("fileId");
                if (__is_kind(this, "drive#childReference")) return baseUrl + "/children/" + id;
                if (__is_kind(this, "drive#parentReference")) return baseUrl + "/parents/" + id;
                if (__is_kind(this, "drive#permission")) return baseUrl + "/permissions/" + id;
                if (__is_kind(this, "drive#revision")) return baseUrl + "/revisions/" + id;
                if (__is_kind(this, "drive#property")) {
                    var propertyKey = this.get("propertyKey");
                    return baseUrl + "/properties/" + propertyKey;
                }

                if (__is_kind(this, "drive#comment")) return baseUrl + "/comments/" + id;
                if (__is_kind(this, "drive#commentReply")) {
                    var cId = this.get("commentId");
                    return baseUrl + "/comments/" + cId + "/replies/" + id;
                }
                return __base_url() + "/files";
            },
            "fetch": function(options) {
                options = options || {};

                var pkg = {
                    "url": this.url(),
                    "dataType": "json",
                    "contentType": "application/json",
                    "headers": _.extend({}, options["headers"], __oauth_headers())
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
                if (_.isEmpty(this.get("kind"))) return __base_url() + "/files";
                if (__is_kind(this, "drive#appList")) return __base_url() + "/apps";
                if (__is_kind(this, "drive#changeList")) {
                    var largestChangeId = parseInt(this.get("largestChangeId"));
                    if (!_.isNaN(largestChangeId)) {
                        return __base_url() + "/changes?startChangeId=" + (largestChangeId + 1);
                    }
                    return __base_url() + "/changes";
                }

                if (__is_kind(this, "drive#fileList")) return __base_url() + "/files";
                if (__is_kind(this, "drive#appList")) return __base_url() + "/apps";

                var baseUrl = __base_url() + "/files/" + this.get("fileId");
                if (__is_kind(this, "drive#childList")) return baseUrl + "/children";
                if (__is_kind(this, "drive#parentList")) return baseUrl + "/parents";
                if (__is_kind(this, "drive#permissionList")) return baseUrl + "/permissions";
                if (__is_kind(this, "drive#revisionList")) return baseUrl + "/revisions";
                if (__is_kind(this, "drive#propertyList")) return baseUrl + "/properties";

                if (__is_kind(this, "drive#commentList")) return baseUrl + "/comments";
                if (__is_kind(this, "drive#commentReplyList")) {
                    var cId = this.get("commentId");
                    return baseUrl + "/comments/" + cId + "/replies";
                }

                return __base_url() + "/files";
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
                    "headers": _.extend({}, options["headers"], __oauth_headers()),
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
                    if (__is_kind(this, queryable)) {
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
                    return __base_url() + "/changes?startChangeId=" + (largestChangeId + 1);
                }
                return __base_url() + "/changes";
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

        var gdrive_component = {
            "version": "0.0.1",
            "Model": BasicModel,
            "List": ListModel,
            "ChangeList": ChangeListModel,
            "File": FileModel,
            "Folder": FolderModel,
            "BaseUrl": "https://www.googleapis.com/drive/v2"
        };

        Backbone.GoogleDrive = gdrive_component;
        return gdrive_component;
    });