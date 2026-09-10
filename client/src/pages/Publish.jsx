// Public publish page — anyone with the link can view a published project rendered via Sandpack. No auth required.
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    SandpackProvider,
    SandpackPreview,
    SandpackLayout,
    useSandpack,
} from '@codesandbox/sandpack-react';
import { detectDependencies } from '../utils/sandpackUtils';
import api from '../api/api';
import { RefreshCw, WifiOff, Globe } from 'lucide-react';

// ─── Network error overlay ────────────────────────────────────────────────────
function NetworkErrorOverlay({ onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 bg-white" style={{ flex: 1, minWidth: 0 }}>
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
                <RefreshCw size={13} /> Retry
            </button>
        </div>
    );
}

const NETWORK_ERROR_PATTERNS = [
    'failed to fetch', 'col.csbops.io', 'err_connection_timed_out',
    'net :: err', 'time_out', 'timeout', "couldn't connect",
    'could not connect', 'econnrefused', 'networkerror',
];

// ─── Inner Sandpack watcher (must live inside SandpackProvider) ───────────────
function PublishInternals({ onRetry }) {
    const { sandpack } = useSandpack();
    const { error, status } = sandpack;
    const [isTimedOut, setIsTimedOut] = useState(false);

    useEffect(() => {
        if (status === 'timeout') setIsTimedOut(true);
        else if (['running', 'done', 'idle'].includes(status)) setIsTimedOut(false);
    }, [status]);

    useEffect(() => {
        if (error) {
            const msg = (error.message || '').toLowerCase();
            if (NETWORK_ERROR_PATTERNS.some(p => msg.includes(p))) setIsTimedOut(true);
        }
    }, [error]);

    const handleRetry = () => { setIsTimedOut(false); onRetry(); };

    return (
        <SandpackLayout style={{ height: '100%', border: 'none', borderRadius: 0 }}>
            {isTimedOut ? (
                <NetworkErrorOverlay onRetry={handleRetry} />
            ) : (
                <SandpackPreview
                    showNavigator={false}
                    showRefreshButton={false}
                    showOpenInCodeSandbox={false}
                    style={{ height: '100%', flex: 1, minWidth: 0 }}
                />
            )}
        </SandpackLayout>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PublishPage = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sandpackKey, setSandpackKey] = useState(0);

    useEffect(() => {
        if (!id) return;
        const fetchProject = async () => {
            setLoading(true);
            try {
                // Use the public endpoint — no auth cookie required
                const { data } = await api.get(`/api/projects/public/${id}`);
                setProject(data);
            } catch (err) {
                setError(err?.response?.data?.error || 'This site is unavailable or not published yet.');
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const handleRetry = useCallback(() => setSandpackKey(k => k + 1), []);

    const sandpackFiles = useMemo(() => {
        if (!project?.files) return {};
        const spFiles = {};
        for (const [path, content] of Object.entries(project.files)) {
            const code = typeof content === 'string' ? content : content?.content || '';
            spFiles[path] = { code };
        }
        return spFiles;
    }, [project]);

    const dependencies = useMemo(
        () => (project?.files ? detectDependencies(project.files) : {}),
        [project]
    );

    // ── Loading ──
    if (loading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-white gap-3">
                <div className="w-7 h-7 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Loading published site…</p>
            </div>
        );
    }

    // ── Error / not published ──
    if (error || !project) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-white gap-4 text-center px-6">
                <Globe size={36} className="text-zinc-300" />
                <div>
                    <p className="text-sm font-semibold text-zinc-800">Site unavailable</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                        {error || 'This website has not been published yet or the link is invalid.'}
                    </p>
                </div>
                <a
                    href="/"
                    className="text-xs text-zinc-400 hover:text-zinc-700 underline underline-offset-2 transition-colors"
                >
                    Go to Builder AI
                </a>
            </div>
        );
    }

    // ── Not published ──
    if (!project.published) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-white gap-4 text-center px-6">
                <Globe size={36} className="text-zinc-300" />
                <div>
                    <p className="text-sm font-semibold text-zinc-800">Not published yet</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                        This project hasn't been published. Open it in Builder AI and click Publish.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
            {/* Slim top bar */}
            <div className="h-10 shrink-0 flex items-center justify-between px-4 border-b border-zinc-100 bg-white">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-700 truncate">{project.name}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live
                    </span>
                </div>
                <a
                    href="/"
                    className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                    Built with Builder AI
                </a>
            </div>

            {/* Full-screen Sandpack preview (no code editor, no controls) */}
            <div className="flex-1 overflow-hidden">
                <SandpackProvider
                    key={`publish-${id}-${sandpackKey}`}
                    template="react"
                    files={sandpackFiles}
                    customSetup={{ dependencies }}
                    options={{
                        externalResources: [
                            'https://cdn.tailwindcss.com',
                            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
                        ],
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
                            body: 'ui-sans-serif, system-ui, sans-serif',
                            mono: 'ui-monospace, monospace',
                            size: '14px',
                            lineHeight: '1.6',
                        },
                    }}
                    style={{ height: '100%', width: '100%' }}
                >
                    <PublishInternals onRetry={handleRetry} />
                </SandpackProvider>
            </div>
        </div>
    );
};

export default PublishPage;