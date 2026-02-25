---
name: feishu-project-cv
description: |
  查询和管理 Creativault (CV) 飞书项目的需求、缺陷和任务。通过 MOQL 查询工作项、查看详情、创建和更新工作项。当用户提到 cv、creativault、creativault.ai，或需要查询飞书项目中的需求状态、优先级、业务线、排期等信息时使用此 Skill。
metadata:
  author: creativault
  version: "1.0"
---

# Creativault 飞书项目 Skill

## 项目信息

- **项目 Key**: `697b384fd5eaf3ca7de6ff5c`
- **项目别名**: cv、creativault、creativault.ai
- **工作项类型**: 需求(story)、缺陷(issue)、任务(task)、史诗级需求管理、迭代、版本等

## 标准查询流程

1. 获取工作项字段信息 — 使用 `mcp_feishu_project_get_workitem_info`，传入 `work_item_type="需求"`，`project_key="697b384fd5eaf3ca7de6ff5c"`
2. 查询工作项列表 — 使用 `mcp_feishu_project_search_by_mql`，传入 `project_key="697b384fd5eaf3ca7de6ff5c"` 和 MOQL 语句
3. 获取工作项详情 — 使用 `mcp_feishu_project_get_workitem_brief`，传入 `work_item_id="<ID>"`

## MOQL 查询规范

基本语法：

```sql
SELECT `字段1`, `字段2` FROM `project_key`.`工作项类型` WHERE `条件` LIMIT N
```

常用查询示例：

```sql
-- 查询所有需求
SELECT `项目`, `需求名称`, `优先级`, `状态`, `工作项id` FROM `697b384fd5eaf3ca7de6ff5c`.`需求` LIMIT 50

-- 按优先级查询
SELECT `项目`, `需求名称`, `状态`, `工作项id` FROM `697b384fd5eaf3ca7de6ff5c`.`需求` WHERE `优先级` = 'P0' LIMIT 20

-- 按状态查询
SELECT `项目`, `需求名称`, `优先级`, `工作项id` FROM `697b384fd5eaf3ca7de6ff5c`.`需求` WHERE `状态` = '进行中' LIMIT 20

-- 模糊搜索
SELECT `项目`, `需求名称`, `优先级`, `状态`, `工作项id` FROM `697b384fd5eaf3ca7de6ff5c`.`需求` WHERE `需求名称` LIKE '%关键词%' LIMIT 10

-- 按业务线查询
SELECT `项目`, `需求名称`, `优先级`, `状态` FROM `697b384fd5eaf3ca7de6ff5c`.`需求` WHERE `业务线` = 'Products' LIMIT 20
```

## 错误处理

当 `search_by_mql` 报错时：
1. 确认 project_key 为 `697b384fd5eaf3ca7de6ff5c`
2. 确认字段名使用了反引号
3. 确认工作项类型存在（需求、缺陷、任务等）
4. 先调用 `get_workitem_info` 确认字段是否存在

## 注意事项

- 时间字段使用 16 位 Unix 毫秒时间戳
- 人员字段使用 user_key，多个用英文逗号分隔
- 默认最多返回 50 条，可通过 LIMIT 调整
- 当用户说 "cv"、"creativault"、"creativault.ai" 时，都指本项目

## 参考文档

- [字段、状态、角色完整参考](references/field-reference.md) — 字段对照表、状态列表、优先级、业务线、角色信息
- [MCP Server 配置](references/mcp-config.md) — 飞书项目 MCP Server 连接配置、工具列表、MQL 语法详解
