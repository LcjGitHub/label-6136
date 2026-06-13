import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Anchor,
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
import { useCollectorStore } from '../store/collectorStore';
import type { CollectorInput } from '../types/collector';

/**
 * 采集者详情页：查看与编辑单条采集者档案
 */
export function CollectorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { current, loading, error, fetchOne, update, remove, clearCurrent } = useCollectorStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CollectorInput | null>(null);
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
        name: current.name,
        contact: current.contact,
        remark: current.remark,
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
    if (window.confirm(`确定删除「${current.name}」？`)) {
      await remove(current.id);
      navigate('/collectors');
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
        <Alert color="red">{error ?? '采集者不存在'}</Alert>
        <Anchor component={Link} to="/collectors" mt="md">
          返回列表
        </Anchor>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Anchor component={Link} to="/collectors" mb="lg" inline>
        <Group gap={4}>
          <IconArrowLeft size={16} />
          <span>返回列表</span>
        </Group>
      </Anchor>

      <Group justify="space-between" mb="lg">
        <Title order={2}>{current.name}</Title>
      </Group>

      <Paper withBorder p="lg" radius="md">
        {editing ? (
          <Stack gap="sm">
            <TextInput
              label="姓名"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
            />
            <TextInput
              label="联系方式"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.currentTarget.value })}
            />
            <Textarea
              label="备注"
              minRows={4}
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.currentTarget.value })}
            />
          </Stack>
        ) : (
          <Stack gap="md">
            <div>
              <Text size="sm" c="dimmed">
                联系方式
              </Text>
              <Text>{current.contact || '—'}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                备注
              </Text>
              <Text>{current.remark || '—'}</Text>
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
              disabled={!form.name.trim()}
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
