import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let query = supabase
      .from('drafts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: drafts, error } = await query

    if (error) {
      console.error('Error fetching drafts:', error)
      return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('drafts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting drafts:', countError)
    }

    return NextResponse.json({
      drafts: drafts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in drafts API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, content, status = 'draft' } = await request.json()

    if (!userId || !content) {
      return NextResponse.json({ error: 'User ID and content are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('drafts')
      .insert({
        user_id: userId,
        title: title || `Draft ${new Date().toLocaleDateString()}`,
        content,
        status
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating draft:', error)
      return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 })
    }

    return NextResponse.json({ draft: data })
  } catch (error) {
    console.error('Error in drafts POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, content, status } = await request.json()

    if (!id || !content) {
      return NextResponse.json({ error: 'Draft ID and content are required' }, { status: 400 })
    }

    const updateData: any = {
      content,
      updated_at: new Date().toISOString()
    }

    if (title) updateData.title = title
    if (status) updateData.status = status

    const { data, error } = await supabase
      .from('drafts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating draft:', error)
      return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 })
    }

    return NextResponse.json({ draft: data })
  } catch (error) {
    console.error('Error in drafts PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting draft:', error)
      return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in drafts DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

