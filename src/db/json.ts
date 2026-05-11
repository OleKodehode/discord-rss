import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { DbAdapter } from "./adapter.js";
import type { Subscription } from "../types.js";
import { join } from "node:path";

/**
 * JSON Adapter - More of a proof of concept Database.
 * Not recommended for larger operations.
 * Only really useful for small servers or testing.
 * Used as in-memory Database, writes to JSON with changes.
 */
export class JsonAdapter implements DbAdapter {
  private subscriptions: Subscription[] = [];
  private filePath: string;

  constructor(
    filePath: string = join(process.cwd(), "data/Subscriptions.json"),
  ) {
    this.filePath = filePath;
  }

  async init(): Promise<void> {
    await mkdir(join(process.cwd(), "data"), { recursive: true });
    try {
      const raw = await readFile(this.filePath, "utf-8");
      this.subscriptions = JSON.parse(raw);
    } catch {
      this.subscriptions = [];
      await this.save();
    }
  }

  private async save(): Promise<void> {
    await writeFile(
      this.filePath,
      JSON.stringify(this.subscriptions, null, 2),
      "utf-8",
    );
  }

  async getSubscriptions(): Promise<Subscription[]> {
    return this.subscriptions;
  }

  async getSubscriptionByGuild(guildId: string): Promise<Subscription[]> {
    const result: Subscription[] = this.subscriptions.filter(
      (entry) => entry.guildId === guildId,
    );
    return result;
  }

  async addSubscription(
    sub: Omit<Subscription, "id" | "createdAt">,
  ): Promise<Subscription> {
    // Spread the incoming object, add in ID with UUID and createdAt with ISO
    const newEntry: Subscription = {
      ...sub,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    this.subscriptions.push(newEntry);
    await this.save();

    return newEntry;
  }

  async removeSubscription(id: string): Promise<void> {
    this.subscriptions = this.subscriptions.filter((entry) => entry.id !== id);

    await this.save();
  }

  async updateLastSeen(id: string, lastSeenId: string): Promise<void> {
    this.subscriptions = this.subscriptions.map((entry) =>
      entry.id === id ? { ...entry, lastSeenId } : entry,
    );

    await this.save();
  }

  async updateLastError(id: string, lastError: string | null): Promise<void> {
    this.subscriptions = this.subscriptions.map((entry) =>
      entry.id === id ? { ...entry, lastError } : entry,
    );

    await this.save();
  }
}
