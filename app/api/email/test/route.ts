import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail } from '@/lib/emailService'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Test Email] Sending test email to user:', user.id)

    // Get user email from Supabase auth
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user?.email) {
      console.error('[Test Email] Failed to get user email:', userError)
      return NextResponse.json({
        error: 'Could not retrieve user email'
      }, { status: 400 })
    }

    const userEmail = userData.user.email
    console.log('[Test Email] Sending to:', userEmail)

    const result = await sendTestEmail(userEmail)

    if (!result.success) {
      console.error('[Test Email] Send failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send test email'
      }, { status: 500 })
    }

    console.log('[Test Email] Successfully sent, message ID:', result.messageId)

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${userEmail}!`,
      messageId: result.messageId
    })
  } catch (error: any) {
    console.error('[Test Email] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test email'
    }, { status: 500 })
  }
}
