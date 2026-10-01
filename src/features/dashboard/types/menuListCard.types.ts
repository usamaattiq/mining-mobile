import type { MenuRowProps } from '@/features/dashboard/types/menuRow.types';

export type MenuListItem = Omit<MenuRowProps, 'variant' | 'showBorder'>;

export type MenuListCardProps = {
  items: MenuListItem[];
};
