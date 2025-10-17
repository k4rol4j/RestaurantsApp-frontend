import React from 'react';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src?: string | null;
    fallback?: string;
};

export default function SafeImage({
                                      src,
                                      fallback = '/placeholder-restaurant.svg',
                                      style,
                                      ...rest
                                  }: Props) {
    const [broken, setBroken] = React.useState(false);

    // 👇 jeśli ścieżka jest względna, doklej backend URL
    const fixedSrc =
        src && !src.startsWith('http')
            ? `https://restaurantsapp-backend.onrender.com${src}`
            : src;

    const finalSrc = !fixedSrc || broken ? fallback : fixedSrc;

    return (
        <img
            src={finalSrc}
            onError={() => setBroken(true)}
            style={{
                objectFit: 'cover',
                width: '100%',
                borderRadius: '8px',
                ...style,
            }}
            {...rest}
        />
    );
}
