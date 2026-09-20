/**
 * Real-Time Medication Synchronization & Date-Based Persistence Library
 * 
 * Ensures doses taken today persist across refreshes, and automatically
 * resets every calendar day at 12:00 AM (midnight) based on the user's local timezone.
 */

export interface StoredDoseInfo {
  status: 'TAKEN' | 'SKIPPED' | 'MISSED' | 'PENDING';
  actionTime?: string;
  name?: string;
  timeSlot?: string;
  scheduledTime?: string;
}

export type DoseMap = Record<string, StoredDoseInfo>;

/**
 * Returns the current date formatted as YYYY-MM-DD according to local browser time.
 * This guarantees the date boundary changes exactly at 12:00 AM midnight in the user's timezone.
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Local storage key for doses of a given date.
 */
export function getDoseStorageKey(dateKey: string = getLocalDateKey()): string {
  return `medinexa_doses_${dateKey}`;
}

/**
 * Fetch all recorded doses for a specified date (defaults to today).
 */
export function getStoredDoses(dateKey: string = getLocalDateKey()): DoseMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(getDoseStorageKey(dateKey));
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse stored doses:', err);
    return {};
  }
}

/**
 * Save dose status for today's date (persisted across refresh).
 * Indexes by both ID and normalized medicine name so different views stay in 100% sync.
 */
export function saveStoredDose(
  id: string,
  status: 'TAKEN' | 'SKIPPED' | 'MISSED' | 'PENDING',
  meta?: { name?: string; timeSlot?: string; scheduledTime?: string },
  dateKey: string = getLocalDateKey()
): DoseMap {
  if (typeof window === 'undefined') return {};
  try {
    const key = getDoseStorageKey(dateKey);
    const existing = getStoredDoses(dateKey);
    const nowIso = new Date().toISOString();

    const info: StoredDoseInfo = {
      status,
      actionTime: status === 'PENDING' ? undefined : nowIso,
      name: meta?.name,
      timeSlot: meta?.timeSlot,
      scheduledTime: meta?.scheduledTime,
    };

    existing[id] = info;

    // Also index by normalized medicine name for cross-view parity
    if (meta?.name) {
      const normalizedName = meta.name.toLowerCase().trim();
      existing[normalizedName] = info;
    }

    localStorage.setItem(key, JSON.stringify(existing));

    // Broadcast update across current page and tabs
    window.dispatchEvent(
      new CustomEvent('medinexa-dose-updated', {
        detail: { id, status, dateKey, meta },
      })
    );

    return existing;
  } catch (err) {
    console.warn('Failed to save stored dose:', err);
    return {};
  }
}

/**
 * Check if a specific medicine has been marked TAKEN today.
 */
export function isDoseTakenToday(
  id: string,
  name?: string,
  dateKey: string = getLocalDateKey()
): boolean {
  const doses = getStoredDoses(dateKey);
  if (doses[id]?.status === 'TAKEN') return true;
  if (name && doses[name.toLowerCase().trim()]?.status === 'TAKEN') return true;
  return false;
}

/**
 * Reset/Clear doses for a specific date (useful for test simulations or clean resets).
 */
export function clearStoredDosesForDate(dateKey: string = getLocalDateKey()): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getDoseStorageKey(dateKey));
    window.dispatchEvent(new CustomEvent('medinexa-dose-updated', { detail: { dateKey, reset: true } }));
  } catch (err) {
    console.warn('Failed to clear stored doses:', err);
  }
}

/**
 * Subscribe to dose changes from any component or tab.
 */
export function subscribeToDoseUpdates(callback: (event?: CustomEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (e: Event) => callback(e as CustomEvent);
  const handleStorage = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('medinexa_doses_')) {
      callback();
    }
  };

  window.addEventListener('medinexa-dose-updated', handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('medinexa-dose-updated', handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Helper to get human-readable friendly date representation
 * e.g. "Today, Sunday Sep 20"
 */
export function getFriendlyLocalDate(dateKey: string = getLocalDateKey()): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3) return 'Today';
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
