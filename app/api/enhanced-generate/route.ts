import { NextRequest, NextResponse } from 'next/server'
import { generateEnhancedDraft, generateTopicFocusedDraft } from '@/lib/enhancedGenerate'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { userId, topic, useRealTimeData = true } = await request.json()

    // Get user's voice profile
    const { data: voiceProfile, error: voiceError } = await supabase
      .from('voicedna')
      .select('data')
      .eq('user_id', userId)
      .single()

    if (voiceError && voiceError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch voice profile' }, { status: 500 })
    }

    let draft: string

    if (useRealTimeData) {
      // Generate enhanced draft with real-time data
      if (topic) {
        draft = await generateTopicFocusedDraft(voiceProfile?.data, topic)
      } else {
        draft = await generateEnhancedDraft(voiceProfile?.data)
      }
    } else {
      // Fallback to original mock generation
      const { generateDraft } = await import('@/lib/generate')
      const trendsData = await import('@/data/trends.json')
      draft = await generateDraft(voiceProfile?.data, trendsData.default)
    }

    return NextResponse.json({ 
      draft,
      generatedAt: new Date().toISOString(),
      dataSource: useRealTimeData ? 'real-time' : 'mock',
      topic: topic || 'general'
    })
  } catch (error) {
    console.error('Error generating enhanced draft:', error)
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 })
  }
}

