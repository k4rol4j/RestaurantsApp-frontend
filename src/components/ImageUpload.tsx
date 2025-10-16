import React from "react";
import { FileButton, Button, Group, Text } from "@mantine/core";
import SafeImage from "./SafeImage.tsx";

type Props = {
    value?: string;
    onChange: (url: string) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
    const [preview, setPreview] = React.useState(value ?? "");

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
        <Group align="flex-start">
            <FileButton onChange={handleFile} accept="image/*">
                {(props) => <Button {...props}>Wybierz obrazek</Button>}
            </FileButton>

            {preview ? (
                <SafeImage
                    src={preview}
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
