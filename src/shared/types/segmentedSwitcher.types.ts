export type SegmentedSwitcherOption<T extends string> = {
  key: T;
  label: string;
  alert?: boolean;
};

export type SegmentedSwitcherProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedSwitcherOption<T>[];
};
