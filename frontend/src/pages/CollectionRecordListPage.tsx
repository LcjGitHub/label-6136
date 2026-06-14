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
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { IconPlus, IconTrash, IconClipboardList } from '@tabler/icons-react';
import { useCollectionRecordStore } from '../store/collectionRecordStore';
import { useDeviceStore } from '../store/deviceStore';
import { useCollectorStore } from '../store/collectorStore';
import { extractErrorMessage } from '../utils/error';
import { TopNavLinks } from '../components/TopNavLinks';
import type { CollectionRecordInput } from '../types/collectionRecord';

const emptyForm: CollectionRecordInput = {
  sample_id: 0,
  collector_id: 0,
  collection_date: '',
  site_note: '',
};

export function CollectionRecordListPage() {
  const { collectionRecords, loading, error, fetchAll, create, remove } =
    useCollectionRecordStore();
  const { devices, fetchAll: fetchDevices } = useDeviceStore();
  const { collectors, fetchAll: fetchCollectors } = useCollectorStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CollectionRecordInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filterSampleId, setFilterSampleId] = useState<string | null>(null);
  const [filterCollectorId, setFilterCollectorId] = useState<string | null>(null);

  useEffect(() => {
    document.title = '采集记录';
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchCollectors();
  }, [fetchDevices, fetchCollectors]);

  useEffect(() => {
    const params: { sample_id?: number; collector_id?: number } = {};
    if (filterSampleId) {
      params.sample_id = Number(filterSampleId);
    }
    if (filterCollectorId) {
      params.collector_id = Number(filterCollectorId);
    }
    fetchAll(params);
  }, [fetchAll, filterSampleId, filterCollectorId]);

  const handleCreate = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await create(form);
      setForm(emptyForm);
      setModalOpen(false);
    } catch (err: unknown) {
      setActionError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定删除此采集记录？')) {
      setActionError(null);
      try {
        await remove(id);
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err));
      }
    }
  };

  const sampleOptions = devices.map((d) => ({
    value: String(d.id),
    label: `#${d.id} ${d.brand_model}`,
  }));

  const collectorOptions = collectors.map((c) => ({
    value: String(c.id),
    label: `#${c.id} ${c.name}`,
  }));

  const isFormValid = form.sample_id > 0 && form.collector_id > 0 && form.collection_date;

  return (
    <Container size="lg" py="xl">
      <TopNavLinks links={['sample-list', 'collectors', 'key-types', 'eras', 'tags', 'collection-records']} />

      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconClipboardList size={28} stroke={1.5} />
          <Title order={2}>采集记录</Title>
        </Group>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setModalOpen(true)}>
          新增采集记录
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

      <Paper withBorder p="md" mb="md" radius="md">
        <Group gap="md" align="flex-end">
          <Select
            label="按样本筛选"
            placeholder="全部样本"
            clearable
            data={sampleOptions}
            value={filterSampleId}
            onChange={setFilterSampleId}
            style={{ flex: 1 }}
          />
          <Select
            label="按采集者筛选"
            placeholder="全部采集者"
            clearable
            data={collectorOptions}
            value={filterCollectorId}
            onChange={setFilterCollectorId}
            style={{ flex: 1 }}
          />
        </Group>
      </Paper>

      {loading ? (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      ) : collectionRecords.length === 0 ? (
        <Paper withBorder p="xl" ta="center" radius="md">
          <Text c="dimmed">暂无采集记录</Text>
        </Paper>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={80}>编号</Table.Th>
              <Table.Th>关联样本</Table.Th>
              <Table.Th>关联采集者</Table.Th>
              <Table.Th>采集日期</Table.Th>
              <Table.Th>现场备注</Table.Th>
              <Table.Th w={80}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {collectionRecords.map((record) => (
              <Table.Tr key={record.id}>
                <Table.Td>#{record.id}</Table.Td>
                <Table.Td>
                  <Text component={Link} to={`/collection-records/${record.id}`} fw={500} c="blue">
                    {record.sample ? `#${record.sample.id} ${record.sample.brand_model}` : '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {record.collector ? `#${record.collector.id} ${record.collector.name}` : '—'}
                </Table.Td>
                <Table.Td>{record.collection_date}</Table.Td>
                <Table.Td>{record.site_note || <Text c="dimmed">—</Text>}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    aria-label="删除"
                    onClick={() => handleDelete(record.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="新增采集记录" size="md">
        <Stack gap="sm">
          <Select
            label="关联样本"
            required
            placeholder="请选择样本"
            data={sampleOptions}
            value={form.sample_id > 0 ? String(form.sample_id) : null}
            onChange={(val) => setForm({ ...form, sample_id: val ? Number(val) : 0 })}
          />
          <Select
            label="关联采集者"
            required
            placeholder="请选择采集者"
            data={collectorOptions}
            value={form.collector_id > 0 ? String(form.collector_id) : null}
            onChange={(val) => setForm({ ...form, collector_id: val ? Number(val) : 0 })}
          />
          <TextInput
            label="采集日期"
            required
            type="date"
            value={form.collection_date}
            onChange={(e) => setForm({ ...form, collection_date: e.currentTarget.value })}
          />
          <Textarea
            label="现场备注"
            minRows={3}
            value={form.site_note}
            onChange={(e) => setForm({ ...form, site_note: e.currentTarget.value })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button loading={submitting} onClick={handleCreate} disabled={!isFormValid}>
              保存
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
