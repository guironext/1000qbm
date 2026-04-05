"use server";

import { commenceGame } from "@/lib/actions/boardActions";

/** @deprecated Prefer commenceGame from boardActions; kept for older links. */
export async function startGameAction() {
  return commenceGame();
}
