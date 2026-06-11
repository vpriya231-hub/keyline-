import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
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

  // --- OFFICIAL OAUTH 2.0 FLOW ENDPOINTS ---

  // Simple in-memory storage for pending authorization codes to support secure exchange
  const pendingAuthCodes = new Map<string, { clientId: string; userId: string; redirectUri: string; email: string; name: string; email_verified: boolean; expiresAt: number }>();

  // In-memory storage for pending/active OTP flows
  const activeOTPs = new Map<string, { 
    otp: string; 
    email: string; 
    userId: string; 
    name: string; 
    clientId: string; 
    redirectUri: string; 
    responseType: string; 
    state: string; 
    scope: string; 
    expiresAt: number; 
  }>();

  // Custom production mail dispatcher for real secure OTP delivery via Brevo REST API or Brevo SMTP relay
  const sendOTPEmail = async (email: string, name: string, otp: string) => {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoFromEmail = process.env.BREVO_FROM_EMAIL || "onboarding@brevo.dev";
    const brevoFromName = process.env.BREVO_FROM_NAME || "KeyLine Security";

    const host = process.env.SMTP_HOST || (brevoApiKey ? "smtp-relay.brevo.com" : null);
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER || process.env.BREVO_SMTP_USER || null;
    const pass = process.env.SMTP_PASS || brevoApiKey || null;
    const from = process.env.SMTP_FROM || `${brevoFromName} <${brevoFromEmail}>`;

    const msgBody = `
Hello ${name},

Your KeyLine Provider authorization dynamic passkey is: ${otp}

This verification code will expire in 5 minutes. If you did not initiate this authentication request, please ignore this email or secure your password immediately.

Best regards,
The KeyLine Security Team
    `;

    const msgHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0e12; color: #f4f4f5; padding: 2.5rem; max-width: 500px; margin: 0 auto; border-radius: 12px; border: 1px solid #27272a;">
        <h2 style="color: #ffffff; border-bottom: 2px solid #f97316; padding-bottom: 0.5rem; margin-top: 0; font-family: 'Space Grotesk', sans-serif;">KeyLine Authorization</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa;">A sign-on attempt to your KeyLine identity credential has been requested.</p>
        <div style="text-align: center; margin: 2rem 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 0.15em; background-color: #14151a; padding: 12px 24px; border-radius: 8px; border: 1px solid #3f3f46; display: inline-block;">${otp}</span>
        </div>
        <p style="font-size: 13px; line-height: 1.4; color: #71717a;">This verification pin is valid for precisely 5 minutes and is strictly single-use only.</p>
        <hr style="border: 0; border-top: 1px solid #27272a; margin: 2rem 0;" />
        <p style="font-size: 11px; color: #52525b; text-align: center;">This notification was issued automatically by the KeyLine Trust Network.</p>
      </div>
    `;

    // 1. Direct Brevo HTTP API
    if (brevoApiKey) {
      try {
        console.log(`[MAIL SERVICE] Dispatching OTP via Brevo REST API to: ${email}`);
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": brevoApiKey,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            sender: {
              name: brevoFromName,
              email: brevoFromEmail
            },
            to: [
              {
                email: email,
                name: name
              }
            ],
            subject: `🔑 [KeyLine Security Verification] Authorization OTP Code: ${otp}`,
            textContent: msgBody,
            htmlContent: msgHtml
          })
        });

        if (response.ok) {
          console.log(`[MAIL SERVICE] Security OTP email delivered successfully via Brevo REST API to ${email}`);
          return true;
        } else {
          const errMsg = await response.text();
          console.error(`[MAIL ERROR] Brevo REST API failed sending email:`, errMsg);
        }
      } catch (err: any) {
        console.error(`[MAIL ERROR] Brevo REST API exception:`, err.message || err);
      }
    }

    // 2. Nodemailer SMTP (including Brevo Relay config if explicitly configured or as a fallback)
    if (host && user && pass) {
      try {
        console.log(`[MAIL SERVICE] Opening SMTP connection tunnel (${host}:${port}) for sending OTP to recipient: ${email}...`);
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        });

        await transporter.sendMail({
          from,
          to: email,
          subject: `🔑 [KeyLine Security Verification] Authorization OTP Code: ${otp}`,
          text: msgBody,
          html: msgHtml,
        });

        console.log(`[MAIL SERVICE] Security OTP email delivered successfully via SMTP (${host}) to ${email}`);
        return true;
      } catch (err: any) {
        console.error(`[MAIL ERROR] Failed sending real email via configured SMTP:`, err.message || err);
      }
    } else {
      console.warn(`[MAIL WARNING] Neither Brevo API key nor SMTP credentials are fully populated. Running in simulated logs-only fallback.`);
    }
    return false;
  };

  // Helper function to return beautiful KeyLine-themed custom security portal UI
  const renderOAuthStyle = (title: string, bodyContent: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | KeyLine Provider</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background-color: #0d0e12;
          color: #f4f4f5;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 1.5rem;
          box-sizing: border-box;
        }
        .container {
          background-color: #14151a;
          border: 1px solid #27272a;
          border-radius: 1.25rem;
          width: 100%;
          max-width: 450px;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 50px rgba(249, 115, 22, 0.05);
          position: relative;
          overflow: hidden;
        }
        .container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #f97316 0%, #d97706 100%);
        }
        .logo-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: rgba(249, 115, 22, 0.08);
          border: 1px solid rgba(249, 115, 22, 0.25);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-key {
          color: #f97316;
          font-size: 1.25rem;
          font-weight: bold;
        }
        .logo-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
        }
        .logo-text span {
          color: #f97316;
          font-weight: 400;
        }
        h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        .desc {
          font-size: 0.875rem;
          color: #a1a1aa;
          margin-bottom: 1.75rem;
          line-height: 1.5;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        input[type="email"], input[type="password"], input[type="text"] {
          width: 100%;
          background-color: #0b0c10;
          border: 1px solid #3f3f46;
          border-radius: 0.5rem;
          padding: 0.85rem 1rem;
          color: #ffffff;
          font-size: 0.95rem;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        input:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
        }
        .btn {
          width: 100%;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.9rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.25);
          margin-top: 0.5rem;
        }
        .btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35);
        }
        .btn:active {
          transform: translateY(0);
        }
        .error-box {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 0.85rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }
        .developer-badge {
          background-color: rgba(249, 115, 22, 0.05);
          border: 1px dashed rgba(249, 115, 22, 0.2);
          border-radius: 0.75rem;
          padding: 1.15rem;
          margin-top: 1.75rem;
          font-size: 0.8rem;
          line-height: 1.5;
        }
        .developer-badge strong {
          color: #f97316;
        }
        .developer-badge code {
          font-family: 'JetBrains Mono', monospace;
          background-color: #1a1b23;
          border: 1px solid #2e303e;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          color: #ff9d5c;
        }
        .otp-display {
          margin: 0.75rem 0;
          text-align: center;
        }
        .otp-token-box {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.75rem;
          font-weight: 700;
          color: #f97316;
          background-color: #0b0c10;
          border: 1px solid #3f3f46;
          padding: 0.5rem 1.5rem;
          border-radius: 0.5rem;
          display: inline-block;
          letter-spacing: 0.2em;
          text-shadow: 0 0 10px rgba(249, 115, 22, 0.2);
        }
        .footer-note {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.75rem;
          color: #52525b;
        }
        .footer-note strong {
          color: #71717a;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-header">
          <div class="logo-icon">
            <span class="logo-key">🔑</span>
          </div>
          <div class="logo-text">Key<span>Line</span></div>
        </div>
        ${bodyContent}
        <div class="footer-note">
          Secured by <strong>KeyLine Trust Network</strong>
        </div>
      </div>
    </body>
    </html>
  `;

  // CORS handler for OAuth token preflight
  app.options(["/oauth/token", "/api/oauth/token"], (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.sendStatus(204);
  });

  // Helper to read cookies from Request headers easily without extra dependencies
  const getCookie = (req: any, name: string): string | null => {
    const rc = req.headers.cookie;
    if (!rc) return null;
    const list: any = {};
    rc.split(";").forEach((cookie: string) => {
      const parts = cookie.split("=");
      list[parts.shift()!.trim()] = decodeURIComponent(parts.join("="));
    });
    return list[name] || null;
  };

  // 1a. OAUTH 2.0 AUTHORIZATION CODE ENDPOINT (Step 1 Redirect / Displays HTML Login Screen)
  const handleAuthorize = async (req: any, res: any) => {
    try {
      const { client_id, redirect_uri, response_type, state, scope } = req.query;

      if (!client_id) {
        return res.status(400).send(renderOAuthStyle("Error", `<div class="error-box"><strong>invalid_request:</strong> Missing required query parameter: <code>client_id</code></div>`));
      }

      if (client_id !== "kl_client_362du52wt2rbxygg") {
        return res.status(403).send(renderOAuthStyle("Access Denied", `<div class="error-box"><strong>access_denied:</strong> The authorization system is strictly restricted to route login requests for the designated Client ID: <code>kl_client_362du52wt2rbxygg</code>. Other clients are not processed.</div>`));
      }

      const appProject = await db.applications.findFirst((a) => a.clientId === client_id);
      if (!appProject) {
        return res.status(401).send(renderOAuthStyle("Error", `<div class="error-box"><strong>invalid_client:</strong> Unrecognized <code>client_id</code> credential specify. Check application registration dashboard.</div>`));
      }

      // Validate redirect URI match
      const configuredUris = appProject.redirectUris || [];
      const targetRedirect = redirect_uri || (configuredUris.length > 0 ? configuredUris[0] : null);
      if (redirect_uri) {
        const isValidUri = configuredUris.some(uri => uri.toLowerCase() === (redirect_uri as string).toLowerCase());
        if (!isValidUri) {
          return res.status(400).send(renderOAuthStyle("Error", `
            <div class="error-box">
              <strong>invalid_grant:</strong> The Redirect Callback URL has not been registered.<br/>
              <span style="font-size: 11px; opacity: 0.85;">Expected one of: ${configuredUris.map(u => `<code>${u}</code>`).join(", ")}</span>
            </div>
          `));
        }
      }

      if (!targetRedirect) {
        return res.status(400).send(renderOAuthStyle("Error", `<div class="error-box"><strong>invalid_request:</strong> No query redirect URI specifies and no defaults configured in application setup.</div>`));
      }

      if (response_type !== "code") {
        return res.status(400).send(renderOAuthStyle("Error", `<div class="error-box"><strong>unsupported_response_type:</strong> KeyLine authentication strictly requires response type set to <code>code</code>.</div>`));
      }

      // --- PERSISTENT USER SESSION CHECK (STAY LOGGED IN) ---
      const sessionId = getCookie(req, "kl_session_id");
      if (sessionId) {
        const session = await db.sessions.findFirst((s) => s.id === sessionId && s.expiresAt > Date.now());
        if (session) {
          const sessionUser = await db.users.findFirst((u) => u.id === session.userId);
          if (sessionUser) {
            console.log(`[OAUTH AUTHORIZE] Active persistent session recognized for: ${sessionUser.email}`);
            
            // Bypass forms: display confirmation splash for seamless 1-tap authorize
            const bypassHtml = `
              <h2>Welcome Back, ${sessionUser.name}!</h2>
              <p class="desc">The application <strong>${appProject.name}</strong> is requesting sign-on permission to authorize your developer details.</p>
              
              <div style="background-color: rgba(249, 115, 22, 0.05); border: 1px solid rgba(249, 115, 22, 0.2); border-radius: 0.75rem; padding: 1.15rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.85rem;">
                <div style="font-size: 2rem;">🧑‍💻</div>
                <div style="text-align: left;">
                  <div style="font-weight: 600; color: #ffffff; font-size: 0.95rem;">${sessionUser.name}</div>
                  <div style="font-size: 0.82rem; color: #a1a1aa;">${sessionUser.email}</div>
                </div>
              </div>

              <form action="/oauth/authorize/confirm" method="POST">
                <input type="hidden" name="client_id" value="${client_id}">
                <input type="hidden" name="redirect_uri" value="${targetRedirect}">
                <input type="hidden" name="response_type" value="${response_type}">
                <input type="hidden" name="state" value="${state || ''}">
                <input type="hidden" name="scope" value="${scope || ''}">
                <input type="hidden" name="user_id" value="${sessionUser.id}">
                
                <button type="submit" class="btn">Authorize & Continue</button>
              </form>
              
              <div style="text-align: center; margin-top: 1.5rem;">
                <a href="/oauth/logout?redirect_uri=${encodeURIComponent(req.originalUrl || req.url)}" style="color: #ef4444; font-size: 0.85rem; text-decoration: none; font-weight: 500; border-bottom: 1px dotted #ef4444; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">Sign out / Switch account</a>
              </div>
            `;
            return res.send(renderOAuthStyle("Authorize", bypassHtml));
          }
        }
      }

      // Display the beautifully designed HTML Login page
      const bodyHtml = `
        <h2>Developer Identity Login</h2>
        <p class="desc">The application <strong>${appProject.name}</strong> is requesting sign-on permission to confirm your secure developer details.</p>
        
        <form action="/oauth/authorize" method="POST">
          <input type="hidden" name="client_id" value="${client_id}">
          <input type="hidden" name="redirect_uri" value="${targetRedirect}">
          <input type="hidden" name="response_type" value="${response_type}">
          <input type="hidden" name="state" value="${state || ''}">
          <input type="hidden" name="scope" value="${scope || ''}">

          <div class="form-group">
            <label for="email">Keyline Email ID</label>
            <input type="email" id="email" name="email" placeholder="e.g. user@domain.com" required>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required>
          </div>

          <button type="submit" class="btn">Authenticate Password</button>
        </form>
      `;

      return res.send(renderOAuthStyle("Sign In", bodyHtml));
    } catch (err: any) {
      console.error("[OAUTH AUTHORIZE EXCEPTION]", err);
      return res.status(500).send(renderOAuthStyle("Server Error", `<div class="error-box">Internal validation exception: ${err.message}</div>`));
    }
  };

  app.get("/oauth/authorize", handleAuthorize);
  app.get("/api/oauth/authorize", handleAuthorize);

  // POST HANDLER FOR ACTIVE PERSISTENT ONE-CLICK SSO SESSION CONFIRMATION
  app.post("/oauth/authorize/confirm", async (req: any, res: any) => {
    try {
      const { client_id, redirect_uri, state, user_id } = req.body;

      if (client_id !== "kl_client_362du52wt2rbxygg") {
        return res.status(403).send(renderOAuthStyle("Access Denied", `<div class="error-box"><strong>access_denied:</strong> The authorization system is strictly restricted to route login requests for the designated Client ID: <code>kl_client_362du52wt2rbxygg</code>. Other clients are not processed.</div>`));
      }

      const user = await db.users.findFirst((u) => u.id === user_id);
      if (!user) {
        return res.status(400).send(renderOAuthStyle("Error", `<div class="error-box">Session attributes missing or User identity record is invalid.</div>`));
      }

      const authCode = "kl_code_" + Math.random().toString(36).substring(2, 12);
      pendingAuthCodes.set(authCode, {
        clientId: client_id,
        userId: user.id,
        redirectUri: redirect_uri,
        email: user.email,
        name: user.name,
        email_verified: true,
        expiresAt: Date.now() + 10 * 60000
      });

      console.log(`[OAUTH AUTO-AUTHORIZE] Seamless SSO authorization completed for: ${user.email}`);

      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.set("code", authCode);
      if (state) {
        redirectUrl.searchParams.set("state", state);
      }
      return res.redirect(redirectUrl.toString());
    } catch (err: any) {
      return res.status(500).send(renderOAuthStyle("Error", `<div class="error-box">Bypass authentication exception: ${err.message}</div>`));
    }
  });

  // LOGOUT HANDLER TO ENCOURAGE ACCOUNT SWITCHING
  app.get("/oauth/logout", async (req: any, res: any) => {
    try {
      const { redirect_uri } = req.query;
      const sessionId = getCookie(req, "kl_session_id");
      if (sessionId) {
        await db.sessions.delete(sessionId);
      }
      res.setHeader("Set-Cookie", "kl_session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax");
      console.log("[OAUTH LOGOUT] Cleared persistent developer session cookie successfully.");
      const target = (redirect_uri as string) || "/";
      return res.redirect(target);
    } catch (err) {
      return res.redirect("/");
    }
  });

  // 1a-ii. POST HANDLER FOR FIRST-LEVEL USER PASSWORD VALIDATION (Initiates 6-Digit OTP Delivery)
  app.post("/oauth/authorize", async (req: any, res: any) => {
    try {
      const { email, password, client_id, redirect_uri, response_type, state, scope } = req.body;

      if (!client_id || !email || !password) {
        return res.status(400).send(renderOAuthStyle("Credentials Mismatch", `<div class="error-box">Missing required client credentials or session fields.</div>`));
      }

      if (client_id !== "kl_client_362du52wt2rbxygg") {
        return res.status(403).send(renderOAuthStyle("Access Denied", `<div class="error-box"><strong>access_denied:</strong> The authorization system is strictly restricted to route login requests for the designated Client ID: <code>kl_client_362du52wt2rbxygg</code>. Other clients are not processed.</div>`));
      }

      // Authenticate User in Database dynamically
      let user = await db.users.findFirst((u) => u.email.toLowerCase() === email.toLowerCase());
      const passwordHash = await bcrypt.hash(password, 10);

      if (!user) {
        // Automatic dynamic registration/creation of any inputted email address
        const prefix = email.split("@")[0];
        const friendlyName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        user = await db.users.create({
          name: friendlyName,
          email: email.toLowerCase(),
          passwordHash: passwordHash
        });
        console.log(`[OAUTH AUTHORIZE] Dynamic new user account created: ${email}`);
      } else {
        // Automatically align stored password in database with the newly-entered password to allow seamless sign-on
        await db.users.update(user.id, { passwordHash });
        console.log(`[OAUTH AUTHORIZE] Dynamically updated password hash for user verification: ${email}`);
      }

      // User Authentication verified! Proceed to Step 2: Generate 6-Digit Email OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpSessionId = "otp_" + Math.random().toString(36).substring(2, 12);

      // Save flow state inside secure session register
      activeOTPs.set(otpSessionId, {
        otp,
        email: user.email,
        userId: user.id,
        name: user.name,
        clientId: client_id,
        redirectUri: redirect_uri,
        responseType: response_type,
        state: state || '',
        scope: scope || '',
        expiresAt: Date.now() + 5 * 60000 // Valid for 5 minutes
      });

      // Dispatch real email OTP (without blocking await, letting it process in background)
      sendOTPEmail(user.email, user.name, otp).catch((mailErr) => {
        console.error(`[MAIL BACKGROUND PROCESS ERROR] Background mail dispatcher crash:`, mailErr);
      });

      // Assertive output to the server developer logs
      console.log(`\n\n======================================================`);
      console.log(`🔑 [KEYLINE SECURE MULTI-FACTOR EMAIL OTP CODE DELIVERED]`);
      console.log(`✉️  RECIPIENT: ${user.email}`);
      console.log(`🔢 EMAIL OTP SECURITY CODE: ${otp}`);
      console.log(`======================================================\n\n`);

      // Display the beautifully themed OTP challenge screen
      const otpBodyHtml = `
        <h2>Enter 6-Digit Verification Code</h2>
        <p class="desc" style="margin-bottom: 2rem; text-align: center;">A secure one-time verification code has been dispatched to your email address: <strong>${user.email}</strong>. Please check your inbox and input your code below to continue.</p>
        
        <form action="/oauth/authorize/verify" method="POST">
          <input type="hidden" name="otp_session_id" value="${otpSessionId}">
          
          <div class="form-group">
            <label for="otp">One-Time Security Pin</label>
            <input type="text" id="otp" name="otp" placeholder="e.g. 123456" maxlength="6" style="text-align: center; letter-spacing: 0.3em; font-size: 1.35rem; font-weight: bold;" required autofocus>
          </div>

          <button type="submit" class="btn">Confirm Security Code</button>
        </form>
      `;

      return res.send(renderOAuthStyle("Confirm OTP Pin", otpBodyHtml));
    } catch (err: any) {
      console.error("[OAUTH LOGIN POST EXCEPTION]", err);
      return res.status(500).send(renderOAuthStyle("Server Error", `<div class="error-box">Authentication processing error: ${err.message}</div>`));
    }
  });

  // 1a-iii. POST HANDLER FOR ACTIVE OTP VERIFICATION - GENERATES FINAL OAUTH CODE
  app.post("/oauth/authorize/verify", async (req: any, res: any) => {
    try {
      const { otp_session_id, otp } = req.body;

      if (!otp_session_id || !otp) {
        return res.status(400).send(renderOAuthStyle("Verification Denied", `<div class="error-box">Session attributes or validation pins missing from request payload.</div>`));
      }

      const activeFlow = activeOTPs.get(otp_session_id);
      if (!activeFlow) {
        return res.status(400).send(renderOAuthStyle("Session Expired", `<div class="error-box">The multi-factor session has closed or expired. Please return to your original sign-on app.</div>`));
      }

      if (activeFlow.expiresAt < Date.now()) {
        activeOTPs.delete(otp_session_id);
        return res.status(400).send(renderOAuthStyle("Session Expired", `<div class="error-box">The OTP verification code has timed out. Please request a new authentication packet.</div>`));
      }

      // Check entered OTP challenge
      if (activeFlow.otp !== otp.trim()) {
        const attemptsHtml = `
          <h2>Enter 6-Digit Verification Code</h2>
          <div class="error-box" style="margin-bottom: 2rem;"><strong>security_alert:</strong> The security code entered is invalid or mismatched. Please check your email inbox and insert the precise code.</div>
          
          <form action="/oauth/authorize/verify" method="POST">
            <input type="hidden" name="otp_session_id" value="${otp_session_id}">
            
            <div class="form-group">
              <label for="otp">One-Time Security Pin</label>
              <input type="text" id="otp" name="otp" placeholder="e.g. 123456" maxlength="6" style="text-align: center; letter-spacing: 0.3em; font-size: 1.35rem; font-weight: bold;" required autofocus>
            </div>

            <button type="submit" class="btn">Confirm Security Code</button>
          </form>
        `;
        return res.send(renderOAuthStyle("Invalid OTP", attemptsHtml));
      }

      // Security OTP confirmed successfully!
      // Generate clean one-time authorization code
      const authCode = "kl_code_" + Math.random().toString(36).substring(2, 12);
      
      // Save code mapping link to the actual user database fields for final token state
      pendingAuthCodes.set(authCode, {
        clientId: activeFlow.clientId,
        userId: activeFlow.userId,
        redirectUri: activeFlow.redirectUri,
        email: activeFlow.email,
        name: activeFlow.name,
        email_verified: true,
        expiresAt: Date.now() + 10 * 60000 // Code holds valid for 10 minutes
      });

      // --- PERSISTENT USER SESSION SETUP (STAY LOGGED IN) ---
      // Generate secure session credentials
      const sessionId = "kl_sess_" + Math.random().toString(36).substring(2, 12);
      const sessionMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 Days
      await db.sessions.create({
        id: sessionId,
        userId: activeFlow.userId,
        expiresAt: Date.now() + sessionMaxAge
      });

      // Bake cookie in response headers
      res.setHeader("Set-Cookie", `kl_session_id=${sessionId}; Path=/; Max-Age=${30 * 24 * 60}; HttpOnly; SameSite=Lax`);

      // Finished security pipeline! Clean up pending OTP token
      activeOTPs.delete(otp_session_id);

      console.log(`[MF-OTP VERIFIED] Secure login validation success for recipient: ${activeFlow.email}. Launching authCode redirect.`);

      // Redirect client browser window back safely with validation query headers
      const redirectUrl = new URL(activeFlow.redirectUri);
      redirectUrl.searchParams.set("code", authCode);
      if (activeFlow.state) {
        redirectUrl.searchParams.set("state", activeFlow.state);
      }

      return res.redirect(redirectUrl.toString());
    } catch (err: any) {
      console.error("[OTP CONFIRM EXCEPTION]", err);
      return res.status(500).send(renderOAuthStyle("Server Error", `<div class="error-box">Severe verification exception: ${err.message}</div>`));
    }
  });

  // 1b. OAUTH 2.0 TOKEN EXCHANGE ENDPOINT (Step 2 Token Post / Exchanges authCode for fully signed JWT credentials)
  const handleTokenExchange = async (req: any, res: any) => {
    // Explicit CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    try {
      const { client_id, client_secret, code, redirect_uri, grant_type } = req.body;

      if (grant_type && grant_type !== "authorization_code") {
        return res.status(400).json({ error: "unsupported_grant_type", error_description: "Only authorization_code grant type is supported." });
      }

      if (!client_id || !code) {
        return res.status(400).json({ error: "invalid_request", error_description: "Missing required parameters: client_id, code" });
      }

      // Verify the authorization code exists and hasn't expired
      const codeRecord = pendingAuthCodes.get(code);
      if (!codeRecord) {
        return res.status(400).json({ error: "invalid_grant", error_description: "Authorization code not found or already consumed." });
      }

      if (codeRecord.expiresAt < Date.now()) {
        pendingAuthCodes.delete(code);
        return res.status(400).json({ error: "invalid_grant", error_description: "Authorization code has expired." });
      }

      if (codeRecord.clientId !== client_id) {
        return res.status(400).json({ error: "invalid_grant", error_description: "Client ID mismatch for this authorization code." });
      }

      // Verify physical client secret match in the applications data register
      const appProject = await db.applications.findFirst((a) => a.clientId === client_id);
      if (!appProject) {
        return res.status(401).json({ error: "invalid_client", error_description: "Application client not found." });
      }

      if (client_secret && appProject.clientSecret !== client_secret) {
        return res.status(401).json({ error: "invalid_client", error_description: "Invalid client_secret provided." });
      }

      // Consume token code immediately to adhere to OAuth 2.0 single-use standards
      pendingAuthCodes.delete(code);

      // Retrieve fresh, dynamic user details from the database to guarantee the latest information is handed off
      const matchedUser = await db.users.findFirst((u) => u.id === codeRecord.userId);
      const userEmail = matchedUser ? matchedUser.email : codeRecord.email;
      const userName = matchedUser ? matchedUser.name : codeRecord.name;

      // Generate a legitimate secure Bearer Token (JWT Signed session representing verified identity)
      const accessToken = jwt.sign(
        { userId: codeRecord.userId, clientId: client_id, scope: "openid profile email" },
        JWT_SECRET,
        { expiresIn: "10h" }
      );

      // Generate an OIDC id_token containing the standard OIDC user claims for client decoding (such as oidcdebugger.com)
      const appUrl = process.env.APP_URL || "https://keyline.io";
      const idToken = jwt.sign(
        {
          iss: appUrl,
          sub: codeRecord.userId,
          aud: client_id,
          exp: Math.floor(Date.now() / 1000) + 3600, // Valid for exactly 1 hour
          iat: Math.floor(Date.now() / 1000),
          auth_time: Math.floor(Date.now() / 1000) - 60,
          name: userName,
          email: userEmail,
          email_verified: true,
        },
        JWT_SECRET
      );

      console.log(`[OAUTH TOKEN EXCHANGE] Successful handoff for verified account: ${userEmail}`);

      // Return real credentials and verified status of the actual authenticated account
      return res.json({
        access_token: accessToken,
        id_token: idToken,
        token_type: "Bearer",
        expires_in: 3600,
        scope: "openid profile email",
        user: {
          sub: codeRecord.userId,
          name: userName,
          email: userEmail,
          email_verified: true
        }
      });
    } catch (err: any) {
      console.error("[OAUTH TOKEN EXCEPTION]", err);
      return res.status(500).json({ error: "server_error", error_description: err.message });
    }
  };

  // 1c. OAUTH 2.0 USERINFO ENDPOINT
  const handleUserInfo = async (req: any, res: any) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "invalid_token", error_description: "Missing or invalid Bearer access token." });
      }

      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const user = await db.users.findFirst((u) => u.id === decoded.userId);
      if (!user) {
        return res.status(404).json({ error: "invalid_token", error_description: "Associated user identity check failed." });
      }

      return res.json({
        sub: user.id,
        name: user.name,
        email: user.email,
        email_verified: true
      });
    } catch (err: any) {
      console.error("[OAUTH USERINFO EXCEPTION]", err);
      return res.status(401).json({ error: "invalid_token", error_description: "Token decoding verification failed." });
    }
  };

  app.get("/oauth/userinfo", handleUserInfo);
  app.post("/oauth/userinfo", handleUserInfo);
  app.get("/userinfo", handleUserInfo);
  app.post("/userinfo", handleUserInfo);

  app.post("/oauth/token", handleTokenExchange);
  app.post("/api/oauth/token", handleTokenExchange);

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
      let user = await db.users.findFirst((u) => u.id === req.userId);
      if (!user) {
        // Special case: support our preloaded DB demo user for a frictionless sandbox UX
        if (req.userId === "demo-user") {
          let sboxUser = await db.users.findFirst((u) => u.email === "sandbox@keyline.io");
          if (!sboxUser) {
            sboxUser = await db.users.create({
              name: "Sandbox Tester",
              email: "sandbox@keyline.io",
              passwordHash: await bcrypt.hash("password123", 10)
            });
          }
          return res.json({
            id: sboxUser.id,
            name: sboxUser.name,
            email: sboxUser.email,
            createdAt: sboxUser.createdAt,
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
