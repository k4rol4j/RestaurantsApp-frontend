import React from 'react';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    src?: string | null;    // akceptuje też null
    fallback?: string;      // domyślny lokalny placeholder
};

export default function SafeImage({
                                      src,
                                      fallback = '/placeholder-restaurant.svg',
                                      style,
                                      ...rest
                                  }: Props) {
    const [broken, setBroken] = React.useState(false);
    const finalSrc = !src || broken ? fallback : src;

    return (
        <img
            src={finalSrc}
            onError={() => setBroken(true)}
            style={{ objectFit: 'cover', ...style }}
            {...rest}
        />
    );
}
