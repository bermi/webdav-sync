/*
 webdav_sync.js
 * This is where the business happens.

Fixes and Features
 * Status indicators on commands. (Yellow circle for ongoing, Green disc for completed, red square for error)
 * quote wraps to fix bug with files having space characters in their names
 * Check connection of --remote_base at startup, saves a lot of hassle and initial confusion.
 *
 * TODO:
 * -interactive 'Clean All' command to force wipe & re-push all files.
 *
 * KNOWN ISSUE:
 * -(Side-effect) Because of the odd text mode we use to draw the status circle/squares, this can cause a console to go into a weird mode if we force-break out of it
 */

var reqStack = {}; //object of ongoing queue of active requests, pop on complete/error
// Will ultimately be formatted like: reqStack[request, lineNum]
var currLine = 0; //rolling iterator of how many lines have been printed

var __indexOf = [].indexOf || function (item) {
    var i, l;
    for (i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item){
        return i;
      }
    }
    return -1;
  };

var exec, util, colors, fs, watch; //libraries
watch = require("watch");
fs = require("fs");
colors = require("colors");
util = require("util");
exec = require("child_process").exec;

module.exports = function (options) {
  var changed, created, removed, ignoreFile, processed, run, _runCommand;
  if (options === null) {
    options = {};
  }
  processed = {}; //Object of the History of processed execs in the format of "d"+theCommand+mtime of file

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
    //PRINT: disable line break, then the CIRCLE then message

    //util.puts('\033[?7l'+"○ ".yellow + message);
    console.log('\033[?7l'+"○ ".yellow + message); //TESTING

    reqStack[command]=currLine;//push this command with currLine in
    currLine++;//then go on...(?)

    return _runCommand(command, function(err, success) {

      moveUpRows = currLine - reqStack[command];
      var goBackStr = new Array(moveUpRows+1).join("\n");

      if (err) {
        //RED SQUARE
        console.log('\033[' + moveUpRows + 'A\r' + "■".red + goBackStr);
        currLine++;
        return console.log(err.red); //print the full curl error (does this throw off the currLine count?)
      }else{
        //GREEN DOT
        console.log('\033[' + moveUpRows + 'A\r' + "●".green + goBackStr);
      }
    });
  };

  _runCommand = function(command, callback) {
    if(options.verbose){
      currLine++;
      console.log((new Date()).toString().underline);
      currLine++;
      console.log(command.yellow);
    }

    return exec(command, function(error, stdout, stderr){
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
    //BUG: this is firing twice?
    var command, destination, message, rel_path, _ref;

    //check if we've tried this filechange already...
    if (!stats || (_ref = "w" + path + stats.mtime, __indexOf.call(processed, _ref) >= 0)) {
      return;
    }

    processed["w" + path + stats.mtime] = currLine;
    rel_path = path.replace(options.local_base, "");
    destination = options.remote_base + rel_path;

    //ignore it?
    if (ignoreFile(rel_path)) {
      return;
    }
    if (stats.isFile()) {
      command = options.curl + ' -T "' + path + '" "' + destination + '" ';
    } else {
      if (stats.isDirectory()) {
        command = options.curl + ' -X MKCOL "' + destination + '" ';
      }
    }
    if (command != null) {
      message = "[created] ".bold.green + rel_path.green;
      return run(command, message);
    }
  };

  changed = function(path, stats) {
    var command, destination, message, rel_path, _ref;

    //check to see if we've tried to send this yet...
    if (!stats || (_ref = "w" + path + stats.mtime, __indexOf.call(processed, _ref) >= 0)) {
      //util.puts("huh");
      return;
    }

    processed["m" + path + stats.mtime] = currLine; //remember that we modified path at mtime...

    rel_path = path.replace(options.local_base, "");
    destination = options.remote_base + rel_path;
    if (ignoreFile(rel_path)) {
      return;
    }

    //BEN: does this NOT work on folder modifications?
    if (stats.isFile()) {
      command = options.curl + ' -T "' + path + '" ' + destination;
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

    processed["d" + path + stats.mtime]=currLine;

    rel_path = path.replace(options.local_base, "");
    destination = options.remote_base + rel_path;
    if (ignoreFile(rel_path)) {
      return;
    }
    command = options.curl + ' -X DELETE "' + destination + '" ';
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
      //disable console line wrap (necessary for status icons)
      console.log('\033[0m\r');//reset any funny text modes
      console.log('\033[?7h\r');//enable line-break
      currLine++;

      //STARTUP!
      console.log("STARTING".bold.underline + " \nwebdav-sync from " + options.local_base.green + " \nto " + options.remote_base.yellow);

      //first check to see if we can even get into options.remote_base
      var command;

      if(options.username != null){
        //user has passed in user/pass, so we're rigging options.curl with that always
        options.curl += " -u " + options.username + ":" + options.password;
        //console.log(options.curl);
      }
      command = options.curl + " " + options.remote_base;

      //testing the connection when we start!
      message="[CONNECTION TEST]".bold;
      run(command, message);

      //rig the watch events to local_base
      return watch.createMonitor(options.local_base, options.monitor, function(monitor) {
        monitor.on("created", created);
        monitor.on("changed", changed);
        return monitor.on("removed", removed); //why do we return on this?
      });
    }
  };
};
