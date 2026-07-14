import { _decorator, Color, Component, Graphics, Label, Node, UITransform } from 'cc';
import { PuzzleEngine } from '../core/PuzzleEngine';
import { ProgressStore } from '../core/ProgressStore';
import { Assignment, AttributeCategory, CellRef, GameMode, PuzzleDefinition } from '../core/PuzzleTypes';
import { CHALLENGE_PUZZLES, CHAPTER_TITLES, STORY_PUZZLES } from '../data/Puzzles';
const { ccclass } = _decorator;

const CREAM = new Color('#FFF9E8');
const INK = new Color('#443527');
const BLUE = new Color('#4A94B8');
const GREEN = new Color('#77AD66');
const GOLD = new Color('#E8BA58');
const RED = new Color('#D8655C');
const PANEL = new Color('#F0D7A9');

@ccclass('GameApp')
export class GameApp extends Component {
  private readonly store = new ProgressStore();
  private engine?: PuzzleEngine;
  private mode: GameMode = 'challenge';
  private erasing = false;
  private toast = '';

  start(): void { this.showHome(); }

  private clear(): void { this.node.removeAllChildren(); }
  private panel(parent: Node, x: number, y: number, width: number, height: number, color = PANEL, radius = 20): Node {
    const node = new Node('panel');
    parent.addChild(node);
    node.setPosition(x, y);
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = color;
    graphics.roundRect(-width / 2, -height / 2, width, height, radius);
    graphics.fill();
    return node;
  }
  private text(parent: Node, value: string, x: number, y: number, width: number, height: number, size = 34, color = INK): Node {
    const node = new Node('text');
    parent.addChild(node);
    node.setPosition(x, y);
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height);
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
  private button(parent: Node, value: string, x: number, y: number, width: number, height: number, onClick: () => void, color = BLUE): Node {
    const button = this.panel(parent, x, y, width, height, color);
    this.text(button, value, 0, 0, width - 12, height - 8, 32, Color.WHITE);
    button.on(Node.EventType.TOUCH_END, onClick, this);
    return button;
  }
  private background(title: string, subtitle = ''): Node {
    this.clear();
    const root = this.panel(this.node, 0, 0, 1080, 1920, CREAM, 0);
    this.text(root, '🕵️ 童话侦探社', 0, 825, 840, 80, 50, INK);
    this.text(root, title, 0, 735, 900, 68, 42, INK);
    if (subtitle) this.text(root, subtitle, 0, 680, 900, 52, 26, new Color('#75604B'));
    return root;
  }

  private showHome(): void {
    const root = this.background('推理、发现、揭开童话真相', '每次只会拿到刚好足够的新证据');
    this.panel(root, 0, 300, 840, 390, new Color('#F5E4BF'));
    this.text(root, '🔎', 0, 400, 240, 180, 150);
    this.text(root, '找出每个人、每件物品与每条线索的正确关系。', 0, 245, 700, 80, 30);
    this.button(root, '闯关训练', 0, 40, 640, 112, () => this.showLevelSelect('challenge'), GREEN);
    this.button(root, '故事模式', 0, -110, 640, 112, () => this.showLevelSelect('story'), GOLD);
    this.text(root, `💡 ${this.store.hints}    🧽 ${this.store.erasers}`, 0, -280, 520, 60, 30, BLUE);
  }

  private showLevelSelect(mode: GameMode): void {
    this.mode = mode;
    const puzzles = mode === 'challenge' ? CHALLENGE_PUZZLES : STORY_PUZZLES;
    const root = this.background(mode === 'challenge' ? '皇家侦探训练' : '童话案件簿', mode === 'challenge' ? '完成前一关即可开启下一项训练' : '按案件顺序揭开钟楼真相');
    this.button(root, '‹ 返回', -400, 825, 190, 70, () => this.showHome(), new Color('#86715B'));
    let y = 540;
    puzzles.forEach((puzzle, index) => {
      if (mode === 'story' && (index === 0 || [2, 4, 7].includes(index))) {
        this.text(root, `第${puzzle.chapter}章 · ${CHAPTER_TITLES[(puzzle.chapter ?? 1) - 1]}`, 0, y + 70, 850, 50, 28, new Color('#8B5F43'));
      }
      const unlocked = this.store.isUnlocked(puzzle, puzzles);
      const completed = this.store.isComplete(puzzle.id);
      const label = `${completed ? '✓ ' : unlocked ? '' : '🔒 '}${puzzle.order}. ${puzzle.title}`;
      this.button(root, label, 0, y, 800, 78, () => { if (unlocked) this.startPuzzle(puzzle); }, unlocked ? (completed ? GREEN : BLUE) : new Color('#B5A795'));
      y -= 106;
    });
  }

  private startPuzzle(puzzle: PuzzleDefinition): void {
    this.engine = new PuzzleEngine(puzzle);
    this.erasing = false;
    this.toast = puzzle.stages[0].narrator ?? '';
    this.renderPuzzle();
  }

  private renderPuzzle(): void {
    const engine = this.engine!;
    const puzzle = engine.puzzle;
    const root = this.background(puzzle.title, puzzle.subtitle);
    this.button(root, '‹', -470, 825, 78, 70, () => this.showLevelSelect(this.mode), new Color('#86715B'));
    this.text(root, `生命 ${'♥'.repeat(engine.lives)}${'♡'.repeat(puzzle.lives - engine.lives)}`, 180, 825, 310, 60, 30, RED);
    this.text(root, `线索 ${engine.unlockedClueCount}/${engine.totalClueCount}`, 0, 625, 420, 55, 30, GREEN);

    const grid = this.panel(root, 0, 285, 1000, 620, new Color('#FFFDF4'));
    const left = -330;
    const colWidth = 220;
    puzzle.entities.forEach((entity, index) => this.text(grid, `${entity.icon}\n${entity.name}`, left + (index + 1) * colWidth, 250, 200, 100, 27));
    puzzle.categories.forEach((category, row) => {
      const y = 120 - row * 155;
      this.text(grid, category.label, left, y, 160, 100, 27, new Color('#77583E'));
      puzzle.entities.forEach((entity, col) => {
        const cell = { entityId: entity.id, categoryId: category.id };
        const value = engine.getAnswer(cell);
        const option = category.options.find((item) => item.id === value);
        const locked = !!(puzzle.initialAssignments ?? []).find((item) => item.entityId === cell.entityId && item.categoryId === cell.categoryId);
        this.button(grid, option ? `${option.icon}\n${option.label}` : '？', left + (col + 1) * colWidth, y, 190, 120, () => this.handleCell(cell, category), option ? (locked ? new Color('#D8E9C9') : new Color('#C6DEF0')) : new Color('#ECE5D5'));
      });
    });

    const cluePanel = this.panel(root, 0, -420, 1000, 410, new Color('#A77858'));
    this.text(cluePanel, `第 ${engine.activeStageIndex + 1} 批证据`, -340, 165, 260, 45, 26, Color.WHITE);
    this.text(cluePanel, engine.activeStage.narrator ?? '', 50, 165, 600, 45, 24, new Color('#FFF0D0'));
    engine.shownClues.forEach((clue, index) => {
      const complete = engine.completedClueIds.has(clue.id);
      this.panel(cluePanel, 0, 85 - index * 105, 900, 82, complete ? new Color('#A9C991') : new Color('#FFF2D1'));
      this.text(cluePanel, `${complete ? '✓ ' : '• '}${clue.text}`, 0, 85 - index * 105, 850, 70, 25, complete ? new Color('#3A643A') : INK);
    });
    this.button(root, `💡 提示 ${this.store.hints}`, -250, -720, 330, 82, () => this.useHint(), GOLD);
    this.button(root, `${this.erasing ? '正在擦除' : '🧽 擦除'} ${this.store.erasers}`, 180, -720, 360, 82, () => { this.erasing = !this.erasing; this.renderPuzzle(); }, this.erasing ? RED : BLUE);
    if (this.toast) this.text(root, this.toast, 0, -825, 960, 52, 26, new Color('#71553D'));
  }

  private handleCell(cell: CellRef, category: AttributeCategory): void {
    const engine = this.engine!;
    if (this.erasing) {
      if (engine.erase(cell)) this.toast = '已擦除这项记录。'; else this.toast = '这项是已知证据，不能擦除。';
      this.renderPuzzle();
      return;
    }
    if (engine.getAnswer(cell)) return;
    const root = this.node.children[0];
    const shade = this.panel(root, 0, 0, 1080, 1920, new Color(0, 0, 0, 150), 0);
    const dialog = this.panel(shade, 0, 0, 900, 520, CREAM);
    this.text(dialog, `选择${category.label}`, 0, 180, 700, 60, 40);
    category.options.forEach((option, index) => this.button(dialog, `${option.icon} ${option.label}`, 0, 70 - index * 120, 650, 90, () => this.choose({ ...cell, optionId: option.id }), BLUE));
    this.button(dialog, '取消', 0, -190, 280, 65, () => this.renderPuzzle(), new Color('#86715B'));
  }

  private choose(assignment: Assignment): void {
    const priorStage = this.engine!.activeStageIndex;
    const result = this.engine!.fill(assignment);
    if (result === 'incorrect') this.toast = this.engine!.isGameOver ? '线索被打乱了，重新整理案件吧。' : '这条记录不对，失去一颗生命。';
    else if (result === 'complete') { this.completePuzzle(); return; }
    else if (result === 'correct') this.toast = this.engine!.activeStageIndex > priorStage ? '新的证据送到了！' : '记录正确。继续核对线索。';
    this.renderPuzzle();
    if (this.engine!.isGameOver) this.showFailure();
  }

  private useHint(): void {
    const hint = this.engine!.getHint();
    if (!hint || !this.store.consumeHint()) { this.toast = '没有可用提示了。'; this.renderPuzzle(); return; }
    const result = this.engine!.fill(hint);
    this.toast = result === 'complete' ? '提示完成了最后一条记录！' : '提示已补全一项可确定的记录。';
    if (result === 'complete') { this.completePuzzle(); return; }
    this.renderPuzzle();
  }

  private showFailure(): void {
    const root = this.node.children[0];
    const overlay = this.panel(root, 0, 0, 1080, 1920, new Color(0, 0, 0, 150), 0);
    this.panel(overlay, 0, 0, 820, 480, CREAM);
    this.text(overlay, '证据链断开了', 0, 105, 700, 70, 46, RED);
    this.text(overlay, '重新整理线索，再试一次。', 0, 25, 700, 55, 30);
    this.button(overlay, '重新调查', 0, -120, 520, 95, () => this.startPuzzle(this.engine!.puzzle), BLUE);
  }

  private completePuzzle(): void {
    const puzzle = this.engine!.puzzle;
    this.store.complete(puzzle);
    const root = this.node.children[0];
    const overlay = this.panel(root, 0, 0, 1080, 1920, new Color(0, 0, 0, 150), 0);
    this.panel(overlay, 0, 0, 860, 530, CREAM);
    this.text(overlay, '案件解决！', 0, 135, 700, 75, 50, GREEN);
    this.text(overlay, puzzle.mode === 'story' ? '新的剧情已解锁。' : '侦探训练完成。', 0, 55, 700, 55, 30);
    this.button(overlay, '返回关卡簿', 0, -105, 570, 95, () => this.showLevelSelect(puzzle.mode), GREEN);
  }
}
