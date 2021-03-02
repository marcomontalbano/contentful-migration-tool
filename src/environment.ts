import { getSpace } from './contentful'
import { getStringDate } from './utils'

const getEnvironmentAliases = async (): Promise<string[]> => {
    const space = await getSpace()
    const environmentAliases = await space.getEnvironmentAliases()

    return environmentAliases.items.map(environmentAlias => environmentAlias.sys.id)
}

export const getNewEnvironmentName = async (): Promise<string> => {
    const { ENVIRONMENT } = process.env

    if (!ENVIRONMENT) {
        throw new Error('The environment variable "ENVIRONMENT" is missing')
    }

    const environmentAliases = await getEnvironmentAliases()

    if (environmentAliases.includes(ENVIRONMENT)) {
        return `${ENVIRONMENT}-${getStringDate()}`
    }

    return ENVIRONMENT
}