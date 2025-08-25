'use client'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="es">
      <head>
        <title>Error - Plataforma de Asistencia a Víctimas</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ 
        margin: 0, 
        padding: '2rem',
        fontFamily: 'Poppins, sans-serif',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h1 style={{ color: '#d32f2f', marginBottom: '1rem' }}>
            ¡Oops! Algo salió mal
          </h1>
          
          <p style={{ 
            color: '#666', 
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            border: '1px solid #ffcdd2'
          }}>
            {error.message || 'Ha ocurrido un error inesperado en la aplicación'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={reset}
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Intentar de nuevo
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                backgroundColor: 'transparent',
                color: '#1976d2',
                border: '1px solid #1976d2',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}