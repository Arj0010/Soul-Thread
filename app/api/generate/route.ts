import { NextRequest, NextResponse } from 'next/server'
import { generateDraft } from '@/lib/generate'
import { supabase } from '@/lib/supabaseClient'
import trendsData from '@/data/trends.json'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // Get user's voice profile
    const { data: voiceProfile, error: voiceError } = await supabase
      .from('voicedna')
      .select('data')
      .eq('user_id', userId)
      .single()

    if (voiceError && voiceError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch voice profile' }, { status: 500 })
    }

    // Generate draft using voice profile and trends
    const draft = await generateDraft(voiceProfile?.data, trendsData)

    return NextResponse.json({ draft })
  } catch (error) {
    console.error('Error generating draft:', error)
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 })
  }
}
