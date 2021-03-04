import { Space, EnvironmentAlias, EnvironmentAliasProps, Collection, BasicMetaSysProps, SysLink } from 'contentful-management/dist/typings/export-types'

import * as environment from './environment'
import * as contentful from './contentful'

describe('Environment', () => {

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

    describe('getNewEnvironmentId', () => {
        it('should append date and time if the environment is an alias', async () => {
            Date.now = jest.fn(() => 1614451488353);
            expect(await environment.getNewEnvironmentId('master')).toEqual('master-2021.02-27-18.44.48')
        })

        it('should not append date and time if the environment is not an alias', async () => {
            expect(await environment.getNewEnvironmentId('test-env')).toEqual('test-env')
        })
    })
})
