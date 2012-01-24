
module.exports.version = '0.2.2';

module.exports.__defineGetter__('webdav_sync', function() {
  return this._webdav - sync || (sync = require('./webdav_sync'));
});
