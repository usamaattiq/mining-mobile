import type { LegalDocumentKind } from '@/shared/constants/legalContent';

export type LegalDocumentSheetProps = {
  visible: boolean;
  doc: LegalDocumentKind | null;
  onClose: () => void;
};
