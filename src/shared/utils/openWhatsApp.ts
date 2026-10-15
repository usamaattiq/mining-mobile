import { Linking } from 'react-native';

export function openWhatsApp(phone: string, message?: string): void {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return;
  const text = message?.trim();
  const url = text
    ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${digits}`;
  void Linking.openURL(url);
}
