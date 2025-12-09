"use server";

import { Langue } from "../generated/prisma/index.js";
import { prisma } from "../prisma";


export type StageInput = {
  title: string;
  niveau: string;
  image: string;
  numOrder: number | string;
  langue: Langue; // Change from string to Langue
};

export async function createStage(data: StageInput) {
  const { title, niveau, image, numOrder, langue } = data;

  const stage = await prisma.stage.create({
    data: {
      title,
      niveau,
      image,
      numOrder: Number(numOrder),
      langue: langue || Langue.FR, // Use enum value
    },
  });

  return stage;
}

//// Delete
export async function deleteStage(id: string) {
  try {
    await prisma.stage.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting stage:", error);
    return { success: false };
  }
}

/////Edit
export type UpdateStageInput = {
  id: string;
  title?: string;
  niveau?: string;
  image?: string;
  numOrder?: number | string;
};

export async function updateStage(input: UpdateStageInput) {
  const { id, title, niveau, image, numOrder } = input;

  // Replace the any type with a proper type
  const data: Partial<{
    title: string;
    niveau: string;
    image: string;
    numOrder: number;
  }> = {};
  if (title !== undefined) data.title = title;
  if (niveau !== undefined) data.niveau = niveau;
  if (image !== undefined) data.image = image;
  if (numOrder !== undefined) data.numOrder = Number(numOrder);

  const stage = await prisma.stage.update({
    where: { id },
    data,
  });

  return stage;
}

///Get all Stages

export async function getAllStages() {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: { numOrder: "asc" },
      include: {
        descriptions: true,
        jeux: {
          // Change from sections to jeux
          orderBy: { numOrder: "asc" },
        },
      },
    });
    return stages;
  } catch (error) {
    console.error("Error fetching stages:", error);
    return [];
  }
}

///Get all Stages with CURRENT status
export async function getCurrentStages() {
  try {
    const stages = await prisma.stage.findMany({
      where: { statusStage: "CURRENT" },
      orderBy: { numOrder: "asc" },
      include: {
        descriptions: true,
        jeux: {
          orderBy: { numOrder: "asc" },
        },
      },
    });
    return stages;
  } catch (error) {
    console.error("Error fetching current stages:", error);
    return [];
  }
}

///Get Stage with numOrder === 1 and set status to CURRENT
export async function getAndSetCurrentStageByNumOrder() {
  try {
    const stagesWithNumOrder1 = await prisma.stage.findMany({
      where: { numOrder: 1 },
      include: {
        descriptions: true,
        jeux: {
          orderBy: { numOrder: "asc" },
        },
      },
    });

    const updatePromises = stagesWithNumOrder1.map((stage) =>
      prisma.stage.update({
        where: { id: stage.id },
        data: { statusStage: "CURRENT" },
        include: {
          descriptions: true,
          jeux: {
            orderBy: { numOrder: "asc" },
          },
        },
      })
    );

    const updatedStages = await Promise.all(updatePromises);
    return updatedStages;
  } catch (error) {
    console.error("Error fetching and updating stages:", error);
    return [];
  }
}

///Get sections related to stages with numOrder === 1, then update sections with numOrder === 1 to CURRENT
export async function getAndSetCurrentSectionsFromStages() {
	try {
		// Get stages with numOrder === 1
		const stages = await prisma.stage.findMany({
			where: { numOrder: 1 },
			include: {
				jeux: {
					include: {
						section: true,
					},
				},
			},
		});

		// Extract unique sections with numOrder === 1
		const sectionsToUpdate = new Set<string>();
		stages.forEach((stage) => {
			stage.jeux.forEach((jeu) => {
				if (jeu.section && jeu.section.numOrder === 1) {
					sectionsToUpdate.add(jeu.section.id);
				}
			});
		});

		// Update sections to CURRENT
		const updatePromises = Array.from(sectionsToUpdate).map((sectionId) =>
			prisma.section.update({
				where: { id: sectionId },
				data: { statusSection: "CURRENT" },
			})
		);

		const updatedSections = await Promise.all(updatePromises);
		return updatedSections;
	} catch (error) {
		console.error("Error updating sections:", error);
		return [];
	}
}
