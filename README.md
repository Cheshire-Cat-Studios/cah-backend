# Read me
## Installation
This projcet has been docker-ised, in order to start a local docker instance of this project run ``docker-compose up``
On initial start up and for testing purposes you will want to initialise/reset the database and redis data you can do this using the below commands 
- to reset/initialise the database run ``docker exec jester_node_1 migrate --fresh``
- to reset the redis store run ``docker exec jester_redis_1 redis-cli flushall``
- to run both (unix)  ``docker exec jester_redis_1 redis-cli flushall && docker exec jester_node_1 node jester migrate --fresh``
- to run both (bash)  ``(docker exec jester_redis_1 redis-cli flushall) -and (docker exec jester_node_1 node jester migrate --fresh)``

##Testing
This project makes use of jest (using the jasmine test runner) and eventually will incorporate cypress test as well.
- To run all tests ``jest --runInBand --detectOpenHandles --testPathPattern=tests/tests`` whilst you have a *dev* connection to mysql/redis configured
- To run a specific test (replace the file path with the test you wish to run) ``jest --runInBand --detectOpenHandles tests/tests/listeners/leave.test.js``

## Running commands
This project includes its own node.js based cli, if you wish to edit or view the existing commands or add/remove commands see ``./commands/``. All commands can be run using ``docker exec jester_node_1 node jester ${command-name}``  