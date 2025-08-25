'use client'

import React, { Component, ReactNode } from 'react'
import { Box, Typography, Paper, Button, Alert } from '@mui/material'

// Tipos para el estado del ErrorBoundary
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

// Sistema centralizado de manejo de errores (clases y funciones utilitarias)
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
export function handleApiError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Response) {
    switch (error.status) {
      case 401:
        return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 409:
        return 'El recurso ya existe.';
      case 422:
        return 'Datos inválidos.';
      default:
        return `Error del servidor: ${error.status}`;
    }
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }

  return 'Ha ocurrido un error inesperado.';
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

// Hook para logging de errores
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

// Componente ErrorBoundary de React - Solo para Client Components
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log del error
    logError(error, 'ErrorBoundary')
    
    // Callback personalizado si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    this.setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback
      }

      // UI de error por defecto
      return (
        <Box sx={{ 
          p: 4, 
          minHeight: '50vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Paper sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              ¡Oops! Algo salió mal
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                {this.state.error?.message || 'Ha ocurrido un error inesperado'}
              </Typography>
            </Alert>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Detalles del error (solo en desarrollo):
                </Typography>
                <Paper 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.100', 
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    maxHeight: 200
                  }}
                >
                  {this.state.error.stack}
                </Paper>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={this.handleReset}
                size="large"
              >
                Intentar de nuevo
              </Button>
              <Button 
                variant="outlined" 
                onClick={this.handleReload}
                size="large"
              >
                Recargar página
              </Button>
            </Box>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}

// Exportación por defecto del componente
export default ErrorBoundary

// Exportar también las utilidades como objeto (por compatibilidad)
export const ErrorUtils = {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  handleApiError,
  getErrorMessage,
  logError
}