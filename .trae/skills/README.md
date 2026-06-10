# 项目技能索引

本目录包含了针对 nextjs-fullstack-web-template 项目的专用技能集合，每个技能都针对特定的开发任务和工作流程。

## 技能列表

### 核心开发技能

1. **[Next.js Component](./nextjs-component/SKILL.md)** - Next.js组件开发
   - Server/Client Component选择
   - 状态管理和数据获取
   - Tailwind CSS样式规范

2. **[tRPC Router](./trpc-router/SKILL.md)** - tRPC路由器管理
   - Procedure定义和输入验证
   - 权限控制和数据库操作
   - 类型安全API开发

3. **[Auth Manager](./auth-manager/SKILL.md)** - 认证授权管理
   - Better-Auth配置和使用
   - 会话管理和权限控制
   - 第三方登录集成

4. **[UI Component](./ui-component/SKILL.md)** - Ant Design UI组件
   - 表单和表格组件开发
   - 布局和交互组件实现
   - 响应式设计模式

### 数据管理技能

5. **[Prisma Manager](./prisma-manager/SKILL.md)** - Prisma数据库管理
   - Schema设计和修改
   - 数据库同步和迁移
   - 查询优化和关系处理

6. **[Database Migrator](./database-migrator/SKILL.md)** - 数据库迁移管理
   - 迁移文件创建和应用
   - 版本控制和冲突解决
   - 生产环境部署策略

### 质量保证技能

7. **[Code Reviewer](./code-reviewer/SKILL.md)** - 代码审查和质量检查
   - 代码规范检查
   - 最佳实践验证
   - 潜在问题识别

8. **[Testing Manager](./testing-manager/SKILL.md)** - 测试管理
   - 单元测试和集成测试
   - E2E测试配置
   - 测试覆盖率管理

9. **[Debugging](./debugging/SKILL.md)** - 调试和问题解决
   - 错误分析和解决
   - 性能问题诊断
   - 网络请求调试

### 运维和安全技能

10. **[Deployment Manager](./deployment-manager/SKILL.md)** - 部署管理
    - 构建优化和配置
    - 多平台部署策略
    - 环境变量管理

11. **[Security Manager](./security-manager/SKILL.md)** - 安全管理
    - 认证授权安全
    - 输入验证和防护
    - 漏洞预防和审计

12. **[Performance Optimizer](./performance-optimizer/SKILL.md)** - 性能优化
    - 代码分割和懒加载
    - 缓存策略优化
    - 图片和字体优化

### 架构和管理技能

13. **[Architecture Guide](./architecture-guide/SKILL.md)** - 架构指导
    - 技术选型和模块设计
    - 代码组织和最佳实践
    - 设计模式应用

14. **[Project Setup](./project-setup/SKILL.md)** - 项目配置
    - 环境变量配置
    - 依赖管理和工具配置
    - 开发环境设置

## 使用指南

### 技能调用方式

当需要执行特定任务时，可以引用相应的技能：

```
请使用 [技能名称] 技能来帮助我完成 [具体任务]
```

例如：
- "请使用 Auth Manager 技能帮我配置GitHub登录"
- "请使用 tRPC Router 技能创建新的API端点"
- "请使用 Performance Optimizer 技能优化页面加载速度"

### 技能组合使用

复杂任务通常需要多个技能配合：

1. **新功能开发**：
   - Architecture Guide → tRPC Router → Next.js Component → UI Component

2. **数据库变更**：
   - Prisma Manager → Database Migrator → Code Reviewer

3. **安全加固**：
   - Security Manager → Auth Manager → Code Reviewer → Testing Manager

4. **性能优化**：
   - Performance Optimizer → Debugging → Code Reviewer

### 技能更新维护

- 定期审查技能内容的有效性
- 根据项目演进更新最佳实践
- 添加新的技能和模式
- 移除过时或不适用的内容

## 项目技术栈概览

```
前端框架: Next.js 15 + React 19
后端API: tRPC 11
数据库: Prisma + SQLite/PostgreSQL
认证: Better-Auth
UI组件: Ant Design 6 + Tailwind CSS 4
语言: TypeScript 5
包管理: pnpm
```

## 贡献指南

如需添加新技能或改进现有技能：

1. 遵循统一的技能文档格式
2. 提供具体的代码示例
3. 包含最佳实践和注意事项
4. 添加相关技能的交叉引用
5. 确保内容与项目技术栈一致

## 版本信息

- 最后更新: 2024年
- 适用项目版本: nextjs-fullstack-web-template v0.1.0
- 维护者: 项目开发团队
