'use client';

import MaterialSelector from '@/components/MaterialSelector';
import type { UploadItem, Material } from '@/types/types';

interface Props {
    uploads: UploadItem[];
    materials: Material[];
    selectedIds: (number | null)[];
    onSelect: (index: number, materialId: number) => void;
}

export default function PreviewSection({
                                           uploads,
                                           materials,
                                           selectedIds,
                                           onSelect,
                                       }: Props) {
    return (
        <div className="space-y-8">
            {uploads.map((item, i) => (
                <div key={i}>
                    <h2 className="font-semibold mb-2">Part {i + 1}</h2>
                    <div className="border mb-4">
                        <iframe
                            src={`https://3dviewer.net/embed.html#model=${item.fileUrl}`}
                            width="100%"
                            height="300"
                            title={`3D Viewer ${i + 1}`}
                        />
                    </div>

                    <MaterialSelector
                        materials={materials}
                        selectedId={selectedIds[i] ?? undefined}
                        onSelect={(id) => onSelect(i, id)}
                    />
                </div>
            ))}
        </div>
    );
}