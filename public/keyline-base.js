/**
 * KeyLine Front-end SDK v1.0.0
 * (C) 2026 KeyLine Inc. All rights reserved.
 * 
 * Secure identity platform for modern apps.
 */

class KeyLineClient {
  /**
   * @param {Object} config
   * @param {string} config.clientId - The Client ID of your KeyLine Application.
   * @param {string} [config.clientSecret] - Optional Client Secret for secure Database and Storage APIs.
   * @param {string} config.redirectUri - The registered OAuth callback URI.
   * @param {string} [config.authorizationUrl] - Custom OAuth provider authorization URL.
   */
  constructor({ clientId, clientSecret, redirectUri, authorizationUrl }) {
    if (!clientId) {
      throw new Error("[KeyLine SDK] Missing required option: clientId");
    }
    if (!redirectUri) {
      throw new Error("[KeyLine SDK] Missing required option: redirectUri");
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret || "";
    this.redirectUri = redirectUri;
    this.authorizationUrl = authorizationUrl || window.location.origin + "/oauth/authorize";
  }

  /**
   * Redirects the current browser window to the KeyLine Identity Provider to initiate auth.
   */
  loginWithRedirect(options = {}) {
    const { state, scope = "openid profile email" } = options;
    const generatedState = state || Math.random().toString(36).substring(2, 15);
    
    // Save state to localStorage to prevent CSRF attacks on return
    localStorage.setItem(`kl_state_${this.clientId}`, generatedState);

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: scope,
      state: generatedState,
    });

    const targetUrl = `${this.authorizationUrl}?${params.toString()}`;
    
    console.log(`[KeyLine SDK] Initiating login with client: ${this.clientId}`);
    console.log(`[KeyLine SDK] Redirecting to: ${targetUrl}`);
    
    // Provide a beautiful visual animation in CLI/Console
    console.log(
      `%c KeyLine SDK %c Redirecting browser window to OAuth authorization endpoint... `,
      "background: #f97316; color: white; font-weight: bold; padding: 2px 4px; border-radius: 3px;",
      "color: #f97316;"
    );

    // Let's do the redirect
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 1500);
  }

  /**
   * Clears KeyLine sessions and logs out.
   */
  async logout(options = {}) {
    console.log("[KeyLine SDK] Logging out user from KeyLine...");
    localStorage.removeItem(`kl_state_${this.clientId}`);
    localStorage.removeItem(`kl_session`);
    if (options.returnTo) {
      window.location.href = options.returnTo;
    }
  }

  /**
   * Completes OAuth code exchange. (Simulated/OAuth Step 2)
   */
  async handleRedirectCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    
    if (!code) {
      throw new Error("[KeyLine SDK] No authorization code found in URL search parameters.");
    }

    const savedState = localStorage.getItem(`kl_state_${this.clientId}`);
    if (state && savedState && state !== savedState) {
      throw new Error("[KeyLine SDK] State mismatch / potential CSRF detected.");
    }

    console.log("[KeyLine SDK] Found OAuth code, performing exchange...", { code });
    
    // Exchange logic will call KeyLine backend `/api/oauth/token`
    // For Step 1, simulate success token response
    const mockUser = {
      sub: "kl_usr_sandbox_dev",
      name: "John Doe",
      email: "john.doe@example.com",
      email_verified: true,
    };

    localStorage.setItem(`kl_session`, JSON.stringify({ code, user: mockUser }));
    return { user: mockUser };
  }

  /**
   * Returns current session user or null lock state.
   */
  getUser() {
    try {
      const session = localStorage.getItem("kl_session");
      return session ? JSON.parse(session).user : null;
    } catch {
      return null;
    }
  }

  /**
   * Access the KeyLine Real-time Database module.
   */
  database() {
    const clientId = this.clientId;
    const clientSecret = this.clientSecret || localStorage.getItem(`kl_secret_${clientId}`) || "";
    const baseUrl = window.location.origin;

    return {
      collection: (collectionName) => {
        return {
          add: async (data) => {
            const response = await fetch(`${baseUrl}/api/database/data`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${clientSecret}`,
                "x-client-id": clientId
              },
              body: JSON.stringify({
                client_id: clientId,
                collection: collectionName,
                data: data
              })
            });
            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData.error || `[KeyLine SDK] Database insertion failed with status ${response.status}`);
            }
            return await response.json();
          },
          get: async () => {
            const params = new URLSearchParams({
              client_id: clientId,
              collection: collectionName
            });
            const response = await fetch(`${baseUrl}/api/database/data?${params.toString()}`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${clientSecret}`,
                "x-client-id": clientId
              }
            });
            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData.error || `[KeyLine SDK] Database fetch failed with status ${response.status}`);
            }
            return await response.json();
          }
        };
      }
    };
  }

  /**
   * Access the KeyLine Cloud Storage module.
   */
  storage() {
    const clientId = this.clientId;
    const clientSecret = this.clientSecret || localStorage.getItem(`kl_secret_${clientId}`) || "";
    const baseUrl = window.location.origin;

    return {
      ref: (filePath) => {
        return {
          put: async (file) => {
            // file can be a native File object or a custom mock object
            const payload = {
              client_id: clientId,
              filePath: filePath,
              originalName: file ? (file.name || file.originalName || "upload.dat") : "upload.dat",
              sizeBytes: file ? (file.size || file.sizeBytes || 1024) : 1024,
              mimeType: file ? (file.type || file.mimeType || "application/octet-stream") : "application/octet-stream",
            };

            const response = await fetch(`${baseUrl}/api/storage/upload`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${clientSecret}`,
                "x-client-id": clientId
              },
              body: JSON.stringify(payload)
            });
            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData.error || `[KeyLine SDK] Storage upload failed with status ${response.status}`);
            }
            return await response.json();
          }
        };
      }
    };
  }
}

/**
 * Initializes and returns the KeyLine SDK Client instance
 * @param {Object} config 
 */
export function initializeKeyLine(config) {
  return new KeyLineClient(config);
}

// Support browser script tags / global window attachment
if (typeof window !== "undefined") {
  window.KeyLine = {
    initializeKeyLine,
    KeyLineClient
  };
}
