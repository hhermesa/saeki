'use client';

import {CustomerInfo} from "@/types/types";

interface Props {
    customer: CustomerInfo;
    onChange: (customer: CustomerInfo) => void;
}

export default function CustomerInfoSection({ customer, onChange }: Props) {
    const handleChange = (field: keyof CustomerInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...customer, [field]: e.target.value });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Your Information</h3>
            <input
                type="text"
                placeholder="Name"
                value={customer.name}
                onChange={handleChange('name')}
                className="w-full border rounded px-3 py-2"
            />
            <input
                type="email"
                placeholder="Email"
                value={customer.email}
                onChange={handleChange('email')}
                className="w-full border rounded px-3 py-2"
            />
            <input
                type="text"
                placeholder="Company (optional)"
                value={customer.company}
                onChange={handleChange('company')}
                className="w-full border rounded px-3 py-2"
            />
        </div>
    );
}
