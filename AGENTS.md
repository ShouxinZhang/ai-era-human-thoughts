# Repo Agent Instructions

- Code should follow modular design principles as much as possible; different modules should avoid interfering with each other. Any experimental feature should place all its files within a single sub-module and must not generate junk files in larger modules.
- Before building new code, review existing code to reduce redundancy.
- Any new change should remain as simple as possible. Do not add extra branches or unauthorized feature planning.
- Business outcomes come first in any implementation. The top priority is delivering the required functionality, followed by long-term architecture planning, and then keeping the module style concise and efficient.
- Any new code is strictly forbidden from being stored in high-level modules (e.g., the repository root or other high-level module directories). It must be placed in a leaf module directory based on actual usage.
- docs/architecture/repository-structure.md is the repository architecture file. Before each code change, you must review this file to ensure the change follows the repository architecture. After modifications, update this file immediately to keep it consistent with the repository.

When explaining code to the user, always describe it from a business perspective. Even if the user is a developer, treat them as a management leader who only wants to know what the code can do for the business, its advantages, and its disadvantages.

Before performing any code changes, you must align your idea with the user. Only start work after the user confirms the idea is feasible.

Before any file deletion or rollback, you must create a backup.

正面提示词（规范操作，非常鼓励的行为):

- 前端代码写完后, 自行check lint以及npm run dev，查看是否有报错, 如果有错误，就自行修改, 直到没有错误为止
- dev_logs中存放每一次开发的日志, 需要详细记录修改了哪些文件, 做了什么. 每次修改完都应该更新dev_logs. dev_logs文档最好是可以类似于数据库的特性那样，可以随时回滚快照

负面提示词（严厉禁止的行为):

- 写完代码不作任何检查, 也不自主运行测试, 很多报错和bug
- 开发完成不在dev_logs里写日志，造成开发记忆丢失, 后期维护困难
