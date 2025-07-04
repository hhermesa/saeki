export interface Material {
    id: number;
    name: string;
    description: string;
}

export interface UploadItem {
    originalName: string;
    mimeType: string;
    size: number;
    fileUrl: string;
}

export interface CustomerInfo {
    name: string;
    email: string;
    company: string;
}

export interface CardInfo {
    number: string;
    holder: string;
    cvv: string;
}

export interface Question {
    id: number;
    author_email: string;
    message: string;
    response: string | null;
    created_at: string;
    responded_at: string | null;
    order_id: number
}

export interface ChatWidgetProps {
    orderId: number;
    authorEmail: string;
}

export type PaymentMethod = 'purchase_order' | 'card';

export interface OrderValidationResult {
    isCustomerValid: boolean;
    isPaymentDetailsValid: boolean;
    isValid: boolean;
    error?: string;
}
