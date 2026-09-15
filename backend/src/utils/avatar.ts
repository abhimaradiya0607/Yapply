// src/utils/avatar.ts

const avatarStyles = [
    "lorelei",
    "pixel-art",
    "adventurer",
    "avataaars",
    "bottts",
    "notionists",
  ] as const;
  
  const getStableHash = (value: string): number => {
    let hash = 0;
  
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
  
    return Math.abs(hash);
  };
  
  export const generateAvatarUrl = (userId: string): string => {
    const hash = getStableHash(userId);
  
    // Select a style consistently based on the user ID
    const style = avatarStyles[hash % avatarStyles.length];
  
    // Use the user ID as the avatar seed
    const seed = encodeURIComponent(userId);
  
    return `https://api.dicebear.com/10.x/${style}/svg?seed=${seed}&radius=50`;
  };