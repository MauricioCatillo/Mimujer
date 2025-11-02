import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CalendarEvent } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, "../../data/events.json");

const ensureFileExists = async () => {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify([]));
  }
};

export class EventStore {
  static async getAll(): Promise<CalendarEvent[]> {
    await ensureFileExists();
    const file = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(file) as CalendarEvent[];
    return data;
  }

  static async saveAll(events: CalendarEvent[]): Promise<void> {
    await ensureFileExists();
    await fs.writeFile(DATA_PATH, JSON.stringify(events, null, 2));
  }
}
