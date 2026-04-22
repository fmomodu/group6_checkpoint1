import { auth } from '@/lib/neon-auth-server'
import { prisma } from '@/lib/prisma'

const NEON_MANAGED_PASSWORD = '__managed_by_neon_auth__'

async function syncAppUser(user) {
  if (!user?.email) return null

  const existingByEmail = await prisma.user.findUnique({
    where: { email: user.email },
  })

  if (existingByEmail) {
    const updates = {}

    if (user.name && existingByEmail.name !== user.name) updates.name = user.name
    if (user.image !== undefined && existingByEmail.image !== user.image) updates.image = user.image

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: existingByEmail.id },
        data: updates,
      })
    }

    return existingByEmail
  }

  const existingById = await prisma.user.findUnique({
    where: { id: user.id },
  })

  if (existingById) {
    return existingById
  }

  return prisma.user.create({
    data: {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      image: user.image || null,
      password: NEON_MANAGED_PASSWORD,
    },
  })
}

export async function getSession() {
  const { data, error } = await auth.getSession()
  if (error || !data?.user) return null

  const appUser = await syncAppUser(data.user)
  if (!appUser) return data

  return {
    ...data,
    user: {
      ...data.user,
      id: appUser.id,
      image: appUser.image,
      role: appUser.role,
      phone: appUser.phone,
      city: appUser.city,
      state: appUser.state,
      appAuthId: data.user.id,
    },
  }
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}
