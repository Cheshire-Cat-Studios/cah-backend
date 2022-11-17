# Read me
## Installation
This project has been dockerised, in order to start a local docker instance of this project run ``docker-compose up``
On initial start up and for testing purposes you will want to initialise/reset the database and redis data you can do this using the below commands 
- to reset/initialise the database run ``docker exec cah-backend_node_1 migrate --fresh``
- to reset the redis store run ``docker exec cah-backend_redis_1 redis-cli flushall``
- to run both (unix)  ``docker exec cah-backend_redis_1 redis-cli flushall && docker exec cah-backend_node_1 node cah-backend migrate --fresh``
- to run both (bash)  ``(docker exec cah-backend_redis_1 redis-cli flushall) -and (docker exec cah-backend_node_1 node cah-backend migrate --fresh)``

#Typescript
This project includes typescript classes, to compile ts files into js ones, run ``npx tsc --declaration``

##Testing
This project makes use of jest (using the jasmine test runner) and eventually will incorporate cypress test as well. Most tests will require a connection to either mysql or redis to be configured.
The tests which use mysql and redis will also clear all stored data as part of the test preparation so **DO NOT RUN TESTS WITH PROD MYSQL/REDIS DETAILS** 
- To run all tests ``vitest run --no-threads``
- To run a specific test (replace the file path with the test you wish to run) ``jest --runInBand --detectOpenHandles tests/tests/listeners/leave.test.js``

## Running commands
This project includes its own node.js based cli, if you wish to edit or view the existing commands or add/remove commands see ``./commands/``. All commands can be run using ``docker exec cah-backend_node_1 node cah-backend ${command-name}``