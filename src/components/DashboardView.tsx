import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Key,
  LayoutDashboard,
  Layers,
  Settings,
  LogOut,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash,
  Plus,
  RefreshCw,
  Globe,
  Loader2,
  Lock,
  Cpu,
  User,
  Users,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  AlertCircle,
  Database,
  HardDrive,
  FolderOpen,
  FileCode,
  UploadCloud,
  Play,
  Menu,
  X,
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { Application, DashboardTab, User as UserType } from "../types";

interface DashboardViewProps {
  user: UserType;
  token: string;
  onLogout: () => void;
}

export default function DashboardView({ user, token, onLogout }: DashboardViewProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  
  // Create App Form states
  const [newAppName, setNewAppName] = useState("");
  const [newRedirectUris, setNewRedirectUris] = useState("http://localhost:4000/auth/callback");
  const [newAllowedOrigins, setNewAllowedOrigins] = useState("http://localhost:4000");
  const [creatingApp, setCreatingApp] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  // Clipboard States for copy feedbacks
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  // Database Explorer states
  const [dbSelectedClientId, setDbSelectedClientId] = useState<string>("");
  const [dbRecords, setDbRecords] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbCollectionFilter, setDbCollectionFilter] = useState<string>("");
  
  // Storage Explorer states
  const [storageSelectedClientId, setStorageSelectedClientId] = useState<string>("");
  const [storageRecords, setStorageRecords] = useState<any[]>([]);
  const [loadingStorage, setLoadingStorage] = useState(false);

  // Playground Interactive forms
  const [dbPlaygroundCollection, setDbPlaygroundCollection] = useState("users");
  const [dbPlaygroundData, setDbPlaygroundData] = useState('{\n  "name": "Sarah Connor",\n  "role": "Developer",\n  "active": true,\n  "tier": "enterprise"\n}');
  const [insertingDbPlayground, setInsertingDbPlayground] = useState(false);
  const [dbPlaygroundError, setDbPlaygroundError] = useState<string | null>(null);

  const [storagePlaygroundPath, setStoragePlaygroundPath] = useState("avatars/user_77.png");
  const [storagePlaygroundName, setStoragePlaygroundName] = useState("profile_pic.png");
  const [storagePlaygroundSize, setStoragePlaygroundSize] = useState("124032");
  const [storagePlaygroundType, setStoragePlaygroundType] = useState("image/png");
  const [uploadingStoragePlayground, setUploadingStoragePlayground] = useState(false);
  const [storagePlaygroundError, setStoragePlaygroundError] = useState<string | null>(null);

  // Drag and drop local upload state parameters
  const [dragActive, setDragActive] = useState(false);
  const [localUploading, setLocalUploading] = useState(false);
  const [localUploadError, setLocalUploadError] = useState<string | null>(null);

  // KeyLine AI Assistant Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    {
      sender: "bot",
      text: "Hello! I am your KeyLine AI Assistant, specialized in server architectures, security, and storage solutions. How can I help you with your sandbox development today? Ask me about Firebase migrations, OAuth 2.0 authorization, Custom JWT signing, database structures, or official human support channels.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  const chatEndRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isBotTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : chatInput;
    if (!rawText || !rawText.trim()) return;

    if (textToSend === undefined) {
      setChatInput("");
    }

    const trimmed = rawText.trim();
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    setChatMessages(prev => [...prev, { sender: "user", text: trimmed, time: timestampStr }]);
    setIsBotTyping(true);

    // Simulate an organic expert typing delay
    setTimeout(() => {
      const query = trimmed.toLowerCase();
      let reply = "";

      if (query.includes("firebase") || query.includes("migration") || query.includes("migrate")) {
        reply = "🛠️ **KeyLine Firebase Migration Guide:**\n\nTo migrate your app from Firebase Firestore / Auth to KeyLine:\n\n1. **Auth Providers Setup:** Enable KeyLine Identity Hub under settings, mimicking Firebase Auth redirect handlers.\n2. **Database collections:** Import your JSON schemas directly inside KeyLine's Database workspace. KeyLine fully implements a document-oriented Firestore interface.\n3. **Client Config:** Switch your initialization scripts with our lighter `/npm` distribution package. Replace the Firebase SDK initialization code with:\n```javascript\nimport { initializeKeyLine } from '@keyline/sdk';\nconst db = initializeKeyLine({ clientId: 'YOUR_CLIENT_ID' });\n```\n\nAll security attributes map directly without restructuring standard schema queries.";
      } else if (query.includes("oauth") || query.includes("oauth 2") || query.includes("redirect") || query.includes("callback") || query.includes("provider") || query.includes("authorize")) {
        reply = "🔑 **OAuth 2.0 Integration Overview:**\n\nKeyLine functions as a fully federated OAuth 2.0 / OpenID Connect authorization server:\n\n- **Authorization URI:** `/auth/authorize` used with client state parameter generation to bypass visual CSRF exploits.\n- **Token endpoint:** Secured via POST query to obtain standard Bearer session wrappers.\n- **Setting Redirects:** Make sure to explicitly declare your authorized development and callback ports (e.g. `http://localhost:3000/callback`) inside the *Applications Dashboard* to prevent unauthorized token intercepts.";
      } else if (query.includes("jwt") || query.includes("token") || query.includes("bearer") || query.includes("session")) {
        reply = "🎫 **KeyLine Custom JWT Token Structure:**\n\nAll successful identity handshakes in KeyLine generate standard, signed JSON Web Tokens (JWT) signed with either `HS256` or `RS256` key configurations:\n\n- **Header:** Declares signing algorithms and token type attributes.\n- **Payload Claims:** Automatically packs payload metadata such as standard ID (`sub`), user email, assigned role scopes, and issuance time parameters (`iat`/`exp`).\n- **Client Verification:** All requests processed through `/api` check the header attribute `Authorization: Bearer <your_jwt_token>` for decryption and verification against active key rotation salts.";
      } else if (query.includes("database") || query.includes("structure") || query.includes("schema") || query.includes("table") || query.includes("collection") || query.includes("drizzle")) {
        reply = "🗄️ **KeyLine Document Database & Schema Engines:**\n\nKeyLine operates a high-capacity, document-oriented sandbox storage interface:\n\n- **No-SQL Collections & Docs:** Organize application profiles into nested structures (similar to Firestore / MongoDB models).\n- **Relational support:** Integrates relational configurations in production schemas using custom Drizzle ORM mappings, binding back to isolated SQLite or PostgreSQL instances.\n- **Real-time Synchronization:** Client connections benefit from dynamic standard WebSocket sync capabilities for active application state monitoring.";
      } else if (query.includes("human") || query.includes("support") || query.includes("contact") || query.includes("email") || query.includes("help") || query.includes("live agent") || query.includes("critical") || query.includes("issue") || query.includes("error") || query.includes("bug")) {
        reply = "🚨 **KeyLine Developer Support & Assistance Channels:**\n\nIf you have encountered a critical service bug, need custom service integration, or require official human technical assistance, please do not hesitate to contact our dedicated developer support team immediately at:\n\n✉️ **supportvastra@gmail.com**\n\nOur engineering team normally responds within 2 hours for sandbox testing or production issues.";
      } else {
        reply = "✨ **KeyLine Tech Expert Assistant:**\n\nI can assist you with your technical integrations! Here are several topics you can explore:\n- **Firebase Migration**: How to replace Firestore/Auth SDKs with KeyLine.\n- **OAuth 2.0 Configuration**: Managing application scopes, flows, and redirect URIs.\n- **JWT Structures**: Validating cryptographic key formats and bearer claims.\n- **Schema Definitions**: Directing document-based or relational database models.\n- **Human Support Channel**: Access technical feedback or contact support directly (**supportvastra@gmail.com**).";
      }

      setChatMessages(prev => [...prev, {
        sender: "bot",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsBotTyping(false);
    }, 850);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processAndUploadFile = async (file: File) => {
    if (!storageSelectedClientId) return;
    setLocalUploading(true);
    setLocalUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          if (!base64Data) {
            throw new Error("Could not process file content stream.");
          }

          const response = await fetch(`/api/applications/${storageSelectedClientId}/storage/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              name: file.name,
              mimeType: file.type || "application/octet-stream",
              base64Data,
              size: file.size
            })
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Upload endpoint returned error state.");
          }

          setPlaygroundSuccessFeedback(`[Disk upload success] Decoded & written file to container filesystem: ${file.name}`);
          setTimeout(() => setPlaygroundSuccessFeedback(null), 4000);

          await fetchStorageRecords(storageSelectedClientId);
        } catch (err: any) {
          setLocalUploadError(err.message);
        } finally {
          setLocalUploading(false);
        }
      };

      reader.onerror = () => {
        setLocalUploadError("Failed reading file into memory buffer stream.");
        setLocalUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setLocalUploadError(err.message);
      setLocalUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      await processAndUploadFile(droppedFile);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      await processAndUploadFile(selectedFile);
    }
  };

  const [playgroundSuccessFeedback, setPlaygroundSuccessFeedback] = useState<string | null>(null);

  // End Users Auth states
  const [authSelectedClientId, setAuthSelectedClientId] = useState<string>("");
  const [endUsers, setEndUsers] = useState<any[]>([]);
  const [loadingEndUsers, setLoadingEndUsers] = useState(false);
  const [newEndUserName, setNewEndUserName] = useState("");
  const [newEndUserEmail, setNewEndUserEmail] = useState("");
  const [newEndUserStatus, setNewEndUserStatus] = useState<"active" | "suspended">("active");
  const [addingEndUser, setAddingEndUser] = useState(false);
  const [addEndUserError, setAddEndUserError] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Fetch end-users linked to application
  const fetchEndUsers = async (clientId: string) => {
    if (!clientId) return;
    setLoadingEndUsers(true);
    try {
      const response = await fetch(`/api/applications/${clientId}/end-users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEndUsers(data);
      }
    } catch (err) {
      console.error("Failed fetching end-users:", err);
    } finally {
      setLoadingEndUsers(false);
    }
  };

  const handleAddEndUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authSelectedClientId) return;
    setAddingEndUser(true);
    setAddEndUserError(null);

    try {
      const response = await fetch(`/api/applications/${authSelectedClientId}/end-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newEndUserName,
          email: newEndUserEmail,
          status: newEndUserStatus
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create end-user");
      }

      setPlaygroundSuccessFeedback(`Manually registered end-user '${newEndUserName}' successfully!`);
      setTimeout(() => setPlaygroundSuccessFeedback(null), 4000);
      
      setNewEndUserName("");
      setNewEndUserEmail("");
      setNewEndUserStatus("active");
      setShowAddUserModal(false);

      await fetchEndUsers(authSelectedClientId);
    } catch (err: any) {
      setAddEndUserError(err.message);
    } finally {
      setAddingEndUser(false);
    }
  };

  const handleDeleteEndUser = async (userId: string) => {
    if (!authSelectedClientId) return;
    if (!confirm("Are you sure you want to revoke this user's active session and delete their identity record?")) return;

    try {
      const response = await fetch(`/api/applications/${authSelectedClientId}/end-users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setPlaygroundSuccessFeedback("User's identity session revoked successfully.");
        setTimeout(() => setPlaygroundSuccessFeedback(null), 4000);
        await fetchEndUsers(authSelectedClientId);
      }
    } catch (err) {
      console.error("Failed deleting end-user:", err);
    }
  };

  // Fetch applications list on load/tab shift
  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const response = await fetch("/api/applications", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed fetching apps:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchDbRecords = async (clientId: string) => {
    if (!clientId) return;
    setLoadingDb(true);
    try {
      const response = await fetch(`/api/applications/${clientId}/database`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDbRecords(data);
      }
    } catch (err) {
      console.error("Failed fetching db records:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  const fetchStorageRecords = async (clientId: string) => {
    if (!clientId) return;
    setLoadingStorage(true);
    try {
      const response = await fetch(`/api/applications/${clientId}/storage`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStorageRecords(data);
      }
    } catch (err) {
      console.error("Failed fetching storage:", err);
    } finally {
      setLoadingStorage(false);
    }
  };

  const handleClearDbRecords = async (clientId: string) => {
    if (!confirm("Are you sure you want to permanently clear all database collections for this application? This is irreversible.")) return;
    try {
      const response = await fetch(`/api/applications/${clientId}/database/clear`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setPlaygroundSuccessFeedback("Database collections successfully cleared.");
        setTimeout(() => setPlaygroundSuccessFeedback(null), 4000);
        await fetchDbRecords(clientId);
      }
    } catch (err) {
      console.error("Failed clearing db:", err);
    }
  };

  const handleClearStorageRecords = async (clientId: string) => {
    if (!confirm("Are you sure you want to purge all mock file upload records in the cloud storage bucket for this application? This is irreversible.")) return;
    try {
      const response = await fetch(`/api/applications/${clientId}/storage/clear`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setPlaygroundSuccessFeedback("Storage bucket purged clean.");
        setTimeout(() => setPlaygroundSuccessFeedback(null), 4000);
        await fetchStorageRecords(clientId);
      }
    } catch (err) {
      console.error("Failed clearing storage:", err);
    }
  };

  // Interactive Live SDK Playgrounds
  const handleAddDataPlayground = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbSelectedClientId) return;
    setInsertingDbPlayground(true);
    setDbPlaygroundError(null);

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(dbPlaygroundData);
      } catch (parseErr) {
        throw new Error("Invalid format: Payload must be valid JSON Object.");
      }

      const targetApp = applications.find(a => a.clientId === dbSelectedClientId);
      if (!targetApp) throw new Error("Application not found");

      // Post raw payload using SDK api parameters
      const response = await fetch(`/api/database/data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${targetApp.clientSecret}`,
          "x-client-id": dbSelectedClientId
        },
        body: JSON.stringify({
          client_id: dbSelectedClientId,
          collection: dbPlaygroundCollection,
          data: parsedData
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "SDK insertion rejected.");
      }

      setPlaygroundSuccessFeedback(`[SDK Success] Instantly wrote record into collection '${dbPlaygroundCollection}'!`);
      setTimeout(() => setPlaygroundSuccessFeedback(null), 4000);
      
      // Refresh
      await fetchDbRecords(dbSelectedClientId);
    } catch (err: any) {
      setDbPlaygroundError(err.message);
    } finally {
      setInsertingDbPlayground(false);
    }
  };

  const handleUploadFilePlayground = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storageSelectedClientId) return;
    setUploadingStoragePlayground(true);
    setStoragePlaygroundError(null);

    try {
      const targetApp = applications.find(a => a.clientId === storageSelectedClientId);
      if (!targetApp) throw new Error("Application not found");

      const response = await fetch(`/api/storage/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${targetApp.clientSecret}`,
          "x-client-id": storageSelectedClientId
        },
        body: JSON.stringify({
          client_id: storageSelectedClientId,
          filePath: storagePlaygroundPath,
          originalName: storagePlaygroundName,
          sizeBytes: Number(storagePlaygroundSize),
          mimeType: storagePlaygroundType
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "SDK Put payload failed.");
      }

      setPlaygroundSuccessFeedback(`[SDK Success] Uploaded file successfully: ${storagePlaygroundName}`);
      setTimeout(() => setPlaygroundSuccessFeedback(null), 4000);
      
      // Refresh
      await fetchStorageRecords(storageSelectedClientId);
    } catch (err: any) {
      setStoragePlaygroundError(err.message);
    } finally {
      setUploadingStoragePlayground(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token]);

  useEffect(() => {
    if (applications.length > 0) {
      if (!dbSelectedClientId) {
        const first = applications[0].clientId;
        setDbSelectedClientId(first);
        fetchDbRecords(first);
      }
      if (!storageSelectedClientId) {
        const first = applications[0].clientId;
        setStorageSelectedClientId(first);
        fetchStorageRecords(first);
      }
      if (!authSelectedClientId) {
        const first = applications[0].clientId;
        setAuthSelectedClientId(first);
        fetchEndUsers(first);
      }
    }
  }, [applications]);

  useEffect(() => {
    if (dbSelectedClientId) {
      fetchDbRecords(dbSelectedClientId);
    }
  }, [dbSelectedClientId]);

  useEffect(() => {
    if (storageSelectedClientId) {
      fetchStorageRecords(storageSelectedClientId);
    }
  }, [storageSelectedClientId]);

  useEffect(() => {
    if (authSelectedClientId) {
      fetchEndUsers(authSelectedClientId);
    }
  }, [authSelectedClientId]);

  // Handle Application creation
  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    setCreatingApp(true);
    setAppError(null);

    try {
      const response = await fetch("/api/applications/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newAppName,
          redirectUris: newRedirectUris,
          allowedOrigins: newAllowedOrigins
        })
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.error || "Failed to establish new KeyLine Application.");
      }

      setNewAppName("");
      setNewRedirectUris("http://localhost:4000/auth/callback");
      setNewAllowedOrigins("http://localhost:4000");
      
      // Refresh apps list
      await fetchApplications();
    } catch (err: any) {
      setAppError(err.message);
    } finally {
      setCreatingApp(false);
    }
  };

  // Handle Secret Regeneration
  const handleRegenerateSecret = async (appId: string) => {
    if (!confirm("Are you sure you want to regenerate this Client Secret? Any running instance using the old secret will fail immediately.")) return;
    try {
      const response = await fetch(`/api/applications/${appId}/regenerate-secret`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        await fetchApplications();
        // Automatically reveal regenerated secret momentarily
        setRevealedSecrets(prev => ({ ...prev, [appId]: true }));
      }
    } catch (err) {
      console.error("Failed regenerating secret:", err);
    }
  };

  // Handle Delete Application
  const handleDeleteApplication = async (appId: string) => {
    if (!confirm("CRITICAL WARNING: Are you sure you want to permanently delete this KeyLine Auth Application? All user auth states, client configurations, and active integrations will cease to exist immediately.")) return;
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        await fetchApplications();
      }
    } catch (err) {
      console.error("Failed deleting application:", err);
    }
  };

  const handleCopyText = (text: string, labelId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(labelId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRevealSecret = (appId: string) => {
    setRevealedSecrets(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  const renderMessageText = (text: string) => {
    const parts = text.split("\n\n");
    return parts.map((part, partIdx) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```[a-z]*/g, "").trim();
        return (
          <pre key={partIdx} className="font-mono text-[10px] bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 overflow-x-auto text-orange-400 select-all leading-normal my-2">
            {code}
          </pre>
        );
      }
      
      const lines = part.split("\n");
      return (
        <div key={partIdx} className="space-y-1">
          {lines.map((line, lineIdx) => {
            let content = line;
            
            // Simple robust regex matching for bold elements
            const boldRegex = /\*\*(.*?)\*\*/g;
            const segments: React.ReactNode[] = [];
            let lastIndex = 0;
            let match;
            
            while ((match = boldRegex.exec(line)) !== null) {
              if (match.index > lastIndex) {
                segments.push(line.substring(lastIndex, match.index));
              }
              segments.push(<strong key={match.index} className="text-white font-bold">{match[1]}</strong>);
              lastIndex = boldRegex.lastIndex;
            }
            
            if (lastIndex < line.length) {
              segments.push(line.substring(lastIndex));
            }

            if (line.startsWith("- ") || line.startsWith("• ")) {
              return (
                <li key={lineIdx} className="list-none pl-4 relative text-xs text-zinc-300">
                  <span className="absolute left-1 text-orange-500">•</span>
                  {segments.length > 0 ? segments : line.replace(/^[-•]\s+/, "")}
                </li>
              );
            }
            
            if (/^\d+\.\s+/.test(line)) {
              const numMatch = line.match(/^(\d+\.)\s+/);
              const numPrefix = numMatch ? numMatch[1] : "";
              return (
                <p key={lineIdx} className="text-xs text-zinc-300 pl-4 relative">
                  <span className="absolute left-0 text-orange-500 font-mono text-[10px] font-bold">{numPrefix}</span>
                  {segments.length > 0 ? segments : line.replace(/^\d+\.\s+/, "")}
                </p>
              );
            }

            return (
              <p key={lineIdx} className="text-xs text-zinc-300 leading-relaxed">
                {segments.length > 0 ? segments : line}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // First app for standard SDK snippet generation
  const activeAppSample = applications.find(a => a.userId !== "demo-user") || applications[0] || {
    clientId: "kl_client_xxxxxxxx",
    redirectUris: ["http://localhost:3000/callback"]
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-gray-200 font-sans overflow-hidden">
      
      {/* Mobile Sidebar backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-[#121214] border-r border-zinc-800 flex flex-col shrink-0 justify-between transition-transform duration-300 transform md:translate-x-0 md:static ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6 space-y-8">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Key className="w-4.5 h-4.5 text-[#09090b] stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-bold text-lg tracking-tight text-white flex items-center gap-0.5">
                  Key<span className="text-orange-500 font-normal">Line</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-widest font-mono text-orange-400 bg-orange-500/10 border border-orange-500/15 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(234,88,12,0.15)] select-none animate-pulse">
                  Beta
                </span>
              </div>
              <span className="text-[9px] font-mono text-zinc-650 text-zinc-500 font-bold tracking-wider uppercase leading-none mt-0.5">Developer Console</span>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="space-y-4">
            
            {/* Core Segment */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 px-3 block mb-1.5 font-mono">Core Console</span>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all group ${
                    activeTab === "overview"
                      ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 group-hover:text-orange-500 transition-colors ${
                    activeTab === "overview" ? "text-orange-500" : ""
                  }`} />
                  Overview
                </button>

                <button
                  id="tab-applications"
                  onClick={() => { setActiveTab("applications"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all group ${
                    activeTab === "applications"
                      ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Layers className={`w-4 h-4 group-hover:text-orange-500 transition-colors ${
                    activeTab === "applications" ? "text-orange-500" : ""
                  }`} />
                  Applications
                </button>
              </div>
            </div>

            {/* Security Segment */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 px-3 block mb-1.5 font-mono">Security</span>
              <div className="space-y-0.5">
                <button
                  id="tab-auth"
                  onClick={() => { setActiveTab("auth"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all group ${
                    activeTab === "auth"
                      ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Users className={`w-4 h-4 group-hover:text-orange-500 transition-colors ${
                    activeTab === "auth" ? "text-orange-500" : ""
                  }`} />
                  Authentication
                </button>
              </div>
            </div>

            {/* Databases & Storage */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 px-3 block mb-1.5 font-mono">Databases & Storage</span>
              <div className="space-y-0.5">
                <button
                  id="tab-database"
                  onClick={() => { setActiveTab("database"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all group ${
                    activeTab === "database"
                      ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Database className={`w-4 h-4 group-hover:text-orange-500 transition-colors ${
                    activeTab === "database" ? "text-orange-500" : ""
                  }`} />
                  KeyLine Store
                </button>

                <button
                  id="tab-storage"
                  onClick={() => { setActiveTab("storage"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all group ${
                    activeTab === "storage"
                      ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <HardDrive className={`w-4 h-4 group-hover:text-orange-500 transition-colors ${
                    activeTab === "storage" ? "text-orange-500" : ""
                  }`} />
                  Object Storage
                </button>
              </div>
            </div>

            {/* Setup */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 px-3 block mb-1.5 font-mono">Setup</span>
              <div className="space-y-0.5">
                <button
                  onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all group ${
                    activeTab === "settings"
                      ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Settings className={`w-4.5 h-4.5 group-hover:text-orange-500 transition-colors ${
                    activeTab === "settings" ? "text-orange-500" : ""
                  }`} />
                  Settings & SDK
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-zinc-800 space-y-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100 font-bold text-xs uppercase">
              {user.name ? user.name.substring(0, 2) : "DV"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate leading-none mb-0.5">{user.name}</div>
              <div className="text-[10px] text-zinc-500 truncate">{user.email}</div>
            </div>
          </div>

          <button
            onClick={() => { onLogout(); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-zinc-400 bg-zinc-900 hover:bg-zinc-800 hover:text-rose-400 border border-zinc-800/80 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout from Console
          </button>
        </div>
      </aside>

      {/* Main Panel Content Window */}
      <main className="flex-1 flex flex-col bg-[#09090b] overflow-y-auto relative z-10">
        
        {/* Soft radial grid overlay inside dashboard main */}
        <div className="absolute inset-0 developer-dot opacity-3 pointer-events-none" />

        {/* Dynamic header display */}
        <header className="h-16 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 relative z-20 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger button */}
            <button
              id="mobile-sidebar-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 px-2 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 rounded-md md:hidden transition-colors flex items-center justify-center cursor-pointer"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-sm font-semibold text-zinc-500 font-mono hidden sm:inline">/ console</span>
            <span className="text-zinc-600 hidden sm:inline">/</span>
            <span className="text-sm font-semibold text-white capitalize font-mono text-orange-500">{activeTab}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-zinc-400">
            <span className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] bg-emerald-500/5 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Secure Auth Handshake Active</span>
              <span className="sm:hidden">Secure</span>
            </span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="font-mono text-zinc-500 hidden sm:inline">{new Date().toISOString().split("T")[0]}</span>
          </div>
        </header>

        {/* Tab View Render Canvas */}
        <div className="p-4 sm:p-8 flex-1 relative z-10 max-w-6xl w-full mx-auto space-y-6">
          {/* Elegant active Sandbox Testing notice banner */}
          <div className="bg-amber-500/10 border border-amber-500/15 rounded-xl p-3.5 text-left flex items-start gap-3 text-amber-400 shadow-md shadow-amber-950/10">
            <AlertCircle className="w-4.5 h-4.5 text-amber-550 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs font-semibold leading-relaxed">
              Notice: KeyLine BaaS is currently in active Sandbox Testing phase. Production deployment configurations are optimized for testing environments.
            </p>
          </div>

          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW HERO */}
            {activeTab === "overview" && (
              <motion.div
                key="tab-overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Welcoming banner */}
                <div className="bg-gradient-to-r from-[#121214] to-[#18181b] border border-zinc-800/80 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Back inside the Vault, <span className="text-orange-500">{user.name}</span>!
                    </h1>
                    <p className="text-zinc-400 text-sm max-w-xl">
                      Monitor user registration sessions, manage client cryptographic handshakes, and manage multi-application redirects.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("applications")}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black text-xs font-bold rounded-lg transition-all shadow-md shadow-orange-500/10 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      Launch Application
                    </button>
                    <button
                      onClick={fetchApplications}
                      className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all flex items-center"
                      title="Reload configuration"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid Stat Cards */}
                <div className="grid sm:grid-cols-3 gap-6">
                  
                  {/* APP STATS */}
                  <div className="p-6 bg-[#121214] border border-zinc-800/80 rounded-2xl space-y-1 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/10 transition-all" />
                    <div className="flex items-center justify-between text-zinc-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-zinc-500">Applications Registered</span>
                      <Layers className="w-4.5 h-4.5 text-orange-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-white pt-1">{applications.length}</div>
                    <p className="text-[11px] text-zinc-500 pt-1.5 flex items-center gap-1">
                      <span className="text-emerald-400 font-bold">100%</span> active local persistence engine
                    </p>
                  </div>

                  {/* TOKENS STATS */}
                  <div className="p-6 bg-[#121214] border border-zinc-800/80 rounded-2xl space-y-1 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between text-zinc-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-zinc-500">Handshake Streams</span>
                      <Activity className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-white pt-1">11,942</div>
                    <p className="text-[11px] text-zinc-500 pt-1.5 flex items-center gap-1">
                      <span className="text-orange-500 font-semibold">+18.4%</span> callback volume (last 24h)
                    </p>
                  </div>

                  {/* SECURITY PROTOCOL BADGE */}
                  <div className="p-6 bg-[#121214] border border-zinc-800/80 rounded-2xl space-y-1 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between text-zinc-400 text-xs">
                      <span className="font-semibold uppercase tracking-wider text-zinc-500">Security Handshakes</span>
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-extrabold text-[#22c55e] pt-1">99.98%</div>
                    <p className="text-[11px] text-zinc-500 pt-1.5 flex items-center gap-1">
                      Zero hijacked callback intercepts
                    </p>
                  </div>
                </div>

                {/* Interactive Stream Log & Visual Chart Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Left panel: Simulated active OAuth log stream */}
                  <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-md">
                    <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#151517]">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-orange-500" />
                        <h3 className="font-bold text-sm text-white">Security Event Stream</h3>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    </div>

                    <div className="p-5 font-mono text-[11px] text-zinc-400 leading-relaxed max-h-[280px] overflow-y-auto space-y-3">
                      <div>
                        <span className="text-zinc-600">[06:42:19]</span> <span className="text-orange-500">INFO</span> Initiated client initialization handshakes.
                      </div>
                      <div>
                        <span className="text-zinc-600">[06:42:20]</span> <span className="text-[#38bdf8]">SYSTEM</span> Pre-loaded SQLite backup configuration read.
                      </div>
                      {applications.map((app) => (
                        <div key={app.id} className="pt-0.5 border-t border-zinc-80/20">
                          <span className="text-zinc-600">[06:42:21]</span> <span className="text-emerald-400">ACTIVE</span> Application key bound <span className="text-amber-500 font-semibold">{app.name}</span> ({app.clientId.substring(0, 15)}...)
                        </div>
                      ))}
                      <div>
                        <span className="text-zinc-600">[06:42:22]</span> <span className="text-orange-500">OAUTH</span> Direct redirect token generated successfully.
                      </div>
                      <div>
                        <span className="text-zinc-600">[06:42:23]</span> <span className="text-orange-500">TOKEN</span> Handshake state confirmed secure. Waiting client callbacks...
                      </div>
                    </div>
                  </div>

                  {/* Right panel: Active dynamic integration overview */}
                  <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4.5 h-4.5 text-amber-500" />
                        <h3 className="font-bold text-sm text-white">Local Endpoint Integrity</h3>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Your public identity SDK file is actively hosted at:
                      </p>
                      
                      {/* Interactive route launcher */}
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-2 overflow-x-auto">
                        <span className="font-mono text-xs text-zinc-300 truncate">
                          {window.location.origin}/keyline-base.js
                        </span>
                        <button
                          onClick={() => handleCopyText(`${window.location.origin}/keyline-base.js`, "global_sdk")}
                          className="p-1 px-1.5 hover:text-orange-500 text-zinc-500 transition-colors cursor-pointer"
                        >
                          {copiedId === "global_sdk" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl space-y-2">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-[9px]">Server Parameters</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-zinc-500">CORS Origins</div>
                            <div className="font-mono text-zinc-300 text-[11px] truncate">Configured on application creation</div>
                          </div>
                          <div>
                            <div className="text-zinc-500">SSL Status</div>
                            <div className="text-emerald-400 font-bold font-mono">TLS 1.3 Secure</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("settings")}
                      className="mt-4 w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 hover:text-white border border-zinc-800 rounded-xl text-center text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
                    >
                      Interactive SDK Integration Guide
                    </button>
                  </div>
                </div>

                {/* Future BaaS Modules segment */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-orange-500" />
                    <h3 className="font-bold text-sm text-white">Advanced Scale & Future Services</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Analytics Dashboard */}
                    <div className="p-5 bg-[#121214] border border-zinc-800 rounded-xl space-y-3 relative group overflow-hidden">
                      <div className="absolute top-2 right-2 px-2 py-0.5 text-[8px] font-bold font-mono bg-orange-500/10 text-orange-500 border border-orange-500/15 rounded-full uppercase tracking-wider">
                        v2 Coming Soon
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-orange-500 transition-colors">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">Real-Time Analytics</h4>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                          Track daily active sessions (DAU), token refresh spikes, location metrics, and request telemetry in real-time.
                        </p>
                      </div>
                    </div>

                    {/* DevOps & Audits */}
                    <div className="p-5 bg-[#121214] border border-zinc-800 rounded-xl space-y-3 relative group overflow-hidden">
                      <div className="absolute top-2 right-2 px-2 py-0.5 text-[8px] font-bold font-mono bg-orange-500/10 text-orange-500 border border-orange-500/15 rounded-full uppercase tracking-wider">
                        v2 Coming Soon
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-amber-500 transition-colors">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">CI/CD & DevOps Auditing</h4>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                          Automated secret rotation hooks, log integrations to Splunk/Datadog, and instant console SSH terminals.
                        </p>
                      </div>
                    </div>

                    {/* AI Security Threat Shield */}
                    <div className="p-5 bg-[#121214] border border-zinc-800 rounded-xl space-y-3 relative group overflow-hidden">
                      <div className="absolute top-2 right-2 px-2 py-0.5 text-[8px] font-bold font-mono bg-orange-500/10 text-orange-500 border border-[#ea580c]/15 rounded-full uppercase tracking-wider">
                        v2 Coming Soon
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-tight">AI Identity Threat Shield</h4>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                          Continuous machine learning sweeps checking credential stuffing, bad IP proxies, and adaptive MFA redirects.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: APPLICATIONS MANAGER */}
            {activeTab === "applications" && (
              <motion.div
                key="tab-apps"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {/* Left col: Add new application form */}
                <div className="space-y-6 lg:col-span-1">
                  <div className="bg-[#121214] border border-zinc-800/80 p-6 rounded-2xl space-y-6">
                    <div>
                      <h2 className="font-extrabold text-white text-lg">New Application</h2>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        Establish credential identity keys for developers integrating auth callbacks.
                      </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleCreateApplication}>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          App Display Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newAppName}
                          onChange={(e) => setNewAppName(e.target.value)}
                          placeholder="e.g. My SaaS Product"
                          className="mt-2 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Allowed Redirect URIs (CSV)
                        </label>
                        <input
                          type="text"
                          required
                          value={newRedirectUris}
                          onChange={(e) => setNewRedirectUris(e.target.value)}
                          placeholder="http://localhost:4000/auth/callback"
                          className="mt-2 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Allowed Web Origins (CORS CORS CSV)
                        </label>
                        <input
                          type="text"
                          value={newAllowedOrigins}
                          onChange={(e) => setNewAllowedOrigins(e.target.value)}
                          placeholder="http://localhost:4000"
                          className="mt-2 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                        />
                      </div>

                      {appError && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{appError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={creatingApp || !newAppName.trim()}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-xs font-bold text-black bg-orange-500 hover:bg-orange-400 transition-all disabled:opacity-40 cursor-pointer"
                      >
                        {creatingApp ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="w-4.5 h-4.5 animate-spin" /> Creating App Keys...
                          </span>
                        ) : "Register Application Credentials"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right col: Applications cards grid */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-white text-lg">Registered Applications</h2>
                      <p className="text-xs text-zinc-400">Active OAuth parameters bound with security protocols.</p>
                    </div>
                  </div>

                  {loadingApps ? (
                    <div className="h-64 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                      <span>Syncing Client Identifiers...</span>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="h-64 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <Layers className="w-8 h-8 text-zinc-600" />
                      <div className="text-sm font-bold text-white">No custom applications launched</div>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Create an application in the left form to capture credentials and begin integrating auth redirections.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => {
                        const isRevealed = revealedSecrets[app.id] || false;
                        const isDemo = app.userId === "demo-user";
                        
                        return (
                          <div
                            key={app.id}
                            className="bg-[#121214] border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-6 transition-all space-y-4 relative overflow-hidden"
                          >
                            {isDemo && (
                              <div className="absolute top-0 right-0 bg-[#ea580c]/10 text-orange-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-orange-500/10">
                                Global Sandbox App
                              </div>
                            )}

                            {/* App header and state */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <h3 className="font-bold text-base text-white">{app.name}</h3>
                                <div className="text-[10px] font-mono text-zinc-500">
                                  Created {new Date(app.createdAt).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  app.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${app.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                                  {app.status}
                                </span>
                                
                                <button
                                  onClick={() => handleDeleteApplication(app.id)}
                                  className="p-1.5 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-500 rounded transition-all cursor-pointer"
                                  title="Delete App"
                                >
                                  <Trash className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </div>

                            {/* Credentials layout */}
                            <div className="bg-[#161619] border border-zinc-800/80 rounded-xl p-4 space-y-3.5">
                              {/* Client ID */}
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                                <div className="min-w-0">
                                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Client ID</div>
                                  <div className="font-mono text-xs text-orange-500 select-all truncate mt-0.5">{app.clientId}</div>
                                </div>
                                <button
                                  onClick={() => handleCopyText(app.clientId, `id_${app.id}`)}
                                  className="self-end sm:self-center p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-zinc-400 hover:text-white transition-all text-xs flex items-center gap-1 justify-center cursor-pointer"
                                >
                                  {copiedId === `id_${app.id}` ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-[10px] text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span className="text-[10px]">Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Client Secret */}
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 whitespace-nowrap">
                                <div className="min-w-0">
                                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Client Secret</div>
                                  <div className="font-mono text-xs text-zinc-300 font-medium truncate mt-0.5">
                                    {isRevealed ? app.clientSecret : "kl_secret_••••••••••••••••••••••••••••••••"}
                                  </div>
                                </div>

                                <div className="self-end sm:self-center flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => toggleRevealSecret(app.id)}
                                    className="p-1 px-2 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs flex items-center gap-1 justify-center cursor-pointer"
                                  >
                                    {isRevealed ? (
                                      <>
                                        <EyeOff className="w-3.5 h-3.5" />
                                        <span className="text-[10px]">Hide</span>
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-3.5 h-3.5" />
                                        <span className="text-[10px]">Show</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleCopyText(app.clientSecret, `sec_${app.id}`)}
                                    className="p-1.5 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs flex items-center gap-1 justify-center cursor-pointer"
                                    title="Copy Secret"
                                  >
                                    {copiedId === `sec_${app.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>

                                  <button
                                    onClick={() => handleRegenerateSecret(app.id)}
                                    className="p-1.5 hover:bg-orange-500/10 hover:text-orange-400 border border-zinc-800 text-zinc-500 rounded text-xs flex items-center gap-1 justify-center cursor-pointer"
                                    title="Regenerate Client Secret"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Uris listings */}
                            <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono text-zinc-400 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/40">
                              <div>
                                <span className="text-[10px] uppercase font-sans tracking-widest text-zinc-500 block mb-1">Redirect Callback URLs</span>
                                <div className="space-y-1">
                                  {app.redirectUris.map((uri, idx) => (
                                    <span key={idx} className="block text-zinc-300 truncate bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 rounded text-[11px] font-mono leading-relaxed">
                                      {uri}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-sans tracking-widest text-zinc-500 block mb-1">CORS Origins</span>
                                <div className="space-y-1">
                                  {app.allowedOrigins.length > 0 ? (
                                    app.allowedOrigins.map((origin, idx) => (
                                      <span key={idx} className="block text-zinc-300 truncate bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 rounded text-[11px] font-mono leading-relaxed">
                                        {origin}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-zinc-600 italic text-[11px]">No CORS limitations enforced</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: AUTHENTICATION / USERS MODULE */}
            {activeTab === "auth" && (
              <motion.div
                key="tab-auth"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header widget */}
                <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      KeyLine Identity & Authentication Engine
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Manage registered subscriber accounts, track identity assertions, and generate mock credentials.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-500 font-bold uppercase shrink-0">Selected App:</span>
                      <select
                        value={authSelectedClientId}
                        onChange={(e) => setAuthSelectedClientId(e.target.value)}
                        className="bg-zinc-900 border border-zinc-805/85 border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-200 focus:outline-none focus:border-orange-500 font-mono"
                      >
                        {applications.length === 0 ? (
                          <option value="">No applications registered</option>
                        ) : (
                          applications.map(app => (
                            <option key={app.id} value={app.clientId}>{app.name} ({app.clientId.substring(0, 10)}...)</option>
                          ))
                        )}
                      </select>
                    </div>

                    <button
                      onClick={() => setShowAddUserModal(true)}
                      disabled={!authSelectedClientId}
                      className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-black text-xs font-bold rounded-lg transition-all shadow-md shadow-orange-500/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      Add End User
                    </button>
                  </div>
                </div>

                {/* Main section: Users Table list */}
                <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-5 py-4 border-b border-zinc-800 bg-[#151517] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-zinc-400" />
                      <h3 className="font-bold text-sm text-white">Registered End Users</h3>
                      <span className="text-[10px] bg-zinc-900 px-2 py-0.5 border border-zinc-850 rounded-full font-mono text-zinc-400">
                        {endUsers.length} active
                      </span>
                    </div>
                    
                    <button
                      onClick={() => fetchEndUsers(authSelectedClientId)}
                      disabled={loadingEndUsers || !authSelectedClientId}
                      className="p-1 px-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-md text-[11px] text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingEndUsers ? 'animate-spin' : ''}`} />
                      <span>Sync</span>
                    </button>
                  </div>

                  {loadingEndUsers ? (
                    <div className="p-16 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                      <p className="text-xs text-zinc-400 font-mono">Retrieving encrypted end-user records...</p>
                    </div>
                  ) : !authSelectedClientId ? (
                    <div className="p-16 text-center text-zinc-500 text-xs font-mono">
                      Please select or register an application first in the Applications panel.
                    </div>
                  ) : endUsers.length === 0 ? (
                    <div className="p-16 text-center space-y-3">
                      <div className="w-12 h-12 bg-zinc-900/80 rounded-full border border-zinc-800/60 flex items-center justify-center mx-auto text-zinc-500">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-zinc-400 text-sm font-semibold">No registered users found</p>
                      <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                        This sandbox environment is empty. Click the <span className="text-orange-500 font-bold">"Add End User"</span> button to register your first mock end-user.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            <th className="px-6 py-3.5">User Identity UID</th>
                            <th className="px-6 py-3.5">Full Name</th>
                            <th className="px-6 py-3.5">Email Contact</th>
                            <th className="px-6 py-3.5 text-center">Status</th>
                            <th className="px-6 py-3.5">Signed Up At</th>
                            <th className="px-6 py-3.5 text-right">Revoke / Access</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/60">
                          {endUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors text-xs text-zinc-300">
                              <td className="px-6 py-4 font-mono text-[11px] text-orange-550 text-orange-400">
                                {u.id}
                              </td>
                              <td className="px-6 py-4 font-semibold text-white">
                                {u.name}
                              </td>
                              <td className="px-6 py-4 font-mono text-zinc-400">
                                {u.email}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                  u.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                                    : "bg-red-400/10 text-red-400 border border-red-500/15"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-400" : "bg-red-450 bg-red-400"}`} />
                                  {u.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-zinc-500 font-mono text-[10px]">
                                {new Date(u.createdAt).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteEndUser(u.id)}
                                  className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/15 rounded-md text-zinc-500 hover:text-rose-450 hover:text-rose-400 transition-all cursor-pointer"
                                  title="Revoke Identity Session & Purge DB"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Modal overlay for Add User manual trigger */}
                {showAddUserModal && (
                  <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-[#121214] border border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
                    >
                      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-400" />
                          <h3 className="font-bold text-white text-sm">Register Demo End User</h3>
                        </div>
                        <button
                          onClick={() => setShowAddUserModal(false)}
                          className="text-zinc-500 hover:text-white font-mono text-lg transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleAddEndUserSubmit} className="p-6 space-y-4 font-sans text-left">
                        {addEndUserError && (
                          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 font-mono flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{addEndUserError}</span>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">Developer Client App ID</label>
                          <input
                            type="text"
                            value={authSelectedClientId}
                            disabled
                            className="w-full bg-zinc-950 border border-zinc-900 px-3 py-2 rounded-lg text-xs font-mono text-zinc-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">End User Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="John Connor"
                            value={newEndUserName}
                            onChange={(e) => setNewEndUserName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 log-input focus:border-orange-500 px-3 py-2 rounded-lg text-xs font-semibold text-white outline-none transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">End User Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="john.connor@sky.net"
                            value={newEndUserEmail}
                            onChange={(e) => setNewEndUserEmail(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 log-input focus:border-orange-500 px-3 py-2 rounded-lg text-xs font-semibold text-white outline-none transition-colors font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">Initial Status</label>
                          <select
                            value={newEndUserStatus}
                            onChange={(e) => setNewEndUserStatus(e.target.value as any)}
                            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-orange-500 px-3 py-2 rounded-lg text-xs font-semibold text-white outline-none transition-colors font-mono"
                          >
                            <option value="active">Active (Permitted Callback Access)</option>
                            <option value="suspended">Suspended (Access Revoked / Cryptography Mismatch)</option>
                          </select>
                        </div>

                        <div className="pt-4 flex justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => setShowAddUserModal(false)}
                            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-zinc-800 text-xs font-semibold text-zinc-400 rounded-lg transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={addingEndUser}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/10 disabled:opacity-50"
                          >
                            {addingEndUser ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Inserting...</span>
                              </>
                            ) : (
                              <span>Register Account</span>
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2.5: DATABASE MODULE EXPLORER */}
            {activeTab === "database" && (
              <motion.div
                key="tab-database"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header widget */}
                <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-orange-500" />
                      KeyLine Database Playground (KeyStore)
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Store, fetch, and structure records as serverless document collections using our SDK.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1.5 px-3 rounded-xl">
                      <span className="text-zinc-500 text-xs">Active Workspace:</span>
                      <select
                        value={dbSelectedClientId}
                        onChange={(e) => setDbSelectedClientId(e.target.value)}
                        className="bg-zinc-950 border-0 text-xs text-orange-500 font-mono font-bold focus:outline-none cursor-pointer"
                      >
                        {applications.map(app => (
                          <option key={app.id} value={app.clientId}>{app.name} ({app.clientId.substring(0, 12)}...)</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleClearDbRecords(dbSelectedClientId)}
                      className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-rose-900/40 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-400 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      title="Wipe database collections"
                    >
                      <Trash className="w-4 h-4" />
                      Clear DB
                    </button>
                  </div>
                </div>

                {playgroundSuccessFeedback && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{playgroundSuccessFeedback}</span>
                  </div>
                )}

                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Left Column (2/5 span): Interactive SDK Write Playground */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-orange-500" />
                          SDK Insert Playground
                        </h3>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-650 px-2 py-0.5 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-400">
                          Active Client
                        </span>
                      </div>

                      <form onSubmit={handleAddDataPlayground} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
                            Collection Key Name
                          </label>
                          <input
                            type="text"
                            required
                            value={dbPlaygroundCollection}
                            onChange={(e) => setDbPlaygroundCollection(e.target.value)}
                            placeholder="e.g. users, events, sessions"
                            className="mt-2 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
                            Document JSON Payload
                          </label>
                          <textarea
                            required
                            rows={6}
                            value={dbPlaygroundData}
                            onChange={(e) => setDbPlaygroundData(e.target.value)}
                            className="mt-2 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 rounded-lg font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                          />
                        </div>

                        {dbPlaygroundError && (
                          <div className="p-3 bg-rose-500/15 border border-rose-500/25 text-rose-400 rounded-lg text-xs font-mono leading-relaxed">
                            {dbPlaygroundError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={insertingDbPlayground || !dbSelectedClientId}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold text-black bg-orange-500 hover:bg-orange-400 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-orange-500/5"
                        >
                          {insertingDbPlayground ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-black" />
                              SDK executing fetch write...
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-black stroke-black" />
                              SDK keyline.database().collection().add()
                            </>
                          )}
                        </button>
                      </form>

                      {/* Snippet preview */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Equivalent SDK Code Runs:</div>
                        <pre className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-[10px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                          <span className="text-orange-400">keyline</span>.<span className="text-amber-500">database</span>(){"\n"}
                          {"  "}.<span className="text-amber-400">collection</span>(<span className="text-emerald-400">"{dbPlaygroundCollection}"</span>){"\n"}
                          {"  "}.<span className="text-amber-450">add</span>({(() => {
                            try {
                              return JSON.stringify(JSON.parse(dbPlaygroundData.trim() || "{}"), null, 2)
                                .split("\n")
                                .map((line, i) => i === 0 ? line : "  " + line)
                                .join("\n");
                            } catch {
                              return dbPlaygroundData;
                            }
                          })()});
                        </pre>
                      </div>

                    </div>
                  </div>

                  {/* Right Column (3/5 span): Dynamic visual Records Explorer */}
                  <div className="lg:col-span-3 space-y-6">
                    <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl min-h-[480px] flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                          <div>
                            <h3 className="font-bold text-white text-sm">Stored BAAS Records</h3>
                            <p className="text-[11px] text-zinc-500 mt-0.5">Live JSON blocks written dynamically under active client workspace.</p>
                          </div>
                          
                          <button
                            onClick={() => fetchDbRecords(dbSelectedClientId)}
                            className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded text-[11px] flex items-center gap-1.5 transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Sync View
                          </button>
                        </div>

                        {/* Collections quick badges filters */}
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-500">Filter Collections:</span>
                          <button
                            onClick={() => setDbCollectionFilter("")}
                            className={`p-1 px-2 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                              dbCollectionFilter === ""
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/25"
                                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800"
                            }`}
                          >
                            all_documents ({dbRecords.length})
                          </button>

                          {Array.from(new Set(dbRecords.map(r => r.collection))).map((colName) => {
                            const count = dbRecords.filter(r => r.collection === colName).length;
                            return (
                              <button
                                key={colName}
                                onClick={() => setDbCollectionFilter(colName)}
                                className={`p-1 px-2.5 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                                  dbCollectionFilter === colName
                                    ? "bg-orange-500/10 text-orange-400 border-orange-500/25"
                                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800"
                                }`}
                              >
                                {colName} ({count})
                              </button>
                            );
                          })}
                        </div>

                        {/* Stored Records container */}
                        {loadingDb ? (
                          <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                            <span>Querying remote collections...</span>
                          </div>
                        ) : dbRecords.length === 0 ? (
                          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-zinc-800/40 border-dashed rounded-xl space-y-2">
                            <FolderOpen className="w-8 h-8 text-zinc-600" />
                            <div className="text-xs font-bold text-zinc-450 text-white">No active documents matched</div>
                            <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                              Use the SDK playground on the left or the initializeKeyLine base functions to insert documents programmatically.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                            {dbRecords
                              .filter(r => !dbCollectionFilter || r.collection === dbCollectionFilter)
                              .map((rec) => (
                                <div
                                  key={rec.id}
                                  className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3 relative overflow-hidden group"
                                >
                                  {/* Badge label bar */}
                                  <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-orange-400 font-mono">
                                        col: {rec.collection}
                                      </span>
                                      <span className="text-zinc-600">|</span>
                                      <span className="font-mono text-zinc-500 select-all">{rec.id}</span>
                                    </div>

                                    <div className="text-zinc-500 font-mono text-[10px]">
                                      {new Date(rec.createdAt).toLocaleTimeString()}
                                    </div>
                                  </div>

                                  {/* Indented pre of data content */}
                                  <pre className="p-3 bg-black/40 border border-zinc-900/60 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-all">
                                    {JSON.stringify(rec.data, null, 2)}
                                  </pre>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-zinc-850 pt-4 mt-4 flex items-center justify-between text-xs text-zinc-500 font-mono">
                        <span>Database status: connected</span>
                        <span>KeyStore Sandboxed: SQLite Engine</span>
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB 2.6: STORAGE MODULE EXPLORER */}
            {activeTab === "storage" && (
              <motion.div
                key="tab-storage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header widget */}
                <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-orange-500" />
                      KeyLine Object Storage (ObjectBucket)
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Upload, stream, and register files or assets using our simulated high-availability serverless buckets.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1.5 px-3 rounded-xl">
                      <span className="text-zinc-500 text-xs">Active Workspace:</span>
                      <select
                        value={storageSelectedClientId}
                        onChange={(e) => setStorageSelectedClientId(e.target.value)}
                        className="bg-zinc-950 border-0 text-xs text-orange-500 font-mono font-bold focus:outline-none cursor-pointer"
                      >
                        {applications.map(app => (
                          <option key={app.id} value={app.clientId}>{app.name} ({app.clientId.substring(0, 12)}...)</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleClearStorageRecords(storageSelectedClientId)}
                      className="p-2.5 bg-zinc-900 border border-zinc-800 hover:border-rose-900/40 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-400 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      title="Purge objects bucket"
                    >
                      <Trash className="w-4 h-4" />
                      Purge Bucket
                    </button>
                  </div>
                </div>

                {playgroundSuccessFeedback && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{playgroundSuccessFeedback}</span>
                  </div>
                )}

                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Left panel: Upload file mock form */}
                  <div className="lg:col-span-2 space-y-6">

                    {/* Direct Drag & Drop Upload Zone */}
                    <div className="bg-[#121214] border border-zinc-800 p-5 rounded-2xl space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-[#ededef] text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
                          <UploadCloud className="w-4 h-4 text-orange-500" />
                          Direct File Uploader
                        </h3>
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          Drag & drop any file to decode and write directly to the container storage volume on disk.
                        </p>
                      </div>

                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative flex flex-col items-center justify-center cursor-pointer min-h-[140px] ${
                          dragActive
                            ? "border-orange-500 bg-orange-600/5 scale-[1.01]"
                            : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/10"
                        }`}
                      >
                        <input
                          type="file"
                          id="drag-and-drop-input"
                          className="hidden"
                          onChange={handleFileInputChange}
                        />
                        <label htmlFor="drag-and-drop-input" className="cursor-pointer w-full h-full block space-y-2">
                          <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mx-auto text-zinc-400">
                            {localUploading ? (
                              <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                            ) : (
                              <UploadCloud className="w-4.5 h-4.5" />
                            )}
                          </div>
                          
                          <div className="text-xs font-semibold">
                            {localUploading ? (
                              <span className="text-zinc-400 font-mono">Streaming file bytes...</span>
                            ) : (
                              <>
                                <span className="text-orange-500 font-bold hover:underline">Choose file</span>
                                <span className="text-zinc-400"> or drag here</span>
                              </>
                            )}
                          </div>
                          <p className="text-[9px] text-zinc-500 font-mono">PNG, JPEGs, PDFs or JSONs (Max 8MB)</p>
                        </label>
                      </div>

                      {localUploadError && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-[10px] font-mono leading-relaxed select-all">
                          {localUploadError}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                          <UploadCloud className="w-4 h-4 text-orange-500" />
                          SDK Upload Playground
                        </h3>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#ea580c]/20 text-orange-500 px-2 py-0.5 bg-orange-500/5 rounded border border-orange-500/10">
                          Active Put
                        </span>
                      </div>

                      <form onSubmit={handleUploadFilePlayground} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Remote Target Path
                          </label>
                          <input
                            type="text"
                            required
                            value={storagePlaygroundPath}
                            onChange={(e) => setStoragePlaygroundPath(e.target.value)}
                            placeholder="avatars/user_77.png"
                            className="mt-2 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono rounded-lg focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Original File Name
                            </label>
                            <input
                              type="text"
                              required
                              value={storagePlaygroundName}
                              onChange={(e) => {
                                setStoragePlaygroundName(e.target.value);
                                // Smart mimetype guesser
                                const name = e.target.value.toLowerCase();
                                if (name.endsWith(".png")) setStoragePlaygroundType("image/png");
                                else if (name.endsWith(".gif")) setStoragePlaygroundType("image/gif");
                                else if (name.endsWith(".jpg") || name.endsWith(".jpeg")) setStoragePlaygroundType("image/jpeg");
                                else if (name.endsWith(".pdf")) setStoragePlaygroundType("application/pdf");
                                else if (name.endsWith(".json")) setStoragePlaygroundType("application/json");
                                else setStoragePlaygroundType("application/octet-stream");
                              }}
                              placeholder="avatar.png"
                              className="mt-2 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-lg focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Estimated Bytes Size
                            </label>
                            <input
                              type="number"
                              required
                              value={storagePlaygroundSize}
                              onChange={(e) => setStoragePlaygroundSize(e.target.value)}
                              placeholder="124032"
                              className="mt-2 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-lg focus:outline-none focus:border-orange-500 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            MIME Content Type
                          </label>
                          <select
                            value={storagePlaygroundType}
                            onChange={(e) => setStoragePlaygroundType(e.target.value)}
                            className="mt-2 block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-lg focus:outline-none focus:border-orange-500"
                          >
                            <option value="image/png">image/png (Lossless Graphic)</option>
                            <option value="image/jpeg">image/jpeg (Compressed Avatar)</option>
                            <option value="image/webp">image/webp (Modern web image)</option>
                            <option value="image/gif">image/gif (Animated banner)</option>
                            <option value="application/pdf">application/pdf (Legal PDF contract)</option>
                            <option value="application/json">application/json (JSON state template)</option>
                            <option value="application/octet-stream">application/octet-stream (General Binary byte array)</option>
                          </select>
                        </div>

                        {storagePlaygroundError && (
                          <div className="p-3 bg-rose-500/15 border border-rose-500/25 text-rose-400 rounded-lg text-xs font-mono leading-relaxed">
                            {storagePlaygroundError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={uploadingStoragePlayground || !storageSelectedClientId}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold text-black bg-orange-500 hover:bg-orange-400 disabled:opacity-40 transition-all cursor-pointer shadow-md"
                        >
                          {uploadingStoragePlayground ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-black" />
                              SDK streaming payload put...
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-black stroke-black" />
                              SDK keyline.storage().ref().put()
                            </>
                          )}
                        </button>
                      </form>

                      {/* Snippet preview */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Equivalent SDK Code Runs:</div>
                        <pre className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-[10px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                          <span className="text-orange-400">keyline</span>.<span className="text-amber-500">storage</span>(){"\n"}
                          {"  "}.<span className="text-amber-400">ref</span>(<span className="text-emerald-400">"{storagePlaygroundPath}"</span>){"\n"}
                          {"  "}.<span className="text-amber-450">put</span>({"{"}{"\n"}
                          {"    "}name: <span className="text-emerald-400">"{storagePlaygroundName}"</span>,{"\n"}
                          {"    "}size: <span className="text-amber-500">{storagePlaygroundSize}</span>,{"\n"}
                          {"    "}type: <span className="text-emerald-400">"{storagePlaygroundType}"</span>{"\n"}
                          {"  "}{"}"});
                        </pre>
                      </div>

                    </div>
                  </div>

                  {/* Right panel: Bucket elements explorer */}
                  <div className="lg:col-span-3 space-y-6">
                    <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl min-h-[480px] flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                          <div>
                            <h3 className="font-bold text-white text-sm">Active Storage Bucket Files</h3>
                            <p className="text-[11px] text-zinc-500 mt-0.5">Asset objects and simulated path files hosted under the workspace.</p>
                          </div>

                          <button
                            onClick={() => fetchStorageRecords(storageSelectedClientId)}
                            className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded text-[11px] flex items-center gap-1.5 transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Sync Bucket
                          </button>
                        </div>

                        {loadingStorage ? (
                          <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                            <span>Iterating bucket directory indexes...</span>
                          </div>
                        ) : storageRecords.length === 0 ? (
                          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-zinc-800/40 border-dashed rounded-xl space-y-2">
                            <UploadCloud className="w-8 h-8 text-zinc-650" />
                            <div className="text-xs font-bold text-white">Cloud Storage isolated bucket is empty</div>
                            <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                              Begin putting files from client apps or using our upload simulation form to test remote mime distribution.
                            </p>
                          </div>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
                            {storageRecords.map((file) => {
                              const isImage = file.mimeType.startsWith("image/");
                              return (
                                <div
                                  key={file.id}
                                  className="bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 space-y-3 flex flex-col justify-between group hover:border-zinc-800 transition-all"
                                >
                                  <div className="space-y-2">
                                    {/* Thumbnail if graphic preview */}
                                    {isImage ? (
                                      <div className="h-28 w-full bg-[#18181c] border border-zinc-850/80 rounded-lg overflow-hidden relative">
                                        <img
                                          src={file.simulatedUrl}
                                          referrerPolicy="no-referrer"
                                          alt={file.originalName}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 text-[8.5px] font-mono bg-zinc-950/85 text-emerald-400 font-bold uppercase rounded border border-emerald-500/10">
                                          CDN PREVIEW
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-28 w-full bg-[#18181c] border border-zinc-850/80 rounded-lg flex flex-col items-center justify-center text-zinc-500 gap-2">
                                        <FileCode className="w-8 h-8 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                                        <span className="text-[9.5px] font-mono text-zinc-500 select-all">{file.mimeType}</span>
                                      </div>
                                    )}

                                    <div className="space-y-0.5">
                                      <div className="text-xs font-bold text-white truncate font-sans">{file.originalName}</div>
                                      <div className="text-[10px] font-mono text-zinc-500 truncate" title="Relative Target Path">
                                        path: {file.filePath}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[10px] font-mono text-zinc-500">
                                    <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                                    <a
                                      href={file.simulatedUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-orange-500 hover:text-orange-400 font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                      Launch Url &rarr;
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>

                      <div className="border-t border-zinc-850 pt-4 mt-4 flex items-center justify-between text-xs text-zinc-500 font-mono">
                        <span>Simulated Bucket region: multi-regional US/EU</span>
                        <span>Bandwidth SLA: Unlimited</span>
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB 3: SETTINGS & INTEGRATION WORKTHROUGH */}
            {activeTab === "settings" && (
              <motion.div
                key="tab-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                
                {/* Integration interactive sandbox banner */}
                <div className="bg-[#121214] border border-zinc-800/80 p-6 rounded-2xl space-y-6">
                  <div>
                    <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-orange-500" /> KeyLine Dynamic Integration Walkthrough
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Integrators load our optimized static SDK from `/keyline-base.js` to initialize the secure multi-origin OAuth redirect loop.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 items-stretch">
                    
                    {/* Visual client config selector */}
                    <div className="bg-zinc-900 border border-zinc-800/60 p-5 rounded-xl flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        <div className="text-sm font-bold text-white uppercase tracking-wider text-xs">Configure Interactive SDK Preview</div>
                        
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-400">Target Application</label>
                          <select
                            className="block w-full py-2 px-3 bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded focus:outline-none focus:border-orange-500"
                            onChange={(e) => {
                              const found = applications.find(a => a.id === e.target.value);
                              // We just force updates
                            }}
                          >
                            {applications.map(app => (
                              <option key={app.id} value={app.id}>{app.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pb-2 text-xs">
                          <div>
                            <div className="text-zinc-500">Selected Client ID</div>
                            <div className="font-mono text-zinc-300 mt-0.5 truncate">{activeAppSample.clientId}</div>
                          </div>
                          <div>
                            <div className="text-zinc-500">Redirect callback URL</div>
                            <div className="font-mono text-zinc-300 mt-0.5 truncate">{activeAppSample.redirectUris[0] || "None"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-orange-500/5 border border-orange-500/10 rounded-lg text-xs leading-relaxed text-orange-500 flex items-start gap-2">
                        <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>This boilerplate uses fully reactive bindings. Copy it directly to test with your frontend frameworks.</span>
                      </div>
                    </div>

                    {/* Live boilerplate clipboard */}
                    <div className="bg-zinc-900/60 border border-zinc-800/85 rounded-xl overflow-hidden flex flex-col">
                      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-mono bg-zinc-950">
                        <span>HTML SDK Integration Wrapper</span>
                        <button
                          onClick={() => handleCopyText(
`<!-- Import KeyLine SDK CDN -->
<script type="module">
  import { initializeKeyLine } from "${window.location.origin}/keyline-base.js";

  const keyline = initializeKeyLine({
    clientId: "${activeAppSample.clientId}",
    redirectUri: "${activeAppSample.redirectUris[0] || "http://localhost:3000/callback"}"
  });

  // Trigger browser login layout
  console.log("Ready to login!");
  keyline.loginWithRedirect();
</script>`, "sdk_integration_code")}
                          className="flex items-center gap-1 hover:text-orange-500 transition-colors"
                        >
                          {copiedId === "sdk_integration_code" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Block</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-4 flex-1 overflow-x-auto text-[10.5px] font-mono text-zinc-300 leading-relaxed bg-black/40">
                        <span className="text-zinc-600">&lt;!-- Import KeyLine SDK CDN --&gt;</span>{"\n"}
                        <span className="text-orange-400">&lt;script</span> <span className="text-amber-500">type</span>=<span className="text-emerald-400">"module"</span><span className="text-orange-400">&gt;</span>{"\n"}
                        {"  "}<span className="text-orange-500">import</span> {"{"} <span className="text-amber-400">initializeKeyLine</span> {"}"} <span className="text-orange-500">from</span> <span className="text-emerald-400">"{window.location.origin}/keyline-base.js"</span>;{"\n\n"}
                        {"  "}<span className="text-purple-400">const</span> <span className="text-blue-400">keyline</span> = <span className="text-amber-400">initializeKeyLine</span>({"{"}{"\n"}
                        {"    "}clientId: <span className="text-emerald-400">"{activeAppSample.clientId}"</span>,{"\n"}
                        {"    "}redirectUri: <span className="text-emerald-400">"{activeAppSample.redirectUris[0] || "http://localhost:3000/callback"}"</span>{"\n"}
                        {"  "}{"}"});{"\n\n"}
                        {"  "}<span className="text-zinc-600">// Initiate Redirect Authorization Flow</span>{"\n"}
                        {"  "}<span className="text-blue-400">keyline</span>.<span className="text-amber-400">loginWithRedirect</span>();{"\n"}
                        <span className="text-orange-400">&lt;/script&gt;</span>
                      </pre>
                    </div>

                    {/* Database & Storage SDK Blocks */}
                    <div className="bg-[#121214] border border-zinc-800 p-6 rounded-2xl space-y-6 md:col-span-2">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-white text-md flex items-center gap-2">
                          <Database className="w-5 h-5 text-orange-400" />
                          KeyStore & ObjectBucket SDK Extensions Reference
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Now that step 2 is fully compiled, your initialized `keyline` base clients contain standard `.database()` and `.storage()` proxies!
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Database code */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden flex flex-col justify-between">
                          <div className="p-4 border-b border-zinc-900 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
                            <span>1. Database Collections (JSON)</span>
                            <button
                              onClick={() => handleCopyText(
`// 1. Initialize SDK
const keyline = initializeKeyLine({
  clientId: "${activeAppSample.clientId}",
  clientSecret: "kl_secret_..." // secure client secret is required for backend API authentication
});

// 2. Write simple JSON payload to a collection
await keyline.database()
  .collection("user_profiles")
  .add({
    name: "John Connor",
    birthYear: 1985,
    isLeader: true
  });

// 3. Query all records from collection
const users = await keyline.database()
  .collection("user_profiles")
  .get();`, "db_sdk_code")}
                              className="text-[11px] text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1"
                            >
                              {copiedId === "db_sdk_code" ? <span className="text-emerald-400">Copied!</span> : <span>Copy Snippet</span>}
                            </button>
                          </div>

                          <pre className="p-4 text-[10px] font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-64">
                            <span className="text-zinc-500">// Initialize client authentication</span>{"\n"}
                            <span className="text-purple-400">const</span> <span className="text-blue-400">keyline</span> = <span className="text-amber-500">initializeKeyLine</span>({"{"}{"\n"}
                            {"  "}clientId: <span className="text-emerald-400">"{activeAppSample.clientId}"</span>,{"\n"}
                            {"  "}clientSecret: <span className="text-emerald-400">"kl_secret_..."</span>{"\n"}
                            {"}"});{"\n\n"}
                            <span className="text-zinc-500">// Store structured JSON document</span>{"\n"}
                            <span className="text-purple-400">await</span> <span className="text-blue-400">keyline</span>.<span className="text-[#a1a1aa]">database</span>(){"\n"}
                            {"  "}.<span className="text-orange-400">collection</span>(<span className="text-emerald-500">"user_profiles"</span>){"\n"}
                            {"  "}.<span className="text-amber-400">add</span>({"{"}{"\n"}
                            {"    "}name: <span className="text-emerald-400">"John Connor"</span>,{"\n"}
                            {"    "}birthYear: <span className="text-amber-400">1985</span>,{"\n"}
                            {"    "}isLeader: <span className="text-orange-500">true</span>{"\n"}
                            {"  "}{"}"});
                          </pre>
                        </div>

                        {/* Storage code */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden flex flex-col justify-between">
                          <div className="p-4 border-b border-zinc-900 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
                            <span>2. Remote Public Storage Put</span>
                            <button
                              onClick={() => handleCopyText(
`// 1. Initialize SDK
const keyline = initializeKeyLine({
  clientId: "${activeAppSample.clientId}",
  clientSecret: "kl_secret_..."
});

// 2. Put a mock file attachment
const response = await keyline.storage()
  .ref("resumes/candidate_01.pdf")
  .put({
    name: "candidate_01.pdf",
    size: 204850,
    type: "application/pdf"
  });

console.log("Uploaded! URL is:", response.simulatedUrl);`, "storage_sdk_code")}
                              className="text-[11px] text-zinc-500 hover:text-orange-500 transition-colors flex items-center gap-1"
                            >
                              {copiedId === "storage_sdk_code" ? <span className="text-emerald-400">Copied!</span> : <span>Copy Snippet</span>}
                            </button>
                          </div>

                          <pre className="p-4 text-[10px] font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-64">
                            <span className="text-zinc-500">// PUT simulation helper</span>{"\n"}
                            <span className="text-purple-400">await</span> <span className="text-blue-400">keyline</span>.<span className="text-[#a1a1aa]">storage</span>(){"\n"}
                            {"  "}.<span className="text-orange-400">ref</span>(<span className="text-emerald-500">"resumes/candidate_01.pdf"</span>){"\n"}
                            {"  "}.<span className="text-amber-400">put</span>({"{"}{"\n"}
                            {"    "}name: <span className="text-emerald-400">"candidate_01.pdf"</span>,{"\n"}
                            {"    "}size: <span className="text-amber-400">204850</span>,{"\n"}
                            {"    "}type: <span className="text-emerald-400">"application/pdf"</span>{"\n"}
                            {"  "}{"}"});
                          </pre>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>

                {/* Developer Account Panel options */}
                <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
                  <div>
                    <h2 className="font-extrabold text-white text-lg">My Developer Identity</h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Manage account variables and local security parameters.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 text-xs text-zinc-400">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Registered Name</span>
                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-medium">
                          {user.name}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Developer Credentials Email</span>
                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-medium">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Local Sandbox JWT Key</span>
                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-mono text-[10.5px] truncate">
                          {token.substring(0, 48)}...
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Authentication Method</span>
                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-medium flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-orange-500" />
                          Platform Hashed Salt BCrypt Credentials
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* KEYLINE AI SITE SUPPORT EXPERT ASSISTANT CO-PILOT WIDGET                 */}
      {/* ========================================================================= */}
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          id="keyline-chatbot-trigger"
          onClick={() => setChatOpen(!chatOpen)}
          className={`relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-[#09090b] shadow-[0_4px_20px_rgba(234,88,12,0.35)] hover:shadow-[0_4px_30px_rgba(234,88,12,0.55)] border border-orange-400/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer`}
          title="Open KeyLine AI Technical Support"
        >
          {chatOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <>
              <Bot className="w-6 h-6 stroke-[2]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </>
          )}
          
          {/* Subtle popover label on hover */}
          <span className="absolute right-16 bg-zinc-900 text-zinc-100 text-[11px] font-mono font-semibold py-1.5 px-3 rounded-lg border border-zinc-800 tracking-wide pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl">
            KeyLine Support AI <span className="text-orange-500">Online</span>
          </span>
        </button>
      </div>

      {/* Floating Chat Panel overlay */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[520px] max-h-[80vh] bg-[#121214] border border-zinc-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(234,88,12,0.1)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide">KeyLine Core Co-Pilot</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 uppercase">Sandbox Mode Expert</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChatMessages([
                    {
                      sender: "bot",
                      text: "Hello! I am your KeyLine AI Assistant, specialized in server architectures, security, and storage solutions. How can I help you with your sandbox development today? Ask me about Firebase migrations, OAuth 2.0 authorization, Custom JWT signing, database structures, or official human support channels.",
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ])}
                  className="p-1.5 text-zinc-500 hover:text-zinc-350 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Reset conversation stream"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-orange-500/10 border border-orange-500/20 text-orange-300 rounded-tr-none text-right"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none text-left"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="space-y-2">
                        {renderMessageText(msg.text)}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-zinc-600 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl rounded-tl-none p-3 flex items-center gap-1.5 text-xs text-zinc-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                    <span>Analyzing integration guidelines...</span>
                  </div>
                </div>
              )}
              
              {/* Dummy container for scrolling */}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Shortcuts Container */}
            <div className="px-4 py-2 bg-zinc-900/40 border-t border-zinc-800/50 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto select-none">
              <button
                type="button"
                onClick={() => handleSendMessage("How do I migrate from Firebase?")}
                className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 hover:border-orange-500/35 hover:text-orange-400 px-2 py-1 rounded-md transition-all cursor-pointer"
              >
                🔥 Firebase Migration
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Explain OAuth 2.0 redirection flows.")}
                className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 hover:border-orange-500/35 hover:text-orange-400 px-2 py-1 rounded-md transition-all cursor-pointer"
              >
                🔑 OAuth 2.0 Auth
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("What does a KeyLine JWT payload contain?")}
                className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 hover:border-orange-500/35 hover:text-orange-400 px-2 py-1 rounded-md transition-all cursor-pointer"
              >
                🎫 JWT Claims
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("How do I get official support for a bug?")}
                className="text-[10px] font-mono font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 hover:border-orange-500/35 hover:text-orange-400 px-2 py-1 rounded-md transition-all cursor-pointer"
              >
                🚨 Official Support
              </button>
            </div>

            {/* Input Form area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2 items-center shrink-0"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask co-pilot (OAuth, Firebase migration, Contact human support...)"
                className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 rounded-lg py-1.5 px-3 text-xs text-white placeholder-zinc-500 outline-none transition-all font-sans"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isBotTyping}
                className="p-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-orange-600 text-[#09090b] rounded-lg transition-colors cursor-pointer flex items-center justify-center animate-duration-300"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Secure Local Privacy Disclaimer */}
            <div className="bg-zinc-950 border-t border-zinc-900/60 p-2 text-center text-[9px] font-mono font-bold tracking-wider text-zinc-600 leading-normal uppercase">
              Note: This assistant runs locally for sandbox testing and does not collect or share your personal chat data.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
