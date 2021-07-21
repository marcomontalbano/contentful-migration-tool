import { Environment } from 'contentful-management/dist/typings/export-types'
import { getEnvironment, getSpace, hasContentType, resolveWhenEnvironmentIsReady } from '../src/contentful'
import { getVersion, setup, updateVersion } from '../src/versioning'
import { ContentfulOptions, run } from '../src/migration'
import { resolve } from 'path'

jest.setTimeout(60 * 1000);

const createEnvironment = async (environmentId: string): Promise<Environment> => {
    const space = await getSpace()

    const environment = await space.createEnvironmentWithId(environmentId, { name: environmentId })

    return await resolveWhenEnvironmentIsReady(environment)
}

const { CONTENT_MANAGEMENT_TOKEN, SPACE_ID } = process.env

if (CONTENT_MANAGEMENT_TOKEN === undefined) {
    throw new Error('The environment variable "CONTENT_MANAGEMENT_TOKEN" is missing')
}

if (SPACE_ID === undefined) {
    throw new Error('The environment variable "SPACE_ID" is missing')
}

describe('Contentful Migration', () => {

    let environment: Environment
    let environmentId: string
    let contentfulOptions: ContentfulOptions

    beforeEach(async () => {
        environmentId = `test-${ Date.now() }-${ Math.random() }`
        environment = await createEnvironment(environmentId)
        contentfulOptions = {
            accessToken: CONTENT_MANAGEMENT_TOKEN,
            spaceId: SPACE_ID,
            environment
        }
    })

    afterEach(async () => {
        await environment.delete()
    })

    describe('Versioning', () => {
        it('should fail to get the current version if versioning is not set up', () => {
            expect(getVersion(environment)).rejects.toThrowError()
        })

        it('should be able to setup the versioning on an environment', async () => {
            await setup(environment)
            expect(await getVersion(environment)).toEqual(0)
        })

        it('should be able to update the version', async () => {
            await setup(environment)
            await updateVersion(environment, 9)
            expect(await getVersion(environment)).toEqual(9)
        })
    })

    describe('Contentful', () => {
        it('getEnvironment should return the Environment from contentful given an environment id', async () => {
            expect((await getEnvironment(environmentId))?.sys?.id).toEqual(environmentId)
        })

        it(`getEnvironment should return undefined if the provided environment id doesn't exist`, async () => {
            expect(await getEnvironment('unexisting-environment')).toBe(undefined)
        })

        it(`hasContentType should return true if provided contentTypeId has been found`, async () => {
            await setup(environment)
            expect(await hasContentType(environment, 'versionTracking')).toBeTruthy()
        })
    })

    describe('Migration', () => {
        it('should run typescript migrations serially', async () => {
            await setup(environment);

            expect(
                await run(contentfulOptions, resolve(__dirname, '..', '__mocks__', 'migrations', 'serially-ts'))
            ).toBeTruthy()

            expect(await hasContentType(environment, 'author')).toBeTruthy();

            const { fields } = (await environment.getContentType('author'));
            const [ nameField ] = fields

            expect(fields.length).toEqual(1);

            expect(nameField?.name).toEqual('Name');
            expect(nameField?.required).toBeTruthy();
        })

        it('should run javascript migrations serially', async () => {
            await setup(environment);

            expect(
                await run(contentfulOptions, resolve(__dirname, '..', '__mocks__', 'migrations', 'serially-js'))
            ).toBeTruthy()

            expect(await hasContentType(environment, 'blog')).toBeTruthy();

            const { fields } = (await environment.getContentType('blog'));
            const [ nameField ] = fields

            expect(fields.length).toEqual(1);

            expect(nameField?.name).toEqual('Title');
            expect(nameField?.required).toBeFalsy();
        })

        it('should not run anything if there are no migrations', async () => {
            await setup(environment);

            expect(
                await run(contentfulOptions, resolve(__dirname, '..', '__mocks__', 'migrations', 'empty-folder'))
            ).toBeFalsy()
        })

        it('should throw an error if the folder does not exist', async () => {
            await setup(environment);

            return expect(
                run(contentfulOptions, resolve(__dirname, '..', '__mocks__', 'migrations', 'unexisting-folder'))
            ).rejects.toThrowError('"migrations" folder is missing')
        })
    })
})
