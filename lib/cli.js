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
  username: {
    description: 'username for secure login',
    required: false
  },
  password: {
    description: 'password for secure login',
    required: false
  },
  curl: {
    description: 'Default curl command',
    "default": 'curl --insecure -s -S' // --verbose   OR -s -S 
    //--insecure flag allows for more leniant acceptance of weak SSL certs (Demandware's are usually faulty)
    //-s is for silent mode, curl typically has these progress bars n junk...
    //-S will force the showing of errors in communication, so if something goes wrong we print straight to user
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
