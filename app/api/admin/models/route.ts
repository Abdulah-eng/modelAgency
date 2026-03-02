import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';

// GET /api/admin/models — list all models
export async function GET() {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('models').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

// POST /api/admin/models — insert a new model
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const supabase = createServiceRoleClient();
        const { gallery, ...modelData } = body;
        const { data: model, error } = await supabase
            .from('models')
            .insert([
                {
                    ...modelData,
                    instagram_link: body.instagram_link,
                    telegram_link: body.telegram_link,
                    whatsapp_number: body.whatsapp_number,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        // If there are additional gallery photos, insert them
        if (body.gallery && Array.from(body.gallery).length > 0) {
            const photos = body.gallery.map((url: string, i: number) => ({
                model_id: model.id,
                url: url,
                sort_order: i,
            }));
            const { error: photoErr } = await supabase.from('model_photos').insert(photos);
            if (photoErr) console.error('Gallery upload error:', photoErr);
        }

        return NextResponse.json({ data: model });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
