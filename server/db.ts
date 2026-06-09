import { promises as fs } from "fs";
import path from "path";

// Define the file-based DB path
const DB_FILE = path.join(process.cwd(), "server_db.json");

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface DatabaseApplication {
  id: string;
  userId: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  allowedOrigins: string[];
  createdAt: string;
  status: "active" | "inactive";
}

export interface SavedDatabaseRecord {
  id: string;
  clientId: string;
  collection: string;
  data: any;
  createdAt: string;
}

export interface SavedStorageRecord {
  id: string;
  clientId: string;
  filePath: string;
  originalName: string;
  simulatedUrl: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

export interface KeyLineEndUser {
  id: string;
  clientId: string;
  name: string;
  email: string;
  status: "active" | "suspended";
  createdAt: string;
}

interface DatabaseSchema {
  users: DatabaseUser[];
  applications: DatabaseApplication[];
  databaseRecords: SavedDatabaseRecord[];
  storageRecords: SavedStorageRecord[];
  endUsers: KeyLineEndUser[];
}

const initialDb: DatabaseSchema = {
  users: [],
  applications: [
    {
      id: "demo-app-1",
      userId: "demo-user",
      name: "SaaS Analytics Dashboard",
      clientId: "kl_client_8f9e2d1c",
      clientSecret: "kl_secret_7a8b9c0d1e2f3g4h5i6j7k8l9m",
      redirectUris: ["http://localhost:4000/auth/callback"],
      allowedOrigins: ["http://localhost:4000"],
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: "demo-app-2",
      userId: "demo-user",
      name: "KeyLine Sandbox Mobile App",
      clientId: "kl_client_a1b2c3d4",
      clientSecret: "kl_secret_9z8y7x6w5v4u3t2s1r0q9p8o7n",
      redirectUris: ["keyline-sandbox://callback"],
      allowedOrigins: [],
      createdAt: new Date().toISOString(),
      status: "active",
    }
  ],
  databaseRecords: [
    {
      id: "rec_1",
      clientId: "kl_client_8f9e2d1c",
      collection: "users",
      data: { name: "Sarah Connor", role: "Developer", email: "sarah@sky.net" },
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "rec_2",
      clientId: "kl_client_8f9e2d1c",
      collection: "logs",
      data: { type: "system_boot", trigger: "webhook", status: "success" },
      createdAt: new Date(Date.now() - 60000).toISOString(),
    }
  ],
  storageRecords: [
    {
      id: "file_1",
      clientId: "kl_client_8f9e2d1c",
      filePath: "avatars/dev_user.jpg",
      originalName: "profile_avatar.jpg",
      simulatedUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      sizeBytes: 124032,
      mimeType: "image/jpeg",
      uploadedAt: new Date(Date.now() - 1800000).toISOString(),
    }
  ],
  endUsers: [
    {
      id: "usr_1",
      clientId: "kl_client_8f9e2d1c",
      name: "John Connor",
      email: "john.connor@sky.net",
      status: "active",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "usr_2",
      clientId: "kl_client_8f9e2d1c",
      name: "Marcus Wright",
      email: "marcus.wright@cyberdyne.org",
      status: "active",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    }
  ]
};

class FileDB {
  private cache: DatabaseSchema | null = null;
  private writePromise: Promise<void> | null = null;

  private async load(): Promise<DatabaseSchema> {
    if (this.cache) return this.cache;
    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      this.cache = JSON.parse(data) as DatabaseSchema;
      return this.cache;
    } catch (err) {
      // File not found or corrupted, write initial and return
      this.cache = { ...initialDb };
      await this.save(this.cache);
      return this.cache;
    }
  }

  private async save(data: DatabaseSchema): Promise<void> {
    this.cache = data;
    // Sequentialize writes to prevent race conditions
    const writeOp = async () => {
      await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    };
    if (this.writePromise) {
      this.writePromise = this.writePromise.then(writeOp);
    } else {
      this.writePromise = writeOp();
    }
    await this.writePromise;
  }

  // Users Helpers
  public users = {
    findMany: async (): Promise<DatabaseUser[]> => {
      const db = await this.load();
      return db.users;
    },
    findFirst: async (predicate: (u: DatabaseUser) => boolean): Promise<DatabaseUser | null> => {
      const db = await this.load();
      return db.users.find(predicate) || null;
    },
    create: async (user: Omit<DatabaseUser, "id" | "createdAt">): Promise<DatabaseUser> => {
      const db = await this.load();
      const newUser: DatabaseUser = {
        ...user,
        id: "kl_usr_" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      await this.save(db);
      return newUser;
    },
    update: async (id: string, updates: Partial<Omit<DatabaseUser, "id" | "createdAt">>): Promise<DatabaseUser | null> => {
      const db = await this.load();
      const idx = db.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      db.users[idx] = { ...db.users[idx], ...updates };
      await this.save(db);
      return db.users[idx];
    }
  };

  // Applications Helpers
  public applications = {
    findMany: async (predicate?: (app: DatabaseApplication) => boolean): Promise<DatabaseApplication[]> => {
      const db = await this.load();
      if (predicate) {
        return db.applications.filter(predicate);
      }
      return db.applications;
    },
    findFirst: async (predicate: (app: DatabaseApplication) => boolean): Promise<DatabaseApplication | null> => {
      const db = await this.load();
      return db.applications.find(predicate) || null;
    },
    create: async (app: Omit<DatabaseApplication, "id" | "clientId" | "clientSecret" | "createdAt" | "status">): Promise<DatabaseApplication> => {
      const db = await this.load();
      const newApp: DatabaseApplication = {
        ...app,
        id: "kl_app_" + Math.random().toString(36).substr(2, 9),
        clientId: "kl_client_" + Math.random().toString(36).substr(2, 8) + Math.random().toString(36).substr(2, 8),
        clientSecret: "kl_secret_" + Array.from({ length: 4 }, () => Math.random().toString(36).substr(2)).join("").substring(0, 32),
        status: "active",
        createdAt: new Date().toISOString(),
      };
      db.applications.push(newApp);
      await this.save(db);
      return newApp;
    },
    update: async (id: string, updates: Partial<Omit<DatabaseApplication, "id" | "clientId" | "createdAt">>): Promise<DatabaseApplication | null> => {
      const db = await this.load();
      const idx = db.applications.findIndex((app) => app.id === id);
      if (idx === -1) return null;
      db.applications[idx] = { ...db.applications[idx], ...updates };
      await this.save(db);
      return db.applications[idx];
    },
    delete: async (id: string): Promise<boolean> => {
      const db = await this.load();
      const beforeLen = db.applications.length;
      db.applications = db.applications.filter((app) => app.id !== id);
      await this.save(db);
      return db.applications.length < beforeLen;
    }
  };

  // Database Records Helpers
  public databaseRecords = {
    findMany: async (predicate?: (rec: SavedDatabaseRecord) => boolean): Promise<SavedDatabaseRecord[]> => {
      const db = await this.load();
      if (!db.databaseRecords) db.databaseRecords = [];
      if (predicate) {
        return db.databaseRecords.filter(predicate);
      }
      return db.databaseRecords;
    },
    create: async (payload: Omit<SavedDatabaseRecord, "id" | "createdAt">): Promise<SavedDatabaseRecord> => {
      const db = await this.load();
      if (!db.databaseRecords) db.databaseRecords = [];
      const newRecord: SavedDatabaseRecord = {
        ...payload,
        id: "rec_" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      db.databaseRecords.push(newRecord);
      await this.save(db);
      return newRecord;
    },
    clearAll: async (clientId: string): Promise<void> => {
      const db = await this.load();
      if (!db.databaseRecords) db.databaseRecords = [];
      db.databaseRecords = db.databaseRecords.filter((r) => r.clientId !== clientId);
      await this.save(db);
    }
  };

  // Storage Records Helpers
  public storageRecords = {
    findMany: async (predicate?: (rec: SavedStorageRecord) => boolean): Promise<SavedStorageRecord[]> => {
      const db = await this.load();
      if (!db.storageRecords) db.storageRecords = [];
      if (predicate) {
        return db.storageRecords.filter(predicate);
      }
      return db.storageRecords;
    },
    create: async (payload: Omit<SavedStorageRecord, "id" | "uploadedAt">): Promise<SavedStorageRecord> => {
      const db = await this.load();
      if (!db.storageRecords) db.storageRecords = [];
      const newRecord: SavedStorageRecord = {
        ...payload,
        id: "file_" + Math.random().toString(36).substr(2, 9),
        uploadedAt: new Date().toISOString(),
      };
      db.storageRecords.push(newRecord);
      await this.save(db);
      return newRecord;
    },
    clearAll: async (clientId: string): Promise<void> => {
      const db = await this.load();
      if (!db.storageRecords) db.storageRecords = [];
      db.storageRecords = db.storageRecords.filter((r) => r.clientId !== clientId);
      await this.save(db);
    }
  };

  // End Users (authenticated app subscribers) Helpers
  public endUsers = {
    findMany: async (predicate?: (user: KeyLineEndUser) => boolean): Promise<KeyLineEndUser[]> => {
      const db = await this.load();
      if (!db.endUsers) db.endUsers = [];
      if (predicate) {
        return db.endUsers.filter(predicate);
      }
      return db.endUsers;
    },
    create: async (payload: Omit<KeyLineEndUser, "id" | "createdAt">): Promise<KeyLineEndUser> => {
      const db = await this.load();
      if (!db.endUsers) db.endUsers = [];
      const newUser: KeyLineEndUser = {
        ...payload,
        id: "kl_usr_" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      db.endUsers.push(newUser);
      await this.save(db);
      return newUser;
    },
    delete: async (id: string): Promise<boolean> => {
      const db = await this.load();
      if (!db.endUsers) db.endUsers = [];
      const beforeLen = db.endUsers.length;
      db.endUsers = db.endUsers.filter((u) => u.id !== id);
      await this.save(db);
      return db.endUsers.length < beforeLen;
    },
    clearAll: async (clientId: string): Promise<void> => {
      const db = await this.load();
      if (!db.endUsers) db.endUsers = [];
      db.endUsers = db.endUsers.filter((u) => u.clientId !== clientId);
      await this.save(db);
    }
  };
}

export const db = new FileDB();
