import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Anchor,
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
  Textarea,
  Title,
} from '@mantine/core';
import { IconEdit, IconPlus, IconTag, IconTrash } from '@tabler/icons-react';
import { useKeyTypeStore } from '../store/keyTypeStore';
import type { KeyTypeInput } from '../types/keyType';

const emptyForm: KeyTypeInput = {
  name: '',
  description: '',
};

export function KeyTypeListPage() {
  const { keyTypes, loading, error, fetchAll, create, update, remove } = useKeyTypeStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<KeyTypeInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    document.title = '按键类型词典';
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

  const handleOpenEdit = (item: { id: number; name: string; description: string }) => {
    setEditingId(item.id);
    setForm({ name: item.name, description: item.description });
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
      const msg = err instanceof Error ? err.message : '操作失败，请稍后重试';
      setActionError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`确定删除按键类型「${name}」？`)) {
      setActionError(null);
      try {
        await remove(id);
      } catch {
        setActionError('删除失败，请稍后重试');
      }
    }
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="flex-end" mb="md">
        <Anchor component={Link} to="/" inline c="dimmed">
          样本列表
        </Anchor>
        <Anchor component={Link} to="/collectors" inline c="dimmed">
          采集者档案
        </Anchor>
      </Group>

      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconTag size={28} stroke={1.5} />
          <Title order={2}>按键类型词典</Title>
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          新增类型
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
      ) : keyTypes.length === 0 ? (
        <Paper withBorder p="xl" ta="center" radius="md">
          <Text c="dimmed">暂无按键类型</Text>
        </Paper>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={200}>类型名称</Table.Th>
              <Table.Th>简短说明</Table.Th>
              <Table.Th w={120}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {keyTypes.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text fw={500}>{item.name}</Text>
                </Table.Td>
                <Table.Td>{item.description || <Text c="dimmed">—</Text>}</Table.Td>
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
        title={editingId !== null ? '编辑按键类型' : '新增按键类型'}
        size="md"
      >
        <Stack gap="sm">
          <TextInput
            label="类型名称"
            required
            placeholder="如：机械杠杆键"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          />
          <Textarea
            label="简短说明"
            minRows={3}
            placeholder="描述该按键类型的特点"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.currentTarget.value })}
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
