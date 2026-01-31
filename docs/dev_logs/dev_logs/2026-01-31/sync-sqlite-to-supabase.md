# Dev Log - Sync SQLite → Supabase (entries + feedback)

## 时间线（UTC+8, CST，精确到秒）
- 2026-01-31 09:59:38 CST：实现脚本支持把本地 SQLite 的 `entries` + `feedback` 同步到 Supabase。
- 2026-01-31 10:08:42 CST：补齐文档结构与时间戳规范（按日期目录、独立工作单文档）。

## 本次变更的业务价值
- 线上站点不再因为“云端表为空”看起来像没连数据库。
- 支持把离线采集/本地调试产生的数据（entries + feedback）集中汇总到云端，便于统一展示与后续运营处理。

## 变更内容
- 同步脚本升级：apps/web/scripts/sync-to-supabase.mjs
  - 新增同步表：`feedback`
  - 凭证策略：优先使用 `SUPABASE_SERVICE_ROLE_KEY`（可 upsert），否则降级使用 anon key 的安全模式（冲突跳过）
  - 新增本地 DB 文件存在性检查，避免误跑
- 工作文档补充：docs/work_logs/2026-01-31/sync-sqlite-to-supabase.md

## 安全注意事项
- `SUPABASE_SERVICE_ROLE_KEY` 是超级权限（绕过 RLS），只允许放在服务器/本机环境变量，不允许进入 git 历史。
- 如果任何 service-role key 曾经出现在聊天/截图/日志中，建议立即在 Supabase 控制台 Rotate。

## 下一步（执行同步）
- 在服务器或本机确保存在 `apps/web/.local/entries.db`
- 运行同步：
  - `cd apps/web && set -a && source .env.local && set +a && node scripts/sync-to-supabase.mjs`
- 线上验证：访问 `GET /api/entries` 与 `GET /api/feedback`（如有对应接口）确认数据可读。
