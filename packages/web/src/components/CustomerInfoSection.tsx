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
            <div>
                <label
                    htmlFor="card-number"
                    className="block text-sm font-medium text-charcoal/70 mb-1"
                >
                    Full Name
                </label>
                <input
                    id="full-name"
                    type="text"
                    placeholder="Name"
                    value={customer.name}
                    onChange={handleChange('name')}
                    className="
                    w-full border-gray-300 border rounded px-3 py-2
                    focus:outline-none focus:ring-1 focus:ring-coral/40 focus:border-coral/40
                    "
                />
            </div>

            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-charcoal/70 mb-1"
                >
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={customer.email}
                    onChange={handleChange('email')}
                    className="w-full border rounded px-3 py-2
                focus:outline-none focus:ring-1 focus:ring-[#FF6F61]/40 focus:border-coral/40
                "
                />
            </div>

            <div>
                <label
                    htmlFor="company"
                    className="block text-sm font-medium text-charcoal/70 mb-1"
                >
                    Company Name (optional)
                </label>

                <input
                    id="company"
                    type="text"
                    placeholder="Company (optional)"
                    value={customer.company}
                    onChange={handleChange('company')}
                    className="w-full border rounded px-3 py-2
                focus:outline-none focus:ring-1 focus:ring-[#FF6F61]/40 focus:border-coral/40
                "
                />
            </div>
        </div>
    );
}
