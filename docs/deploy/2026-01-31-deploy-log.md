# Deployment Log (2026-01-31)

本次上线目标：把当前主站功能（Entry + Feedback）上线，并确保 Supabase 端 schema 与线上代码一致。

## 业务变更摘要
- 新增 Entry 的扩展字段：年龄/职业/城市（可选）。
- 新增 Feedback 反馈入口：用户在网页内提交，服务端写入反馈数据库。

## 云端数据库（Supabase）
### 目标
- `public.entries`：存储问题/思考内容。
- `public.feedback`：存储用户反馈，便于后续统一处理。

### 执行方式
- 使用 Supabase 工具/迁移在云端创建：
  - `public.entries` + RLS（select/insert）
  - `public.feedback` + RLS（insert）

### 验证
- 在 Supabase 控制台确认存在表：`entries`、`feedback`。
- 使用网页提交一条 Entry 与一条 Feedback，确认表内新增记录。

## 线上服务（Tencent Lighthouse / PM2）
### 一键上线（推荐）
- 在本机执行：
  - `bash apps/web/deploy-ssh.sh root@<server-ip>`
- 脚本会自动通过 PM2 定位应用目录并执行 `apps/web/restart.sh`。

### 1) 拉取代码
- `git pull`

### 2) 安装依赖与构建
- `cd apps/web`
- `npm install`
- `npm run build`

### 3) 配置环境变量（生产）
- `NEXT_PUBLIC_DATA_SOURCE=supabase`
- `NEXT_PUBLIC_SUPABASE_URL=<redacted>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<redacted>`

### 4) 重启服务
- 推荐使用现有脚本：`bash apps/web/restart.sh`
- 或手动：`pm2 restart ai-thoughts`

### 5) 线上验证
- 访问站点首页，列表能正常读取。
- 提交一条新记录，列表即时出现。
- 点击 footer 的“反馈”按钮提交，Supabase 的 `feedback` 表新增一行。

## 风险与后续
- 当前 `feedback` 只开放 insert（收集阶段）；如要在网页后台查看，需要后续引入鉴权 + select 策略。
