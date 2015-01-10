/**
 * This small webdav client is meant to replace the dependency from curl
 * 
 * Example usage:
 *
 *    var client = require("./client.js");
 *    client.put("./path/to/file", "http://foo.bar/path/to/file", function (err) {
 *      if (err) { return console.log(err); }
 *      console.log("done");
 *    });
 *
 */

var http = require("http"),
  fs = require("fs"),
  url = require("url");

function webDavRequest(verb, destination, file, callback) {
  var request;

  verb = verb || "PUT";

  request = http.request({
    host: destination.hostname,
    port: destination.port,
    method: verb,
    path: destination.path,
    headers: file ? {
      "Content-Length": file.length
    } : {}
  });

  request.on("response", function (res) {
    if (res.statusCode !== 201 && res.statusCode !== 204) {
      res.on("end", function () {
        callback(new Error("HTTP " + verb + " failed with code " + res.statusCode + " for " + JSON.stringify(destination)));
      });
    } else {
      res.on("end", callback);
    }

    // suck stream in
    res.resume();
  });

  request.on("error", function (error) {
    callback(error);
  });

  if (file) {
    file.pipe(request);
  } else {
    request.end();
  }
}

module.exports = {
  // Expose webdav verbs
  put: function (local_file, remote_location, callback) {
    fs.readFile(local_file, function (err, data) {
      if (err) { return callback(err); }
      webDavRequest("PUT", url.parse(remote_location), data, callback);
    });
  }
};