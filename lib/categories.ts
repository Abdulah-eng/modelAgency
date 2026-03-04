/**
 * Robustly parses category data from the database.
 * Handles:
 * - Clean arrays: ["Fashion", "Commercial"]
 * - Double-encoded strings/arrays: ["[\"Fashion\"]"]
 * - Simple strings: "Fashion"
 * - Comma-separated strings within arrays: ["Fashion, Commercial"]
 */
export function parseCategories(categoryData: any): string[] {
    if (!categoryData) return [];

    let rawList: any[] = [];

    if (Array.isArray(categoryData)) {
        rawList = categoryData;
    } else if (typeof categoryData === 'string') {
        try {
            // Try parsing if it looks like a JSON string
            const parsed = JSON.parse(categoryData);
            rawList = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            // If not JSON, treat as a single string or comma-separated
            rawList = [categoryData];
        }
    }

    const result = new Set<string>();

    rawList.forEach(item => {
        if (typeof item !== 'string') return;

        // Check for nested JSON stringified arrays like "[\"Fashion\"]"
        if (item.trim().startsWith('[') && item.trim().endsWith(']')) {
            try {
                const nested = JSON.parse(item);
                if (Array.isArray(nested)) {
                    nested.forEach(n => {
                        if (typeof n === 'string') {
                            n.split(',').forEach(s => {
                                const trimmed = s.trim();
                                if (trimmed) result.add(trimmed);
                            });
                        }
                    });
                    return;
                }
            } catch {
                // Fall through to normal string handling if parse fails
            }
        }

        // Normal string handling (including comma-separated)
        item.split(',').forEach(s => {
            const trimmed = s.trim().replace(/^["']|["']$/g, ''); // Remove stray quotes
            if (trimmed) result.add(trimmed);
        });
    });

    return Array.from(result);
}
