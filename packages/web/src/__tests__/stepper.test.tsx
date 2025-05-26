/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Stepper } from '@/components/Stepper';

describe('Stepper', () => {
    const steps = ['First', 'Second', 'Third'];
    const colors = {
        completed: 'bg-warm-teal',
        active: 'bg-coral',
        upcoming: 'bg-gray-300',
    };

    it('renders all steps and highlights correctly', () => {
        render(<Stepper steps={steps} current={1} colors={colors} />);

        steps.forEach((label) => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });

        const stepContainers = screen.getAllByText(/First|Second|Third/).map((el) => el.closest('div')!);

        expect(stepContainers[0]).toHaveClass(`${colors.completed} bg-opacity-20`);

        expect(stepContainers[1]).toHaveClass(`${colors.active} bg-opacity-20`);

        expect(stepContainers[2]).toHaveClass(`${colors.upcoming} bg-opacity-20`);
    });

    it('marks all as completed when finished=true', () => {
        render(<Stepper steps={steps} current={0} finished={true} colors={colors} />);

        const containers = screen.getAllByText(/First|Second|Third/).map((el) => el.closest('div')!);
        containers.forEach((div) => {
            expect(div).toHaveClass(`${colors.completed} bg-opacity-20`);
        });
    });
});