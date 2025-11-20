import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get('access_token')?.value ||
    req.cookies.get('token')?.value

  const { pathname } = req.nextUrl

  // ✅ SIN /avd/ porque basePath lo agrega automáticamente
  const publicPaths = [
    '/login',
    '/recuperar-password',
    '/restablecer-password'
  ]

  const isPublic = publicPaths.includes(pathname)

  // ✅ Redirigir sin /avd/
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/inicio', req.url))
  }

  if (isPublic) {
    return NextResponse.next()
  }

  // ✅ Redirigir sin /avd/
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

// ✅ Matcher para todas las rutas (no solo /avd/)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
}