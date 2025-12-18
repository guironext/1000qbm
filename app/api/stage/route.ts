
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Langue } from "@/lib/generated/prisma/index.js"


// Create new stage
export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Received data:', body) // Add this line
    const { title, niveau, image, numOrder, langue, descriptions } = body

    if (!title || !niveau || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newStage = await prisma.stage.create({
      data: {
        title,
        niveau,
        image,
        numOrder: Number(numOrder),
        langue: (langue as Langue) || Langue.FR,
        descriptions: {
          create: descriptions?.map((texte: string) => ({ texte })) || []
        }
      },
    })

    console.log('Stage created successfully:', newStage) // Add this line
    return NextResponse.json(newStage, { status: 201 })
  } catch (error) {
    console.error("Error creating stage:", error) // This should show the actual error
    return NextResponse.json({ error: "Failed to create stage" }, { status: 500 })
  }
}

// Update stage
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, title, niveau, image, numOrder, langue, descriptions } = body

    if (!id) {
      return NextResponse.json({ error: "Stage ID is required" }, { status: 400 })
    }

    // First, delete existing descriptions
    await prisma.paragraphe.deleteMany({
      where: { stageId: id }
    })

    const updatedStage = await prisma.stage.update({
      where: { id },
      data: {
        title,
        niveau,
        image,
        numOrder: Number(numOrder),
        langue: (langue as Langue) || Langue.FR,
        descriptions: {
          create: descriptions?.map((texte: string) => ({ texte })) || []
        }
      },
    })

    return NextResponse.json(updatedStage, { status: 200 })
  } catch (error) {
    console.error("Error updating stage:", error)
    return NextResponse.json({ error: "Failed to update stage" }, { status: 500 })
  }
}

// Fetch all stages
export async function GET() {
  try {
    const getStages = await prisma.stage.findMany({
      orderBy: { numOrder: "asc" },
    })
    return NextResponse.json(getStages)
  } catch (error) {
    console.error("Error fetching stages:", error)
    return NextResponse.json({ error: "Failed to fetch stages" }, { status: 500 })
  }
}

// Delete stage
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Stage ID is required" }, { status: 400 });
    }

    console.log(`Attempting to delete stage with ID: ${id}`);
    
    // Use a transaction to ensure all deletions happen atomically
    await prisma.$transaction(async (tx) => {
      // 1. First delete all questions and their responses for jeux in this stage
      const jeuxInStage = await tx.jeu.findMany({
        where: { stageId: id },
        select: { id: true }
      });
      
      console.log(`Found ${jeuxInStage.length} jeux in stage ${id}`);

      for (const jeu of jeuxInStage) {
        // Delete responses first
        await tx.reponse.deleteMany({
          where: {
            question: {
              jeuId: jeu.id
            }
          }
        });
        
        // Delete questions
        await tx.question.deleteMany({
          where: { jeuId: jeu.id }
        });
        
        // Delete palmares
        await tx.palmares.deleteMany({
          where: { jeuId: jeu.id }
        });
      }

      // 2. Delete all jeux in this stage
      await tx.jeu.deleteMany({
        where: { stageId: id }
      });

      // 3. Delete all descriptions (paragraphes) for this stage
      await tx.paragraphe.deleteMany({
        where: { stageId: id }
      });

      // 4. Finally delete the stage
      await tx.stage.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Stage deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting stage:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      error: "Failed to delete stage", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
