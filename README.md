# 童话侦探社

一个使用 **Cocos Creator 3.x + TypeScript** 制作的原创竖屏逻辑解谜原型。游戏以“对象 × 属性”表格为核心；玩家在每一批已知证据完成后，才会收到下一批线索。

## 已实现

- 1080 × 1920（9:16）设计尺寸的竖屏 UI，适合主流手机全面屏；关键交互位于安全区内。
- 首页、闯关/故事模式选择、顺序解锁的关卡簿、逻辑表格、候选项弹窗、失败与通关弹窗。
- 10 个皇家侦探训练关 + 10 个故事关；故事按 2 / 2 / 3 / 3 关分为四章。
- 每关有 9 个答案格和 4 批线索（2 / 2 / 2 / 3）；后一批必须在前一批所有关联答案正确后才出现。
- 即时错误扣心、两点生命、提示、擦除、LocalStorage 进度保存与顺序解锁。

## 运行

1. 使用 Cocos Creator 3.8 或更高版本导入此目录。
2. 直接运行 `assets/scenes/Main.scene`；它已配置为项目启动场景，并自动在 Canvas 上加载 `GameApp`。
3. 需要 Web 包时，在 Creator 的构建面板选择 Web Mobile；本地已验证该构建路径。

界面由 `GameApp` 运行时创建；原创首页侦探图与剧情地图位于 `assets/resources/art/`，可在不改变关卡数据和逻辑引擎的情况下替换为正式美术。

## 数据扩展

`assets/scripts/data/Puzzles.ts` 中的 `makePuzzle` 与 `Theme` 是关卡内容入口。每个关卡最终生成：

- `solution`：唯一答案；
- `stages`：按批出现的线索；
- `unlock.requiredCells` 与 `previousStageComplete`：线索逐步出现的精确条件。

运行 `npm run validate:puzzles` 可检查 20 关数量与逐步线索结构。
