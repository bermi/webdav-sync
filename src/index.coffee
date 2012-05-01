## webdav-sync
# 
# Basic local sync to WebDAV servers
#
# Copyright(c) 2011 Bermi Ferrer <bermi@bermilabs.com>
#
# MIT Licensed

module.exports = require './webdav_sync'

# Load package information using `pkginfo`.
require('pkginfo')(module, 'version');
