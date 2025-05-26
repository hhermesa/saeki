import React from 'react';
import PreviewSection from '@/components/PreviewSection';
import {UploadItem} from "@/types/types";

interface ConfigureStepProps {
    uploads: UploadItem[];
    materials: { id: number; name: string; description: string }[];
    selectedIds: (number | null)[];
    onSelect: (index: number, materialId: number) => void;
    onNext: () => void;
}

export function ConfigureStep({
                                  uploads,
                                  materials,
                                  selectedIds,
                                  onSelect,
                                  onNext
                              }: ConfigureStepProps) {
    const allSelected = selectedIds.every((id) => id !== null);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 space-y-6 w-full">
            <PreviewSection
                uploads={uploads}
                materials={materials}
                selectedIds={selectedIds}
                onSelect={onSelect}
            />
            <button
                type="button"
                onClick={onNext}
                disabled={!allSelected}
                className="w-full px-4 py-2 bg-charcoal text-white rounded hover:bg-eerie-black disabled:opacity-50"
            >
                To Checkout
            </button>
        </div>
    );
}
