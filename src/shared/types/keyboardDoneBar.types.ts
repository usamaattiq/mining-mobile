export type KeyboardDoneBarProps = {
  nativeID: string;
  /** Done is only tappable once the field (and its action) is valid. */
  disabled?: boolean;
  /** Called after the keyboard is dismissed, e.g. to advance/submit like the screen's own CTA. */
  onDone?: () => void;
};
