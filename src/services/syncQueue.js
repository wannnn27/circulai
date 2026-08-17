/**
 * @file syncQueue.js
 * @description Offline mutation replay queue manager for CIRCULAI.
 *
 * When the app is operating in offline / fallback mode, state mutations
 * (e.g., adding an address, toggling a wishlist item, or placing an order draft)
 * are recorded to this persistent queue in AsyncStorage.
 *
 * When the connection to the backend is restored, `syncQueue.flush(api)`
 * automatically replays pending mutations in FIFO order against the online API,
 * resolving the offline-online data synchronization gap.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = '@circulai/offline-mutation-queue-v1';

class SyncQueue {
  /**
   * Enqueues an offline mutation to persistent storage.
   *
   * @param {string} action  Action type (e.g., 'ADD_ADDRESS', 'TOGGLE_WISHLIST').
   * @param {object} payload Action payload.
   */
  async enqueue(action, payload) {
    try {
      const queue = await this.getQueue();
      const item = {
        id: `MUT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        action,
        payload,
        createdAt: new Date().toISOString(),
      };
      queue.push(item);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (err) {
      if (__DEV__) {
        console.warn('[SyncQueue] Failed to enqueue mutation:', err);
      }
    }
  }

  /**
   * Reads all pending mutations from storage.
   *
   * @returns {Promise<Array<{ id: string, action: string, payload: object, createdAt: string }>>}
   */
  async getQueue() {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Flushes and replays all pending mutations against the target API client.
   *
   * @param {object} apiInstance The active API client instance.
   * @returns {Promise<{ processed: number, failed: number }>}
   */
  async flush(apiInstance) {
    const queue = await this.getQueue();
    if (queue.length === 0) return { processed: 0, failed: 0 };

    let processed = 0;
    let failed = 0;
    const remaining = [];

    for (const item of queue) {
      try {
        switch (item.action) {
          case 'ADD_ADDRESS':
            await apiInstance.addAddress(item.payload);
            break;
          case 'REMOVE_ADDRESS':
            await apiInstance.removeAddress(item.payload.id);
            break;
          case 'TOGGLE_WISHLIST':
            await apiInstance.toggleWishlist(item.payload.productId, item.payload.favorite);
            break;
          case 'SAVE_MEASUREMENTS':
            await apiInstance.saveMeasurements(item.payload);
            break;
          case 'SAVE_STYLE_PROFILE':
            await apiInstance.saveStyleProfile(item.payload);
            break;
          default:
            break;
        }
        processed += 1;
      } catch {
        failed += 1;
        remaining.push(item); // Keep failed mutations for retry on next reconnect
      }
    }

    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remaining));
    return { processed, failed };
  }

  /** Clears all queued mutations without replaying. */
  async clear() {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY).catch(() => {});
  }
}

export const syncQueue = new SyncQueue();
