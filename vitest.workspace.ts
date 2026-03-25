import test from 'node:test'
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
    {
        extends: './frontend/vite.config.ts',
        test: {
            name: 'frontend',
            browser: { enabled: false },
            environment: 'jsdom',
            root: './frontend',
        },
    },
    {
        test: {
            name: 'backend',
            environment: 'node',
            root: './backend',
        },
    },
    {
        test: {
            name: 'scripts',
            environment: 'node',
            root: './scripts',
        },
    },
])