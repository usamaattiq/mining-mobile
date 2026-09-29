import { Linking } from 'react-native';

export function openWhatsApp(phone: string): void {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return;
  void Linking.openURL(`https://wa.me/${digits}`);
}
