// src/hooks/useStats.js

import { useMemo } from "react";

export default function useStats(history) {
  return useMemo(() => {
    const aircraftCounts = {};
    const standCounts = {};

    history.forEach((entry) => {
      aircraftCounts[entry.aircraft] =
        (aircraftCounts[entry.aircraft] || 0) + 1;

      standCounts[entry.fromStand] =
        (standCounts[entry.fromStand] || 0) + 1;

      standCounts[entry.toStand] =
        (standCounts[entry.toStand] || 0) + 1;
    });

    return {
      totalMovements: history.length,

      topAircraft: Object.entries(aircraftCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),

      topStands: Object.entries(standCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    };
  }, [history]);
}