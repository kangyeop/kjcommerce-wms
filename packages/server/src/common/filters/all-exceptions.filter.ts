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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: Record<string, any> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '서버 내부 오류가 발생했습니다.',
      error: 'Internal Server Error',
    };
    
    // Handle specific types of exceptions
    if (exception instanceof AppException) {
      status = exception.getStatus();
      const { message, error, code, details } = exception;
      
      responseBody = {
        ...responseBody,
        statusCode: status,
        message,
        error,
        code,
        ...(details ? { details } : {}),
      };
      
      this.logger.error(
        `예외 발생 (AppException): ${request.method} ${request.url} - ${code} - ${message}`,
        exception.stack,
      );
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      const message = typeof errorResponse === 'object' && 'message' in errorResponse
        ? errorResponse['message']
        : exception.message;
      
      responseBody = {
        ...responseBody,
        statusCode: status,
        message,
      };
      
      this.logger.error(
        `예외 발생 (HttpException): ${request.method} ${request.url} - ${status} - ${message}`,
        exception.stack,
      );
    } else if (exception instanceof Error) {
      // Handle standard Error objects
      responseBody.message = exception.message;
      
      this.logger.error(
        `예외 발생 (Error): ${request.method} ${request.url}`,
        exception.stack,
      );
    } else {
      // Handle unknown exceptions
      this.logger.error(
        `알 수 없는 예외 발생: ${request.method} ${request.url}`,
        String(exception),
      );
    }

    response.status(status).json(responseBody);
  }
}