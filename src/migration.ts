import { RunMigrationConfig, runMigration as contentfulRunMigration } from 'contentful-migration';

type RunMigration = (options: RunMigrationConfig) => Promise<any>

export const runMigration: RunMigration = ({
    accessToken = process.env.CONTENT_MANAGEMENT_TOKEN,
    spaceId = process.env.SPACE_ID,
    environmentId = process.env.ENVIRONMENT,
    yes = true,
    ...options
}) => contentfulRunMigration({ ...options, accessToken, spaceId, environmentId, yes })

export const padLeft = (value: number, length: number = value.toString().length, replacement: string = '0') => {
    return new Array(length - value.toString().length + 1).join(replacement) + value;
}

export const getStringDate = () => {
    const d = new Date(Date.now());
    return `${d.toISOString().substring(0, 10).replace('-', '.')}-${padLeft(d.getUTCHours(), 2)}.${padLeft(d.getUTCMinutes(), 2)}.${padLeft(d.getUTCSeconds(), 2)}`
}