import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// One-time migration endpoint
// Visit: https://your-app.vercel.app/api/migrate?secret=your-secret-here
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Simple protection
  if (secret !== process.env.AUTH0_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Test database connection
    await db.execute(sql`SELECT 1`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected. Run migrations locally with: DATABASE_URL=your-neon-url npm run db:migrate' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
