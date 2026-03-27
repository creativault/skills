## 目录

***

## 1. 交互协议

| 项目   | 说明                                                              |
| ---- | --------------------------------------------------------------- |
| 基础路径 | `https://{host}/openapi/v1/`                                    |
| 传输协议 | HTTPS                                                           |
| 请求方法 | 所有接口统一使用 **POST** 方法                                            |
| 数据格式 | JSON (`Content-Type: application/json`)                         |
| 认证方式 | API Key（通过 `X-API-Key` 请求头传递）+ 用户标识（通过 `X-User-Identity` 请求头传递） |
| 字符编码 | UTF-8                                                           |
| 时间格式 | ISO 8601（如 `2026-03-15T10:30:00Z`）                              |
| 分页参数 | `page`（页码，从 1 开始）、`size`（每页数量，默认 50）                            |
| 参数传递 | 所有参数通过 JSON Body 传递，禁止 Query 参数和路径参数                            |

***

## 2. 通用响应结构

所有接口统一返回以下 JSON 结构：

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

### 字段说明

| 字段                     | 类型                    | 说明             |
| ---------------------- | --------------------- | -------------- |
| `success`              | boolean               | 请求是否成功         |
| `data`                 | object / array / null | 业务数据，失败时为 null |
| `error`                | object / null         | 错误详情，成功时为 null |
| `error.code`           | integer               | 业务错误码（见错误码表）   |
| `error.message`        | string                | 可读错误信息         |
| `meta`                 | object                | 响应元数据          |
| `meta.request_id`      | string                | 请求唯一标识，用于问题排查  |
| `meta.page`            | integer / null        | 当前页码（分页接口）     |
| `meta.size`            | integer / null        | 每页数量（分页接口）     |
| `meta.total`           | integer / null        | 总记录数（分页接口）     |
| `meta.quota_remaining` | integer               | 剩余配额，-1 表示不限制  |

### 错误响应示例

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": 40101,
    "message": "API Key 无效"
  },
  "meta": {
    "request_id": "req_abc123",
    "page": null,
    "size": null,
    "total": null,
    "quota_remaining": -1
  }
}
```

***

## 3. 认证机制

### 3.1 API Key 认证

所有 API 请求必须在 HTTP Header 中携带有效的 API Key：

```plaintext
X-API-Key: your_api_key_here
```

### 3.2 用户标识（X-User-Identity）

所有 API 请求必须在 HTTP Header 中携带用户标识，值为操作人员的邮箱地址（原始值，无需加密或哈希）：

```plaintext
X-User-Identity: user@example.com
```

规则：

1. 邮箱会自动转为小写并去除首尾空格

2. 必须是合法的邮箱格式（包含 `@` 符号）

示例：

```bash
curl -X POST "https://{host}/openapi/v1/collection/tasks/submit" \
  -H "X-API-Key: your_api_key_here" \
  -H "X-User-Identity: user@example.com" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

### 3.3 认证失败场景

| 场景                  | HTTP 状态码 | 错误码   | 错误信息                      |
| ------------------- | -------- | ----- | ------------------------- |
| 未携带 X-API-Key       | 401      | 40101 | 缺少 X-API-Key Header       |
| Key 不存在             | 401      | 40101 | API Key 无效                |
| Key 已过期             | 401      | 40102 | API Key 已过期               |
| Key 已吊销             | 401      | 40103 | API Key 已吊销               |
| 未携带 X-User-Identity | 401      | 40104 | 缺少 X-User-Identity Header |

***

## 4. 速率限制

### 4.1 限流策略

* 算法：固定窗口计数器（按分钟桶）

* 粒度：按租户（tenant\_id）隔离

* 阈值：由租户套餐决定（默认 60 次/分钟）

### 4.2 限流响应

超出限制时返回 HTTP 429：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": 42901,
    "message": "请求频率超出限制，请稍后重试"
  },
  "meta": {
    "request_id": "req_abc123"
  }
}
```

响应头包含 `Retry-After: 60`（秒），建议客户端据此等待后重试。

### 4.3 每日配额

每个租户有每日请求配额限制（由套餐决定），超出后返回 HTTP 402：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": 42902,
    "message": "每日配额已用尽，请明日重试或升级套餐"
  },
  "meta": {
    "request_id": "req_abc123"
  }
}
```

配额说明：

* 配额按 UTC 日期重置（每日 00:00 UTC）

* `meta.quota_remaining` 字段返回当日剩余配额，-1 表示不限制

* 配额基于 Redis 原子计数，实时扣减

***

## 5. 错误码表

| 错误码   | HTTP 状态码 | 说明                |
| ----- | -------- | ----------------- |
| 40001 | 400      | 参数验证失败            |
| 40101 | 401      | 认证失败 / API Key 无效 |
| 40102 | 401      | API Key 已过期       |
| 40103 | 401      | API Key 已吊销       |
| 40201 | 402      | 积分余额不足            |
| 40301 | 403      | 无接口访问权限           |
| 42901 | 429      | 请求频率超出限制          |
| 42902 | 402      | 每日配额已用尽           |
| 50001 | 500      | 服务器内部错误           |

***

## 6. 接口列表

### 6.0 Webhook 网络验证（公开接口）

验证 webhook 回调地址的网络连通性。该接口为公开接口，不需要 `X-API-Key` 和 `X-User-Identity` 认证。

```plaintext
POST /openapi/v1/webhook/verify
```

#### 请求体（JSON Body）

| 字段          | 类型     | 必填 | 说明                       |
| ----------- | ------ | -- | ------------------------ |
| `challenge` | string | 否  | 挑战字符串，原样返回以确认连通性，默认为空字符串 |

#### 响应数据字段（data）

| 字段          | 类型     | 说明                      |
| ----------- | ------ | ----------------------- |
| `challenge` | string | 原样返回的挑战字符串              |
| `timestamp` | string | 服务器时间戳（ISO 8601 UTC 格式） |

#### curl 示例

```bash
curl -X POST "https://{host}/openapi/v1/webhook/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "challenge": "test_connectivity_12345"
  }'
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "challenge": "test_connectivity_12345",
    "timestamp": "2026-03-23T08:30:00+00:00"
  },
  "error": null,
  "meta": {
    "request_id": "req_wh_001",
    "page": null,
    "size": null,
    "total": null,
    "quota_remaining": -1
  }
}
```

***

### 6.1 搜索 TikTok 达人

搜索 TikTok 平台达人，支持多维度筛选。

```plaintext
POST /openapi/v1/creators/tiktok/search
```

#### 请求体（JSON Body）

| 参数                                      | 类型      | 必填 | 说明                                                                                                            |
| --------------------------------------- | ------- | -- | ------------------------------------------------------------------------------------------------------------- |
| `page`                                  | integer | 否  | 页码，默认 1                                                                                                       |
| `size`                                  | integer | 否  | 每页数量，默认 50，范围 1\~100                                                                                          |
| `keyword`                               | string  | 否  | 搜索关键词                                                                                                         |
| `country_code`                          | string  | 否  | 国家代码，多选逗号分隔，如 `CA,MX,US`                                                                                      |
| `gender`                                | string  | 否  | 性别                                                                                                            |
| `has_email`                             | string  | 否  | 是否有邮箱                                                                                                         |
| `has_mcn`                               | boolean | 否  | 是否绑定 MCN                                                                                                      |
| `has_line`                              | boolean | 否  | 是否有 Line                                                                                                      |
| `has_zalo`                              | boolean | 否  | 是否有 Zalo                                                                                                      |
| `language_code`                         | string  | 否  | 语言代码，多选逗号分隔，如 `en,zh`                                                                                         |
| `followers_cnt_gte`                     | integer | 否  | 粉丝数 ≥                                                                                                         |
| `followers_cnt_lte`                     | integer | 否  | 粉丝数 ≤                                                                                                         |
| `last10_avg_video_views_cnt_gte`        | number  | 否  | 近10条视频平均播放量 ≥                                                                                                 |
| `last10_avg_video_views_cnt_lte`        | number  | 否  | 近10条视频平均播放量 ≤                                                                                                 |
| `last10_avg_video_interaction_rate_gte` | number  | 否  | 近10条视频平均互动率 ≥                                                                                                 |
| `last10_avg_video_interaction_rate_lte` | number  | 否  | 近10条视频平均互动率 ≤                                                                                                 |
| `last_video_publish_date_gte`           | string  | 否  | 最近视频发布时间起始（YYYY-MM-DD）                                                                                        |
| `last_video_publish_date_lte`           | string  | 否  | 最近视频发布时间截止（YYYY-MM-DD）                                                                                        |
| `product_category_id_array`             | string  | 否  | 带货类目 ID，逗号分隔                                                                                                  |
| `industry_category_levels_list`         | string  | 否  | 行业类目，多选逗号分隔                                                                                                   |
| `audience_female_rate_gte`              | number  | 否  | 粉丝女性比例 ≥                                                                                                      |
| `audience_female_rate_lte`              | number  | 否  | 粉丝女性比例 ≤                                                                                                      |
| `audience_age_list`                     | string  | 否  | 粉丝主要年龄区间                                                                                                      |
| `last30day_gmv_gte`                     | number  | 否  | 近30天 GMV ≥                                                                                                    |
| `last30day_gmv_lte`                     | number  | 否  | 近30天 GMV ≤                                                                                                    |
| `last30day_gpm_gte`                     | number  | 否  | 近30天 GPM ≥                                                                                                    |
| `last30day_gpm_lte`                     | number  | 否  | 近30天 GPM ≤                                                                                                    |
| `last30day_gmv_per_buyer_gte`           | number  | 否  | 近30天客单价 ≥                                                                                                     |
| `last30day_gmv_per_buyer_lte`           | number  | 否  | 近30天客单价 ≤                                                                                                     |
| `last30day_commission_rate_gte`         | number  | 否  | 近30天佣金率 ≥                                                                                                     |
| `last30day_commission_rate_lte`         | number  | 否  | 近30天佣金率 ≤                                                                                                     |
| `audience_country_code_list`            | string  | 否  | 受众国家代码，多选逗号分隔                                                                                                 |
| `audience_language_code_list`           | string  | 否  | 受众语言代码，多选逗号分隔                                                                                                 |
| `sort_field`                            | string  | 否  | 排序字段，默认 `followers_cnt`。可选：`followers_cnt`, `last10_avg_video_views_cnt`, `last10_avg_video_interaction_rate` |
| `sort_order`                            | string  | 否  | 排序方式：`asc` / `desc`（默认 `desc`）                                                                                |

#### 响应数据字段（data 数组元素）

| 字段                        | 类型        | 说明                   |
| ------------------------- | --------- | -------------------- |
| `uid`                     | string    | 达人唯一标识               |
| `username`                | string    | 用户名                  |
| `nickname`                | string    | 昵称                   |
| `avatar_url`              | string    | 头像链接                 |
| `profile_url`             | string    | 主页链接                 |
| `country_code`            | string    | 国家/地区代码              |
| `gender`                  | string    | 性别                   |
| `followers_count`         | integer   | 粉丝数                  |
| `likes_count`             | integer   | 点赞数                  |
| `avg_views`               | integer   | 近10条视频平均播放量          |
| `engagement_rate`         | number    | 近10条视频平均互动率          |
| `has_showcase`            | boolean   | 是否开通橱窗带货             |
| `product_categories`      | string\[] | 带货类目列表               |
| `last_video_publish_date` | string    | 最近视频发布日期（YYYY-MM-DD） |

#### curl 示例

```bash
curl -X POST "https://{host}/openapi/v1/creators/tiktok/search" \
  -H "X-API-Key: your_api_key_here" \
  -H "X-User-Identity: user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "beauty",
    "country_code": "US",
    "followers_cnt_gte": 10000,
    "page": 1,
    "size": 20,
    "sort_field": "followers_cnt",
    "sort_order": "desc"
  }'
```

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "uid": "tt_123456",
      "username": "creator_demo",
      "nickname": "Demo Creator",
      "avatar_url": "https://cdn.example.com/avatar.jpg",
      "profile_url": "https://www.tiktok.com/@creator_demo",
      "country_code": "US",
      "gender": "female",
      "followers_count": 150000,
      "likes_count": 3200000,
      "avg_views": 45000,
      "engagement_rate": 0.065,
      "has_showcase": true,
      "product_categories": ["Beauty", "Fashion"],
      "last_video_publish_date": "2026-03-10"
    }
  ],
  "error": null,
  "meta": {
    "request_id": "req_abc123",
    "page": 1,
    "size": 20,
    "total": 3580,
    "quota_remaining": -1
  }
}
```

***

### 6.2 搜索 YouTube 达人

搜索 YouTube 平台达人，支持多维度筛选。

```plaintext
POST /openapi/v1/creators/youtube/search
```

#### 请求体（JSON Body）

| 参数                                      | 类型      | 必填 | 说明                             |
| --------------------------------------- | ------- | -- | ------------------------------ |
| `page`                                  | integer | 否  | 页码，默认 1                        |
| `size`                                  | integer | 否  | 每页数量，默认 50，范围 1\~100           |
| `keyword`                               | string  | 否  | 搜索关键词                          |
| `country_code`                          | string  | 否  | 国家代码，多选逗号分隔                    |
| `gender`                                | string  | 否  | 性别                             |
| `has_email`                             | boolean | 否  | 是否有邮箱                          |
| `has_whatsapp`                          | boolean | 否  | 是否有 WhatsApp                   |
| `is_ai_creator`                         | string  | 否  | 是否 AI 达人                       |
| `industry`                              | string  | 否  | 三级英文类目，逗号分隔                    |
| `language_code`                         | string  | 否  | 语言代码，多选逗号分隔，如 `en,zh`          |
| `followers_cnt_gte`                     | integer | 否  | 订阅数 ≥                          |
| `followers_cnt_lte`                     | integer | 否  | 订阅数 ≤                          |
| `last10_avg_video_view_count_all_gte`   | number  | 否  | 近10条视频平均播放量（全部）≥               |
| `last10_avg_video_view_count_all_lte`   | number  | 否  | 近10条视频平均播放量（全部）≤               |
| `last10_avg_video_view_count_short_gte` | number  | 否  | 近10条短视频平均播放量 ≥                 |
| `last10_avg_video_view_count_short_lte` | number  | 否  | 近10条短视频平均播放量 ≤                 |
| `last10_avg_interaction_rate_all_gte`   | number  | 否  | 近10条视频平均互动率（全部）≥               |
| `last10_avg_interaction_rate_all_lte`   | number  | 否  | 近10条视频平均互动率（全部）≤               |
| `last10_avg_interaction_rate_short_gte` | number  | 否  | 近10条短视频平均互动率 ≥                 |
| `last10_avg_interaction_rate_short_lte` | number  | 否  | 近10条短视频平均互动率 ≤                 |
| `last_video_publish_time_gte`           | string  | 否  | 最近视频发布时间起始                     |
| `last_video_publish_time_lte`           | string  | 否  | 最近视频发布时间截止                     |
| `audience_country_code_list`            | string  | 否  | 受众国家代码，多选逗号分隔                  |
| `audience_language_list`                | string  | 否  | 受众语言，多选逗号分隔                    |
| `audience_age_list`                     | string  | 否  | 受众年龄，多选逗号分隔                    |
| `female_ratio_gte`                      | number  | 否  | 受众女性占比 ≥                       |
| `female_ratio_lte`                      | number  | 否  | 受众女性占比 ≤                       |
| `sort_field`                            | string  | 否  | 排序字段                           |
| `sort_order`                            | string  | 否  | 排序方式：`asc` / `desc`（默认 `desc`） |

#### 响应数据字段（data 数组元素）

| 字段                        | 类型      | 说明                 |
| ------------------------- | ------- | ------------------ |
| `uid`                     | string  | 达人唯一标识             |
| `username`                | string  | 用户名                |
| `nickname`                | string  | 昵称/频道名             |
| `avatar_url`              | string  | 头像链接               |
| `channel_url`             | string  | 频道链接               |
| `country_code`            | string  | 国家/地区代码            |
| `country_name`            | string  | 国家名称（英文）           |
| `language`                | string  | 语言                 |
| `gender`                  | string  | 性别                 |
| `bio`                     | string  | 频道简介               |
| `followers_count`         | integer | 订阅数                |
| `video_count`             | integer | 视频数量               |
| `view_count`              | integer | 总观看次数              |
| `avg_views`               | integer | 近10条视频平均播放量（全部）    |
| `avg_views_short`         | integer | 近10条短视频平均播放量       |
| `avg_views_long`          | integer | 近10条长视频平均播放量       |
| `engagement_rate`         | number  | 近10条视频互动率（全部）      |
| `engagement_rate_short`   | number  | 近10条短视频互动率         |
| `engagement_rate_long`    | number  | 近10条长视频互动率         |
| `last_video_publish_time` | string  | 最近视频发布时间（ISO 8601） |

#### curl 示例

```bash
curl -X POST "https://{host}/openapi/v1/creators/youtube/search" \
  -H "X-API-Key: your_api_key_here" \
  -H "X-User-Identity: user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "US",
    "followers_cnt_gte": 50000,
    "page": 1,
    "size": 20,
    "sort_order": "desc"
  }'
```

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "uid": "yt_789012",
      "username": "tech_reviewer",
      "nickname": "Tech Reviews Daily",
      "avatar_url": "https://cdn.example.com/yt_avatar.jpg",
      "channel_url": "https://www.youtube.com/c/tech_reviewer",
      "country_code": "US",
      "country_name": "United States",
      "language": "en",
      "gender": "male",
      "bio": "Daily tech reviews and unboxings",
      "followers_count": 520000,
      "video_count": 1200,
      "view_count": 85000000,
      "avg_views": 72000,
      "avg_views_short": 95000,
      "avg_views_long": 58000,
      "engagement_rate": 0.045,
      "engagement_rate_short": 0.062,
      "engagement_rate_long": 0.038,
      "last_video_publish_time": "2026-03-12T14:30:00Z"
    }
  ],
  "error": null,
  "meta": {
    "request_id": "req_def456",
    "page": 1,
    "size": 20,
    "total": 1250,
    "quota_remaining": -1
  }
}
```

***

### 6.3 搜索 Instagram 达人

搜索 Instagram 平台达人，支持多维度筛选。

```plaintext
POST /openapi/v1/creators/instagram/search
```

#### 请求体（JSON Body）

| 参数                                      | 类型      | 必填 | 说明                             |
| --------------------------------------- | ------- | -- | ------------------------------ |
| `page`                                  | integer | 否  | 页码，默认 1                        |
| `size`                                  | integer | 否  | 每页数量，默认 50，范围 1\~100           |
| `keyword`                               | string  | 否  | 搜索关键词                          |
| `country_code`                          | string  | 否  | 国家代码，多选逗号分隔                    |
| `gender`                                | string  | 否  | 性别：`男性` / `女性`                 |
| `industry`                              | string  | 否  | 三级英文类目，逗号分隔                    |
| `has_email`                             | boolean | 否  | 是否有邮箱                          |
| `has_whatsapp`                          | boolean | 否  | 是否有 WhatsApp                   |
| `is_product_kol`                        | boolean | 否  | 是否带货达人                         |
| `language_code`                         | string  | 否  | 语言代码，多选逗号分隔，如 `en,zh`          |
| `followers_cnt_gte`                     | integer | 否  | 粉丝数 ≥                          |
| `followers_cnt_lte`                     | integer | 否  | 粉丝数 ≤                          |
| `last10_avg_video_view_count_gte`       | number  | 否  | 近10条视频平均播放量 ≥                  |
| `last10_avg_video_view_count_lte`       | number  | 否  | 近10条视频平均播放量 ≤                  |
| `last10_avg_video_interaction_rate_gte` | number  | 否  | 近10条视频平均互动率 ≥                  |
| `last10_avg_video_interaction_rate_lte` | number  | 否  | 近10条视频平均互动率 ≤                  |
| `last30day_gmv_gte`                     | number  | 否  | 近30天 GMV ≥                     |
| `last30day_gmv_lte`                     | number  | 否  | 近30天 GMV ≤                     |
| `last30day_prod_sales_show_gte`         | number  | 否  | 近30天销售商品数 ≥                    |
| `last30day_prod_sales_show_lte`         | number  | 否  | 近30天销售商品数 ≤                    |
| `last_video_publish_time_gte`           | string  | 否  | 最近视频发布时间起始                     |
| `last_video_publish_time_lte`           | string  | 否  | 最近视频发布时间截止                     |
| `audience_country_code_list`            | string  | 否  | 受众国家代码，多选逗号分隔                  |
| `audience_language_list`                | string  | 否  | 受众语言，多选逗号分隔                    |
| `audience_age_list`                     | string  | 否  | 受众年龄，多选逗号分隔                    |
| `female_ratio_gte`                      | number  | 否  | 受众女性占比 ≥                       |
| `female_ratio_lte`                      | number  | 否  | 受众女性占比 ≤                       |
| `is_top_creator`                        | boolean | 否  | 是否顶级 Amazon 带货达人               |
| `is_ai_creator`                         | string  | 否  | 是否 AI 达人                       |
| `sort_field`                            | string  | 否  | 排序字段                           |
| `sort_order`                            | string  | 否  | 排序方式：`asc` / `desc`（默认 `desc`） |

#### 响应数据字段（data 数组元素）

| 字段                        | 类型      | 说明          |
| ------------------------- | ------- | ----------- |
| `uid`                     | string  | 达人唯一标识      |
| `username`                | string  | 用户名         |
| `nickname`                | string  | 昵称          |
| `avatar_url`              | string  | 头像链接        |
| `profile_url`             | string  | 主页链接        |
| `country_code`            | string  | 国家/地区代码     |
| `language`                | string  | 语言          |
| `followers_count`         | integer | 粉丝数         |
| `video_count`             | integer | 视频/帖子数量     |
| `view_count`              | integer | 总观看次数       |
| `avg_views`               | integer | 近10条视频平均播放量 |
| `engagement_rate`         | number  | 近10条视频平均互动率 |
| `last_video_publish_time` | string  | 最近视频发布时间    |

#### curl 示例

```bash
curl -X POST "https://{host}/openapi/v1/creators/instagram/search" \
  -H "X-API-Key: your_api_key_here" \
  -H "X-User-Identity: user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "US",
    "followers_cnt_gte": 10000,
    "is_product_kol": true,
    "page": 1,
    "size": 20
  }'
```

#### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "uid": "ig_345678",
      "username": "fashion_style",
      "nickname": "Fashion Style",
      "avatar_url": "https://cdn.example.com/ig_avatar.jpg",
      "profile_url": "https://www.instagram.com/fashion_style",
      "country_code": "US",
      "language": "en",
      "followers_count": 280000,
      "video_count": 850,
      "view_count": 42000000,
      "avg_views": 35000,
      "engagement_rate": 0.058,
      "last_video_publish_time": "2026-03-11T09:15:00Z"
    }
  ],
  "error": null,
  "meta": {
    "request_id": "req_ghi789",
    "page": 1,
    "size": 20,
    "total": 890,
    "quota_remaining": -1
  }
}
```

***

### 6.4 提交采集任务（链接/用户名）

提交达人采集任务，支持链接采集（LINK\_BATCH）和用户名采集（FILE\_UPLOAD）两种方式。支持 TikTok / YouTube / Instagram 三个平台。可选传入 `webhook_url`，任务完成时自动回调通知。

```plaintext
POST /openapi/v1/collection/tasks/submit
```

#### 请求体（JSON Body）

| 字段            | 类型        | 必填 | 说明                                            |
| ------------- | --------- | -- | --------------------------------------------- |
| `task_type`   | string    | 是  | 任务类型：`LINK_BATCH`（链接采集）/ `FILE_UPLOAD`（用户名采集） |
| `platform`    | string    | 是  | 平台：`tiktok` / `youtube` / `instagram`         |
| `values`      | string\[] | 是  | 输入值列表（链接/用户名），至少 1 个，最多 500 个                 |
| `task_name`   | string    | 否  | 任务名称                                          |
| `webhook_url` | string    | 否  | 任务完成回调 URL（必须为 HTTPS）                         |

#### 请求体校验规则

* `task_type`：仅支持 `LINK_BATCH`、`FILE_UPLOAD`

* `platform`：仅支持 `tiktok`、`youtube`、`instagram`

* `values`：最多 500 个

* `webhook_url`：必须使用 HTTPS 协议

#### task\_type 说明

| task\_type    | 说明    | values 内容 | 最大数量 |
| ------------- | ----- | --------- | ---- |
| `LINK_BATCH`  | 链接采集  | 达人主页链接列表  | 500  |
| `FILE_UPLOAD` | 用户名采集 | 达人用户名列表   | 500  |

#### 权限要求

需要 `collection:submit` 或 `collection:*` 权限。

#### 响应数据字段（data）

| 字段            | 类型      | 说明     |
| ------------- | ------- | ------ |
| `task_id`     | string  | 任务唯一标识 |
| `status`      | string  | 提交状态   |
| `message`     | string  | 提示信息   |
| `total_count` | integer | 提交的值总数 |

#### curl 示例

**链接采集（LINK\_BATCH）：**

```bash
curl -X POST "https://{host}/openapi/v1/collection/tasks/submit" \
  -H "X-API-Key: your_api_key_here" \
  -H "X-User-Identity: user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "LINK_BATCH",
    "platform": "tiktok",
    "values": [
      "https://www.tiktok.com/@creator1",
      "https://www.tiktok.com/@creator2"
    ],
    "task_name": "Q1 达人链接采集",
    "webhook_url": "https://your-server.com/webhook/collection"
  }'
```

**用户名采集（FILE\_UPLOAD）：**

```bash
curl -X POST "https://{host}/openapi/v1/collection/tasks/submit" \
  -H "X-API-Key: your_api_key_here" \
  -H "X-User-Identity: user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "FILE_UPLOAD",
    "platform": "tiktok",
    "values": ["creator1", "creator2", "creator3"],
    "task_name": "用户名批量采集"
  }'
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "task_id": "task_20260315_abc123",
    "status": "submitted",
    "message": "任务提交成功",
    "total_count": 2
  },
  "error": null,
  "meta": {
    "request_id": "req_jkl012"
  }
}
```

***

### 6.5 提交关键词采集任务

通过关键词搜索并采集达人数据。该接口使用独立的 `collection:keyword-submit` 权限，与链接/用户名采集权限分开管控。

```plaintext
POST /openapi/v1/collection/tasks/keyword-submit
```

#### 请求体（JSON Body）

| 字段            | 类型        | 必填 | 说明                                    |
| ------------- | --------- | -- | ------------------------------------- |
| `platform`    | string    | 是  | 平台：`tiktok` / `youtube` / `instagram` |
| `keywords`    | string\[] | 是  | 关键词列表，至少 1 个，最多 10 个                  |
| `task_name`   | string    | 否  | 任务名称                                  |
| `webhook_url` | string    | 否  | 任务完成回调 URL（必须为 HTTPS）                 |

#### 请求体校验规则

* `platform`：仅支持 `tiktok`、`youtube`、`instagram`

* `keywords`：最多 10 个关键词

* `webhook_url`：必须使用 HTTPS 协议

#### 权限要求

需要 `collection:keyword-submit` 或 `collection:*` 权限。

#### 响应数据字段（data）

| 字段            | 类型      | 说明      |
| ------------- | ------- | ------- |
| `task_id`     | string  | 任务唯一标识  |
| `status`      | string  | 提交状态    |
| `message`     | string  | 提示信息    |
| `total_count` | integer | 提交的关键词数 |

#### curl 示例

```bash
curl -X POST "https://{host}/openapi/v1/collection/tasks/keyword-submit" \
  -H "X-API-Key: your_api_key_here" \
  -H "X-User-Identity: user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "tiktok",
    "keywords": ["beauty tips", "skincare routine"],
    "task_name": "美妆关键词采集",
    "webhook_url": "https://your-server.com/webhook/collection"
  }'
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "task_id": "task_20260315_def456",
    "status": "submitted",
    "message": "任务提交成功",
    "total_count": 2
  },
  "error": null,
  "meta": {
    "request_id": "req_kw_001"
  }
}
```

***

### 6.6 查询采集任务状态

查询指定采集任务的执行状态。仅可查询当前租户通过 Open API 提交的任务。

```plaintext
POST /openapi/v1/collection/tasks/status
```

#### 请求体（JSON Body）

| 字段        | 类型     | 必填 | 说明    |
| --------- | ------ | -- | ----- |
| `task_id` | string | 是  | 任务 ID |

#### 响应数据字段（data）

| 字段          | 类型      | 说明                                                     |
| ----------- | ------- | ------------------------------------------------------ |
| `task_id`   | string  | 任务唯一标识                                                 |
| `status`    | string  | 任务状态：`processing` / `completed` / `failed` / `timeout` |
| `total`     | integer | 总数量                                                    |
| `completed` | integer | 已完成数                                                   |
| `failed`    | integer | 失败数                                                    |
| `progress`  | number  | 进度百分比（0\~100）                                          |

#### 状态说明

| status       | 说明             |
| ------------ | -------------- |
| `processing` | 处理中（采集中或数据入库中） |
| `completed`  | 已完成            |
| `failed`     | 失败             |
| `timeout`    | 超时             |

#### curl 示例

```bash
curl -X POST "https://{host}/openapi/v1/collection/tasks/status" \
  -H "X-API-Key: your_api_key_here" \
  -H "X-User-Identity: user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "task_20260315_abc123"
  }'
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "task_id": "task_20260315_abc123",
    "status": "processing",
    "total": 2,
    "completed": 1,
    "failed": 0,
    "progress": 50.0
  },
  "error": null,
  "meta": {
    "request_id": "req_mno345"
  }
}
```

***

### 6.7 获取采集数据

分页获取采集任务的达人数据。仅可获取当前租户通过 Open API 提交的任务数据。

```plaintext
POST /openapi/v1/collection/tasks/data
```

#### 请求体（JSON Body）

| 字段        | 类型      | 必填 | 说明                   |
| --------- | ------- | -- | -------------------- |
| `task_id` | string  | 是  | 任务 ID                |
| `page`    | integer | 否  | 页码，默认 1，最小 1         |
| `size`    | integer | 否  | 每页数量，默认 20，范围 1\~100 |

#### 响应数据字段（data）

| 字段               | 类型      | 说明      |
| ---------------- | ------- | ------- |
| `columns_config` | array   | 列头配置列表  |
| `items`          | array   | 达人数据行列表 |
| `total`          | integer | 总记录数    |
| `page`           | integer | 当前页码    |
| `size`           | integer | 每页数量    |

#### curl 示例

```bash
curl -X POST "https://{host}/openapi/v1/collection/tasks/data" \
  -H "X-API-Key: your_api_key_here" \
  -H "X-User-Identity: user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "task_20260315_abc123",
    "page": 1,
    "size": 20
  }'
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "columns_config": ["username", "nickname", "followers_count", "country_code"],
    "items": [
      {
        "username": "creator1",
        "nickname": "Creator One",
        "followers_count": 150000,
        "country_code": "US"
      }
    ],
    "total": 2,
    "page": 1,
    "size": 20
  },
  "error": null,
  "meta": {
    "request_id": "req_pqr678",
    "page": 1,
    "size": 20,
    "total": 2,
    "quota_remaining": -1
  }
}
```

***

### 6.8 获取文件下载链接

通过 `file_id` 或 `file_name` 获取私有存储文件的临时下载链接。两个参数二选一传入，传 `file_name` 时按最新记录匹配。

该接口不需要 `X-User-Identity` 请求头，仅通过 API Key 做租户隔离。

```plain&#x20;text
POST /openapi/v1/files/download-url
```

#### 请求体（JSON Body）

| 字段          | 类型     | 必填 | 说明                           |
| ----------- | ------ | -- | ---------------------------- |
| `file_id`   | string | 否  | 文件唯一标识（与 `file_name` 二选一）    |
| `file_name` | string | 否  | 文件名（与 `file_id` 二选一，按最新时间匹配） |

> `file_id` 和 `file_name` 必须至少传入一个，同时传入时优先使用 `file_id`。

#### 权限要求

需要 `files:download` 或 `files:*` 权限。

#### 响应数据字段（data）

| 字段               | 类型     | 说明                        |
| ---------------- | ------ | ------------------------- |
| `file_id`        | string | 文件唯一标识                    |
| `file_name`      | string | 文件名                       |
| `file_url`       | string | 带鉴权的临时下载 URL              |
| `file_expire_at` | string | URL 过期时间（ISO 8601 UTC 格式） |

#### curl 示例

**通过 file\_id 获取：**

```bash
curl -X POST "https://{host}/openapi/v1/files/download-url" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
  }'
```

**通过 file\_name 获取：**

```bash
curl -X POST "https://{host}/openapi/v1/files/download-url" \
  -H "X-API-Key: your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "upload-youtube - 20条.xls"
  }'
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "file_id": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    "file_name": "upload-youtube - 20条.xls",
    "file_url": "https://static.creativault.vip/influencer%2Fupload-youtube%20-%2020%E6%9D%A1.xls?auth_key=1711267200-abc123def456-0-md5hash",
    "file_expire_at": "2026-03-24T09:00:00+00:00"
  },
  "error": null,
  "meta": {
    "request_id": "req_file_001",
    "page": null,
    "size": null,
    "total": null,
    "quota_remaining": 1000
  }
}
```

#### 错误场景

| 场景                          | HTTP 状态码 | 说明             |
| --------------------------- | -------- | -------------- |
| `file_id` 和 `file_name` 均未传 | 400      | 参数校验失败         |
| 文件不存在或不属于当前租户               | 404      | File not found |
| 签名 URL 生成失败                 | 500      | 服务器内部错误        |

***

## 7. Webhook 回调

### 7.1 概述

当采集任务完成（或超时）时，如果提交任务时指定了 `webhook_url`，系统将自动向该 URL 发送 HTTP POST 回调通知。

### 7.2 回调请求

```plaintext
POST {webhook_url}
Content-Type: application/json
X-Webhook-Signature: {hmac_sha256_signature}
```

### 7.3 签名验证

回调请求携带 `X-Webhook-Signature` 头，使用 HMAC-SHA256 算法对请求体签名：

```plaintext
signature = HMAC-SHA256(
    key = webhook_secret,
    message = JSON.stringify(payload, sort_keys=true)
)
```

验证步骤：

1. 获取请求头 `X-Webhook-Signature` 的值

2. 对收到的请求体 JSON（按 key 排序序列化）使用相同密钥计算 HMAC-SHA256

3) 比较两个签名是否一致

### 7.4 回调 Payload 结构

```json
{
  "event": "collection.completed",
  "task_id": "task_20260315_abc123",
  "task_type": "LINK_BATCH",
  "status": "completed",
  "total": 2,
  "completed": 2,
  "failed": 0,
  "timestamp": "2026-03-15T10:45:00Z"
}
```

| 字段          | 类型      | 说明                                                 |
| ----------- | ------- | -------------------------------------------------- |
| `event`     | string  | 事件类型：`collection.completed` / `collection.timeout` |
| `task_id`   | string  | 任务唯一标识                                             |
| `task_type` | string  | 任务类型：`LINK_BATCH` / `FILE_UPLOAD` / `KEYWORD`      |
| `status`    | string  | 任务最终状态                                             |
| `total`     | integer | 总数量                                                |
| `completed` | integer | 成功采集数                                              |
| `failed`    | integer | 失败数                                                |
| `timestamp` | string  | 事件发生时间（ISO 8601）                                   |

### 7.5 重试策略

| 重试次数  | 间隔   | 说明     |
| ----- | ---- | ------ |
| 第 1 次 | 10 秒 | 首次重试   |
| 第 2 次 | 30 秒 | 第二次重试  |
| 第 3 次 | 90 秒 | 最后一次重试 |

* 最多重试 3 次（含首次调用共 3 次尝试）

* HTTP 响应状态码 < 400 视为成功

* 所有重试均失败后记录错误日志，不再重试

* 单次请求超时时间：10 秒

### 7.6 接收方要求

* 回调 URL 必须使用 HTTPS 协议

* 建议在 5 秒内返回 HTTP 2xx 响应

* 建议实现幂等处理（同一任务可能因重试收到多次回调）
