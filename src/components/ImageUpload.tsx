import React from "react";
import { FileButton, Button, Group, Text } from "@mantine/core";
import {uploadImage} from "../api.ts";

type Props = {
    value?: string;
    onChange: (url: string) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
    const [preview, setPreview] = React.useState<string | null>(null);

    React.useEffect(() => {
        // ustaw podgląd jeśli mamy wartość z bazy
        if (value && !preview) {
            const url = value.startsWith("http")
                ? value
                : `https://restaurantsapp-backend.onrender.com${value}`;
            setPreview(url);
        }
    }, [value, preview]);

    const handleFile = async (file: File | null) => {
        if (!file) return;
        try {
            const uploadedUrl = await uploadImage(file);
            setPreview(`https://restaurantsapp-backend.onrender.com${uploadedUrl}`);
            onChange(uploadedUrl); // zapisz ścieżkę względną do bazy
        } catch (e) {
            console.error(e);
            alert("Błąd podczas przesyłania pliku.");
        }
    };

    return (
        <Group align="flex-start" gap="md">
            <div>
                <Text fw={500} mb={4}>
                    Obrazek (baner)
                </Text>
                <FileButton onChange={handleFile} accept="image/*">
                    {(props) => <Button {...props}>Wybierz obrazek</Button>}
                </FileButton>
            </div>

            <div
                style={{
                    width: 180,
                    height: 120,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f8f9fa",
                }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Podgląd"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                        }}
                        onError={() => setPreview(null)}
                    />
                ) : (
                    <Text c="dimmed">Brak zdjęcia</Text>
                )}
            </div>
        </Group>
    );
}
