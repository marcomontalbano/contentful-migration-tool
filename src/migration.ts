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

const throwWhenErrors = (migrationFiles: MigrationFile[]): void => {
    const versions = migrationFiles.map(migrationFile => migrationFile.version)

    const duplicates = versions.filter((version, index, array) => array.indexOf(version) !== index)

    if (duplicates.length > 0) {
        throw new Error(`Found duplicated version numbers: ${duplicates.map(v => `"${v}"`).join(', ')}`)
    }

    const missings = Array.from({ length: Math.max(...versions) }, (_, x) => !versions.includes(x + 1) ? x + 1 : false).filter(Boolean)

    if (missings.length > 0) {
        throw new Error(`Found missing version numbers: ${missings.map(v => `"${v}"`).join(', ')}`)
    }
}

const runMigration: RunMigration = ({ config }) => contentfulRunMigration({ ...config })

export const run = async ({ environment, accessToken, spaceId }: ContentfulOptions, migrationFolder: string): Promise<boolean> => {
    const migrationList = await getMigrationList(environment, migrationFolder)

    if (migrationList.length <= 0) {
        return false
    }

    throwWhenErrors(migrationList)

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
