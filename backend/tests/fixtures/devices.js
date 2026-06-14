const validDevice1 = {
  brand_model: 'National Cash Register Class 52',
  era: '1920年代',
  key_type: '机械杠杆键',
  sound_description: '清脆金属撞击声，按键回弹有短促咔嗒',
  location: '上海旧货市场',
  sound_rating: 5,
};

const validDevice2 = {
  brand_model: 'Olivetti Summa 20',
  era: '1970年代',
  key_type: '电容薄膜键',
  sound_description: '低沉短促的噗声，无机械回弹',
  location: '米兰跳蚤市场',
  sound_rating: 3,
};

const validDevice3 = {
  brand_model: 'Sharp CS-2635',
  era: '1980年代',
  key_type: '橡胶穹顶键',
  sound_description: '闷响加轻微塑料碰撞声',
  location: '东京秋叶原中古店',
  sound_rating: 4,
};

const validDevice4 = {
  brand_model: 'Casio TE-2200',
  era: '1990年代',
  key_type: '静音薄膜键',
  sound_description: '极轻触感的短促哒声',
  location: '广州天河电脑城',
  sound_rating: null,
};

const deviceWithMissingBrand = {
  era: '1920年代',
  key_type: '机械杠杆键',
  sound_description: '测试描述',
  location: '测试地点',
  sound_rating: 5,
};

const deviceWithInvalidRating = {
  brand_model: 'Test Model',
  era: '1990年代',
  key_type: '测试类型',
  sound_description: '测试描述',
  location: '测试地点',
  sound_rating: 10,
};

module.exports = {
  validDevice1,
  validDevice2,
  validDevice3,
  validDevice4,
  deviceWithMissingBrand,
  deviceWithInvalidRating,
};
