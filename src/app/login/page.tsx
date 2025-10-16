'use client';

import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/services/api'; // asegurate de tenerlo arriba
import { logger } from '@/lib/logger';

// Interfaces mejoradas con validación más estricta
interface User {
  id: string | number;
  email: string;
  nombre?: string; 
  rol?: string;
  [key: string]: any;
}

interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
  error?: string;
  [key: string]: any;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Constantes mejoradas
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN: 'token',
  USER: 'user',
} as const;

const API_ENDPOINTS = {
  LOGIN: '/auth/login', // <-- cambiar esta línea
  RECOVERY: '/recuperar',
  DASHBOARD: '/inicio',
};


const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 6,
  REQUEST_TIMEOUT: 30000, // 30 segundos
} as const;

// Utilidades para validación
const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'El correo electrónico es requerido';
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email.trim())) {
    return 'Por favor ingresa un correo electrónico válido';
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} caracteres`;
  }
  return null;
};

// Utilidad para almacenamiento seguro
const secureStorage = {
  store: (data: LoginResponse): void => {
    try {
      const accessToken = data?.access_token || data?.accessToken || data?.token;
      const refreshToken = data?.refresh_token || data?.refreshToken;
      const user = data?.user;

      if (!accessToken) {
        throw new Error('Token de acceso requerido');
      }

      // Limpiar almacenamiento previo
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });

      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      // ✅ Guardar token como cookie para que lo lea el middleware
      document.cookie = `access_token=${accessToken}; path=/; max-age=3600; SameSite=Strict; Secure`;

    } catch (error) {
      console.error('Error al guardar datos de autenticación:', error);
      throw new Error('Error al guardar los datos de sesión');
    }
  },

  clear: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    // ✅ Limpiar la cookie también
    document.cookie = 'access_token=; path=/; max-age=0';
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validación en tiempo real
  const formValidation = useMemo(() => {
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    
    return {
      isValid: !emailError && !passwordError,
      errors: {
        email: emailError,
        password: passwordError,
      }
    };
  }, [form.email, form.password]);

  // Manejador de cambios optimizado
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores específicos del campo
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
    }
  }, [errors]);



const performLogin = async (credentials: FormData): Promise<LoginResponse> => {
  const data = await apiFetch<LoginResponse>(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  });

  const hasValidToken = data?.access_token || data?.accessToken || data?.token;
  if (!hasValidToken) {
    throw new Error('Respuesta del servidor inválida: token no encontrado');
  }
logger.info('Login exitoso', {
  email: credentials.email,
  userId: data?.user?.id,
});

  return data;
};


  // Manejador de envío mejorado
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación completa del formulario
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      logger.info('Intento de login', { email: form.email });

      const loginData = await performLogin(form);
      secureStorage.store(loginData);
      
      // Navegación exitosa con pequeño delay para UX
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push(API_ENDPOINTS.DASHBOARD);
      
    } catch (error: any) {
  logger.error('Error de login', error);

      
      let errorMessage = 'Error inesperado. Intenta nuevamente.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'La solicitud tardó demasiado tiempo. Verifica tu conexión.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setSubmitting(false);
    }
  }, [form, router]);

  // Manejador de visibilidad de contraseña optimizado
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Manejador de teclas para mejor accesibilidad
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitting && formValidation.isValid) {
      handleSubmit(e as any);
    }
  }, [submitting, formValidation.isValid, handleSubmit]);

  return (
    <Wrapper>
      <div className="left-panel">
        <div className="content">
          <h1 className="title">Plataforma de Asistencia a Víctimas</h1>
          <h2 className="subtitle">Ministerio de Seguridad y Justicia</h2>
          <div className="logo-container">
            <img 
              src="/images/logo-png-sin-fondo.png" 
              alt="Logo del Ministerio de Seguridad y Justicia de Mendoza" 
              className="logo"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      <div className="right-panel">
        <form 
          className="form" 
          onSubmit={handleSubmit} 
          onKeyDown={handleKeyDown}
          noValidate
          aria-label="Formulario de inicio de sesión"
        >
          <h2>Iniciar sesión</h2>

          {errors.general && (
            <div
              role="alert"
              className="error-message general-error"
              aria-live="polite"
            >
              <ErrorIcon />
              {errors.general}
            </div>
          )}

          <div className="field-group">
            <label htmlFor="email">
              Correo electrónico *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={submitting}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <div 
                id="email-error" 
                className="field-error"
                role="alert"
              >
                {errors.email}
              </div>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="password">
              Contraseña *
            </label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                aria-invalid={!!errors.password}
                aria-describedby={`password-visibility ${errors.password ? 'password-error' : ''}`.trim()}
                disabled={submitting}
                className={errors.password ? 'error' : ''}
              />
              <button
                id="password-visibility"
                type="button"
                className="toggle-visibility"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={togglePasswordVisibility}
                disabled={submitting}
                tabIndex={0}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <div 
                id="password-error" 
                className="field-error"
                role="alert"
              >
                {errors.password}
              </div>
            )}
          </div>

          <div className="forgot-password">
            <a 
              href={API_ENDPOINTS.RECOVERY} 
              className="forgot-link"
              tabIndex={submitting ? -1 : 0}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button 
            type="submit" 
            disabled={submitting || !formValidation.isValid}
            className="submit-button"
            aria-describedby={submitting ? 'loading-text' : undefined}
          >
            {submitting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span id="loading-text">Verificando credenciales…</span>
              </>
            ) : (
              'Ingresar'
            )}
          </button>

          <div className="form-footer">
            <p className="security-note">
              <SecurityIcon />
              Conexión segura y cifrada
            </p>
          </div>
        </form>
      </div>
    </Wrapper>
  );
}

// Componentes de iconos optimizados con mejor accesibilidad
const EyeIcon = React.memo(() => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M1.5 12s3.5-7.5 10.5-7.5S22.5 12 22.5 12 19 19.5 12 19.5 1.5 12 1.5 12Z" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
));

const EyeOffIcon = React.memo(() => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path 
      d="M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-1.2M7.1 7.5C4.9 8.8 3.4 10.6 2.5 12c0 0 3.5 7.5 9.5 7.5 2 0 3.7-.5 5.1-1.3M16.9 6.7A10.5 10.5 0 0012 4.5C5 4.5 1.5 12 1.5 12c.5.9 1.3 2.3 2.6 3.6" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
));

const ErrorIcon = React.memo(() => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
));

const SecurityIcon = React.memo(() => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 2L3 7V12C3 16.97 6.82 21.42 11.67 22L12 22L12.33 22C17.18 21.42 21 16.97 21 12V7L12 2Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));

// Nombres de display para debugging
EyeIcon.displayName = 'EyeIcon';
EyeOffIcon.displayName = 'EyeOffIcon';
ErrorIcon.displayName = 'ErrorIcon';
SecurityIcon.displayName = 'SecurityIcon';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  font-family: 'Inter', 'Poppins', 'Roboto', sans-serif;
  background: #f8fafc;

  @media (max-width: 768px) {
    flex-direction: column;
    min-height: 100vh;
  }

  .left-panel {
    flex: 1;
    background: linear-gradient(135deg, #5b2f9c 0%, #3b0a58 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 70%);
      pointer-events: none;
    }

    @media (max-width: 768px) {
      flex: 0 0 auto;
      min-height: 40vh;
    }

    .content {
      text-align: center;
      z-index: 1;
      position: relative;
    }

    .title {
      font-size: clamp(1.5rem, 4vw, 2.2rem);
      font-weight: 700;
      margin-bottom: 0.5rem;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .subtitle {
      font-size: clamp(0.9rem, 2.5vw, 1.1rem);
      font-weight: 300;
      margin-bottom: 2.5rem;
      opacity: 0.95;
      line-height: 1.4;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }

    .logo {
      max-width: 140px;
      height: auto;
      background: white;
      padding: 16px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .right-panel {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    background: linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%);

    @media (max-width: 768px) {
      padding: 1.5rem;
      flex: 1;
    }
  }

  .form {
    background: white;
    padding: 2.5rem;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 400px;
    border: 1px solid rgba(255, 255, 255, 0.2);

    @media (max-width: 768px) {
      padding: 2rem;
      border-radius: 16px;
    }

    h2 {
      text-align: center;
      color: #1e293b;
      margin-bottom: 2rem;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .field-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      font-weight: 500;
      font-size: 0.95rem;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    input {
      width: 100%;
      height: 48px;
      padding: 12px 16px;
      border-radius: 10px;
      border: 2px solid #e5e7eb;
      background: #fafafa;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.2s ease;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #6d44b8;
        background: white;
        box-shadow: 0 0 0 3px rgba(109, 68, 184, 0.1);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: #f3f4f6;
      }

      &.error,
      &[aria-invalid="true"] {
        border-color: #ef4444;
        background: #fef2f2;
        
        &:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
      }
    }

    .password-field {
      position: relative;
      display: flex;
      align-items: center;

      input {
        padding-right: 52px;
      }
    }

    .toggle-visibility {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      height: 36px;
      width: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #6b7280;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: #f3f4f6;
        color: #6d44b8;
      }

      &:focus {
        outline: 2px solid #6d44b8;
        outline-offset: 2px;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .field-error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .forgot-password {
      text-align: right;
      margin-bottom: 2rem;

      .forgot-link {
        color: #6d44b8;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        transition: color 0.2s ease;

        &:hover {
          color: #5b2f9c;
          text-decoration: underline;
        }

        &:focus {
          outline: 2px solid #6d44b8;
          outline-offset: 2px;
          border-radius: 4px;
        }
      }
    }

    .submit-button {
      width: 100%;
      height: 48px;
      background: linear-gradient(135deg, #6d44b8 0%, #5b2f9c 100%);
      color: white;
      font-weight: 600;
      font-size: 1rem;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      position: relative;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #5b2f9c 0%, #3b0a58 100%);
        transform: translateY(-1px);
        box-shadow: 0 10px 25px rgba(109, 68, 184, 0.3);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
        background: #9ca3af;
      }

      &:focus {
        outline: 2px solid #6d44b8;
        outline-offset: 2px;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    .error-message {
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &.general-error {
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        color: #dc2626;
        border: 1px solid #fecaca;
      }
    }

    .form-footer {
      margin-top: 1.5rem;
      text-align: center;

      .security-note {
        font-size: 0.8rem;
        color: #6b7280;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin: 0;
      }
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Animaciones de entrada */
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .form {
    animation: slideIn 0.5s ease-out;
  }

  /* Estados de focus mejorados */
  .form input:focus,
  .form button:focus {
    outline: 2px solid #6d44b8;
    outline-offset: 2px;
  }



  /* Mejoras para usuarios con preferencias de movimiento reducido */
  @media (prefers-reduced-motion: reduce) {
    .form {
      animation: none;
    }
    
    .submit-button,
    .toggle-visibility,
    .logo {
      transition: none;
    }
    
    .spinner {
      animation: none;
      border: 2px solid currentColor;
      border-radius: 50%;
    }
  }

  /* Estados de alta contraste */
  @media (prefers-contrast: high) {
    .form {
      border: 2px solid #000;
    }
    
    input {
      border-width: 2px;
    }
    
    .submit-button {
      border: 2px solid #000;
    }
  }
`;