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
在本机执行：
```bash
bash apps/web/deploy-ssh.sh root@119.29.70.127
```

脚本会自动：
- 检测 SSH 连通性
- 定位服务器上的应用目录（通过 PM2 或常见路径）
- 尝试 `git pull`，若失败则自动切换 `rsync` 同步代码
- 执行 `npm install && npm run build && pm2 restart`
- 输出健康检查结果

### 可选环境变量
- `KEY_PATH` - SSH 私钥路径（默认 `~/.ssh/id_ed25519`）
- `USE_RSYNC` - `auto|yes|no`（默认 auto，git 失败时自动用 rsync）

### 手动上线步骤（备用）
1. 拉取代码：`git pull`（或用 rsync）
2. 安装依赖与构建：`npm install && npm run build`
3. 重启服务：`pm2 restart ai-thoughts`
4. 验证：`curl -I http://localhost:3000`

### 环境变量（生产）
- `NEXT_PUBLIC_DATA_SOURCE=supabase`
- `NEXT_PUBLIC_SUPABASE_URL=<redacted>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<redacted>`

### 线上验证
- 访问站点首页，列表能正常读取。
- 提交一条新记录，列表即时出现。
- 点击 footer 的"反馈"按钮提交，Supabase 的 `feedback` 表新增一行。

## 实际上线记录（2026-01-31）

### 遇到的问题与解决方案

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 服务器 `git pull` 失败 | 国内访问 GitHub 受限 | 使用 `rsync` 从本地同步代码到服务器 |
| `npm install` 报错 | 服务器缺少 `g++` 编译工具（`better-sqlite3` 是原生模块） | `apt-get install -y g++ make` |
| SSH 免密登录未配置 | 服务器未安装本机公钥 | `ssh-copy-id -i ~/.ssh/id_ed25519.pub root@<ip>` |

### 最终执行流程
1. 本机公钥写入服务器（`sshpass + ssh-copy-id`）
2. `rsync` 同步本地代码到 `/root/ai-era-human-thoughts/`
3. 服务器安装 `g++`
4. `npm install && npm run build && pm2 restart ai-thoughts`
5. 健康检查：`curl localhost:3000` 返回 `200 OK`

## 风险与后续
- 当前 `feedback` 只开放 insert（收集阶段）；如要在网页后台查看，需要后续引入鉴权 + select 策略。
- 建议后续在服务器配置 GitHub SSH key 或镜像，避免每次都走 rsync。
