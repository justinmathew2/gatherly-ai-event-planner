/**
 * @file storage.ts
 * @description LocalStorage persistence management with automatic corruption recovery,
 * schema validation, and demo data seeding.
 */

import { FullEventPlan, UserSettings } from '../types/event';
import { FullEventPlanSchema } from '../types/schema';
import { SAMPLE_EVENTS } from './mockData';

const STORAGE_KEYS = {
  EVENTS: 'gatherly_events_v1',
  ACTIVE_EVENT_ID: 'gatherly_active_event_id_v1',
  SETTINGS: 'gatherly_user_settings_v1',
} as const;

const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  preferredModel: 'gemini-2.0-flash',
  defaultCurrency: 'USD',
  darkMode: false,
};

/**
 * Retrieves persisted user settings or fallback defaults.
 */
export const getStoredSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/**
 * Persists user configuration into local storage.
 */
export const saveStoredSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // QuotaExceededError or security block
  }
};

/**
 * Retrieves all stored event plans, validating each plan against FullEventPlanSchema.
 * Automatically recovers from corrupt records by falling back to verified sample events.
 */
export const getStoredEvents = (): FullEventPlan[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SAMPLE_EVENTS));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, SAMPLE_EVENTS[0].details.id);
      return SAMPLE_EVENTS;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate with schema and filter only valid records
      const validEvents: FullEventPlan[] = [];
      for (const item of parsed) {
        const val = FullEventPlanSchema.safeParse(item);
        if (val.success) {
          validEvents.push(val.data as FullEventPlan);
        }
      }

      if (validEvents.length > 0) {
        return validEvents;
      }
    }

    // If array was empty or contained invalid items
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SAMPLE_EVENTS));
    return SAMPLE_EVENTS;
  } catch {
    return SAMPLE_EVENTS;
  }
};

/**
 * Persists an array of master plans.
 */
export const saveStoredEvents = (events: FullEventPlan[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch {
    // Storage quota protection
  }
};

/**
 * Gets the active event ID from storage or defaults to the first available event.
 */
export const getActiveEventId = (): string => {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
    if (id) return id;
    const events = getStoredEvents();
    return events[0]?.details.id || SAMPLE_EVENTS[0].details.id;
  } catch {
    return SAMPLE_EVENTS[0].details.id;
  }
};

/**
 * Sets the active event ID.
 */
export const setActiveEventId = (id: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
  } catch {
    // Ignore
  }
};

/**
 * Updates or appends a single event plan into storage.
 */
export const saveSingleEvent = (updatedPlan: FullEventPlan): void => {
  const allEvents = getStoredEvents();
  const existingIdx = allEvents.findIndex((e) => e.details.id === updatedPlan.details.id);
  
  const updatedDetails = {
    ...updatedPlan.details,
    updatedAt: new Date().toISOString(),
  };
  const planToSave: FullEventPlan = { ...updatedPlan, details: updatedDetails };

  if (existingIdx >= 0) {
    allEvents[existingIdx] = planToSave;
  } else {
    allEvents.unshift(planToSave);
  }
  
  saveStoredEvents(allEvents);
  setActiveEventId(planToSave.details.id);
};

/**
 * Deletes an event by ID. If all events are deleted, restores default demo events.
 */
export const deleteSingleEvent = (id: string): FullEventPlan[] => {
  const allEvents = getStoredEvents().filter((e) => e.details.id !== id);
  if (allEvents.length > 0) {
    saveStoredEvents(allEvents);
    setActiveEventId(allEvents[0].details.id);
    return allEvents;
  } else {
    saveStoredEvents(SAMPLE_EVENTS);
    setActiveEventId(SAMPLE_EVENTS[0].details.id);
    return SAMPLE_EVENTS;
  }
};

/**
 * Serializes all persisted events and user settings into an exportable backup JSON string.
 */
export const exportAllDataBackup = (): string => {
  const events = getStoredEvents();
  const settings = getStoredSettings();
  const payload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    events,
    settings,
  };
  return JSON.stringify(payload, null, 2);
};

/**
 * Validates and restores a complete data backup payload into localStorage.
 * Returns true if restored successfully, false otherwise.
 */
export const importDataBackup = (rawJson: string): boolean => {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || !Array.isArray(parsed.events) || parsed.events.length === 0) {
      return false;
    }

    const validatedEvents: FullEventPlan[] = [];
    for (const item of parsed.events) {
      const val = FullEventPlanSchema.safeParse(item);
      if (val.success) {
        validatedEvents.push(val.data as FullEventPlan);
      }
    }

    if (validatedEvents.length === 0) {
      return false;
    }

    saveStoredEvents(validatedEvents);
    setActiveEventId(validatedEvents[0].details.id);

    if (parsed.settings && typeof parsed.settings === 'object') {
      saveStoredSettings({
        ...DEFAULT_SETTINGS,
        ...parsed.settings,
      });
    }

    return true;
  } catch {
    return false;
  }
};
