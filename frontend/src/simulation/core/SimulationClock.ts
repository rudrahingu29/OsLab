export class SimulationClock {
  private ticks: number = 0;

  public tick(): void {
    this.ticks++;
  }

  public getTicks(): number {
    return this.ticks;
  }

  public reset(): void {
    this.ticks = 0;
  }
}
