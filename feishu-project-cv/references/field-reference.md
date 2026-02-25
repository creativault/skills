# Creativault 飞书项目字段参考

## 关键字段对照表（需求类型）

| 字段 Key | 字段名称 | 类型 | 常用查询值 |
|---------|---------|------|-----------|
| `work_item_id` | 工作项id | number | 唯一标识 |
| `name` | 项目 | string | 工作项标题 |
| `field_ae6a1a` | 需求名称 | text | 详细需求描述 |
| `priority` | 优先级 | select | P0, P1, P2, P3, P4, P5, 待定 |
| `work_item_status` | 状态 | select | 待技术评审, 开始, 进行中, 待验收, 已结束, 已上线, 已终止, pending |
| `current_status_operator` | 当前负责人 | multi-user | 负责人信息 |
| `owner` | 创建者 | user | 创建人 |
| `business` | 业务线 | select | Ads, Products, Influencer, Market Insight, PowerData |
| `schedule` | 排期 | schedule | 开始时间/结束时间 |
| `start_time` | 提出时间 | date | 创建日期 |
| `finish_time` | 完成日期 | date | 完成日期 |
| `template` | 需求类型 | select | 体验优化, 迭代需求 |

## 状态完整列表

```
已终止, 进行中, 待线内初评, 待技术评审, 已上车, 待UI设计, 待估分, 待设计, 待技术初评,
反馈受理, 待评估, 待复议, 开发中, 待验收, 已发车, 待发起综合评审, 待综合评审, 待技术评审,
实验中, 开始, 测试中, 已结束, 评估中, 待技术定容, 已上线, 待设计评审, pending
```

## 优先级完整列表

- P0 - 最高优先级
- P1 - 高优先级
- P2 - 中优先级
- P3 - 低优先级
- P4 - 较低优先级
- P5 - 最低优先级
- 待定 - 未确定

## 业务线选项

- Ads（广告）
- Products（产品）
- Influencer（达人）
- Market Insight（市场洞察）
- PowerData（数据）

## 角色信息

| role_id | 角色名称 |
|---------|---------|
| PD | 产品经理 |
| Tech_Owner | PO |
| PM | PMO |
| UI | UI |
| UX | UX |
| FE | FE |
| role_709dd2 | BE |
| QA | QA |
| role_bc1866 | 技术KP |
| role_d26d19 | 数据KP |
| role_a86ec9 | 数仓 |
| role_a5b23d | 爬虫 |
| role_3022d9 | 算法 |
| role_5f1263 | 产品运营 |
