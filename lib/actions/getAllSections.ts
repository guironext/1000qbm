"use server";

import { prisma } from "../prisma";

export type SectionInput = {
	id?: string;
	title: string;
	image: string;
	niveau: string;
	numOrder: number | string;
};

export async function createSection(data: SectionInput) {
	const { id, title, image, niveau, numOrder } = data;

	const section = await prisma.section.create({
		data: {
			...(id ? { id } : {}),
			title,
			image,
			niveau,
			numOrder: Number(numOrder),
			langue: "FR",
		},
	});

	return section;
}

export async function deleteSection(id: string) {
	try {
		await prisma.section.delete({
			where: { id },
		});
		return { success: true };
	} catch (error) {
		console.error("Error deleting section:", error);
		return { success: false };
	}
}

export type UpdateSectionInput = {
	id: string;
	title?: string;
	image?: string;
	niveau?: string;
	numOrder?: number | string;
};

export async function updateSection(input: UpdateSectionInput) {
	const { id, title, image, niveau, numOrder } = input;

	const data: Partial<{
		title: string;
		image: string;
		niveau: string;
		numOrder: number;
	}> = {};
	if (title !== undefined) data.title = title;
	if (image !== undefined) data.image = image;
	if (niveau !== undefined) data.niveau = niveau;
	if (numOrder !== undefined) data.numOrder = Number(numOrder);

	const section = await prisma.section.update({
		where: { id },
		data,
	});

	return section;
}

///Get all Sections
export async function getAllSections() {
	try {
		const sections = await prisma.section.findMany({
			orderBy: { numOrder: "asc" },
			include: {
				jeux: {
					orderBy: { numOrder: "asc" },
					select: {
						id: true,
						image: true,
						niveau: true,
						numOrder: true,
					},
				},
			},
		});
		return sections;
	} catch (error) {
		console.error("Error fetching sections:", error);
		return [];
	}
}

///Get all Sections related to a Stage with numOrder === 1
export async function getSectionsByStageNumOrder(stageNumOrder: number) {
	try {
		// First, find the stage with the specified numOrder
		const stage = await prisma.stage.findFirst({
			where: { numOrder: stageNumOrder },
			select: { id: true }
		});

		if (!stage) {
			return [];
		}

		// Then, find all jeux that belong to this stage
		const jeux = await prisma.jeu.findMany({
			where: { stageId: stage.id },
			select: { sectionId: true }
		});

		// Get unique section IDs
		const sectionIds = [...new Set(jeux.map(jeu => jeu.sectionId).filter((id): id is string => id !== null))];

		if (sectionIds.length === 0) {
			return [];
		}

		// Finally, get all sections with those IDs
		const sections = await prisma.section.findMany({
			where: { id: { in: sectionIds } },
			orderBy: { numOrder: "asc" },
			include: {
				jeux: {
					where: { stageId: stage.id }, // Only include jeux from this stage
					orderBy: { numOrder: "asc" },
					select: {
						id: true,
						image: true,
						niveau: true,
						numOrder: true,
					},
				},
			},
		});

		return sections;
	} catch (error) {
		console.error("Error fetching sections by stage numOrder:", error);
		return [];
	}
}

///Get Section with numOrder === 1 and all its questions
export async function getSectionWithQuestions(numOrder: number = 1) {
	try {
		const section = await prisma.section.findFirst({
			where: { numOrder },
			include: {
				jeux: {
					orderBy: { numOrder: "asc" },
					include: {
						questions: {
							orderBy: { orderNum: "asc" },
							include: {
								reponses: true
							}
						}
					}
				}
			}
		});
		
		return section;
	} catch (error) {
		console.error("Error fetching section with questions:", error);
		return null;
	}
}

///Get all Sections related to current stage with status === "CURRENT"
export async function getCurrentStageSections() {
	try {
		// First, find the current stage
		const currentStage = await prisma.stage.findFirst({
			where: { statusStage: "CURRENT" },
			select: { id: true }
		});

		if (!currentStage) {
			return [];
		}

		// Then, find all jeux that belong to this stage
		const jeux = await prisma.jeu.findMany({
			where: { stageId: currentStage.id },
			select: { sectionId: true }
		});

		// Get unique section IDs
		const sectionIds = [...new Set(jeux.map(jeu => jeu.sectionId).filter((id): id is string => id !== null))];

		if (sectionIds.length === 0) {
			return [];
		}

		// Finally, get all sections with those IDs and status === "CURRENT"
		const sections = await prisma.section.findMany({
			where: { 
				id: { in: sectionIds },
				statusSection: "CURRENT"
			},
			orderBy: { numOrder: "asc" },
			include: {
				jeux: {
					where: { stageId: currentStage.id },
					orderBy: { numOrder: "asc" },
					select: {
						id: true,
						image: true,
						niveau: true,
						numOrder: true,
					},
				},
			},
		});

		return sections;
	} catch (error) {
		console.error("Error fetching current stage sections:", error);
		return [];
	}
}

///Get sections related to the current stage (statusStage === CURRENT) with numOrder === 1, then set them to CURRENT
export async function getAndSetCurrentSectionFromCurrentStage() {
	try {
		// Get stages with statusStage === CURRENT
		const currentStages = await prisma.stage.findMany({
			where: { statusStage: "CURRENT" },
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
		currentStages.forEach((stage) => {
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
				include: {
					jeux: {
						orderBy: { numOrder: "asc" },
					},
				},
			})
		);

		const updatedSections = await Promise.all(updatePromises);
		return updatedSections;
	} catch (error) {
		console.error("Error updating sections from current stage:", error);
		return [];
	}
}




