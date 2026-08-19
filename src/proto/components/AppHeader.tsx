import React from 'react';
import { AppHeaderView } from './generated/AppHeader';

export type AppHeaderProps = {
  title?: string;
  sub?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightHelp?: boolean;
  rightPlus?: boolean;
  rightShare?: boolean;
  rightBell?: boolean;
  badge?: boolean;
  onRight?: () => void;
};

/**
 * A typed face over the generated artboard. The status bar space above the
 * header is a separate spacer element in the prototype, so it is not added
 * here.
 */
export function AppHeader(props: AppHeaderProps) {
  return <AppHeaderView {...props} />;
}
