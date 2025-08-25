// Configuración centralizada de la aplicación
export const CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
    : 'http://10.100.1.80:3333/api',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      VERIFY: '/api/auth/verify'
    },
    USERS: {
      BASE: '/api/users',
      CREATE: '/api/users/create',
      UPDATE: '/api/users/update',
      DELETE: '/api/users/delete'
    },
    CASOS: {
      BASE: '/api/casos',
      CREATE: '/api/casos/create',
      UPDATE: '/api/casos/update',
      DELETE: '/api/casos/delete'
    }
  },

  // App Configuration
  APP: {
    NAME: 'Plataforma de Asistencia a las Víctimas',
    VERSION: '1.0.0',
    LOGO_PATH: '/images/logo-png-sin-fondo.png'
  },

  // Storage Keys
  STORAGE_KEYS: {
    USER: 'user',
    TOKEN: 'auth-token',
    PREFERENCES: 'user-preferences'
  },

  // UI Configuration
  UI: {
    SIDEBAR_WIDTH_EXPANDED: 240,
    SIDEBAR_WIDTH_COLLAPSED: 72,
    DRAWER_TRANSITION_DURATION: 300
  },

  // Form Configuration
  FORMS: {
    PASSWORD_DEFAULT: 'password123',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'png']
  }
} as const;

// Tipos derivados de la configuración
export type ApiEndpoint = typeof CONFIG.ENDPOINTS;
export type StorageKey = keyof typeof CONFIG.STORAGE_KEYS;