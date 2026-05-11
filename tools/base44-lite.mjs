#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const API_URL = process.env.BASE44_API_URL || "https://app.base44.com";
const AUTH_CLIENT_ID = "base44_cli";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUTH_PATH = join(homedir(), ".base44", "auth", "auth.json");
const APP_PATH = join(ROOT, "base44", ".app.jsonc");

const command = process.argv[2];

try {
  if (command === "login") await login();
  else if (command === "whoami") await whoami();
  else if (command === "link-create") await linkCreate();
  else if (command === "deploy") await deploy();
  else usage();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}

function usage() {
  console.log([
    "Usage:",
    "  node tools/base44-lite.mjs login",
    "  node tools/base44-lite.mjs whoami",
    "  node tools/base44-lite.mjs link-create",
    "  node tools/base44-lite.mjs deploy"
  ].join("\n"));
}

async function login() {
  const device = await request("oauth/device/code", {
    method: "POST",
    body: {
      client_id: AUTH_CLIENT_ID,
      scope: "apps:read apps:write"
    },
    auth: false
  });

  console.log(`Verification code: ${device.user_code}`);
  console.log(`Open: ${device.verification_uri}`);

  const token = await pollForToken(device.device_code, device.expires_in, device.interval);
  const user = await request("oauth/userinfo", {
    auth: false,
    token: token.access_token
  });

  await writeJson(AUTH_PATH, {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000,
    email: user.email,
    name: user.name
  });

  console.log(`Logged in as ${user.email}`);
}

async function pollForToken(deviceCode, expiresIn, interval) {
  const started = Date.now();
  const timeout = expiresIn * 1000;

  while (Date.now() - started < timeout) {
    const form = new URLSearchParams();
    form.set("grant_type", "urn:ietf:params:oauth:grant-type:device_code");
    form.set("device_code", deviceCode);
    form.set("client_id", AUTH_CLIENT_ID);

    const response = await fetch(new URL("oauth/token", API_URL), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString()
    });
    const json = await response.json();

    if (response.ok) return json;
    if (!["authorization_pending", "slow_down"].includes(json.error)) {
      throw new Error(json.error_description || json.error || "Base44 login failed");
    }

    await delay(interval * 1000);
  }

  throw new Error("Base44 login timed out.");
}

async function whoami() {
  const auth = await readAuth();
  console.log(`${auth.email} (${auth.name})`);
}

async function linkCreate() {
  const existing = await readJsonOptional(APP_PATH);
  if (existing?.id) {
    console.log(`Already linked: ${existing.id}`);
    return;
  }

  const created = await request("api/apps", {
    method: "POST",
    body: {
      name: "Festival GPS",
      user_description: "EDC crew schedule map with Base44 auth, group sync, profile pins, and timeline routes.",
      is_managed_source_code: false,
      public_settings: "public_without_login"
    }
  });

  await writeJson(APP_PATH, { id: created.id });
  console.log(`Linked Base44 app: ${created.id}`);
}

async function deploy() {
  const app = await readJson(APP_PATH);
  const entities = await readEntities();
  const authConfig = await readJson(join(ROOT, "base44", "auth", "config.jsonc"));

  if (entities.length) {
    const entityNameToSchema = Object.fromEntries(entities.map((entity) => [entity.name, entity]));
    const result = await request(`api/apps/${app.id}/entity-schemas`, {
      method: "PUT",
      body: { entityNameToSchema }
    });
    console.log(`Entities synced: created=${result.created?.length || 0}, updated=${result.updated?.length || 0}, deleted=${result.deleted?.length || 0}`);
  }

  await request(`api/apps/${app.id}`, {
    method: "PUT",
    body: { auth_config: toAuthPayload(authConfig) }
  });
  console.log("Auth config synced");

  const archive = await createSiteArchive(resolve(ROOT, "FestivalGPSWeb"));
  try {
    const buffer = await readFile(archive);
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: "application/gzip" }), "dist.tar.gz");
    const site = await request(`api/apps/${app.id}/deploy-dist`, {
      method: "POST",
      form
    });
    console.log(`App URL: ${site.app_url || site.appUrl || site.url}`);
  } finally {
    await rm(archive, { force: true });
  }
}

async function readEntities() {
  const dir = join(ROOT, "base44", "entities");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".json") || file.endsWith(".jsonc"));
  return Promise.all(files.map((file) => readJson(join(dir, file))));
}

function toAuthPayload(config) {
  return {
    enable_username_password: config.enableUsernamePassword,
    enable_google_login: config.enableGoogleLogin,
    enable_microsoft_login: config.enableMicrosoftLogin,
    enable_facebook_login: config.enableFacebookLogin,
    enable_apple_login: config.enableAppleLogin,
    sso_provider_name: config.ssoProviderName,
    enable_sso_login: config.enableSSOLogin,
    google_oauth_mode: config.googleOAuthMode,
    google_oauth_client_id: config.googleOAuthClientId,
    use_workspace_sso: config.useWorkspaceSSO
  };
}

async function createSiteArchive(siteDir) {
  const archive = join(tmpdir(), `festival-gps-base44-${randomUUID()}.tar.gz`);
  await run("tar", ["-czf", archive, "-C", siteDir, "."]);
  return archive;
}

function run(cmd, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(cmd, args, { stdio: "ignore" });
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${cmd} exited with code ${code}`));
    });
    child.on("error", rejectPromise);
  });
}

async function request(path, options = {}) {
  const headers = {
    "User-Agent": "Festival GPS Base44 Lite",
    "X-Request-ID": randomUUID(),
    ...(options.headers || {})
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  } else if (options.auth !== false) {
    const auth = await readFreshAuth();
    headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  let body;
  if (options.form) {
    body = options.form;
  } else if (options.body) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(new URL(path, API_URL), {
    method: options.method || "GET",
    headers,
    body
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(json.message || json.error_description || json.error || `${response.status} ${response.statusText}`);
  }

  return json;
}

async function readFreshAuth() {
  const auth = await readAuth();
  if (auth.expiresAt - Date.now() > 60_000) return auth;

  const form = new URLSearchParams();
  form.set("grant_type", "refresh_token");
  form.set("refresh_token", auth.refreshToken);
  form.set("client_id", AUTH_CLIENT_ID);

  const response = await fetch(new URL("oauth/token", API_URL), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString()
  });
  const token = await response.json();
  if (!response.ok) throw new Error(token.error_description || token.error || "Could not refresh Base44 token");

  const next = {
    ...auth,
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000
  };
  await writeJson(AUTH_PATH, next);
  return next;
}

async function readAuth() {
  try {
    return await readJson(AUTH_PATH);
  } catch {
    throw new Error("Not logged in. Run: node tools/base44-lite.mjs login");
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function readJsonOptional(file) {
  try {
    return await readJson(file);
  } catch {
    return null;
  }
}

async function writeJson(file, value) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}
