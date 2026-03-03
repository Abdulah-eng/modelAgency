import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
    const supabase = createServerSupabaseClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'You must be logged in to leave a review.' }, { status: 401 });
    }

    try {
        const { model_id, rating, comment, screenshots } = await req.json();

        // Validation
        if (!model_id) return NextResponse.json({ error: 'Model ID is required.' }, { status: 400 });
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
        }

        // Check if user already reviewed this model
        const { data: existing } = await supabase
            .from('model_reviews')
            .select('id')
            .eq('model_id', model_id)
            .eq('user_id', session.user.id)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'You have already reviewed this model.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('model_reviews')
            .insert([
                {
                    model_id,
                    user_id: session.user.id,
                    rating,
                    comment,
                    screenshots: Array.isArray(screenshots) ? screenshots : [],
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
