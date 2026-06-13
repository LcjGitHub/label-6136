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
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { IconPlus, IconTrash, IconUser } from '@tabler/icons-react';
import { useCollectorStore } from '../store/collectorStore';
import type { CollectorInput } from '../types/collector';

const emptyForm: CollectorInput = {
  name: '',
  contact: '',
  remark: '',
};

/**
 * 采集者列表页：展示全部采集者，支持新增与删除
 */
export function CollectorListPage() {
  const { collectors, loading, error, fetchAll, create, remove } = useCollectorStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CollectorInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await create(form);
      setForm(emptyForm);
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`确定删除「${name}」？`)) {
      await remove(id);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconUser size={28} stroke={1.5} />
          <Title order={2}>采集者档案</Title>
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setModalOpen(true)}>
          新增采集者
        </Button>
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {loading ? (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>姓名</Table.Th>
              <Table.Th>联系方式</Table.Th>
              <Table.Th>备注</Table.Th>
              <Table.Th w={80}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {collectors.map((collector) => (
              <Table.Tr key={collector.id}>
                <Table.Td>
                  <Text component={Link} to={`/collectors/${collector.id}`} fw={500} c="blue">
                    {collector.name}
                  </Text>
                </Table.Td>
                <Table.Td>{collector.contact || <Text c="dimmed">—</Text>}</Table.Td>
                <Table.Td>{collector.remark || <Text c="dimmed">—</Text>}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    aria-label="删除"
                    onClick={() => handleDelete(collector.id, collector.name)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="新增采集者" size="md">
        <Stack gap="sm">
          <TextInput
            label="姓名"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
          />
          <TextInput
            label="联系方式"
            placeholder="电话、邮箱等"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.currentTarget.value })}
          />
          <Textarea
            label="备注"
            minRows={3}
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.currentTarget.value })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button loading={submitting} onClick={handleCreate} disabled={!form.name.trim()}>
              保存
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
