import type { Ionicons } from '@expo/vector-icons';

export type ListingCardBadge = {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'muted' | 'accent' | 'warning' | 'success';
};

export type ListingCardProps = {
  title: string;
  reference?: string;
  /** First photo's uri, if any — falls back to `placeholderIcon`. */
  thumbnail?: string;
  placeholderIcon: keyof typeof Ionicons.glyphMap;
  /** Type / units line under the title. */
  subtitle?: string;
  /** Icon shown before the type / units line. */
  subtitleIcon?: keyof typeof Ionicons.glyphMap;
  /** Units count shown on its own row under the category. */
  unitsLabel?: string;
  /** Icon for the units row — defaults to layers-outline when unitsLabel is set. */
  unitsIcon?: keyof typeof Ionicons.glyphMap;
  /** RFQ / listing status — top right, inline with the title. */
  typeBadge?: ListingCardBadge;
  /** City line under the type. */
  city?: string;
  /** Unused — kept for callers; duration chips are not shown on cards. */
  durationBadges?: ListingCardBadge[];
  /** Delivery — bottom left with rent / sell. */
  deliveryBadge?: ListingCardBadge;
  /** Buyer equipment: RFQ or Auction. */
  requestBadge?: ListingCardBadge;
  /** Rent, sell, online, onsite — bottom left. */
  statusBadges?: ListingCardBadge[];
  /**
   * When true, keep the title under the status row (e.g. long
   * "Awaiting your confirmation" badges). Otherwise title sits inline with status.
   */
  titleBelowStatus?: boolean;
  priceText?: string;
  /** Grey period/type label after the amount, same as details. */
  priceUnit?: string;
  /** When set, each line is amount + grey unit (onsite/online or rent period). */
  priceLines?: Array<{ text: string; unit?: string }>;
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
