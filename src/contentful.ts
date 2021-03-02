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

export const resolveEnvironment = async (environment: Environment | string): Promise<Environment> => {
    const space = await getSpace()

    if (typeof environment === 'string') {
        environment = await space.getEnvironment(environment)
    }

    return environment
}

export const hasContentType = (environment: Environment, contentTypeId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        environment.getContentType(contentTypeId)
            .then(() => resolve(true))
            .catch(() => resolve(false))
    })
}

export const getDefaultLocale = async (environment: Environment | string): Promise<string> => {
    environment = await resolveEnvironment(environment)

    const defaultLocale = (await environment.getLocales()).items.find(locale => locale.default)?.code;

    if (!defaultLocale) {
        throw new Error('default locale is not set!');
    }

    return defaultLocale
}