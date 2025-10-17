import React from 'react';
import { Button, Group, Text } from '@mantine/core';
import { uploadImage } from '../api';
import SafeImage from './SafeImage';

type Props = {
    value?: string | null;
    onChange: (url: string) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
    const [uploading, setUploading] = React.useState(false);
    const [preview, setPreview] = React.useState(value || null);

    const handleFile = async (file: File | null) => {
        if (!file) return;
        try {
            setUploading(true);
            const uploaded = await uploadImage(file);
            onChange(uploaded);
            setPreview(uploaded);
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Group align="flex-start" gap="md">
            <Button component="label" loading={uploading}>
                Wybierz obrazek
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleFile(e.target.files?.[0] || null)}
                />
            </Button>
            {preview ? (
                <SafeImage
                    src={preview}
                    alt="Podgląd"
                    style={{
                        width: 180,
                        height: 120,
                        borderRadius: 8,
                        objectFit: 'cover',
                        border: '1px solid #ddd',
                    }}
                />
            ) : (
                <Text c="dimmed">Brak zdjęcia</Text>
            )}
        </Group>
    );
}
