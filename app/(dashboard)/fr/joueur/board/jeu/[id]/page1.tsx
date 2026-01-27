import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserPalmares } from '@/lib/actions/palmaresActions'
import JeuPlayClient from '@/components/JeuPlayClient'

const page = async () => {
  const { userId } = await auth()

  if (!userId) {
    return <div>Not authenticated</div>
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    return <div>User not found</div>
  }

  const palmares = await getCurrentUserPalmares(user.id)

  if (!palmares || palmares.statusJeu !== 'CURRENT') {
    return <div>No current jeu</div>
  }

  // Select jeu where palmares.niveau === jeu.niveau
  const jeu = await prisma.jeu.findFirst({
    where: {
      sectionId: palmares.sectionId!,
      niveau: palmares.niveau
    },
    include: {
      stage: true,
      section: true,
      questions: {
        include: {
          reponses: true
        },
        orderBy: {
          orderNum: 'asc'
        }
      }
    }
  })

  if (!jeu) {
    return <div>Jeu not found</div>
  }

  return <JeuPlayClient questions={jeu.questions} stage={jeu.stage} section={jeu.section} />
}

export default page