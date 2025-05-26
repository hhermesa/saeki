import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Question } from '@/types/types';

interface QuestionCardProps {
    question: Question;
    onUpdated: (updated: Question) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = React.memo(({ question, onUpdated }) => {
    const [responseText, setResponseText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRespond = async () => {
        const trimmed = responseText.trim();
        if (!trimmed) {
            setError('Response cannot be empty');
            return;
        }
        setSubmitting(true);
        setError(null);

        try {
            const updated = await apiFetch<Question>(`/questions/${question.id}/respond`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response: trimmed }),
            });
            onUpdated(updated);
            setResponseText('');
        } catch (err: any) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg || 'Failed to save response');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <li className="border p-4 rounded">
            <p>
                <strong>Order #{question.order_id}</strong> —{' '}
                {new Date(question.created_at).toLocaleString()}
            </p>
            <p className="mt-1">
                <strong>From:</strong> {question.author_email}
            </p>
            <p className="mt-2 italic">"{question.message}"</p>

            {question.response ? (
                <div className="mt-3 p-3 bg-green-50 rounded">
                    <p>
                        <strong>Response:</strong> {question.response}
                    </p>
                    <p className="text-sm text-gray-500">
                        Responded at {new Date(question.responded_at!).toLocaleString()}
                    </p>
                </div>
            ) : (
                <div className="mt-3 space-y-2">
                    <label
                        htmlFor={`resp-${question.id}`}
                        className="block text-sm font-medium text-gray-700"
                    >
                        Your Response
                    </label>
                    <textarea
                        id={`resp-${question.id}`}
                        rows={2}
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                        className="w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-coral/40 focus:border-coral/40"
                        placeholder="Type your response..."
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        onClick={handleRespond}
                        disabled={submitting || !responseText.trim()}
                        className="px-4 py-2 bg-charcoal text-white rounded hover:bg-eerie-black disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : 'Send Response'}
                    </button>
                </div>
            )}
        </li>
    );
});

QuestionCard.displayName = 'QuestionCard';
