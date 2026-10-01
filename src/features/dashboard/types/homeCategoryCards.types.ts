import type { Ionicons } from '@expo/vector-icons';
import type { ListingCategory } from '@/navigation/types';

export type HomeCategoryCardItem = {
  key: ListingCategory;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
};

export type HomeCategoryCardsProps = {
  value: ListingCategory;
  options: HomeCategoryCardItem[];
  onChange: (next: ListingCategory) => void;
};
