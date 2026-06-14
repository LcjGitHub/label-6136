import { useEffect, useState } from 'react';
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
  Textarea,
  Title,
} from '@mantine/core';
import { IconClock, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEraStore } from '../store/eraStore';
import { extractErrorMessage } from '../utils/error';
import type { EraInput } from '../types/era';

const emptyForm: EraInput = {
  name: '',
  description: '',
};

export function EraListPage() {
  const { eras, loading, error, fetchAll, create, update, remove } = useEraStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EraInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    document.title = '年代词典';
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
      setActionError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`确定删除年代「${name}」？`)) {
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
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconClock size={28} stroke={1.5} />
          <Title order={2}>年代词典</Title>
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
          新增年代
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
      ) : eras.length === 0 ? (
        <Paper withBorder p="xl" ta="center" radius="md">
          <Text c="dimmed">暂无年代</Text>
        </Paper>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={200}>年代名称</Table.Th>
              <Table.Th>简短说明</Table.Th>
              <Table.Th w={120}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {eras.map((item) => (
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
        title={editingId !== null ? '编辑年代' : '新增年代'}
        size="md"
      >
        <Stack gap="sm">
          <TextInput
            label="年代名称"
            required
            placeholder="如：1980年代"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          />
          <Textarea
            label="简短说明"
            minRows={3}
            placeholder="描述该年代的特点"
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
