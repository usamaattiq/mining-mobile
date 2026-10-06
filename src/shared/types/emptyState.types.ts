import type { ImageSourcePropType } from 'react-native';

export type EmptyStateProps = {
  title: string;
  subtitle?: string;
  /** Optional illustration (e.g. no-listing artwork). */
  image?: ImageSourcePropType;
};
