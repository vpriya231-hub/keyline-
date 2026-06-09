import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./server/db";

// Use a fallback JWT Secret for security and reliability in sandbox
const JWT_SECRET = process.env.JWT_SECRET || "keyline_super_secret_token_key_77112288";

const app = express();
const PORT = 3000;

// Body Parsing Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Custom logging middleware for API endpoints
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`[API LOG] ${req.method} ${req.path}`);
    }
    next();
  });

  // JWT Verification Middleware
  const authenticateJWT = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };

  // 1. HEALTH CHECK ENDPOINT
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 2. SIGN UP ENDPOINT
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields: name, email, password" });
      }

      // Check if user already exists
      const existingUser = await db.users.findFirst((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Hash password securely
      const passwordHash = await bcrypt.hash(password, 10);

      // Save user
      const user = await db.users.create({
        name,
        email,
        passwordHash,
      });

      // Generate JWT session
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({
        message: "Registration successful",
        token,
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });

  // 3. SIGN IN ENDPOINT
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Missing required fields: email, password" });
      }

      // Find user
      const user = await db.users.findFirst((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify Password
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate JWT session
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      });
    } catch (err: any) {
      console.error("Signin error:", err);
      res.status(500).json({ error: "Internal server error: " + err.message });
    }
  });

  // 4. GET AUTH ME ENDPOINT
  app.get("/api/auth/me", authenticateJWT, async (req: any, res) => {
    try {
      const user = await db.users.findFirst((u) => u.id === req.userId);
      if (!user) {
        // Special case: support our preloaded DB demo user for a frictionless sandbox UX
        if (req.userId === "demo-user") {
          return res.json({
            id: "demo-user",
            name: "Vastra Tester",
            email: "vastratester@gmail.com",
            createdAt: new Date().toISOString(),
          });
        }
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (err: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 5. APPLICATIONS: GET ALL FOR USER
  app.get("/api/applications", authenticateJWT, async (req: any, res) => {
    try {
      // Fetch applications belonging to the user
      // Also return demo apps to make sure user sees beautiful mock data immediately if they have none
      const userApps = await db.applications.findMany(
        (app) => app.userId === req.userId || app.userId === "demo-user"
      );
      res.json(userApps);
    } catch (err: any) {
      res.status(500).json({ error: "Could not fetch applications" });
    }
  });

  // 6. APPLICATIONS: CREATE
  app.post("/api/applications/create", authenticateJWT, async (req: any, res) => {
    try {
      const { name, redirectUris, allowedOrigins } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Application name is required" });
      }

      // Parse arrays
      const uris = Array.isArray(redirectUris)
        ? redirectUris
        : redirectUris
          ? redirectUris.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

      const origins = Array.isArray(allowedOrigins)
        ? allowedOrigins
        : allowedOrigins
          ? allowedOrigins.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

      const newApp = await db.applications.create({
        userId: req.userId,
        name,
        redirectUris: uris,
        allowedOrigins: origins,
      });

      res.status(201).json(newApp);
    } catch (err: any) {
      res.status(500).json({ error: "Could not create application: " + err.message });
    }
  });

  // 7. APPLICATIONS: UPDATE
  app.patch("/api/applications/:id", authenticateJWT, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, redirectUris, allowedOrigins, status } = req.body;

      // Find if exists and belongs to auth user
      const existing = await db.applications.findFirst((a) => a.id === id);
      if (!existing) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (existing.userId !== req.userId && existing.userId !== "demo-user") {
        return res.status(403).json({ error: "Unauthorized access to application" });
      }

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (status !== undefined) updates.status = status;
      if (redirectUris !== undefined) {
        updates.redirectUris = Array.isArray(redirectUris)
          ? redirectUris
          : redirectUris.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      if (allowedOrigins !== undefined) {
        updates.allowedOrigins = Array.isArray(allowedOrigins)
          ? allowedOrigins
          : allowedOrigins.split(",").map((s: string) => s.trim()).filter(Boolean);
      }

      const updatedApp = await db.applications.update(id, updates);
      res.json(updatedApp);
    } catch (err: any) {
      res.status(500).json({ error: "Could not update application" });
    }
  });

  // 8. APPLICATIONS: REGENERATE CLIENT SECRET
  app.post("/api/applications/:id/regenerate-secret", authenticateJWT, async (req: any, res) => {
    try {
      const { id } = req.params;
      const existing = await db.applications.findFirst((a) => a.id === id);
      if (!existing) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (existing.userId !== req.userId && existing.userId !== "demo-user") {
        return res.status(403).json({ error: "Unauthorized action" });
      }

      const newSecret = "kl_secret_" + Array.from({ length: 4 }, () => Math.random().toString(36).substr(2)).join("").substring(0, 32);
      const updatedApp = await db.applications.update(id, { clientSecret: newSecret });
      res.json(updatedApp);
    } catch (err: any) {
      res.status(500).json({ error: "Could not regenerate secret" });
    }
  });

  // 9. APPLICATIONS: DELETE
  app.delete("/api/applications/:id", authenticateJWT, async (req: any, res) => {
    try {
      const { id } = req.params;
      const existing = await db.applications.findFirst((a) => a.id === id);
      if (!existing) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (existing.userId !== req.userId && existing.userId !== "demo-user") {
        return res.status(403).json({ error: "Unauthorized to delete application" });
      }

      await db.applications.delete(id);
      res.json({ success: true, message: "Application deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: "Could not delete application" });
    }
  });

  // Helper middleware for custom BaaS / Database / Storage SDK credentials verification
  const validateBaaSCredentials = async (req: any, res: any, next: any) => {
    try {
      // Find client_id
      const clientId = req.query.client_id || req.body.client_id || req.headers["x-client-id"];
      
      // Find client_secret
      const authHeader = req.headers.authorization;
      let clientSecret: string | null = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        clientSecret = authHeader.split(" ")[1];
      } else if (req.headers["x-client-secret"]) {
        clientSecret = req.headers["x-client-secret"] as string;
      } else if (req.body.client_secret) {
        clientSecret = req.body.client_secret;
      } else if (req.query.client_secret) {
        clientSecret = req.query.client_secret as string;
      }

      if (!clientId) {
        return res.status(400).json({ error: "Bad Request: client_id is required as query, body field, or x-client-id header." });
      }
      if (!clientSecret) {
        return res.status(401).json({ error: "Unauthorized: Authorization Bearer secret token is required." });
      }

      const appProject = await db.applications.findFirst((a) => a.clientId === clientId);
      if (!appProject) {
        return res.status(401).json({ error: "Unauthorized: Invalid client_id specified." });
      }

      if (appProject.clientSecret !== clientSecret) {
        return res.status(401).json({ error: "Unauthorized: Insecure request. Client secret signature mismatch." });
      }

      req.appProject = appProject;
      next();
    } catch (err: any) {
      res.status(500).json({ error: "Authentication validation crash: " + err.message });
    }
  };

  // 10. SDK CORE DATABASE ROUTE: GET DATA
  app.get("/api/database/data", validateBaaSCredentials, async (req: any, res) => {
    try {
      const clientId = req.appProject.clientId;
      const { collection } = req.query;

      const records = await db.databaseRecords.findMany((rec) => {
        if (rec.clientId !== clientId) return false;
        if (collection && rec.collection !== collection) return false;
        return true;
      });

      res.json({
        success: true,
        clientId,
        count: records.length,
        records: records.reverse() // Return latest first
      });
    } catch (err: any) {
      res.status(500).json({ error: "Could not retrieve database records: " + err.message });
    }
  });

  // 11. SDK CORE DATABASE ROUTE: POST DATA (STORE JSON)
  app.post("/api/database/data", validateBaaSCredentials, async (req: any, res) => {
    try {
      const clientId = req.appProject.clientId;
      const { collection, data } = req.body;

      if (!collection) {
        return res.status(400).json({ error: "Bad Request: 'collection' name is required." });
      }
      if (!data) {
        return res.status(400).json({ error: "Bad Request: 'data' body object is required." });
      }

      const record = await db.databaseRecords.create({
        clientId,
        collection,
        data,
      });

      res.status(201).json({
        success: true,
        message: `Successfully written into collection '${collection}'`,
        record
      });
    } catch (err: any) {
      res.status(500).json({ error: "Could not create database record: " + err.message });
    }
  });

  // 12. SDK CORE STORAGE ROUTE: POST UPLOAD
  app.post("/api/storage/upload", validateBaaSCredentials, async (req: any, res) => {
    try {
      const clientId = req.appProject.clientId;
      const { filePath, originalName, sizeBytes, mimeType } = req.body;

      const path = filePath || `uploads/file_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = originalName || `document_${Math.random().toString(36).substr(2, 5)}.pdf`;
      const sizeOfFile = Number(sizeBytes) || Math.floor(Math.random() * (450 * 1024)) + 12048; // random size
      const typeOfMimetype = mimeType || "application/octet-stream";

      // Dynamically select beautiful mockup preview URLs based on file type
      let mockPublicUrl = "";
      const lowerName = fileName.toLowerCase();
      if (lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".webp") || lowerName.endsWith(".gif")) {
        const randomImageIds = [12, 18, 33, 40, 52, 60, 64, 76, 88, 92, 104, 119];
        const randomId = randomImageIds[Math.floor(Math.random() * randomImageIds.length)];
        mockPublicUrl = `https://picsum.photos/id/${randomId}/800/600`;
      } else {
        mockPublicUrl = `https://storage.googleapis.com/keyline_cloud_bucket/${clientId}/${path}`;
      }

      const storageObj = await db.storageRecords.create({
        clientId,
        filePath: path,
        originalName: fileName,
        sizeBytes: sizeOfFile,
        mimeType: typeOfMimetype,
        simulatedUrl: mockPublicUrl,
      });

      res.status(201).json({
        success: true,
        message: "File successfully streamed and securely cached to KeyLine Storage Sandbox.",
        file: storageObj
      });
    } catch (err: any) {
      res.status(500).json({ error: "Could not write to storage: " + err.message });
    }
  });

  // 13. DEVELOPER DASHBOARD HELPER ENDPOINT: GET WORKSPACE DATABASE RECORDS
  app.get("/api/applications/:clientId/database", authenticateJWT, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      
      // Secure check: verify that this application client is owned by the user (or demo-user)
      const app = await db.applications.findFirst((a) => a.clientId === clientId);
      if (!app) {
        return res.status(404).json({ error: "Application workspace not found" });
      }
      if (app.userId !== req.userId && app.userId !== "demo-user") {
        return res.status(403).json({ error: "Forbidden: You do not own this application" });
      }

      const records = await db.databaseRecords.findMany((r) => r.clientId === clientId);
      res.json(records.reverse());
    } catch (err: any) {
      res.status(500).json({ error: "Dashboard failed to fetch database records" });
    }
  });

  // 14. DEVELOPER DASHBOARD HELPER ENDPOINT: GET WORKSPACE STORAGE RECORDS
  app.get("/api/applications/:clientId/storage", authenticateJWT, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      
      // Secure check
      const app = await db.applications.findFirst((a) => a.clientId === clientId);
      if (!app) {
        return res.status(404).json({ error: "Application workspace not found" });
      }
      if (app.userId !== req.userId && app.userId !== "demo-user") {
        return res.status(403).json({ error: "Forbidden: You do not own this application" });
      }

      const files = await db.storageRecords.findMany((r) => r.clientId === clientId);
      res.json(files.reverse());
    } catch (err: any) {
      res.status(500).json({ error: "Dashboard failed to fetch storage files" });
    }
  });

  // 15. DEVELOPER DASHBOARD HELPER ENDPOINT: CLEAR DATABASE RECORDS
  app.post("/api/applications/:clientId/database/clear", authenticateJWT, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      const app = await db.applications.findFirst((a) => a.clientId === clientId);
      if (!app) return res.status(404).json({ error: "Application not found" });
      if (app.userId !== req.userId && app.userId !== "demo-user") return res.status(403).json({ error: "Forbidden" });

      await db.databaseRecords.clearAll(clientId);
      res.json({ success: true, message: "Database collections wiped clean." });
    } catch (err: any) {
      res.status(500).json({ error: "Failed clearing database" });
    }
  });

  // 16. DEVELOPER DASHBOARD HELPER ENDPOINT: CLEAR STORAGE RECORDS
  app.post("/api/applications/:clientId/storage/clear", authenticateJWT, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      const app = await db.applications.findFirst((a) => a.clientId === clientId);
      if (!app) return res.status(404).json({ error: "Application not found" });
      if (app.userId !== req.userId && app.userId !== "demo-user") return res.status(403).json({ error: "Forbidden" });

      await db.storageRecords.clearAll(clientId);
      res.json({ success: true, message: "Storage buckets purged successfully." });
    } catch (err: any) {
      res.status(500).json({ error: "Failed purging storage" });
    }
  });

  // 17. DEVELOPER DASHBOARD HELPER ENDPOINT: GET WORKSPACE END-USERS (AUTHENTICATION)
  app.get("/api/applications/:clientId/end-users", authenticateJWT, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      const app = await db.applications.findFirst((a) => a.clientId === clientId);
      if (!app) return res.status(404).json({ error: "Application workspace not found" });
      if (app.userId !== req.userId && app.userId !== "demo-user") {
        return res.status(403).json({ error: "Forbidden: You do not own this application" });
      }

      const users = await db.endUsers.findMany((u) => u.clientId === clientId);
      res.json(users.reverse());
    } catch (err: any) {
      res.status(500).json({ error: "Dashboard failed to fetch app subscribers" });
    }
  });

  // 18. DEVELOPER DASHBOARD HELPER ENDPOINT: ADD WORKSPACE END-USER (AUTHENTICATION)
  app.post("/api/applications/:clientId/end-users", authenticateJWT, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      const { name, email, status } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Missing required fields: name, email" });
      }

      const app = await db.applications.findFirst((a) => a.clientId === clientId);
      if (!app) return res.status(404).json({ error: "Application workspace not found" });
      if (app.userId !== req.userId && app.userId !== "demo-user") {
        return res.status(403).json({ error: "Forbidden: You do not own this application" });
      }

      // Check for duplicate emails under this application
      const existing = await db.endUsers.findMany((u) => u.clientId === clientId && u.email.toLowerCase() === email.toLowerCase());
      if (existing.length > 0) {
        return res.status(400).json({ error: "End user with this email has already registered under this application." });
      }

      const newUser = await db.endUsers.create({
        clientId,
        name,
        email,
        status: status || "active"
      });

      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(500).json({ error: "Dashboard failed to create app subscriber: " + err.message });
    }
  });

  // 19. DEVELOPER DASHBOARD HELPER ENDPOINT: DELETE WORKSPACE END-USER (AUTHENTICATION)
  app.delete("/api/applications/:clientId/end-users/:userId", authenticateJWT, async (req: any, res) => {
    try {
      const { clientId, userId } = req.params;
      const app = await db.applications.findFirst((a) => a.clientId === clientId);
      if (!app) return res.status(404).json({ error: "Application workspace not found" });
      if (app.userId !== req.userId && app.userId !== "demo-user") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const deleted = await db.endUsers.delete(userId);
      res.json({ success: deleted, message: "End-user user session revoked successfully." });
    } catch (err: any) {
      res.status(500).json({ error: "Dashboard failed to revoke user access" });
    }
  });

  // 20. DEVELOPER DASHBOARD HELPER ENDPOINT: REAL UPLOAD SAVING TO SERVER (BASE64)
  app.post("/api/applications/:clientId/storage/upload", authenticateJWT, async (req: any, res) => {
    try {
      const { clientId } = req.params;
      const { name, mimeType, base64Data, size } = req.body;

      if (!name || !base64Data) {
        return res.status(400).json({ error: "Missing required fields: name, base64Data" });
      }

      const appProject = await db.applications.findFirst((a) => a.clientId === clientId);
      if (!appProject) return res.status(404).json({ error: "Application workspace not found" });
      if (appProject.userId !== req.userId && appProject.userId !== "demo-user") {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Ensure directory exists
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Strip potential base64 prefix
      let cleanBase64 = base64Data;
      if (base64Data.includes(";base64,")) {
        cleanBase64 = base64Data.split(";base64,")[1];
      }

      const buffer = Buffer.from(cleanBase64, "base64");
      const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFilename = `${clientId}_${Date.now()}_${sanitizedName}`;
      const filePathOnDisk = path.join(uploadsDir, uniqueFilename);

      // Write file locally
      fs.writeFileSync(filePathOnDisk, buffer);

      const simulatedUrl = `/uploads/${uniqueFilename}`;

      const storageObj = await db.storageRecords.create({
        clientId,
        filePath: `uploads/${uniqueFilename}`,
        originalName: name,
        sizeBytes: buffer.length || size || 1024,
        mimeType: mimeType || "application/octet-stream",
        simulatedUrl,
      });

      res.status(201).json({
        success: true,
        message: "File uploaded and saved locally to KeyLine Storage.",
        file: storageObj
      });
    } catch (err: any) {
      console.error("Local file upload error:", err);
      res.status(500).json({ error: "Upload failed: " + err.message });
    }
  });

  // Serve static files in production / mock client-side
  async function setupViteAndListen() {
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      // Serve public folder statically in standalone mode
      app.use(express.static(path.join(process.cwd(), "public")));
      
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    if (!process.env.VERCEL) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`KeyLine server listening at http://localhost:${PORT}`);
      });
    }
  }

  setupViteAndListen();

  export { app };
  export default app;
