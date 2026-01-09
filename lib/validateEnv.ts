/**
 * Environment Variable Validation Utility
 * Validates required environment variables on application startup
 */

interface EnvValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
}

/**
 * Validates all required environment variables
 * @returns Validation result with errors and warnings
 */
export function validateEnvironmentVariables(): EnvValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required variables
    const requiredVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    // Check required variables
    for (const [key, value] of Object.entries(requiredVars)) {
        if (!value || value.trim() === '') {
            errors.push(`Missing required environment variable: ${key}`)
        }
    }

    // Optional but recommended for production
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.CRON_SECRET || process.env.CRON_SECRET.length < 32) {
            warnings.push(
                'CRON_SECRET is missing or too short (min 32 chars recommended for production)'
            )
        }
    }

    // Optional variables (just warnings)
    if (!process.env.OPENAI_API_KEY) {
        warnings.push(
            'OPENAI_API_KEY not set - AI generation will not be available (template mode will be used)'
        )
    }

    if (!process.env.RESEND_API_KEY) {
        warnings.push(
            'RESEND_API_KEY not set - Email sending will not be available'
        )
    }

    if (!process.env.NEWS_API_KEY) {
        warnings.push(
            'NEWS_API_KEY not set - NewsAPI source will not be available (other sources will be used)'
        )
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    }
}

/**
 * Validates environment variables and throws if invalid
 * Use this in server-side code where you want to fail fast
 */
export function validateEnvOrThrow(): void {
    const result = validateEnvironmentVariables()

    if (!result.isValid) {
        console.error('❌ Environment validation failed:')
        result.errors.forEach(error => console.error(`  - ${error}`))
        throw new Error(
            `Missing required environment variables: ${result.errors.join(', ')}`
        )
    }

    if (result.warnings.length > 0) {
        console.warn('⚠️  Environment warnings:')
        result.warnings.forEach(warning => console.warn(`  - ${warning}`))
    }

    console.log('✅ Environment variables validated successfully')
}

/**
 * Type-safe environment variable getter
 * @param key Environment variable key
 * @param required Whether the variable is required
 * @returns The environment variable value or undefined
 */
export function getEnv(key: string, required: boolean = false): string | undefined {
    const value = process.env[key]

    if (required && !value) {
        throw new Error(`Required environment variable ${key} is not set`)
    }

    return value
}

/**
 * Get environment variable with a default value
 * @param key Environment variable key
 * @param defaultValue Default value if not set
 * @returns The environment variable value or default
 */
export function getEnvWithDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue
}
