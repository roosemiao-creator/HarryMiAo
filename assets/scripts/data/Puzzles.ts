import { Assignment, AttributeCategory, Clue, Entity, GameMode, PuzzleDefinition } from '../core/PuzzleTypes';

type CategorySpec = [string, [string, string, string], [string, string, string]];
/** Compact authoring form used by the content tables below. */
type Theme = [
  title: string,
  subtitle: string,
  entities: [string, string, string],
  entityIcons: [string, string, string],
  categories: [CategorySpec, CategorySpec, CategorySpec],
];

const challengeThemes: Theme[] = [
  ['迷路的小动物', '训练 1：找回三位走失的小伙伴', ['银铃猫', '胡桃兔', '枫叶狐'], ['🐱', '🐰', '🦊'], [['丝带', ['蓝色', '红色', '紫色'], ['🔵', '🔴', '🟣']], ['点心', ['果塔', '蜂蜜饼', '奶酪'], ['🥧', '🍪', '🧀']], ['地点', ['花园', '钟楼', '河岸'], ['🌷', '🕰️', '🏞️']]]],
  ['皇家茶会', '训练 2：确认宾客的茶点', ['露娜', '奥斯卡', '菲恩'], ['👧', '🧑', '👦'], [['茶杯', ['月白', '琥珀', '翠绿'], ['☕', '🍵', '🫖']], ['甜点', ['莓果塔', '云朵糖', '坚果派'], ['🧁', '🍬', '🥮']], ['座位', ['窗边', '壁炉旁', '花架旁'], ['🪟', '🔥', '🌼']]]],
  ['花园信使', '训练 3：分辨三封魔法来信', ['燕子', '松鼠', '刺猬'], ['🐦', '🐿️', '🦔'], [['信封', ['金边', '银边', '藤纹'], ['✉️', '💌', '📨']], ['花朵', ['玫瑰', '铃兰', '鸢尾'], ['🌹', '💮', '🌼']], ['时段', ['清晨', '午后', '黄昏'], ['🌅', '☀️', '🌇']]]],
  ['马厩之谜', '训练 4：为皇家坐骑配对', ['晨星马', '云蹄马', '栗风马'], ['🐴', '🐎', '🦄'], [['鞍具', ['银鞍', '皮鞍', '绒鞍'], ['🪙', '🟤', '🧵']], ['缰绳', ['蓝缎', '红绳', '绿藤'], ['🔵', '🔴', '🟢']], ['路线', ['森林', '石桥', '草坡'], ['🌲', '🌉', '⛰️']]]],
  ['失物招领', '训练 5：归还市集失物', ['裁缝', '面包师', '钟表匠'], ['🧵', '🥖', '⏱️'], [['失物', ['怀表', '针线盒', '面粉袋'], ['⌚', '🧰', '👜']], ['颜色', ['靛蓝', '砖红', '奶白'], ['🔵', '🔴', '⚪']], ['摊位', ['喷泉边', '拱门下', '铃铛街'], ['⛲', '🏛️', '🔔']]]],
  ['月光宴席', '训练 6：布置宴会餐盘', ['白鸽', '夜莺', '孔雀'], ['🕊️', '🐦', '🦚'], [['餐盘', ['星纹', '叶纹', '波纹'], ['⭐', '🍃', '〰️']], ['果酱', ['草莓', '蓝莓', '杏桃'], ['🍓', '🫐', '🍑']], ['桌号', ['一号', '二号', '三号'], ['1️⃣', '2️⃣', '3️⃣']]]],
  ['魔法徽章', '训练 7：找出徽章主人', ['学徒阿诺', '学徒贝拉', '学徒柯林'], ['🧙', '🧚', '🧝'], [['徽章', ['星星', '羽毛', '钥匙'], ['⭐', '🪶', '🔑']], ['法术', ['微光', '清风', '水泡'], ['✨', '🌬️', '🫧']], ['教室', ['塔楼', '温室', '图书馆'], ['🗼', '🌿', '📚']]]],
  ['雨后集市', '训练 8：确认雨伞与货物', ['果农', '花商', '陶匠'], ['🍎', '🌻', '🏺'], [['雨伞', ['黄伞', '蓝伞', '红伞'], ['🟡', '🔵', '🔴']], ['货物', ['苹果', '百合', '花瓶'], ['🍏', '🌸', '🏺']], ['街角', ['北门', '喷泉', '南桥'], ['🚪', '⛲', '🌉']]]],
  ['塔楼访客', '训练 9：记录来访顺序', ['骑士', '诗人', '药师'], ['🛡️', '✒️', '⚗️'], [['凭证', ['羽印', '蜡印', '花印'], ['🪶', '🕯️', '🌸']], ['礼物', ['羽毛笔', '药草', '小盾牌'], ['🖋️', '🌿', '🛡️']], ['时间', ['早晨', '正午', '夜晚'], ['🌄', '🌞', '🌙']]]],
  ['星光试炼', '训练 10：完成侦探毕业考', ['小熊', '小鹿', '小獭'], ['🐻', '🦌', '🦦'], [['灯笼', ['星灯', '月灯', '云灯'], ['🏮', '🌙', '☁️']], ['钥匙', ['铜钥匙', '银钥匙', '木钥匙'], ['🟤', '⚪', '🪵']], ['门扉', ['藤门', '石门', '水门'], ['🌿', '🪨', '💧']]]]
] as Theme[];

const storyThemes: Theme[] = [
  ['胸针失踪', '第一章：王后的月光胸针不见了', ['侍女玛拉', '园丁诺尔', '乐师伊文'], ['👩', '🧑‍🌾', '🎻'], [['去向', ['花园', '舞厅', '塔楼'], ['🌷', '💃', '🗼']], ['物证', ['丝线', '泥土', '乐谱'], ['🧵', '🟫', '🎼']], ['时间', ['清晨', '午后', '深夜'], ['🌅', '☀️', '🌙']]]],
  ['月光胸针', '第一章：沿着物证找回胸针', ['银铃猫', '王后', '信使'], ['🐱', '👑', '📯'], [['发现处', ['玫瑰丛', '喷泉', '石阶'], ['🌹', '⛲', '🪨']], ['包裹', ['蓝布', '红绒', '金纸'], ['🔵', '🔴', '🟡']], ['记号', ['月牙', '羽毛', '花瓣'], ['🌙', '🪶', '🌸']]]],
  ['假面摊位', '第二章：迷雾集市出现了假面客', ['糖果商', '面具匠', '旅人'], ['🍬', '🎭', '🧳'], [['假面', ['狐狸', '乌鸦', '鹿角'], ['🦊', '🐦', '🦌']], ['摊位', ['东街', '圆井', '南门'], ['➡️', '⛲', '🚩']], ['零钱', ['铜币', '银币', '金叶'], ['🟤', '⚪', '🍃']]]],
  ['雾中的脚印', '第二章：确认假面客的离开路线', ['守卫', '卖花女', '邮差'], ['💂', '💐', '📬'], [['脚印', ['尖头靴', '圆头鞋', '木屐'], ['👢', '👞', '🥾']], ['方向', ['北巷', '河边', '钟楼'], ['⬆️', '🏞️', '🕰️']], ['雾色', ['银灰', '浅蓝', '淡紫'], ['⚪', '🔵', '🟣']]]],
  ['古树来信', '第三章：森林古树送来三封密信', ['树灵', '巡林员', '小精灵'], ['🌳', '🧑‍✈️', '🧚'], [['信纸', ['树皮', '苔纹', '花瓣'], ['🪵', '🌿', '🌸']], ['地点', ['林心', '溪谷', '石门'], ['🌲', '🏞️', '🪨']], ['印记', ['露珠', '松果', '萤火'], ['💧', '🌰', '✨']]]],
  ['裂开的地图', '第三章：拼回被篡改的地图', ['制图师', '猎手', '摆渡人'], ['🗺️', '🏹', '🚣'], [['地图角', ['西北', '东北', '南方'], ['↖️', '↗️', '⬇️']], ['道路', ['藤桥', '岩径', '水道'], ['🌉', '🪨', '💧']], ['符号', ['太阳', '月亮', '星星'], ['☀️', '🌙', '⭐']]]],
  ['森林回声', '第三章：找出伪造线索的人', ['乌鸦', '白鹿', '河狸'], ['🐦', '🦌', '🦫'], [['回声', ['三响', '两响', '一响'], ['3️⃣', '2️⃣', '1️⃣']], ['藏处', ['树洞', '芦苇', '岩缝'], ['🕳️', '🎋', '🪨']], ['物件', ['墨瓶', '银铃', '木牌'], ['🖋️', '🔔', '🪵']]]],
  ['钟楼钥匙', '第四章：搜集进入钟楼的钥匙', ['铁匠', '女巫', '学者'], ['⚒️', '🧙‍♀️', '📖'], [['钥匙', ['齿轮钥匙', '藤蔓钥匙', '水晶钥匙'], ['⚙️', '🌿', '💎']], ['楼层', ['底层', '中层', '顶层'], ['1️⃣', '2️⃣', '3️⃣']], ['口令', ['晨星', '暮云', '夜雨'], ['🌟', '☁️', '🌧️']]]],
  ['钟声密码', '第四章：破解钟声留下的密码', ['钟匠', '骑士长', '宫廷医师'], ['🔔', '🛡️', '⚕️'], [['钟声', ['短短长', '长短短', '短长短'], ['🔉', '🔊', '🎵']], ['纸条', ['蓝边', '红边', '绿边'], ['🔵', '🔴', '🟢']], ['位置', ['窗台', '齿轮室', '暗门'], ['🪟', '⚙️', '🚪']]]],
  ['真相之门', '第四章：揭开幕后人的真相', ['摄政大臣', '王室顾问', '图书馆长'], ['🧔', '🧑‍⚖️', '📚'], [['证物', ['黑羽', '旧印章', '密钥'], ['🪶', '🪙', '🔑']], ['动机', ['权力', '复仇', '贪婪'], ['👑', '⚡', '💰']], ['结局', ['认罪', '逃离', '和解'], ['🫡', '🏃', '🤝']]]]
] as Theme[];

function makePuzzle(theme: Theme, mode: GameMode, order: number, chapter?: number): PuzzleDefinition {
  const [title, subtitle, entityNames, entityIcons, categorySpecs] = theme;
  const entities: Entity[] = entityNames.map((name, index) => ({ id: `e${index}`, name, icon: entityIcons[index] }));
  const categories: AttributeCategory[] = categorySpecs.map(([label, options, icons], categoryIndex) => ({
    id: `c${categoryIndex}`,
    label,
    options: options.map((option, index) => ({ id: `o${index}`, label: option, icon: icons[index] })),
  }));
  const solution: Assignment[] = [];
  for (let entityIndex = 0; entityIndex < entities.length; entityIndex += 1) {
    for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex += 1) {
      solution.push({ entityId: entities[entityIndex].id, categoryId: categories[categoryIndex].id, optionId: `o${(entityIndex + categoryIndex + order) % 3}` });
    }
  }
  const clues: Clue[] = solution.map((assignment, index) => {
    const entity = entities.find((item) => item.id === assignment.entityId)!;
    const category = categories.find((item) => item.id === assignment.categoryId)!;
    const option = category.options.find((item) => item.id === assignment.optionId)!;
    return { id: `${mode}-${order}-clue-${index}`, text: `${entity.icon}${entity.name}的${category.label}是${option.icon}${option.label}。`, completesWhen: [assignment] };
  });
  const groups = [clues.slice(0, 2), clues.slice(2, 4), clues.slice(4, 6), clues.slice(6, 9)];
  return {
    id: `${mode}-${String(order).padStart(2, '0')}`,
    mode,
    chapter,
    order,
    title,
    subtitle,
    entities,
    categories,
    solution,
    stages: groups.map((group, index) => ({
      id: `stage-${index + 1}`,
      narrator: index === 0 ? '先从眼前的证词开始。' : index === 3 ? '最后一条证据会指向答案。' : '新的证据送到了！',
      clues: group,
      unlock: index === 0 ? {} : { previousStageComplete: true, requiredCells: groups[index - 1].reduce<Assignment[]>((all, clue) => all.concat(clue.completesWhen), []) },
    })),
    lives: 2,
  };
}

export const CHALLENGE_PUZZLES = challengeThemes.map((theme, index) => makePuzzle(theme, 'challenge', index + 1));
export const STORY_PUZZLES = storyThemes.map((theme, index) => makePuzzle(theme, 'story', index + 1, index < 2 ? 1 : index < 4 ? 2 : index < 7 ? 3 : 4));
export const ALL_PUZZLES = [...CHALLENGE_PUZZLES, ...STORY_PUZZLES];

export const CHAPTER_TITLES = ['失窃的月光胸针', '迷雾集市的假面', '会说话的古树', '钟楼里的真相'];
