"use server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Create new stage
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, niveau, image, numOrder } = body

    const newStage = await prisma.stage.create({
      data: {
        title,
        niveau,
        image,
        numOrder: Number(numOrder),
        langue: "FR", // Add required langue field
      },
    })

    return NextResponse.json(newStage, { status: 201 })
  } catch (error) {
    console.error("Error creating stage:", error)
    return NextResponse.json({ error: "Failed to create stage" }, { status: 500 })
  }
}

// Update stage
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, title, niveau, image, numOrder } = body

    const updatedStage = await prisma.stage.update({
      where: { id },
      data: {
        title,
        niveau,
        image,
        numOrder: Number(numOrder),
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

    // Delete stage and all related data (cascading delete)
    await prisma.stage.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Stage deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting stage:", error);
    return NextResponse.json({ error: "Failed to delete stage" }, { status: 500 });
  }
}
