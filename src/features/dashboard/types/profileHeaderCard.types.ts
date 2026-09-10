export type ProfileHeaderCardProps = {
  /** Single-letter fallback shown when there's no avatar photo. */
  initial: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};
