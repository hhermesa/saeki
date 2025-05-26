'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Question } from '@/types/types';
import {QuestionCard} from "@/components/QuestionCard";

export default function AdminQuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchAll = async () => {
            try {
                const data = await apiFetch<Question[]>('/questions');
                if (!cancelled) setQuestions(data);
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : typeof err === 'string'
                            ? err
                            : JSON.stringify(err);
                if (!cancelled) setError(message || 'Failed to load questions');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void fetchAll();
        return () => {
            cancelled = true;
        };
    }, []);

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
                        <QuestionCard
                            key={q.id}
                            question={q}
                            onUpdated={updated => setQuestions(qs =>
                                qs.map(x => x.id === updated.id ? updated : x)
                            )}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}
