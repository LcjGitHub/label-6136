import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconTrash } from '@tabler/icons-react';
import { useDeviceStore } from '../store/deviceStore';
import type { DeviceInput } from '../types/device';

/**
 * 设备详情页：查看与编辑单条样本
 */
export function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { current, loading, error, fetchOne, update, remove, clearCurrent } = useDeviceStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<DeviceInput | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOne(Number(id));
    }
    return () => clearCurrent();
  }, [id, fetchOne, clearCurrent]);

  useEffect(() => {
    if (current) {
      setForm({
        brand_model: current.brand_model,
        era: current.era,
        key_type: current.key_type,
        sound_description: current.sound_description,
        location: current.location,
      });
    }
  }, [current]);

  const handleSave = async () => {
    if (!form || !id) return;
    setSubmitting(true);
    try {
      await update(Number(id), form);
      setEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    if (window.confirm(`确定删除「${current.brand_model}」？`)) {
      await remove(current.id);
      navigate('/');
    }
  };

  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (error || !current || !form) {
    return (
      <Container size="md" py="xl">
        <Alert color="red">{error ?? '设备不存在'}</Alert>
        <Anchor component={Link} to="/" mt="md">
          返回列表
        </Anchor>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Anchor component={Link} to="/" mb="lg" inline>
        <Group gap={4}>
          <IconArrowLeft size={16} />
          <span>返回列表</span>
        </Group>
      </Anchor>

      <Group justify="space-between" mb="lg">
        <Title order={2}>{current.brand_model}</Title>
        <Badge size="lg" variant="light">
          {current.era}
        </Badge>
      </Group>

      <Paper withBorder p="lg" radius="md">
        {editing ? (
          <Stack gap="sm">
            <TextInput
              label="品牌型号"
              required
              value={form.brand_model}
              onChange={(e) => setForm({ ...form, brand_model: e.currentTarget.value })}
            />
            <TextInput
              label="年代"
              required
              value={form.era}
              onChange={(e) => setForm({ ...form, era: e.currentTarget.value })}
            />
            <TextInput
              label="按键类型"
              required
              value={form.key_type}
              onChange={(e) => setForm({ ...form, key_type: e.currentTarget.value })}
            />
            <Textarea
              label="声音描述"
              required
              minRows={4}
              value={form.sound_description}
              onChange={(e) => setForm({ ...form, sound_description: e.currentTarget.value })}
            />
            <TextInput
              label="获取地点"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.currentTarget.value })}
            />
          </Stack>
        ) : (
          <Stack gap="md">
            <div>
              <Text size="sm" c="dimmed">
                按键类型
              </Text>
              <Text>{current.key_type}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                声音描述
              </Text>
              <Text>{current.sound_description}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                获取地点
              </Text>
              <Text>{current.location}</Text>
            </div>
            <Text size="xs" c="dimmed">
              创建于 {current.created_at} · 更新于 {current.updated_at}
            </Text>
          </Stack>
        )}
      </Paper>

      <Group mt="lg">
        {editing ? (
          <>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              loading={submitting}
              onClick={handleSave}
            >
              保存
            </Button>
            <Button variant="default" onClick={() => setEditing(false)}>
              取消
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setEditing(true)}>编辑</Button>
            <Button
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              onClick={handleDelete}
            >
              删除
            </Button>
          </>
        )}
      </Group>
    </Container>
  );
}
