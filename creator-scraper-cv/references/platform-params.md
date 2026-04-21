# 各平台特有筛选参数

搜索达人时，除通用参数外，各平台有特有的筛选条件。

## TikTok 特有参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `has_mcn` | boolean | 是否绑定 MCN |
| `has_line` | boolean | 是否有 Line |
| `has_zalo` | boolean | 是否有 Zalo |
| `language_code` | string | 语言代码，多选逗号分隔（如 `en,zh`）|
| `last10_avg_video_views_cnt_gte` | number | 近10条视频平均播放量 ≥ |
| `last10_avg_video_views_cnt_lte` | number | 近10条视频平均播放量 ≤ |
| `last10_avg_video_interaction_rate_gte` | number | 近10条视频平均互动率 ≥ |
| `last10_avg_video_interaction_rate_lte` | number | 近10条视频平均互动率 ≤ |
| `last_video_publish_date_gte` | string | 最近视频发布时间起始（YYYY-MM-DD）|
| `last_video_publish_date_lte` | string | 最近视频发布时间截止（YYYY-MM-DD）|
| `product_category_id_array` | string | 带货类目 ID，逗号分隔 |
| `industry_category_levels_list` | string | 行业类目，多选逗号分隔 |
| `audience_female_rate_gte` | number | 粉丝女性比例 ≥ |
| `audience_female_rate_lte` | number | 粉丝女性比例 ≤ |
| `audience_age_list` | string | 粉丝主要年龄区间 |
| `last30day_gmv_gte` | number | 近30天 GMV ≥ |
| `last30day_gmv_lte` | number | 近30天 GMV ≤ |
| `last30day_gpm_gte` | number | 近30天 GPM ≥ |
| `last30day_gpm_lte` | number | 近30天 GPM ≤ |
| `last30day_gmv_per_buyer_gte` | number | 近30天客单价 ≥ |
| `last30day_gmv_per_buyer_lte` | number | 近30天客单价 ≤ |
| `last30day_commission_rate_gte` | number | 近30天佣金率 ≥ |
| `last30day_commission_rate_lte` | number | 近30天佣金率 ≤ |
| `audience_country_code_list` | string | 受众国家代码，多选逗号分隔 |
| `audience_language_code_list` | string | 受众语言代码，多选逗号分隔 |

**TikTok 排序字段**：`followers_cnt`（默认）、`last10_avg_video_views_cnt`、`last10_avg_video_interaction_rate`

---

## 服务等级（所有平台通用）

搜索接口支持 `service_level` 参数，控制返回字段范围和积分消耗：

| 等级 | 名称 | 包含数据字段 | 积分单价（每条） |
|------|------|------------|------------|
| S1 | 纯名单筛选 | uid、username、nickname、avatar_url、profile_url、followers_count、likes_count、has_showcase、last_video_publish_date | 1 积分 |
| S2 | 精准触达 | S1 全部 + country_code、gender、engagement_rate、avg_views、product_categories、has_email 标识、language | 3 积分 |
| S3 | 深度画像 | S2 全部 + 受众女性比例、受众国家分布、受众语言分布 | 4 积分 |

默认 `S1`。响应 `meta` 中会返回 `service_level`（实际使用的等级）和 `credits_consumed`（本次扣减积分数）。

---

## YouTube 特有参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `has_whatsapp` | boolean | 是否有 WhatsApp |
| `is_ai_creator` | string | 是否 AI 达人 |
| `industry` | string | 三级英文类目，逗号分隔 |
| `language_code` | string | 语言代码，多选逗号分隔 |
| `last10_avg_video_view_count_all_gte` | number | 近10条视频平均播放量（全部）≥ |
| `last10_avg_video_view_count_all_lte` | number | 近10条视频平均播放量（全部）≤ |
| `last10_avg_video_view_count_short_gte` | number | 近10条短视频平均播放量 ≥ |
| `last10_avg_video_view_count_short_lte` | number | 近10条短视频平均播放量 ≤ |
| `last10_avg_interaction_rate_all_gte` | number | 近10条视频平均互动率（全部）≥ |
| `last10_avg_interaction_rate_all_lte` | number | 近10条视频平均互动率（全部）≤ |
| `last10_avg_interaction_rate_short_gte` | number | 近10条短视频平均互动率 ≥ |
| `last10_avg_interaction_rate_short_lte` | number | 近10条短视频平均互动率 ≤ |
| `last_video_publish_time_gte` | string | 最近视频发布时间起始 |
| `last_video_publish_time_lte` | string | 最近视频发布时间截止 |
| `audience_country_code_list` | string | 受众国家代码，多选逗号分隔 |
| `audience_language_list` | string | 受众语言，多选逗号分隔 |
| `audience_age_list` | string | 受众年龄，多选逗号分隔 |
| `female_ratio_gte` | number | 受众女性占比 ≥ |
| `female_ratio_lte` | number | 受众女性占比 ≤ |

---

## Instagram 特有参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `has_whatsapp` | boolean | 是否有 WhatsApp |
| `is_product_kol` | boolean | 是否带货达人 |
| `is_top_creator` | boolean | 是否顶级 Amazon 带货达人 |
| `is_ai_creator` | string | 是否 AI 达人 |
| `industry` | string | 三级英文类目，逗号分隔 |
| `language_code` | string | 语言代码，多选逗号分隔 |
| `last10_avg_video_view_count_gte` | number | 近10条视频平均播放量 ≥ |
| `last10_avg_video_view_count_lte` | number | 近10条视频平均播放量 ≤ |
| `last10_avg_video_interaction_rate_gte` | number | 近10条视频平均互动率 ≥ |
| `last10_avg_video_interaction_rate_lte` | number | 近10条视频平均互动率 ≤ |
| `last30day_gmv_gte` | number | 近30天 GMV ≥ |
| `last30day_gmv_lte` | number | 近30天 GMV ≤ |
| `last30day_prod_sales_show_gte` | number | 近30天销售商品数 ≥ |
| `last30day_prod_sales_show_lte` | number | 近30天销售商品数 ≤ |
| `last_video_publish_time_gte` | string | 最近视频发布时间起始 |
| `last_video_publish_time_lte` | string | 最近视频发布时间截止 |
| `audience_country_code_list` | string | 受众国家代码，多选逗号分隔 |
| `audience_language_list` | string | 受众语言，多选逗号分隔 |
| `audience_age_list` | string | 受众年龄，多选逗号分隔 |
| `female_ratio_gte` | number | 受众女性占比 ≥ |
| `female_ratio_lte` | number | 受众女性占比 ≤ |

---

## 搜索结果字段

### TikTok 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `uid` | string | 达人唯一标识 |
| `username` | string | 用户名 |
| `nickname` | string | 昵称 |
| `avatar_url` | string | 头像链接 |
| `profile_url` | string | 主页链接 |
| `country_code` | string | 国家/地区代码 |
| `gender` | string | 性别 |
| `followers_count` | integer | 粉丝数 |
| `likes_count` | integer | 点赞数 |
| `avg_views` | integer | 近10条视频平均播放量 |
| `engagement_rate` | number | 近10条视频平均互动率 |
| `has_showcase` | boolean | 是否开通橱窗带货 |
| `product_categories` | string[] | 带货类目列表 |
| `last_video_publish_date` | string | 最近视频发布日期 |

### YouTube 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `uid` | string | 达人唯一标识 |
| `username` | string | 用户名 |
| `nickname` | string | 频道名 |
| `avatar_url` | string | 头像链接 |
| `channel_url` | string | 频道链接 |
| `country_code` | string | 国家/地区代码 |
| `country_name` | string | 国家名称（英文）|
| `language` | string | 语言 |
| `gender` | string | 性别 |
| `bio` | string | 频道简介 |
| `followers_count` | integer | 订阅数 |
| `video_count` | integer | 视频数量 |
| `view_count` | integer | 总观看次数 |
| `avg_views` | integer | 近10条视频平均播放量（全部）|
| `avg_views_short` | integer | 近10条短视频平均播放量 |
| `avg_views_long` | integer | 近10条长视频平均播放量 |
| `engagement_rate` | number | 近10条视频互动率（全部）|
| `engagement_rate_short` | number | 近10条短视频互动率 |
| `engagement_rate_long` | number | 近10条长视频互动率 |
| `last_video_publish_time` | string | 最近视频发布时间 |

### Instagram 返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `uid` | string | 达人唯一标识 |
| `username` | string | 用户名 |
| `nickname` | string | 昵称 |
| `avatar_url` | string | 头像链接 |
| `profile_url` | string | 主页链接 |
| `country_code` | string | 国家/地区代码 |
| `language` | string | 语言 |
| `followers_count` | integer | 粉丝数 |
| `video_count` | integer | 视频/帖子数量 |
| `view_count` | integer | 总观看次数 |
| `avg_views` | integer | 近10条视频平均播放量 |
| `engagement_rate` | number | 近10条视频平均互动率 |
| `last_video_publish_time` | string | 最近视频发布时间 |

---

## 解析达人用户名（resolve）返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `platform_id` | string | 达人平台唯一 ID |
| `username` | string | 用户名 |
| `display_name` | string / null | 昵称/显示名 |
| `avatar_url` | string / null | 头像链接 |
| `followers_count` | integer / null | 粉丝数 |

---

## 相似达人推荐（lookalike）返回字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `uid` | string | 达人唯一标识 |
| `username` | string / null | 用户名 |
| `nickname` | string / null | 昵称 |
| `avatar_url` | string / null | 头像链接 |
| `profile_url` | string / null | 主页链接 |
| `country_code` | string / null | 国家/地区代码 |
| `followers_count` | integer / null | 粉丝数 |
| `avg_views` | integer / null | 近10条视频平均播放量 |
| `engagement_rate` | number / null | 近10条视频平均互动率 |
| `match_score` | number / null | 相似度匹配分数 |

### lookalike 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `seed_platform_id` | string | 是 | 种子达人平台唯一 ID（通过 resolve 获取） |
| `seed_platform` | string | 是 | 种子达人所在平台：`tiktok` / `youtube` / `instagram` |
| `target_platform` | string | 是 | 目标搜索平台：`tiktok` / `youtube` / `instagram` |
| `target_region` | string | 否 | 目标地区代码，`all` 表示不限 |
| `target_language` | string | 否 | 目标语言代码，`all` 表示不限 |
| `limit` | integer | 否 | 返回数量，默认 20，范围 1~50 |
| `follower_min` | integer | 否 | 粉丝数下限 |
| `follower_max` | integer | 否 | 粉丝数上限 |
| `avg_views_min` | integer | 否 | 平均观看量下限 |
| `avg_views_max` | integer | 否 | 平均观看量上限 |
| `female_rate_min` | number | 否 | 女性受众占比下限（%），范围 0~100 |
