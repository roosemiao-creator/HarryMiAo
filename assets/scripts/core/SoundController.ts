import { sys } from 'cc';

/** Lightweight original procedural soundtrack and feedback sounds.
 * It needs no licensed audio file and starts only after a player gesture. */
export class SoundController {
  private static readonly KEY = 'fairytale-detective-audio-v1';
  private context?: AudioContext;
  private bgmTimer?: number;
  enabled = sys.localStorage.getItem(SoundController.KEY) !== 'off';

  toggle(): boolean { this.enabled = !this.enabled; this.save(); if (!this.enabled) this.stopBgm(); return this.enabled; }
  touch(): void { if (!this.enabled) return; this.ensure(); this.tone(660, 0.045, 0.025, 'sine'); this.startBgm(); }
  correct(): void { if (!this.enabled) return; this.ensure(); this.tone(523, 0.08, 0.045, 'triangle'); this.tone(784, 0.13, 0.04, 'triangle', 0.07); }
  wrong(): void { if (!this.enabled) return; this.ensure(); this.tone(190, 0.16, 0.07, 'sawtooth'); }
  reveal(): void { if (!this.enabled) return; this.ensure(); this.tone(440, 0.08, 0.035, 'sine'); this.tone(659, 0.14, 0.04, 'sine', 0.08); }

  private ensure(): void {
    if (this.context || typeof AudioContext === 'undefined') return;
    this.context = new AudioContext();
    void this.context.resume();
  }
  private tone(frequency: number, seconds: number, volume: number, type: OscillatorType, delay = 0): void {
    const context = this.context; if (!context) return;
    const osc = context.createOscillator(); const gain = context.createGain();
    const now = context.currentTime + delay;
    osc.type = type; osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    osc.connect(gain); gain.connect(context.destination); osc.start(now); osc.stop(now + seconds + 0.02);
  }
  private startBgm(): void {
    if (this.bgmTimer || !this.context) return;
    const melody = [392, 440, 523, 659, 523, 440, 349, 392]; let step = 0;
    const play = () => { if (this.enabled) this.tone(melody[step++ % melody.length], 0.26, 0.012, 'sine'); };
    play(); this.bgmTimer = setInterval(play, 460) as unknown as number;
  }
  private stopBgm(): void { if (this.bgmTimer) clearInterval(this.bgmTimer); this.bgmTimer = undefined; }
  private save(): void { sys.localStorage.setItem(SoundController.KEY, this.enabled ? 'on' : 'off'); }
}
