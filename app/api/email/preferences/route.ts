import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { getCurrentUser } from '@/lib/auth'

function getDefaultPreferences() {
  return {
    email_enabled: false,
    email_frequency: 'daily',
    delivery_time: 'morning',
    delivery_hour: 9,
    timezone: 'UTC',
    topics: ['technology'],
    preferred_sources: ['reddit', 'hackernews', 'github', 'perplexity'],
    content_length: 'medium',
    max_items: 8,
    use_ai_generation: false,
    include_images: true,
    include_commentary: true
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Email API] Fetching preferences for user:', user.id)

    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found, which is ok
      console.error('[Email API] Error fetching preferences:', error)
      throw error
    }

    const preferences = data || getDefaultPreferences()
    console.log('[Email API] Returning preferences:', preferences.email_enabled)

    return NextResponse.json({
      success: true,
      preferences
    })
  } catch (error: any) {
    console.error('[Email API] GET error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to fetch preferences'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('[Email API] Saving preferences for user:', user.id)
    console.log('[Email API] Preferences:', body)

    // Map delivery time to hour
    const deliveryHourMap: { [key: string]: number } = {
      morning: 9,
      afternoon: 14,
      evening: 18
    }

    const preferences = {
      user_id: user.id,
      email_enabled: body.email_enabled ?? false,
      email_frequency: body.email_frequency || 'daily',
      delivery_time: body.delivery_time || 'morning',
      delivery_hour: body.delivery_hour || deliveryHourMap[body.delivery_time] || 9,
      timezone: body.timezone || 'UTC',
      topics: body.topics || ['technology'],
      preferred_sources: body.preferred_sources || ['reddit', 'hackernews', 'github'],
      content_length: body.content_length || 'medium',
      max_items: body.max_items || 8,
      use_ai_generation: body.use_ai_generation ?? false,
      include_images: body.include_images ?? true,
      include_commentary: body.include_commentary ?? true,
      updated_at: new Date().toISOString()
    }

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('email_preferences')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let result
    if (existing) {
      // Update existing
      console.log('[Email API] Updating existing preferences')
      const { data, error } = await supabase
        .from('email_preferences')
        .update(preferences)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new
      console.log('[Email API] Inserting new preferences')
      const { data, error } = await supabase
        .from('email_preferences')
        .insert(preferences)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    console.log('[Email API] Preferences saved successfully')

    return NextResponse.json({
      success: true,
      preferences: result,
      message: 'Email preferences saved successfully!'
    })
  } catch (error: any) {
    console.error('[Email API] POST error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to save preferences'
    }, { status: 500 })
  }
}
