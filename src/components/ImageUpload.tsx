import React from 'react';
import { FileButton, Button, Group, Text } from '@mantine/core';
import {uploadImage} from "../api.ts";
import SafeImage from "./SafeImage.tsx";

type Props = {
    value?: string | null;           // ścieżka z bazy, np. /images/...
    onChange: (url: string) => void; // zapisujemy WZGLĘDNĄ ścieżkę
};

export default function ImageUpload({ value, onChange }: Props) {
    const [preview, setPreview] = React.useState<string | null>(null);
    const hasExisting = !!value;

    const handleFile = async (file: File | null) => {
        if (!file) return;
        const url = await uploadImage(file);            // <- POST /api/upload
        onChange(url);                                  // <- zapisz /images/...
        setPreview(url);                                // <- żeby od razu było widać
    };

    const srcForPreview = preview || value || null;

    return (
        <Group align="flex-start" gap="md">
            <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Obrazek (baner)</div>
                <FileButton onChange={handleFile} accept="image/*">
                    {(props) => <Button {...props}>Wybierz obrazek</Button>}
                </FileButton>
            </div>

            <div
                style={{
                    width: 220, height: 150, borderRadius: 8, border: '1px solid #ddd',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7',
                }}
            >
                {srcForPreview ? (
                    <SafeImage
                        src={srcForPreview}
                        alt="Podgląd"
                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    />
                ) : (
                    <Text c="dimmed">{hasExisting ? 'Ładowanie...' : 'Brak zdjęcia'}</Text>
                )}
            </div>
        </Group>
    );
}
