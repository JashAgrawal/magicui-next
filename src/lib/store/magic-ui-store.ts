import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { ModuleState, ModuleLogs, MagicUITheme } from '@/types/magic-ui';

interface MagicUIState {
  theme: MagicUITheme | string;
  projectPrd: string;
  apiRoute: string;
  modules: Record<string, ModuleState>;
  logs: Record<string, ModuleLogs[]>;
  setTheme: (theme: MagicUITheme | string) => void;
  setProjectPrd: (prd: string) => void;
  setApiRoute: (route: string) => void;
  updateModuleState: (moduleName: string, state: Partial<ModuleState>) => void;
  getModule: (moduleName:string) => ModuleState;
  addLog: (moduleName: string, log: Omit<ModuleLogs, 'id' | 'timestamp'>) => void;
}

// ... LogEntry and other types can be defined here if they aren't in types/magic-ui

const DEFAULT_MODULE_STATE: ModuleState = Object.freeze({
  currentVersion: '0.0.0',
  isGenerating: false,
  lastGenerated: null,
  error: null,
  logs: {}
});

export const useMagicUIStore = create<MagicUIState>((set, get) => ({
  theme: {},
  projectPrd: '',
  apiRoute: '/api/generate-magic-ui',
  modules: {},
  logs: {},
  setTheme: (theme) => set({ theme }),
  setProjectPrd: (projectPrd) => set({ projectPrd }),
  setApiRoute: (apiRoute) => set({ apiRoute }),
  updateModuleState: (moduleName, state) => set((s) => ({
    modules: {
      ...s.modules,
      [moduleName]: {
        ...(s.modules[moduleName] || DEFAULT_MODULE_STATE),
        ...state,
      },
    },
  })),
  getModule: (moduleName) => {
    return get().modules[moduleName] || DEFAULT_MODULE_STATE;
  },
  addLog: (moduleName, log) => {
    const newLog: ModuleLogs = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      logs: {
        ...s.logs,
        [moduleName]: [...(s.logs[moduleName] || []), newLog],
      },
    }));
  },
}));

export const useMagicUIActions = () => useMagicUIStore(
  useShallow((state) => ({
    setTheme: state.setTheme,
    setProjectPrd: state.setProjectPrd,
    setApiRoute: state.setApiRoute,
    updateModuleState: state.updateModuleState,
    getModule: state.getModule,
    addLog: state.addLog,
  }))
);

export const useModule = (moduleName: string) => useMagicUIStore(
  useShallow((state) => state.modules[moduleName] || DEFAULT_MODULE_STATE)
);

export const useTheme = () => useMagicUIStore((state) => state.theme);
export const useProjectPrd = () => useMagicUIStore((state) => state.projectPrd);
export const useApiRoute = () => useMagicUIStore((state) => state.apiRoute);
