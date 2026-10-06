export type ErrorStateProps = {
  title: string;
  subtitle?: string;
  retryLabel: string;
  onRetry: () => void;
  retryLoading?: boolean;
};
