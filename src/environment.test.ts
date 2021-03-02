import { Space, EnvironmentAlias, EnvironmentAliasProps, Collection, BasicMetaSysProps, SysLink } from 'contentful-management/dist/typings/export-types'

import * as environment from './environment'
import * as contentful from './contentful'

describe('Environment', () => {

    beforeEach(() => {
        process.env = Object.assign(process.env, {
            CONTENT_MANAGEMENT_TOKEN: 'management token',
            SPACE_ID: 'space id',
            ENVIRONMENT: 'master'
        });

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

    it('getNewEnvironmentName', async () => {
        Date.now = jest.fn(() => 1614451488353);
        expect(await environment.getNewEnvironmentName()).toEqual('master-2021.02-27-18.44.48')
    })
})
