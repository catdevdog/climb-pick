import React, { useEffect, useState } from 'react';

type ButtonProps = {
    color: 'black' | 'white' | 'primary' | 'secondary' | 'danger' | 'warning' | 'info';
    size: 'small' | 'medium' | 'large';
    border?: boolean
    rounded?: boolean
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
};

export default function Button({ color, size, rounded = true, border = false, onClick, children, className }: ButtonProps) {
    const _layout = `${rounded ? 'rounded-full' : ''} ${border ? 'border' : ''} ${className}`

    const _size = {
        small: 'text-xs py-2 px-3',
        medium: 'text-md py-2 px-4',
        large: 'text-lg py-2 px-4'
    }[size];

    const _color = {
        black: `bg-black text-white`,
        white: `bg-white text-black border`,
        primary: `bg-black text-white`,
        secondary: `bg-white text-${color} border border-${color}`,
        danger: `bg-red-500 text-white`,
        warning: `bg-yellow-500 text-white`,
        info: `bg-blue-500 text-white`,
    }[color];

    const _class = `${_layout} ${_color} ${_size}`

    return (
        <button className={_class} onClick={onClick}>
            {children}
        </button>
    );
};