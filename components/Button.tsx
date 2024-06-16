import React, { useEffect, useState } from 'react';

type ButtonProps = {
    color: string;
    size: 'small' | 'medium' | 'large';
    border?: boolean
    rounded?: boolean
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
};

export default function Button({ color, size, rounded = true, border = false, onClick, children, className }: ButtonProps) {
    const small = 'text-xs py-1 px-2';

    const medium = `text-md py-2 px-3`;

    const large = 'text-lg py-3 px-4';

    const layout = `${rounded ? 'rounded-full' : ''} ${border ? 'border' : ''} ${className}`

    const style = {
        black: `bg-black text-white`,
        white: `bg-white text-black border`,
        primary: `bg-${color} text-white`,
        secondary: `bg-white text-${color} border border-${color}`,
        danger: `bg-red-500 text-white`,
        warning: `bg-yellow-500 text-white`
    }[color];

    const computedClass = `${style} ${layout} ${size === 'small' ? small : size === 'medium' ? medium : large}`

    return (
        <button className={computedClass} onClick={onClick}>
            {children}
        </button>
    );
};