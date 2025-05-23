'use client';

import { useState } from 'react';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
        setResponse(null);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file first.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:4000/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }
            const data = await res.json();
            setResponse(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Upload a STEP/IGES File</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="file"
                    accept=".step,.iges"
                    onChange={handleFileChange}
                    className="block"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Upload
                </button>
            </form>

            {error && <p className="mt-4 text-red-500">{error}</p>}

            {response && (
                <div className="mt-6 p-4 bg-gray-100 rounded">
                    <h2 className="font-semibold">Upload Result:</h2>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}