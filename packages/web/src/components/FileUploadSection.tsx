'use client';

import { useState, useRef, DragEvent } from 'react';

interface Props {
    inputId: string;
    files: File[];
    className?: string;
    accept?: string;
    title: string;
    subtitle: string;
    multiple?: boolean;
    onChange: (files: File[]) => void;
}

export default function FileUploadSection({ inputId,
                                              files,
                                              onChange,
                                              className,
                                              accept = '',
                                              multiple = false,
                                              title,
                                              subtitle
}: Props) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
            onChange(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div
            id={inputId + '-dropzone'}
            onDragOver={e => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={e => {
                e.preventDefault();
                setDragging(false);
            }}
            onDrop={handleDrop}
            className={`relative w-full  flex flex-col items-center justify-center
        border-4 border-dashed rounded-lg cursor-pointer select-none
        transition-colors duration-200 ${className}
        ${dragging
                ? 'border-charcoal bg-charcoal/10 bg-opacity-30'
                : 'border-gray-300 bg-white'
            }`}
        >
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={accept}
                multiple={multiple}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={e => onChange(Array.from(e.target.files || []))}
            />

            {files.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p className="mb-2">{title}</p>
                    <p className="text-sm">{subtitle}</p>
                </div>
            ) : (
                <div className="text-gray-700 max-w-[220px] sm:max-w-xs">
                    {files.map((f, i) => (
                        <p key={i} className="truncate">
                            {f.name}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
