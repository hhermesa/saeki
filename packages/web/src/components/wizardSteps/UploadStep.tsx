import React from 'react';
import FileUploadSection from '@/components/FileUploadSection';

interface UploadStepProps {
    files: File[];
    loading: boolean;
    uploadError: string | null;
    fileSelectError: string | null;
    onFilesChange: (files: File[]) => void;
    onUploadClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    inputId: string;
}

export function UploadStep({
                               files,
                               loading,
                               uploadError,
                               fileSelectError,
                               onFilesChange,
                               onUploadClick,
                               inputId,
                           }: UploadStepProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 w-full">
            <form className="space-y-4">
                <FileUploadSection
                    inputId={inputId}
                    files={files}
                    onChange={onFilesChange}
                    accept=".step,.iges"
                    multiple
                    className="h-64"
                    title="Drag & drop your STEP/IGES files here"
                    subtitle="or click to select"
                />
                <button
                    type="button"
                    onClick={onUploadClick}
                    disabled={loading}
                    className="px-4 py-2 bg-charcoal text-white rounded hover:bg-eerie-black disabled:opacity-50"
                >
                    {loading ? 'Uploading…' : 'Upload Files'}
                </button>
            </form>
            {fileSelectError && (
                <p className="mt-2 text-red-500">
                    <strong>Error:</strong> {fileSelectError}
                </p>
            )}
            {uploadError && (
                <p className="mt-4 text-red-500">
                    <strong>Error:</strong> {uploadError}
                </p>
            )}
        </div>
    );
}
