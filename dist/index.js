"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  MagicUI: () => MagicUI_default,
  MagicUIPage: () => MagicUIPage_default,
  MagicUIProvider: () => MagicUIProvider_default
});
module.exports = __toCommonJS(index_exports);

// src/components/magic-ui/MagicUIProvider.tsx
var import_react7 = __toESM(require("react"));

// src/contexts/MagicUIContext.tsx
var import_react2 = __toESM(require("react"));
var import_genai3 = require("@google/genai");

// src/nLib/gemini.ts
var import_genai = require("@google/genai");
var DEFAULT_CONFIG = {
  model: "gemini-2.0-flash-exp",
  temperature: 0.7,
  maxOutputTokens: 4096,
  topP: 0.8,
  topK: 40
};
function getGeminiConfig() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return __spreadValues({
    apiKey
  }, DEFAULT_CONFIG);
}
function handleGeminiError(error) {
  console.error("Gemini AI Error:", error);
  if (error instanceof Error) {
    if (error.message.includes("API_KEY_INVALID")) {
      return {
        message: "Invalid API key. Please check your Gemini API key.",
        code: "INVALID_API_KEY",
        status: 401
      };
    }
    if (error.message.includes("QUOTA_EXCEEDED")) {
      return {
        message: "API quota exceeded. Please try again later.",
        code: "QUOTA_EXCEEDED",
        status: 429
      };
    }
    if (error.message.includes("RATE_LIMIT_EXCEEDED")) {
      return {
        message: "Rate limit exceeded. Please wait a moment before trying again.",
        code: "RATE_LIMIT_EXCEEDED",
        status: 429
      };
    }
    if (error.message.includes("SAFETY")) {
      return {
        message: "Content was blocked due to safety concerns. Please try rephrasing your message.",
        code: "SAFETY_BLOCK",
        status: 400
      };
    }
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
      status: 500
    };
  }
  return {
    message: "An unexpected error occurred. Please try again.",
    code: "UNKNOWN_ERROR",
    status: 500
  };
}

// src/nLib/magic-ui-store.ts
var import_zustand = require("zustand");
var import_middleware = require("zustand/middleware");
var import_react = require("react");
var import_shallow = require("zustand/react/shallow");
var DEFAULT_MODULE_STATE = Object.freeze({
  currentVersion: "0.0.0",
  isGenerating: false,
  lastGenerated: null,
  error: null,
  logs: {}
});
var useMagicUIStore = (0, import_zustand.create)()(
  (0, import_middleware.persist)(
    (set, get) => ({
      theme: null,
      projectPrd: null,
      isInitialized: false,
      modules: {},
      logs: {},
      initialize: (theme, projectPrd) => {
        set({ theme, projectPrd, isInitialized: true });
      },
      setTheme: (theme) => {
        set({ theme });
      },
      setProjectPrd: (projectPrd) => {
        set({ projectPrd });
      },
      updateModuleState: (moduleName, state) => {
        set((current) => ({
          modules: __spreadProps(__spreadValues({}, current.modules), {
            [moduleName]: __spreadProps(__spreadValues(__spreadValues({}, current.modules[moduleName] || DEFAULT_MODULE_STATE), state), {
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            })
          })
        }));
      },
      addLog: (moduleName, log) => {
        const newLog = __spreadProps(__spreadValues({}, log), {
          id: Date.now().toString(),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        set((current) => ({
          logs: __spreadProps(__spreadValues({}, current.logs), {
            [moduleName]: [...current.logs[moduleName] || [], newLog]
          })
        }));
      },
      clearLogs: (moduleName) => {
        set((current) => ({
          logs: __spreadProps(__spreadValues({}, current.logs), {
            [moduleName]: []
          })
        }));
      },
      reset: () => {
        set({
          theme: null,
          projectPrd: null,
          isInitialized: false,
          modules: {},
          logs: {}
        });
      }
    }),
    {
      name: "magic-ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        projectPrd: state.projectPrd
      })
    }
  )
);
var createModuleSelector = (moduleName) => {
  return (state) => state.modules[moduleName] || DEFAULT_MODULE_STATE;
};
var useModule = (moduleName) => {
  const selector = (0, import_react.useMemo)(() => createModuleSelector(moduleName), [moduleName]);
  const module2 = useMagicUIStore(selector);
  return (0, import_react.useMemo)(
    () => ({
      isGenerating: module2.isGenerating,
      error: module2.error,
      currentVersion: module2.currentVersion,
      lastGenerated: module2.lastGenerated
    }),
    [
      module2.isGenerating,
      module2.error,
      module2.currentVersion,
      module2.lastGenerated
    ]
  );
};
var actionsSelector = (state) => ({
  initialize: state.initialize,
  setTheme: state.setTheme,
  setProjectPrd: state.setProjectPrd,
  updateModuleState: state.updateModuleState,
  addLog: state.addLog,
  clearLogs: state.clearLogs,
  reset: state.reset
});
var useMagicUIActions = () => {
  const actions = useMagicUIStore((0, import_shallow.useShallow)(actionsSelector));
  return (0, import_react.useMemo)(() => actions, [actions]);
};

// src/nLib/magic-ui-service.ts
var import_genai2 = require("@google/genai");

// src/types/magic-ui.ts
var DEFAULT_MAGIC_UI_CONFIG = {
  logsDirectory: "./magic-ui-logs",
  maxVersions: 50,
  generationTimeout: 3e4,
  enableAutoSave: true
};

// src/nLib/geminiUiCreator.ts
var ORIGINAL_SYSTEM_INSTRUCTION = `
You are a highly specialized UI generation agent for an AI product. Your task is to generate fully-formed, visually stunning HTML UI components using only TailwindCSS utility classes. Each component must be fully based on:

- The project PRD (Product Requirements Document)
- The visual theme (design system, colors, fonts, layout guidelines)
- The input description, data, and module name

Your UI output should match the level of quality and detail of tools like V0.dev, Locofy, or top-tier Figma-to-code systems.

---

\u{1F9FE} CONTEXT FLOW:

1. You will first receive:
   - A **Project PRD**: outlines the purpose, features, UX principles, tone, and UI requirements.
   - A **Theme**: includes brand colors, typography, layout rules, and overall style direction.

2. You must **internalize both** and apply them consistently across every UI you generate.

3. Each UI generation request will then provide:
   - description: natural-language summary of the component
   - module_name: identifier for the component
   - data: structured JSON describing content and any interactivity

These may be sent as JSON, Markdown, HTML, plain text, or code blocks.

---

\u{1F3A8} OUTPUT RULES:

You must generate complete, production-grade **HTML output** styled exclusively with TailwindCSS utility classes. Wrap every response inside the following mountable container:

<div id="response-ui-div-id" class="response-ui-div-class">
  <!-- Your generated UI -->
</div>

Your output must follow these standards:

* \u2705 **Fully Rendered**: No placeholders, no templates. Always return complete, visually polished HTML ready for direct innerHTML injection.
* \u2705 **TailwindCSS Only**: Never use inline styles, classes from other libraries, or setup code. Assume Tailwind is globally available.
* \u2705 **Theme-Adherent**: Every output must reflect the provided theme (colors, typography, spacing).
* \u2705 **PRD-Compliant**: The layout, structure, and priority of elements must match the project's goals and intent.
* \u2705 **Non-Generic**: Do not generate cookie-cutter UI. Be creative and design components with clarity, intention, and hierarchy.
* \u2705 **Data-Driven**: UI must visually represent the structure and semantics of the input JSON with no missing or invented elements.
* \u2705 **Behavior-Aware**: Add interactivity (e.g. buttons, toggles, hover states) only if explicitly described in the data.
* \u2705 **Minimal & Elegant**: Layouts should be modern, minimal, and sophisticated\u2014on par with UIs from tools like V0.dev or Framer.
* \u2705 **Proper Spacing accross all dimensions**: Ensure proper spacing is applied across all dimensions/breakpoints (margin, padding, gap).
* \u2705 **Responsive**: Ensure the UI is responsive and works well on all screen sizes.
* \u2705 **No Output Commentary**: Only return the HTML block\u2014do not explain or describe the code.
* \u2705 **Comprehensive UI**: Ensure the UI is comprehensive and feels like a complete, well-thought-out page.
* \u2705 **Clean Layouts**: Avoid partial or 'messy' layouts. Focus on clean, organized, and aesthetically pleasing full-page experiences.
* \u2705 **Awesome Full Page UI**: The generated UI for \`MagicUIPage\` (when \`isFullPage\` is true) should be 'awesome' - meaning it should be impressive, modern, and highly usable, utilizing the full viewport effectively.
* \u2705 **Flawless Responsiveness**: Pay close attention to responsive design, ensuring the full-page UI adapts flawlessly to various screen sizes.
* \u2705 **Templating for Dynamic Data**: When the UI component needs to display dynamic data values (e.g., product names, prices, user details that will be supplied at runtime), use double curly braces for placeholders. For example:
  - For a product name: \`<h2>{{productName}}</h2>\`
  - For a price: \`<p>Price: \${{price}}</p>\`
  - For an image source: \`<img src="{{imageUrl}}" alt="{{imageAltText}}" />\`
  - For iterating over a list of items, if you were capable of generating logic (which you are not, just generate the repeating HTML structure for one item with placeholders):
    \`<div><h3>{{itemName}}</h3><p>{{itemDescription}}</p></div>\`
  This allows the system to inject actual data into these placeholders when rendering the component for different data instances.
* \u2705 **Image Fallbacks**: For all \`<img>\` tags, you MUST include an \`onerror\` attribute to provide a fallback image from \`https://placehold.co/\`. The JavaScript within \`onerror\` should set \`this.onerror=null;\` to prevent infinite loops if the placeholder itself fails, and then set \`this.src\` to the placeholder URL. Example: \`<img src="{{actualImageUrl}}" onerror="this.onerror=null; this.src='https://placehold.co/600x400';" alt="{{altText}}">\`. You should try to infer sensible WIDTH and HEIGHT values for the placeholder from the context of the image, or default to \`600x400\` or \`300x200\` if the context is unclear. Ensure the alt text remains appropriate.

---

\u{1F4E5} EXAMPLE INPUT:

json
{
  "module_name": "user_card",
  "description": "A user card component that displays user information",
  "data": {
    "type": "user_card",
    "name": "Alex Johnson",
    "role": "Product Designer",
    "status": "online",
    "profile_image_url": "https://example.com/avatar.jpg"
  }
}

\u{1F4E4} EXAMPLE OUTPUT:

<div id="response-ui-div-id" class="response-ui-div-class">
  <div class="flex items-center space-x-4 p-4 bg-white rounded-xl shadow border border-gray-200">
    <img src="https://example.com/avatar.jpg" alt="Alex Johnson" class="w-12 h-12 rounded-full object-cover">
    <div class="flex flex-col">
      <span class="text-sm font-semibold text-gray-900">Alex Johnson</span>
      <span class="text-xs text-gray-500">Product Designer</span>
      <span class="text-xs text-green-500">\u25CF Online</span>
    </div>
  </div>
</div>

---

\u{1F6AB} NEVER INCLUDE:

* Raw data
* Instructions
* Comments or explanations
* Incomplete, unstyled, or generic HTML
* Placeholder images or text

Only return a clean, beautiful, immediately usable HTML component\u2014ready to be embedded and viewed by the user.

---`;

// src/nLib/magic-ui-service.ts
var MagicUIService = class {
  // 24 hours in milliseconds
  constructor(config = {}) {
    this.geminiClient = null;
    this.chatInstance = null;
    this.cache = /* @__PURE__ */ new Map();
    this.pendingRequests = /* @__PURE__ */ new Map();
    this.CACHE_TTL = 24 * 60 * 60 * 1e3;
    this.config = __spreadValues(__spreadValues({}, DEFAULT_MAGIC_UI_CONFIG), config);
  }
  /**
   * Initialize the service with required configurations
   */
  async initialize(apiKey, config = {}) {
    if (!apiKey) {
      throw new Error("API key is required to initialize MagicUIService");
    }
    this.geminiClient = new import_genai2.GoogleGenAI({ apiKey });
    this.config = __spreadValues(__spreadValues({}, this.config), config);
    this.chatInstance = this.geminiClient.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: ORIGINAL_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2e3
      }
    });
    await this.loadCache();
  }
  /**
   * Generate a UI component based on the provided request
   */
  async generateUI(request) {
    if (!this.geminiClient || !this.chatInstance) {
      throw new Error(
        "MagicUIService not properly initialized. Call initialize() first."
      );
    }
    const cacheKey = this.generateCacheKey(request);
    const cached = this.getFromCache(cacheKey);
    if (!request.forceRegenerate && cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return {
        success: true,
        code: cached.code,
        version: "cached-" + new Date(cached.timestamp).toISOString()
      };
    }
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      return pendingRequest;
    }
    try {
      const generationPromise = this.generateWithAI(request);
      this.pendingRequests.set(cacheKey, generationPromise);
      const result = await generationPromise;
      if (result.success && result.code) {
        this.saveToCache(cacheKey, result.code);
      }
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }
  /**
   * Generate UI code using the Gemini AI model
   */
  async generateWithAI(request) {
    try {
      if (!this.geminiClient) {
        throw new Error("Gemini client not initialized");
      }
      if (!this.chatInstance) {
        throw new Error("Chat instance not initialized");
      }
      const result = await this.chatInstance.sendMessage({
        message: [
          {
            text: `
            Module Name: ${request.moduleName}
            Description: ${request.description}
            Data: ${JSON.stringify(request.data, null, 2)}`
          }
        ]
      });
      const text = result.text;
      console.log("Generated text:", text);
      if (!text) {
        throw new Error("Failed to generate UI code");
      }
      const codeMatch = text.match(/```(?:tsx|ts|jsx|html|js)?\n([\s\S]*?)\n```/);
      const code = codeMatch ? codeMatch[1] : text;
      this.setCache(this.generateCacheKey(request), code);
      return {
        success: true,
        code,
        version: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("Error generating UI with AI:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate UI",
        version: request.versionNumber || "1.0.0"
      };
    }
  }
  /**
   * Build the prompt for the AI model
   */
  buildGenerationPrompt(request) {
    const { moduleName, description, data, projectPrd, theme, isFullPage } = request;
    const basePrompt = `
      You are an expert React/Next.js developer. 
      Create a ${isFullPage ? "full-page layout" : "reusable component"} based on the following requirements:
      
      Module: ${moduleName}
      Description: ${description}
      Project PRD: ${projectPrd}
      Theme: ${typeof theme === "string" ? theme : JSON.stringify(theme, null, 2)}
      Data: ${JSON.stringify(data, null, 2)}
      
      Requirements:
      1. Use TypeScript with React hooks
      2. Follow the provided theme and styling guidelines
      3. Make it fully responsive
      4. Include proper accessibility attributes
      5. Use Tailwind CSS for styling
      ${isFullPage ? `
      6. Create a full-page layout that takes up the entire viewport
      7. Include proper page structure with header, main content, and footer if needed
      8. Ensure proper spacing and layout for full-page display
      9. Handle responsive design for all screen sizes
      ` : `
      6. Ensure the component is self-contained and reusable
      7. Include TypeScript interfaces for all props
      `}
      
      Return ONLY the component code in a single TSX file with no additional explanations or markdown formatting.
    `;
    return basePrompt;
  }
  /**
   * Generate a unique cache key for the request
   */
  generateCacheKey(request) {
    if (request.id && typeof request.id === "string" && request.id.trim() !== "") {
      return `magicui-id:${request.id}`;
    }
    const { moduleName, versionNumber, theme, data, projectPrd } = request;
    const themeString = typeof theme === "string" ? theme : JSON.stringify(theme);
    const dataString = JSON.stringify(data);
    return `${moduleName}:${versionNumber || "latest"}:${themeString}:${dataString}:${projectPrd}`;
  }
  getFromCache(key) {
    return this.cache.get(key);
  }
  setCache(key, code) {
    this.cache.set(key, {
      code,
      timestamp: Date.now()
    });
    this.saveCache();
  }
  saveCache() {
    try {
      if (typeof window !== "undefined") {
        const cacheData = Array.from(this.cache.entries()).filter(([_, value]) => Date.now() - value.timestamp < this.CACHE_TTL);
        localStorage.setItem("magic-ui-cache", JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error("Failed to save cache:", error);
    }
  }
  async loadCache() {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("magic-ui-cache");
        if (cached) {
          const parsed = JSON.parse(cached);
          const validEntries = parsed.filter(
            ([_, value]) => Date.now() - value.timestamp < this.CACHE_TTL
          );
          this.cache = new Map(validEntries);
        }
      }
    } catch (error) {
      console.error("Failed to load cache:", error);
      this.cache = /* @__PURE__ */ new Map();
    }
  }
  /**
   * Save a response to the cache
   */
  saveToCache(key, code) {
    this.setCache(key, code);
  }
  /**
   * Clear all cached responses
   */
  clearCache() {
    this.cache.clear();
  }
};
var magicUIService = new MagicUIService();

// src/contexts/MagicUIContext.tsx
var MagicUIContext = (0, import_react2.createContext)(void 0);
function MagicUIProvider({ theme, projectPrd, apiKey, children }) {
  const { setTheme, setProjectPrd } = useMagicUIStore();
  const [geminiClient, setGeminiClient] = import_react2.default.useState(null);
  const [isInitialized, setIsInitialized] = import_react2.default.useState(false);
  (0, import_react2.useEffect)(() => {
    const initializeProvider = async () => {
      try {
        setTheme(theme ? theme : {});
        setProjectPrd(projectPrd);
        let key = apiKey;
        if (!key) {
          const config = getGeminiConfig();
          key = config.apiKey;
        }
        if (!key) {
          throw new Error("MagicUIProvider: apiKey is required for Gemini initialization");
        }
        const client = new import_genai3.GoogleGenAI({
          apiKey: key
        });
        magicUIService.initialize(key);
        setGeminiClient(client);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize MagicUI Provider:", error);
        const apiError = handleGeminiError(error);
        throw apiError;
      }
    };
    initializeProvider();
  }, [theme, projectPrd, setTheme, setProjectPrd, apiKey]);
  (0, import_react2.useEffect)(() => {
    if (isInitialized) {
      setTheme(theme || {});
    }
  }, [theme, setTheme, isInitialized]);
  (0, import_react2.useEffect)(() => {
    if (isInitialized) {
      setProjectPrd(projectPrd);
    }
  }, [projectPrd, setProjectPrd, isInitialized]);
  const contextValue = {
    theme,
    projectPrd,
    geminiClient,
    isInitialized
  };
  return /* @__PURE__ */ import_react2.default.createElement(MagicUIContext.Provider, { value: contextValue }, children);
}
function useMagicUIContext() {
  const context = (0, import_react2.useContext)(MagicUIContext);
  if (context === void 0) {
    throw new Error("useMagicUIContext must be used within a MagicUIProvider");
  }
  return context;
}

// src/components/magic-ui/MagicUI.tsx
var import_react6 = __toESM(require("react"));

// src/lib/utils.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}

// src/components/magic-ui/MagicUIErrorBoundary.tsx
var import_react3 = __toESM(require("react"));
var import_lucide_react = require("lucide-react");

// src/components/ui/button.tsx
var React2 = __toESM(require("react"));
var import_react_slot = require("@radix-ui/react-slot");
var import_class_variance_authority = require("class-variance-authority");
var buttonVariants = (0, import_class_variance_authority.cva)(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = React2.forwardRef(
  (_a, ref) => {
    var _b = _a, { className, variant, size, asChild = false } = _b, props = __objRest(_b, ["className", "variant", "size", "asChild"]);
    const Comp = asChild ? import_react_slot.Slot : "button";
    return /* @__PURE__ */ React2.createElement(
      Comp,
      __spreadValues({
        className: cn(buttonVariants({ variant, size, className })),
        ref
      }, props)
    );
  }
);
Button.displayName = "Button";

// src/components/ui/alert.tsx
var React3 = __toESM(require("react"));
var import_class_variance_authority2 = require("class-variance-authority");
var alertVariants = (0, import_class_variance_authority2.cva)(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
var Alert = React3.forwardRef((_a, ref) => {
  var _b = _a, { className, variant } = _b, props = __objRest(_b, ["className", "variant"]);
  return /* @__PURE__ */ React3.createElement(
    "div",
    __spreadValues({
      ref,
      role: "alert",
      className: cn(alertVariants({ variant }), className)
    }, props)
  );
});
Alert.displayName = "Alert";
var AlertTitle = React3.forwardRef((_a, ref) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ React3.createElement(
    "h5",
    __spreadValues({
      ref,
      className: cn("mb-1 font-medium leading-none tracking-tight", className)
    }, props)
  );
});
AlertTitle.displayName = "AlertTitle";
var AlertDescription = React3.forwardRef((_a, ref) => {
  var _b = _a, { className } = _b, props = __objRest(_b, ["className"]);
  return /* @__PURE__ */ React3.createElement(
    "div",
    __spreadValues({
      ref,
      className: cn("text-sm [&_p]:leading-relaxed", className)
    }, props)
  );
});
AlertDescription.displayName = "AlertDescription";

// src/components/magic-ui/MagicUIErrorBoundary.tsx
var MagicUIErrorBoundary = class extends import_react3.default.Component {
  constructor(props) {
    super(props);
    this.handleRetry = () => {
      this.setState({ hasError: false, error: void 0, errorInfo: void 0 });
    };
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("MagicUI Error Boundary caught an error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  render() {
    var _a;
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return /* @__PURE__ */ import_react3.default.createElement(FallbackComponent, { error: this.state.error, retry: this.handleRetry });
      }
      return /* @__PURE__ */ import_react3.default.createElement("div", { className: "p-4 border border-red-200 rounded-lg bg-red-50" }, /* @__PURE__ */ import_react3.default.createElement(Alert, { className: "border-red-200 bg-red-50" }, /* @__PURE__ */ import_react3.default.createElement(import_lucide_react.AlertTriangle, { className: "h-4 w-4 text-red-600" }), /* @__PURE__ */ import_react3.default.createElement(AlertDescription, { className: "text-red-800" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "font-medium" }, "Something went wrong with this MagicUI component"), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-sm text-red-600" }, ((_a = this.state.error) == null ? void 0 : _a.message) || "An unexpected error occurred"), /* @__PURE__ */ import_react3.default.createElement(
        Button,
        {
          onClick: this.handleRetry,
          size: "sm",
          variant: "outline",
          className: "mt-2 border-red-300 text-red-700 hover:bg-red-100"
        },
        /* @__PURE__ */ import_react3.default.createElement(import_lucide_react.RefreshCw, { className: "w-4 h-4 mr-2" }),
        "Try Again"
      )))));
    }
    return this.props.children;
  }
};

// src/components/magic-ui/RegenerateButton.tsx
var import_react5 = __toESM(require("react"));
var import_lucide_react2 = require("lucide-react");

// src/components/magic-ui/LoadingSpinner.tsx
var import_react4 = __toESM(require("react"));
function LoadingSpinner({ size = "md", className }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };
  return /* @__PURE__ */ import_react4.default.createElement(
    "div",
    {
      className: cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      ),
      role: "status",
      "aria-label": "Loading"
    },
    /* @__PURE__ */ import_react4.default.createElement("span", { className: "sr-only" }, "Loading...")
  );
}
function LoadingOverlay({ children, isLoading }) {
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "relative" }, children, isLoading && /* @__PURE__ */ import_react4.default.createElement("div", { className: "absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex flex-col items-center space-y-2" }, /* @__PURE__ */ import_react4.default.createElement(LoadingSpinner, { size: "lg" }), /* @__PURE__ */ import_react4.default.createElement("p", { className: "text-sm text-gray-600 font-medium" }, "Generating UI..."))));
}

// src/components/magic-ui/RegenerateButton.tsx
function RegenerateButton({
  onRegenerate,
  isGenerating,
  className
}) {
  return /* @__PURE__ */ import_react5.default.createElement(
    Button,
    {
      onClick: onRegenerate,
      disabled: isGenerating,
      size: "sm",
      variant: "outline",
      className: cn(
        "fixed bottom-4 right-4 z-50 shadow-lg hover:shadow-xl transition-all duration-200",
        "bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white",
        "text-gray-700 hover:text-gray-900",
        isGenerating && "cursor-not-allowed opacity-75",
        className
      ),
      "aria-label": isGenerating ? "Regenerating UI..." : "Regenerate UI"
    },
    isGenerating ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement(LoadingSpinner, { size: "sm", className: "mr-2" }), "Regenerating...") : /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement(import_lucide_react2.RefreshCw, { className: "w-4 h-4 mr-2" }), "Regenerate")
  );
}

// src/components/magic-ui/MagicUI.tsx
function MagicUI({
  id,
  moduleName,
  description,
  data,
  versionNumber,
  className
}) {
  const { theme, projectPrd, isInitialized, geminiClient } = useMagicUIContext();
  const {
    isGenerating,
    error: moduleError,
    currentVersion: moduleVersion
  } = useModule(moduleName);
  const actions = useMagicUIActions();
  const [generatedComponent, setGeneratedComponent] = (0, import_react6.useState)(null);
  const [componentError, setComponentError] = (0, import_react6.useState)(null);
  const hasRequiredData = isInitialized && geminiClient;
  const generateUI = import_react6.default.useCallback(async (forceRegenerate = false) => {
    if (!isInitialized || !geminiClient) {
      console.error("MagicUI not properly initialized");
      return;
    }
    try {
      actions.updateModuleState(moduleName, {
        isGenerating: true,
        error: null,
        lastGenerated: /* @__PURE__ */ new Date()
      });
      setComponentError(null);
      const request = {
        id,
        moduleName,
        description,
        data,
        // Data is still passed for AI context during initial generation
        projectPrd: projectPrd || "",
        theme: theme || {},
        versionNumber: forceRegenerate ? void 0 : versionNumber,
        forceRegenerate: forceRegenerate ? true : false
      };
      const result = await magicUIService.generateUI(request);
      if (result.success && result.code) {
        const component = createComponentFromCode(result.code, moduleName);
        setGeneratedComponent(() => component);
        actions.updateModuleState(moduleName, {
          isGenerating: false,
          currentVersion: result.version || "1.0.0",
          lastGenerated: /* @__PURE__ */ new Date()
        });
        actions.addLog(moduleName, {
          type: "info",
          message: `Successfully generated UI component (v${result.version || "1.0.0"})`,
          data: JSON.stringify({ version: result.version })
        });
      } else {
        throw new Error(result.error || "Failed to generate UI");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setComponentError(errorMessage);
      actions.updateModuleState(moduleName, {
        isGenerating: false,
        error: errorMessage
      });
      actions.addLog(moduleName, {
        type: "error",
        message: "Failed to generate UI component",
        data: JSON.stringify({ error: errorMessage })
      });
    }
  }, [
    id,
    isInitialized,
    moduleName,
    description,
    // data, // Removed data from dependency array
    projectPrd,
    theme,
    versionNumber,
    actions,
    geminiClient
  ]);
  const handleRegenerate = import_react6.default.useCallback(() => {
    generateUI(true);
  }, [generateUI]);
  (0, import_react6.useEffect)(() => {
    if (hasRequiredData) {
      generateUI(false);
    }
  }, [hasRequiredData, generateUI, id]);
  if (!isInitialized || !hasRequiredData) {
    return /* @__PURE__ */ import_react6.default.createElement("div", { className: cn("p-4 border border-gray-200 rounded-lg bg-gray-50", className) }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-gray-600 text-center" }, "Initializing MagicUI..."));
  }
  if (componentError || moduleError) {
    return /* @__PURE__ */ import_react6.default.createElement("div", { className: cn("relative", className) }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "p-4 border border-red-200 rounded-lg bg-red-50" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-red-800 font-medium" }, "Failed to generate UI component"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-red-600 text-sm mt-1" }, componentError || moduleError)), /* @__PURE__ */ import_react6.default.createElement(
      RegenerateButton,
      {
        onRegenerate: handleRegenerate,
        isGenerating
      }
    ));
  }
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: cn("relative", className) }, /* @__PURE__ */ import_react6.default.createElement(MagicUIErrorBoundary, null, /* @__PURE__ */ import_react6.default.createElement(LoadingOverlay, { isLoading: isGenerating }, generatedComponent ? import_react6.default.createElement(generatedComponent, {
    data,
    className: "magic-ui-generated-component"
  }) : /* @__PURE__ */ import_react6.default.createElement("div", { className: "p-8 border border-gray-200 rounded-lg bg-gray-50 text-center" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-gray-600" }, "Generating UI component...")))), /* @__PURE__ */ import_react6.default.createElement(
    RegenerateButton,
    {
      onRegenerate: handleRegenerate,
      isGenerating
    }
  ));
}
function createComponentFromCode(templateCode, moduleName) {
  try {
    return function GeneratedComponent({ data: instanceData, className }) {
      let instanceSpecificHtml = templateCode;
      if (instanceData && typeof instanceData === "object") {
        for (const key in instanceData) {
          if (Object.prototype.hasOwnProperty.call(instanceData, key)) {
            const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            const value = String(instanceData[key] !== null && instanceData[key] !== void 0 ? instanceData[key] : "");
            instanceSpecificHtml = instanceSpecificHtml.replace(placeholder, value);
          }
        }
      }
      instanceSpecificHtml = instanceSpecificHtml.replace(/{{\s*[^}]+\s*}}/g, "");
      const iframeContent = `
        <!doctype html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                margin: 0;
                padding: 1rem;
              }
            </style>
          </head>
          <body class="bg-white">
            ${instanceSpecificHtml}
          </body>
        </html>
      `;
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: cn("w-full h-full", className) }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ import_react6.default.createElement("h3", { className: "text-sm font-medium text-gray-700" }, moduleName)), /* @__PURE__ */ import_react6.default.createElement("div", { className: "relative border rounded-lg overflow-hidden bg-white shadow-sm" }, /* @__PURE__ */ import_react6.default.createElement(
        "iframe",
        {
          srcDoc: iframeContent,
          title: `Generated UI: ${moduleName}`,
          className: "w-full min-h-[300px] border-0",
          sandbox: "allow-same-origin allow-scripts",
          loading: "lazy"
        }
      )), /* @__PURE__ */ import_react6.default.createElement("div", { className: "mt-2 text-xs text-gray-500" }, /* @__PURE__ */ import_react6.default.createElement("p", null, "Preview of generated UI component")));
    };
  } catch (error) {
    console.error("Failed to create component from code:", error);
    return function ErrorComponent({ data }) {
      return /* @__PURE__ */ import_react6.default.createElement("div", { className: "p-4 border border-red-200 rounded-lg bg-red-50" }, /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-red-800 font-medium" }, "Failed to render generated component"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-red-600 text-sm mt-1" }, "Module: ", moduleName));
    };
  }
}
var MagicUI_default = MagicUI;

// src/components/magic-ui/MagicUIProvider.tsx
function MagicUIProvider2({ theme, projectPrd, apiKey, children }) {
  if (!projectPrd || projectPrd.trim().length === 0) {
    console.warn("MagicUIProvider: projectPrd is required and should not be empty");
  }
  if (!theme) {
    console.warn("MagicUIProvider: theme is required");
  }
  return /* @__PURE__ */ import_react7.default.createElement(MagicUIProvider, { theme, projectPrd, apiKey }, children);
}
var MagicUIProvider_default = MagicUIProvider2;

// src/components/magic-ui/MagicUIPage.tsx
var import_react8 = __toESM(require("react"));
function MagicUIPage({
  id,
  moduleName,
  description,
  data,
  versionNumber,
  className
}) {
  const { theme, projectPrd, isInitialized, geminiClient } = useMagicUIContext();
  const {
    isGenerating,
    error: moduleError,
    currentVersion: moduleVersion
  } = useModule(moduleName);
  const actions = useMagicUIActions();
  const [generatedComponent, setGeneratedComponent] = (0, import_react8.useState)(null);
  const [componentError, setComponentError] = (0, import_react8.useState)(null);
  const hasRequiredData = isInitialized && geminiClient;
  const generateUI = import_react8.default.useCallback(async (forceRegenerate = false) => {
    if (!isInitialized || !geminiClient) {
      console.error("MagicUIPage not properly initialized");
      return;
    }
    try {
      actions.updateModuleState(moduleName, {
        isGenerating: true,
        error: null,
        lastGenerated: /* @__PURE__ */ new Date()
      });
      setComponentError(null);
      const request = {
        id,
        moduleName,
        description,
        data,
        projectPrd: projectPrd || "",
        theme: theme || {},
        versionNumber: forceRegenerate ? void 0 : versionNumber,
        isFullPage: true,
        forceRegenerate: forceRegenerate ? true : false
      };
      const result = await magicUIService.generateUI(request);
      if (result.success && result.code) {
        const component = createComponentFromCode2(result.code, moduleName);
        setGeneratedComponent(() => component);
        actions.updateModuleState(moduleName, {
          isGenerating: false,
          currentVersion: result.version || "1.0.0",
          lastGenerated: /* @__PURE__ */ new Date()
        });
        actions.addLog(moduleName, {
          type: "info",
          message: `Successfully generated full page UI (v${result.version || "1.0.0"})`,
          data: JSON.stringify({ version: result.version })
        });
      } else {
        throw new Error(result.error || "Failed to generate full page UI");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setComponentError(errorMessage);
      actions.updateModuleState(moduleName, {
        isGenerating: false,
        error: errorMessage
      });
      actions.addLog(moduleName, {
        type: "error",
        message: "Failed to generate full page UI",
        data: JSON.stringify({ error: errorMessage })
      });
    }
  }, [
    id,
    isInitialized,
    moduleName,
    description,
    projectPrd,
    theme,
    versionNumber,
    actions,
    geminiClient
  ]);
  const handleRegenerate = import_react8.default.useCallback(() => {
    generateUI(true);
  }, [generateUI]);
  (0, import_react8.useEffect)(() => {
    if (hasRequiredData) {
      generateUI(false);
    }
  }, [hasRequiredData, generateUI]);
  if (!isInitialized || !hasRequiredData) {
    return /* @__PURE__ */ import_react8.default.createElement("div", { className: cn("min-h-screen p-4 bg-gray-50", className) }, /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-gray-600 text-center" }, "Initializing MagicUIPage..."));
  }
  if (componentError || moduleError) {
    return /* @__PURE__ */ import_react8.default.createElement("div", { className: cn("min-h-screen relative", className) }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "p-4 border border-red-200 rounded-lg bg-red-50 m-4" }, /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-red-800 font-medium" }, "Failed to generate full page UI"), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-red-600 text-sm mt-1" }, componentError || moduleError)), /* @__PURE__ */ import_react8.default.createElement(
      RegenerateButton,
      {
        onRegenerate: handleRegenerate,
        isGenerating
      }
    ));
  }
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: cn("min-h-screen relative", className) }, /* @__PURE__ */ import_react8.default.createElement(MagicUIErrorBoundary, null, /* @__PURE__ */ import_react8.default.createElement(LoadingOverlay, { isLoading: isGenerating }, generatedComponent ? import_react8.default.createElement(generatedComponent, {
    data,
    className: "magic-ui-generated-page"
  }) : /* @__PURE__ */ import_react8.default.createElement("div", { className: "min-h-screen flex items-center justify-center bg-gray-50" }, /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-gray-600" }, "Generating full page UI...")))), /* @__PURE__ */ import_react8.default.createElement(
    RegenerateButton,
    {
      onRegenerate: handleRegenerate,
      isGenerating
    }
  ));
}
function createComponentFromCode2(templateCode, moduleName) {
  try {
    return function GeneratedPageComponent({ data: instanceData, className }) {
      let instanceSpecificHtml = templateCode;
      if (instanceData && typeof instanceData === "object") {
        for (const key in instanceData) {
          if (Object.prototype.hasOwnProperty.call(instanceData, key)) {
            const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            const value = String(instanceData[key] !== null && instanceData[key] !== void 0 ? instanceData[key] : "");
            instanceSpecificHtml = instanceSpecificHtml.replace(placeholder, value);
          }
        }
      }
      instanceSpecificHtml = instanceSpecificHtml.replace(/{{\s*[^}]+\s*}}/g, "");
      const iframeContent = `
        <!doctype html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                margin: 0;
                padding: 0;
                min-height: 100vh;
              }
            </style>
          </head>
          <body class="bg-white">
            ${instanceSpecificHtml}
          </body>
        </html>
      `;
      return /* @__PURE__ */ import_react8.default.createElement("div", { className: cn("w-full min-h-screen", className) }, /* @__PURE__ */ import_react8.default.createElement(
        "iframe",
        {
          srcDoc: iframeContent,
          title: `Generated Page: ${moduleName}`,
          className: "w-full h-screen border-0",
          sandbox: "allow-same-origin allow-scripts",
          loading: "lazy"
        }
      ));
    };
  } catch (error) {
    console.error("Failed to create page component from code:", error);
    return function ErrorComponent({ data }) {
      return /* @__PURE__ */ import_react8.default.createElement("div", { className: "min-h-screen flex items-center justify-center bg-red-50" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "p-4 border border-red-200 rounded-lg" }, /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-red-800 font-medium" }, "Failed to render generated page"), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-red-600 text-sm mt-1" }, "Module: ", moduleName)));
    };
  }
}
var MagicUIPage_default = MagicUIPage;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MagicUI,
  MagicUIPage,
  MagicUIProvider
});
