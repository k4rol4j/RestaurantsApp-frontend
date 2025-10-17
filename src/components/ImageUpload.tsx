import React from "react";
import { FileButton, Button, Group, Text } from "@mantine/core";
import SafeImage from "./SafeImage.tsx";

type Props = {
    value?: string;                // aktualny adres obrazka z bazy
    onChange: (url: string) => void; // callback do zapisania adresu
};

export default function ImageUpload({ value, onChange }: Props) {
    const [preview, setPreview] = React.useState<string | null>(null);

    // Aktualizuj podgląd, jeśli w bazie jest obraz
    React.useEffect(() => {
        if (value && !preview) {
            setPreview(value);
        }
    }, [value, preview]);

    const handleFile = (file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const url = reader.result as string;
            setPreview(url);
            onChange(url); // wyślij do parenta (np. zapis w data.imageUrl)
        };
        reader.readAsDataURL(file);
    };

    // Oblicz źródło obrazka: najpierw podgląd, potem istniejące z bazy
    const resolvedSrc =
        preview && preview.startsWith("data:")
            ? preview // świeżo wgrany (dataURL)
            : value
                ? value.startsWith("http")
                    ? value
                    : `https://restaurantsapp-backend.onrender.com${value}`
                : null;

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

            {resolvedSrc ? (
                <SafeImage
                    src={resolvedSrc}
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
                <Text
                    c="dimmed"
                    style={{
                        width: 180,
                        height: 120,
                        borderRadius: 8,
                        border: "1px solid #eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f8f9fa",
                    }}
                >
                    Brak zdjęcia
                </Text>
            )}
        </Group>
    );
}
