import { FullEventPlan, UserSettings } from '../types/event';
import { SAMPLE_EVENTS } from './mockData';

const STORAGE_KEYS = {
  EVENTS: 'gatherly_events_v1',
  ACTIVE_EVENT_ID: 'gatherly_active_event_id_v1',
  SETTINGS: 'gatherly_user_settings_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  preferredModel: 'gemini-2.0-flash',
  defaultCurrency: 'USD',
  darkMode: false,
};

export const getStoredSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to read settings from storage', e);
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to storage', e);
  }
};

export const getStoredEvents = (): FullEventPlan[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      // Seed with sample events on first launch
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SAMPLE_EVENTS));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, SAMPLE_EVENTS[0].details.id);
      return SAMPLE_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_EVENTS;
  } catch (e) {
    console.error('Failed to load events from storage', e);
    return SAMPLE_EVENTS;
  }
};

export const saveStoredEvents = (events: FullEventPlan[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events to storage', e);
  }
};

export const getActiveEventId = (): string => {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
    if (id) return id;
    const events = getStoredEvents();
    return events[0]?.details.id || '';
  } catch {
    return SAMPLE_EVENTS[0].details.id;
  }
};

export const setActiveEventId = (id: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
  } catch (e) {
    console.error('Failed to set active event id', e);
  }
};

export const saveSingleEvent = (updatedPlan: FullEventPlan): void => {
  const allEvents = getStoredEvents();
  const existingIdx = allEvents.findIndex(e => e.details.id === updatedPlan.details.id);
  
  const updatedDetails = {
    ...updatedPlan.details,
    updatedAt: new Date().toISOString()
  };
  const planToSave = { ...updatedPlan, details: updatedDetails };

  if (existingIdx >= 0) {
    allEvents[existingIdx] = planToSave;
  } else {
    allEvents.unshift(planToSave);
  }
  
  saveStoredEvents(allEvents);
  setActiveEventId(planToSave.details.id);
};

export const deleteSingleEvent = (id: string): FullEventPlan[] => {
  const allEvents = getStoredEvents().filter(e => e.details.id !== id);
  saveStoredEvents(allEvents);
  if (allEvents.length > 0) {
    setActiveEventId(allEvents[0].details.id);
  } else {
    // If deleted all, restore samples so the app never crashes
    saveStoredEvents(SAMPLE_EVENTS);
    setActiveEventId(SAMPLE_EVENTS[0].details.id);
    return SAMPLE_EVENTS;
  }
  return allEvents;
};
