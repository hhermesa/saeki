'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatWidgetProps, Question } from '@/types/types';
import { apiFetch } from '@/lib/api';

export default function ChatWidget({ orderId, authorEmail }: ChatWidgetProps) {
    const [isOpen, setIsOpen]       = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError]         = useState<string | null>(null);
    const [loading, setLoading]     = useState(false);

    const panelRef = useRef<HTMLDivElement>(null);
    const listRef  = useRef<HTMLDivElement>(null);
    const firstLoadRef = useRef(true);

    const scrollToBottom = () => {
        if (listRef.current) {
            listRef.current.scrollTo({
                top: listRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    const fetchQuestions = useCallback(async () => {
        try {
            const data = await apiFetch<Question[]>(
                `/questions/orders/${orderId}`
            );
            setQuestions(data);
            if (firstLoadRef.current) {
                scrollToBottom();
                firstLoadRef.current = false;
            }
        } catch {
            setError('Failed to load questions');
        }
    }, [orderId]);

    useEffect(() => {
        if (!isOpen) return;
        setError(null);
        firstLoadRef.current = true;
        fetchQuestions();
        const iv = setInterval(fetchQuestions, 8000);
        return () => clearInterval(iv);
    }, [isOpen, fetchQuestions]);

    useEffect(() => {
        if (!isOpen) return;
        const onClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [isOpen]);

    const handleSend = useCallback(async () => {
        if (!newMessage.trim() || loading) return;
        setLoading(true);
        setError(null);
        try {
            const saved = await apiFetch<Question>(
                `/questions/orders/${orderId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        author_email: authorEmail,
                        message: newMessage.trim(),
                    }),
                }
            );
            setQuestions((prev) => [...prev, saved]);
            setNewMessage('');
            scrollToBottom();
        } catch {
            setError('Failed to send question');
        } finally {
            setLoading(false);
        }
    }, [newMessage, orderId, authorEmail, loading]);

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className="fixed bottom-4 right-4 bg-charcoal text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-eerie-black"
                aria-label="Chat"
            >
                💬
            </button>

            {isOpen && (
                <div
                    ref={panelRef}
                    className="fixed bottom-20 right-4 w-80 h-[400px] bg-white border rounded-lg shadow-lg flex flex-col"
                >
                    <div className="p-2 border-b font-semibold">Support Chat</div>

                    <div
                        ref={listRef}
                        className="flex-1 p-2 overflow-y-auto space-y-2"
                    >
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {questions.map((q) => (
                            <div key={q.id} className="p-2 border rounded">
                                <p className="text-sm font-medium">{q.author_email}:</p>
                                <p className="text-sm italic">{q.message}</p>
                                {q.response && (
                                    <p className="mt-1 text-sm text-green-600">
                                        Reply: {q.response}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-2 border-t">
            <textarea
                rows={2}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full border rounded p-1 text-sm"
                placeholder="Ask a question..."
            />
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!newMessage.trim() || loading}
                            className="mt-1 w-full py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                            {loading ? 'Sending…' : 'Send'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
