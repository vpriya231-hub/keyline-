import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "database.json");

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

export interface DatabaseSession {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: number;
}

interface DatabaseSchema {
  users: DatabaseUser[];
  applications: DatabaseApplication[];
  database_records: SavedDatabaseRecord[];
  storage_records: SavedStorageRecord[];
  end_users: KeyLineEndUser[];
  sessions: DatabaseSession[];
}

class JsonDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        
        // Ensure our specific default production client exists dynamically
        const apps = parsed.applications || [];
        const hasSpecificClient = apps.some((a: any) => a.clientId === "kl_client_362du52wt2rbxygg");
        if (!hasSpecificClient) {
          apps.push({
            id: "kl_app_specific_prod",
            userId: "demo-user",
            name: "KeyLine Production Client",
            clientId: "kl_client_362du52wt2rbxygg",
            clientSecret: "kl_secret_362du52wt2rbxygg_secret_key",
            redirectUris: ["https://oidcdebugger.com/redirect", "http://localhost:4000/auth/callback"],
            allowedOrigins: ["https://oidcdebugger.com", "http://localhost:4000"],
            createdAt: new Date().toISOString(),
            status: "active",
          });
          parsed.applications = apps;
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
        }

        return {
          users: parsed.users || [],
          applications: apps,
          database_records: parsed.database_records || [],
          storage_records: parsed.storage_records || [],
          end_users: parsed.end_users || [],
          sessions: parsed.sessions || [],
        };
      }
    } catch (err) {
      console.error("[JsonDB] Failed to load data, using defaults:", err);
    }

    const initialApps: DatabaseApplication[] = [
      {
        id: "kl_app_specific_prod",
        userId: "demo-user",
        name: "KeyLine Production Client",
        clientId: "kl_client_362du52wt2rbxygg",
        clientSecret: "kl_secret_362du52wt2rbxygg_secret_key",
        redirectUris: ["https://oidcdebugger.com/redirect", "http://localhost:4000/auth/callback"],
        allowedOrigins: ["https://oidcdebugger.com", "http://localhost:4000"],
        createdAt: new Date().toISOString(),
        status: "active",
      },
      {
        id: "kl_app_default1",
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
        id: "kl_app_default2",
        userId: "demo-user",
        name: "KeyLine Sandbox Mobile App",
        clientId: "kl_client_a1b2c3d4",
        clientSecret: "kl_secret_9z8y7x6w5v4u3t2s1r0q9p8o7n",
        redirectUris: ["keyline-sandbox://callback"],
        allowedOrigins: [],
        createdAt: new Date().toISOString(),
        status: "active",
      },
      {
        id: "kl_app_default3",
        userId: "demo-user",
        name: "OIDC Debugger Client",
        clientId: "kl_client_6o8umibgxh1qsqdi",
        clientSecret: "kl_secret_6o8umibgxh1qsqdi_secret_keys",
        redirectUris: ["https://oidcdebugger.com/redirect"],
        allowedOrigins: ["https://oidcdebugger.com"],
        createdAt: new Date().toISOString(),
        status: "active",
      },
      {
        id: "kl_app_default4",
        userId: "demo-user",
        name: "Permanent Production Client",
        clientId: "kl_client_7pgm182dqdo6ewsr",
        clientSecret: "kl_secret_7pgm182dqdo6ewsr_secret_key",
        redirectUris: ["https://oidcdebugger.com/redirect"],
        allowedOrigins: ["https://oidcdebugger.com"],
        createdAt: new Date().toISOString(),
        status: "active",
      }
    ];

    const defaultData: DatabaseSchema = {
      users: [],
      applications: initialApps,
      database_records: [],
      storage_records: [],
      end_users: [],
      sessions: []
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("[JsonDB] Failed to save data:", err);
    }
  }

  private perform<T>(action: (data: DatabaseSchema) => T): T {
    const currentData = this.load();
    const result = action(currentData);
    this.saveData(currentData);
    this.data = currentData;
    return result;
  }

  // Users Helpers
  public users = {
    findMany: async (): Promise<DatabaseUser[]> => {
      return this.load().users;
    },
    findFirst: async (predicate: (u: DatabaseUser) => boolean): Promise<DatabaseUser | null> => {
      const list = this.load().users;
      return list.find(predicate) || null;
    },
    create: async (user: Omit<DatabaseUser, "id" | "createdAt">): Promise<DatabaseUser> => {
      return this.perform((data) => {
        const newUser: DatabaseUser = {
          ...user,
          id: "kl_usr_" + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        data.users.push(newUser);
        return newUser;
      });
    },
    update: async (id: string, updates: Partial<Omit<DatabaseUser, "id" | "createdAt">>): Promise<DatabaseUser | null> => {
      return this.perform((data) => {
        const idx = data.users.findIndex((u) => u.id === id);
        if (idx === -1) return null;
        const updated = { ...data.users[idx], ...updates };
        data.users[idx] = updated;
        return updated;
      });
    }
  };

  // Applications Helpers
  public applications = {
    findMany: async (predicate?: (app: DatabaseApplication) => boolean): Promise<DatabaseApplication[]> => {
      const list = this.load().applications;
      if (predicate) return list.filter(predicate);
      return list;
    },
    findFirst: async (predicate: (app: DatabaseApplication) => boolean): Promise<DatabaseApplication | null> => {
      const list = this.load().applications;
      return list.find(predicate) || null;
    },
    create: async (app: Omit<DatabaseApplication, "id" | "clientId" | "clientSecret" | "createdAt" | "status">): Promise<DatabaseApplication> => {
      return this.perform((data) => {
        const newApp: DatabaseApplication = {
          ...app,
          id: "kl_app_" + Math.random().toString(36).substr(2, 9),
          clientId: "kl_client_" + Math.random().toString(36).substr(2, 8) + Math.random().toString(36).substr(2, 8),
          clientSecret: "kl_secret_" + Array.from({ length: 4 }, () => Math.random().toString(36).substr(2)).join("").substring(0, 32),
          status: "active",
          createdAt: new Date().toISOString(),
        };
        data.applications.push(newApp);
        return newApp;
      });
    },
    update: async (id: string, updates: Partial<Omit<DatabaseApplication, "id" | "clientId" | "createdAt">>): Promise<DatabaseApplication | null> => {
      return this.perform((data) => {
        const idx = data.applications.findIndex((a) => a.id === id);
        if (idx === -1) return null;
        const updated = { ...data.applications[idx], ...updates };
        data.applications[idx] = updated;
        return updated;
      });
    },
    delete: async (id: string): Promise<boolean> => {
      return this.perform((data) => {
        const beforeLen = data.applications.length;
        data.applications = data.applications.filter((a) => a.id !== id);
        return data.applications.length < beforeLen;
      });
    }
  };

  // Database Records Helpers
  public databaseRecords = {
    findMany: async (predicate?: (rec: SavedDatabaseRecord) => boolean): Promise<SavedDatabaseRecord[]> => {
      const list = this.load().database_records;
      if (predicate) return list.filter(predicate);
      return list;
    },
    create: async (payload: Omit<SavedDatabaseRecord, "id" | "createdAt">): Promise<SavedDatabaseRecord> => {
      return this.perform((data) => {
        const newRecord: SavedDatabaseRecord = {
          ...payload,
          id: "rec_" + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        data.database_records.push(newRecord);
        return newRecord;
      });
    },
    clearAll: async (clientId: string): Promise<void> => {
      this.perform((data) => {
        data.database_records = data.database_records.filter((rec) => rec.clientId !== clientId);
      });
    }
  };

  // Storage Records Helpers
  public storageRecords = {
    findMany: async (predicate?: (rec: SavedStorageRecord) => boolean): Promise<SavedStorageRecord[]> => {
      const list = this.load().storage_records;
      if (predicate) return list.filter(predicate);
      return list;
    },
    create: async (payload: Omit<SavedStorageRecord, "id" | "uploadedAt">): Promise<SavedStorageRecord> => {
      return this.perform((data) => {
        const newRecord: SavedStorageRecord = {
          ...payload,
          id: "file_" + Math.random().toString(36).substr(2, 9),
          uploadedAt: new Date().toISOString(),
        };
        data.storage_records.push(newRecord);
        return newRecord;
      });
    },
    clearAll: async (clientId: string): Promise<void> => {
      this.perform((data) => {
        data.storage_records = data.storage_records.filter((rec) => rec.clientId !== clientId);
      });
    }
  };

  // End Users Helpers
  public endUsers = {
    findMany: async (predicate?: (user: KeyLineEndUser) => boolean): Promise<KeyLineEndUser[]> => {
      const list = this.load().end_users;
      if (predicate) return list.filter(predicate);
      return list;
    },
    create: async (payload: Omit<KeyLineEndUser, "id" | "createdAt">): Promise<KeyLineEndUser> => {
      return this.perform((data) => {
        const newUser: KeyLineEndUser = {
          ...payload,
          id: "kl_usr_" + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        data.end_users.push(newUser);
        return newUser;
      });
    },
    delete: async (id: string): Promise<boolean> => {
      return this.perform((data) => {
        const beforeLen = data.end_users.length;
        data.end_users = data.end_users.filter((u) => u.id !== id);
        return data.end_users.length < beforeLen;
      });
    },
    clearAll: async (clientId: string): Promise<void> => {
      this.perform((data) => {
        data.end_users = data.end_users.filter((u) => u.clientId !== clientId);
      });
    }
  };

  // Sessions Helpers (Active persistent sessions)
  public sessions = {
    findMany: async (): Promise<DatabaseSession[]> => {
      return this.load().sessions;
    },
    findFirst: async (predicate: (s: DatabaseSession) => boolean): Promise<DatabaseSession | null> => {
      return this.load().sessions.find(predicate) || null;
    },
    create: async (session: Omit<DatabaseSession, "createdAt">): Promise<DatabaseSession> => {
      return this.perform((data) => {
        const newSession: DatabaseSession = {
          ...session,
          createdAt: new Date().toISOString(),
        };
        data.sessions.push(newSession);
        return newSession;
      });
    },
    delete: async (id: string): Promise<boolean> => {
      return this.perform((data) => {
        const beforeLen = data.sessions.length;
        data.sessions = data.sessions.filter((s) => s.id !== id);
        return data.sessions.length < beforeLen;
      });
    }
  };
}

export const db = new JsonDB();
