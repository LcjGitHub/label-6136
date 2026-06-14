import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Badge,
  Container,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconFileText, IconHistory, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import { useOperationLogStore } from '../store/operationLogStore';
import type { OperationType } from '../types/operationLog';

const OPERATION_TYPE_OPTIONS: { value: OperationType; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'create', label: '新增', color: 'green', icon: <IconPlus size={12} /> },
  { value: 'update', label: '修改', color: 'blue', icon: <IconRefresh size={12} /> },
  { value: 'delete', label: '删除', color: 'red', icon: <IconTrash size={12} /> },
];

const FILTER_OPTIONS = [
  { value: 'all', label: '全部类型' },
  ...OPERATION_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];

function getOperationTypeMeta(type: OperationType) {
  return OPERATION_TYPE_OPTIONS.find((o) => o.value === type) ?? OPERATION_TYPE_OPTIONS[0];
}

/**
 * 操作日志列表页：展示样本的新增、修改、删除操作记录
 */
export function OperationLogListPage() {
  const {
    logs,
    loading,
    error,
    page,
    pageSize,
    total,
    fetchAll,
    clearError,
  } = useOperationLogStore();

  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    document.title = '操作日志 - 收银机样本库';
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const operationType = filterType === 'all' ? undefined : (filterType as OperationType);
    fetchAll({ page: 1, pageSize, operationType });
  }, [filterType, fetchAll, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconHistory size={28} stroke={1.5} />
          <Title order={2}>操作日志</Title>
        </Group>
        <Select
          data={FILTER_OPTIONS}
          value={filterType}
          onChange={(v) => v && setFilterType(v)}
          w={160}
          allowDeselect={false}
        />
      </Group>

      {error && (
        <Alert color="red" mb="md" onClose={clearError} withCloseButton>
          {error}
        </Alert>
      )}

      {loading ? (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      ) : logs.length === 0 ? (
        <Stack align="center" py="xl" gap="md">
          <IconFileText size={48} opacity={0.3} />
          <Text c="dimmed">暂无操作日志</Text>
        </Stack>
      ) : (
        <>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={60}>ID</Table.Th>
                <Table.Th w={100}>操作类型</Table.Th>
                <Table.Th>样本编号 / 名称</Table.Th>
                <Table.Th>变更摘要</Table.Th>
                <Table.Th w={180}>操作时间</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {logs.map((log) => {
                const meta = getOperationTypeMeta(log.operation_type);
                return (
                  <Table.Tr key={log.id}>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        #{log.id}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={meta.color} variant="light" leftSection={meta.icon}>
                        {meta.label}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" align="center">
                        <Text size="sm" c="dimmed" fw={500}>
                          #{log.sample_id}
                        </Text>
                        {log.operation_type === 'delete' ? (
                          <Text fw={500} c="dimmed">
                            {log.sample_brand_model}
                          </Text>
                        ) : (
                          <Anchor component={Link} to={`/devices/${log.sample_id}`} fw={500}>
                            {log.sample_brand_model}
                          </Anchor>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={2}>
                        {log.change_summary || '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {log.created_at}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>

          <Group justify="space-between" mt="md" align="center">
            <Text size="sm" c="dimmed">
              共 {total} 条，每页 {pageSize} 条
            </Text>
            <Pagination
              value={page}
              onChange={(newPage) => {
                const operationType = filterType === 'all' ? undefined : (filterType as OperationType);
                fetchAll({ page: newPage, pageSize, operationType });
              }}
              total={totalPages}
              boundaries={1}
              siblings={1}
            />
          </Group>
        </>
      )}
    </Container>
  );
}
