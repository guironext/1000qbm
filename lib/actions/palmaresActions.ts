'use server';

import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';
import { Langue } from '@/lib/generated/prisma/index.js';

export async function updateCurrentPalmares(userId: string, score: number) {
  return await prisma.palmares.updateMany({
    where: {
      userId,
      statusJeu: 'CURRENT'
    },
    data: {
      score,
      isFinished: true,
      statusJeu: 'VALIDATED',
      statusSection: 'VALIDATED'
    }
  });
}

export async function resetPreviousJeuScore(userId: string) {
  return await prisma.palmares.updateMany({
    where: {
      userId,
      statusJeu: 'VALIDATED'
    },
    data: {
      score: 0
    }
  });
}

export async function getCurrentUserPalmares(userId: string) {
  const palmares = await prisma.palmares.findFirst({
    where: {
      userId,
      statusJeu: 'CURRENT'
    }
  });

  if (!palmares) return null;

  const stage = palmares.stageId ? await prisma.stage.findUnique({
    where: { id: palmares.stageId }
  }) : null;

  const sections = palmares.stageId ? await prisma.section.findMany({
    where: {
      jeux: {
        some: {
          stageId: palmares.stageId
        }
      }
    },
    include: {
      jeux: true
    }
  }) : [];

  const section = palmares.sectionId ? await prisma.section.findUnique({
    where: { id: palmares.sectionId },
    include: {
      jeux: true
    }
  }) : null;

  return {
    ...palmares,
    stage: stage ? { ...stage, sections } : null,
    section
  };
}

export async function getCurrentStagePalmares(userId: string) {
  const palmares = await prisma.palmares.findFirst({
    where: {
      userId,
      statusStage: 'CURRENT'
    },
    include: {
      stage: {
        include: {
          descriptions: true
        }
      },
      section: true
    }
  });

  return palmares;
}

export async function createNewPalmares(data: {
  userId: string;
  stageLength: number;
  stageNumOrder: number;
  stageNiveau: string;
  sectionNumOrder: number;
  sectionNiveau: string;
  niveau: string;
  langue: string;
  numOrder: number;
  score: number;
  stageId?: string;
  sectionId?: string;
}) {
  return await prisma.palmares.create({
    data: {
      userId: data.userId,
      stageLength: data.stageLength,
      stageNumOrder: data.stageNumOrder,
      statusStage: 'CURRENT',
      sectionNumOrder: data.sectionNumOrder,
      statusSection: 'CURRENT',
      statusJeu: 'CURRENT',
      niveau: data.niveau,
      langue: data.langue as 'FR' | 'EN',
      numOrder: data.numOrder,
      score: data.score,
      isFinished: false,
      ...(data.stageId && { stageId: data.stageId }),
      ...(data.sectionId && { sectionId: data.sectionId })
    }
  });
}

export async function getNextSection(stageId: string, sectionNumOrder: number) {
  return await prisma.section.findFirst({
    where: {
      numOrder: sectionNumOrder,
      compterSection: {
        some: {
          stageId
        }
      }
    },
    include: {
      jeux: true
    }
  });
}

export async function getNextStage(stageNumOrder: number) {
  const stage = await prisma.stage.findFirst({
    where: {
      numOrder: stageNumOrder
    },
    include: {
      descriptions: true
    }
  });

  if (!stage) return null;

  const sections = await prisma.section.findMany({
    where: {
      jeux: {
        some: {
          stageId: stage.id
        }
      }
    },
    select: {
      id: true,
      niveau: true,
      jeux: {
        select: {
          id: true,
          niveau: true
        }
      }
    }
  });

  return {
    id: stage.id,
    niveau: stage.niveau,
    image: stage.image,
    descriptions: stage.descriptions.map(d => d.texte).join(' '),
    stageNumOrder: stage.numOrder,
    sections
  };
}

export async function updatePalmaresStageStatus(userId: string, stageNumOrder: number) {
  return await prisma.palmares.updateMany({
    where: {
      userId,
      stageNumOrder
    },
    data: {
      statusStage: 'VALIDATED'
    }
  });
}

export async function getJeuBySectionNumOrder(userId: string, sectionNumOrder: number) {
  const palmares = await prisma.palmares.findFirst({
    where: {
      userId,
      sectionNumOrder
    },
    include: {
      jeu: {
        include: {
          questions: {
            include: {
              reponses: true
            },
            orderBy: {
              orderNum: 'asc'
            }
          }
        }
      }
    }
  });

  if (!palmares || !palmares.jeu) {
    throw new Error('Jeu not found');
  }

  return palmares.jeu;
}

export async function startGame(userId: string) {
  // Get user from db
  let user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  // If user not in db, create it
  if (!user) {
    const clerkUser = await (await clerkClient()).users.getUser(userId);
    if (!clerkUser) {
      throw new Error('User not found in Clerk');
    }

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        langue: 'FR', // default
        role: 'JOUEUR'
      }
    });
  }

  // Check if user has any palmares
  const existingPalmares = await prisma.palmares.findFirst({
    where: { userId: user.id }
  });

  if (existingPalmares) {
    return { redirect: true };
  }

  // Find first stage
  const firstStage = await prisma.stage.findFirst({
    where: { numOrder: 1 }
  });

  if (!firstStage) {
    throw new Error('No stages found');
  }

  // Find first section that has jeux in this stage
  const firstSection = await prisma.section.findFirst({
    where: {
      numOrder: 1,
      jeux: {
        some: {
          stageId: firstStage.id
        }
      }
    }
  });

  if (!firstSection) {
    throw new Error('No sections found');
  }

  // Find first jeu in this section and stage
  const firstJeu = await prisma.jeu.findFirst({
    where: {
      sectionId: firstSection.id,
      stageId: firstStage.id,
      numOrder: 1
    }
  });

  if (!firstJeu) {
    throw new Error('No jeux found');
  }

  // Create palmares
  await prisma.palmares.create({
    data: {
      userId: user.id,
      stageLength: 1,
      statusStage: 'CURRENT',
      stageNumOrder: 1,
      statusSection: 'CURRENT',
      sectionNumOrder: 1,
      statusJeu: 'CURRENT',
      langue: user.langue as 'FR' | 'EN' | 'ES' | 'PT' | 'DE',
      score: 0,
      isFinished: false,
      stageId: firstStage.id,
      sectionId: firstSection.id,
      jeuId: firstJeu.id,
      niveau: firstJeu.niveau,
      numOrder: 1
    }
  });

  return { redirect: true };
}

export async function handleNextGame(clerkId: string, score: number) {
  // Get user from db
  const user = await prisma.user.findUnique({
    where: { clerkId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get current palmares with isFinished=false
  const currentPalmares = await prisma.palmares.findFirst({
    where: {
      userId: user.id,
      isFinished: false
    },
    include: {
      stage: true
    }
  });

  if (!currentPalmares) {
    throw new Error('No current palmares found');
  }

  const stage = currentPalmares.stage;
  if (!stage) {
    throw new Error('No stage found');
  }

  // Assume total stages is 5
  const totalStages = 5;

  // Update current palmares
  const newStatusStage = currentPalmares.stageLength < totalStages ? 'CURRENT' : 'VALIDATED';

  await prisma.palmares.update({
    where: { id: currentPalmares.id },
    data: {
      statusStage: newStatusStage,
      statusSection: 'VALIDATED',
      statusJeu: 'VALIDATED',
      score,
      isFinished: true
    }
  });

  // Create new palmares
  const newStageNumOrder = currentPalmares.stageNumOrder + 1;
  const newSectionNumOrder = currentPalmares.sectionNumOrder + 1;
  const newStageLength = currentPalmares.stageLength + 1;

  // Find next stage
  const nextStage = await prisma.stage.findFirst({
    where: { numOrder: newStageNumOrder }
  });

  if (!nextStage) {
    throw new Error('Next stage not found');
  }

  // Find next section
  const nextSection = await prisma.section.findFirst({
    where: {
      numOrder: newSectionNumOrder,
      jeux: {
        some: {
          stageId: nextStage.id
        }
      }
    }
  });

  if (!nextSection) {
    throw new Error('Next section not found');
  }

  // Find next jeu
  const nextJeu = await prisma.jeu.findFirst({
    where: {
      sectionId: nextSection.id,
      stageId: nextStage.id,
      numOrder: 1 // Assume first jeu
    }
  });

  if (!nextJeu) {
    throw new Error('Next jeu not found');
  }

  // Create new palmares
  await prisma.palmares.create({
    data: {
      userId: user.id,
      stageLength: newStageLength,
      statusStage: 'CURRENT',
      stageNumOrder: newStageNumOrder,
      statusSection: 'CURRENT',
      sectionNumOrder: newSectionNumOrder,
      statusJeu: 'CURRENT',
      langue: (user.langue as Langue) || Langue.FR,
      score: 0,
      isFinished: false,
      stageId: nextStage.id,
      sectionId: nextSection.id,
      jeuId: nextJeu.id,
      niveau: nextJeu.niveau,
      numOrder: currentPalmares.numOrder + 1
    }
  });

  return { redirect: '/fr/joueur/board' };
}

export async function finishGame(userId: string, score: number) {
  // Note: userId should be passed from client
  // Get current palmares
  const currentPalmares = await prisma.palmares.findFirst({
    where: {
      userId,
      statusJeu: 'CURRENT'
    },
    include: {
      stage: true,
      section: true,
      jeu: true
    }
  });

  if (!currentPalmares) {
    throw new Error('No current palmares found');
  }

  if (score > 80) {
    // Update current palmares
    await prisma.palmares.update({
      where: { id: currentPalmares.id },
      data: {
        score,
        isFinished: true,
        statusJeu: 'VALIDATED',
        statusSection: 'VALIDATED'
      }
    });

    // Reset previous jeu scores
    await resetPreviousJeuScore(userId);

    // Get total sections for current stage
    const totalSections = await prisma.section.count({
      where: {
        jeux: {
          some: {
            stageId: currentPalmares.stageId!
          }
        }
      }
    });

    if (currentPalmares.stageLength < totalSections) {
      // Advance to next section in same stage
      const nextSectionNumOrder = currentPalmares.sectionNumOrder + 1;
      const nextSection = await prisma.section.findFirst({
        where: {
          numOrder: nextSectionNumOrder,
          jeux: {
            some: {
              stageId: currentPalmares.stageId!
            }
          }
        }
      });

      if (!nextSection) {
        throw new Error('Next section not found');
      }

      const nextJeu = await prisma.jeu.findFirst({
        where: {
          sectionId: nextSection.id,
          stageId: currentPalmares.stageId!
        }
      });

      if (!nextJeu) {
        throw new Error('Next jeu not found');
      }

      // Create new palmares
      await prisma.palmares.create({
        data: {
          userId,
          stageLength: currentPalmares.stageLength + 1,
          stageId: currentPalmares.stageId!,
          statusStage: 'CURRENT',
          stageNumOrder: currentPalmares.stageNumOrder,
          sectionId: nextSection.id,
          statusSection: 'CURRENT',
          sectionNumOrder: nextSectionNumOrder,
          jeuId: nextJeu.id,
          statusJeu: 'CURRENT',
          niveau: nextJeu.niveau,
          langue: currentPalmares.langue,
          numOrder: currentPalmares.numOrder + 1,
          score: 0,
          isFinished: false
        }
      });

      return { redirect: 'jeu', jeuId: nextJeu.id };
    } else {
      // Advance to next stage
      const nextStageNumOrder = currentPalmares.stageNumOrder + 1;
      const nextStage = await prisma.stage.findFirst({
        where: { numOrder: nextStageNumOrder }
      });

      if (!nextStage) {
        throw new Error('Next stage not found');
      }

      const nextSection = await prisma.section.findFirst({
        where: {
          numOrder: 1,
          jeux: {
            some: {
              stageId: nextStage.id
            }
          }
        }
      });

      if (!nextSection) {
        throw new Error('Next section not found');
      }

      const nextJeu = await prisma.jeu.findFirst({
        where: {
          sectionId: nextSection.id,
          stageId: nextStage.id
        }
      });

      if (!nextJeu) {
        throw new Error('Next jeu not found');
      }

      // Create new palmares
      await prisma.palmares.create({
        data: {
          userId,
          stageLength: 1, // Reset for new stage
          stageId: nextStage.id,
          statusStage: 'CURRENT',
          stageNumOrder: nextStageNumOrder,
          sectionId: nextSection.id,
          statusSection: 'CURRENT',
          sectionNumOrder: 1,
          jeuId: nextJeu.id,
          statusJeu: 'NEW', // Set to NEW until started
          niveau: nextJeu.niveau,
          langue: currentPalmares.langue,
          numOrder: currentPalmares.numOrder + 1,
          score: 0,
          isFinished: false
        }
      });

      return { redirect: 'board', stage: nextStage };
    }
  } else {
    // Score <= 80, perhaps stay or retry, but not specified
    return { redirect: 'none' };
  }
}