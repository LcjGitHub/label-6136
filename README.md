# 老式收银机按键音样本库

记录与浏览老式收银机按键音样本的 MVP 应用：设备列表、详情查看，以及基础 CRUD。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + Mantine v7 · zustand · @tabler/icons-react · axios · 端口 **8101** |
| 后端 | Express + SQLite（`backend/data/cashregister.db`）· 端口 **8000** |

## 字段说明

- **品牌型号** — 收银机品牌与型号
- **年代** — 生产或使用年代
- **按键类型** — 机械键、薄膜键等
- **声音描述** — 按键音特征描述
- **获取地点** — 样本采集或购买地点

首次启动后端会自动写入 **5 条** seed 数据。

## 启动方式

依赖均在各自目录内安装，无需全局 pnpm/yarn。

> **注意**：必须在 `frontend/` 或项目根目录执行前端命令，不要在无 `package.json` 的其它路径运行。

### 首次安装（任选一种）

**方式 A — 项目根目录一键安装：**

```bash
npm run install:all
```

**方式 B — 分别进入子目录安装：**

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 1. 后端（端口 8000）

**根目录：**

```bash
npm run backend
```

**或进入 backend 目录：**

```bash
cd backend
npm start
```

看到 `后端服务运行于 http://localhost:8000` 即表示成功。

### 2. 前端（端口 8101）

新开一个终端。

**根目录（推荐）：**

```bash
npm run dev
```

**或进入 frontend 目录：**

```bash
cd frontend
npm run dev
```

浏览器访问 **http://localhost:8101**。

若页面空白或提示「加载设备列表失败」，请先确认后端已在 8000 端口运行。

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/devices` | 设备列表 |
| GET | `/api/devices/:id` | 设备详情 |
| POST | `/api/devices` | 新增 |
| PUT | `/api/devices/:id` | 更新 |
| DELETE | `/api/devices/:id` | 删除 |

## 目录结构

```
├── backend/          # Express API + SQLite
│   ├── data/         # 数据库文件（自动生成）
│   └── src/
├── frontend/         # React 前端
│   └── src/
└── README.md
```
