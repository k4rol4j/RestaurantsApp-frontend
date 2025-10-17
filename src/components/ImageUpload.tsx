import React from "react";
import { FileButton, Button, Group, Text } from "@mantine/core";

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

    const handleFile = (file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const url = reader.result as string;
            setPreview(url);
            onChange(url);
        };
        reader.readAsDataURL(file);
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
