import express from "express";
import * as bodyParser from "body-parser";
var PORT = 8080;
var startServer = function () {
    var app = express();
    setupApp(app);
    setupRoutes(app);
    // Start Express on the defined PORT
    app.listen(PORT, function () {
        console.log("GetGot mock-server started on port " + PORT);
    });
    return app;
};
var setupApp = function (app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
};
var setupRoutes = function (app) {
    app.get("*", function (req, res) {
        res.status(405);
        res.set("Allow", "POST");
        res.send("Method Not Allowed");
    });
    app.post("*", function (req, res) {
        console.log("Request", req.body);
        res.sendStatus(200);
    });
};
var app = startServer();
//# sourceMappingURL=index.js.map