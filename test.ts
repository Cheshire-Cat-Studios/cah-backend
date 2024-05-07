// import User from './models/User.js'
//
// await new User().create({
//     'uuid': 2,
//     'name': 2,
// })afaf
// //
//
// console.log(123)
// import {AppServiceProvider} from '@cheshire-cat-studios/jester'
//

import fs from 'fs'
import {createClient} from 'redis'
import {EnvService} from '@cheshire-cat-studios/jester'

const a = await (await createClient({
    socket: {
        port: 6380,
        host: 'redis',
        tls: false,
        cert: undefined
    },
    // username: EnvService.getValue('REDIS_USERNAME'),
    // password: EnvService.getValue('REDIS_PASSWORD'),
}))
    .connect()

console.log(123)

console.log(12345)
