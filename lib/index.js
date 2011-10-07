module.exports.version = '0.0.1';
module.exports.__defineGetter__('webdav_sync', function() {
  return this._webdav - sync || (sync = require('./webdav_sync'));
});