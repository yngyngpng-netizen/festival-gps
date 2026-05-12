export const BASE44_CONFIG = {
  appId: "6a026c16de151712fa4c5235",
  serverUrl: "",
  sdkUrl: "https://esm.sh/@base44/sdk@0.8.23"
};

export const MAPKIT_CONFIG = {
  token: "",
  tokenUrl: "",
  language: "en-US"
};

export function base44IsConfigured() {
  return Boolean(BASE44_CONFIG.appId);
}
