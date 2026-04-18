"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GameBookKind, GameBookStatus } from "@/lib/generated/prisma/index.js";

async function loadUserOrThrow(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

/** Active run: one STAGE row in progress for this user. */
export async function getActiveStageBook(userId: string) {
  return prisma.gameBook.findFirst({
    where: {
      userId,
      kind: GameBookKind.STAGE,
      stageStatus: GameBookStatus.EN_COURS,
      stageAccomplished: false,
    },
    orderBy: { updatedAt: "desc" },
    include: { stage: true },
  });
}

export async function completedSectionIdsForStage(
  userId: string,
  sectionIds: string[],
): Promise<Set<string>> {
  if (sectionIds.length === 0) return new Set();
  const books = await prisma.gameBook.findMany({
    where: {
      userId,
      kind: GameBookKind.SECTION,
      targetId: { in: sectionIds },
      sectionValidated: true,
      sectionStatus: GameBookStatus.VALIDE,
    },
  });
  return new Set(books.map((b) => b.targetId));
}

/** Smallest numOrder not yet validated; if all done, returns last numOrder + 1. */
function nextPlayableNumOrder(
  sections: { id: string; numOrder: number }[],
  doneIds: Set<string>,
): number {
  const sorted = [...sections].sort((a, b) => a.numOrder - b.numOrder);
  for (const s of sorted) {
    if (!doneIds.has(s.id)) return s.numOrder;
  }
  const last = sorted[sorted.length - 1];
  return last ? last.numOrder + 1 : 1;
}

/**
 * Union: sections with `stageId`, plus any section referenced by a `Jeu` of this stage
 * (avoids missing rows when only some sections have `stageId` set).
 */
export async function resolveSectionsForStage(stageId: string) {
  const byRelation = await prisma.section.findMany({
    where: { stageId },
  });

  const jeuRows = await prisma.jeu.findMany({
    where: { stageId, sectionId: { not: null } },
    select: { sectionId: true },
    distinct: ["sectionId"],
  });
  const fromJeuIds = jeuRows
    .map((r) => r.sectionId)
    .filter((id): id is string => id != null);

  const fromJeux =
    fromJeuIds.length > 0
      ? await prisma.section.findMany({
          where: { id: { in: fromJeuIds } },
        })
      : [];

  const merged = new Map<string, (typeof byRelation)[0]>();
  for (const s of [...byRelation, ...fromJeux]) {
    merged.set(s.id, s);
  }

  return [...merged.values()].sort((a, b) => a.numOrder - b.numOrder);
}

export async function getStagePageData() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }
  const user = await loadUserOrThrow(userId);

  const activeBook = await getActiveStageBook(user.id);

  const stage = activeBook
    ? await prisma.stage.findUnique({
        where: { id: activeBook.stageId },
        include: { descriptions: true },
      })
    : await prisma.stage.findFirst({
        where: { numOrder: 1 },
        include: { descriptions: true },
      });

  if (!stage) {
    redirect("/fr/joueur");
  }

  return { stage };
}

/** Ensures a STAGE GameBook exists, then sends the player to the gameboard. */
export async function commenceGame() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }
  const user = await loadUserOrThrow(userId);

  let active = await getActiveStageBook(user.id);

  if (!active) {
    const stageCount = await prisma.stage.count();
    const completedStages = await prisma.gameBook.count({
      where: {
        userId: user.id,
        kind: GameBookKind.STAGE,
        stageValidated: true,
        stageStatus: GameBookStatus.VALIDE,
      },
    });
    if (stageCount > 0 && completedStages >= stageCount) {
      redirect("/fr/joueur/stage/felicitation");
    }

    const firstStage = await prisma.stage.findFirst({
      orderBy: { numOrder: "asc" },
    });
    if (!firstStage) {
      redirect("/fr/joueur");
    }
    const introSections = await resolveSectionsForStage(firstStage.id);
    const firstSection = introSections[0] ?? null;
    active = await prisma.gameBook.create({
      data: {
        userId: user.id,
        kind: GameBookKind.STAGE,
        targetId: firstStage.id,
        stageId: firstStage.id,
        sectionId: firstSection?.id ?? null,
        stageStatus: GameBookStatus.EN_COURS,
        stageValidated: false,
        stageNiveau: firstStage.niveau,
        stageNumOrder: firstStage.numOrder,
        stageAccomplished: false,
        sectionValidated: false,
        sectionStatus: GameBookStatus.EN_COURS,
        sectionNiveau: firstSection?.niveau ?? "Session 1",
        sectionNumOrsder: firstSection?.numOrder ?? 1,
        sectionAccomplished: false,
      },
      include: { stage: true },
    });
  }

  redirect("/fr/joueur/stage/gameboard");
}

/** @deprecated Use commenceGame */
export async function handleCommenconsClick() {
  return commenceGame();
}

export type GameboardSectionVM = {
  id: string;
  title: string;
  image: string;
  numOrder: number;
  unlocked: boolean;
  completed: boolean;
};

export async function getGameboardPageData() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }
  const user = await loadUserOrThrow(userId);

  const activeBook = await getActiveStageBook(user.id);
  if (!activeBook) {
    redirect("/fr/joueur/stage");
  }

  const stage = await prisma.stage.findUnique({
    where: { id: activeBook.stageId },
  });

  if (!stage) {
    redirect("/fr/joueur/stage");
  }

  const stageSections = await resolveSectionsForStage(stage.id);
  const sectionIds = stageSections.map((s) => s.id);
  const doneIds = await completedSectionIdsForStage(user.id, sectionIds);
  const thresholdOrder = nextPlayableNumOrder(stageSections, doneIds);

  const sections: GameboardSectionVM[] = stageSections.map((s) => ({
    id: s.id,
    title: s.title,
    image: s.image,
    numOrder: s.numOrder,
    unlocked: s.numOrder <= thresholdOrder,
    completed: doneIds.has(s.id),
  }));

  return {
    stage: {
      id: stage.id,
      title: stage.title,
      niveau: stage.niveau,
      image: stage.image,
    },
    sections,
  };
}

export async function getSectionPlayData(sectionId: string) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }
  const user = await loadUserOrThrow(userId);

  const activeBook = await getActiveStageBook(user.id);
  if (!activeBook) {
    redirect("/fr/joueur/stage");
  }

  const stage = await prisma.stage.findUnique({
    where: { id: activeBook.stageId },
  });
  if (!stage) {
    redirect("/fr/joueur/stage/gameboard");
  }

  const stageSections = await resolveSectionsForStage(stage.id);
  const allowedIds = new Set(stageSections.map((s) => s.id));
  if (!allowedIds.has(sectionId)) {
    redirect("/fr/joueur/stage/gameboard");
  }

  const section = await prisma.section.findFirst({
    where: { id: sectionId },
    include: {
      jeux: {
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

  if (!section) {
    redirect("/fr/joueur/stage/gameboard");
  }

  const doneIds = await completedSectionIdsForStage(
    user.id,
    stageSections.map((s) => s.id),
  );
  const thresholdOrder = nextPlayableNumOrder(stageSections, doneIds);

  if (section.numOrder > thresholdOrder) {
    redirect("/fr/joueur/stage/gameboard");
  }

  const jeu = section.jeux[0];
  if (!jeu || !jeu.questions.length) {
    redirect("/fr/joueur/stage/gameboard");
  }

  const questions = jeu.questions.map((q) => ({
    id: q.id,
    intitule: q.intitule,
    reponses: q.reponses.map((r) => ({
      id: r.id,
      intitule: r.intitule,
      isCorrect: r.isCorrect,
    })),
  }));

  return {
    section: {
      id: section.id,
      title: section.title,
      image: section.image,
      numOrder: section.numOrder,
    },
    jeu: {
      id: jeu.id,
      niveau: jeu.niveau,
    },
    questions,
  };
}

export type SectionAnswerPayload = {
  questionId: string;
  reponseId: string;
};

/**
 * Verifies answers in DB, applies 80% rule, updates GameBook, redirects.
 * On failure returns { ok: false, message } (no redirect).
 */
export async function completeSectionPlay(
  sectionId: string,
  answers: SectionAnswerPayload[],
): Promise<{ ok: false; message: string } | undefined> {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    redirectToSignIn({ returnBackUrl: "/fr/joueur" });
    return { ok: false, message: "Non authentifié." };
  }
  const user = await loadUserOrThrow(userId);

  const activeBook = await getActiveStageBook(user.id);
  if (!activeBook) {
    return { ok: false, message: "Aucun parcours en cours." };
  }

  const stage = await prisma.stage.findUnique({
    where: { id: activeBook.stageId },
  });
  if (!stage) {
    return { ok: false, message: "Étape introuvable." };
  }

  const stageSections = await resolveSectionsForStage(stage.id);
  const allowedIds = new Set(stageSections.map((s) => s.id));
  if (!allowedIds.has(sectionId)) {
    return { ok: false, message: "Section introuvable." };
  }

  const section = await prisma.section.findFirst({
    where: { id: sectionId },
    include: {
      jeux: {
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

  if (!section) {
    return { ok: false, message: "Section introuvable." };
  }

  const doneIds = await completedSectionIdsForStage(
    user.id,
    stageSections.map((s) => s.id),
  );
  const firstIncomplete = stageSections.find((s) => !doneIds.has(s.id));
  const isReplay = doneIds.has(section.id);
  if (!isReplay && firstIncomplete && section.id !== firstIncomplete.id) {
    return { ok: false, message: "Complétez les sections dans l’ordre." };
  }

  const jeu = section.jeux[0];
  if (!jeu?.questions.length) {
    return { ok: false, message: "Aucune question pour cette section." };
  }

  const questions = jeu.questions;
  if (answers.length !== questions.length) {
    return { ok: false, message: "Réponses incomplètes." };
  }

  let score = 0;
  for (const q of questions) {
    const a = answers.find((x) => x.questionId === q.id);
    if (!a) {
      return { ok: false, message: "Réponses invalides." };
    }
    const rep = q.reponses.find((r) => r.id === a.reponseId);
    if (!rep || rep.questionId !== q.id) {
      return { ok: false, message: "Réponse non reconnue." };
    }
    if (rep.isCorrect) score++;
  }

  const ratio = score / questions.length;
  if (ratio < 0.8) {
    return { ok: false, message: "Score insuffisant (minimum 80%)." };
  }

  await prisma.gameBook.upsert({
    where: {
      userId_kind_targetId: {
        userId: user.id,
        kind: GameBookKind.SECTION,
        targetId: section.id,
      },
    },
    create: {
      userId: user.id,
      kind: GameBookKind.SECTION,
      targetId: section.id,
      stageId: stage.id,
      sectionId: section.id,
      sectionValidated: true,
      sectionAccomplished: true,
      sectionStatus: GameBookStatus.VALIDE,
      sectionNiveau: section.niveau,
      sectionNumOrsder: section.numOrder,
      stageStatus: GameBookStatus.EN_COURS,
      stageValidated: false,
      stageNiveau: stage.niveau,
      stageNumOrder: stage.numOrder,
      stageAccomplished: false,
    },
    update: {
      sectionValidated: true,
      sectionAccomplished: true,
      sectionStatus: GameBookStatus.VALIDE,
    },
  });

  const doneAfter = await completedSectionIdsForStage(
    user.id,
    stageSections.map((s) => s.id),
  );
  const allDone = stageSections.every((s) => doneAfter.has(s.id));

  if (allDone) {
    await prisma.gameBook.update({
      where: { id: activeBook.id },
      data: {
        stageValidated: true,
        stageAccomplished: true,
        stageStatus: GameBookStatus.VALIDE,
      },
    });

    const nextStage = await prisma.stage.findFirst({
      where: { numOrder: stage.numOrder + 1 },
    });

    if (nextStage) {
      const nextSections = await resolveSectionsForStage(nextStage.id);
      const nextFirst = nextSections[0] ?? null;
      await prisma.gameBook.create({
        data: {
          userId: user.id,
          kind: GameBookKind.STAGE,
          targetId: nextStage.id,
          stageId: nextStage.id,
          sectionId: nextFirst?.id ?? null,
          stageStatus: GameBookStatus.EN_COURS,
          stageValidated: false,
          stageNiveau: nextStage.niveau,
          stageNumOrder: nextStage.numOrder,
          stageAccomplished: false,
          sectionValidated: false,
          sectionStatus: GameBookStatus.EN_COURS,
          sectionNiveau: nextFirst?.niveau ?? "Session 1",
          sectionNumOrsder: nextFirst?.numOrder ?? 1,
          sectionAccomplished: false,
        },
      });
      redirect("/fr/joueur/stage");
    }

    redirect("/fr/joueur/stage/felicitation");
  }

  redirect(`/fr/joueur/stage/section/${sectionId}/bravo`);
}

export async function goToGameboardFromBravo() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur" });
  }
  await loadUserOrThrow(userId);
  redirect("/fr/joueur/stage/gameboard");
}

export async function getHeaderData() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      gameBooks: {
        where: { kind: GameBookKind.SECTION, sectionStatus: GameBookStatus.VALIDE },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          stage: true,
          section: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const activeBook = await getActiveStageBook(user.id);
  let currentProgress: {
    stageTitle: string;
    sectionTitle: string | null;
  } | null = null;

  if (activeBook) {
    const st = await prisma.stage.findUnique({
      where: { id: activeBook.stageId },
    });
    if (st) {
      const secs = await resolveSectionsForStage(st.id);
      const done = await completedSectionIdsForStage(
        user.id,
        secs.map((s) => s.id),
      );
      const next = secs.find((s) => !done.has(s.id));
      currentProgress = {
        stageTitle: st.title,
        sectionTitle: next?.title ?? null,
      };
    }
  }

  const sectionSummaries = user.gameBooks.map((gb) => ({
    id: gb.id,
    score: 0,
    jeuValide: gb.sectionValidated,
    jeu: {
      stage: gb.stage ? { title: gb.stage.title } : null,
      section: gb.section ? { title: gb.section.title } : null,
    },
  }));

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      palmares: sectionSummaries,
    },
    currentPalmares: currentProgress
      ? {
          score: 0,
          jeuValide: false,
          jeu: {
            stage: { title: currentProgress.stageTitle },
            section: currentProgress.sectionTitle
              ? { title: currentProgress.sectionTitle }
              : null,
          },
        }
      : null,
  };
}
