'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Question } from '@/types/types';

export default function AdminQuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [responses, setResponses] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState<Record<number, boolean>>({});

    useEffect(() => {
        let cancelled = false;
        const fetchAll = async () => {
            try {
                const data = await apiFetch<Question[]>('/questions');
                if (!cancelled) setQuestions(data);
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Failed to load questions');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void fetchAll();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleRespond = async (id: number) => {
        const text = responses[id]?.trim();
        if (!text) return;
        setSubmitting(prev => ({ ...prev, [id]: true }));
        setError(null);

        try {
            const updated = await apiFetch<Question>(`/questions/${id}/respond`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: text }),
            });
            setQuestions(qs => qs.map(q => (q.id === id ? updated : q)));
            setResponses(prev => ({ ...prev, [id]: '' }));
        } catch (err: any) {
            setError(err.message || 'Failed to save response');
        } finally {
            setSubmitting(prev => ({ ...prev, [id]: false }));
        }
    };

    if (loading) return <p className="p-6">Loading questions...</p>;
    if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

    return (
        <div className="max-w-screen-lg mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Admin: Questions</h1>
            {questions.length === 0 ? (
                <p>No questions found.</p>
            ) : (
                <ul className="space-y-6">
                    {questions.map(q => (
                        <li key={q.id} className="border p-4 rounded">
                            <p>
                                <strong>Order #{q.order_id}</strong> —{' '}
                                {new Date(q.created_at).toLocaleString()}
                            </p>
                            <p className="mt-1">
                                <strong>From:</strong> {q.author_email}
                            </p>
                            <p className="mt-2 italic">"{q.message}"</p>

                            {q.response ? (
                                <div className="mt-3 p-3 bg-green-50 rounded">
                                    <p>
                                        <strong>Response:</strong> {q.response}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Responded at {new Date(q.responded_at!).toLocaleString()}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-3 space-y-2">
                  <textarea
                      rows={2}
                      value={responses[q.id] || ''}
                      onChange={e =>
                          setResponses(prev => ({ ...prev, [q.id]: e.target.value }))
                      }
                      className="w-full border rounded p-2"
                      placeholder="Type your response..."
                  />
                                    <button
                                        onClick={() => handleRespond(q.id)}
                                        disabled={submitting[q.id]}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {submitting[q.id] ? 'Saving...' : 'Send Response'}
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
