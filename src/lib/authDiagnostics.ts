import { resolvedDirectSupabaseUrl, resolvedSupabaseUrl } from "@/integrations/supabase/client";

type EndpointStatus = {
  ok: boolean;
  status: number | null;
  url: string;
  error?: string;
};

export interface AuthDiagnosticsResult {
  timestamp: string;
  proxySettings: EndpointStatus;
  directSettings: EndpointStatus;
}

const fetchWithTimeout = async (url: string, timeoutMs = 6000): Promise<EndpointStatus> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });
    return {
      ok: response.ok,
      status: response.status,
      url,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      status: null,
      url,
      error: message,
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const runAuthDiagnostics = async (): Promise<AuthDiagnosticsResult> => {
  const proxySettingsUrl = `${resolvedSupabaseUrl.replace(/\/$/, "")}/auth/v1/settings`;
  const directSettingsUrl = `${resolvedDirectSupabaseUrl.replace(/\/$/, "")}/auth/v1/settings`;

  const [proxySettings, directSettings] = await Promise.all([
    fetchWithTimeout(proxySettingsUrl),
    fetchWithTimeout(directSettingsUrl),
  ]);

  return {
    timestamp: new Date().toISOString(),
    proxySettings,
    directSettings,
  };
};
