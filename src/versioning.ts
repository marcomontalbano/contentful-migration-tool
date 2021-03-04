import { ContentType, Entry, Environment } from 'contentful-management/dist/typings/export-types'
import { getDefaultLocale, hasContentType } from './contentful';

const contentTypeId = 'versionTracking';

const createContentType = async (environment: Environment): Promise<ContentType> => {
    const contentType = await environment.createContentTypeWithId(contentTypeId, {
        name: 'Version Tracking',
        description: 'Content-Type used to manage Contentful migrations',
        displayField: 'version',
        fields: [
            { id: 'version', name: 'Current Version', required: true, type: 'Symbol', localized: false }
        ]
    })

    return contentType.publish()
}

export const setup = async (environment: Environment): Promise<boolean> => {
    const defaultLocale = await getDefaultLocale(environment)

    if (!await hasContentType(environment, contentTypeId)) {
        await createContentType(environment)

        await (await environment.createEntry(contentTypeId, {
            fields: {
                version: {
                    [ defaultLocale ]: '0'
                }
            }
        })).publish()
    }

    return true;
}

const getVersionEntry = async (environment: Environment): Promise<Entry> => {
    const [ versionEntry ] = (await environment.getEntries({ content_type: contentTypeId, limit: 1 })).items

    if (!versionEntry) {
        throw new Error(`${contentTypeId} does not have an entry`)
    }

    return versionEntry
}

export const getVersion = async (environment: Environment): Promise<number> => {
    const versionEntry = await getVersionEntry(environment)

    const defaultLocale = await getDefaultLocale(environment)

    return parseInt(versionEntry.fields.version[ defaultLocale ])
}

export const updateVersion = async (environment: Environment, newVersion: number)  => {
    const versionEntry = await getVersionEntry(environment)

    const defaultLocale = await getDefaultLocale(environment)

    versionEntry.fields.version[ defaultLocale ] = newVersion.toString(10)
    await (await versionEntry.update()).publish()

    return true
}
