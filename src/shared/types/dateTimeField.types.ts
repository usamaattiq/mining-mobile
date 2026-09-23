export type DateTimeFieldProps = {
  label: string;
  value: Date | null;
  required?: boolean;
  /** Defaults to "Select date & time" when omitted. */
  placeholder?: string;
  /** Dates and times before this moment cannot be selected. */
  minimumDate?: Date;
  onChange: (value: Date) => void;
};
