'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, Trash2, Calendar, User } from 'lucide-react';
import { Enquiry } from '@/types';

export default function EnquiriesPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEnquiries = async () => {
        try {
            const res = await fetch('/api/admin/enquiries');
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setEnquiries(json.data || []);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this enquiry?')) return;
        try {
            const res = await fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            toast.success('Deleted');
            setEnquiries(prev => prev.filter(e => e.id !== id));
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (loading) return <div className="admin-loading">Loading enquiries...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-page-title">Enquiries & Messages</h1>
                <p className="admin-page-subtitle">Manage all incoming messages from the contact form and model profiles.</p>
            </div>

            <div className="enquiries-grid">
                {enquiries.length === 0 ? (
                    <div className="admin-card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <Mail size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                        <p>No messages yet.</p>
                    </div>
                ) : (
                    enquiries.map((enquiry) => (
                        <div key={enquiry.id} className="admin-card enquiry-card">
                            <div className="enquiry-header">
                                <div className="enquiry-type-badge" data-type={enquiry.enquiry_type}>
                                    {enquiry.enquiry_type === 'model' ? `Model: ${enquiry.model_name || 'Individual'}` : 'General Inquiry'}
                                </div>
                                <button onClick={() => handleDelete(enquiry.id)} className="delete-btn-ghost">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <h3 className="enquiry-sender">
                                <User size={16} /> {enquiry.full_name}
                            </h3>

                            <div className="enquiry-contacts">
                                <a href={`mailto:${enquiry.email}`} className="enquiry-contact-link">
                                    <Mail size={14} /> {enquiry.email}
                                </a>
                                {enquiry.phone && (
                                    <a href={`tel:${enquiry.phone}`} className="enquiry-contact-link">
                                        <Phone size={14} /> {enquiry.phone}
                                    </a>
                                )}
                            </div>

                            <p className="enquiry-message">{enquiry.message}</p>

                            <div className="enquiry-footer">
                                <span className="enquiry-date">
                                    <Calendar size={12} /> {new Date(enquiry.created_at).toLocaleDateString()} at {new Date(enquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .enquiries-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 1.5rem;
                }
                .enquiry-card {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    position: relative;
                    transition: transform 0.2s;
                }
                .enquiry-card:hover {
                    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
                }
                .enquiry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .enquiry-type-badge {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 0.25rem 0.6rem;
                    border-radius: 4px;
                    font-weight: 600;
                    background: rgba(255,255,255,0.05);
                    color: var(--text-muted);
                }
                .enquiry-type-badge[data-type='model'] {
                    background: rgba(var(--accent-rgb), 0.1);
                    color: var(--accent);
                }
                .enquiry-sender {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.3rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .enquiry-contacts {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 0.75rem;
                }
                .enquiry-contact-link {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    transition: color 0.2s;
                }
                .enquiry-contact-link:hover {
                    color: var(--accent);
                }
                .enquiry-message {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: var(--text-primary);
                    white-space: pre-wrap;
                    flex-grow: 1;
                }
                .enquiry-footer {
                    margin-top: auto;
                    padding-top: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .enquiry-date {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }
                .delete-btn-ghost {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.4rem;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .delete-btn-ghost:hover {
                    background: rgba(255,0,0,0.1);
                    color: #ff4d4d;
                }
            `}</style>
        </div>
    );
}
