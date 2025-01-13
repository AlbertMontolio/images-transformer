declare module 'swagger-jsdoc' {
    interface Options {
        definition: {
            openapi: string;
            info: {
                title: string;
                version: string;
                description?: string;
                contact?: {
                    name?: string;
                    email?: string;
                };
            };
            servers: Array<{
                url: string;
                description?: string;
            }>;
        };
        apis: string[];
    }

    interface OpenAPISpec {
        openapi: string;
        info: {
            title: string;
            version: string;
            description?: string;
            contact?: {
                name?: string;
                email?: string;
            };
        };
        servers?: Array<{
            url: string;
            description?: string;
        }>;
        paths: Record<string, {
            [method: string]: {
                summary?: string;
                description?: string;
                responses?: Record<string, {
                    description: string;
                    content?: Record<string, {
                        schema: unknown;
                    }>;
                }>;
            };
        }>;
        components?: {
            schemas?: Record<string, unknown>;
            securitySchemes?: Record<string, unknown>;
        };
    }

    function swaggerJsdoc(options: Options): OpenAPISpec;
    export = swaggerJsdoc;
}
