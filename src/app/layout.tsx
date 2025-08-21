import './globals.css'
import type { Metadata } from 'next'
import ThemeRegistry from '@/components/ThemeRegistry'
import AppLayout from '@/components/AppLayout'

export const metadata: Metadata = {
  title: 'Plataforma de Asistencia a Víctimas',
  description: 'MSJ',
  icons: {
    icon: '/images/logo-png-sin-fondo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeRegistry>
          <AppLayout>{children}</AppLayout>
        </ThemeRegistry>
      </body>
    </html>
  )
}
