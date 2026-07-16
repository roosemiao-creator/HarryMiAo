# 项目交接：童话侦探社

## 云端仓库

https://github.com/roosemiao-creator/HarryMiAo

## 在新电脑继续

```bash
git clone https://github.com/roosemiao-creator/HarryMiAo.git
```

使用 Cocos Creator **3.8.3** 或兼容的 3.x 版本打开根目录，运行 `assets/scenes/Main.scene`。

## 当前完成状态

- 可运行的 Cocos Creator TypeScript 原型，设计尺寸 1080×1920。
- 两种模式：10 个闯关训练关与 10 个故事关；故事分 4 章顺序解锁。
- 推理表格、分批线索、即时判错扣心、提示、擦除、LocalStorage 进度均已实现。
- 主场景、Canvas、相机和启动场景均已配置；不要手动新建入口场景。
- 原创首页侦探图和故事地图在 `assets/resources/art/`。
- 已用 Cocos Creator 3.8.3 构建验证，最后一次构建日志无 `Missing class`、脚本失效或关卡初始化错误。

## 重要文件

- `assets/scenes/Main.scene`：游戏启动场景。
- `assets/scripts/ui/GameApp.ts`：所有运行时 UI 和交互。
- `assets/scripts/core/PuzzleEngine.ts`：解谜和阶段线索逻辑。
- `assets/scripts/data/Puzzles.ts`：20 个关卡的内容数据。

## 下一步建议

1. 在 Android 与 iPhone 真机上检查安全区、触控与文本字号。
2. 把原型插画和 Emoji 逐步替换为正式、统一的商业美术资源。
3. 增加音效、设置页、埋点、隐私文档及商店包配置，进入正式发行准备。

## 素材说明

`5d71cc677bf389d3b74a99182e13051a.mp4` 是竞品参考视频，已同步。它约 53MB；GitHub 已接受本次上传，但后续大视频建议改用 Git LFS。
