import type { Ionicons } from '@expo/vector-icons';

export type ListingCardBadge = {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export type ListingCardProps = {
  title: string;
  /** First photo's uri, if any — falls back to `placeholderIcon`. */
  thumbnail?: string;
  placeholderIcon: keyof typeof Ionicons.glyphMap;
  /** Small subtitle line under the title (e.g. equipment type, service category). */
  subtitle?: string;
  /** Filled gold pill — e.g. Rent/Sell, Onsite/Online. */
  primaryBadge?: ListingCardBadge;
  /** Soft-gold pills — e.g. duration, purity, weight. */
  secondaryBadges?: ListingCardBadge[];
  /** Pill in the top-right corner — e.g. "Delivery". */
  cornerBadge?: ListingCardBadge;
  priceText?: string;
  /** Epoch ms the listing was created — shown as a live "Xh Ym" countdown when provided. */
  createdAt?: number;
  onPress: () => void;
};
