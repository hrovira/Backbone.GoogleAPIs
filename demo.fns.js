// authentication functions
var signinCallback = function (json) {
    json = json || {};

    Backbone.GoogleAPIs.set("access_token", json["access_token"]);
    Backbone.GoogleAPIs.set("signed_in_user", json);

    _.defer(fetchUserInfo, true);

    try {
        Backbone.history.start();
    } catch (e) {
        console.warn(e);
    }
};

var signOut = function () {
    if (_.isEmpty(Backbone.GoogleAPIs.get("access_token"))) {
        document.location = document.location.href.replace("#sign-out", "");
        return;
    }

    var po = document.createElement("script");
    po["type"] = "text/javascript";
    po["async"] = true;
    po["src"] = "https://accounts.google.com/o/oauth2/revoke?token=" + Backbone.GoogleAPIs.get("access_token");
    po["onload"] = function () {
        document.location = document.location.href.replace("#sign-out", "");
    };

    var s = document.getElementsByTagName("script")[0];
    s["parentNode"].insertBefore(po, s);
};

// view support functions
var resetDisplay = function (ev) {
    if (_.isEqual(ev, "list-buckets")) {
        $(".list-buckets-inputs").show().removeClass("hide");
    } else {
        $(".list-buckets-inputs").hide();
    }
    if (_.isEqual(ev, "plus-list-comments")) {
        $(".list-comments-inputs").show().removeClass("hide");
    } else {
        $(".list-comments-inputs").hide();
    }
    $(".buckets-needs-project-id").hide();
    $(".list-comments-needs-activity-id").hide();
};

var displayJson = function (m) {
    var $el = $(".json-container").empty();
    new jsoneditor.JSONEditor(_.first($el), { mode: "view" }, m.toJSON());
};

var displayError = function (model, response) {
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

var modelToggler = function() {
    if (_.isEqual(localStorage.getItem("model.toggler"), "on")) {
        localStorage.removeItem("model.toggler");
        return true;
    }

    localStorage.setItem("model.toggler", "on");
    return false;
};

// shared among File operations after insert
var FileId = localStorage.getItem("FileId");
var ChangeList = {};

// example functions
var signInUser = function (m) {
    var email = m.get("email");
    if (_.isEmpty(email)) {
        $(".signed-out").show().removeClass("hide");
        return;
    }

    $(".signed-in").show().removeClass("hide");

    $(".signed-in-email").html(email);

    var picture = m.get("picture");
    if (!_.isEmpty(picture)) $(".signed-in-picture").attr("src", picture);
};

var fetchUserInfo = function (onStartup) {
    $(".signed-out").hide();
    $(".signed-in").hide();

    var model = new Backbone.GoogleAPIs.UserInfo({});
    if (!onStartup) {
        model.on("error", displayError);
        model.on("change", displayJson);
    }
    model.on("change", signInUser);
    model.on("error", function () {
        $(".signed-out").show().removeClass("hide");
    });
    model.fetch();
};

var fetchAbout = function () {
    if (modelToggler()) {
        var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "drive#about" });
    } else {
        var model = new Backbone.GoogleAPIs.Drive.About();
    }

    model.on("change", displayJson);
    model.on("error", displayError);
    model.fetch();
};

var pollChangeList = function () {
    if (modelToggler()) {
        var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "drive#changeList" });
    } else {
        var model = new Backbone.GoogleAPIs.Drive.ChangeList();
    }

    ChangeList = model;
    model.on("change", displayJson);
    model.on("error", displayError);
    model.poll();
};

var listApps = function () {
    if (modelToggler()) {
        var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "drive#appList" });
    } else {
        var model = new Backbone.GoogleAPIs.Drive.AppList();
    }

    model.on("change", displayJson);
    model.on("error", displayError);
    model.list();
};

var listFolders = function () {
    if (modelToggler()) {
        var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "drive#fileList" });
    } else {
        var model = new Backbone.GoogleAPIs.Drive.FileList();
    }

    model.on("change", displayJson);
    model.on("error", displayError);
    model.list({ "?": { "q": "mimeType='application/vnd.google-apps.folder'" } });
};

var listBuckets = function () {
    if (modelToggler()) {
        var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "storage#buckets" });
    } else {
        var model = new Backbone.GoogleAPIs.Storage.Buckets();
    }
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
};

var plusGetPerson = function() {
    if (modelToggler()) {
        var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "plus#person" });
    } else {
        var model = new Backbone.GoogleAPIs.Plus.Person();
    }
    model.on("change", displayJson);
    model.on("error", displayError);
    model.fetch();
};

var plusListPeople = function() {
    if (modelToggler()) {
        var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "plus#peopleFeed" });
    } else {
        var model = new Backbone.GoogleAPIs.Plus.PeopleFeed();
    }
    model.on("change", displayJson);
    model.on("error", displayError);
    model.list();
};

var plusListActivities = function() {
    if (modelToggler()) {
        var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "plus#activityFeed" });
    } else {
        var model = new Backbone.GoogleAPIs.Plus.ActivityFeed();
    }
    model.on("change", displayJson);
    model.on("error", displayError);
    model.list();
};

var plusListMoments = function() {
    if (modelToggler()) {
        var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "plus#momentsFeed" });
    } else {
        var model = new Backbone.GoogleAPIs.Plus.MomentsFeed();
    }
    model.on("change", displayJson);
    model.on("error", displayError);
    model.list();
};

var plusListComments = function() {
    if (modelToggler()) {
        var model = Backbone.GoogleAPIs.ModelFactory({ "kind": "plus#commentFeed" });
    } else {
        var model = new Backbone.GoogleAPIs.Plus.CommentFeed();
    }
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
};

var fileInsert = function () {
    var model = new Backbone.GoogleAPIs.Drive.File({
        "title": "Backbone.GoogleAPIs | Test"
    });
    model.on("change:id", function (m) {
        FileId = m.get("id");
        localStorage.setItem("FileId", FileId);
    });
    model.on("change", displayJson);
    model.on("error", displayError);
    model.insert();
};

var fileFetch = function () {
    if (!FileId) return $(".error-container").html("Insert File First");

    var model = new Backbone.GoogleAPIs.Drive.File({ "id": FileId });
    model.on("change", displayJson);
    model.on("error", displayError);
    model.fetch();
};

var fileUpdate = function () {
    if (!FileId) return $(".error-container").html("Insert File First");

    var model = new Backbone.GoogleAPIs.Drive.File();
    model.set("id", FileId);
    model.set("title", "Backbone.GoogleAPIs | Test | New Title");
    model.on("change", displayJson);
    model.on("error", displayError);
    model.update();
};

var fileTrash = function () {
    if (!FileId) return $(".error-container").html("Insert File First");

    var model = new Backbone.GoogleAPIs.Drive.File({ "id": FileId });
    model.on("change", displayJson);
    model.on("error", displayError);
    model.trash();
};

// bootstraps example functions
_.defer(function () {
    var App = Backbone.Router.extend({
        "__route": function (name, target_fn) {
            var wrapping_fn = function () {
                if (_.isFunction(target_fn)) _.defer(target_fn);
                if (!_.isUndefined(ChangeList) && _.isFunction(ChangeList.unpoll)) ChangeList.unpoll();

                $(".json-container").empty();
                $(".error-container").empty();

                // pretty printing target_fn
                var strFn = "" + target_fn;
                var parts = [];

                if (strFn.indexOf("FileId") >= 0) parts.push("var FileId = \"" + (FileId || "") + "\";");
                parts.push("" + strFn);
                $(".code-container").html(parts.join("\n\n"));

                var auxparts = [];
                if (strFn.indexOf("displayJson") >= 0) auxparts.push("var displayJson = " + displayJson + ";");
                if (strFn.indexOf("displayError") >= 0) auxparts.push("var displayError = " + displayError + ";");
                if (strFn.indexOf("modelToggler") >= 0) {
                    auxparts.push("// value of 'localStorage.getItem(\"model.toggler\")' is '" + (localStorage.getItem("model.toggler") || "") + "';");
                    auxparts.push("var modelToggler = " + modelToggler + ";");
                }
                $(".aux-code-container").html(auxparts.join("\n\n"));
            };

            this.route(name, name, wrapping_fn);
        }
    });
    app = new App();
    app.on("route", resetDisplay);
    app.on("route", function (href) {
        // toggles active list item
        _.each($(".top-level-anchors").find("a.list-group-item"), function (item) {
            $(item).removeClass("active");
            if (_.isEqual($(item).attr("href"), "#" + href)) $(item).addClass("active");
        });
    });

    app.__route("userinfo", fetchUserInfo);
    app.__route("about", fetchAbout);
    app.__route("list-apps", listApps);
    app.__route("list-folders", listFolders);
    app.__route("list-changes", pollChangeList);
    app.__route("file-insert", fileInsert);
    app.__route("file-fetch", fileFetch);
    app.__route("file-update", fileUpdate);
    app.__route("file-trash", fileTrash);
    app.__route("sign-out", signOut);
    app.__route("list-buckets", listBuckets);
    app.__route("plus-get-person", plusGetPerson);
    app.__route("plus-list-people", plusListPeople);
    app.__route("plus-list-activity", plusListActivities);
    app.__route("plus-list-moments", plusListMoments);
    app.__route("plus-list-comments", plusListComments);

    app.route("goto-https", "goto-https", function() {
        var loca = document["location"];
        document["location"] = "https:" + (loca["host"] || loca["hostname"]) + loca["pathname"];
    });
    if (document.location.protocol === "https:") {
        $(".goto-https-container").hide();
    }
});

// displays JS dependencies
_.defer(function () {
    _.each($("script"), function (script) {
        if (script && _.has(script, "src")) {
            if (script["src"].indexOf("chrome-extension") >= 0) return;
            if (script["src"].indexOf("apps-static") >= 0) return;
            $(".deps-container").append("<li>" + script["src"] + "</li>");
        }
    });
});
