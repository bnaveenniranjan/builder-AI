// Error monitor — runs inside SandpackProvider, watches sandpack.status/error, and hides the default overlay for network/timeout failures so a custom retry UI can be shown instead.
import { useSandpack } from '@codesandbox/sandpack-react'
import React, { useEffect } from 'react'

const NETWORK_ERROR_PATTERNS = [
    "failed to fetch",
    "col.csbops.io",
    "ERR_CONNECTION_TIMED_OUT",
    "net :: ERR",
    "TIME_OUT",
    "time_out",
    "timeout",
    "Couldn't connect",
    "could not connect",
    "ECONNREFUSED",
    "NetworkError",
];

const SandpackErrorMonitor = ({ onErrorChange }) => {
    const { sandpack } = useSandpack()
    const { error, status } = sandpack;

    useEffect(() => {
        if (error) {
            const msg = (error.message || "").toLowerCase();
            const isNetworkError = NETWORK_ERROR_PATTERNS.some(pattern =>
                msg.includes(pattern.toLowerCase())
            );

            if (isNetworkError) {
                onErrorChange(false); // hide default overlay, let PreviewPanel show retry UI
                return;
            }
            onErrorChange(true); // show default overlay for real code errors
        } else {
            onErrorChange(true); // no error — keep overlay enabled for future errors
        }
    }, [error, onErrorChange])

    return null
}

export default SandpackErrorMonitor