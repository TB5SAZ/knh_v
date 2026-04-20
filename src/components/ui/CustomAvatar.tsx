import React from 'react';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/src/components/ui/avatar';

export interface CustomAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomAvatar({ name, imageUrl, size = 'md' }: CustomAvatarProps) {
  // İkinci isim varsa yoksayıp sadece ilk ve son kelimeyi (ismi ve soyismi) alıyoruz
  const nameParts = (name || '').trim().split(/\s+/);
  let displayName = name;
  if (nameParts.length >= 2) {
    const first = nameParts[0];
    const last = nameParts[nameParts.length - 1];
    displayName = `${first} ${last}`;
  }

  return (
    <Avatar size={size} className="bg-[#35bfa3]">
      <AvatarFallbackText style={{ fontFamily: 'DMSans_600SemiBold', fontSize: size === 'sm' ? 12 : 14 }} className="text-white">
        {displayName}
      </AvatarFallbackText>
      {imageUrl && <AvatarImage source={{ uri: imageUrl }} />}
    </Avatar>
  );
}
