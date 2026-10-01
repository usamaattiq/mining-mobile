export type CodeInputProps = {
  length: number;
  value: string;
  onChangeValue: (value: string) => void;
  secure?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
};
