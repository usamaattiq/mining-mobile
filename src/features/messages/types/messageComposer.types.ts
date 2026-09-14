export type MessageComposerProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  sendLabel: string;
};
