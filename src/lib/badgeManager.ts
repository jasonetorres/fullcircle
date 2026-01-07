class BadgeManager {
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'setAppBadge' in navigator && 'clearAppBadge' in navigator;
  }

  async setBadge(count: number): Promise<void> {
    if (!this.isSupported) {
      return;
    }

    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await this.clearBadge();
      }
    } catch (error) {
      console.warn('Failed to set app badge:', error);
    }
  }

  async clearBadge(): Promise<void> {
    if (!this.isSupported) {
      return;
    }

    try {
      await navigator.clearAppBadge();
    } catch (error) {
      console.warn('Failed to clear app badge:', error);
    }
  }

  isBadgingSupported(): boolean {
    return this.isSupported;
  }
}

export const badgeManager = new BadgeManager();
