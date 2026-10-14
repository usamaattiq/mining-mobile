export type EquipmentMediaKind = 'photo' | 'video';

export type EquipmentMediaAsset = {
  id: string;
  uri: string;
  kind: EquipmentMediaKind;
};

export type EquipmentMediaUploaderProps = {
  media: EquipmentMediaAsset[];
  onChange: (media: EquipmentMediaAsset[]) => void;
  onBusyChange?: (busy: boolean) => void;
  required?: boolean;
  /** Buyer request copy — “what you need” instead of listing media. */
  isRequest?: boolean;
};
