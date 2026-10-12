import type { ImageSourcePropType } from 'react-native';
import type { ListingCategory } from '@/navigation/types';

export type HomeCategoryCardItem = {
  key: ListingCategory;
  icon: ImageSourcePropType;
  title: string;
  subtitle: string;
};

export type HomeCategoryCardsProps = {
  heading: string;
  description: string;
  value: ListingCategory;
  options: HomeCategoryCardItem[];
  onChange: (next: ListingCategory) => void;
};
