// node modules
let exp = require("express");
let app = exp();
let path = require("path");
let dir = p => path.join(__dirname, p);
let bodyParser = require("body-parser");
let at = require("lodash/get");

// local file includes
let wpt = require("./index");


nodePort = process.env.NODE_PORT || 7777;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// APIS
app.get("/healthcheck", function(req, resp, next){
  resp.status(200).send("OK, WebPageReport server is up and running");
});

app.use("/runtest", function(req, resp, next){
  console.log("req receieved in run test");
  let comment = at(req, "body.comment.content.raw");
  console.log("Comment is ", comment);
  if (comment && typeof comment == "string" && comment.toLowerCase() === "run test") {
    console.log("Correct comment - starting test");
    wpt.startTesting();
  } else {
    console.log("InCorrect comment - NOT starting test");
  } 
  resp.status(200).send("OK, WebPageTest is started");
});


// start the server
let server = app.listen(nodePort, () => {
  console.info("Server started at ", nodePort);
});

server.on("error", function(err) {
  console.error(
    "Server start failed: %s port: %s, env: %s, version: %s",
    err,
    nodePort,
    app.get("env"),
    process.version
  );
  process.exit(1);
});

process.on("uncaughtException", function(err) {
  console.error("[ERROR] Caught exception: " + err);
});

process.on("SIGTERM", function() {
  console.error(
    "Process termination request received. Stoping taking new requests."
  );
  server.close(function(err) {
    console.log("Finished all pending requests. Terminating now.");
    process.exit(0);
  });
});