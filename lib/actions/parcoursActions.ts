"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  GameBoardStatus,
  Langue,
} from "@/lib/generated/prisma/index.js";
import {
  resolveSectionsForStage,
  type SectionAnswerPayload,
} from "@/lib/actions/boardActions";

async function loadUserOrThrow(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");
  return user;
}

function isActiveStageNiveau(niveau: string) {
  return niveau === "Stage 1" || niveau === "1";
}

function isSectionPlayable(status: GameBoardStatus) {
  return (
    status === GameBoardStatus.EN_COURS ||
    status === GameBoardStatus.COMPLETED
  );
}

async function loadSectionWithJeux(sectionId: string, stageId: string) {
  return prisma.section.findFirst({
    where: { id: sectionId },
    include: {
      jeux: {
        where: { sectionId, stageId },
        orderBy: { numOrder: "asc" },
        include: {
          questions: {
            orderBy: { orderNum: "asc" },
            include: { reponses: true },
          },
        },
      },
    },
  });
}

function flattenSectionQuestions(
  section: NonNullable<Awaited<ReturnType<typeof loadSectionWithJeux>>>,
) {
  const questions: {
    id: string;
    intitule: string;
    reponses: { id: string; intitule: string; isCorrect: boolean }[];
  }[] = [];

  const jeux = [...section.jeux].sort((a, b) => a.numOrder - b.numOrder);
  for (const jeu of jeux) {
    const qs = [...jeu.questions].sort((a, b) => a.orderNum - b.orderNum);
    for (const q of qs) {
      questions.push({
        id: q.id,
        intitule: q.intitule,
        reponses: q.reponses.map((r) => ({
          id: r.id,
          intitule: r.intitule,
          isCorrect: r.isCorrect,
        })),
      });
    }
  }
  return questions;
}

/**
 * Ensures a GameBoard exists for the stage, creates missing GameBoardSection rows,
 * sets the board EN_COURS, and activates the first playable section if needed.
 */
export async function prepareParcoursStage(userId: string, stageId: string) {
  const stage = await prisma.stage.findFirst({
    where: { id: stageId, langue: Langue.FR },
  });
  if (!stage) throw new Error("Stage introuvable");

  const sections = await resolveSectionsForStage(stageId);

  let board = await prisma.gameBoard.findFirst({
    where: { userId, stageId },
    include: {
      gameBoardSections: {
        include: { section: true },
      },
    },
  });

  if (!board) {
    board = await prisma.gameBoard.create({
      data: {
        userId,
        stageId: stage.id,
        stageTitle: stage.title,
        stageNiveau: stage.niveau,
        stageImage: stage.image,
        status: GameBoardStatus.INACTIVE,
      },
      include: {
        gameBoardSections: {
          include: { section: true },
        },
      },
    });
  }

  const existingSectionIds = new Set(
    board.gameBoardSections.map((row) => row.sectionId),
  );
  const missingSections = sections.filter((s) => !existingSectionIds.has(s.id));

  if (missingSections.length > 0) {
    const hasActiveSection = board.gameBoardSections.some(
      (row) => row.sectionStatus === GameBoardStatus.EN_COURS,
    );
    const firstMissingId = sections.find((s) => !existingSectionIds.has(s.id))?.id;

    await prisma.gameBoardSection.createMany({
      data: missingSections.map((section) => ({
        gameBoardId: board!.id,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionNiveau: section.niveau,
        sectionImage: section.image || "/picintro.jpg",
        sectionStatus:
          !hasActiveSection && section.id === firstMissingId
            ? GameBoardStatus.EN_COURS
            : GameBoardStatus.INACTIVE,
      })),
      skipDuplicates: true,
    });
  }

  await prisma.gameBoard.updateMany({
    where: { userId, id: { not: board.id } },
    data: { status: GameBoardStatus.INACTIVE },
  });

  await prisma.gameBoard.update({
    where: { id: board.id },
    data: { status: GameBoardStatus.EN_COURS },
  });

  const refreshed = await prisma.gameBoard.findUnique({
    where: { id: board.id },
    include: {
      gameBoardSections: {
        include: { section: true },
      },
    },
  });
  if (!refreshed) return;

  const orderedRows = [...refreshed.gameBoardSections].sort(
    (a, b) => (a.section?.numOrder ?? 0) - (b.section?.numOrder ?? 0),
  );

  const hasActiveSection = orderedRows.some(
    (row) => row.sectionStatus === GameBoardStatus.EN_COURS,
  );

  if (!hasActiveSection && orderedRows.length > 0) {
    const toActivate =
      orderedRows.find(
        (row) =>
          row.sectionStatus !== GameBoardStatus.COMPLETED &&
          !row.sectionAccomplished,
      ) ?? orderedRows[0];

    await prisma.gameBoardSection.update({
      where: { id: toActivate.id },
      data: { sectionStatus: GameBoardStatus.EN_COURS },
    });
  }
}

/** Prepares board sections then redirects to the stage sections page. */
export async function commenceParcoursStage(stageId: string) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    redirectToSignIn({
      returnBackUrl: `/fr/joueur/parcours/stage/${stageId}`,
    });
  }

  const user = await loadUserOrThrow(userId!);
  await prepareParcoursStage(user.id, stageId);
  redirect(`/fr/joueur/parcours/stage/${stageId}`);
}

export async function getParcoursStagePageData(stageId: string) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({
      returnBackUrl: `/fr/joueur/parcours/stage/${stageId}`,
    });
  }

  const user = await loadUserOrThrow(userId);

  const stage = await prisma.stage.findFirst({
    where: { id: stageId, langue: Langue.FR },
    select: { id: true, title: true, niveau: true, image: true },
  });
  if (!stage) redirect("/fr/joueur/parcours");

  await prepareParcoursStage(user.id, stageId);

  const board = await prisma.gameBoard.findFirst({
    where: { userId: user.id, stageId },
    include: {
      gameBoardSections: {
        include: { section: true },
      },
    },
  });

  const orderedRows = [...(board?.gameBoardSections ?? [])].sort(
    (a, b) => (a.section?.numOrder ?? 0) - (b.section?.numOrder ?? 0),
  );

  const sections = orderedRows.map((row, index) => ({
    id: row.sectionId,
    title: row.sectionTitle,
    niveau: row.sectionNiveau,
    image: row.sectionImage,
    numOrder: row.section?.numOrder ?? index + 1,
    status: row.sectionStatus,
    unlocked: isSectionPlayable(row.sectionStatus),
    isActive: row.sectionStatus === GameBoardStatus.EN_COURS,
    isCompleted:
      row.sectionStatus === GameBoardStatus.COMPLETED ||
      row.sectionAccomplished,
  }));

  const playableCount = sections.filter((s) => s.unlocked).length;

  return { stage, sections, playableCount };
}

export async function getParcoursSectionPlayData(
  stageId: string,
  sectionId: string,
) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({
      returnBackUrl: `/fr/joueur/parcours/stage/${stageId}/section/${sectionId}`,
    });
  }

  const user = await loadUserOrThrow(userId);

  await prepareParcoursStage(user.id, stageId);

  const board = await prisma.gameBoard.findFirst({
    where: { userId: user.id, stageId },
    include: {
      gameBoardSections: {
        include: { section: true },
      },
    },
  });
  if (!board) redirect(`/fr/joueur/parcours/stage/${stageId}`);

  const boardSection = board.gameBoardSections.find(
    (row) => row.sectionId === sectionId,
  );
  if (!boardSection || !isSectionPlayable(boardSection.sectionStatus)) {
    redirect(`/fr/joueur/parcours/stage/${stageId}`);
  }

  const stageSections = await resolveSectionsForStage(stageId);
  if (!stageSections.some((s) => s.id === sectionId)) {
    redirect(`/fr/joueur/parcours/stage/${stageId}`);
  }

  const section = await loadSectionWithJeux(sectionId, stageId);
  if (!section) redirect(`/fr/joueur/parcours/stage/${stageId}`);

  const questions = flattenSectionQuestions(section);
  const jeu = section.jeux[0];

  return {
    section: {
      id: section.id,
      title: section.title,
      image: section.image,
      numOrder: section.numOrder,
    },
    jeu: jeu ? { id: jeu.id, niveau: jeu.niveau } : { id: "", niveau: "" },
    questions,
  };
}

export async function completeParcoursSection(
  stageId: string,
  sectionId: string,
  answers: SectionAnswerPayload[],
): Promise<{ ok: false; message: string } | undefined> {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    redirectToSignIn({
      returnBackUrl: `/fr/joueur/parcours/stage/${stageId}/section/${sectionId}`,
    });
    return { ok: false, message: "Non authentifié." };
  }

  const user = await loadUserOrThrow(userId);

  const board = await prisma.gameBoard.findFirst({
    where: { userId: user.id, stageId },
    include: {
      gameBoardSections: {
        include: { section: true },
      },
    },
  });
  if (!board) {
    return { ok: false, message: "Parcours introuvable pour ce stage." };
  }

  const boardSection = board.gameBoardSections.find(
    (row) => row.sectionId === sectionId,
  );
  if (!boardSection || !isSectionPlayable(boardSection.sectionStatus)) {
    return { ok: false, message: "Section non disponible." };
  }

  if (
    boardSection.sectionStatus === GameBoardStatus.COMPLETED ||
    boardSection.sectionAccomplished
  ) {
    return { ok: false, message: "Cette section est déjà validée." };
  }

  const section = await loadSectionWithJeux(sectionId, stageId);
  if (!section) {
    return { ok: false, message: "Section introuvable." };
  }

  const questionsFlat = flattenSectionQuestions(section);
  if (questionsFlat.length === 0) {
    return { ok: false, message: "Aucune question pour cette section." };
  }

  if (answers.length !== questionsFlat.length) {
    return { ok: false, message: "Réponses incomplètes." };
  }

  let score = 0;
  for (const q of questionsFlat) {
    const a = answers.find((x) => x.questionId === q.id);
    if (!a) return { ok: false, message: "Réponses invalides." };
    const rep = q.reponses.find((r) => r.id === a.reponseId);
    if (!rep) return { ok: false, message: "Réponse non reconnue." };
    if (rep.isCorrect) score++;
  }

  const ratio = score / questionsFlat.length;
  if (ratio < 0.8) {
    return { ok: false, message: "Score insuffisant (minimum 80%)." };
  }

  const orderedRows = [...board.gameBoardSections].sort(
    (a, b) => (a.section?.numOrder ?? 0) - (b.section?.numOrder ?? 0),
  );

  await prisma.gameBoardSection.update({
    where: { id: boardSection.id },
    data: {
      sectionStatus: GameBoardStatus.COMPLETED,
      sectionAccomplished: true,
    },
  });

  const stageSections = await resolveSectionsForStage(stageId);
  const completedSectionIds = new Set(
    orderedRows
      .filter(
        (row) =>
          row.id === boardSection.id ||
          row.sectionStatus === GameBoardStatus.COMPLETED ||
          row.sectionAccomplished,
      )
      .map((row) => row.sectionId),
  );
  const allSectionsDone =
    stageSections.length > 0 &&
    stageSections.every((section) => completedSectionIds.has(section.id));

  if (allSectionsDone) {
    await prisma.gameBoard.update({
      where: { id: board.id },
      data: {
        status: GameBoardStatus.COMPLETED,
        validated: true,
      },
    });

    const currentStage = await prisma.stage.findFirst({
      where: { id: stageId, langue: Langue.FR },
    });

    if (currentStage) {
      const nextStage = await prisma.stage.findFirst({
        where: { langue: Langue.FR, numOrder: currentStage.numOrder + 1 },
        orderBy: { numOrder: "asc" },
      });

      if (nextStage) {
        await ensureGameBoard(user.id);

        let nextBoard = await prisma.gameBoard.findFirst({
          where: { userId: user.id, stageId: nextStage.id },
          include: {
            gameBoardSections: {
              include: { section: true },
            },
          },
        });

        if (!nextBoard) {
          nextBoard = await prisma.gameBoard.create({
            data: {
              userId: user.id,
              stageId: nextStage.id,
              stageTitle: nextStage.title,
              stageNiveau: nextStage.niveau,
              stageImage: nextStage.image,
              status: GameBoardStatus.INACTIVE,
            },
            include: {
              gameBoardSections: {
                include: { section: true },
              },
            },
          });
        }

        await prisma.gameBoard.updateMany({
          where: {
            userId: user.id,
            id: { not: nextBoard.id },
            status: GameBoardStatus.EN_COURS,
          },
          data: { status: GameBoardStatus.INACTIVE },
        });

        await prisma.gameBoard.update({
          where: { id: nextBoard.id },
          data: { status: GameBoardStatus.EN_COURS },
        });

        const nextOrderedRows = [...nextBoard.gameBoardSections].sort(
          (a, b) => (a.section?.numOrder ?? 0) - (b.section?.numOrder ?? 0),
        );
        const nextSectionToActivate =
          nextOrderedRows.find(
            (row) =>
              row.sectionStatus !== GameBoardStatus.COMPLETED &&
              !row.sectionAccomplished,
          ) ?? nextOrderedRows[0];

        if (nextSectionToActivate) {
          await prisma.gameBoardSection.updateMany({
            where: {
              gameBoardId: nextBoard.id,
              sectionStatus: GameBoardStatus.EN_COURS,
              id: { not: nextSectionToActivate.id },
            },
            data: { sectionStatus: GameBoardStatus.INACTIVE },
          });

          await prisma.gameBoardSection.update({
            where: { id: nextSectionToActivate.id },
            data: { sectionStatus: GameBoardStatus.EN_COURS },
          });
        }
      }
    }

    redirect("/fr/joueur/parcours");
  }

  const nextSection = orderedRows.find(
    (row) =>
      row.id !== boardSection.id &&
      row.sectionStatus !== GameBoardStatus.COMPLETED &&
      !row.sectionAccomplished,
  );

  if (nextSection) {
    await prisma.gameBoardSection.update({
      where: { id: nextSection.id },
      data: { sectionStatus: GameBoardStatus.EN_COURS },
    });
  }

  redirect(`/fr/joueur/parcours/stage/${stageId}`);
}

/**
 * Ensures one GameBoard per FR stage and GameBoardSection rows for each related section.
 * Stage 1 is EN_COURS when the board is first created.
 */
export async function ensureGameBoard(userId: string) {
  const [existingBoards, existingSections] = await Promise.all([
    prisma.gameBoard.findMany({ where: { userId } }),
    prisma.gameBoardSection.findMany({
      where: { gameBoard: { userId } },
      select: { gameBoardId: true, sectionId: true },
    }),
  ]);

  const boardByStageId = new Map(
    existingBoards.map((board) => [board.stageId, board]),
  );
  const sectionsByBoardId = new Map<string, Set<string>>();
  const existingSectionIds = new Set<string>();

  for (const row of existingSections) {
    existingSectionIds.add(row.sectionId);
    const boardSections =
      sectionsByBoardId.get(row.gameBoardId) ?? new Set<string>();
    boardSections.add(row.sectionId);
    sectionsByBoardId.set(row.gameBoardId, boardSections);
  }

  const stages = await prisma.stage.findMany({
    where: { langue: Langue.FR },
    orderBy: { numOrder: "asc" },
  });

  const isFirstBoard = existingBoards.length === 0;
  const seenSectionIds = new Set<string>();

  for (const stage of stages) {
    const sections = await resolveSectionsForStage(stage.id);
    const stageActive = isActiveStageNiveau(stage.niveau);

    let board = boardByStageId.get(stage.id);
    if (!board) {
      board = await prisma.gameBoard.create({
        data: {
          userId,
          stageId: stage.id,
          stageTitle: stage.title,
          stageNiveau: stage.niveau,
          stageImage: stage.image,
          status:
            isFirstBoard && stageActive
              ? GameBoardStatus.EN_COURS
              : GameBoardStatus.INACTIVE,
        },
      });
      boardByStageId.set(stage.id, board);
      sectionsByBoardId.set(board.id, new Set());
    }

    const boardSectionIds =
      sectionsByBoardId.get(board.id) ?? new Set<string>();

    const sectionRows = sections.flatMap((section, index) => {
      if (
        boardSectionIds.has(section.id) ||
        existingSectionIds.has(section.id) ||
        seenSectionIds.has(section.id)
      ) {
        return [];
      }
      seenSectionIds.add(section.id);
      boardSectionIds.add(section.id);

      return [
        {
          gameBoardId: board.id,
          sectionId: section.id,
          sectionTitle: section.title,
          sectionNiveau: section.niveau,
          sectionImage: section.image || "/picintro.jpg",
          sectionStatus:
            isFirstBoard && stageActive && index === 0
              ? GameBoardStatus.EN_COURS
              : GameBoardStatus.INACTIVE,
        },
      ];
    });

    sectionsByBoardId.set(board.id, boardSectionIds);

    if (sectionRows.length > 0) {
      await prisma.gameBoardSection.createMany({
        data: sectionRows,
        skipDuplicates: true,
      });
    }
  }
}

export async function getParcoursPageData() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur/parcours" });
  }

  const user = await loadUserOrThrow(userId);
  await ensureGameBoard(user.id);

  const stages = await prisma.stage.findMany({
    where: { langue: Langue.FR },
    orderBy: [{ numOrder: "asc" }, { niveau: "asc" }],
    select: {
      id: true,
      title: true,
      image: true,
      niveau: true,
      numOrder: true,
    },
  });

  const activeBoardRow = await prisma.gameBoard.findFirst({
    where: {
      userId: user.id,
      status: GameBoardStatus.EN_COURS,
    },
    orderBy: { createdAt: "asc" },
    select: { stageId: true, stageNiveau: true },
  });

  const fallbackStage =
    stages.find((s) => isActiveStageNiveau(s.niveau)) ?? stages[0] ?? null;

  const activeStageId = activeBoardRow?.stageId ?? fallbackStage?.id ?? null;
  const activeStageNiveau =
    activeBoardRow?.stageNiveau ?? fallbackStage?.niveau ?? "Stage 1";

  return {
    stages,
    activeStageId,
    activeStageNiveau,
  };
}
