import { MetadataRoute } from 'next';
import { createPublicSupabaseClient } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://merakispamanila.online';
    const supabase = createPublicSupabaseClient();

    // Fetch all model slugs for the sitemap
    const { data: models } = await supabase.from('models').select('slug, created_at');

    const modelUrls = (models || []).map((model) => ({
        url: `${baseUrl}/models/${model.slug}`,
        lastModified: new BabelDate(model.created_at).toISOString().split('T')[0],
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new BabelDate().toISOString().split('T')[0],
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        ...modelUrls,
    ];
}

// Helper because new Date() in Edge Runtime might need careful handling sometimes, 
// but standard Date is usually fine in Next.js sitemap.ts
class BabelDate extends Date { }
