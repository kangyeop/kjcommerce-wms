import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorOptions {
  message?: string;
  error?: string;
  code?: string;
  statusCode?: HttpStatus;
  cause?: Error;
  details?: Record<string, any>;
}

export class AppException extends HttpException {
  public readonly error: string;
  public readonly code: string;
  public readonly details?: Record<string, any>;
  public readonly cause: Error | undefined;

  constructor(
    message: string,
    {
      error = 'Bad Request',
      code = 'BAD_REQUEST',
      statusCode = HttpStatus.BAD_REQUEST,
      cause,
      details,
    }: ErrorOptions = {},
  ) {
    super(
      {
        statusCode,
        message,
        error,
        code,
        ...(details ? { details } : {}),
      },
      statusCode,
      { cause },
    );

    this.error = error;
    this.code = code;
    this.cause = cause;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(
    message: string,
    options: ErrorOptions = {},
  ): AppException {
    return new AppException(message, {
      error: 'Bad Request',
      code: 'BAD_REQUEST',
      statusCode: HttpStatus.BAD_REQUEST,
      ...options,
    });
  }

  static notFound(
    message: string,
    options: ErrorOptions = {},
  ): AppException {
    return new AppException(message, {
      error: 'Not Found',
      code: 'NOT_FOUND',
      statusCode: HttpStatus.NOT_FOUND,
      ...options,
    });
  }

  static unauthorized(
    message: string,
    options: ErrorOptions = {},
  ): AppException {
    return new AppException(message, {
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
      statusCode: HttpStatus.UNAUTHORIZED,
      ...options,
    });
  }

  static forbidden(
    message: string,
    options: ErrorOptions = {},
  ): AppException {
    return new AppException(message, {
      error: 'Forbidden',
      code: 'FORBIDDEN',
      statusCode: HttpStatus.FORBIDDEN,
      ...options,
    });
  }

  static conflict(
    message: string,
    options: ErrorOptions = {},
  ): AppException {
    return new AppException(message, {
      error: 'Conflict',
      code: 'CONFLICT',
      statusCode: HttpStatus.CONFLICT,
      ...options,
    });
  }

  static internal(
    message: string,
    options: ErrorOptions = {},
  ): AppException {
    return new AppException(message, {
      error: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      ...options,
    });
  }

  static badGateway(
    message: string,
    options: ErrorOptions = {},
  ): AppException {
    return new AppException(message, {
      error: 'Bad Gateway',
      code: 'BAD_GATEWAY',
      statusCode: HttpStatus.BAD_GATEWAY,
      ...options,
    });
  }
}