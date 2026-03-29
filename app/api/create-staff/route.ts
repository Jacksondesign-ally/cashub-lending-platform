import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, role, phone, lender_id } = await req.json()

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const tempPassword = generatePassword()

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name, role },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Insert into users table
    const { error: dbError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      full_name,
      email,
      role: role || 'loan_officer',
      phone: phone || null,
      status: 'active',
      lender_id: lender_id || null,
    })

    if (dbError) {
      // Try to clean up the auth user if DB insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      credentials: { email, password: tempPassword },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
