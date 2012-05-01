{exec, spawn} = require 'child_process'

handleError = (err) ->
  if err
    console.log "\nRemember that you need: coffee-script and vows\n"
    console.log err.stack

print = (data) -> console.log data.toString().trim()

##


task 'build', 'Compile webdav-sync Coffeescript source to Javascript', ->
  exec 'mkdir -p lib && coffee -c -b -o lib src', handleError

task 'clean', 'Remove generated Javascripts', ->
  exec 'rm -fr lib', handleError

task 'doc', 'Generate internal documentation', ->
  exec 'docco src/*.coffee', (err) ->
    throw err if err

task 'dev', 'Continuous compilation', ->
  coffee = spawn 'coffee', '-wc --bare -o lib src'.split(' ')

  coffee.stdout.on 'data', print
  coffee.stderr.on 'data', print
