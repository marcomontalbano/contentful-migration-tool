import { run } from './src/migration'
import { setup } from './src/versioning'

(async function() {
    await setup('master')
    await run('master')
}())
