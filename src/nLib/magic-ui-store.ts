import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { ModuleState, ModuleLogs, MagicUITheme } from '@/types/magic-ui';

interface MagicUIState {
  theme: MagicUITheme | null;
  projectPrd: string | null;
  isInitialized: boolean;
  modules: Record<string, ModuleState>;
  logs: Record<string, ModuleLogs[]>;
  initialize: (theme: MagicUITheme, projectPrd: string) => void;
  setTheme: (theme: MagicUITheme) => void;
  setProjectPrd: (prd: string) => void;
  updateModuleState: (moduleName: string, state: Partial<ModuleState>) => void;
  addLog: (moduleName: string, log: Omit<ModuleLogs, 'id' | 'timestamp'>) => void;
  clearLogs: (moduleName: string) => void;
  reset: () => void;
}

const DEFAULT_MODULE_STATE: ModuleState = Object.freeze({
  currentVersion: '0.0.0',
  isGenerating: false,
  lastGenerated: null,
  error: null,
  logs: {},
});

const useMagicUIStore = create<MagicUIState>()(
  persist(
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
          modules: {
            ...current.modules,
            [moduleName]: {
              ...(current.modules[moduleName] || DEFAULT_MODULE_STATE),
              ...state,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      addLog: (moduleName, log) => {
        const newLog: ModuleLogs = {
          ...log,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };

        set((current) => ({
          logs: {
            ...current.logs,
            [moduleName]: [...(current.logs[moduleName] || []), newLog],
          },
        }));
      },

      clearLogs: (moduleName) => {
        set((current) => ({
          logs: {
            ...current.logs,
            [moduleName]: [],
          },
        }));
      },

      reset: () => {
        set({
          theme: null,
          projectPrd: null,
          isInitialized: false,
          modules: {},
          logs: {},
        });
      },
    }),
    {
      name: 'magic-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        projectPrd: state.projectPrd,
      }),
    }
  )
);

// Hook selectors
export const useTheme = () => useMagicUIStore((state) => state.theme);
export const useProjectPrd = () => useMagicUIStore((state) => state.projectPrd);
export const useIsInitialized = () => useMagicUIStore((state) => state.isInitialized);

const createModuleSelector = (moduleName: string) => {
  return (state: MagicUIState) => state.modules[moduleName] || DEFAULT_MODULE_STATE;
};

type ModuleStateSlice = Pick<
  ModuleState,
  'isGenerating' | 'error' | 'currentVersion' | 'lastGenerated'
>;

export const useModule = (moduleName: string): ModuleStateSlice => {
  const selector = useMemo(() => createModuleSelector(moduleName), [moduleName]);

  const module = useMagicUIStore(selector);

  return useMemo(
    () => ({
      isGenerating: module.isGenerating,
      error: module.error,
      currentVersion: module.currentVersion,
      lastGenerated: module.lastGenerated,
    }),
    [
      module.isGenerating,
      module.error,
      module.currentVersion,
      module.lastGenerated,
    ]
  );
};

export const useModuleLogs = (moduleName: string) => {
  return useMagicUIStore((state) => state.logs[moduleName] || []);
};

const actionsSelector = (state: MagicUIState) => ({
  initialize: state.initialize,
  setTheme: state.setTheme,
  setProjectPrd: state.setProjectPrd,
  updateModuleState: state.updateModuleState,
  addLog: state.addLog,
  clearLogs: state.clearLogs,
  reset: state.reset,
});

export const useMagicUIActions = () => {
  const actions = useMagicUIStore(useShallow(actionsSelector));
  return useMemo(() => actions, [actions]);
};

export const useStoreState = () =>
  useMagicUIStore(
    useShallow((state) => ({
      theme: state.theme,
      projectPrd: state.projectPrd,
      isInitialized: state.isInitialized,
    }))
  );

export const useAllModules = () => useMagicUIStore((state) => state.modules);

export const useAllLogs = () => useMagicUIStore((state) => state.logs);

export { useMagicUIStore };
