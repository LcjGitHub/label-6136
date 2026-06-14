import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Badge,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowLeft, IconExchange, IconStar, IconStarFilled } from '@tabler/icons-react';
import { useDeviceStore } from '../store/deviceStore';
import { compareDevices } from '../api/devices';
import { extractErrorMessage } from '../utils/error';
import { TopNavLinks } from '../components/TopNavLinks';
import type { Device } from '../types/device';

const DIFF_HIGHLIGHT_STYLE = {
  backgroundColor: 'rgba(255, 213, 79, 0.25)',
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(255, 152, 0, 0.4)',
};

interface CompareFields {
  brand_model: string;
  era: string;
  key_type: string;
  sound_description: string;
  sound_rating: number | null;
  location: string;
}

const fieldLabels: Record<keyof CompareFields, string> = {
  brand_model: '品牌型号',
  era: '年代',
  key_type: '按键类型',
  sound_description: '声音描述',
  sound_rating: '音质评分',
  location: '获取地点',
};

function DeviceCard({
  device,
  otherDevice,
  title,
  color,
}: {
  device: Device;
  otherDevice: Device;
  title: string;
  color: 'blue' | 'violet';
}) {
  const fields: (keyof CompareFields)[] = ['brand_model', 'era', 'key_type', 'sound_description', 'sound_rating', 'location'];

  return (
    <Paper withBorder p="lg" radius="md" h="100%">
      <Group justify="space-between" mb="md">
        <Title order={4} c={color}>
          {title}
        </Title>
        <Badge size="sm" variant="light" color={color}>
          #{device.id}
        </Badge>
      </Group>
      <Stack gap="md">
        {fields.map((field) => {
          const isDiff = device[field] !== otherDevice[field];
          const valueStyle = isDiff ? DIFF_HIGHLIGHT_STYLE : undefined;

          return (
            <div key={field}>
              <Text size="sm" c="dimmed" mb={4}>
                {fieldLabels[field]}
                {isDiff && <Text span size="xs" c="orange" fw={500} ml={6}>（值不同）</Text>}
              </Text>
              {field === 'era' ? (
                <div style={valueStyle}>
                  <Badge variant="light" size="lg">
                    {device[field]}
                  </Badge>
                </div>
              ) : field === 'sound_description' ? (
                <Text style={{ whiteSpace: 'pre-wrap', ...valueStyle }}>{device[field]}</Text>
              ) : field === 'sound_rating' ? (
                <div style={valueStyle}>
                  <Group gap={2}>
                    {[1, 2, 3, 4, 5].map((value) =>
                      device.sound_rating && device.sound_rating >= value ? (
                        <IconStarFilled key={value} size={16} color="#fbbf24" fill="#fbbf24" />
                      ) : (
                        <IconStar key={value} size={16} color="#d1d5db" />
                      )
                    )}
                    {device.sound_rating ? (
                      <Text size="sm" c="dimmed" ml={4}>
                        {device.sound_rating} 分
                      </Text>
                    ) : (
                      <Text size="sm" c="dimmed">
                        暂无评分
                      </Text>
                    )}
                  </Group>
                </div>
              ) : (
                <Text style={valueStyle}>{device[field]}</Text>
              )}
            </div>
          );
        })}
      </Stack>
    </Paper>
  );
}

/**
 * 样本对比页：并排对比两个样本的详细信息
 */
export function DeviceComparePage() {
  const { devices, fetchAll } = useDeviceStore();
  const [id1, setId1] = useState<string | null>(null);
  const [id2, setId2] = useState<string | null>(null);
  const [device1, setDevice1] = useState<Device | null>(null);
  const [device2, setDevice2] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = '样本对比';
  }, []);

  useEffect(() => {
    fetchAll('', 1, 1000);
  }, [fetchAll]);

  const options = devices.map((d) => ({
    value: String(d.id),
    label: `#${d.id} · ${d.brand_model}`,
  }));

  const options1 = options.filter((o) => o.value !== id2);
  const options2 = options.filter((o) => o.value !== id1);

  const handleCompare = async () => {
    if (!id1 || !id2) return;
    setLoading(true);
    setError(null);
    setDevice1(null);
    setDevice2(null);
    try {
      const result = await compareDevices(Number(id1), Number(id2));
      setDevice1(result.device1);
      setDevice2(result.device2);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id1 && id2) {
      handleCompare();
    } else {
      setDevice1(null);
      setDevice2(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id1, id2]);

  return (
    <Container size="xl" py="xl">
      <TopNavLinks links={['key-types', 'eras', 'tags', 'collectors', 'collection-records']} />

      <Anchor component={Link} to="/" mb="lg" inline>
        <Group gap={4}>
          <IconArrowLeft size={16} />
          <span>返回列表</span>
        </Group>
      </Anchor>

      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconExchange size={28} stroke={1.5} />
          <Title order={2}>样本对比</Title>
        </Group>
      </Group>

      <Paper withBorder p="lg" radius="md" mb="lg">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Select
            label="选择样本 A"
            placeholder="请选择第一个样本"
            data={options1}
            value={id1}
            onChange={setId1}
            clearable
            searchable
          />
          <Select
            label="选择样本 B"
            placeholder="请选择第二个样本"
            data={options2}
            value={id2}
            onChange={setId2}
            clearable
            searchable
          />
        </SimpleGrid>
        {(!id1 || !id2) && (
          <Text size="sm" c="dimmed" mt="md">
            请选择两个不同的样本进行对比
          </Text>
        )}
      </Paper>

      {error && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      {loading && (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      )}

      {!loading && device1 && device2 && (
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DeviceCard device={device1} otherDevice={device2} title="样本 A" color="blue" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DeviceCard device={device2} otherDevice={device1} title="样本 B" color="violet" />
          </Grid.Col>
        </Grid>
      )}
    </Container>
  );
}
