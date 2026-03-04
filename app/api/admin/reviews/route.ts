import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
    const supabase = createServerSupabaseClient();

    // Check authentication and admin status
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Check if user is admin (assuming admin email or role check)
    // For now, using standard session check as middleware handles admin route protection

    try {
        const { model_id, rating, comment, screenshots, user_email } = await req.json();

        // Validation
        if (!model_id) return NextResponse.json({ error: 'Model ID is required.' }, { status: 400 });
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
        }

        // For admin uploads, we might want to create a review from a specific "named" user
        // If user_email is provided, we can either find the user or just store it as metadata
        // For simplicity, we'll store the review under a special "Admin Upload" or the provided name

        // Let's create a review. Since user_id is a foreign key to profiles, 
        // we use the current admin's ID for now, but we can store the "Display Name" in the comment if needed.
        // Alternatively, we could allow the admin to upload reviews without a user_id if the schema allows null.

        const { data, error } = await supabase
            .from('model_reviews')
            .insert([
                {
                    model_id,
                    user_id: session.user.id, // Linked to admin
                    rating,
                    comment: user_email ? `[From ${user_email}] ${comment}` : comment,
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
