"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  GameBookKind,
  GameBookStatus,
  Langue,
} from "@/lib/generated/prisma/index.js";
import {
  completedSectionIdsForStage,
  getActiveStageBook,
  resolveSectionsForStage,
} from "@/lib/actions/boardActions";
import type { SectionAnswerPayload } from "@/lib/actions/boardActions";

async function loadUserOrThrow(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("User not found");
  return user;
}

function stageBookCreateData(
  userId: string,
  stage: { id: string; niveau: string; numOrder: number },
  firstSection: { id: string; niveau: string; numOrder: number } | null,
) {
  return {
    userId,
    kind: GameBookKind.STAGE,
    targetId: stage.id,
    stageId: stage.id,
    sectionId: firstSection?.id ?? null,
    stageValidated: false,
    stageStatus: GameBookStatus.EN_COURS,
    stageNiveau: stage.niveau,
    stageNumOrder: stage.numOrder,
    stageAccomplished: false,
    sectionValidated: false,
    sectionStatus: GameBookStatus.EN_COURS,
    sectionNiveau: firstSection?.niveau ?? "Session 1",
    sectionNumOrsder: firstSection?.numOrder ?? 1,
    sectionAccomplished: false,
  };
}

/**
 * Ensures the player has an in-progress STAGE GameBook for the nos-stages flow.
 * Creates the first row with stage/section cursors when none exists.
 */
export async function ensureNosStagesGameBook(userId: string) {
  const active = await getActiveStageBook(userId);
  if (active) return active;

  const stageCount = await prisma.stage.count({ where: { langue: Langue.FR } });
  const completedStages = await prisma.gameBook.count({
    where: {
      userId,
      kind: GameBookKind.STAGE,
      stageValidated: true,
      stageStatus: GameBookStatus.VALIDE,
      stageAccomplished: true,
    },
  });
  if (stageCount > 0 && completedStages >= stageCount) {
    return null;
  }

  const firstStage = await prisma.stage.findFirst({
    where: { langue: Langue.FR },
    orderBy: { numOrder: "asc" },
  });
  if (!firstStage) return null;

  const sections = await resolveSectionsForStage(firstStage.id);
  const firstSection = sections[0] ?? null;
  return prisma.gameBook.create({
    data: stageBookCreateData(userId, firstStage, firstSection),
    include: { stage: true },
  });
}

export async function getNosStagesListData() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur/nos-stages" });
  }
  const user = await loadUserOrThrow(userId);
  const activeBook = await ensureNosStagesGameBook(user.id);

  const stages = await prisma.stage.findMany({
    where: { langue: Langue.FR },
    orderBy: { numOrder: "asc" },
    select: {
      id: true,
      title: true,
      image: true,
      niveau: true,
      numOrder: true,
    },
  });

  return {
    stages,
    activeBook: activeBook
      ? {
          id: activeBook.id,
          stageId: activeBook.stageId,
          stageNiveau: activeBook.stageNiveau,
          stageAccomplished: activeBook.stageAccomplished,
        }
      : null,
  };
}

export async function getNosStagesStageIntroData(stageId: string) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur/nos-stages" });
  }
  const user = await loadUserOrThrow(userId);
  const activeBook = await ensureNosStagesGameBook(user.id);
  if (!activeBook || activeBook.stageId !== stageId) {
    redirect("/fr/joueur/nos-stages");
  }

  const stage = await prisma.stage.findFirst({
    where: { id: stageId, langue: Langue.FR },
    include: { descriptions: true },
  });
  if (!stage) redirect("/fr/joueur/nos-stages");

  return { stage, activeBookId: activeBook.id };
}

export async function getNosStagesSectionsListData(stageId: string) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur/nos-stages" });
  }
  const user = await loadUserOrThrow(userId);
  const activeBook = await ensureNosStagesGameBook(user.id);
  if (!activeBook || activeBook.stageId !== stageId) {
    redirect("/fr/joueur/nos-stages");
  }

  const stage = await prisma.stage.findFirst({
    where: { id: stageId, langue: Langue.FR },
    select: { id: true, title: true },
  });
  if (!stage) redirect("/fr/joueur/nos-stages");

  const sections = await resolveSectionsForStage(stageId);
  const doneIds = await completedSectionIdsForStage(
    user.id,
    sections.map((s) => s.id),
  );

  const sectionRows = sections.map((s) => ({
    id: s.id,
    title: s.title,
    image: s.image,
    niveau: s.niveau,
    numOrder: s.numOrder,
    unlocked:
      doneIds.has(s.id) ||
      s.id === activeBook.sectionId ||
      s.niveau === activeBook.sectionNiveau,
  }));

  return { stage, sections: sectionRows };
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

async function loadSectionWithJeux(sectionId: string, stageId: string) {
  return prisma.section.findFirst({
    where: { id: sectionId },
    include: {
      jeux: {
        where: {
          sectionId,
          stageId,
        },
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

export async function getNosStagesSectionPlayData(
  stageId: string,
  sectionId: string,
) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: "/fr/joueur/nos-stages" });
  }
  const user = await loadUserOrThrow(userId);
  const activeBook = await ensureNosStagesGameBook(user.id);
  if (!activeBook || activeBook.stageId !== stageId) {
    redirect("/fr/joueur/nos-stages");
  }

  const stageSections = await resolveSectionsForStage(stageId);
  const allowed = new Set(stageSections.map((s) => s.id));
  if (!allowed.has(sectionId)) {
    redirect(`/fr/joueur/nos-stages/stageId/${stageId}/sections`);
  }

  const doneIds = await completedSectionIdsForStage(
    user.id,
    stageSections.map((s) => s.id),
  );
  const unlocked =
    doneIds.has(sectionId) ||
    sectionId === activeBook.sectionId ||
    stageSections.find((s) => s.id === sectionId)?.niveau ===
      activeBook.sectionNiveau;
  if (!unlocked) {
    redirect(`/fr/joueur/nos-stages/stageId/${stageId}/sections`);
  }

  const section = await loadSectionWithJeux(sectionId, stageId);
  if (!section) {
    redirect(`/fr/joueur/nos-stages/stageId/${stageId}/sections`);
  }

  const questions = flattenSectionQuestions(section);
  const jeu = section.jeux[0];

  return {
    section: {
      id: section.id,
      title: section.title,
      image: section.image,
      numOrder: section.numOrder,
    },
    jeu: jeu
      ? { id: jeu.id, niveau: jeu.niveau }
      : { id: "", niveau: "" },
    questions,
  };
}

/**
 * Nos-stages completion: verifies ≥80%, writes SECTION GameBook, advances STAGE cursor or completes stage.
 */
export async function completeNosStagesSection(
  stageId: string,
  sectionId: string,
  answers: SectionAnswerPayload[],
): Promise<{ ok: false; message: string } | undefined> {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    redirectToSignIn({ returnBackUrl: "/fr/joueur/nos-stages" });
    return { ok: false, message: "Non authentifié." };
  }
  const user = await loadUserOrThrow(userId);

  const activeBook = await getActiveStageBook(user.id);
  if (!activeBook || activeBook.stageId !== stageId) {
    return { ok: false, message: "Aucun parcours actif pour ce stage." };
  }

  const stage = await prisma.stage.findFirst({
    where: { id: stageId, langue: Langue.FR },
  });
  if (!stage) {
    return { ok: false, message: "Stage introuvable." };
  }

  const stageSections = await resolveSectionsForStage(stage.id);
  const sectionIds = stageSections.map((s) => s.id);
  const allowedIds = new Set(sectionIds);
  if (!allowedIds.has(sectionId)) {
    return { ok: false, message: "Section introuvable." };
  }

  const section = await loadSectionWithJeux(sectionId, stage.id);
  if (!section) {
    return { ok: false, message: "Section introuvable." };
  }

  const doneIds = await completedSectionIdsForStage(user.id, sectionIds);
  const playable =
    doneIds.has(section.id) ||
    section.id === activeBook.sectionId ||
    section.niveau === activeBook.sectionNiveau;
  if (!playable) {
    return { ok: false, message: "Section non disponible." };
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

  if (doneIds.has(section.id)) {
    return { ok: false, message: "Cette section est déjà validée." };
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
      stageValidated: false,
      stageStatus: GameBookStatus.EN_COURS,
      stageNiveau: stage.niveau,
      stageNumOrder: stage.numOrder,
      stageAccomplished: false,
      sectionValidated: true,
      sectionAccomplished: true,
      sectionStatus: GameBookStatus.VALIDE,
      sectionNiveau: section.niveau,
      sectionNumOrsder: section.numOrder,
    },
    update: {
      sectionValidated: true,
      sectionAccomplished: true,
      sectionStatus: GameBookStatus.VALIDE,
      sectionNiveau: section.niveau,
      sectionNumOrsder: section.numOrder,
    },
  });

  const doneAfter = await completedSectionIdsForStage(user.id, sectionIds);
  const sorted = [...stageSections].sort((a, b) => a.numOrder - b.numOrder);
  const allDone = sorted.every((s) => doneAfter.has(s.id));

  if (allDone) {
    await prisma.gameBook.update({
      where: { id: activeBook.id },
      data: {
        stageValidated: true,
        stageAccomplished: true,
        stageStatus: GameBookStatus.VALIDE,
        sectionValidated: true,
        sectionAccomplished: true,
        sectionStatus: GameBookStatus.VALIDE,
      },
    });

    const nextStage = await prisma.stage.findFirst({
      where: { langue: Langue.FR, numOrder: stage.numOrder + 1 },
    });

    if (nextStage) {
      const nextSections = await resolveSectionsForStage(nextStage.id);
      const nextFirst = nextSections[0] ?? null;
      await prisma.gameBook.create({
        data: stageBookCreateData(user.id, nextStage, nextFirst),
      });
    }

    redirect("/fr/joueur/nos-stages");
  }

  const nextSection = sorted.find((s) => !doneAfter.has(s.id));
  if (!nextSection) {
    redirect("/fr/joueur/nos-stages");
  }

  await prisma.gameBook.update({
    where: { id: activeBook.id },
    data: {
      sectionId: nextSection.id,
      sectionNiveau: nextSection.niveau,
      sectionNumOrsder: nextSection.numOrder,
      sectionValidated: false,
      sectionAccomplished: false,
      sectionStatus: GameBookStatus.EN_COURS,
    },
  });

  redirect(`/fr/joueur/nos-stages/stageId/${stageId}/sections`);
}
