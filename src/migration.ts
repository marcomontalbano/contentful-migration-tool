import { Environment } from 'contentful-management/dist/typings/export-types';
import { RunMigrationConfig, runMigration as contentfulRunMigration } from 'contentful-migration';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { getVersion, updateVersion } from './versioning';

type RunMigration = (options: RunMigrationConfig) => Promise<any>

type MigrationFile = {
    version: number
    name: string
    filePath: string
}

const getMigrationList = async (environment: Environment | string): Promise<MigrationFile[]> => {
    const currentVersion = await getVersion(environment)

    const migrationFolder = resolve(__dirname, '..', 'migrations')

    return readdirSync(migrationFolder)
        .reduce((accumulator, filename) => {
            const groups = filename.match(/^(?<version>\d+)-(?<name>.*)\.js$/)?.groups
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
    environmentId = process.env.ENVIRONMENT,
    yes = true,
    ...options
}) => contentfulRunMigration({ ...options, accessToken, spaceId, environmentId, yes })

export const run = async (environment: Environment | string): Promise<boolean> => {
    const migrationList = await getMigrationList(environment)

    if (migrationList.length <= 0) {
        return false
    }

    const migrations: Promise<any>[] = migrationList.map(migration => runMigration({ filePath: migration.filePath }) )

    await Promise.all(migrations)


    const { version } = migrationList.pop() as MigrationFile

    await updateVersion(environment, version)

    return true
}
