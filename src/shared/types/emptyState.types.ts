import type { ImageSourcePropType } from 'react-native';

export type EmptyStateProps = {
  title: string;
  subtitle?: string;
  /** Override the default empty illustration. Pass null to hide it. */
  image?: ImageSourcePropType | null;
};
