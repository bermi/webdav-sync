var argv, fs, optimist, path, puts;

fs = require('fs');

path = require('path');

puts = console.log;

optimist = require('optimist');

argv = optimist.usage('Syncs a local path with a remote WebDAV server', {
  remote_base: {
    description: 'URL for the remote endpoint',
    required: true
  },
  local_base: {
    description: 'Path to the local directory',
    required: true
  },
  curl: {
    description: 'Default curl command',
    "default": 'curl --insecure --verbose'
  },
  ignored: {
    description: 'Comma separated list of ignored paths',
    "default": '.hg,.git,.svn,.DS_Store'
  },
  help: {
    description: 'Displays this help'
  }
}).demand(['remote_base', 'local_base']).argv;

this.run = function() {
  var webdav_sync;
  if (argv.help) return optimist.showHelp();
  argv.ignored = argv.ignored.split(',');
  return webdav_sync = (require('./webdav_sync'))(argv).start();
};
