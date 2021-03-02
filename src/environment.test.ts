import { Space, EnvironmentAlias, EnvironmentAliasProps, Collection, BasicMetaSysProps, SysLink } from 'contentful-management/dist/typings/export-types'

import * as environment from './environment'
import * as contentful from './contentful'

describe('Environment', () => {

    const envSaved = { ...process.env }

    beforeEach(() => {
        jest.spyOn(contentful, 'getSpace').mockResolvedValue({
            ...{} as Space,
            getEnvironmentAliases: async () => ({
                ...{} as Collection<EnvironmentAlias, EnvironmentAliasProps>,
                items: [{
                    ...{} as EnvironmentAlias,
                    sys: {
                        ...{} as BasicMetaSysProps & { space: SysLink },
                        id: 'master'
                    }
                }]
            })
        })
    })

    afterEach(() => {
        process.env = { ...envSaved }
    })

    describe('getNewEnvironmentName', () => {
        it('should throw an error if ENVIRONMENT is not defined', () => {
            expect.assertions(1);
            return environment.getNewEnvironmentName().catch(e => expect(e).toEqual(new Error('The environment variable "ENVIRONMENT" is missing')))
        })

        it('should append date and time if the environment is an alias', async () => {
            process.env.ENVIRONMENT = 'master'
            Date.now = jest.fn(() => 1614451488353);
            expect(await environment.getNewEnvironmentName()).toEqual('master-2021.02-27-18.44.48')
        })

        it('should not append date and time if the environment is not an alias', async () => {
            process.env.ENVIRONMENT = 'test-env'
            Date.now = jest.fn(() => 1614451488353);
            expect(await environment.getNewEnvironmentName()).toEqual('test-env')
        })
    })
})
