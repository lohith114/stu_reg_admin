// File: app/api/users/route.ts

import { turso } from '@/lib/turso';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Select all user data and order by the newest first
    const usersResult = await turso.execute(
      'SELECT id, name, phone, email, school_name, class, admin_name, submission_date FROM users ORDER BY id DESC'
    );

    // Return the array of user rows as JSON
    return NextResponse.json(usersResult.rows);

  } catch (error) {
    console.error("API Error: Failed to fetch users.", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// This line is important for Next.js to ensure this route is always dynamically executed
export const dynamic = 'force-dynamic';