import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
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
import { IconPlus, IconTrash, IconVolume } from '@tabler/icons-react';
import { useDeviceStore } from '../store/deviceStore';
import type { DeviceInput } from '../types/device';

const emptyForm: DeviceInput = {
  brand_model: '',
  era: '',
  key_type: '',
  sound_description: '',
  location: '',
};

/**
 * 设备列表页：展示全部样本，支持新增与删除
 */
export function DeviceListPage() {
  const { devices, loading, error, fetchAll, create, remove } = useDeviceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<DeviceInput>(emptyForm);
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
      <Group justify="flex-end" mb="md">
        <Anchor component={Link} to="/collectors" inline c="dimmed">
          采集者档案
        </Anchor>
      </Group>

      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconVolume size={28} stroke={1.5} />
          <Title order={2}>老式收银机按键音样本库</Title>
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setModalOpen(true)}>
          新增样本
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
              <Table.Th>品牌型号</Table.Th>
              <Table.Th>年代</Table.Th>
              <Table.Th>按键类型</Table.Th>
              <Table.Th>获取地点</Table.Th>
              <Table.Th w={80}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {devices.map((device) => (
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
                <Table.Td>{device.location}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    aria-label="删除"
                    onClick={() => handleDelete(device.id, device.brand_model)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="新增按键音样本" size="md">
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
            placeholder="如：1980年代"
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
            minRows={3}
            value={form.sound_description}
            onChange={(e) => setForm({ ...form, sound_description: e.currentTarget.value })}
          />
          <TextInput
            label="获取地点"
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.currentTarget.value })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button loading={submitting} onClick={handleCreate}>
              保存
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
