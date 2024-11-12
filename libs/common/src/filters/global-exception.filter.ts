import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const path = request.url;
        const method = request.method;
        const timestamp = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Seoul',
            hour12: false,
        });
        const isHttpException = exception instanceof HttpException;

        if (isHttpException) {
            const status = exception.getStatus();
            const errorResponse = exception.getResponse();

            response.status(status).json({
                statusCode: status,
                message: errorResponse['message'] || exception.message,
                error:
                    typeof errorResponse === 'string'
                        ? errorResponse
                        : errorResponse['error'],
                method,
                path,
                timestamp,
            });
        } else {
            // 일반 Error 객체 처리
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: (exception as Error).message,
                error: 'Internal Server Error',
                method,
                path,
                timestamp,
            });
        }
    }
}
