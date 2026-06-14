import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Container,
  Group,
  Loader,
  Table,
  Text,
  Title,
  Paper,
} from '@mantine/core';
import { IconArrowLeft, IconStar, IconStarFilled, IconTrash, IconVolume } from '@tabler/icons-react';
import { useFavoriteStore } from '../store/favoriteStore';
import * as deviceApi from '../api/devices';
import type { Device } from '../types/device';
import { extractErrorMessage } from '../utils/error';

export function FavoriteListPage() {
  const { favoriteIds, removeFavorite, clearAll } = useFavoriteStore();
  const [favorites, setFavorites] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      if (favoriteIds.length === 0) {
        setFavorites([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const results: Device[] = [];
        for (const id of favoriteIds) {
          try {
            const device = await deviceApi.fetchDevice(id);
            results.push(device);
          } catch {
            useFavoriteStore.getState().removeFavorite(id);
          }
        }
        if (!cancelled) {
          setFavorites(results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(extractErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [favoriteIds]);

  const handleRemoveFavorite = (id: number, name: string) => {
    if (window.confirm(`确定取消收藏「${name}」？`)) {
      removeFavorite(id);
    }
  };

  const handleClearAll = () => {
    if (favoriteIds.length === 0) return;
    if (window.confirm('确定清空全部收藏？')) {
      clearAll();
    }
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconStarFilled size={28} stroke={1.5} color="#fbbf24" />
          <Title order={2}>我的收藏</Title>
          <Badge size="lg" variant="light" color="yellow">
            {favoriteIds.length} 个样本
          </Badge>
        </Group>
        <Group gap="sm">
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            component={Link}
            to="/"
          >
            返回列表
          </Button>
          {favoriteIds.length > 0 && (
            <Button
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              onClick={handleClearAll}
            >
              清空收藏
            </Button>
          )}
        </Group>
      </Group>

      {error && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      {loading ? (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      ) : favorites.length === 0 ? (
        <Paper withBorder p="xl" mt="xl" style={{ textAlign: 'center' }}>
          <Group justify="center" mb="md">
            <IconStar size={60} color="#d1d5db" />
          </Group>
          <Title order={4} mb="xs" c="dimmed">
            暂无收藏
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            在样本列表中点击收藏按钮，将喜欢的样本添加到这里
          </Text>
          <Button component={Link} to="/" leftSection={<IconVolume size={16} />}>
            去浏览样本
          </Button>
        </Paper>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>品牌型号</Table.Th>
              <Table.Th>年代</Table.Th>
              <Table.Th>按键类型</Table.Th>
              <Table.Th>音质评分</Table.Th>
              <Table.Th>标签</Table.Th>
              <Table.Th>获取地点</Table.Th>
              <Table.Th w={100}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {favorites.map((device) => (
              <Table.Tr key={device.id}>
                <Table.Td>
                  <Text component={Link} to={`/devices/${device.id}`} fw={500} c="blue">
                    {device.brand_model}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light">{device.era}</Badge>
                </Table.Td>
                <Table.Td>{device.key_type}</Table.Td>
                <Table.Td>
                  {(() => {
                    const rating = device.sound_rating;
                    if (rating == null) {
                      return <Text size="sm" c="dimmed">—</Text>;
                    }
                    return (
                      <Group gap={2}>
                        {[1, 2, 3, 4, 5].map((value) =>
                          rating >= value ? (
                            <IconStarFilled key={value} size={14} color="#fbbf24" fill="#fbbf24" />
                          ) : (
                            <IconStar key={value} size={14} color="#d1d5db" />
                          )
                        )}
                        <Text size="xs" c="dimmed" ml={4}>
                          {rating}
                        </Text>
                      </Group>
                    );
                  })()}
                </Table.Td>
                <Table.Td>
                  {(device.tags || []).length > 0 ? (
                    <Group gap={4}>
                      {device.tags.map((tag) => (
                        <Badge key={tag.id} variant="light" color="grape" size="sm">
                          {tag.name}
                        </Badge>
                      ))}
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">无</Text>
                  )}
                </Table.Td>
                <Table.Td>{device.location}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      component={Link}
                      to={`/devices/${device.id}`}
                      color="blue"
                      variant="subtle"
                      aria-label="查看详情"
                    >
                      <IconVolume size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="yellow"
                      variant="subtle"
                      aria-label="取消收藏"
                      onClick={() => handleRemoveFavorite(device.id, device.brand_model)}
                    >
                      <IconStarFilled size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}
