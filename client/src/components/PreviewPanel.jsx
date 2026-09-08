// Live preview panel — wraps SandpackProvider to render project files in-browser; handles file watching, dependency detection, and bundler timeout with a custom retry overlay.
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
    SandpackCodeEditor,
    SandpackLayout,
    SandpackPreview,
    SandpackProvider,
    useSandpack,
} from '@codesandbox/sandpack-react'
import { detectDependencies } from '../utils/sandpackUtils';
import { useAppContext } from '../context/AppContext';
import { RefreshCw, WifiOff } from 'lucide-react';

// Custom overlay shown instead of Sandpack's built-in timeout screen
function NetworkErrorOverlay({ onRetry }) {
    return (
        <div
            style={{ flex: 1, minWidth: 0 }}
            className="flex flex-col items-center justify-center bg-white gap-4 text-center px-6 h-full"
        >
            <WifiOff size={40} className="text-zinc-300" />
            <div>
                <p className="text-sm font-semibold text-zinc-700">Couldn't connect to preview</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                    The sandbox bundler timed out. Check your internet connection and try again.
                </p>
            </div>
            <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-md hover:bg-zinc-700 transition-colors"
            >
                <RefreshCw size={13} />
                Retry
            </button>
        </div>
    );
}

const NETWORK_ERROR_PATTERNS = [
    "failed to fetch", "col.csbops.io", "err_connection_timed_out",
    "net :: err", "time_out", "timeout", "couldn't connect",
    "could not connect", "econnrefused", "networkerror",
];

// Inner component — must live inside SandpackProvider to use useSandpack()
// Handles file watching, timeout detection, and swaps the preview for our retry UI
function SandpackInternals({ onliveFilesChanges, showcode, showErrorOverlay, onRetry }) {
    const { sandpack } = useSandpack();
    const { files, error, status } = sandpack;
    const { activeProject, updateProjectFiles } = useAppContext();
    const activeProjectRef = useRef(activeProject);
    const [isTimedOut, setIsTimedOut] = useState(false);

    // Keep ref in sync
    useEffect(() => {
        activeProjectRef.current = activeProject;
    }, [activeProject]);

    // Detect bundler timeout via sandpack.status
    useEffect(() => {
        if (status === 'timeout') {
            setIsTimedOut(true);
        } else if (status === 'running' || status === 'done' || status === 'idle') {
            setIsTimedOut(false);
        }
    }, [status]);

    // Detect network errors via sandpack.error message
    useEffect(() => {
        if (error) {
            const msg = (error.message || '').toLowerCase();
            const isNetworkError = NETWORK_ERROR_PATTERNS.some(p => msg.includes(p));
            if (isNetworkError) setIsTimedOut(true);
        }
    }, [error]);

    // File watcher — saves edits back to DB and live state
    useEffect(() => {
        const project = activeProjectRef.current;
        if (!project) return;
        const updatedFiles = {};
        let hasChanges = false;

        for (const [path, fileObj] of Object.entries(files)) {
            const fileCode = fileObj.code;
            updatedFiles[path] = fileCode;
            const originalContent =
                typeof project.files[path] === 'string'
                    ? project.files[path]
                    : project.files[path]?.content;
            if (originalContent !== undefined && originalContent !== fileCode) {
                hasChanges = true;
            }
        }
        onliveFilesChanges(updatedFiles);
        if (hasChanges) updateProjectFiles(updatedFiles);
    }, [files]);

    const handleRetry = () => {
        setIsTimedOut(false);
        onRetry(); // bumps sandpackKey → remounts SandpackProvider
    };

    return (
        <SandpackLayout style={{ height: '100%', border: 'none', borderRadius: 'transparent' }}>
            {showcode && (
                <SandpackCodeEditor
                    showTabs showInlineNumbers showInlineErrors wrapContent
                    style={{ height: '100%', flex: 1, minWidth: 0 }}
                />
            )}

            {/* Swap SandpackPreview for our overlay on timeout — the only reliable way
                to suppress Sandpack's own "Couldn't connect" screen */}
            {isTimedOut ? (
                <NetworkErrorOverlay onRetry={handleRetry} />
            ) : (
                <SandpackPreview
                    showNavigator={false}
                    showRefreshButton
                    showOpenInCodeSandbox={false}
                    showSandpackErrorOverlay={showErrorOverlay}
                    style={{ height: '100%', flex: showcode ? 1 : 2, minWidth: 0 }}
                />
            )}
        </SandpackLayout>
    );
}

const PreviewPanel = ({ project, activeFile, showcode }) => {
    const [sandpackKey, setSandpackKey] = useState(0);
    const [liveFiles, setLivefiles] = useState(project.files);
    const [prevProjectKey, setPrevprojectkey] = useState(`${project._id}-${project.version}`);

    // Reset files when project changes
    const currentkey = `${project._id}-${project.version}`;
    if (currentkey !== prevProjectKey) {
        setPrevprojectkey(currentkey);
        setLivefiles(project.files);
    }

    const handleLiveFilesChange = useCallback((newFiles) => {
        setLivefiles((prev) => {
            for (const [p, code] of Object.entries(newFiles)) {
                if (prev[p] !== code) return newFiles;
            }
            return prev;
        });
    }, []);

    // Remounts the entire SandpackProvider — forces a fresh bundler connection
    const handleRetry = useCallback(() => {
        setSandpackKey(k => k + 1);
    }, []);

    // Convert liveFiles to Sandpack format
    const sandpackFiles = useMemo(() => {
        const spFiles = {};
        for (const [path, content] of Object.entries(liveFiles)) {
            const filecode = typeof content === 'string' ? content : content?.content || '';
            spFiles[path] = { code: filecode, active: path === activeFile };
        }
        return spFiles;
    }, [liveFiles, activeFile]);

    const dependencies = useMemo(() => detectDependencies(liveFiles), [liveFiles]);

    return (
        <div className="h-full w-full">
            <SandpackProvider
                key={`${project._id}-${sandpackKey}`}
                template="react"
                files={sandpackFiles}
                customSetup={{ dependencies }}
                options={{
                    externalResources: [
                        'https://cdn.tailwindcss.com',
                        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
                    ],
                    classes: {
                        'sp-wrapper': 'sp-wrapper',
                        'sp-layout': 'sp-layout',
                        'sp-preview': 'sp-preview',
                    },
                    logLevel: 0,
                    autorun: true,
                }}
                theme={{
                    colors: {
                        surface1: '#ffffff', surface2: '#f9fafb', surface3: '#f3f4f6',
                        clickable: '#1f2937', base: '#1f2937', disabled: '#9ca3af',
                        hover: '#1f2937', accent: '#3b82f6',
                        error: '#ef4444', errorSurface: '#fef2f2',
                    },
                    font: {
                        body: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif',
                        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
                        size: '14px',
                        lineHeight: '1.6',
                    },
                }}
            >
                <SandpackInternals
                    onliveFilesChanges={handleLiveFilesChange}
                    showcode={showcode}
                    showErrorOverlay={true}
                    onRetry={handleRetry}
                />
            </SandpackProvider>
        </div>
    );
};

export default PreviewPanel;