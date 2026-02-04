import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

// Detecta se o User-Agent é de dispositivo mobile
function isMobileDevice(userAgent: string | null): boolean {
  if (!userAgent) return false
  
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i
  return mobileRegex.test(userAgent)
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const userAgent = request.headers.get('user-agent')
  
  // Permite override com query param ?force=desktop ou ?force=mobile
  const forceParam = searchParams.get('force')
  
  // Se está na raiz (/) e é mobile, redireciona para /m
  if (pathname === '/') {
    const isMobile = isMobileDevice(userAgent)
    
    // Override: ?force=desktop mantém no desktop
    if (forceParam === 'desktop') {
      return await updateSession(request)
    }
    
    // Override: ?force=mobile força ir para mobile
    if (forceParam === 'mobile') {
      const mobileUrl = new URL('/m', request.url)
      return NextResponse.redirect(mobileUrl)
    }
    
    // Redireciona mobile automaticamente
    if (isMobile) {
      const mobileUrl = new URL('/m', request.url)
      return NextResponse.redirect(mobileUrl)
    }
  }
  
  // Se está em /m e é desktop, redireciona para /
  if (pathname === '/m') {
    const isMobile = isMobileDevice(userAgent)
    
    // Override: ?force=mobile mantém no mobile
    if (forceParam === 'mobile') {
      return await updateSession(request)
    }
    
    // Override: ?force=desktop força ir para desktop
    if (forceParam === 'desktop') {
      const desktopUrl = new URL('/', request.url)
      return NextResponse.redirect(desktopUrl)
    }
    
    // Se não é mobile, redireciona para desktop
    if (!isMobile) {
      const desktopUrl = new URL('/', request.url)
      return NextResponse.redirect(desktopUrl)
    }
  }
  
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
