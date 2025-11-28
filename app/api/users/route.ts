import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { UserRole } from "@/lib/generated/prisma"

// Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        palmares: {
          include: {
            jeu: {
              include: {
                stage: true,
                section: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// Update user
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, role, firstName, lastName, email, phone, country, langue } = body

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: role as UserRole,
        firstName,
        lastName,
        email,
        phone,
        country,
        langue
      }
    })

    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// Delete user
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Delete palmares first (foreign key constraint)
    await prisma.palmares.deleteMany({
      where: { userId: id }
    })

    // Then delete the user
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
