// authentication functions
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

// View Support Functions
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
var ChangeList = {};

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

                if (strFn.indexOf("localStorage") >= 0) {
                    parts.push("// localStorage -> " + JSON.stringify(localStorage, undefined, 2));
                }
                var cleanStr = _.map(strFn.split("\n"), function(line) {
                    return line.replace("       ", "");
                });
                parts.push("" + cleanStr.join("\n"));
//                parts.push("" + strFn);
                $(".code-container").html(parts.join("\n\n"));

                var auxparts = [];
                if (strFn.indexOf("displayJson") >= 0) auxparts.push("var displayJson = " + displayJson + ";");
                if (strFn.indexOf("displayError") >= 0) auxparts.push("var displayError = " + displayError + ";");
                $(".aux-code-container").html(auxparts.join("\n\n"));
            };

            this.route(name, name, wrapping_fn);
        }
    });

    app = new App();

    // resets buckets inputs
    app.on("route", function (href) {
        if (_.isEqual(href, "list-buckets")) {
            $(".list-buckets-inputs").show().removeClass("hide");
        } else {
            $(".list-buckets-inputs").hide();
        }
        $(".buckets-needs-project-id").hide();
    });
    // resets comments inputs
    app.on("route", function (href) {
        if (_.isEqual(href, "plus-list-comments")) {
            $(".list-comments-inputs").show().removeClass("hide");
        } else {
            $(".list-comments-inputs").hide();
        }
        $(".list-comments-needs-activity-id").hide();
    });
    // toggles active list item
    app.on("route", function (href) {
        _.each($(".top-level-anchors").find("a.list-group-item"), function (item) {
            $(item).removeClass("active");
            if (_.isEqual($(item).attr("href"), "#" + href)) $(item).addClass("active");
        });
    });

    // configures buttons for controlling model instantiation strategy
    var readyRoutes = function(e) {
        $(".btn-modeltype-selector").removeClass("active btn-success");
        _.each($(".btn-modeltype-selector"), function(e) {
            var oldType = localStorage.getItem("modeltype-selector");
            var newType = $(e).data("type");
            if (newType === oldType) $(e).addClass("active btn-success");
        });

        var modelTypeSelector = localStorage.getItem("modeltype-selector") || "model-factory";
        var demoFnRoutes = ["about", "list-apps", "list-folders", "list-changes", "list-buckets",
            "file-insert","file-fetch","file-update","file-touch","file-trash","file-untrash","file-empty-trash",
            "plus-get-person", "plus-list-people", "plus-list-activity", "plus-list-moments", "plus-list-comments"];
        _.each(demoFnRoutes, function(demoFnRoute) {
            app.__route(demoFnRoute, DemoFns[modelTypeSelector][demoFnRoute]);
        })
    };

    $(".btn-modeltype-selector").on("click", function(e) {
        localStorage.setItem("modeltype-selector", $(e.target).data("type"));
        _.defer(readyRoutes);
        _.defer(function() {
            Backbone.history.loadUrl(Backbone.history.fragment)
        });
    });

    // change to HTTPS
    app.route("goto-https", "goto-https", function() {
        var loca = document["location"];
        document["location"] = "https:" + (loca["host"] || loca["hostname"]) + loca["pathname"];
    });
    if (document.location.protocol === "https:") {
        $(".goto-https-container").hide();
    }

    app.__route("sign-out", signOut);

    // bootstraps EXAMPLE FUNCTIONS
    app.__route("userinfo", fetchUserInfo);

    _.defer(readyRoutes);
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
