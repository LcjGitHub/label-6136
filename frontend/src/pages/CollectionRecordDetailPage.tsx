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
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconTrash } from '@tabler/icons-react';
import { useCollectionRecordStore } from '../store/collectionRecordStore';
import { useDeviceStore } from '../store/deviceStore';
import { useCollectorStore } from '../store/collectorStore';
import { extractErrorMessage } from '../utils/error';
import { TopNavLinks } from '../components/TopNavLinks';
import type { CollectionRecordInput } from '../types/collectionRecord';

export function CollectionRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { current, loading, error, fetchOne, update, remove, clearCurrent } =
    useCollectionRecordStore();
  const { devices, fetchAll: fetchDevices } = useDeviceStore();
  const { collectors, fetchAll: fetchCollectors } = useCollectorStore();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CollectionRecordInput | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    document.title = '采集记录详情';
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchCollectors();
  }, [fetchDevices, fetchCollectors]);

  useEffect(() => {
    if (id) {
      fetchOne(Number(id));
    }
    return () => clearCurrent();
  }, [id, fetchOne, clearCurrent]);

  useEffect(() => {
    if (current) {
      setForm({
        sample_id: current.sample_id,
        collector_id: current.collector_id,
        collection_date: current.collection_date,
        site_note: current.site_note,
      });
    }
  }, [current]);

  const handleSave = async () => {
    if (!form || !id) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await update(Number(id), form);
      setEditing(false);
    } catch (err: unknown) {
      setActionError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (current) {
      setForm({
        sample_id: current.sample_id,
        collector_id: current.collector_id,
        collection_date: current.collection_date,
        site_note: current.site_note,
      });
    }
    setEditing(false);
    setActionError(null);
  };

  const handleDelete = async () => {
    if (!current) return;
    if (window.confirm('确定删除此采集记录？')) {
      setActionError(null);
      try {
        await remove(current.id);
        navigate('/collection-records');
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err));
      }
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
        <Alert color="red">{error ?? '采集记录不存在'}</Alert>
        <Anchor component={Link} to="/collection-records" mt="md">
          返回列表
        </Anchor>
      </Container>
    );
  }

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
    <Container size="md" py="xl">
      <Group justify="space-between" mb="lg">
        <Anchor component={Link} to="/collection-records" inline>
          <Group gap={4}>
            <IconArrowLeft size={16} />
            <span>返回列表</span>
          </Group>
        </Anchor>
        <Group gap="md">
          <TopNavLinks links={['sample-list', 'collectors', 'key-types', 'eras', 'tags', 'collection-records']} withWrapper={false} />
        </Group>
      </Group>

      {actionError && (
        <Alert color="red" mb="md" onClose={() => setActionError(null)} withCloseButton>
          {actionError}
        </Alert>
      )}

      <Group justify="space-between" mb="lg">
        <Title order={2}>采集记录 #{current.id}</Title>
      </Group>

      <Paper withBorder p="lg" radius="md">
        {editing ? (
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
              minRows={4}
              value={form.site_note}
              onChange={(e) => setForm({ ...form, site_note: e.currentTarget.value })}
            />
          </Stack>
        ) : (
          <Stack gap="md">
            <div>
              <Text size="sm" c="dimmed">
                关联样本
              </Text>
              <Text>
                {current.sample ? `#${current.sample.id} ${current.sample.brand_model}` : '—'}
              </Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                关联采集者
              </Text>
              <Text>
                {current.collector ? `#${current.collector.id} ${current.collector.name}` : '—'}
              </Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                采集日期
              </Text>
              <Text>{current.collection_date}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                现场备注
              </Text>
              <Text>{current.site_note || '—'}</Text>
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
              disabled={!isFormValid}
            >
              保存
            </Button>
            <Button variant="default" onClick={handleCancel}>
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
