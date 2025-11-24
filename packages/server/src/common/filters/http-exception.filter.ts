import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from '../exceptions/app.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    let responseBody: Record<string, any> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Handle AppException specially
    if (exception instanceof AppException) {
      const { message, error, code, details } = exception;
      responseBody = {
        ...responseBody,
        message,
        error,
        code,
        ...(details ? { details } : {}),
      };

      this.logger.error(
        `HTTP 요청 실패: ${request.method} ${request.url} - ${status} - ${code} - ${message}`,
      );
    } else {
      // Handle standard HttpExceptions
      const errorMessage = 
        typeof errorResponse === 'object' && 'message' in errorResponse
          ? errorResponse['message']
          : exception.message;
      
      responseBody.message = errorMessage;

      this.logger.error(
        `HTTP 요청 실패: ${request.method} ${request.url} - ${status} - ${JSON.stringify(errorMessage)}`,
      );
    }

    response.status(status).json(responseBody);
  }
}