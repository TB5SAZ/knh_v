export const formatName = (text: string) => {
  // Sadece harfler (Türkçe dahil) ve boşluk 
  const filtered = text.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
  
  return filtered
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR');
    })
    .join(' ');
};

export const formatLastName = (text: string) => {
  // Sadece harfler (Türkçe dahil) ve boşluk 
  const filtered = text.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
  
  return filtered.toLocaleUpperCase('tr-TR');
};

export const formatKey = (text: string) => {
  // Sadece İngilizce harf ve sayılar. Paste edilen UUID tirelerini yok edip saf 32 haneye indirger.
  return text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
};
