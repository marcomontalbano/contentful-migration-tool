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
    migration: MigrationItem
    config: RunMigrationConfig
}

type RunMigration = (options: RunMigrationOptions) => Promise<any>

type MigrationItem = {
    version: number
    name: string
    filePath: string
}

const getMigrationItems = async (migrationFolder: string): Promise<MigrationItem[]> => {

    if (!existsSync(migrationFolder)) {
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
        }, [] as MigrationItem[])
}

const throwWhenErrors = (migrationItems: MigrationItem[]): void => {
    const versions = migrationItems.map(migrationFile => migrationFile.version)

    const duplicates = versions.filter((version, index, array) => array.indexOf(version) !== index)

    if (duplicates.length > 0) {
        throw new Error(`Found duplicated version numbers: ${duplicates.map(v => `"${v}"`).join(', ')}`)
    }

    const missings = Array.from({ length: Math.max(...versions) }, (_, i) => !versions.includes(i + 1) ? i + 1 : false).filter(Boolean)

    if (missings.length > 0) {
        throw new Error(`Found missing version numbers: ${missings.map(v => `"${v}"`).join(', ')}`)
    }
}

const runMigration: RunMigration = ({ config }) => contentfulRunMigration({ ...config })

export const run = async ({ environment, accessToken, spaceId }: ContentfulOptions, migrationFolder: string): Promise<boolean> => {
    const migrationItems = await getMigrationItems(migrationFolder)

    throwWhenErrors(migrationItems)

    const currentVersion = await getVersion(environment)
    const newestMigrationItems = migrationItems.filter(migration => migration.version > currentVersion)

    if (newestMigrationItems.length <= 0) {
        return false
    }

    const iterable: RunMigrationOptions[] = newestMigrationItems.map(migration => ({
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
