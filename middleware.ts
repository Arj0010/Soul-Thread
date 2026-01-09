import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in-memory, for simple rate limiting)
// For production with multiple instances, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60 // 60 requests per minute

/**
 * Simple rate limiting implementation
 * @param identifier Unique identifier (IP address)
 * @returns Whether the request should be rate limited
 */
function shouldRateLimit(identifier: string): boolean {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    if (!record || now > record.resetTime) {
        // New window
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS,
        })
        return false
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return true
    }

    record.count++
    return false
}

/**
 * Clean up old rate limit records periodically
 */
function cleanupRateLimitStore() {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000)

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Security Headers
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // Content Security Policy
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com;
    frame-ancestors 'self';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim()

    response.headers.set('Content-Security-Policy', cspHeader)

    // Rate limiting for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

        if (shouldRateLimit(identifier)) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Too many requests',
                    message: 'Rate limit exceeded. Please try again later.',
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': '60',
                    },
                }
            )
        }
    }

    return response
}

// Configure which routes use this middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
