# webdav-sync

Sync a local directory with a WebDAV server.

This tool was created because I wanted an alternative method to work
with the Demandware e-commerce platform without requiring their 
IDE UX Studio which uses WebDAV to push the code to the development server.

### Dependencies

This applications requires a local copy of curl.

### Installation

    npm install webdav-sync

### Usage

#### From the command line

Show help:

    webdav-sync -h
    
    Options:
      --remote_base  URL for the remote endpoint            [required]
      --local_base   Path to the local directory            [required]
      --username     Username for secure login              [optional]
      --password     Password for secure login              [optional]
      --curl         Default curl command                   [default: "curl --insecure -s -S"]
      --ignored      Comma separated list of ignored paths  [default: ".hg,.git,.svn,.DS_Store"]
      --verbose      Makes webdav-sync more talkative with complete curl command and timestamp 
      --help, -h     Displays this help
    

Syncing /var/src/code with https://user:pass@demandware.com/webdav/cartridge/

    webdav-sync --local_base /var/src/code --remote_base "https://user:pass@demandware.com/webdav/"


#### From node.js

You can also include webdav-sync into your node app

    var options = {
        local_base: "/var/src/code",
        remote_base: "https://user:pass@demandware.com/webdav/",
        username: "option@lUsern@me",
        password: "option@lP@ssword"
    };
    var sync = (require('webdav-sync'))(options);
    sync.start();


### Development

Simply execute `cake dev` to start continuous compilation. You may also want to run `npm link` so that whenever you call `require('webdav-sync')` it will always point to the current dev version.

### Change log

 - 0.1.1: First release
 - 0.2.4: Upgrading to node 0.6.x
 - 0.3.0: Cleanup and --verbose flag added
 - 0.4.0: Minor update due to change in stdout: File transfer fixes, connection test, transfer status icons
 - 0.4.4: Added options --username & --password as option for secure login (useful for problematic usernames/passwords with special characters...)

### TODO

* Remove curl dependencies
* Add tests

### License 

(The MIT License)

Copyright (c) 2015 Bermi Ferrer &lt;bermi@bermilabs.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.