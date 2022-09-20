import {Migrate} from '@cheshire-cat-studios/jester'

export default async () => {
    await (new Migrate({
        fresh: true,
        noLog: true
    }))
        .handle()
}