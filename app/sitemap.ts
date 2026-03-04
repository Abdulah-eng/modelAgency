import { MetadataRoute } from 'next';
import { createPublicSupabaseClient } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://merakispamanila.online';
    const supabase = createPublicSupabaseClient();

    try {
        // Fetch all model slugs for the sitemap
        const { data: models } = await supabase.from('models').select('slug, created_at');

        const modelUrls = (models || []).map((model) => {
            let lastMod = new Date();
            if (model.created_at) {
                const parsed = new Date(model.created_at);
                if (!isNaN(parsed.getTime())) {
                    lastMod = parsed;
                }
            }

            return {
                url: `${baseUrl}/models/${model.slug}`,
                lastModified: lastMod.toISOString().split('T')[0],
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            };
        });

        return [
            {
                url: baseUrl,
                lastModified: new Date().toISOString().split('T')[0],
                changeFrequency: 'daily' as const,
                priority: 1,
            },
            ...modelUrls,
        ];
    } catch (error) {
        console.error('Sitemap generation error:', error);
        // Fallback to at least returning the home page
        return [
            {
                url: baseUrl,
                lastModified: new Date().toISOString().split('T')[0],
                changeFrequency: 'daily' as const,
                priority: 1,
            },
        ];
    }
}
