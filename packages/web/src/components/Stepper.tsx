'use client';

interface StepperProps {
    steps: string[];
    current: number;
    finished?: boolean;
    colors: {
        completed: string;
        active: string;
        upcoming: string;
    };
}

export function Stepper({ steps, current, finished = false, colors }: StepperProps) {
    return (
        <div className="sticky top-0 z-20 bg-white p-4 shadow w-full">
            <div className="flex items-center justify-between w-full">
                {steps.map((label, idx) => {
                    const isCompleted = finished ? idx <= current : idx < current;
                    const isActive    = !finished && idx === current;
                    const bgClass     = isCompleted
                        ? colors.completed + " bg-opacity-20"
                        : isActive
                            ? colors.active + " bg-opacity-20"
                            : colors.upcoming + " bg-opacity-20";

                    return (
                        <div
                            key={idx}
                            className={
                                `flex-1 flex items-center p-2 shadow rounded-lg mx-1 transition-colors duration-200 ${bgClass}`
                            }
                        >
                            <div className={`h-5 w-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white ${isCompleted ? colors.completed : isActive ? colors.active : colors.upcoming}`}>
                                {isCompleted ? <span>&#10003;</span> : idx + 1}
                            </div>
                            <p className="ml-2 text-sm font-medium">
                                {label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

