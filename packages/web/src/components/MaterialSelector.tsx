'use client';

import {Material} from "@/types/types";

interface Props {
    materials: Material[];
    selectedId?: number;
    onSelect: (id: number) => void;
}

export default function MaterialSelector({ materials, selectedId, onSelect }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {materials.map((m) => (
                <button
                    key={m.id}
                    onClick={() => onSelect(m.id)}
                    className={
                        `p-4 border rounded text-left transition shadow-sm ` +
                        (selectedId === m.id
                            ? 'border-coral bg-coral/20'
                            : 'border-gray-300 hover:border-coral')
                    }
                >
                    <h4 className="font-semibold">{m.name}</h4>
                    <p className="text-sm text-gray-600">{m.description}</p>
                </button>
            ))}
        </div>
    );
}