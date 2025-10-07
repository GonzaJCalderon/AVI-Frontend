// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get('access_token')?.value || // ← token que seteás en el login
    req.cookies.get('token')?.value

  const { pathname } = req.nextUrl

  // ✅ Rutas públicas que no requieren autenticación
  const publicPaths = [
    '/login',
    '/recuperar-password',
    '/restablecer-password'
  ]

  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  // ⛔️ Usuario autenticado intenta entrar al login → redirigir a dashboard
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/inicio', req.url))
  }

  // ✅ Permitir acceso a rutas públicas sin token
  if (isPublic) {
    return NextResponse.next()
  }

  // ⛔️ Sin token → redirigir al login
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // ✅ Autenticado → permitir acceso
  return NextResponse.next()
}

// ✅ Aplicar middleware a todas las rutas excepto recursos estáticos y API
export const config = {
  matcher: ['/((?!_next|api|images|favicon.ico|robots.txt).*)'],
}
