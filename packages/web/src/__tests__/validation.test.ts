import { validateOrder } from '@/lib/validation';

describe ('validateOrder()', () => {
    it('rejects when name and email are missing', () => {
        const result = validateOrder(
            { name: '', email: '', company: '' },
            'purchase_order',
            { number: '', holder: '', cvv: '' },
            null
        );
        expect(result.isValid).toBe(false);
        expect(result.error).toMatch(/Enter name and email/);
    });

    it('accepts a valid purchase order', () => {
        const result = validateOrder(
            { name: 'Alice', email: 'alice@example.com', company: 'Acme' },
            'purchase_order',
            { number: '', holder: '', cvv: '' },
            'https://example.com/po.pdf'
        );
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
    });
});