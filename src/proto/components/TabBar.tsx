import React from 'react';
import { TabBarView } from './generated/TabBar';

export type TabName = 'run' | 'navigate' | 'compliance' | 'messages' | 'profile';

export type TabBarProps = {
  active: TabName | string;
  unread?: boolean;
  onRun?: () => void;
  onNav?: () => void;
  onComp?: () => void;
  onMsg?: () => void;
  onProf?: () => void;
};

/**
 * The prototype selects the active tab with a single `active` string; the
 * artboard underneath wants a pair of booleans per tab.
 */
export function TabBar({ active, unread, ...handlers }: TabBarProps) {
  return (
    <TabBarView
      actRun={active === 'run'}
      offRun={active !== 'run'}
      actNav={active === 'navigate'}
      offNav={active !== 'navigate'}
      actComp={active === 'compliance'}
      offComp={active !== 'compliance'}
      actMsg={active === 'messages'}
      offMsg={active !== 'messages'}
      actProf={active === 'profile'}
      offProf={active !== 'profile'}
      unread={!!unread}
      {...handlers}
    />
  );
}
