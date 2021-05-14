import { run } from './src/migration'
import { setup } from './src/versioning'

import { getEnvironment } from './src/contentful';
import { resolve } from 'path';

(async function() {

    const { ENVIRONMENT_ID } = process.env;

    if (ENVIRONMENT_ID === undefined) {
        throw new Error('The environment variable "ENVIRONMENT_ID" is missing')
    }

    const environment = await getEnvironment(ENVIRONMENT_ID)

    if (environment === undefined) {
        throw new Error(`Environment ${ENVIRONMENT_ID} not found`)
    }

    await setup(environment)
    await run(environment, resolve(__dirname, 'migrations'))

}()).catch((error) => {
    console.error(error)
})
