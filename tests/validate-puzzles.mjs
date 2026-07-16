import assert from 'assert';
import { readFileSync } from 'fs';

const source = readFileSync(new URL('../assets/scripts/data/Puzzles.ts', import.meta.url), 'utf8');
const challengeBlock = source.match(/const challengeThemes: Theme\[] = \[([\s\S]*?)\n\] as Theme\[];/)?.[1] ?? '';
const storyBlock = source.match(/const storyThemes: Theme\[] = \[([\s\S]*?)\n\] as Theme\[];/)?.[1] ?? '';

assert.equal((challengeBlock.match(/^  \[/gm) ?? []).length, 10, 'must ship ten challenge puzzles');
assert.equal((storyBlock.match(/^  \[/gm) ?? []).length, 10, 'must ship ten story puzzles');
assert.match(source, /const groups = \[anchors, firstLinks, secondLinks\]/, 'puzzles must expose the three-step deduction chain');
assert.match(source, /既不是.*也不是/, 'puzzles must begin with meaningful identity exclusions');
assert.match(source, /使用.*的客人，选择的是/, 'puzzles must link the first and second attributes');
assert.match(source, /的客人，位于/, 'puzzles must link the second and third attributes');
assert.match(source, /requiredCells: unlockKeys\[index\]/, 'stage unlocks must be linked to verified key deductions');

const engine = readFileSync(new URL('../assets/scripts/core/PuzzleEngine.ts', import.meta.url), 'utf8');
assert.match(engine, /getHint\(\)/, 'engine must provide a hint path');
assert.match(engine, /this\.lives -= 1/, 'engine must immediately penalize a wrong answer');
assert.match(engine, /while \(this\.activeStageIndex \+ 1/, 'engine must unlock all newly reachable stages');

console.log('Puzzle data structure validated: 20 levels, staged evidence, hint and life rules present.');
