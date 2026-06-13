import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Anchor,
  Autocomplete,
  Badge,
  Button,
  Container,
  Group,
  Loader,
  Modal,
  Radio,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { IconDownload, IconExchange, IconPlus, IconTrash, IconUpload, IconVolume } from '@tabler/icons-react';
import { useDeviceStore } from '../store/deviceStore';
import { useKeyTypeStore } from '../store/keyTypeStore';
import type { Device, DeviceInput } from '../types/device';

const emptyForm: DeviceInput = {
  brand_model: '',
  era: '',
  key_type: '',
  sound_description: '',
  location: '',
};

function extractErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    err.response &&
    typeof err.response === 'object' &&
    'data' in err.response &&
    err.response.data &&
    typeof err.response.data === 'object' &&
    'error' in err.response.data &&
    typeof (err.response.data as { error: unknown }).error === 'string'
  ) {
    return (err.response.data as { error: string }).error;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return '操作失败，请稍后重试';
}

/**
 * 设备列表页：展示全部样本，支持新增、删除、导出备份与导入还原
 */
export function DeviceListPage() {
  const {
    devices,
    loading,
    exporting,
    restoring,
    error,
    actionSuccess,
    fetchAll,
    create,
    remove,
    exportData,
    restoreData,
    clearSuccess,
    clearError,
  } = useDeviceStore();
  const { keyTypes, fetchAll: fetchKeyTypes } = useKeyTypeStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<DeviceInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'overwrite' | 'append'>('overwrite');
  const [pendingRestoreData, setPendingRestoreData] = useState<DeviceInput[] | null>(null);
  const [restoreFileName, setRestoreFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAll();
    fetchKeyTypes();
  }, [fetchAll, fetchKeyTypes]);

  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => clearSuccess(), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, clearSuccess]);

  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

  const keyTypeOptions = keyTypes.map((k) => k.name);

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

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`确定删除「${name}」？`)) {
      setActionError(null);
      try {
        await remove(id);
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err));
      }
    }
  };

  const handleExport = async () => {
    setActionError(null);
    try {
      const result = await exportData();
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.download = `devices-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setActionError(extractErrorMessage(err));
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      let dataArray: Device[];
      if (Array.isArray(parsed)) {
        dataArray = parsed;
      } else if (Array.isArray(parsed.data)) {
        dataArray = parsed.data;
      } else {
        throw new Error('文件格式不正确，未找到数据数组');
      }

      const requiredFields: (keyof Device)[] = ['brand_model', 'era', 'key_type', 'sound_description', 'location'];
      for (let i = 0; i < dataArray.length; i++) {
        const item = dataArray[i];
        for (const field of requiredFields) {
          const value = item[field];
          if (!value || typeof value !== 'string' || !value.trim()) {
            throw new Error(`第 ${i + 1} 条数据的「${field}」为必填字段，不能为空`);
          }
        }
      }

      setPendingRestoreData(
        dataArray.map((item) => ({
          brand_model: item.brand_model,
          era: item.era,
          key_type: item.key_type,
          sound_description: item.sound_description,
          location: item.location,
        }))
      );
      setRestoreFileName(file.name);
      setRestoreModalOpen(true);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRestore = async () => {
    if (!pendingRestoreData) return;

    setActionError(null);
    try {
      await restoreData({
        data: pendingRestoreData,
        mode: restoreMode,
      });
      setRestoreModalOpen(false);
      setPendingRestoreData(null);
      setRestoreFileName('');
      fetchAll();
    } catch (err: unknown) {
      setActionError(extractErrorMessage(err));
    }
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="flex-end" mb="md">
        <Anchor component={Link} to="/key-types" inline c="dimmed">
          按键类型词典
        </Anchor>
        <Anchor component={Link} to="/collectors" inline c="dimmed">
          采集者档案
        </Anchor>
      </Group>

      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconVolume size={28} stroke={1.5} />
          <Title order={2}>老式收银机按键音样本库</Title>
        </Group>
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconExchange size={16} />}
            component={Link}
            to="/devices/compare"
          >
            样本对比
          </Button>
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            onClick={handleExport}
            loading={exporting}
          >
            导出备份
          </Button>
          <Button
            variant="light"
            leftSection={<IconUpload size={16} />}
            onClick={handleImportClick}
            loading={restoring}
          >
            导入还原
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setModalOpen(true)}>
            新增样本
          </Button>
        </Group>
      </Group>

      {actionSuccess && (
        <Alert color="green" mb="md" onClose={() => clearSuccess()} withCloseButton>
          {actionSuccess}
        </Alert>
      )}

      {actionError && (
        <Alert color="red" mb="md" onClose={() => setActionError(null)} withCloseButton>
          {actionError}
        </Alert>
      )}

      {error && (
        <Alert color="red" mb="md" onClose={() => clearError()} withCloseButton>
          {error}
        </Alert>
      )}

      {loading ? (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      ) : devices.length === 0 ? (
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
            <Table.Tr>
              <Table.Td colSpan={5} ta="center" py="xl">
                <Text c="dimmed">暂无样本数据</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

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

      <Modal
        opened={restoreModalOpen}
        onClose={() => {
          setRestoreModalOpen(false);
          setPendingRestoreData(null);
          setRestoreFileName('');
        }}
        title="导入还原"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm">
            已选择文件：<b>{restoreFileName}</b>
          </Text>
          <Text size="sm" c="dimmed">
            共 {pendingRestoreData?.length ?? 0} 条数据待还原
          </Text>

          <Radio.Group value={restoreMode} onChange={(v) => setRestoreMode(v as 'overwrite' | 'append')} label="还原模式">
            <Stack gap="sm" mt="xs">
              <Radio
                value="overwrite"
                label="清空后批量写入"
                description="删除现有全部数据后写入新数据，ID 重新从 1 开始"
              />
              <Radio
                value="append"
                label="追加写入"
                description="保留现有数据，在末尾追加新数据"
              />
            </Stack>
          </Radio.Group>

          {restoreMode === 'overwrite' && (
            <Alert color="yellow" title="注意">
              此操作将永久删除当前所有样本数据，不可恢复，请谨慎操作！
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => {
                setRestoreModalOpen(false);
                setPendingRestoreData(null);
                setRestoreFileName('');
              }}
            >
              取消
            </Button>
            <Button
              color={restoreMode === 'overwrite' ? 'red' : 'blue'}
              onClick={handleRestore}
              loading={restoring}
            >
              确认还原
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
