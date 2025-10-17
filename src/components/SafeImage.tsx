import React from "react";
import {API_URL} from "../config.ts";

const API_ORIGIN = API_URL.replace(/\/api$/, "");

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    src?: string | null;
    fallback?: string;
};

export default function SafeImage({
                                      src,
                                      fallback = "/placeholder-restaurant.svg",
                                      style,
                                      ...rest
                                  }: Props) {
    const [broken, setBroken] = React.useState(false);
    const finalSrc =
        !src || broken
            ? fallback
            : src.startsWith("/images/")
                ? `${API_ORIGIN}${src}`
                : src;

    return (
        <img
            src={finalSrc}
            onError={() => setBroken(true)}
            style={{ objectFit: "cover", ...style }}
            {...rest}
        />
    );
}
