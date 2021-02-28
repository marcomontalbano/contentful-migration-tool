declare namespace NodeJS {
    export interface ProcessEnv {
        CONTENT_MANAGEMENT_TOKEN: string | undefined;
        SPACE_ID: string | undefined;
        ENVIRONMENT: string | undefined;
    }
}
