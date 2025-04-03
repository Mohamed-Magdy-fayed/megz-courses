import { useEffect, useState } from 'react';
import { Typography } from '@/components/ui/Typoghraphy';
import { cn } from '@/lib/utils';

type CounterProps = {
    target: number;
    label?: string;
    percentage?: boolean;
    currency?: 'USD' | 'EUR' | 'JPY' | 'GBP' | 'EGP';
    color?: string;
};

const Counter: React.FC<CounterProps> = ({ target, label, percentage, currency, color }) => {
    const [count, setCount] = useState(0);
    const duration = target < 1000 ? 2000 : 3000;

    useEffect(() => {
        const step = (target / duration) * 10;

        const timer = setInterval(() => {
            setCount((prevCount) => {
                if (prevCount + step >= target) {
                    clearInterval(timer);
                    return target;
                }
                return prevCount + step;
            });
        }, 10);

        return () => clearInterval(timer);
    }, [target]);

    const formatOutput = (number: number) => {
        if (percentage) {
            return new Intl.NumberFormat('en-US', {
                style: 'percent',
                maximumFractionDigits: 2,
            }).format(number);
        } else if (currency) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
                notation: 'compact',
            }).format(number);
        } else {
            return new Intl.NumberFormat('en-US', {
                notation: 'compact',
                compactDisplay: 'short',
            }).format(number);
        }
    };

    return (
        <Typography variant="bodyText" className={cn("!text-3xl font-bold", color)}>
            {label ? `${formatOutput(count)} ${label}` : formatOutput(count)}
        </Typography>
    );
};

export default Counter;
