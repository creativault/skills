# API 字段参考

## 交互协议

| 项目 | 说明 |
|------|------|
| 基础路径 | `https://{host}/openapi/v1/` |
| 传输协议 | HTTPS |
| 请求方法 | 所有接口统一 **POST** |
| 数据格式 | JSON (`Content-Type: application/json`) |
| 认证方式 | `X-API-Key` + `X-User-Identity` 请求头 |
| 字符编码 | UTF-8 |
| 时间格式 | ISO 8601（如 `2026-03-15T10:30:00Z`）|
| 分页参数 | `page`（从 1 开始）、`size`（默认 50）|

## 通用响应结构

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "request_id": "req_abc123",
    "page": 1,
    "size": 50,
    "total": 1200,
    "quota_remaining": -1
  }
}
```

## 接口列表

| 接口 | 路径 | 说明 |
|------|------|------|
| 搜索 TikTok 达人 | `/openapi/v1/creators/tiktok/search` | 多维度筛选 |
| 搜索 YouTube 达人 | `/openapi/v1/creators/youtube/search` | 多维度筛选 |
| 搜索 Instagram 达人 | `/openapi/v1/creators/instagram/search` | 多维度筛选 |
| 提交采集任务 | `/openapi/v1/collection/tasks/submit` | 链接/用户名批量采集 |
| 提交关键词采集 | `/openapi/v1/collection/tasks/keyword-submit` | 关键词搜索采集 |
| 查询任务状态 | `/openapi/v1/collection/tasks/status` | 查询采集进度 |
| 获取采集数据 | `/openapi/v1/collection/tasks/data` | 分页获取结果 |
| 获取文件下载链接 | `/openapi/v1/files/download-url` | 获取临时下载 URL |

## 采集任务类型

| task_type | 说明 | values 内容 | 最大数量 |
|-----------|------|-----------|---------|
| `LINK_BATCH` | 链接采集 | 达人主页链接列表 | 500 |
| `FILE_UPLOAD` | 用户名采集 | 达人用户名列表 | 500 |

## 任务状态

| status | 说明 |
|--------|------|
| `processing` | 处理中（采集中或数据入库中）|
| `completed` | 已完成 |
| `failed` | 失败 |
| `timeout` | 超时 |

## 支持的平台

| 平台 | 标识 | 搜索 | 链接采集 | 用户名采集 | 关键词采集 |
|------|------|------|---------|----------|----------|
| TikTok | `tiktok` | ✅ | ✅ | ✅ | ✅ |
| YouTube | `youtube` | ✅ | ✅ | ✅ | ✅ |
| Instagram | `instagram` | ✅ | ✅ | ✅ | ✅ |

## Webhook 回调

提交采集任务时可传入 `webhook_url`，任务完成后系统自动回调。

回调 Payload：

```json
{
  "event": "collection.completed",
  "task_id": "task_xxx",
  "task_type": "LINK_BATCH",
  "status": "completed",
  "total": 2,
  "completed": 2,
  "failed": 0,
  "timestamp": "2026-03-15T10:45:00Z"
}
```

回调签名：`X-Webhook-Signature` 头，HMAC-SHA256 算法。
重试策略：最多 3 次（10s → 30s → 90s）。
