declare namespace NodeJS {
    export interface ProcessEnv {
        CONTENT_MANAGEMENT_TOKEN: string | undefined;
        SPACE_ID: string | undefined;
        ENVIRONMENT_ID: string | undefined;
    }
}
