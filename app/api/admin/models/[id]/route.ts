import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';

// PATCH /api/admin/models/[id] — update a model
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const supabase = createServiceRoleClient();

        const { gallery, ...modelData } = body;

        // Update main model record
        const { data, error } = await supabase
            .from('models')
            .update({
                ...modelData,
                telegram_link: body.telegram_link,
                whatsapp_link: body.whatsapp_link,
                viber_link: body.viber_link,
            })
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        // Sync gallery photos if provided
        if (body.gallery && Array.isArray(body.gallery)) {
            // Remove old ones first for simplicity in this implementation
            await supabase.from('model_photos').delete().eq('model_id', params.id);

            if (body.gallery.length > 0) {
                const photos = body.gallery.map((url: string, i: number) => ({
                    model_id: params.id,
                    url: url,
                    sort_order: i,
                }));
                await supabase.from('model_photos').insert(photos);
            }
        }

        return NextResponse.json({ data });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}

// DELETE /api/admin/models/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const supabase = createServiceRoleClient();
        const { error } = await supabase.from('models').delete().eq('id', params.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
