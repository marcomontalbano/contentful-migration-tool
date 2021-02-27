import { createClient } from 'contentful-management'
import { Environment, Space } from 'contentful-management/dist/typings/export-types'

export const getSpace = (() => {
    const client = createClient({
        accessToken: process.env.CONTENT_MANAGEMENT_TOKEN
    })

    const space = client.getSpace(process.env.SPACE_ID)

    return (): Promise<Space> => space
})()

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