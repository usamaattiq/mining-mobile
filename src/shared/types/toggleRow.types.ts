export type ToggleRowProps = {
  title: string;
  subtitle?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
};
