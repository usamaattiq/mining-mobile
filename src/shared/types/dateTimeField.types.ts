export type DateTimeFieldProps = {
  label: string;
  value: Date | null;
  required?: boolean;
  /** Defaults to "Select date & time" when omitted. */
  placeholder?: string;
  onChange: (value: Date) => void;
};
