var ChangeList = {};

// View Support Functions
var displayJson = function (m) {
    var $el = $(".json-container").empty();
    new jsoneditor.JSONEditor(_.first($el), { mode: "view" }, m.toJSON());
};

var displayPoll = function () {
    var $el = $(".poll-message");
    $el.show().removeClass("hide");
    _.delay(_.bind($el.hide, $el), 1500);
};

var displayError = function (model, response) {
    _.defer(displayJson, model);

    if (response) {
        if (response.responseJSON) {
            var $el = $(".error-container").empty();
            var json = response.responseJSON;
            new jsoneditor.JSONEditor(_.first($el), { mode: "view" }, json);
        } else {
            var txt = response.responseText || "Unknown Error #1";
            $(".error-container").html(txt);
        }
    } else {
        $(".error-container").html("Unknown Error #2");
    }
};

var DemoFns = {
    "model-factory": {
        "about": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "drive#about" });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.fetch();
        },
        "list-apps": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "drive#appList" });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.list();
        },
        "list-folders": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "drive#fileList" });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.list({ "?": { "q": "mimeType='application/vnd.google-apps.folder'" } });
        },
        "list-changes": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "drive#changeList" });

            ChangeList = model;
            model.on("change", displayJson);
            model.on("poll", displayPoll);
            model.on("error", displayError);
            model.poll();
        },
        "file-insert": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({
                "kind": "drive#file", "title": "Backbone.GoogleAPIs | Test : Model Factory"
            });
            model.on("change:id", function (m) {
                localStorage.setItem("file-insert-id", m.get("id"));
            });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.insert();
        },
        "file-fetch": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({
                "kind": "drive#file", "id": localStorage.getItem("file-insert-id")
            });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.fetch();
        },
        "file-update": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({
                "kind": "drive#file", "id": localStorage.getItem("file-insert-id")
            });
            model.set("title", "Backbone.GoogleAPIs | Test | New Title");
            model.on("change", displayJson);
            model.on("error", displayError);
            model.update();
        },
        "file-touch": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({
                "kind": "drive#file", "id": localStorage.getItem("file-insert-id")
            });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.touch();
        },
        "file-trash": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({
                "kind": "drive#file", "id": localStorage.getItem("file-insert-id")
            });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.trash();
        },
        "file-untrash": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({
                "kind": "drive#file", "id": localStorage.getItem("file-insert-id")
            });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.untrash();
        },
        "file-empty-trash": function () {
            var trash = new Backbone.GoogleAPIs.Drive.Trash();
            trash.on("change", displayJson);
            trash.on("error", displayError);
            trash.empty();
        },
        "list-buckets": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "storage#buckets" });
            model.on("change", displayJson);
            model.on("error", displayError);

            $(".list-buckets-btn").on("click", function () {
                $(".buckets-needs-project-id").hide();

                var project_id = $(".buckets-project-id").val() || "";
                if (_.isEmpty(project_id.trim())) {
                    $(".buckets-needs-project-id").show().removeClass("hide");
                    return;
                }
                model.set("projectId", project_id);
                _.defer(model.list);
            });
        },
        "plus-get-person": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "plus#person" });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.fetch();
        },
        "plus-list-people": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "plus#peopleFeed" });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.list();
        },
        "plus-list-activity": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "plus#activityFeed" });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.list();
        },
        "plus-list-moments": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "plus#momentsFeed" });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.list();
        },
        "plus-list-comments": function () {
            var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "plus#commentFeed" });
            model.on("change", displayJson);
            model.on("error", displayError);

            $(".list-plus-comments-btn").on("click", function () {
                $(".list-comments-needs-activity-id").hide();

                var activityId = $(".plus-activity-id").val() || "";
                if (_.isEmpty(activityId.trim())) {
                    $(".list-comments-needs-activity-id").show().removeClass("hide");
                    return;
                }
                model.set("activityId", activityId);
                _.defer(model.list);
            });
        }
    },
    "class-hierarchy": {
        "about": function () {
            var model = new Backbone.GoogleAPIs.Drive.About();
            model.on("change", displayJson);
            model.on("error", displayError);
            model.fetch();
        },
        "list-apps": function () {
            var model = new Backbone.GoogleAPIs.Drive.AppList();
            model.on("change", displayJson);
            model.on("error", displayError);
            model.list();
        },
        "list-folders": function () {
            var model = new Backbone.GoogleAPIs.Drive.FileList();
            model.on("change", displayJson);
            model.on("error", displayError);
            model.list({ "?": { "q": "mimeType='application/vnd.google-apps.folder'" } });
        },
        "list-changes": function () {
            var model = new Backbone.GoogleAPIs.Drive.ChangeList();
            ChangeList = model;
            model.on("change", displayJson);
            model.on("poll", displayPoll);
            model.on("error", displayError);
            model.poll();
        },
        "file-insert": function () {
            var model = new Backbone.GoogleAPIs.Drive.File({
                "title": "Backbone.GoogleAPIs | Test : Class Hierarchy"
            });
            model.on("change:id", function (m) {
                localStorage.setItem("file-insert-id", m.get("id"));
            });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.insert();
        },
        "file-fetch": function () {
            var model = new Backbone.GoogleAPIs.Drive.File({
                "id": localStorage.getItem("file-insert-id")
            });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.fetch();
        },
        "file-update": function () {
            var model = new Backbone.GoogleAPIs.Drive.File();
            model.set("id", localStorage.getItem("file-insert-id"));
            model.set("title", "Backbone.GoogleAPIs | Test | New Title");
            model.on("change", displayJson);
            model.on("error", displayError);
            model.update();
        },
        "file-touch": function () {
            var model = new Backbone.GoogleAPIs.Drive.File({
                "id": localStorage.getItem("file-insert-id")
            });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.touch();
        },
        "file-trash": function () {
            var model = new Backbone.GoogleAPIs.Drive.File({
                "id": localStorage.getItem("file-insert-id")
            });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.trash();
        },
        "file-untrash": function () {
            var model = new Backbone.GoogleAPIs.Drive.File({
                "id": localStorage.getItem("file-insert-id")
            });
            model.on("change", displayJson);
            model.on("error", displayError);
            model.untrash();
        },
        "list-buckets": function () {
            var model = new Backbone.GoogleAPIs.Storage.Buckets();
            model.on("change", displayJson);
            model.on("error", displayError);

            $(".list-buckets-btn").on("click", function () {
                $(".buckets-needs-project-id").hide();

                var project_id = $(".buckets-project-id").val() || "";
                if (_.isEmpty(project_id.trim())) {
                    $(".buckets-needs-project-id").show().removeClass("hide");
                    return;
                }
                model.set("projectId", project_id);
                _.defer(model.list);
            });
        },
        "plus-get-person": function () {
            var model = new Backbone.GoogleAPIs.Plus.Person();
            model.on("change", displayJson);
            model.on("error", displayError);
            model.fetch();
        },
        "plus-list-people": function () {
            var model = new Backbone.GoogleAPIs.Plus.PeopleFeed();
            model.on("change", displayJson);
            model.on("error", displayError);
            model.list();
        },
        "plus-list-activity": function () {
            var model = new Backbone.GoogleAPIs.Plus.ActivityFeed();
            model.on("change", displayJson);
            model.on("error", displayError);
            model.list();
        },
        "plus-list-moments": function () {
            var model = new Backbone.GoogleAPIs.Plus.MomentsFeed();
            model.on("change", displayJson);
            model.on("error", displayError);
            model.list();
        },
        "plus-list-comments": function () {
            var model = new Backbone.GoogleAPIs.Plus.CommentFeed();
            model.on("change", displayJson);
            model.on("error", displayError);

            $(".list-plus-comments-btn").on("click", function () {
                $(".list-comments-needs-activity-id").hide();

                var activityId = $(".plus-activity-id").val() || "";
                if (_.isEmpty(activityId.trim())) {
                    $(".list-comments-needs-activity-id").show().removeClass("hide");
                    return;
                }
                model.set("activityId", activityId);
                _.defer(model.list);
            });
        }
    },
    "neither": {
        "userinfo": function() {
            var model = new Backbone.GoogleAPIs.UserInfo({});
            model.on("error", displayError);
            model.on("change", displayJson);
            model.fetch();
        },
        "file-empty-trash": function () {
            var trash = new Backbone.GoogleAPIs.Drive.Trash();
            trash.on("change", displayJson);
            trash.on("error", displayError);
            trash.empty();
        }
    }
};
