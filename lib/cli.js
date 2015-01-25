/*
  cli.js
  The rigging for command-line execution.
*/
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
    "default": 'curl --insecure -s -S' // --verbose   OR -s -S 
  },
  ignored: {
    description: 'Comma separated list of ignored paths',
    "default": '.hg,.git,.svn,.DS_Store'
  },
  verbose: {
    description: 'Print more info about WebDAV communications & errors',
    "default": false
  },
  help: {
    description: 'Displays this help'
  }
}).demand(['remote_base', 'local_base']).argv;

this.run = function () {
  if (argv.help) {
    return optimist.showHelp();
  }
  argv.ignored = argv.ignored.split(',');
  return (require('./webdav_sync'))(argv).start();
};
