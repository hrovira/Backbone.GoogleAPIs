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
    $(".buckets-needs-project-id").hide();
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

// shared among File operations after insert
var FileId;
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
    var model = new Backbone.GoogleAPIs.Model({ "kind": "drive#about" });
    model.on("change", displayJson);
    model.on("error", displayError);
    model.fetch();
};

var pollChangeList = function () {
    var model = ChangeList = new Backbone.GoogleAPIs.Drive.ChangeList();
    model.on("change", displayJson);
    model.on("error", displayError);
    model.poll();
};

var listApps = function () {
    var model = new Backbone.GoogleAPIs.List({ "kind": "drive#appList" });
    model.on("change", displayJson);
    model.on("error", displayError);
    model.list();
};

var listFolders = function () {
    var model = new Backbone.GoogleAPIs.List({ "kind": "drive#fileList" });
    model.on("change", displayJson);
    model.on("error", displayError);
    model.list({ "?": { "q": "mimeType='application/vnd.google-apps.folder'" } });
};

var listBuckets = function () {
    var model = new Backbone.GoogleAPIs.CloudStorage.List({ "kind": "storage#buckets" });
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

var fileInsert = function () {
    var model = new Backbone.GoogleAPIs.Drive.File({
        "title": "Backbone.GoogleAPIs | Test"
    });
    model.on("change:id", function (m) {
        FileId = m.get("id");
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
                if (strFn.indexOf("displayJson") >= 0) parts.push("var displayJson = " + displayJson + ";");
                if (strFn.indexOf("displayError") >= 0) parts.push("var displayError = " + displayError + ";");
                $(".code-container").html(parts.join("\n\n"));
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
