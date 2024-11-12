import { ISwaggerOptions } from '../interfaces/swagger.interface';

const API_SWAGGER_ROOT = 'api/docs';
const API_SWAGGER_TITLE = 'Bidders API';
const API_SWAGGER_DESCRIPTION = 'API 문서';
const API_SWAGGER_VERSION = '1.0.0';

export const API_SWAGGER_OPTIONS: ISwaggerOptions = {
    root: API_SWAGGER_ROOT,
    title: API_SWAGGER_TITLE,
    description: API_SWAGGER_DESCRIPTION,
    version: API_SWAGGER_VERSION,
};
