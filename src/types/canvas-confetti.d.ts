declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    origin?: { x: number; y: number };
    colors?: string[];
    decay?: number;
    gravity?: number;
    ticks?: number;
    startVelocity?: number;
    scalar?: number;
  }

  function confetti(options?: ConfettiOptions): void;

  export default confetti;
}
