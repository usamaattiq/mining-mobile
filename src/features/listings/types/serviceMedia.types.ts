export type ServiceMediaKind = 'photo' | 'document';

export type ServiceMediaAsset = {
  id: string;
  /** Local file uri for a photo, or the public S3 url once a document finishes uploading. */
  uri: string;
  kind: ServiceMediaKind;
  name?: string;
  /** S3 object key for a document (set once its upload completes). */
  key?: string;
};

export type ServiceMediaUploaderProps = {
  media: ServiceMediaAsset[];
  onChange: (media: ServiceMediaAsset[]) => void;
  required?: boolean;
  /** Buyer request copy — “what you need” instead of listing media. */
  isRequest?: boolean;
};
