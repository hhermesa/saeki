import type {CustomerInfo, CardInfo, PaymentMethod, OrderValidationResult} from '@/types/types';

export function validateOrder(
    customer: CustomerInfo,
    paymentMethod: PaymentMethod,
    card: CardInfo,
    poUrl: string | null
): OrderValidationResult {
    const name = customer.name.trim();
    const email = customer.email.trim();
    const isEmailValid = /^\S+@\S+\.\S+$/.test(email);

    if (!name || !email) {
        return { isCustomerValid: false, isPaymentDetailsValid: false, isValid: false, error: 'Enter name and email' };
    }
    if (!isEmailValid) {
        return { isCustomerValid: false, isPaymentDetailsValid: false, isValid: false, error: 'Please enter a valid email address' };
    }

    const isCustomerValid = true;

    let isPaymentDetailsValid = false;
    let error: string | undefined;

    if (paymentMethod === 'purchase_order') {
        if (!poUrl) {
            error = 'Please upload your purchase order PDF';
        } else {
            isPaymentDetailsValid = true;
        }
    } else {
        // card path
        const { number, holder, cvv } = card;
        if (number.length < 12 || !holder.trim() || (cvv.length !== 3 && cvv.length !== 4)) {
            error = 'Enter valid card';
        } else {
            isPaymentDetailsValid = true;
        }
    }

    const isValid = isCustomerValid && isPaymentDetailsValid;
    return { isCustomerValid, isPaymentDetailsValid, isValid, error };
}