import { run } from './src/migration'
import { setup } from './src/versioning'

(async function() {
    const { ENVIRONMENT } = process.env;

    if (ENVIRONMENT === undefined) {
        throw new Error('The environment variable "ENVIRONMENT" is missing')
    }

    await setup(ENVIRONMENT)
    await run(ENVIRONMENT)
}()).catch((error) => {
    console.error(error)
})
