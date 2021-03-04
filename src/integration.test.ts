import { Environment } from 'contentful-management/dist/typings/export-types'
import { getEnvironment, getSpace, hasContentType, resolveWhenEnvironmentIsReady } from './contentful'
import { getVersion, setup, updateVersion } from './versioning'

jest.setTimeout(60 * 1000);

const createEnvironment = async (environmentId: string): Promise<Environment> => {
    const space = await getSpace()

    const environment = await space.createEnvironmentWithId(environmentId, { name: environmentId })

    return await resolveWhenEnvironmentIsReady(environment)
}

describe('Contentful Migration', () => {

    let environment: Environment
    let environmentId: string

    beforeEach(async () => {
        environmentId = `test-${ Date.now() }`
        environment = await createEnvironment(environmentId)
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
})
