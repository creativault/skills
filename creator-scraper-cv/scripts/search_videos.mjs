#!/usr/bin/env node
// Search videos — supports TikTok / YouTube / Instagram (cross-platform)
//
// Usage:
//   node {baseDir}/scripts/search_videos.mjs '{"platform":"tiktok","hashtag":["beauty"],"page":1,"size":10}'
//
// Examples:
//   - By hashtag:          '{"platform":"tiktok","hashtag":["beauty","skincare"],"video_views_cnt_gte":100000}'
//   - Cross-platform:      '{"video_views_cnt_gte":1000000,"page":1,"size":10}'
//   - By title + engagement: '{"platform":"youtube","video_title":"skincare routine","video_interaction_rate_gte":5}'
//   - By creator ID:       '{"union_user_ids":"7480117868423119918,7158794701745964074"}'

import { callAPI, parseArgs } from './_api_client.mjs';

const params = parseArgs();

// Video search endpoint does not need platform preprocessing (no industry mapping)
const result = await callAPI('/openapi/v1/videos/search', params, null);
console.log(JSON.stringify(result, null, 2));
