import pEachSeries from 'p-each-series'
import { Environment } from 'contentful-management/dist/typings/export-types';
import { RunMigrationConfig, runMigration as contentfulRunMigration } from 'contentful-migration';
import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { getVersion, updateVersion } from './versioning';

type RunMigration = (options: RunMigrationConfig) => Promise<any>

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

const runMigration: RunMigration = ({
    accessToken = process.env.CONTENT_MANAGEMENT_TOKEN,
    spaceId = process.env.SPACE_ID,
    yes = true,
    ...options
}) => contentfulRunMigration({ ...options, accessToken, spaceId, yes })

export const run = async (environment: Environment, migrationFolder: string): Promise<boolean> => {
    const migrationList = await getMigrationList(environment, migrationFolder)

    if (migrationList.length <= 0) {
        return false
    }

    const keywords: RunMigrationConfig[] = migrationList.map(migration => ({
        filePath: migration.filePath,
        environmentId: environment.sys.id
    }))

    await pEachSeries(keywords, runMigration)

    const { version } = migrationList.pop() as MigrationFile

    await updateVersion(environment, version)

    return true
}
