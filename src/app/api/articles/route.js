import { NextResponse } from 'next/server';
import { getArticlesPage } from '../../../services/firestore/content';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const cursor = searchParams.get('cursor') || null;

    const { articles, nextCursor } = await getArticlesPage({ limit, cursor });
    return NextResponse.json({ articles, nextCursor }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
