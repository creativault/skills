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
