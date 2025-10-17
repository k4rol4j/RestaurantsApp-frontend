import React from 'react';

const API_URL = import.meta.env.VITE_API_URL as string;
const API_ORIGIN = API_URL.replace(/\/api$/, '');

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src?: string | null;
    fallback?: string;
};

export default function SafeImage({ src, fallback = '/placeholder-restaurant.svg', style, ...rest }: Props) {
    const [broken, setBroken] = React.useState(false);
    const fixed = !src
        ? null
        : src.startsWith('/images/')
            ? `${API_ORIGIN}${src}`
            : src;
    const finalSrc = !fixed || broken ? fallback : fixed;

    return (
        <img
            src={finalSrc}
            onError={() => setBroken(true)}
            style={{ objectFit: 'cover', ...style }}
            {...rest}
        />
    );
}
