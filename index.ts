import { run } from './src/migration'
import { setup } from './src/versioning'

import { createEnvironment } from "./src/environment";

(async function() {

    const { ENVIRONMENT_ID } = process.env;

    if (ENVIRONMENT_ID === undefined) {
        throw new Error('The environment variable "ENVIRONMENT_ID" is missing')
    }

    createEnvironment(ENVIRONMENT_ID).then(async (env) => {
        await setup(env)
        await run(env)
    })

}()).catch((error) => {
    console.error(error)
})
