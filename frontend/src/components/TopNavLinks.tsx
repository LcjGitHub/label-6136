import { Link } from 'react-router-dom';
import { Anchor, Group } from '@mantine/core';

export type NavLinkKey = 'sample-list' | 'key-types' | 'tags' | 'collectors';

interface NavLinkItem {
  key: NavLinkKey;
  label: string;
  to: string;
}

const NAV_LINKS: Record<NavLinkKey, NavLinkItem> = {
  'sample-list': { key: 'sample-list', label: '样本列表', to: '/' },
  'key-types': { key: 'key-types', label: '按键类型词典', to: '/key-types' },
  'tags': { key: 'tags', label: '标签管理', to: '/tags' },
  'collectors': { key: 'collectors', label: '采集者档案', to: '/collectors' },
};

export interface TopNavLinksProps {
  links: NavLinkKey[];
  justify?: React.ComponentProps<typeof Group>['justify'];
  gap?: React.ComponentProps<typeof Group>['gap'];
  mb?: React.ComponentProps<typeof Group>['mb'];
  withWrapper?: boolean;
}

export function TopNavLinks({
  links,
  justify = 'flex-end',
  gap,
  mb = 'md',
  withWrapper = true,
}: TopNavLinksProps) {
  const linkElements = links.map((linkKey) => {
    const link = NAV_LINKS[linkKey];
    return (
      <Anchor
        key={link.key}
        component={Link}
        to={link.to}
        inline
        c="dimmed"
      >
        {link.label}
      </Anchor>
    );
  });

  if (!withWrapper) {
    return <>{linkElements}</>;
  }

  return (
    <Group justify={justify} mb={mb} gap={gap}>
      {linkElements}
    </Group>
  );
}
