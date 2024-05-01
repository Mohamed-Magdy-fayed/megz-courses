import { useEffect, useState } from 'react';
import { Typography } from '../ui/Typoghraphy';
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

    const formatNumber = (number: number, maxDecimalDigits: number) => {
        if (percentage) {
            return new Intl.NumberFormat('en-US', {
                style: 'percent',
                maximumFractionDigits: maxDecimalDigits,
            }).format(number);
        } else if (currency) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
            }).format(number);
        } else {
            return number.toLocaleString('en-US', {
                maximumFractionDigits: maxDecimalDigits,
            });
        };
    };

    const formatOutput = (number: number) => {
        if (number >= 1000000) {
            return `${formatNumber(number / 1000000, 2)}m`;
        } else if (number >= 1000) {
            return `${formatNumber(number / 1000, 2)}k`;
        } else if (label) {
            return `${formatNumber(number, 0)} ${label}`;
        } else if (percentage) {
            return formatNumber(number, 2);
        } else {
            return formatNumber(number, 2)
        }
    };

    return (
        <Typography variant="bodyText" className={cn("!text-3xl font-bold", color)}>
            {formatOutput(count)}
        </Typography>
    );
};

export default Counter;
