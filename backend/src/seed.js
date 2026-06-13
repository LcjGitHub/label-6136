const db = require('./db');

/**
 * 初始化收银机按键音样本 seed 数据
 */
function seedDevices() {
  const count = db.get('SELECT COUNT(*) AS cnt FROM devices');
  if (count && count.cnt > 0) {
    return;
  }

  const samples = [
    {
      brand_model: 'National Cash Register Class 52',
      era: '1920年代',
      key_type: '机械杠杆键',
      sound_description: '清脆金属撞击声，按键回弹有短促咔嗒，合计键有连续机械联动声',
      location: '上海旧货市场',
    },
    {
      brand_model: 'Olivetti Summa 20',
      era: '1970年代',
      key_type: '电容薄膜键',
      sound_description: '低沉短促的噗声，无机械回弹，连打时节奏均匀',
      location: '米兰跳蚤市场',
    },
    {
      brand_model: 'Sharp CS-2635',
      era: '1980年代',
      key_type: '橡胶穹顶键',
      sound_description: '闷响加轻微塑料碰撞，数字键与功能键音调略有差异',
      location: '东京秋叶原中古店',
    },
    {
      brand_model: 'Casio TE-2200',
      era: '1990年代',
      key_type: '静音薄膜键',
      sound_description: '极轻触感的短促哒声，适合高频录入，几乎无回弹声',
      location: '广州天河电脑城',
    },
    {
      brand_model: 'IBM 4683 POS',
      era: '1980年代末',
      key_type: '重手感机械键',
      sound_description: '厚重咔哒声，键程长，释放时有明显金属簧片回位音',
      location: '北京潘家园古玩市场',
    },
  ];

  for (const row of samples) {
    db.run(
      `INSERT INTO devices (brand_model, era, key_type, sound_description, location)
       VALUES (?, ?, ?, ?, ?)`,
      [row.brand_model, row.era, row.key_type, row.sound_description, row.location]
    );
  }

  console.log(`已写入 ${samples.length} 条设备 seed 数据`);
}

/**
 * 初始化采集者 seed 数据
 */
function seedCollectors() {
  const count = db.get('SELECT COUNT(*) AS cnt FROM collectors');
  if (count && count.cnt > 0) {
    return;
  }

  const collectors = [
    {
      name: '张铭远',
      contact: '13800138001',
      remark: '专注于 1920-1950 年代美式收银机收藏，常驻上海',
    },
    {
      name: '李思琪',
      contact: 'siqi.li@example.com',
      remark: '欧洲老式办公设备爱好者，多次赴意大利、德国淘货',
    },
    {
      name: '王建国',
      contact: '',
      remark: '北京本地收藏家，主攻日式电子收银机',
    },
  ];

  for (const row of collectors) {
    db.run(
      `INSERT INTO collectors (name, contact, remark)
       VALUES (?, ?, ?)`,
      [row.name, row.contact, row.remark]
    );
  }

  console.log(`已写入 ${collectors.length} 条采集者 seed 数据`);
}

/**
 * 初始化按键类型词典 seed 数据
 */
function seedKeyTypes() {
  const count = db.get('SELECT COUNT(*) AS cnt FROM key_types');
  if (count && count.cnt > 0) {
    return;
  }

  const keyTypes = [
    {
      name: '机械杠杆键',
      description: '通过金属杠杆机构传动，手感鲜明，声音清脆有金属质感',
    },
    {
      name: '薄膜键',
      description: '采用薄膜开关结构，按键轻盈，声音低沉短促',
    },
    {
      name: '橡胶穹顶键',
      description: '橡胶穹顶结构提供回弹，触感偏软，声音闷响',
    },
  ];

  for (const row of keyTypes) {
    db.run(
      `INSERT INTO key_types (name, description)
       VALUES (?, ?)`,
      [row.name, row.description]
    );
  }

  console.log(`已写入 ${keyTypes.length} 条按键类型 seed 数据`);
}

/**
 * 执行全部 seed 初始化
 */
function seed() {
  seedDevices();
  seedCollectors();
  seedKeyTypes();
}

module.exports = { seed };
