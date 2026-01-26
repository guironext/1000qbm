import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // For now, return a mock user - replace with actual auth logic later
    const mockUser = {
      id: 'user-1',
      nom: 'Doe',
      prenom: 'John',
      langue: 'FR',
      email: 'john.doe@example.com'
    };

    return NextResponse.json(mockUser);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}