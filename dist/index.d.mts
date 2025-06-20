import React$1 from 'react';

interface MagicUITheme {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    border?: string;
    radius?: string;
    spacing?: string;
    [key: string]: any;
}
interface MagicUIProviderProps {
    theme: MagicUITheme | null | undefined;
    projectPrd: string;
    children: React.ReactNode;
    apiKey?: string;
}
interface MagicUIProps {
    moduleName: string;
    description: string;
    data: any;
    versionNumber?: string;
    className?: string;
}

declare function MagicUI({ moduleName, description, data, versionNumber, className }: MagicUIProps): React$1.JSX.Element;

/**
 * MagicUIProvider - Main provider component for the MagicUI library
 *
 * This component initializes the MagicUI system with theme and project requirements.
 * It should wrap your entire application or the part where you want to use MagicUI components.
 *
 * @param theme - Theme configuration (object or string)
 * @param projectPrd - Product Requirements Document string
 * @param apiKey - Gemini API key (string, optional)
 * @param children - Child components
 */
declare function MagicUIProvider({ theme, projectPrd, apiKey, children }: MagicUIProviderProps): React$1.JSX.Element;

declare function MagicUIPage({ moduleName, description, data, versionNumber, className }: MagicUIProps): React$1.JSX.Element;

export { MagicUI, MagicUIPage, MagicUIProvider };
