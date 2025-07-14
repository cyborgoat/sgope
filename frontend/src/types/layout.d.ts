/**
 * Layout and Component Props Types
 * Used in AppLayout and other layout components
 */

export interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
}

export interface AppLayoutProps {
  children: React.ReactNode;
}
