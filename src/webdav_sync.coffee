watch = require("watch")
fs = require("fs")
colors = require("colors")
util = require("util")
exec = require("child_process").exec


# TODO Use nodejs native requests and to remove curl dependency

module.exports = (options={}) ->
  
  processed = []
  
  options.curl or= "curl --insecure --verbose"
  options.ignored or= [ ".hg", ".git", ".DS_Store", ".svn" ]
  options.monitor or= ignoreDotFiles: true
  
  throw new Error("remote_base can't be ommited")  unless options.remote_base
  throw new Error("local_base can't be ommited")  unless options.local_base

  run = (command, message) ->
    _runCommand command, (err, success) ->
      if err
        util.puts err.red
      else
        util.puts message

  _runCommand = (command, callback) ->
    exec command, (error, stdout, stderr) ->
      if stdout == ""
        callback null, true
      else
        callback "ERROR with [cmd] ".red + " #{command.grey} #{stdout}", false

  created = (path, stats) ->
    return  if !stats || "w#{path}#{stats.mtime}" in processed
    processed.push "w#{path}#{stats.mtime}"
    rel_path = path.replace(options.local_base, "")
    destination = options.remote_base + rel_path
    return  if ignoreFile(rel_path)
    if stats.isFile()
      command = "#{options.curl} -T #{path} #{destination}"
    else command = "#{options.curl} -X MKCOL #{destination}"  if stats.isDirectory()
    if command?
      message = "[created] ".bold.green + rel_path.green
      run command, message

  changed = (path, stats) ->
    return  if !stats || "w#{path}#{stats.mtime}" in processed
    processed.push "m#{path}#{stats.mtime}"
    return  if stats.atime > stats.mtime
    rel_path = path.replace(options.local_base, "")
    destination = options.remote_base + rel_path
    return  if ignoreFile(rel_path)
    command = "#{options.curl} -T #{path} #{destination}"  if stats.isFile()
    if command?
      message = "[changed] ".bold.cyan + rel_path.cyan
      run command, message

  removed = (path, stats) ->
    return  if !stats || "d#{path}#{stats.mtime}" in processed
    processed.push "d#{path}#{stats.mtime}"
    rel_path = path.replace(options.local_base, "")
    destination = options.remote_base + rel_path
    return  if ignoreFile(rel_path)
    command = "#{options.curl} -X DELETE #{destination}"
    if command?
      message = "[removed] ".bold + rel_path.red
      run command, message

  ignoreFile = (path) ->
    path in options.ignored
  
  start: ->
    util.puts "Starting webdav-sync from #{options.local_base.green} to #{options.remote_base.yellow}"
    watch.createMonitor options.local_base, options.monitor, (monitor) ->
      monitor.on "created", created
      monitor.on "changed", changed
      monitor.on "removed", removed

