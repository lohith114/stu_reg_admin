// File: app/api/users/[id]/route.ts

import { turso } from '@/lib/turso';
import { NextResponse } from 'next/server';

interface RequestParams {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RequestParams) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { name, phone, email, school_name, class: classField } = await request.json();
    
    // Validate that required fields are not empty
    if (!name || !phone || !email || !school_name || !classField) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    
    // Execute the UPDATE query
    await turso.execute({
      sql: 'UPDATE users SET name = ?, phone = ?, email = ?, school_name = ?, class = ? WHERE id = ?',
      args: [name, phone, email, school_name, classField, id],
    });

    // Return the updated object
    const updatedUser = { id: parseInt(id), name, phone, email, school_name, class: classField };
    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    console.error(`API Error updating user ${id}:`, error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to update user: ${message}` }, { status: 500 });
  }
}