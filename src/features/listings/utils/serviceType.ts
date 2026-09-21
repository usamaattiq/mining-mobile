import type { TFunction } from 'i18next';
import type { ServiceType } from '@/navigation/types';

export function serviceTypeFlags(type: ServiceType | null | undefined): {
  onsite: boolean;
  online: boolean;
} {
  return {
    onsite: type === 'onsite' || type === 'both',
    online: type === 'online' || type === 'both',
  };
}

export function serviceTypeFromFlags(onsite: boolean, online: boolean): ServiceType | null {
  if (onsite && online) return 'both';
  if (onsite) return 'onsite';
  if (online) return 'online';
  return null;
}

export function serviceTypeLabels(t: TFunction, type: ServiceType | null | undefined): string[] {
  const flags = serviceTypeFlags(type);
  const labels: string[] = [];
  if (flags.onsite) labels.push(t('serviceListing.onsite'));
  if (flags.online) labels.push(t('serviceListing.online'));
  return labels;
}
