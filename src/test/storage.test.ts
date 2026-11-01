/**
 * @file storage.test.ts
 * @description Unit tests for local persistence, backup export/import, and error resilience.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getStoredEvents, 
  saveStoredEvents, 
  getActiveEventId, 
  setActiveEventId, 
  getStoredSettings, 
  saveStoredSettings,
  exportAllDataBackup,
  importDataBackup
} from '../services/storage';
import { SAMPLE_WEDDING, SAMPLE_BIRTHDAY } from '../services/mockData';
import { FullEventPlan } from '../types/event';

describe('Storage & Persistence Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with seed sample wedding when storage is empty', () => {
    const events = getStoredEvents();
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].details.title).toBe(SAMPLE_WEDDING.details.title);
  });

  it('saves and updates event plans in localStorage', () => {
    const updatedPlan: FullEventPlan = {
      ...SAMPLE_WEDDING,
      details: {
        ...SAMPLE_WEDDING.details,
        title: 'Custom Golden Jubilee Celebration',
        totalBudget: 45000,
      },
    };

    saveStoredEvents([updatedPlan]);
    const retrieved = getStoredEvents();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].details.title).toBe('Custom Golden Jubilee Celebration');
    expect(retrieved[0].details.totalBudget).toBe(45000);
  });

  it('persists and retrieves active event ID', () => {
    setActiveEventId('event-12345');
    expect(getActiveEventId()).toBe('event-12345');
  });

  it('persists and updates user application settings', () => {
    const initialSettings = getStoredSettings();
    expect(initialSettings.defaultCurrency).toBeDefined();

    saveStoredSettings({
      geminiApiKey: 'AIzaSyTestKey1234567890',
      preferredModel: 'gemini-2.0-flash',
      defaultCurrency: 'EUR',
      darkMode: true,
    });

    const updated = getStoredSettings();
    expect(updated.geminiApiKey).toBe('AIzaSyTestKey1234567890');
    expect(updated.preferredModel).toBe('gemini-2.0-flash');
    expect(updated.defaultCurrency).toBe('EUR');
    expect(updated.darkMode).toBe(true);
  });

  it('exports complete data backup JSON', () => {
    saveStoredEvents([SAMPLE_WEDDING, SAMPLE_BIRTHDAY]);
    const backupJson = exportAllDataBackup();
    const parsed = JSON.parse(backupJson);

    expect(parsed.version).toBe('1.0');
    expect(parsed.exportDate).toBeDefined();
    expect(parsed.events.length).toBe(2);
    expect(parsed.settings).toBeDefined();
  });

  it('imports valid data backup successfully', () => {
    const backupPayload = JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      events: [SAMPLE_BIRTHDAY],
      settings: {
        geminiApiKey: '',
        preferredModel: 'gemini-2.0-flash',
        defaultCurrency: 'USD',
        darkMode: false,
      },
    });

    const success = importDataBackup(backupPayload);
    expect(success).toBe(true);

    const events = getStoredEvents();
    expect(events.length).toBe(1);
    expect(events[0].details.title).toBe(SAMPLE_BIRTHDAY.details.title);
  });

  it('safely rejects invalid or corrupt JSON during backup import', () => {
    const corruptPayload = '{ invalidJson: true, missingBrace ';
    const success = importDataBackup(corruptPayload);
    expect(success).toBe(false);

    const emptyArrayPayload = JSON.stringify({ version: '1.0', events: [] });
    const successEmpty = importDataBackup(emptyArrayPayload);
    expect(successEmpty).toBe(false);
  });
});
