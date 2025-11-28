import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Get all sections
export async function GET() {
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
    })

    return NextResponse.json(sections, { status: 200 })
  } catch (error) {
    console.error("Error fetching sections:", error)
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 })
  }
}

// Create new section
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, niveau, image, numOrder, langue } = body

    if (!title || !niveau || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newSection = await prisma.section.create({
      data: {
        title,
        niveau,
        image,
        numOrder: Number(numOrder),
        langue: langue || "FR",
      },
    })

    return NextResponse.json(newSection, { status: 201 })
  } catch (error) {
    console.error("Error creating section:", error)
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
  }
}

// Update section
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, title, niveau, image, numOrder, langue } = body

    if (!id) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 })
    }

    const updatedSection = await prisma.section.update({
      where: { id },
      data: {
        title,
        niveau,
        image,
        numOrder: Number(numOrder),
        langue: langue || "FR",
      },
    })

    return NextResponse.json(updatedSection, { status: 200 })
  } catch (error) {
    console.error("Error updating section:", error)
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 })
  }
}

// Delete section
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 })
    }

    await prisma.section.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Section deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting section:", error)
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 })
  }
}
