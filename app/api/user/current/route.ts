import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
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