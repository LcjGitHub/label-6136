import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  ActionIcon,
  Alert,
  Anchor,
  Autocomplete,
  Badge,
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
import {
  IconArrowLeft,
  IconCopy,
  IconDeviceFloppy,
  IconHistory,
  IconPlus,
  IconRefresh,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useDeviceStore } from '../store/deviceStore';
import { useKeyTypeStore } from '../store/keyTypeStore';
import { useEraStore } from '../store/eraStore';
import { useTagStore } from '../store/tagStore';
import { useOperationLogStore } from '../store/operationLogStore';
import * as tagApi from '../api/tags';
import { extractErrorMessage } from '../utils/error';
import type { DeviceInput } from '../types/device';
import type { Tag } from '../types/tag';
import type { OperationType } from '../types/operationLog';

/**
 * 设备详情页：查看与编辑单条样本，支持标签绑定与解除
 */
const OPERATION_TYPE_META: Record<OperationType, { label: string; color: string; icon: React.ReactNode }> = {
  create: { label: '新增', color: 'green', icon: <IconPlus size={12} /> },
  update: { label: '修改', color: 'blue', icon: <IconRefresh size={12} /> },
  delete: { label: '删除', color: 'red', icon: <IconTrash size={12} /> },
};

export function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { current, loading, error, fetchOne, create, update, remove, clearCurrent, updateTags } = useDeviceStore();
  const { keyTypes, fetchAll: fetchKeyTypes } = useKeyTypeStore();
  const { eras, fetchAll: fetchEras } = useEraStore();
  const { tags: allTags, fetchAll: fetchAllTags } = useTagStore();
  const {
    sampleLogs,
    sampleLogsLoading,
    sampleLogsError,
    fetchBySampleId,
    clearSampleLogs,
    clearSampleLogsError,
  } = useOperationLogStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<DeviceInput | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [deviceTags, setDeviceTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [tagActionError, setTagActionError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOne(Number(id));
      fetchBySampleId(Number(id));
    }
    fetchKeyTypes();
    fetchEras();
    fetchAllTags();
    return () => {
      clearCurrent();
      clearSampleLogs();
    };
  }, [id, fetchOne, fetchKeyTypes, fetchEras, fetchAllTags, clearCurrent, fetchBySampleId, clearSampleLogs]);

  useEffect(() => {
    if (current) {
      document.title = current.brand_model;
      setForm({
        brand_model: current.brand_model,
        era: current.era,
        key_type: current.key_type,
        sound_description: current.sound_description,
        location: current.location,
        sound_rating: current.sound_rating ?? null,
      });
      setDeviceTags(current.tags || []);
    }
  }, [current]);

  const handleSave = async () => {
    if (!form || !id) return;
    setSubmitting(true);
    try {
      await update(Number(id), form);
      setEditing(false);
      await fetchBySampleId(Number(id));
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

  const handleCopy = async () => {
    if (!current) return;
    setCopying(true);
    setCopyError(null);
    try {
      const suffix = '副本';
      const brandModel = current.brand_model.endsWith(suffix)
        ? current.brand_model
        : current.brand_model + ' ' + suffix;
      const created = await create({
        brand_model: brandModel,
        era: current.era,
        key_type: current.key_type,
        sound_description: current.sound_description,
        location: current.location,
        sound_rating: current.sound_rating ?? null,
      });
      navigate(`/devices/${created.id}`);
    } catch (err: unknown) {
      setCopyError(extractErrorMessage(err));
    } finally {
      setCopying(false);
    }
  };

  const keyTypeOptions = keyTypes.map((k) => k.name);
  const eraOptions = eras.map((e) => e.name);

  const availableTags = allTags.filter(
    (t) => !deviceTags.some((dt) => dt.id === t.id)
  );

  const tagSelectData = availableTags.map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  const handleBindTag = async () => {
    if (!id || !selectedTagId) return;
    setTagActionError(null);
    try {
      const updated = await tagApi.bindDeviceTag(Number(id), Number(selectedTagId));
      setDeviceTags(updated);
      updateTags(Number(id), updated);
      setSelectedTagId(null);
    } catch (err: unknown) {
      setTagActionError(extractErrorMessage(err));
    }
  };

  const handleUnbindTag = async (tagId: number) => {
    if (!id) return;
    setTagActionError(null);
    try {
      const updated = await tagApi.unbindDeviceTag(Number(id), tagId);
      setDeviceTags(updated);
      updateTags(Number(id), updated);
    } catch (err: unknown) {
      setTagActionError(extractErrorMessage(err));
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
      <Group justify="space-between" mb="lg">
        <Anchor component={Link} to="/" inline>
          <Group gap={4}>
            <IconArrowLeft size={16} />
            <span>返回列表</span>
          </Group>
        </Anchor>
      </Group>

      {copyError && (
        <Alert color="red" mb="lg" onClose={() => setCopyError(null)} withCloseButton>
          {copyError}
        </Alert>
      )}

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
            <Autocomplete
              label="年代"
              required
              placeholder="选择或输入年代"
              data={eraOptions}
              value={form.era}
              onChange={(value) => setForm({ ...form, era: value })}
            />
            <Autocomplete
              label="按键类型"
              required
              placeholder="选择或输入按键类型"
              data={keyTypeOptions}
              value={form.key_type}
              onChange={(value) => setForm({ ...form, key_type: value })}
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
            <div>
              <Text size="sm" fw={500} mb={6}>
                音质评分
              </Text>
              <Group gap={4}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <ActionIcon
                    key={value}
                    size="lg"
                    color={form.sound_rating && form.sound_rating >= value ? 'yellow' : 'gray'}
                    variant="subtle"
                    onClick={() =>
                      setForm({
                        ...form,
                        sound_rating: form.sound_rating === value ? null : value,
                      })
                    }
                    aria-label={`${value} 星`}
                  >
                    {form.sound_rating && form.sound_rating >= value ? (
                      <IconStarFilled size={20} />
                    ) : (
                      <IconStar size={20} />
                    )}
                  </ActionIcon>
                ))}
                {form.sound_rating && (
                  <Text size="sm" c="dimmed" ml="xs">
                    {form.sound_rating} 分
                  </Text>
                )}
              </Group>
            </div>
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
                音质评分
              </Text>
              <Group gap={2} mt={4}>
                {[1, 2, 3, 4, 5].map((value) =>
                  current.sound_rating && current.sound_rating >= value ? (
                    <IconStarFilled key={value} size={18} color="#fbbf24" fill="#fbbf24" />
                  ) : (
                    <IconStar key={value} size={18} color="#d1d5db" />
                  )
                )}
                {current.sound_rating ? (
                  <Text size="sm" c="dimmed" ml="xs">
                    {current.sound_rating} 分
                  </Text>
                ) : (
                  <Text size="sm" c="dimmed">
                    暂无评分
                  </Text>
                )}
              </Group>
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

      <Paper withBorder p="lg" radius="md" mt="lg">
        <Text fw={500} mb="sm">标签</Text>
        {tagActionError && (
          <Alert color="red" mb="sm" onClose={() => setTagActionError(null)} withCloseButton>
            {tagActionError}
          </Alert>
        )}
        <Group gap="xs" mb="sm">
          {deviceTags.length > 0 ? (
            deviceTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="light"
                color="grape"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="grape"
                    variant="transparent"
                    onClick={() => handleUnbindTag(tag.id)}
                    aria-label="移除标签"
                  >
                    <IconX size={10} />
                  </ActionIcon>
                }
              >
                {tag.name}
              </Badge>
            ))
          ) : (
            <Text size="sm" c="dimmed">暂无标签</Text>
          )}
        </Group>
        {availableTags.length > 0 && (
          <Group gap="xs">
            <Select
              placeholder="选择标签"
              data={tagSelectData}
              value={selectedTagId}
              onChange={setSelectedTagId}
              searchable
              clearable
              w={200}
            />
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              disabled={!selectedTagId}
              onClick={handleBindTag}
            >
              添加标签
            </Button>
          </Group>
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
              variant="light"
              leftSection={<IconCopy size={16} />}
              loading={copying}
              onClick={handleCopy}
            >
              复制
            </Button>
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

      <Paper withBorder radius="md" mt="xl">
        <Accordion variant="separated" chevronPosition="left">
          <Accordion.Item value="operation-history">
            <Accordion.Control>
              <Group gap="sm">
                <IconHistory size={18} />
                <Text fw={500}>操作历史</Text>
                <Badge size="sm" variant="light" color="gray">
                  {sampleLogs.length} 条记录
                </Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {sampleLogsError && (
                <Alert color="red" mb="md" onClose={clearSampleLogsError} withCloseButton>
                  {sampleLogsError}
                </Alert>
              )}
              {sampleLogsLoading ? (
                <Group justify="center" py="md">
                  <Loader size="sm" />
                </Group>
              ) : sampleLogs.length === 0 ? (
                <Text c="dimmed" ta="center" py="md" size="sm">
                  暂无操作记录
                </Text>
              ) : (
                <Stack gap="xs">
                  {sampleLogs.map((log) => {
                    const meta = OPERATION_TYPE_META[log.operation_type];
                    return (
                      <Paper
                        key={log.id}
                        withBorder
                        p="sm"
                        radius="sm"
                        bg={log.operation_type === 'delete' ? 'red.0' : undefined}
                      >
                        <Group justify="space-between" mb={4} align="flex-start">
                          <Group gap="xs">
                            <Badge color={meta.color} variant="light" leftSection={meta.icon}>
                              {meta.label}
                            </Badge>
                            <Text size="sm" c="dimmed">
                              编号 #{log.sample_id}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {log.created_at}
                          </Text>
                        </Group>
                        <Text size="sm" lineClamp={3}>
                          {log.change_summary || '无变更摘要'}
                        </Text>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Paper>
    </Container>
  );
}
