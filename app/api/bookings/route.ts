import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoiceNumber } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      clientName,
      phoneNumber,
      packageId,
      packageName,
      eventDate,
      message,
      locationLat,
      locationLng,
      locationAddress,
      locationLink,
    } = body

    if (!clientName || !phoneNumber || !packageId || !eventDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const invoiceNumber = generateInvoiceNumber()

    const { data, error } = await supabase.from('bookings').insert({
      client_name: clientName,
      phone_number: phoneNumber,
      package_id: packageId,
      package_name: packageName,
      event_date: eventDate,
      message,
      location_lat: locationLat ? parseFloat(locationLat) : null,
      location_lng: locationLng ? parseFloat(locationLng) : null,
      location_address: locationAddress,
      location_link: locationLink,
      invoice_number: invoiceNumber,
      status: 'pending',
    }).select().single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, booking: data, invoiceNumber })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookings: data })
}
