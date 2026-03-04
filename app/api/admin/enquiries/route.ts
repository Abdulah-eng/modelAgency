import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';
import { verifyTurnstileToken } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createServiceRoleClient();
        const { data, error } = await supabase
            .from('model_enquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { turnstileToken } = body;

        if (!turnstileToken) {
            return NextResponse.json({ error: 'CAPTCHA token is missing.' }, { status: 400 });
        }

        const isValid = await verifyTurnstileToken(turnstileToken);
        if (!isValid) {
            return NextResponse.json({ error: 'CAPTCHA verification failed.' }, { status: 400 });
        }

        const supabase = createServiceRoleClient();

        const { data, error } = await supabase
            .from('model_enquiries')
            .insert([
                {
                    model_id: body.model_id,
                    model_name: body.model_name,
                    full_name: body.full_name,
                    email: body.email,
                    phone: body.phone,
                    message: body.message,
                    enquiry_type: body.enquiry_type || 'general',
                },
            ])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
