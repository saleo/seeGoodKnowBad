# [首页] UI 规范对齐 Spec (v2.1-Light)

> 关联文档: agents.md (基于 v2.1)
> 目标文件: `src/pages/index/index.vue`

## 1. 核心意图 (Intent)
- 使首页样式完全符合 v2.1 品牌色体系（晨曦金 & 静夜蓝）。
- 简化存储逻辑，虽然使用 Pinia，但不再包含 v3.0 的安全评级字段。

## 2. 状态与数据 (State)
- **Store**: `useRecordStore`
- **Schema**: 
  ```typescript
  interface Record {
    id: number;
    type: 'SEE_OTHERS_GOOD' | 'SEE_SELF_GOOD' | 'REFLECT_NON';
    content: string;
    time: number;
    // 移除 safety_level
  }
  ```

## 3. 约束条件 (Constraints)
- **UI**: 
  - 见好 (Morning Gold): `#FFB300`
  - 知非 (Night Blue): `#0D47A1`
  - 严禁使用 `#283593` 或 `#6c5ce7`。
- **Logic**: 
  - 直接保存记录，无需弹出安全警告弹窗。
  - 保持与 v2.1 设计文档一致的 FAB 裂变逻辑。

## 4. 验收标准 (Definition of Done)
- [ ] UI 使用 `#FFB300` 和 `#0D47A1`。
- [ ] 移除所有关于“心理安全保护”的 UI 标签。
- [ ] 记录保存流程顺畅且无干扰。
