// core/services/unread-tracker.service.ts
import { Injectable } from '@angular/core';

const STORAGE_KEY = 'consultations_last_seen';

@Injectable({ providedIn: 'root' })
export class UnreadTrackerService {
  private lastSeenMap: Record<string, string> = this.loadFromStorage();

  private loadFromStorage(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lastSeenMap));
  }

  isUnread(id: string, lastMessageAt: string | Date | null | undefined): boolean {
    if (!lastMessageAt) return false;
    const lastSeen = this.lastSeenMap[id];
    if (!lastSeen) return true;
    return new Date(lastMessageAt).getTime() > new Date(lastSeen).getTime();
  }

  markAsSeen(id: string): void {
    this.lastSeenMap[id] = new Date().toISOString();
    this.saveToStorage();
  }
}