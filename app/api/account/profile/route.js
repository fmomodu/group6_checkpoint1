import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        state: true,
        professionalProfile: {
          select: {
            id: true,
            name: true,
            bio: true,
            city: true,
            state: true,
            services: true,
            priceMin: true,
            priceMax: true,
            instagram: true,
            website: true,
            avgRating: true,
            reviewCount: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
