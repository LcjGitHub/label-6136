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

## 环境要求

- **Node.js** >= 18
- **npm** >= 9

## 安装

### 1. 克隆项目

```bash
git clone <仓库地址>
cd label-6136
```

### 2. 安装依赖

**方式 A — 项目根目录一键安装（推荐）：**

```bash
npm run install:all
```

该命令会同时安装根目录、`backend/` 和 `frontend/` 的所有依赖。

**方式 B — 分别进入子目录安装：**

```bash
cd backend && npm install && cd ../frontend && npm install && cd ..
```

### 3. 配置环境变量（可选）

```bash
cp .env.example .env
```

复制 `.env.example` 为 `.env`，按需修改端口号和代理地址。默认配置无需修改即可运行。

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 后端服务端口 | `8000` |
| `FRONTEND_DIST` | 前端构建产物目录（生产模式） | `frontend/dist` |
| `VITE_PORT` | 前端开发服务器端口 | `8101` |
| `VITE_API_TARGET` | API 代理目标地址 | `http://localhost:8000` |

## 开发

### 一键启动前后端开发服务（推荐）

```bash
npm run dev
```

使用 `concurrently` 同时启动后端（端口 8000）和前端（端口 8101）开发服务器，日志以颜色区分：

- **蓝色 `[backend]`** — 后端日志
- **绿色 `[frontend]`** — 前端日志

浏览器访问 **http://localhost:8101**。

### 分别启动

如果需要单独启动某个服务，可以开两个终端分别运行：

```bash
# 终端 1 — 后端
npm run dev:backend

# 终端 2 — 前端
npm run dev:frontend
```

或直接进入子目录：

```bash
# 终端 1
cd backend && npm run dev

# 终端 2
cd frontend && npm run dev
```

看到 `后端服务运行于 http://localhost:8000` 即表示后端启动成功。

若页面空白或提示「加载设备列表失败」，请先确认后端已在 8000 端口运行。

## 构建

### 前端生产构建

```bash
npm run build
```

构建产物输出到 `frontend/dist/`，包含经 TypeScript 编译和 Vite 优化后的静态资源。

## 部署

### 一键部署（构建 + 启动）

```bash
npm run deploy
```

该命令执行以下步骤：

1. 构建前端生产版本 → `frontend/dist/`
2. 启动后端服务，同时托管前端静态文件

生产模式下后端会自动检测 `frontend/dist/` 目录，若存在则：
- 提供前端静态文件服务
- SPA 路由回退（所有非 API 请求返回 `index.html`）

此时只需访问 **http://localhost:8000** 即可同时使用前后端。

### 自定义部署配置

可通过环境变量覆盖默认配置：

```bash
PORT=9000 FRONTEND_DIST=/var/www/cashregister npm run deploy
```

或在 `.env` 文件中配置后直接运行：

```bash
npm run deploy
```

## 脚本命令一览

| 命令 | 说明 |
|------|------|
| `npm run install:all` | 一键安装所有子目录依赖 |
| `npm run dev` | 同时启动前后端开发服务 |
| `npm run dev:backend` | 仅启动后端开发服务 |
| `npm run dev:frontend` | 仅启动前端开发服务 |
| `npm run build` | 构建前端生产版本 |
| `npm run deploy` | 构建前端并启动后端（生产模式） |
| `npm run backend` | 仅启动后端服务 |

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/devices` | 设备列表 |
| GET | `/api/devices/:id` | 设备详情 |
| POST | `/api/devices` | 新增 |
| PUT | `/api/devices/:id` | 更新 |
| DELETE | `/api/devices/:id` | 删除 |
| GET | `/api/health` | 健康检查 |

## 目录结构

```
├── .env.example        # 环境变量示例文件
├── package.json        # 根目录脚本与依赖（concurrently）
├── README.md
├── backend/            # Express API + SQLite
│   ├── package.json    # 后端依赖（含 dotenv）
│   ├── data/           # 数据库文件（自动生成）
│   └── src/
│       └── server.js   # 支持环境变量端口 + 生产模式静态文件服务
└── frontend/           # React 前端
    ├── package.json
    ├── vite.config.ts  # 支持环境变量端口与代理配置
    └── src/
```
