# MCP Server 配置

## Feishu Project MCP

飞书项目管理 MCP Server 配置，用于与飞书项目系统交互。

### 配置信息

```json
{
  "mcpServers": {
    "feishu-project": {
      "baseUrl": "https://project.feishu.cn/mcp_server/v1?mcpKey=m-f81485b9-71a1-43a6-8049-2f3e6da9ab5c&userKey=7308538463777800196"
    }
  },
  "imports": []
}
```

**注意**: `projectKey` 不再配置在 URL 中，改为通过接口参数传递。

### 参数说明

| 参数 | 值 | 说明 |
|------|-----|------|
| `mcpKey` | `m-f81485b9-71a1-43a6-8049-2f3e6da9ab5c` | MCP 服务密钥 |
| `userKey` | `7308538463777800196` | 用户标识 |
| `project_key` | `697b384fd5eaf3ca7de6ff5c` | 项目标识（通过参数传递）|

### 配置位置

根据使用的客户端，将配置添加到相应位置：

#### Cursor
```bash
# Windows
%APPDATA%\Cursor\mcp.json

# macOS
~/.cursor/mcp.json
```

#### Claude Desktop
```bash
# Windows
%APPDATA%\Claude\mcp.json

# macOS
~/Library/Application Support/Claude/mcp.json
```

#### Kimi Code CLI
```bash
# 项目级配置
<project>/.kimi/mcp.json

# 用户级配置
~/.kimi/mcp.json
```

### 完整配置文件示例

```json
{
  "mcpServers": {
    "feishu-project": {
      "baseUrl": "https://project.feishu.cn/mcp_server/v1?mcpKey=m-f81485b9-71a1-43a6-8049-2f3e6da9ab5c&userKey=7308538463777800196"
    }
  },
  "imports": []
}
```

## MQL (Meego Query Language) 语法

MQL 是飞书项目的专用查询语言，兼容 SQL 语法。

### 基本语法结构

```sql
SELECT fieldList                    -- 指定查询的字段列表
FROM objectType                     -- 指定要查询的数据来源
WHERE conditionExpression           -- 指定查询条件
[ORDER BY fieldOrderByList [ASC|DESC]]   -- 排序（可选）
[LIMIT [offset,] row_count]         -- 限制返回行数（可选）
```

### 核心概念

- **对象**: 工作项类型、工作项节点、子任务等实体
- **对象属性**: 系统字段、自定义字段、角色人员等

### 常用查询示例

#### 1. 查询所有需求
```sql
SELECT name, state_3, owner 
FROM story 
WHERE project_key = '697b384fd5eaf3ca7de6ff5c'
```

#### 2. 查询状态为【开始】的需求
```sql
SELECT name, state_3, owner 
FROM story 
WHERE project_key = '697b384fd5eaf3ca7de6ff5c' 
  AND state_3 = '开始'
```

#### 3. 查询并排序
```sql
SELECT name, state_3, created_at 
FROM story 
WHERE project_key = '697b384fd5eaf3ca7de6ff5c'
ORDER BY created_at DESC
LIMIT 10
```

### MCP 工具调用示例

#### search_by_mql

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_by_mql",
    "arguments": {
      "project_key": "697b384fd5eaf3ca7de6ff5c",
      "moql": "SELECT name, state_3 FROM story WHERE state_3 = '开始'",
      "session_id": "unique-session-id",
      "group_pagination_list": [
        {
          "group_id": "default",
          "page_num": 1
        }
      ]
    }
  },
  "id": 1
}
```

## MCP Server 状态检查结果

### 连接状态 ✅

| 检查项 | 结果 |
|--------|------|
| 服务器可达性 | ✅ 正常 (HTTP 200) |
| MCP 协议版本 | 2025-03-26 |
| 服务器名称 | Meego MCP Server |
| 服务器版本 | 1.0.0 |

### 可用工具列表 (8个)

| 工具名 | 功能描述 | 危险操作 |
|--------|----------|----------|
| `create_workitem` | 创建工作项 | ⚠️ 是 |
| `finish_node` | 完成/结束节点 | ⚠️ 是 |
| `get_node_detail` | 获取节点详情 | 否 |
| `get_view_detail` | 获取视图详情 | 否 |
| `get_workitem_brief` | 获取工作项简要信息 | 否 |
| `get_workitem_info` | 获取工作项详细信息 | 否 |
| `search_by_mql` | 使用 MQL 搜索工作项 | 否 |
| `update_field` | 更新工作项字段 | ⚠️ 是 |

## 检查 MCP 工具状态

### 方法 1: 使用 Kimi Code CLI 命令

```bash
# 列出所有已配置的 MCP Servers
kimi mcp list

# 测试特定 MCP Server 连接
kimi mcp test feishu-project

# 查看 MCP Server 提供的工具
kimi mcp tools feishu-project
```

### 方法 2: HTTP 直接测试

```bash
# 测试 MCP Server 是否可达
curl -X POST "https://project.feishu.cn/mcp_server/v1" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    },
    "id": 1
  }'
```

### 方法 3: 在编辑器中查看

1. 打开支持 MCP 的编辑器（Cursor、Claude Desktop 等）
2. 查看 MCP/工具面板
3. 检查 feishu-project 是否显示为已连接

## 常见问题

### 连接失败

1. **检查网络**: 确保可以访问 `project.feishu.cn`
2. **验证密钥**: 确认 `mcpKey`、`userKey` 正确且未过期
3. **权限检查**: 确认用户有权限访问该项目

### 中文乱码/问号问题 ⚠️

**问题原因**: PowerShell 默认使用 GBK 编码，导致中文被错误编码为问号。

**解决方案**:

1. **发送请求时指定 UTF-8 编码**:
```powershell
ContentType = "application/json; charset=utf-8"
```

2. **接收响应时使用 UTF-8 解码**:
```powershell
$bytes = $response.RawContentStream.ToArray()
$utf8String = [System.Text.Encoding]::UTF8.GetString($bytes)
```

3. **完整示例**:
```powershell
$uri = "https://project.feishu.cn/mcp_server/v1?mcpKey=xxx&userKey=xxx"

$body = @{
    jsonrpc = "2.0"
    method = "tools/call"
    params = @{
        name = "create_workitem"
        arguments = @{
            project_key = "your-project-key"
            work_item_type = "story"
            fields = @(
                @{
                    field_key = "name"
                    field_value = "中文标题"  # 中文内容
                }
            )
        }
    }
    id = 1
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri $uri -Method POST `
    -ContentType "application/json; charset=utf-8" `  # 关键！
    -Body $body

# 解码响应
$bytes = $response.RawContentStream.ToArray()
$utf8String = [System.Text.Encoding]::UTF8.GetString($bytes)
```

### MQL 查询失败

1. **检查语法**: 确保使用标准 SQL 语法
2. **字段名称**: 确认字段名正确（如 `state_3` 而不是 `state`）
3. **project_key**: 确保通过参数传递 `project_key`
4. **服务器错误**: `search_by_mql` 工具目前存在服务器端问题，建议直接使用飞书项目网页查询

### 工具不显示

1. 重启 MCP Client
2. 重新加载配置
3. 检查 MCP Server 日志
