'use client';

import { useState, useEffect } from 'react';
import {Material} from "@/types/types";
import {apiFetch} from "@/lib/api";

export default function useMaterials() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [error, setError]         = useState<string | null>(null);

    useEffect(() => {
        apiFetch<Material[]>('/materials')
            .then(setMaterials)
            .catch((err) => {
                console.error('Failed to load materials', err);
                setError(err.message);
            });
    }, []);

    return [materials, error] as const;
}