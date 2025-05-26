'use client';

import { useState } from 'react';
import type { UploadItem } from '@/types/types';
import { apiFetch } from '@/lib/api';

export default function useUpload() {
    const [files, setFiles] = useState<File[]>([]);
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const uploadFiles = async (): Promise<UploadItem[]> => {
        if (files.length === 0) {
            setError('Please select at least one file.');
            return [];
        }
        setLoading(true);
        setError(null);

        try {
            const form = new FormData();
            files.forEach((f) => form.append('file', f));
            const data = await apiFetch<UploadItem[]>('/upload', {
                method: 'POST',
                body: form,
            });
            setUploads(data);
            return data;
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : typeof err === 'string'
                        ? err
                        : JSON.stringify(err);

            setError(message || 'Failed to upload files');
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        files,
        setFiles,
        uploads,
        setUploads,
        error,
        loading,
        uploadFiles,
    };
}
