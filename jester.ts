import * as dotenv from 'dotenv'
import minimist from 'minimist'
import {colour} from '@cheshire-cat-studios/jester'
import commands from './config/commands.js'

dotenv.config()

const options = minimist(process.argv.slice(2));

commands[options._[0]]
    ? (
        async () => {

            await (new (commands[options._[0]])(options)).handle()

            process.exit(0)
        }
    )()
    : colour.error(`command: ${options._[0]} does not exist`)