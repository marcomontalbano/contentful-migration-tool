import { Environment } from 'contentful-management/dist/typings/export-types'
import { getSpace, hasEnvironment } from './contentful'
import { getStringDate } from './utils'

const getEnvironmentAliases = async (): Promise<string[]> => {
    const space = await getSpace()
    const environmentAliases = await space.getEnvironmentAliases()

    return environmentAliases.items.map(environmentAlias => environmentAlias.sys.id)
}

const isEnvironmentAlias = async (environmentId: string): Promise<boolean> => {
    const environmentAliases = await getEnvironmentAliases()
    return environmentAliases.includes(environmentId);
}

export const getNewEnvironmentId = async (environmentId: string): Promise<string> => {

    if (await isEnvironmentAlias(environmentId)) {
        return `${environmentId}-${getStringDate()}`
    }

    return environmentId
}

const resolveWhenEnvironmentIsReady = async (environment: Environment): Promise<Environment> => {
    const DELAY = 3000;
    const MAX_NUMBER_OF_TRIES = 10;
    let count = 0;

    const space = await getSpace()

    console.log('Waiting for environment processing ...');

    while (count < MAX_NUMBER_OF_TRIES) {
        const status = (await space.getEnvironment(environment.sys.id)).sys.status.sys.id as 'ready' | 'failed';

        if (status === 'ready') {
            console.log(`Successfully processed new environment (${environment.sys.id})`)
            return environment
        }

        if (status === 'failed') {
            throw new Error('Environment creation failed')
        }

        await new Promise((resolve) => setTimeout(resolve, DELAY))
        count++;
    }

    throw new Error('Environment creation timeout')
}

export const createEnvironment = async (environmentId: string): Promise<Environment> => {
    const space = await getSpace()
    const isAlias = await isEnvironmentAlias(environmentId)
    const existingEnvironment = await hasEnvironment(environmentId)

    if (isAlias === false && existingEnvironment) {
        return existingEnvironment
    }

    const newEnvironmentId = isAlias ? await getNewEnvironmentId(environmentId) : environmentId

    const newEnvironment = await space.createEnvironmentWithId(newEnvironmentId, {
        name: newEnvironmentId,
    })

    return resolveWhenEnvironmentIsReady(newEnvironment)
}