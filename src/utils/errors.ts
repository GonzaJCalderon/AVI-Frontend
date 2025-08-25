// Sistema centralizado de manejo de errores

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// Función para manejar errores de API
export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Response) {
    switch (error.status) {
      case 401:
        return new AuthError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      case 403:
        return new AuthError('No tienes permisos para realizar esta acción.');
      case 404:
        return new NotFoundError();
      case 409:
        return new ValidationError('El recurso ya existe.');
      case 422:
        return new ValidationError('Datos inválidos.');
      default:
        return new AppError(`Error del servidor: ${error.status}`);
    }
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError('Error de conexión. Verifica tu conexión a internet.');
  }

  return new AppError('Ha ocurrido un error inesperado.');
}

// Función para mostrar mensajes de error amigables
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Ha ocurrido un error inesperado.';
}

// Hook para logging de errores (opcional, para analytics)
export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: getErrorMessage(error),
      context,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
  
  // Aquí podrías integrar con servicios como Sentry, LogRocket, etc.
  // Sentry.captureException(error, { tags: { context } });
}