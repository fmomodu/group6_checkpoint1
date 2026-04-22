import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function sanitizeList(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

export async function POST(req) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      role,
      phone,
      city,
      state,
      businessName,
      bio,
      services,
      priceMin,
      priceMax,
      instagram,
      website,
    } = await req.json()

    if (!role || !['CUSTOMER', 'PROFESSIONAL'].includes(role)) {
      return NextResponse.json({ error: 'Please choose an account type' }, { status: 400 })
    }

    if (!phone || !city || !state) {
      return NextResponse.json({ error: 'Phone, city, and state are required' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role,
        phone,
        city,
        state,
      },
    })

    if (role === 'PROFESSIONAL') {
      const serviceList = sanitizeList(services)
      const safePriceMin = Number(priceMin)
      const safePriceMax = Number(priceMax)

      if (!businessName || !bio || serviceList.length === 0) {
        return NextResponse.json({ error: 'Business name, bio, and services are required' }, { status: 400 })
      }

      if (!Number.isFinite(safePriceMin) || !Number.isFinite(safePriceMax) || safePriceMin < 0 || safePriceMax < safePriceMin) {
        return NextResponse.json({ error: 'Please enter a valid price range' }, { status: 400 })
      }

      const existingProfessional = await prisma.professional.findUnique({
        where: { ownerId: session.user.id },
      })

      const professionalData = {
        name: businessName,
        bio,
        city,
        state,
        services: serviceList,
        priceMin: safePriceMin,
        priceMax: safePriceMax,
        phone,
        instagram: instagram || null,
        website: website || null,
        gallery: [],
        ownerId: session.user.id,
      }

      if (existingProfessional) {
        await prisma.professional.update({
          where: { id: existingProfessional.id },
          data: professionalData,
        })
      } else {
        await prisma.professional.create({
          data: {
            id: `pro-${session.user.id}`,
            ...professionalData,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
