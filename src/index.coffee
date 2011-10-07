## webdav-sync
# 
# Basic local sync to WebDAV servers
#
# Copyright(c) 2011 Bermi Ferrer <bermi@bermilabs.com>
#
# MIT Licensed

# Version.
module.exports.version = '0.0.1'

# Exports

module.exports.__defineGetter__ 'webdav_sync', ->
  @_webdav-sync ||= require './webdav_sync'