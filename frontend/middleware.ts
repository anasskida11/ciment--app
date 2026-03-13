import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages publiques qui ne nécessitent pas d'authentification
const publicPages = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Vérifier si la page est publique
  const isPublicPage = publicPages.some(page => pathname.startsWith(page))
  
  // Si c'est une page publique, autoriser l'accès
  if (isPublicPage) {
    return NextResponse.next()
  }
  
  // Auth is handled client-side via localStorage (middleware cannot access localStorage).
  // Token verification happens in the useAuth hook on each page.
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
