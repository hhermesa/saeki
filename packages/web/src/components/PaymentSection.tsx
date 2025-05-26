'use client';

import React from 'react';
import type { ChangeEvent } from 'react';
import type {CardInfo, PaymentMethod} from '@/types/types';

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
    cardError: string | null;
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
                        className="mr-2"
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
                        className="mr-2"
                    />
                    Credit Card
                </label>
            </div>

            {method === 'card' ? (
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Card Number"
                        value={card.number}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onCardChange('number', e.target.value.replace(/\D/g, ''))
                        }
                        maxLength={19}
                        className="w-full border rounded px-3 py-2"
                    />
                    <input
                        type="text"
                        placeholder="Card Holder Name"
                        value={card.holder}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onCardChange('holder', e.target.value)
                        }
                        className="w-full border rounded px-3 py-2"
                    />
                    <input
                        type="text"
                        placeholder="CVV"
                        value={card.cvv}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onCardChange('cvv', e.target.value.replace(/\D/g, ''))
                        }
                        maxLength={4}
                        className="w-32 border rounded px-3 py-2"
                    />
                    {cardError && <p className="text-red-500">{cardError}</p>}
                </div>
            ) : (
                <div className="flex gap-4 flex-col sm:flex-row  items-center">
                    <input
                        id="po-uploader"
                        key={`po-file-input-${method}`}
                        type="file"
                        accept=".pdf"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onPoFileChange(e.target.files?.[0] ?? null)
                        }
                        className="flex-grow sm:w-2/3 w-full border rounded px-3 py-2"
                    />
                    <div className="flex gap-4 w-full sm:w-auto justify-evenly">
                        <button
                            onClick={onUploadPo}
                            disabled={!poFile || !!poUrl}
                            className={`px-4 py-2 whitespace-nowrap text-white rounded hover:bg-indigo-700
        ${poUrl
                                ? 'bg-green-600 cursor-default hover:bg-green-600'
                                : 'bg-indigo-600 disabled:opacity-50'}`}
                        >
                            {poUrl ? 'Uploaded ✓' : 'Upload'}
                        </button>
                        {poUrl && (
                            <button
                                type="button"
                                onClick={onClearPoUrl}
                                className="px-4 py-2 whitespace-nowrap text-white rounded hover:bg-red-400 bg-red-500"
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
