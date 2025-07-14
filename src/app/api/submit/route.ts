// File: app/api/submit/route.ts

import { turso } from '@/lib/turso';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, phone, email, school_name, class: classField, admin_email } = await request.json();

    // 1. Basic field validation
    if (!name || !phone || !email || !school_name || !classField || !admin_email) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 2. Check if a user with the same phone number or email already exists
    const existingUserResult = await turso.execute({
      sql: 'SELECT 1 FROM users WHERE phone = ? OR email = ? LIMIT 1',
      args: [phone, email],
    });

    // 3. If a row is found, it means the user is a duplicate.
    if (existingUserResult.rows.length > 0) {
      // Return a 409 Conflict status with the specific error message
      return NextResponse.json(
        { error: 'User already enrolled' },
        { status: 409 }
      );
    }

    // 4. If no existing user is found, proceed with insertion.
    const submissionDate = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });

    await turso.execute({
      sql: 'INSERT INTO users (name, phone, email, school_name, class, admin_name, submission_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [name, phone, email, school_name, classField, admin_email, submissionDate],
    });

    // Use a 201 Created status for successful resource creation.
    return NextResponse.json({ message: 'User information saved' }, { status: 201 });

  } catch (error) {
    // Log the error for debugging purposes on the server
    console.error("API Error:", error);
    
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // Return a generic 500 Internal Server Error for unexpected issues
    return NextResponse.json({ error: 'A server error occurred during submission.' }, { status: 500 });
  }
}