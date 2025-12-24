
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
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
            paths: {
                '/api/images': {
                    post: {
                        summary: 'Upload a single image',
                        description: 'Uploads an image file to Firebase Storage and returns the public URL.',
                        security: [{ BearerAuth: [] }],
                        requestBody: {
                            required: true,
                            content: {
                                'multipart/form-data': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            file: {
                                                type: 'string',
                                                format: 'binary',
                                                description: 'The image file to upload'
                                            },
                                            path: {
                                                type: 'string',
                                                description: 'Optional folder path to store the file'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            '201': {
                                description: 'Image uploaded successfully',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                success: { type: 'boolean', example: true },
                                                url: { type: 'string', example: 'https://firebasestorage.googleapis.com/...' }
                                            }
                                        }
                                    }
                                }
                            },
                            '400': { description: 'Bad Request' },
                            '401': { description: 'Unauthorized' },
                            '429': { description: 'Rate Limit Exceeded' }
                        }
                    },
                    delete: {
                        summary: 'Delete an image',
                        description: 'Deletes an image file from Firebase Storage using its public URL.',
                        security: [{ BearerAuth: [] }],
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            publicUrl: {
                                                type: 'string',
                                                description: 'The public URL of the file to delete'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            '200': { description: 'File deleted successfully' },
                            '400': { description: 'Bad Request' },
                            '401': { description: 'Unauthorized' }
                        }
                    }
                },
                '/api/images/multi': {
                    post: {
                        summary: 'Upload multiple images',
                        description: 'Uploads up to 10 image files to Firebase Storage.',
                        security: [{ BearerAuth: [] }],
                        requestBody: {
                            required: true,
                            content: {
                                'multipart/form-data': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            files: {
                                                type: 'array',
                                                items: { type: 'string', format: 'binary' },
                                                description: 'The image files to upload (max 10)'
                                            },
                                            path: {
                                                type: 'string',
                                                description: 'Optional folder path to store the files'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        responses: {
                            '201': {
                                description: 'Images uploaded successfully',
                                content: {
                                    'application/json': {
                                        schema: {
                                            type: 'object',
                                            properties: {
                                                success: { type: 'boolean', example: true },
                                                urls: {
                                                    type: 'array',
                                                    items: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            '400': { description: 'Bad Request' },
                            '401': { description: 'Unauthorized' },
                            '429': { description: 'Rate Limit Exceeded' }
                        }
                    }
                }
            }
        },
    });
    return spec;
};
