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
  /** Type / units line under the title. */
  subtitle?: string;
  /** Icon shown before the type / units line. */
  subtitleIcon?: keyof typeof Ionicons.glyphMap;
  /** Replaces the type line (e.g. Auction on gold cards). */
  typeBadge?: ListingCardBadge;
  /** City line under the type. */
  city?: string;
  /** Hourly / weekly / monthly — top left. */
  durationBadges?: ListingCardBadge[];
  /** Shown top left when there are no duration badges. */
  topDateText?: string;
  /** Delivery — top right. */
  deliveryBadge?: ListingCardBadge;
  /** Rent, sell, online, onsite, K, g — bottom left. */
  statusBadges?: ListingCardBadge[];
  priceText?: string;
  /** Rental unit shown after the amount (/hr, /w, /m) — same typeface as the price. */
  priceUnit?: string;
  /** Epoch ms the listing was created — countdown, bottom right. */
  createdAt?: number;
  onPress: () => void;
};
