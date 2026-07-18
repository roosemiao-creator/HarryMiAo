import { _decorator, Color, Component, Graphics, ImageAsset, Label, Node, resources, Sprite, SpriteFrame, Texture2D, tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { PuzzleEngine } from '../core/PuzzleEngine';
import { ProgressStore } from '../core/ProgressStore';
import { SoundController } from '../core/SoundController';
import { Assignment, AttributeCategory, CellRef, GameMode, PuzzleDefinition } from '../core/PuzzleTypes';
import { CHALLENGE_PUZZLES, CHAPTER_TITLES, STORY_PUZZLES } from '../data/Puzzles';
const { ccclass } = _decorator;

const BG = new Color('#FFF8E9');
const SURFACE = new Color('#FFFFFF');
const INK = new Color('#2F3B4A');
const MUTED = new Color('#778294');
const PRIMARY = new Color('#167887');
const PRIMARY_DARK = new Color('#0E4857');
const MINT = new Color('#398E83');
const GOLD = new Color('#C99237');
const CORAL = new Color('#E67670');
const SAND = new Color('#EFE7D8');
const CLUE_BG = new Color('#805C4C');

@ccclass('GameApp')
export class GameApp extends Component {
  private readonly store = new ProgressStore();
  private readonly sounds = new SoundController();
  private engine?: PuzzleEngine;
  private mode: GameMode = 'challenge';
  private view: 'home' | 'levels' | 'puzzle' = 'home';
  private levelPage = 0;
  private erasing = false;
  private toast = '';
  /** Canvas also owns Camera; only this dynamic root may be destroyed. */
  private screen?: Node;

  start(): void { this.showHome(); }

  private clear(): void {
    if (this.screen?.isValid) this.screen.destroy();
    this.screen = undefined;
  }

  private panel(parent: Node, x: number, y: number, width: number, height: number, color = SURFACE, radius = 26): Node {
    const node = new Node('panel');
    parent.addChild(node);
    node.setPosition(x, y);
    node.addComponent(UITransform).setContentSize(width, height);
    const graphic = node.addComponent(Graphics);
    graphic.fillColor = color;
    radius > 0 ? graphic.roundRect(-width / 2, -height / 2, width, height, radius) : graphic.rect(-width / 2, -height / 2, width, height);
    graphic.fill();
    return node;
  }

  private text(parent: Node, value: string, x: number, y: number, width: number, height: number, size = 30, color = INK): Node {
    const node = new Node('label');
    parent.addChild(node);
    node.setPosition(x, y);
    node.addComponent(UITransform).setContentSize(width, height);
    const label = node.addComponent(Label);
    label.string = value;
    label.fontSize = size;
    label.lineHeight = size + 8;
    label.color = color;
    label.horizontalAlign = Label.HorizontalAlign.CENTER;
    label.verticalAlign = Label.VerticalAlign.CENTER;
    label.overflow = Label.Overflow.SHRINK;
    return node;
  }

  private pop(node: Node): void {
    node.setScale(0.94, 0.94, 1);
    tween(node).to(0.16, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start();
  }

  /** Short, springy entrances give every screen a deliberate game-like rhythm. */
  private reveal(node: Node, delay = 0): void {
    const opacity = node.getComponent(UIOpacity) ?? node.addComponent(UIOpacity);
    opacity.opacity = 0;
    node.setScale(0.86, 0.86, 1);
    tween(node).delay(delay).to(0.22, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start();
    tween(opacity).delay(delay).to(0.15, { opacity: 255 }).start();
  }

  private button(parent: Node, value: string, x: number, y: number, width: number, height: number, onClick: () => void, color = PRIMARY, fontSize = 30): Node {
    const button = this.panel(parent, x, y, width, height, color, 22);
    this.text(button, value, 0, 0, width - 18, height - 10, fontSize, Color.WHITE);
    button.on(Node.EventType.TOUCH_START, () => tween(button).to(0.07, { scale: new Vec3(0.94, 0.94, 1) }).start(), this);
    button.on(Node.EventType.TOUCH_CANCEL, () => button.setScale(1, 1, 1), this);
    button.on(Node.EventType.TOUCH_END, () => { tween(button).to(0.14, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start(); this.sounds.touch(); onClick(); }, this);
    return button;
  }

  private chip(parent: Node, value: string, x: number, y: number, width: number, color: Color, textColor = Color.WHITE): Node {
    const chip = this.panel(parent, x, y, width, 52, color, 26);
    this.text(chip, value, 0, 0, width - 14, 42, 23, textColor);
    return chip;
  }

  private baseScreen(title: string, subtitle = ''): Node {
    this.clear();
    // Do not put a Graphics component on the root. A root renderer is drawn
    // above asynchronously loaded child sprites on some Cocos UI batches.
    const root = new Node('GameRoot');
    this.node.addChild(root);
    root.addComponent(UITransform).setContentSize(1080, 1920);
    root.name = 'GameRoot';
    this.screen = root;
    // Fallback colour is a child, so artwork can be layered directly above it.
    this.panel(root, 0, 0, 1080, 1920, BG, 0);
    // Page artwork owns the chrome. These are transparent interaction and
    // text layers placed inside its title cartouche, rather than a second UI.
    this.chip(root, '童话侦探社', -300, 800, 210, PRIMARY_DARK);
    this.button(root, this.sounds.enabled ? '声音 开' : '声音 关', 385, 800, 150, 54, () => { this.sounds.toggle(); this.renderCurrentScreen(); }, this.sounds.enabled ? MINT : new Color('#565C6B'), 21);
    this.text(root, title, 0, 806, 520, 56, 40, new Color('#FFF1C9'));
    if (subtitle) this.text(root, subtitle, 0, 748, 640, 36, 21, new Color('#D8E5E8'));
    return root;
  }

  private art(parent: Node, resourcePath: string, x: number, y: number, width: number, height: number): void {
    // PNG files in a resources folder are imported as ImageAsset on all 3.x
    // targets. Converting explicitly avoids the silent Texture2D redirect
    // failure that occurred in preview on this project.
    resources.load(resourcePath, ImageAsset, (error, imageAsset) => {
      if (error || !imageAsset || !parent.isValid) {
        // Keep this diagnostic in the browser console if a future asset is moved.
        console.warn(`[Art] Unable to load ${resourcePath}`, error);
        return;
      }
      const image = new Node('art');
      parent.addChild(image);
      image.setPosition(x, y);
      // Background colour is child 0; illustration belongs immediately above it.
      image.setSiblingIndex(1);
      image.addComponent(UITransform).setContentSize(width, height);
      const texture = new Texture2D(); texture.image = imageAsset;
      const frame = new SpriteFrame(); frame.texture = texture;
      const sprite = image.addComponent(Sprite);
      sprite.sizeMode = Sprite.SizeMode.CUSTOM;
      sprite.spriteFrame = frame;
      const opacity = image.addComponent(UIOpacity); opacity.opacity = 0;
      tween(opacity).to(0.3, { opacity: 255 }).start();
    });
  }

  private showHome(): void {
    this.view = 'home';
    this.levelPage = 0;
    const root = this.baseScreen('欢迎回来，侦探', '从一条线索开始，拼出整个真相。');
    // The case map is deliberately visible on launch, not hidden behind a later menu.
    this.art(root, 'art/ui-home-v2', 0, 0, 1080, 1920);
    const card = this.panel(root, 0, 230, 840, 330, new Color(255, 255, 255, 0), 32); this.pop(card);
    this.text(card, '案件档案已整理完毕', 0, 92, 720, 52, 34);
    this.text(card, '观察 · 排除 · 关联', 0, 37, 720, 40, 25, MUTED);
    this.button(card, '开始训练', 0, -65, 650, 94, () => this.showLevelSelect('challenge'), PRIMARY, 32);
    this.button(root, '进入故事案件', 0, -255, 650, 94, () => this.showLevelSelect('story'), PRIMARY_DARK, 32);
    this.chip(root, `提示 ${this.store.hints}`, -150, -385, 230, new Color('#0B6670'), new Color('#FFF4CF'));
    this.chip(root, `擦除 ${this.store.erasers}`, 150, -385, 230, new Color('#45315E'), new Color('#FFF4CF'));
  }

  private renderCurrentScreen(): void {
    if (this.view === 'puzzle' && this.engine) this.renderPuzzle();
    else if (this.view === 'levels') this.showLevelSelect(this.mode);
    else this.showHome();
  }

  private showLevelSelect(mode: GameMode): void {
    if (this.mode !== mode) this.levelPage = 0;
    this.view = 'levels';
    this.mode = mode;
    const puzzles = mode === 'challenge' ? CHALLENGE_PUZZLES : STORY_PUZZLES;
    const root = this.baseScreen(mode === 'challenge' ? '侦探训练' : '故事案件簿', mode === 'challenge' ? '每一关都会加入更多交叉关系。' : '顺着案件线索，接近钟楼的真相。');
    this.art(root, 'art/ui-level-select-v2', 0, 0, 1080, 1920);
    this.button(root, '返回', -430, 855, 145, 58, () => this.showHome(), PRIMARY_DARK, 22);
    const pageSize = 8;
    const start = this.levelPage * pageSize;
    const visible = puzzles.slice(start, start + pageSize);
    let y = 520;
    visible.forEach((puzzle, localIndex) => {
      const index = start + localIndex;
      if (mode === 'story' && (index === 0 || [2, 4, 7].includes(index))) this.text(root, `第${puzzle.chapter}章 · ${CHAPTER_TITLES[(puzzle.chapter ?? 1) - 1]}`, 0, y + 60, 760, 34, 23, PRIMARY_DARK);
      const unlocked = this.store.isUnlocked(puzzle, puzzles);
      const done = this.store.isComplete(puzzle.id);
      const title = `${done ? '✓ ' : unlocked ? '' : '🔒 '}${String(puzzle.order).padStart(2, '0')}  ${puzzle.title}`;
      const color = unlocked ? (done ? MINT : PRIMARY) : new Color('#B9B5AE');
      const levelButton = this.button(root, title, 0, y, 860, 74, () => { if (unlocked) this.startPuzzle(puzzle); }, color, 27);
      this.reveal(levelButton, index * 0.045);
      y -= 164;
    });
    if (start > 0) this.button(root, '上一页', -210, -820, 230, 62, () => { this.levelPage -= 1; this.showLevelSelect(mode); }, PRIMARY_DARK, 22);
    if (start + pageSize < puzzles.length) this.button(root, '下一页', 210, -820, 230, 62, () => { this.levelPage += 1; this.showLevelSelect(mode); }, PRIMARY, 22);
  }

  private startPuzzle(puzzle: PuzzleDefinition): void {
    this.view = 'puzzle';
    this.engine = new PuzzleEngine(puzzle);
    this.erasing = false;
    this.toast = puzzle.stages[0].narrator ?? '';
    this.renderPuzzle(true);
  }

  private renderPuzzle(animate = false): void {
    const engine = this.engine!;
    const puzzle = engine.puzzle;
    const root = this.baseScreen(puzzle.title, puzzle.subtitle);
    this.art(root, 'art/ui-gameplay-v2', 0, 0, 1080, 1920);
    this.button(root, '‹', -470, 820, 70, 62, () => this.showLevelSelect(this.mode), new Color('#95A1AC'), 38);
    this.chip(root, `难度 ${puzzle.difficulty}`, -276, 692, 170, GOLD, INK);
    this.chip(root, `线索 ${engine.unlockedClueCount}/${engine.totalClueCount}`, -62, 692, 205, new Color('#D9EBD6'), new Color('#3B7957'));
    this.chip(root, `♥ ${engine.lives}/${puzzle.lives}`, 220, 692, 160, new Color('#F7D7D4'), CORAL);

    const grid = this.panel(root, 0, 265, 1010, 690, new Color(255, 255, 255, 0), 30); if (animate) this.pop(grid);
    const labelX = -382; const colWidth = 232;
    puzzle.entities.forEach((entity, col) => this.text(grid, `${entity.icon}\n${entity.name}`, labelX + (col + 1) * colWidth, 265, 205, 96, 27));
    puzzle.categories.forEach((category, row) => {
      const y = 100 - row * 175;
      this.chip(grid, category.label, labelX, y, 148, new Color('#F6F0E6'), INK);
      puzzle.entities.forEach((entity, col) => {
        const cell = { entityId: entity.id, categoryId: category.id };
        const answer = engine.getAnswer(cell);
        const option = category.options.find((item) => item.id === answer);
        const fixed = !!(puzzle.initialAssignments ?? []).find((item) => item.entityId === cell.entityId && item.categoryId === cell.categoryId);
        this.button(grid, option ? `${option.icon} ${option.label}` : '选择', labelX + (col + 1) * colWidth, y, 205, 108, () => this.handleCell(cell, category), option ? (fixed ? new Color('#B9DCC3') : new Color('#C6E4F0')) : SAND, 25);
      });
    });

    const cluePanel = this.panel(root, 0, -465, 1010, 390, new Color(57, 34, 47, 205), 30);
    this.chip(cluePanel, `证据批次 ${engine.activeStageIndex + 1}`, -330, 151, 245, new Color('#A87D63'));
    this.text(cluePanel, engine.activeStage.narrator ?? '', 100, 151, 590, 44, 24, new Color('#FFF0D0'));
    const clues = engine.shownClues;
    if (clues.length === 0) this.text(cluePanel, '所有证据都已被串联，完成表格即可结案。', 0, 0, 840, 60, 27, Color.WHITE);
    clues.forEach((clue, index) => {
      const y = 66 - index * 95;
      const card = this.panel(cluePanel, 0, y, 910, 74, new Color('#FFF8E6'), 18);
      if (animate) this.reveal(card, 0.08 + index * 0.07);
      this.text(card, clue.text, 0, 0, 860, 62, 23, INK);
    });
    this.button(root, `提示  ${this.store.hints}`, -210, -742, 390, 82, () => this.useHint(), GOLD, 28);
    this.button(root, this.erasing ? '结束擦除' : `擦除  ${this.store.erasers}`, 220, -742, 390, 82, () => { this.erasing = !this.erasing; this.toast = this.erasing ? '点选一格以擦除自己的记录。' : ''; this.renderPuzzle(); }, this.erasing ? CORAL : PRIMARY, 28);
    if (this.toast) this.text(root, this.toast, 0, -845, 960, 38, 23, MUTED);
  }

  private handleCell(cell: CellRef, category: AttributeCategory): void {
    const engine = this.engine!;
    if (this.erasing) { this.toast = engine.erase(cell) ? '已擦除这项记录。' : '已知证据不能擦除。'; this.renderPuzzle(); return; }
    if (engine.getAnswer(cell)) return;
    const root = this.screen!;
    const shade = this.panel(root, 0, 0, 1080, 1920, new Color(20, 28, 38, 175), 0);
    const dialog = this.panel(shade, 0, 0, 900, 620, new Color('#FFFDF8'), 34); this.pop(dialog);
    this.text(dialog, `选择${category.label}`, 0, 225, 720, 60, 38);
    this.text(dialog, '根据当前证据作出判断', 0, 172, 620, 34, 22, MUTED);
    category.options.forEach((option, index) => this.button(dialog, `${option.icon}  ${option.label}`, 0, 75 - index * 105, 650, 82, () => this.choose({ ...cell, optionId: option.id }), PRIMARY, 28));
    this.button(dialog, '取消', 0, -235, 250, 62, () => this.renderPuzzle(), new Color('#9A8A77'), 24);
  }

  private choose(assignment: Assignment): void {
    const priorStage = this.engine!.activeStageIndex;
    const result = this.engine!.fill(assignment);
    if (result === 'incorrect') { this.sounds.wrong(); this.toast = this.engine!.isGameOver ? '证据链被打乱了，重新调查吧。' : '这项推断不成立，失去一颗生命。'; }
    else if (result === 'complete') { this.completePuzzle(); return; }
    else if (result === 'correct') { this.sounds.correct(); if (this.engine!.activeStageIndex > priorStage) this.sounds.reveal(); this.toast = this.engine!.activeStageIndex > priorStage ? '新的关系证据已送达。' : '记录正确，继续串联线索。'; }
    this.renderPuzzle(true);
    if (this.engine!.isGameOver) this.showFailure();
  }

  private useHint(): void {
    const hint = this.engine!.getHint();
    if (!hint || !this.store.consumeHint()) { this.toast = '没有可用提示了。'; this.renderPuzzle(); return; }
    const result = this.engine!.fill(hint);
    this.toast = result === 'complete' ? '最后一项记录已补全！' : '提示补全了一项当前可推导的记录。';
    if (result === 'complete') { this.completePuzzle(); return; }
    this.renderPuzzle(true);
  }

  private showFailure(): void { this.showOutcome('证据链断开了', '整理已知关系后，再次挑战案件。', '重新调查', CORAL, () => this.startPuzzle(this.engine!.puzzle)); }
  private completePuzzle(): void { const puzzle = this.engine!.puzzle; this.store.complete(puzzle); this.showOutcome('案件解决！', puzzle.mode === 'story' ? '新的剧情档案已经解锁。' : '训练完成，下一关会加入更多关联线索。', '返回案件簿', MINT, () => this.showLevelSelect(puzzle.mode)); }

  private showOutcome(title: string, body: string, action: string, color: Color, callback: () => void): void {
    const shade = this.panel(this.screen!, 0, 0, 1080, 1920, new Color(20, 28, 38, 175), 0);
    const dialog = this.panel(shade, 0, 0, 860, 470, new Color('#FFFDF8'), 34); this.pop(dialog);
    this.text(dialog, title, 0, 105, 700, 72, 48, color);
    this.text(dialog, body, 0, 25, 700, 70, 28, INK);
    this.button(dialog, action, 0, -125, 540, 86, callback, color, 30);
  }
}
