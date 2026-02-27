import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const supabaseTarget = env.VITE_SUPABASE_URL || "https://ulbmusodwyjjicnginat.supabase.co";

    return {
        server: {
            host: "::",
            port: 8080,
            hmr: {
                overlay: false,
            },
            proxy: {
                "/supabase": {
                    target: supabaseTarget,
                    changeOrigin: true,
                    secure: true,
                    rewrite: (p) => p.replace(/^\/supabase/, ""),
                },
            },
        },
        plugins: [react()].filter(Boolean),
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
});
