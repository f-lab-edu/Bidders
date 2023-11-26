import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception.getStatus();
        const error = exception.getResponse() as string | object;
        const path = request.url;
        const timestamp = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Seoul',
            hour12: false,
        });

        if (typeof error === 'string') {
            response.status(status).json({
                statusCode: status,
                message: exception.message,
                error,
                path,
                timestamp,
            });
        } else {
            response.status(status).json({
                ...error,
                path,
                timestamp,
            });
        }
    }
}
