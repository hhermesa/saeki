'use client';

import React from 'react';
import type { ChangeEvent } from 'react';
import type {CardInfo, PaymentMethod} from '@/types/types';
import FileUploadSection from "@/components/FileUploadSection";

interface Props {
    method: PaymentMethod;
    onMethodChange: (m: PaymentMethod) => void;
    poFile: File | null;
    onPoFileChange: (f: File | null) => void;
    poUrl: string | null;
    onUploadPo: () => Promise<void>;
    onClearPoUrl: () => void;
    poError: string | null;
    card: CardInfo;
    onCardChange: (field: keyof CardInfo, val: string) => void;
}

export default function PaymentSection({
                                           method,
                                           onMethodChange,
                                           poFile,
                                           onPoFileChange,
                                           poUrl,
                                           onUploadPo,
                                           poError,
                                           onClearPoUrl,
                                           card,
                                           onCardChange,
                                           cardError,
                                       }: Props) {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Payment Method</h3>
            <div className="flex gap-4">
                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        name="payment"
                        value="purchase_order"
                        checked={method === 'purchase_order'}
                        onChange={() => onMethodChange('purchase_order')}
                        className="mr-2 accent-charcoal"
                    />
                    Purchase Order
                </label>
                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={method === 'card'}
                        onChange={() => onMethodChange('card')}
                        className="mr-2 accent-charcoal"
                    />
                    Credit Card
                </label>
            </div>

            {method === 'card' ? (
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="card-number"
                            className="block text-sm font-medium text-charcoal/70 mb-1"
                        >
                            Card Number
                        </label>
                        <input
                            id="card-number"
                            type="text"
                            placeholder="Card Number"
                            value={card.number}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onCardChange('number', e.target.value.replace(/\D/g, ''))
                            }
                            maxLength={19}
                            className="w-full border border-gray-300 rounded px-3 py-2
                        focus:outline-none focus:ring-1 focus:ring-coral/40 focus:border-coral/40"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="card-holder"
                            className="block text-sm font-medium text-charcoal/70 mb-1"
                        >
                            Card Holder Name
                        </label>
                        <input
                            id="card-holder"
                            type="text"
                            placeholder="Card Holder Name"
                            value={card.holder}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onCardChange('holder', e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2
                        focus:outline-none focus:ring-1 focus:ring-coral/40 focus:border-coral/40"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="cvv"
                            className="block text-sm font-medium text-charcoal/70 mb-1"
                        >
                            CVV
                        </label>
                        <input
                            id="cvv"
                            type="text"
                            placeholder="CVV"
                            value={card.cvv}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onCardChange('cvv', e.target.value.replace(/\D/g, ''))
                            }
                            maxLength={4}
                            className="w-full border border-gray-300 rounded px-3 py-2
                        focus:outline-none focus:ring-1 focus:ring-coral/40 focus:border-coral/40"
                        />
                    </div>
                </div>
            ) : (
                <div className="flex gap-4 flex-col sm:flex-row  items-center">
                    <FileUploadSection
                        inputId="po-uploader"
                        files={poFile ? [poFile] : []}
                        onChange={files => onPoFileChange(files[0] ?? null)}
                        title="Drag &amp; drop your PDF file here"
                        subtitle="or click to select"
                        className="h-20 px-2 flex-grow p-2"
                        accept=".pdf"
                    />
                    <div className="flex-row sm:flex-col flex gap-4 w-full sm:w-auto justify-evenly">
                        <button
                            onClick={onUploadPo}
                            disabled={!poFile || !!poUrl}
                            className={`px-4 py-2 whitespace-nowrap text-white rounded 
        ${poUrl
                                ? 'bg-warm-teal/80 cursor-default hover:bg-warm-teal'
                                : 'bg-coral/80 disabled:opacity-50 hover:bg-coral disabled:hover:bg-coral/80'}`}
                        >
                            {poUrl ? 'Uploaded ✓' : 'Upload'}
                        </button>
                        {poUrl && (
                            <button
                                type="button"
                                onClick={onClearPoUrl}
                                className="px-4 py-2 whitespace-nowrap text-white rounded hover:bg-red-500 bg-red-400"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}
