/**
 * @file useCountdown.ts
 * @description Custom React hook providing synchronized, real-time countdown calculations
 * to any event date and time.
 */

import { useState, useEffect } from 'react';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

/**
 * Calculates remaining time until target date string.
 *
 * @param targetDate - ISO date (YYYY-MM-DD)
 * @param targetTime - Optional time in HH:mm format
 * @returns Breakdown of days, hours, minutes, and seconds
 */
export const useCountdown = (targetDate: string, targetTime?: string): CountdownTime => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = (): void => {
      const timeStr = targetTime || '12:00';
      const targetTimestamp = new Date(`${targetDate}T${timeStr}:00`).getTime();
      const now = Date.now();
      const diff = targetTimestamp - now;

      if (diff <= 0 || isNaN(diff)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isPast: false,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  return timeLeft;
};

