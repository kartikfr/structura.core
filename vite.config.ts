import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const supabaseTarget = env.VITE_SUPABASE_URL || "https://ulbmusodwyjjicnginat.supabase.co";
    const isDev = mode !== "production";

    const proxy = isDev
        ? {
            "/supabase": {
                target: supabaseTarget,
                changeOrigin: true,
                secure: true,
                rewrite: (p: string) => p.replace(/^\/supabase/, ""),
                configure: (proxyServer: unknown) => {
                    const proxy = proxyServer as {
                        on: (event: string, cb: (...args: unknown[]) => void) => void;
                    };
                    proxy.on("error", (err: Error, req: { url?: string }) => {
                        console.error("[vite-proxy][supabase] error", {
                            message: err.message,
                            url: req?.url,
                        });
                    });
                    proxy.on("proxyRes", (proxyRes: { statusCode?: number }, req: { url?: string }) => {
                        if ((proxyRes.statusCode ?? 0) >= 500) {
                            console.warn("[vite-proxy][supabase] upstream 5xx", {
                                status: proxyRes.statusCode,
                                url: req?.url,
                            });
                        }
                    });
                },
            },
        }
        : undefined;

    return {
        server: {
            host: "::",
            port: 8080,
            hmr: {
                overlay: false,
            },
            proxy,
        },
        plugins: [react()].filter(Boolean),
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
});
