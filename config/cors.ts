import * as dotenv from 'dotenv'

//TODO: this is less than ideal, look into workarounds
dotenv.config()

export default {
    //TODO: use env service from jester
    origin: process.env.FRONTEND_URL,
    methods: 'GET,POST'
}