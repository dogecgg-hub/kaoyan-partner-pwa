# 考研搭子监督 PWA

两个人固定使用的考研备考监督 Web/PWA。MVP 支持任务 CRUD、今日计划、周日程、每日打卡、学习证明预览、番茄钟、站内提醒、互相评价、搭档页和统计图表。

当前默认是 `localStorage mock` 模式；配置 Supabase 环境变量后，可逐步切换到 Supabase Auth、Database、Storage 和 Realtime。

## 本地运行

```bash
npm install
npm run dev
```

如果使用 pnpm：

```bash
pnpm install
pnpm dev
```

演示账号：

- `userA@example.com` / `password123`
- `userB@example.com` / `password123`

## 构建

```bash
npm run build
```

构建产物输出到 `dist/`。项目已验证同一个 build 脚本可以正常通过 TypeScript 检查和 Vite 构建。

## 环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

填写：

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

不要提交真实 `.env.local`。前端只能使用 Supabase anon key，不能把 service role key 或任何私密密钥放进代码或 Vercel 前端环境变量。

如果这两个变量为空，应用保持 `localStorage` mock 模式。

## Supabase 配置

1. 在 Supabase 创建项目。
2. 到 Project Settings -> API 复制：
   - Project URL -> `VITE_SUPABASE_URL`
   - anon public key -> `VITE_SUPABASE_ANON_KEY`
3. 在 Supabase SQL Editor 执行 [supabase/schema.sql](./supabase/schema.sql)。
4. 后续可把 `src/features/useAppStore.ts` 的本地写入逐步替换为 [src/services/supabaseService.ts](./src/services/supabaseService.ts)。

已创建的 Supabase 文件：

- [src/services/supabaseClient.ts](./src/services/supabaseClient.ts)：读取 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，不硬编码密钥。
- [src/services/supabaseService.ts](./src/services/supabaseService.ts)：Auth、任务、打卡、消息、评价、番茄钟的 service 层入口。
- [supabase/schema.sql](./supabase/schema.sql)：数据表、索引、RLS 初始策略和两位演示用户资料。

建议下一步表：

- `profiles`
- `tasks`
- `check_ins`
- `messages`
- `reviews`
- `pomodoro_sessions`

学习证明图片建议新建 Supabase Storage bucket：`proof-images`。

## Vercel 部署

代码仓库使用 GitHub：

1. 把项目推送到 GitHub。
2. 在 Vercel 选择 `New Project`，导入该 GitHub 仓库。
3. Vercel 配置：
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 在 Vercel Project Settings -> Environment Variables 添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 点击 Deploy。

项目已包含 [vercel.json](./vercel.json)：

- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- React Router 子路由刷新回退，避免 `/tasks`、`/partner` 等路径刷新 404
- PWA manifest 和 service worker 的响应头

## PWA 与 iPhone 添加到主屏幕

项目已配置：

- [public/manifest.json](./public/manifest.json)
- `theme-color`
- `viewport-fit=cover`
- `apple-mobile-web-app-capable`
- `apple-touch-icon`
- PNG icons: `public/icons/icon-180.png`、`icon-192.png`、`icon-512.png`
- [public/sw.js](./public/sw.js) 基础离线缓存和刷新回退

iPhone 使用方式：

1. 用 Safari 打开 Vercel 部署后的 HTTPS 地址。
2. 点击底部分享按钮。
3. 选择“添加到主屏幕”。
4. 从主屏幕打开。

第一次在线打开后，PWA 会缓存应用外壳和静态资源。当前 mock 模式下，任务、打卡等数据保存在手机 Safari 的 `localStorage` 中；两台手机之间不会自动同步。要双人实时同步，需要接入 Supabase Database/Realtime。

## 后续扩展

- Supabase Auth 真实邮箱注册、登录、找回密码
- Supabase Database 双人实时同步
- Supabase Storage 学习证明上传
- Realtime 消息提醒和搭档状态同步
- 真实推送通知
- 月计划、周计划、每日复盘
- AI 自动生成学习计划
- 错题本和知识点复盘
- 专注白名单和防拖延机制
