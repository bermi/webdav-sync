/*
 webdav_sync.js
 * This is where the business happens.
 * 
 * TODO: 
 * -report on success/fail of curl command (errors are incomplete), need a "Could not resolve" or something
 * -Check health of --remote_base at startup, can we connect successfully
 */
var colors, exec, fs, util, watch;
var __indexOf = [].indexOf || function (item) {
    for (var i = 0, l = this.length; i < l; i++) { 
      if (i in this && this[i] === item) 
        return i; 
      } 
      return -1; 
  };

watch = require("watch");
fs = require("fs");
colors = require("colors");
util = require("util");
exec = require("child_process").exec;

module.exports = function(options) {
  var changed, created, ignoreFile, processed, removed, run, _runCommand;
  if (options == null) { 
    options = {};
  }
  processed = [];

  options.monitor || (options.monitor = {
    ignoreDotFiles: true
  });
  if (!options.remote_base) {
    throw new Error("remote_base can't be ommited");
  }
  if (!options.local_base) {
    throw new Error("local_base can't be ommited");
  }
  run = function(command, message) {
    //show this first
    util.print(message+" ");
    
    return _runCommand(command, function(err, success) {

      if (err) {
        //util.print("■".red);
        util.print('\n');
        return util.puts(err.red);
      }else{ 
        //GREEN DOT 
        //util.print("●".green);
        util.print('\n'); 
      }
    });
  };
  _runCommand = function(command, callback) {
    
    if(options.verbose){
      util.puts((new Date()).toString().underline);
      util.puts(command.yellow);
    }

    return exec(command, function(error, stdout, stderr) {
      //BEN: need to get more out of curl about failed attempts to connect!
      if (!stderr) {
        return callback(null, true);
      } 
      else { //we've got an error!   
        //Ben: we do not util.error() here... should we allow for that with another --option?
        return callback(stderr.trim().red, false);
      }
    });
  };
  created = function(path, stats) {
    var command, destination, message, rel_path, _ref;
    if (!stats || (_ref = "w" + path + stats.mtime, __indexOf.call(processed, _ref) >= 0)) {
      return;
    }
    processed.push("w" + path + stats.mtime);
    rel_path = path.replace(options.local_base, "");
    destination = options.remote_base + rel_path;

    if (ignoreFile(rel_path)) {
      return;
    }
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
    
    if (!stats || (_ref = "w" + path + stats.mtime, __indexOf.call(processed, _ref) >= 0)) {
      util.puts("huh");
      return;
    }
    processed.push("m" + path + stats.mtime);
    if (stats.atime > stats.mtime) {
      //util.puts("atime > mtime");
      //return; //Ben: not sure why we would want this...
    }
    rel_path = path.replace(options.local_base, "");
    destination = options.remote_base + rel_path;
    if (ignoreFile(rel_path)) {
      return;
    }

    //BEN: does this NOT work on folder modifications? 
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
    if (!stats || (_ref = "d" + path + stats.mtime, __indexOf.call(processed, _ref) >= 0)) {
      return;
    }
    processed.push("d" + path + stats.mtime);
    rel_path = path.replace(options.local_base, "");
    destination = options.remote_base + rel_path;
    if (ignoreFile(rel_path)) {
      return;
    }
    command = "" + options.curl + " -X DELETE " + destination;
    if (command != null) {
      message = "[removed] ".bold + rel_path.red;
      return run(command, message);
    }
  };
  //Utility for checking if a file is in our comma-delimited list to "--ignore" 
  ignoreFile = function(path) {
    return __indexOf.call(options.ignored, path) >= 0;
  };


  return {
    start: function() {

      util.puts("STARTING".bold.underline + " webdav-sync from " + options.local_base.green + " to " + options.remote_base.yellow);
      return watch.createMonitor(options.local_base, options.monitor, function(monitor) {
        monitor.on("created", created);
        monitor.on("changed", changed);
        return monitor.on("removed", removed);
      });
    }
  };
};
