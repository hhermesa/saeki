'use client';

import { useState, useEffect } from 'react';
import CustomerInfoSection from '@/components/CustomerInfoSection';
import PaymentSection from '@/components/PaymentSection';
import { validateOrder } from '@/lib/validation';
import { apiFetch } from '@/lib/api';
import { UploadItem, Material, CustomerInfo, CardInfo, PaymentMethod } from '@/types/types';

export interface CheckoutStepProps {
    uploads: UploadItem[];
    materials: Material[];
    materialIds: (number | null)[];
    customer: CustomerInfo;
    onCustomerChange: (c: CustomerInfo) => void;
    poFile: File | null;
    poUrl: string | null;
    onPoFileChange: (f: File | null) => void;
    onUploadPo: () => Promise<void>;
    onClearPo: () => void;
    paymentMethod: PaymentMethod;
    onPaymentMethodChange: (m: PaymentMethod) => void;
    card: CardInfo;
    poError: string | null;
    onOrderSuccess: (orderId: number) => void;
    onCardChange: (field: keyof CardInfo, value: string) => void;
}

export default function CheckoutStep({
                                         uploads,
                                         materials,
                                         materialIds,
                                         customer,
                                         onCustomerChange,
                                         poFile,
                                         poUrl,
                                         onPoFileChange,
                                         onUploadPo,
                                         onClearPo,
                                         poError,
                                         paymentMethod,
                                         onOrderSuccess,
                                         onPaymentMethodChange,
                                         card,
                                         onCardChange,
                                     }: CheckoutStepProps) {
    const [orderError, setOrderError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const formValidation = validateOrder(customer, paymentMethod, card, poUrl);

    useEffect(() => {
        document.body.style.overflow = showConfirm ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showConfirm]);

    const handlePlaceAttempt = () => {
        setOrderError(null);
        if (!formValidation.isValid && formValidation.error) {
            setOrderError(formValidation.error);
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        let cardToken: string | null = null;
        if (paymentMethod === 'card') {
            cardToken = Date.now().toString();
        }
        const payload = {
            customer,
            items: uploads.map((u, i) => ({
                fileUrl: u.fileUrl,
                materialId: materialIds[i]!,
                quantity: 1,
            })),
            paymentMethod,
            purchaseOrderUrl: paymentMethod === 'purchase_order' ? poUrl : null,
            cardToken,
        };
        try {
            const { orderId } = await apiFetch<{ orderId: number }>('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            onOrderSuccess(orderId);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : typeof err === 'string'
                        ? err
                        : JSON.stringify(err);

            setOrderError(message || 'Failed to place order');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex flex-col gap-6 w-full">
            <CustomerInfoSection customer={customer} onChange={onCustomerChange} />

            <PaymentSection
                method={paymentMethod}
                onMethodChange={onPaymentMethodChange}
                poFile={poFile}
                onPoFileChange={onPoFileChange}
                poUrl={poUrl}
                onUploadPo={onUploadPo}
                onClearPoUrl={onClearPo}
                poError={poError}
                card={card}
                onCardChange={onCardChange}
            />

            {orderError && <p className="mt-2 text-red-500 text-center">{orderError}</p>}

            <button
                onClick={handlePlaceAttempt}
                className="w-full px-4 py-2 bg-charcoal text-white rounded hover:bg-eerie-black"
            >
                Place Order
            </button>

            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Confirm Your Order</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Name:</strong> {customer.name}</p>
                            <p><strong>Email:</strong> {customer.email}</p>
                            {customer.company && <p><strong>Company:</strong> {customer.company}</p>}
                            <p><strong>Payment:</strong> {paymentMethod === 'card' ? 'Credit Card' : 'Purchase Order'}</p>
                            {paymentMethod === 'purchase_order' && poFile && <p><strong>PO File:</strong> {poFile.name}</p>}
                            {paymentMethod === 'card' && <p><strong>Card:</strong> •••• {card.number.slice(-4)}</p>}
                        </div>

                        <div className="mt-4 space-y-2">
                            <h3 className="font-semibold">Parts & Materials:</h3>
                            <ul className="list-disc list-inside text-sm">
                                {uploads.map((u, i) => (
                                    <li key={i}>
                                        {u.originalName} → <em>{materials.find(m => m.id === materialIds[i])?.name ?? '—'}</em>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handleConfirm} className="px-4 py-2 bg-charcoal text-white rounded hover:bg-eerie-black">
                                Confirm & Place
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
