/**
 * Real-Time Bidirectional Synchronization Engine
 * THPT Ba Chúc School Portal & Mobile App
 * 
 * Ensures real-time 2-way synchronization between Web (Desktop/Laptop)
 * and Mobile App (iOS/Android PWA) via:
 * 1. Server-Sent Events (SSE) stream (/api/events)
 * 2. BroadcastChannel for zero-latency multi-tab sync
 * 3. Service Worker PWA update detector
 * 4. Visibility and Network reconnect triggers
 */

import { checkForServiceWorkerUpdate, forceAppUpdateAndReload } from '../registerSW';
import { syncAllWithServer } from './storage';

export interface SyncState {
  isConnected: boolean;
  activeConnections: number;
  lastSyncedAt: string;
  serverVersion: number;
  isSyncing: boolean;
  hasAppUpdate: boolean;
  lastSyncMessage: string;
}

type SyncListener = (state: SyncState) => void;
type DataChangeListener = (collection: string, data?: any) => void;

class RealtimeSyncManager {
  private static instance: RealtimeSyncManager;

  private isConnected = false;
  private activeConnections = 1;
  private lastSyncedAt = new Date().toISOString();
  private serverVersion = 0;
  private isSyncing = false;
  private hasAppUpdate = false;
  private lastSyncMessage = 'Đang thiết lập liên kết Web ↔ App...';

  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;

  private stateListeners = new Set<SyncListener>();
  private dataChangeListeners = new Set<DataChangeListener>();

  private constructor() {
    this.initBroadcastChannel();
    this.initEventSource();
    this.initLifecycleListeners();
  }

  public static getInstance(): RealtimeSyncManager {
    if (!RealtimeSyncManager.instance) {
      RealtimeSyncManager.instance = new RealtimeSyncManager();
    }
    return RealtimeSyncManager.instance;
  }

  /**
   * BroadcastChannel for instant same-device synchronization across tabs/PWA
   */
  private initBroadcastChannel(): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('thpt_bachuc_realtime_sync');
        this.broadcastChannel.onmessage = (event) => {
          const { type, collection, data } = event.data || {};
          if (type === 'LOCAL_DATA_CHANGE') {
            this.notifyDataChange(collection, data);
            this.notifyState();
          } else if (type === 'REQUEST_REFRESH') {
            this.performSync(false);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization warning:', err);
      }
    }
  }

  /**
   * Server-Sent Events (SSE) for multi-device real-time sync (Web ↔ Mobile Phone App)
   */
  private initEventSource(): void {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.lastSyncMessage = 'Đã liên kết dữ liệu thời gian thực giữa Web và App trên điện thoại';
        this.notifyState();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.handleServerEvent(payload);
        } catch (err) {
          console.warn('SSE message parse error:', err);
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        // Exponential backoff reconnect
        this.reconnectAttempts++;
        const delay = Math.min(30000, 1000 * Math.pow(1.5, this.reconnectAttempts));
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.initEventSource();
        }, delay);

        this.notifyState();
      };
    } catch (err) {
      console.warn('SSE creation error:', err);
    }
  }

  /**
   * Handles incoming real-time SSE broadcasts from the central server
   */
  private handleServerEvent(payload: any): void {
    if (!payload || typeof payload !== 'object') return;

    if (payload.activeConnections !== undefined) {
      this.activeConnections = payload.activeConnections;
    }
    if (payload.version) {
      this.serverVersion = payload.version;
    }
    if (payload.timestamp) {
      this.lastSyncedAt = payload.timestamp;
    }

    switch (payload.type) {
      case 'CONNECTED':
        this.isConnected = true;
        this.lastSyncMessage = 'Đã liên kết Web ↔ App thời gian thực';
        break;

      case 'HEARTBEAT':
        this.isConnected = true;
        break;

      case 'DATA_CHANGED':
      case 'REACTION_UPDATED':
        this.lastSyncMessage = `Đã cập nhật dữ liệu: ${payload.collection || 'hệ thống'}`;
        // Automatically perform background state reconciliation
        this.notifyDataChange(payload.collection || 'all', payload.data);
        break;

      case 'APP_UPDATE_AVAILABLE':
        this.hasAppUpdate = true;
        this.lastSyncMessage = 'Có bản cập nhật ứng dụng mới!';
        break;
    }

    this.notifyState();
  }

  /**
   * Attach browser and device lifecycle listeners
   */
  private initLifecycleListeners(): void {
    if (typeof window === 'undefined') return;

    // 1. When user returns to the tab or mobile app from background
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (!this.isConnected || !this.eventSource) {
          this.initEventSource();
        }
        this.checkServerVersionAndSync();
      }
    });

    // 2. Window focus (desktop/laptop)
    window.addEventListener('focus', () => {
      this.checkServerVersionAndSync();
    });

    // 3. Online status reconnect
    window.addEventListener('online', () => {
      this.initEventSource();
      this.performSync(false);
    });

    // 4. Periodic lightweight sync check every 45s
    setInterval(() => {
      this.checkServerVersionAndSync();
    }, 45000);
  }

  /**
   * Checks if server has newer data version and reconciles
   */
  public async checkServerVersionAndSync(): Promise<void> {
    try {
      const res = await fetch('/api/sync/status');
      if (res.ok) {
        const json = await res.json();
        if (json?.success) {
          this.activeConnections = json.activeConnections || 1;
          if (json.version && json.version > this.serverVersion) {
            this.serverVersion = json.version;
            this.lastSyncedAt = json.lastSyncedAt || new Date().toISOString();
            await this.performSync(false);
          }
        }
      }
    } catch {
      // Non-fatal background check
    }
  }

  /**
   * Broadcasts a local change to other tabs on the same device and asks server to broadcast to other devices
   */
  public broadcastLocalChange(collection: string, data?: any): void {
    // 1. Same-device BroadcastChannel
    try {
      this.broadcastChannel?.postMessage({
        type: 'LOCAL_DATA_CHANGE',
        collection,
        data,
        timestamp: Date.now(),
      });
    } catch {}

    // 2. Central Server broadcast to other devices (Phone <-> Web)
    try {
      fetch('/api/sync/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection, reason: 'client_mutation' }),
      }).catch(() => {});
    } catch {}
  }

  /**
   * Performs full synchronization between Local Cache, Server and Firestore
   */
  public async performSync(showLoadingState = true): Promise<{ success: boolean; lastSyncedAt: string }> {
    if (this.isSyncing) {
      return { success: true, lastSyncedAt: this.lastSyncedAt };
    }

    if (showLoadingState) {
      this.isSyncing = true;
      this.lastSyncMessage = 'Đang đồng bộ dữ liệu giữa Web và App...';
      this.notifyState();
    }

    try {
      const result = await syncAllWithServer();
      this.lastSyncedAt = new Date().toISOString();
      this.lastSyncMessage = 'Đồng bộ hoàn tất! Dữ liệu Web và App đã được cập nhật mới nhất.';
      
      // Notify all data listeners to re-render fresh items
      this.notifyDataChange('all');

      return {
        success: result.success,
        lastSyncedAt: this.lastSyncedAt,
      };
    } catch (err: any) {
      this.lastSyncMessage = 'Lỗi đồng bộ: ' + (err?.message || 'Không thể kết nối');
      return { success: false, lastSyncedAt: this.lastSyncedAt };
    } finally {
      this.isSyncing = false;
      this.notifyState();
    }
  }

  /**
   * Check for application code updates (PWA / Service Worker)
   */
  public async checkForUpdates(): Promise<{ hasUpdate: boolean }> {
    try {
      const [swUpdate, versionRes] = await Promise.all([
        checkForServiceWorkerUpdate(),
        fetch('/api/version').then(r => r.json()).catch(() => null),
      ]);

      if (swUpdate) {
        this.hasAppUpdate = true;
        this.notifyState();
        return { hasUpdate: true };
      }

      return { hasUpdate: this.hasAppUpdate };
    } catch {
      return { hasUpdate: false };
    }
  }

  /**
   * Applies the app update immediately by clearing caches and reloading
   */
  public applyUpdate(): void {
    forceAppUpdateAndReload();
  }

  public getState(): SyncState {
    return {
      isConnected: this.isConnected,
      activeConnections: this.activeConnections,
      lastSyncedAt: this.lastSyncedAt,
      serverVersion: this.serverVersion,
      isSyncing: this.isSyncing,
      hasAppUpdate: this.hasAppUpdate,
      lastSyncMessage: this.lastSyncMessage,
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public onDataChange(listener: DataChangeListener): () => void {
    this.dataChangeListeners.add(listener);
    return () => {
      this.dataChangeListeners.delete(listener);
    };
  }

  private notifyState(): void {
    const state = this.getState();
    this.stateListeners.forEach((listener) => {
      try {
        listener(state);
      } catch {}
    });
  }

  private notifyDataChange(collection: string, data?: any): void {
    this.dataChangeListeners.forEach((listener) => {
      try {
        listener(collection, data);
      } catch {}
    });
  }
}

export const realtimeSync = RealtimeSyncManager.getInstance();
