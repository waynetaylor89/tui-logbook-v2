import { describe, expect, it } from "vitest";
import { computeStats, filterHistoryByTabAndUser, getUserOptions } from "./selectors.js";

describe("selectors", () => {
  it("builds unique user options with ALL_USERS first", () => {
    const users = { alice: {}, bob: {} };
    const history = { bob: [], chris: [] };
    expect(getUserOptions(users, history)).toEqual(["ALL_USERS", "alice", "bob", "chris"]);
  });

  it("filters admin records by selected user and aircraft tab", () => {
    const allHistory = [
      { createdBy: "alice", aircraft: "G-TAWA - Boeing 737-800" },
      { createdBy: "bob", aircraft: "G-TUIJ - Boeing 787-9 Dreamliner" },
      { createdBy: "alice", aircraft: "G-TUMA - Boeing 737 MAX 8" },
    ];

    const result = filterHistoryByTabAndUser({
      isAdmin: true,
      allHistory,
      filteredHistory: [],
      selectedUser: "alice",
      activeTab: "Boeing 737",
    });

    expect(result).toHaveLength(2);
    expect(result.every((entry) => entry.createdBy === "alice")).toBe(true);
  });

  it("computes movement stats for admin users", () => {
    const allHistory = [
      { aircraft: "A1", fromStand: "1", toStand: "2", createdBy: "alice" },
      { aircraft: "A1", fromStand: "2", toStand: "3", createdBy: "alice" },
      { aircraft: "A2", fromStand: "1", toStand: "2", createdBy: "bob" },
    ];

    const stats = computeStats({
      isAdmin: true,
      allHistory,
      currentUserHistory: [],
      users: { alice: {}, bob: {} },
    });

    expect(stats.totalMovements).toBe(3);
    expect(stats.topAircraft[0]).toEqual(["A1", 2]);
    expect(stats.userCount).toBe(2);
  });
});
