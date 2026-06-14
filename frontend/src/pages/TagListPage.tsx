import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Button,
  Container,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconEdit, IconPlus, IconTags, IconTrash } from '@tabler/icons-react';
import { useTagStore } from '../store/tagStore';
import { extractErrorMessage } from '../utils/error';
import { TopNavLinks } from '../components/TopNavLinks';
import type { TagInput } from '../types/tag';

const emptyForm: TagInput = { name: '' };

/**
 * 标签列表页：展示全部标签，支持新增、编辑与删除
 */
export function TagListPage() {
  const { tags, loading, error, fetchAll, create, update, remove } = useTagStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TagInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    document.title = '标签管理';
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setActionError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: { id: number; name: string }) => {
    setEditingId(item.id);
    setForm({ name: item.name });
    setActionError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      if (editingId !== null) {
        await update(editingId, form);
      } else {
        await create(form);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      setActionError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`确定删除标签「${name}」？删除后关联的样本绑定也将解除。`)) {
      setActionError(null);
      try {
        await remove(id);
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err));
      }
    }
  };

  return (
    <Container size="lg" py="xl">
      <TopNavLinks links={['sample-list', 'collectors', 'key-types']} />

      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconTags size={28} stroke={1.5} />
          <Title order={2}>标签管理</Title>
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          新增标签
        </Button>
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {actionError && (
        <Alert color="red" mb="md" onClose={() => setActionError(null)} withCloseButton>
          {actionError}
        </Alert>
      )}

      {loading ? (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      ) : tags.length === 0 ? (
        <Paper withBorder p="xl" ta="center" radius="md">
          <Text c="dimmed">暂无标签</Text>
        </Paper>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={200}>标签名称</Table.Th>
              <Table.Th>创建时间</Table.Th>
              <Table.Th w={120}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tags.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text fw={500}>{item.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{item.created_at}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      variant="subtle"
                      aria-label="编辑"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      aria-label="删除"
                      onClick={() => handleDelete(item.id, item.name)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId !== null ? '编辑标签' : '新增标签'}
        size="md"
      >
        <Stack gap="sm">
          <TextInput
            label="标签名称"
            required
            placeholder="如：清脆、沉闷、机械感"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button loading={submitting} onClick={handleSubmit} disabled={!form.name.trim()}>
              保存
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
