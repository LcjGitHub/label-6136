import { Link } from 'react-router-dom';
import { Anchor, Group } from '@mantine/core';

export type NavLinkKey =
  | 'sample-list'
  | 'key-types'
  | 'eras'
  | 'tags'
  | 'collectors'
  | 'collection-records'
  | 'operation-logs';

interface NavLinkItem {
  key: NavLinkKey;
  label: string;
  to: string;
}

const NAV_LINKS: Record<NavLinkKey, NavLinkItem> = {
  'sample-list': { key: 'sample-list', label: '样本列表', to: '/' },
  'key-types': { key: 'key-types', label: '按键类型词典', to: '/key-types' },
  'eras': { key: 'eras', label: '年代词典', to: '/eras' },
  'tags': { key: 'tags', label: '标签管理', to: '/tags' },
  'collectors': { key: 'collectors', label: '采集者档案', to: '/collectors' },
  'collection-records': { key: 'collection-records', label: '采集记录', to: '/collection-records' },
  'operation-logs': { key: 'operation-logs', label: '操作日志', to: '/operation-logs' },
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
