import { createClient } from 'contentful-management'
import { Environment, Space } from 'contentful-management/dist/typings/export-types'

let space: Space | undefined

export const getSpace = async (): Promise<Space> => {

    if (space) {
        return space
    }

    const { CONTENT_MANAGEMENT_TOKEN, SPACE_ID } = process.env

    if (!CONTENT_MANAGEMENT_TOKEN) {
        throw new Error('The environment variable "CONTENT_MANAGEMENT_TOKEN" is missing')
    }

    if (!SPACE_ID) {
        throw new Error('The environment variable "SPACE_ID" is missing')
    }

    const client = createClient({
        accessToken: CONTENT_MANAGEMENT_TOKEN
    })

    return space = await client.getSpace(SPACE_ID)
}

export const resolveWhenEnvironmentIsReady = async (environment: Environment): Promise<Environment> => {
    const DELAY = 3000;
    const MAX_NUMBER_OF_TRIES = 10;
    let count = 0;

    const space = await getSpace()

    while (count < MAX_NUMBER_OF_TRIES) {
        const status = (await space.getEnvironment(environment.sys.id)).sys.status.sys.id as 'ready' | 'failed';

        if (status === 'ready') {
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

export const getEnvironment = async (environmentId: string): Promise<Environment | undefined> => {
    const space = await getSpace()
    const environments = await space.getEnvironments()

    return environments.items.find(environment => environment.sys.id === environmentId)
}

export const hasContentType = (environment: Environment, contentTypeId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        environment.getContentType(contentTypeId)
            .then(() => resolve(true))
            .catch(() => resolve(false))
    })
}

export const getDefaultLocale = async (environment: Environment): Promise<string> => {
    const defaultLocale = (await environment.getLocales()).items.find(locale => locale.default)?.code;

    if (!defaultLocale) {
        throw new Error('Default locale is not set!');
    }

    return defaultLocale
}