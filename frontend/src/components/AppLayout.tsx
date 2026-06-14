import { createContext, useContext, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Text,
  Title,
  Anchor,
} from '@mantine/core';
import {
  IconVolume,
  IconExchange,
  IconTag,
  IconTags,
  IconUser,
  IconHome,
  IconHistory,
} from '@tabler/icons-react';

interface PageTitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType>({
  title: '',
  setTitle: () => {},
});

export function usePageTitle(title: string) {
  const { setTitle } = useContext(PageTitleContext);
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
}

interface NavItem {
  key: string;
  label: string;
  to: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'sample-list', label: '样本列表', to: '/', icon: <IconVolume size={20} /> },
  { key: 'sample-compare', label: '样本对比', to: '/devices/compare', icon: <IconExchange size={20} /> },
  { key: 'key-types', label: '按键类型词典', to: '/key-types', icon: <IconTag size={20} /> },
  { key: 'tags', label: '标签管理', to: '/tags', icon: <IconTags size={20} /> },
  { key: 'collectors', label: '采集者档案', to: '/collectors', icon: <IconUser size={20} /> },
  { key: 'operation-logs', label: '操作日志', to: '/operation-logs', icon: <IconHistory size={20} /> },
];

const DEFAULT_TITLES: Record<string, string> = {
  '/': '样本列表',
  '/devices/compare': '样本对比',
  '/key-types': '按键类型词典',
  '/tags': '标签管理',
  '/collectors': '采集者档案',
  '/eras': '年代词典',
  '/collection-records': '采集记录',
  '/operation-logs': '操作日志',
};

export function AppLayout() {
  const location = useLocation();
  const [mobileOpened, setMobileOpened] = useState(false);
  const [pageTitle, setPageTitle] = useState('');

  const currentPath = location.pathname;

  useEffect(() => {
    const matched =
      DEFAULT_TITLES[currentPath] ||
      Object.entries(DEFAULT_TITLES).find(([path]) => currentPath.startsWith(path) && path !== '/')?.[1] ||
      '';
    if (matched) {
      setPageTitle(matched);
    }
  }, [currentPath]);

  const isActive = (to: string) => {
    if (to === '/') {
      return currentPath === '/';
    }
    return currentPath === to || currentPath.startsWith(to + '/');
  };

  return (
    <PageTitleContext.Provider value={{ title: pageTitle, setTitle: setPageTitle }}>
      <AppShell
        layout="alt"
        navbar={{
          width: 240,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened },
        }}
        header={{ height: 64 }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group gap="sm">
              <Burger
                opened={mobileOpened}
                onClick={() => setMobileOpened((o) => !o)}
                hiddenFrom="sm"
                size="sm"
              />
              <Anchor component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Group gap="xs">
                  <IconHome size={18} stroke={1.5} />
                  <Text size="sm" fw={500}>首页</Text>
                </Group>
              </Anchor>
              <Text size="sm" c="dimmed">/</Text>
              <Title order={5} style={{ margin: 0 }}>
                {pageTitle || '页面'}
              </Title>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <AppShell.Section grow component={ScrollArea}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.key}
                component={Link}
                to={item.to}
                label={item.label}
                leftSection={item.icon}
                active={isActive(item.to)}
                onClick={() => setMobileOpened(false)}
                mb={4}
              />
            ))}
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </PageTitleContext.Provider>
  );
}
