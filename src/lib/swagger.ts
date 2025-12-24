
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
        apiFolder: 'src/app/api', // define api folder
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'File System API',
                version: '1.0',
                description: 'API for uploading and managing files in Firebase Storage',
            },
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
            security: [],
        },
    });
    return spec;
};
