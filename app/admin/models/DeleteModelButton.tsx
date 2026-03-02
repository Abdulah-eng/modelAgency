'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export default function DeleteModelButton({ id, name }: { id: string; name: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleDelete = async () => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setLoading(true);
        const { error } = await supabase.from('models').delete().eq('id', id);
        if (error) {
            toast.error('Failed to delete model');
        } else {
            toast.success(`"${name}" deleted`);
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={loading}>
            <Trash2 size={13} />
            {loading ? '...' : 'Delete'}
        </button>
    );
}
