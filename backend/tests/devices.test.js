const request = require('supertest');
const { setupTestApp, teardownTestDb } = require('./setup');
const {
  validDevice1,
  validDevice2,
  validDevice3,
  validDevice4,
  deviceWithMissingBrand,
  deviceWithInvalidRating,
} = require('./fixtures/devices');

describe('设备（样本）接口测试', () => {
  let app;

  beforeEach(async () => {
    app = await setupTestApp();
  });

  afterEach(() => {
    teardownTestDb();
  });

  describe('POST /api/devices - 新增样本', () => {
    test('新增校验必填字段 - 缺少品牌型号时返回 400 错误', async () => {
      const res = await request(app).post('/api/devices').send(deviceWithMissingBrand);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('所有字段均为必填');
    });

    test('新增校验必填字段 - 缺少年代时返回 400 错误', async () => {
      const { era, ...rest } = validDevice1;
      const res = await request(app).post('/api/devices').send(rest);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('所有字段均为必填');
    });

    test('新增校验必填字段 - 缺少按键类型时返回 400 错误', async () => {
      const { key_type, ...rest } = validDevice1;
      const res = await request(app).post('/api/devices').send(rest);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('所有字段均为必填');
    });

    test('新增校验必填字段 - 缺少声音描述时返回 400 错误', async () => {
      const { sound_description, ...rest } = validDevice1;
      const res = await request(app).post('/api/devices').send(rest);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('所有字段均为必填');
    });

    test('新增校验必填字段 - 缺少地点时返回 400 错误', async () => {
      const { location, ...rest } = validDevice1;
      const res = await request(app).post('/api/devices').send(rest);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('所有字段均为必填');
    });

    test('新增校验音质评分 - 评分超出 1-5 范围时返回 400 错误', async () => {
      const res = await request(app).post('/api/devices').send(deviceWithInvalidRating);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('音质评分必须是 1-5 的整数');
    });

    test('新增成功 - 完整数据返回 201 和创建的样本', async () => {
      const res = await request(app).post('/api/devices').send(validDevice1);
      expect(res.statusCode).toBe(201);
      expect(res.body.brand_model).toBe(validDevice1.brand_model);
      expect(res.body.era).toBe(validDevice1.era);
      expect(res.body.key_type).toBe(validDevice1.key_type);
      expect(res.body.sound_description).toBe(validDevice1.sound_description);
      expect(res.body.location).toBe(validDevice1.location);
      expect(res.body.sound_rating).toBe(validDevice1.sound_rating);
      expect(res.body.id).toBeDefined();
    });

    test('新增成功 - sound_rating 为 null 时正确保存', async () => {
      const res = await request(app).post('/api/devices').send(validDevice4);
      expect(res.statusCode).toBe(201);
      expect(res.body.sound_rating).toBeNull();
    });
  });

  describe('GET /api/devices - 列表查询', () => {
    beforeEach(async () => {
      await request(app).post('/api/devices').send(validDevice1);
      await request(app).post('/api/devices').send(validDevice2);
      await request(app).post('/api/devices').send(validDevice3);
      await request(app).post('/api/devices').send(validDevice4);
    });

    test('列表分页查询 - 不传分页参数时返回全部数据', async () => {
      const res = await request(app).get('/api/devices');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(4);
      expect(res.body.total).toBe(4);
      expect(res.body.page).toBe(1);
      expect(res.body.pageSize).toBe(4);
    });

    test('列表分页查询 - page=1, pageSize=2 返回第 1 页 2 条数据', async () => {
      const res = await request(app).get('/api/devices?page=1&pageSize=2');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.total).toBe(4);
      expect(res.body.page).toBe(1);
      expect(res.body.pageSize).toBe(2);
      expect(res.body.data[0].brand_model).toBe(validDevice1.brand_model);
      expect(res.body.data[1].brand_model).toBe(validDevice2.brand_model);
    });

    test('列表分页查询 - page=2, pageSize=2 返回第 2 页 2 条数据', async () => {
      const res = await request(app).get('/api/devices?page=2&pageSize=2');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.total).toBe(4);
      expect(res.body.page).toBe(2);
      expect(res.body.pageSize).toBe(2);
      expect(res.body.data[0].brand_model).toBe(validDevice3.brand_model);
      expect(res.body.data[1].brand_model).toBe(validDevice4.brand_model);
    });

    test('列表分页查询 - pageSize 大于总数时返回全部', async () => {
      const res = await request(app).get('/api/devices?page=1&pageSize=100');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(4);
      expect(res.body.total).toBe(4);
    });

    test('列表分页查询 - 页码超出范围时返回空数组', async () => {
      const res = await request(app).get('/api/devices?page=100&pageSize=2');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(0);
      expect(res.body.total).toBe(4);
    });

    test('关键词搜索 - 按品牌型号模糊匹配', async () => {
      const res = await request(app).get('/api/devices?keyword=Olivetti');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].brand_model).toContain('Olivetti');
      expect(res.body.total).toBe(1);
    });

    test('关键词搜索 - 按地点模糊匹配', async () => {
      const res = await request(app).get('/api/devices?keyword=上海');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].location).toContain('上海');
    });

    test('关键词搜索 - 按声音描述模糊匹配', async () => {
      const res = await request(app).get('/api/devices?keyword=金属撞击');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].sound_description).toContain('金属撞击');
    });

    test('关键词搜索 - 搜索结果支持分页', async () => {
      const res = await request(app).get('/api/devices?keyword=声&page=1&pageSize=2');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.total).toBe(4);
    });

    test('关键词搜索 - 空关键词返回全部', async () => {
      const res = await request(app).get('/api/devices?keyword=');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(4);
    });
  });

  describe('GET /api/devices/statistics - 统计汇总', () => {
    test('统计汇总 - 空数据库时返回正确的零值统计', async () => {
      const res = await request(app).get('/api/devices/statistics');
      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.eraGroups).toEqual([]);
      expect(res.body.keyTypeGroups).toEqual([]);
    });

    test('统计汇总 - 有数据时返回正确的统计信息', async () => {
      await request(app).post('/api/devices').send(validDevice1);
      await request(app).post('/api/devices').send(validDevice2);
      await request(app).post('/api/devices').send(validDevice3);

      const res = await request(app).get('/api/devices/statistics');
      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(3);

      expect(res.body.eraGroups).toHaveLength(3);
      expect(res.body.eraGroups[0].count).toBe(1);

      expect(res.body.keyTypeGroups).toHaveLength(3);
      expect(res.body.keyTypeGroups[0].count).toBe(1);
    });

    test('统计汇总 - 同年代多设备时分组统计正确', async () => {
      await request(app).post('/api/devices').send(validDevice1);
      await request(app).post('/api/devices').send(validDevice2);
      await request(app).post('/api/devices').send({ ...validDevice3, era: '1970年代' });

      const res = await request(app).get('/api/devices/statistics');
      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(3);

      const era1970 = res.body.eraGroups.find(g => g.name === '1970年代');
      expect(era1970).toBeDefined();
      expect(era1970.count).toBe(2);
    });
  });

  describe('PUT /api/devices/:id - 更新样本', () => {
    test('更新不存在编号返回错误 - 404', async () => {
      const res = await request(app)
        .put('/api/devices/9999')
        .send({ ...validDevice1, brand_model: 'Updated Model' });
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('设备不存在');
    });

    test('更新成功 - 返回更新后的样本', async () => {
      const createRes = await request(app).post('/api/devices').send(validDevice1);
      const deviceId = createRes.body.id;

      const updateData = {
        ...validDevice1,
        brand_model: 'Updated Model Name',
        sound_rating: 4,
      };

      const res = await request(app).put(`/api/devices/${deviceId}`).send(updateData);
      expect(res.statusCode).toBe(200);
      expect(res.body.brand_model).toBe('Updated Model Name');
      expect(res.body.sound_rating).toBe(4);
    });

    test('更新时校验必填字段 - 缺失字段返回 400', async () => {
      const createRes = await request(app).post('/api/devices').send(validDevice1);
      const deviceId = createRes.body.id;

      const { brand_model, ...incompleteData } = validDevice1;
      const res = await request(app).put(`/api/devices/${deviceId}`).send(incompleteData);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('所有字段均为必填');
    });
  });

  describe('DELETE /api/devices/:id - 删除样本', () => {
    test('删除成功 - 返回 200 和成功消息', async () => {
      const createRes = await request(app).post('/api/devices').send(validDevice1);
      const deviceId = createRes.body.id;

      const res = await request(app).delete(`/api/devices/${deviceId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('已删除');

      const getRes = await request(app).get(`/api/devices/${deviceId}`);
      expect(getRes.statusCode).toBe(404);
    });

    test('删除不存在编号返回错误 - 404', async () => {
      const res = await request(app).delete('/api/devices/9999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('设备不存在');
    });
  });

  describe('GET /api/devices/compare - 对比两个样本', () => {
    let device1Id;
    let device2Id;

    beforeEach(async () => {
      const res1 = await request(app).post('/api/devices').send(validDevice1);
      const res2 = await request(app).post('/api/devices').send(validDevice2);
      device1Id = res1.body.id;
      device2Id = res2.body.id;
    });

    test('对比两个不同样本 - 返回两个样本的详细信息', async () => {
      const res = await request(app).get(`/api/devices/compare?id1=${device1Id}&id2=${device2Id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.device1).toBeDefined();
      expect(res.body.device2).toBeDefined();
      expect(res.body.device1.id).toBe(device1Id);
      expect(res.body.device2.id).toBe(device2Id);
      expect(res.body.device1.brand_model).toBe(validDevice1.brand_model);
      expect(res.body.device2.brand_model).toBe(validDevice2.brand_model);
      expect(res.body.device1.brand_model).not.toBe(res.body.device2.brand_model);
    });

    test('对比两个不同样本 - 缺失参数返回 400', async () => {
      const res = await request(app).get(`/api/devices/compare?id1=${device1Id}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('需提供两个样本编号 id1 和 id2');
    });

    test('对比两个不同样本 - 相同编号返回 400', async () => {
      const res = await request(app).get(`/api/devices/compare?id1=${device1Id}&id2=${device1Id}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('两个样本编号不能相同');
    });

    test('对比两个不同样本 - 第一个编号不存在返回 404', async () => {
      const res = await request(app).get(`/api/devices/compare?id1=9999&id2=${device2Id}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('样本编号 9999 不存在');
    });

    test('对比两个不同样本 - 第二个编号不存在返回 404', async () => {
      const res = await request(app).get(`/api/devices/compare?id1=${device1Id}&id2=9999`);
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('样本编号 9999 不存在');
    });

    test('对比两个不同样本 - 两个编号都不存在返回 404', async () => {
      const res = await request(app).get('/api/devices/compare?id1=9998&id2=9999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('两个样本编号（9998、9999）均不存在');
    });
  });

  describe('GET /api/devices/:id - 获取单个样本', () => {
    test('获取存在的样本 - 返回样本详情（含空标签数组）', async () => {
      const createRes = await request(app).post('/api/devices').send(validDevice1);
      const deviceId = createRes.body.id;

      const res = await request(app).get(`/api/devices/${deviceId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(deviceId);
      expect(res.body.brand_model).toBe(validDevice1.brand_model);
      expect(res.body.tags).toEqual([]);
    });

    test('获取不存在的样本 - 返回 404', async () => {
      const res = await request(app).get('/api/devices/9999');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('设备不存在');
    });
  });
});
