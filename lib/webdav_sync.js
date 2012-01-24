var colors, exec, fs, sys, util, watch,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

watch = require("watch");

fs = require("fs");

sys = require("sys");

colors = require("colors");

util = require("util");

exec = require("child_process").exec;

module.exports = function(options) {
  var changed, created, ignoreFile, processed, removed, run, _runCommand;
  if (options == null) options = {};
  processed = [];
  options.curl || (options.curl = "curl --insecure --verbose");
  options.ignored || (options.ignored = [".hg", ".git", ".DS_Store", ".svn"]);
  options.monitor || (options.monitor = {
    ignoreDotFiles: true
  });
  if (!options.remote_base) throw new Error("remote_base can't be ommited");
  if (!options.local_base) throw new Error("local_base can't be ommited");
  run = function(command, message) {
    return _runCommand(command, function(err, success) {
      if (err) {
        return sys.puts(err.red);
      } else {
        return sys.puts(message);
      }
    });
  };
  _runCommand = function(command, callback) {
    return exec(command, function(error, stdout, stderr) {
      if (stdout === "") {
        return callback(null, true);
      } else {
        return callback("ERROR with [cmd] ".red + (" " + command.grey + " " + stdout), false);
      }
    });
  };
  created = function(path, stats) {
    var command, destination, message, rel_path, _ref;
    if (_ref = "w" + path + stats.mtime, __indexOf.call(processed, _ref) >= 0) {
      return;
    }
    processed.push("w" + path + stats.mtime);
    rel_path = path.replace(options.local_base, "");
    destination = options.remote_base + rel_path;
    if (ignoreFile(rel_path)) return;
    if (stats.isFile()) {
      command = "" + options.curl + " -T " + path + " " + destination;
    } else {
      if (stats.isDirectory()) {
        command = "" + options.curl + " -X MKCOL " + destination;
      }
    }
    if (command != null) {
      message = "[created] ".bold.green + rel_path.green;
      return run(command, message);
    }
  };
  changed = function(path, stats) {
    var command, destination, message, rel_path, _ref;
    if (_ref = "m" + path + stats.mtime, __indexOf.call(processed, _ref) >= 0) {
      return;
    }
    processed.push("m" + path + stats.mtime);
    if (stats.atime > stats.mtime) return;
    rel_path = path.replace(options.local_base, "");
    destination = options.remote_base + rel_path;
    if (ignoreFile(rel_path)) return;
    if (stats.isFile()) {
      command = "" + options.curl + " -T " + path + " " + destination;
    }
    if (command != null) {
      message = "[changed] ".bold.cyan + rel_path.cyan;
      return run(command, message);
    }
  };
  removed = function(path, stats) {
    var command, destination, message, rel_path, _ref;
    if (_ref = "d" + path + stats.mtime, __indexOf.call(processed, _ref) >= 0) {
      return;
    }
    processed.push("d" + path + stats.mtime);
    rel_path = path.replace(options.local_base, "");
    destination = options.remote_base + rel_path;
    if (ignoreFile(rel_path)) return;
    if (stats.isFile() || stats.isDirectory()) {
      command = "" + options.curl + " -X DELETE " + destination;
    }
    if (command != null) {
      message = "[removed] ".bold + rel_path.red;
      return run(command, message);
    }
  };
  ignoreFile = function(path) {
    return __indexOf.call(options.ignored, path) >= 0;
  };
  return {
    start: function() {
      sys.puts("Starting webdav-sync from " + options.local_base.green + " to " + options.remote_base.yellow);
      return watch.createMonitor(options.local_base, options.monitor, function(monitor) {
        monitor.on("created", created);
        monitor.on("changed", changed);
        return monitor.on("removed", removed);
      });
    }
  };
};
