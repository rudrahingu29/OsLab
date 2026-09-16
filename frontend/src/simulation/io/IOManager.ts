export interface IODevice {
  id: string;
  name: string;
  category: 'Disk' | 'Network' | 'Audio' | 'Keyboard';
  isBusy: boolean;
  currentProcessId: number | null;
}

export class IOManager {
  private devices: IODevice[];

  constructor() {
    this.devices = [
      { id: 'disk1', name: 'Main Drive', category: 'Disk', isBusy: false, currentProcessId: null },
      { id: 'net1', name: 'Ethernet', category: 'Network', isBusy: false, currentProcessId: null },
      { id: 'audio1', name: 'Speaker', category: 'Audio', isBusy: false, currentProcessId: null },
      { id: 'kbd1', name: 'Keyboard', category: 'Keyboard', isBusy: false, currentProcessId: null }
    ];
  }

  public requestIO(processId: number, category: string): boolean {
    const device = this.devices.find(d => d.category === category && !d.isBusy);
    if (device) {
      device.isBusy = true;
      device.currentProcessId = processId;
      return true;
    }
    return false;
  }

  public completeIO(processId: number): void {
    const device = this.devices.find(d => d.currentProcessId === processId);
    if (device) {
      device.isBusy = false;
      device.currentProcessId = null;
    }
  }

  public getDevices(): IODevice[] {
    return this.devices;
  }

  public reset(): void {
    this.devices.forEach(d => {
      d.isBusy = false;
      d.currentProcessId = null;
    });
  }
}
