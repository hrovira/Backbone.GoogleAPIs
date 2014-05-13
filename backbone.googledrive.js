define("backbone.googledrive", ["jquery", "underscore", "backbone"],
    function ($, _, Backbone) {
        var local_model = {};

        var __is_kind = function (m, targetKind) {
            if (_.isUndefined(m)) return false;
            if (_.isEmpty(targetKind)) return false;
            return _.contains(_.flatten([targetKind]), m.get("kind"));
        };

        var BasicModel = Backbone.Model.extend({
            "initialize": function() {
                Backbone.Model.prototype.initialize.call(this);

                _.bindAll(this, "url", "fetch", "insert", "patch", "update", "delete");
            },
            "url": function() {},
            "fetch": function(options) {},
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
            "url": function() {},
            "fetch": function(options) {},
            "list": function(options) {}
        });

        var ChangeListModel = ListModel.extend({
            "defaults": {
                "kind": "drive#changeList",
                "active": true
            },
            "initialize": function() {
                ListModel.prototype.initialize.call(this);

                _.bindAll(this, "list");
            },
            "list": function(options) {},

            "poll": function(options) {
                options = options || {};
                this.on("list", function() {
                    _.delay(this.list, options["delayInMillis"] || 5000);
                }, this);
            },
            "unpoll": function() {
                this.stopListening("list");
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
            "Folder": FolderModel
        };

        Backbone.GoogleDrive = gdrive_component;
        return gdrive_component;
    });