export type AttachmentDocument = {
  id: string;
  uri: string;
  name?: string;
};

export type AttachmentsSectionProps = {
  documents: AttachmentDocument[];
  /** Whether rows are pressable and download the document. Defaults to true; pass false for a read-only list (e.g. the form's review step). */
  downloadable?: boolean;
};
