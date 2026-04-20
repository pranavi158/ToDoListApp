const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({ url: REDIS_URL });

let isConnected = false;
let connectionFailed = false;

client.on('error', () => {
    // Only log once — not every reconnect attempt
    if (!connectionFailed) {
        console.warn(`[redis] Could not connect to ${REDIS_URL}. Caching disabled — app will still work fine.`);
        connectionFailed = true;
    }
});

client.on('connect', () => {
    connectionFailed = false;
    isConnected = true;
    console.log('[redis] Connected');
});

const connectRedis = async () => {
    if (isConnected || connectionFailed) return;
    try {
        await client.connect();
        isConnected = true;
    } catch {
        connectionFailed = true;
    }
};

// Kick off connection attempt in background — never blocks server startup
connectRedis();

const getCache = async (key) => {
    if (connectionFailed || !isConnected) return null;
    try {
        const value = await client.get(key);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

const setCache = async (key, value, expiry = 3600) => {
    if (connectionFailed || !isConnected) return;
    try {
        await client.set(key, JSON.stringify(value), { EX: expiry });
    } catch {
        // silently skip cache writes
    }
};

const delCache = async (key) => {
    if (connectionFailed || !isConnected) return;
    try {
        await client.del(key);
    } catch {
        // silently skip cache deletes
    }
};

module.exports = { client, getCache, setCache, delCache };
