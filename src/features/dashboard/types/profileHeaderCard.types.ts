export type ProfileHeaderCardProps = {
  /** Single-letter fallback shown when there's no avatar photo. */
  initial: string;
  /** Avatar object key/URL, resolved to a displayable URL internally. */
  avatarUrl?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  /** Navigates to the editable profile screen when the avatar is tapped. */
  onPressAvatar?: () => void;
};
