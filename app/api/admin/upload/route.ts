import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';

// Upload a file directly from admin — bypasses storage RLS
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'uploads';

        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

        const supabase = createServiceRoleClient();
        const ext = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}.${ext}`;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { error } = await supabase.storage
            .from('model-photos')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('model-photos')
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
