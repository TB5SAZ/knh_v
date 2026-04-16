import React from 'react';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/src/components/ui/avatar';

export interface CustomAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomAvatar({ name, imageUrl, size = 'md' }: CustomAvatarProps) {
  return (
    <Avatar size={size} className="bg-teal-500 w-[40px] h-[40px]">
      <AvatarFallbackText style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 14 }} className="text-white">{name}</AvatarFallbackText>
      {imageUrl && <AvatarImage source={{ uri: imageUrl }} />}
    </Avatar>
  );
}
