import React from "react";
import { FileButton, Button, Group, Text } from "@mantine/core";
import SafeImage from "./SafeImage";
import {API_URL} from "../config.ts";

const API_ORIGIN = API_URL.replace(/\/api$/, "");

type Props = {
    value?: string | null;           // adres zdjęcia z bazy
    onChange: (url: string) => void; // callback po wyborze nowego
};

export default function ImageUpload({ value, onChange }: Props) {
    const [preview, setPreview] = React.useState<string | null>(null);

    // wylicz adres zdjęcia z bazy (jeśli nie wybrano nowego)
    const currentSrc =
        preview ??
        (value
            ? value.startsWith("/images/")
                ? `${API_ORIGIN}${value}`
                : value
            : null);

    const handleFile = (file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const url = reader.result as string;
            setPreview(url);
            // ⚠️ Backendowy upload zrobimy później — teraz tylko zapamiętujemy base64
            onChange(url);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Group align="flex-start">
            <FileButton onChange={handleFile} accept="image/*">
                {(props) => <Button {...props}>Wybierz obrazek</Button>}
            </FileButton>

            {currentSrc ? (
                <SafeImage
                    src={currentSrc}
                    alt="Podgląd"
                    fallback="/placeholder-restaurant.svg"
                    style={{
                        width: 180,
                        height: 120,
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "1px solid #ddd",
                    }}
                />
            ) : (
                <Text c="dimmed">Brak zdjęcia</Text>
            )}
        </Group>
    );
}
