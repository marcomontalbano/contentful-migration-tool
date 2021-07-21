import { pEachSeries } from './utils'
import { Environment } from 'contentful-management/dist/typings/export-types';
import { RunMigrationConfig, runMigration as contentfulRunMigration } from 'contentful-migration';
import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { getVersion, updateVersion } from './versioning';

export type ContentfulOptions = {
    environment: Environment
    accessToken: string
    spaceId: string
}

type RunMigrationOptions = {
    migration: MigrationFile
    config: RunMigrationConfig
}

type RunMigration = (options: RunMigrationOptions) => Promise<any>

type MigrationFile = {
    version: number
    name: string
    filePath: string
}

const getMigrationList = async (environment: Environment, migrationFolder: string): Promise<MigrationFile[]> => {
    const currentVersion = await getVersion(environment)

    if (!existsSync(migrationFolder)) {
        throw new Error('"migrations" folder is missing')
    }

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

    return readdirSync(migrationFolder)
        .sort(collator.compare)
        .reduce((accumulator, filename) => {
            const groups = filename.match(/^(?<version>\d+)-(?<name>.*)\.[ts|js]+$/)?.groups
            const { version, name } = groups || {}

            if (!groups || !version || !name) {
                return accumulator
            }

            return [
                ...accumulator,
                { version: parseInt(version), name, filePath: resolve(migrationFolder, filename) }
            ]
        }, [] as MigrationFile[])
        .filter(migration => migration.version > currentVersion)
}

const runMigration: RunMigration = ({ config }) => contentfulRunMigration({ ...config })

export const run = async ({ environment, accessToken, spaceId }: ContentfulOptions, migrationFolder: string): Promise<boolean> => {
    const migrationList = await getMigrationList(environment, migrationFolder)

    if (migrationList.length <= 0) {
        return false
    }

    const iterable: RunMigrationOptions[] = migrationList.map(migration => ({
        migration,
        config: {
            filePath: migration.filePath,
            environmentId: environment.sys.id,
            yes: true,
            accessToken,
            spaceId,
        }
    }))

    const result = await pEachSeries(iterable, runMigration)

    const { migration: { version = undefined } = {} } = result.iterable.pop() || {}

    if (version !== undefined) {
        await updateVersion(environment, version)
    }

    if (result.error) {
        throw result.error
    }

    return true
}
