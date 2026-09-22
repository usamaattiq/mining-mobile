import type { Ionicons } from '@expo/vector-icons';

export type ListingCardBadge = {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'muted' | 'accent' | 'warning' | 'success';
};

export type ListingCardProps = {
  title: string;
  /** First photo's uri, if any — falls back to `placeholderIcon`. */
  thumbnail?: string;
  placeholderIcon: keyof typeof Ionicons.glyphMap;
  /** Type / units line under the title. */
  subtitle?: string;
  /** Icon shown before the type / units line. */
  subtitleIcon?: keyof typeof Ionicons.glyphMap;
  /** RFQ / listing status — top right (where Delivery used to sit). */
  typeBadge?: ListingCardBadge;
  /** City line under the type. */
  city?: string;
  /** Unused — kept for callers; duration chips are not shown on cards. */
  durationBadges?: ListingCardBadge[];
  /** Delivery — top left. */
  deliveryBadge?: ListingCardBadge;
  /** Rent, sell, online, onsite — bottom left. */
  statusBadges?: ListingCardBadge[];
  priceText?: string;
  /** Rental unit shown after the amount (/hr, /w, /m) — same typeface as the price. */
  priceUnit?: string;
  /** Epoch ms the listing was created — countdown, bottom right. */
  createdAt?: number;
  /** RFQ expiry from RMS; used for the card countdown when present. */
  expiresAt?: number;
  /** Hide remaining-time and show Repost when the listing/RFQ has ended. */
  ended?: boolean;
  onRepost?: () => void;
  onPress: () => void;
  layout?: 'row' | 'grid';
};
