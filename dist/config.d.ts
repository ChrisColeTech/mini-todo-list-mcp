/**
 * Configuration object for the mini todo server
 */
export declare const config: {
    db: {
        path: string;
    };
    server: {
        name: string;
        version: string;
    };
};
/**
 * Ensure the database folder exists
 */
export declare function ensureDbFolder(): void;
