import React from "react";
import { getEmboardPageData } from "@/lib/actions/boardActions";
import BoardPageClient from "@/components/BoardPageClient";

export default async function EmboardPage() {
  const { stage } = await getEmboardPageData();

  return (
    <BoardPageClient
      stage={{
        id: stage.id,
        title: stage.title,
        image: stage.image,
        niveau: stage.niveau,
        descriptions: stage.descriptions.map((d) => ({
          id: d.id,
          texte: d.texte,
        })),
      }}
    />
  );
}
