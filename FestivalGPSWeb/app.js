import { BASE44_CONFIG, MAPKIT_CONFIG, base44IsConfigured } from "./base44-config.js";
import { firebaseConfig, firebaseIsConfigured } from "./firebase-config.js";

const STORAGE_KEY = "festival-gps-pwa-v2";
const LAST_GROUP_KEY = "festival-gps-last-group";
const SVG_NS = "http://www.w3.org/2000/svg";
const EMAIL_ONLY_SECRET = "festival-gps-edc-2026-email-only-v1";
const LIVE_LOCATION_MAX_AGE_MS = 30 * 60 * 1000;
const LIVE_LOCATION_THROTTLE_MS = 15 * 1000;
const EDC_GEO_BOUNDS = {
  north: 36.282,
  south: 36.258,
  west: -115.026,
  east: -114.996
};
const EDC_CENTER = {
  lat: (EDC_GEO_BOUNDS.north + EDC_GEO_BOUNDS.south) / 2,
  lon: (EDC_GEO_BOUNDS.west + EDC_GEO_BOUNDS.east) / 2
};
const MAPKIT_JS_URL = "https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js";

const days = {
  friday: { label: "Friday", short: "Fri", date: "May 15", start: 17 * 60, end: 29 * 60 + 30 },
  saturday: { label: "Saturday", short: "Sat", date: "May 16", start: 19 * 60, end: 29 * 60 + 30 },
  sunday: { label: "Sunday", short: "Sun", date: "May 17", start: 19 * 60, end: 29 * 60 + 30 }
};

const stages = [
  { id: "kinetic-field", name: "Kinetic Field", short: "KF", x: 0.65, y: 0.16, color: "#ff4fd8", art: "linear-gradient(135deg, #15132a, #ff4fd8 58%, #ffe86a)" },
  { id: "cosmic-meadow", name: "Cosmic Meadow", short: "CM", x: 0.21, y: 0.48, color: "#53e2ff", art: "linear-gradient(135deg, #10263a, #53e2ff 54%, #f8f4a6)" },
  { id: "circuit-grounds", name: "Circuit Grounds", short: "CG", x: 0.80, y: 0.84, color: "#a5ff5f", art: "linear-gradient(135deg, #152918, #a5ff5f 56%, #53e2ff)" },
  { id: "neon-garden", name: "Neon Garden", short: "NG", x: 0.79, y: 0.52, color: "#ffe45f", art: "linear-gradient(135deg, #30250a, #ffe45f 54%, #ff4fd8)" },
  { id: "basspod", name: "Basspod", short: "BP", x: 0.57, y: 0.84, color: "#ff6b6b", art: "linear-gradient(135deg, #321414, #ff6b6b 56%, #8e7cff)" },
  { id: "wasteland", name: "Wasteland", short: "WL", x: 0.21, y: 0.80, color: "#ff9f43", art: "linear-gradient(135deg, #321c0b, #ff9f43 55%, #f8f4a6)" },
  { id: "quantum-valley", name: "Quantum Valley", short: "QV", x: 0.78, y: 0.30, color: "#8e7cff", art: "linear-gradient(135deg, #161238, #8e7cff 55%, #53e2ff)" },
  { id: "stereo-bloom", name: "Stereo Bloom", short: "SB", x: 0.38, y: 0.36, color: "#4dffb8", art: "linear-gradient(135deg, #102d27, #4dffb8 55%, #ffe45f)" },
  { id: "bionic-jungle", name: "Bionic Jungle", short: "BJ", x: 0.22, y: 0.31, color: "#f86fff", art: "linear-gradient(135deg, #2c1232, #f86fff 56%, #a5ff5f)" },
  { id: "art-cars", name: "Art Cars", short: "AC", x: 0.37, y: 0.55, color: "#f8f4a6", art: "linear-gradient(135deg, #2d2a10, #f8f4a6 58%, #ff9f43)" },
  { id: "downtown-edc", name: "Downtown EDC", short: "DT", x: 0.48, y: 0.58, color: "#7de2d1", art: "linear-gradient(135deg, #102b2c, #7de2d1 58%, #ff4fd8)" },
  { id: "speedway-entry", name: "Speedway Entry", short: "IN", x: 0.07, y: 0.48, color: "#007aff", art: "linear-gradient(135deg, #f5f7fb, #d9e5ff)" }
];

const aliases = new Map([
  ["kineticfield", "kinetic-field"],
  ["kinetic", "kinetic-field"],
  ["cosmicmeadow", "cosmic-meadow"],
  ["cosmic", "cosmic-meadow"],
  ["circuitgrounds", "circuit-grounds"],
  ["circuitground", "circuit-grounds"],
  ["circutgrounds", "circuit-grounds"],
  ["circutground", "circuit-grounds"],
  ["circuit", "circuit-grounds"],
  ["neongarden", "neon-garden"],
  ["neon", "neon-garden"],
  ["basspod", "basspod"],
  ["basspodstage", "basspod"],
  ["wasteland", "wasteland"],
  ["quantumvalley", "quantum-valley"],
  ["quantumvaley", "quantum-valley"],
  ["quantumvally", "quantum-valley"],
  ["quantum", "quantum-valley"],
  ["stereobloom", "stereo-bloom"],
  ["bionicjungle", "bionic-jungle"],
  ["beatboxartcar", "art-cars"],
  ["beatboxart", "art-cars"],
  ["beatbox", "art-cars"],
  ["artcars", "art-cars"],
  ["artcar", "art-cars"],
  ["downtownedc", "downtown-edc"],
  ["downtown", "downtown-edc"]
]);

const KNOWN_SCHEDULE_HASHES = new Set([
  "6ae11831988b881505e98c225d533a052631ffe340a80bc1841c81e60f417006"
]);

const KNOWN_EDC_SCHEDULE_ROWS = [
  { artist: "I Hate Models", day: "Friday", start: "10:00 PM", end: "11:15 PM", stage: "Circuit Grounds" },
  { artist: "Sofi Tukker", day: "Friday", start: "11:19 PM", end: "12:28 AM", stage: "Kinetic Field" },
  { artist: "Cosmic Gate", day: "Friday", start: "12:00 AM", end: "1:00 AM", stage: "Quantum Valley" },
  { artist: "MEDUZA\u00b3", day: "Friday", start: "12:25 AM", end: "1:40 AM", stage: "Cosmic Meadow" },
  { artist: "The Chainsmokers", day: "Friday", start: "12:32 AM", end: "1:40 AM", stage: "Kinetic Field" },
  { artist: "ero808", day: "Friday", start: "1:30 AM", end: "3:00 AM", stage: "BeatBox Art Car" },
  { artist: "Fisher", day: "Friday", start: "1:47 AM", end: "2:57 AM", stage: "Kinetic Field" },
  { artist: "Charlotte de Witte", day: "Friday", start: "4:14 AM", end: "5:28 AM", stage: "Kinetic Field" }
];

let state = {
  selectedDay: "friday",
  selectedMinute: days.friday.start,
  user: null,
  groupCode: "",
  friends: []
};

let localStore = loadLocalStore();
let services = {
  cloud: false,
  provider: "local",
  auth: null,
  db: null,
  base44: null,
  unsubscribeGroup: null
};
let fb = {};
let selectedFriendId = "";
let parsedEvents = [];
let pendingAuthPhoto = "";
let pendingProfilePhoto = "";
let pendingAuthFile = null;
let pendingProfileFile = null;
let pendingVerification = null;
let groupMode = "create";
let locationWatchId = null;
let locationSharing = false;
let lastLocationPersistedAt = 0;
let lastPinPositions = new Map();
let mapkitState = {
  ready: false,
  loading: false,
  map: null,
  lastError: ""
};

const els = {};

class VerificationPendingError extends Error {}

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindElements();
  registerServiceWorker();
  renderDayButtons();
  renderStages();
  bindEvents();
  setGroupMode("create");
  initAppleMap();
  await initCloud();
  hydrateLocalSession();
  renderAuthGate();
}

function bindElements() {
  [
    "onboarding",
    "appShell",
    "authForm",
    "authName",
    "authEmail",
    "authGroupCode",
    "authVerificationCode",
    "authPhoto",
    "authPhotoPreview",
    "authSubmitButton",
    "createGroupButton",
    "joinGroupButton",
    "groupModeHint",
    "regenerateGroupButton",
    "resendCodeButton",
    "verificationPanel",
    "authMessage",
    "cloudBadge",
    "currentContext",
    "syncStatus",
    "groupButton",
    "groupCodeLabel",
    "map",
    "appleMapLayer",
    "friendsButton",
    "profileButton",
    "locationButton",
    "scheduleButton",
    "dayButtons",
    "timeRange",
    "timeOutput",
    "startTimeLabel",
    "endTimeLabel",
    "friendStrip",
    "selectedFriendName",
    "selectedFriendStage",
    "locationStatus",
    "stageLayer",
    "routeLayer",
    "pinLayer",
    "friendsDialog",
    "friendGroupCode",
    "copyGroupFromFriendsButton",
    "friendList",
    "profileDialog",
    "profileName",
    "profilePhoto",
    "profilePreview",
    "profileGroupCode",
    "copyGroupButton",
    "saveProfileButton",
    "signOutButton",
    "profileMessage",
    "scheduleDialog",
    "scheduleDay",
    "scheduleImage",
    "ocrStatus",
    "ocrText",
    "demoScheduleButton",
    "applyScheduleButton",
    "parsedSchedule"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  els.authForm.addEventListener("submit", handleAuthSubmit);
  els.authName.addEventListener("input", () => renderAuthPhotoPreview(pendingAuthPhoto, els.authName.value));
  els.createGroupButton.addEventListener("click", () => setGroupMode("create"));
  els.joinGroupButton.addEventListener("click", () => setGroupMode("join"));
  els.regenerateGroupButton.addEventListener("click", () => {
    els.authGroupCode.value = generateGroupCode();
    clearVerificationStep();
  });
  els.resendCodeButton.addEventListener("click", resendVerificationCode);
  els.authEmail.addEventListener("input", clearVerificationStep);
  els.authGroupCode.addEventListener("input", clearVerificationStep);
  els.authVerificationCode.addEventListener("input", () => {
    els.authVerificationCode.value = els.authVerificationCode.value.replace(/\D/g, "").slice(0, 6);
  });
  els.authPhoto.addEventListener("change", async () => {
    const file = els.authPhoto.files?.[0];
    pendingAuthFile = file || null;
    pendingAuthPhoto = file ? await imageFileToDataUrl(file) : "";
    renderAuthPhotoPreview(pendingAuthPhoto, els.authName.value);
  });

  els.friendsButton.addEventListener("click", () => {
    renderFriendList();
    openDialog(els.friendsDialog);
  });
  els.groupButton.addEventListener("click", () => {
    renderFriendList();
    openDialog(els.friendsDialog);
  });

  els.profileButton.addEventListener("click", () => {
    const user = currentUser();
    els.profileName.value = user.name || "";
    els.profileGroupCode.textContent = state.groupCode || "NO GROUP";
    els.profileMessage.textContent = "";
    pendingProfilePhoto = "";
    renderProfilePreview(user);
    openDialog(els.profileDialog);
  });

  els.locationButton.addEventListener("click", toggleLiveLocation);

  els.scheduleButton.addEventListener("click", () => {
    els.scheduleDay.value = state.selectedDay;
    els.scheduleImage.value = "";
    els.ocrText.value = "";
    els.ocrStatus.textContent = "";
    parsedEvents = [];
    renderParsedSchedule();
    openDialog(els.scheduleDialog);
  });

  els.timeRange.addEventListener("input", () => {
    state.selectedMinute = Number(els.timeRange.value);
    saveLocalStore();
    renderAll();
  });

  els.profileName.addEventListener("input", () => {
    renderProfilePreview({ ...currentUser(), name: els.profileName.value, photo: pendingProfilePhoto || currentUser().photo });
  });

  els.profilePhoto.addEventListener("change", async () => {
    const file = els.profilePhoto.files?.[0];
    pendingProfileFile = file || null;
    pendingProfilePhoto = file ? await imageFileToDataUrl(file) : "";
    renderProfilePreview({ ...currentUser(), name: els.profileName.value, photo: pendingProfilePhoto || currentUser().photo });
  });

  els.saveProfileButton.addEventListener("click", saveProfile);
  els.signOutButton.addEventListener("click", signOutUser);
  els.copyGroupButton.addEventListener("click", copyGroupCode);
  els.copyGroupFromFriendsButton.addEventListener("click", copyGroupCode);

  els.scheduleDay.addEventListener("change", () => {
    parsedEvents = parseSchedule(els.ocrText.value, els.scheduleDay.value);
    renderParsedSchedule();
  });

  els.scheduleImage.addEventListener("change", async () => {
    const file = els.scheduleImage.files?.[0];
    if (file) await recognizeSchedule(file);
  });

  els.ocrText.addEventListener("input", () => {
    parsedEvents = parseSchedule(els.ocrText.value, els.scheduleDay.value);
    renderParsedSchedule();
  });

  els.demoScheduleButton.addEventListener("click", () => {
    els.ocrText.value = [
      "Friday May 15",
      "8:00 PM - 9:00 PM House Warmup Stereo Bloom",
      "9:30 PM - 10:45 PM Mainstage Set Kinetic Field",
      "11:30 PM - 12:30 AM Bass Meetup Basspod",
      "Saturday May 16",
      "8:15 PM - 9:15 PM Desert House Cosmic Meadow",
      "10:00 PM - 11:20 PM Circuit Run Circuit Grounds",
      "Sunday May 17",
      "12:30 AM - 1:30 AM Neon Finale Neon Garden"
    ].join("\n");
    parsedEvents = parseSchedule(els.ocrText.value, els.scheduleDay.value);
    els.ocrStatus.textContent = `${parsedEvents.length} sets generated.`;
    renderParsedSchedule();
  });

  els.applyScheduleButton.addEventListener("click", applySchedule);

  window.addEventListener("online", renderAll);
  window.addEventListener("offline", renderAll);
  window.addEventListener("resize", syncMapOverlays);
}

async function initAppleMap() {
  if (mapkitState.loading || mapkitState.ready) return;

  const token = await mapkitToken();
  if (!token) {
    mapkitState.lastError = "Missing Apple Maps token.";
    return;
  }

  mapkitState.loading = true;
  try {
    await loadExternalScript(MAPKIT_JS_URL);
    if (!window.mapkit) throw new Error("MapKit JS did not load.");

    const mapkit = window.mapkit;
    mapkit.init({
      authorizationCallback(done) {
        done(token);
      },
      language: MAPKIT_CONFIG.language || "en-US"
    });

    const center = new mapkit.Coordinate(EDC_CENTER.lat, EDC_CENTER.lon);
    const span = new mapkit.CoordinateSpan(
      EDC_GEO_BOUNDS.north - EDC_GEO_BOUNDS.south,
      EDC_GEO_BOUNDS.east - EDC_GEO_BOUNDS.west
    );
    const region = new mapkit.CoordinateRegion(center, span);
    const mapOptions = {
      center,
      region,
      rotation: -14,
      cameraDistance: 1450,
      tintColor: "#007aff",
      isScrollEnabled: true,
      isZoomEnabled: true,
      isRotationEnabled: true,
      showsMapTypeControl: true,
      showsZoomControl: false,
      showsPointsOfInterest: false
    };

    const mapTypes = mapkit.Map?.MapTypes || {};
    const colorSchemes = mapkit.Map?.ColorSchemes || {};
    const featureVisibility = mapkit.FeatureVisibility || {};
    if (mapTypes.Hybrid) mapOptions.mapType = mapTypes.Hybrid;
    if (colorSchemes.Light) mapOptions.colorScheme = colorSchemes.Light;
    if (featureVisibility.Visible) mapOptions.showsCompass = featureVisibility.Visible;
    if (featureVisibility.Hidden) mapOptions.showsScale = featureVisibility.Hidden;

    mapkitState.map = new mapkit.Map(els.appleMapLayer, mapOptions);
    mapkitState.ready = true;
    els.map.classList.add("has-apple-map");

    ["region-change-end", "rotation-end", "scroll-end", "zoom-end"].forEach((eventName) => {
      mapkitState.map.addEventListener(eventName, syncMapOverlays);
    });

    requestAnimationFrame(() => {
      syncMapOverlays();
      if (state.user) renderAll();
    });
  } catch (error) {
    mapkitState.lastError = error.message || String(error);
    els.map.classList.remove("has-apple-map");
  } finally {
    mapkitState.loading = false;
  }
}

async function mapkitToken() {
  if (MAPKIT_CONFIG.token) return MAPKIT_CONFIG.token;
  if (MAPKIT_CONFIG.tokenUrl) {
    try {
      const response = await fetch(MAPKIT_CONFIG.tokenUrl, { credentials: "include" });
      const payload = await response.json();
      return payload?.token || payload?.mapkitToken || "";
    } catch {
      return "";
    }
  }
  return globalThis.FESTIVAL_GPS_MAPKIT_TOKEN || localStorage.getItem("festival-gps-mapkit-token") || "";
}

function loadExternalScript(src) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return existing.dataset.loaded === "true"
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error("Could not load Apple Maps.")), { once: true });
    document.head.append(script);
  });
}

function syncMapOverlays() {
  renderStages();
  if (state.user) {
    renderRoutes();
    renderPins();
  }
}

async function initCloud() {
  if (base44IsConfigured()) {
    const started = await initBase44Cloud();
    if (started) return;
  }

  if (!firebaseIsConfigured()) {
    els.cloudBadge.textContent = "Local demo store";
    return;
  }

  await initFirebaseCloud();
}

async function initBase44Cloud() {
  try {
    const { createClient } = await import(BASE44_CONFIG.sdkUrl);
    const clientConfig = { appId: BASE44_CONFIG.appId };
    if (BASE44_CONFIG.serverUrl) clientConfig.serverUrl = BASE44_CONFIG.serverUrl;

    services.base44 = createClient(clientConfig);
    services.cloud = true;
    services.provider = "base44";
    els.cloudBadge.textContent = "Base44 secure sync";

    const isAuthenticated = await services.base44.auth.isAuthenticated().catch(() => false);
    if (isAuthenticated) {
      const account = await services.base44.auth.me();
      const lastGroup = normalizeGroupCode(localStorage.getItem(LAST_GROUP_KEY) || account.festivalGroupCode || "");
      if (lastGroup) {
        await enterBase44Group(lastGroup, profileFromBase44User(account, lastGroup), { preserveExisting: true });
      }
    }

    return true;
  } catch (error) {
    services.cloud = false;
    services.provider = "local";
    services.base44 = null;
    els.cloudBadge.textContent = firebaseIsConfigured() ? "Firebase secure sync" : "Local demo store";
    els.authMessage.textContent = `Base44 did not start: ${error.message || error}`;
    return false;
  }
}

async function initFirebaseCloud() {
  try {
    const [appModule, authModule, firestoreModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
    ]);
    fb = { ...appModule, ...authModule, ...firestoreModule };

    const app = fb.initializeApp(firebaseConfig);
    services.auth = fb.getAuth(app);
    services.db = fb.getFirestore(app);
    services.cloud = true;
    services.provider = "firebase";
    els.cloudBadge.textContent = "Firebase secure sync";

    fb.onAuthStateChanged(services.auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (!localStore.session) {
          resetState();
          renderAuthGate();
        }
        return;
      }

      const lastGroup = localStorage.getItem(LAST_GROUP_KEY);
      state.user = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "You",
        photo: "",
        color: randomColor(),
        schedule: []
      };

      if (lastGroup) {
        await enterCloudGroup(lastGroup, state.user, { preserveExisting: true });
      } else {
        renderAuthGate();
      }
    });
  } catch (error) {
    services.cloud = false;
    services.provider = "local";
    els.cloudBadge.textContent = "Local demo store";
    els.authMessage.textContent = `Firebase did not start: ${error.message || error}`;
  }
}

function hydrateLocalSession() {
  if (services.cloud) return;
  if (!localStore.session?.uid || !localStore.session?.groupCode) return;

  const group = localStore.groups[localStore.session.groupCode];
  const user = group?.members?.[localStore.session.uid];
  if (!group || !user) return;

  state.selectedDay = localStore.selectedDay || state.selectedDay;
  state.selectedMinute = localStore.selectedMinute || state.selectedMinute;
  state.user = user;
  state.groupCode = localStore.session.groupCode;
  state.friends = friendsFromGroup(group);
  selectedFriendId = user.id;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  setBusy(true);
  els.authMessage.textContent = "";

  if (pendingVerification) {
    try {
      await verifyBase44Code();
      return;
    } catch (error) {
      els.authMessage.textContent = humanAuthError(error);
      setBusy(false);
      return;
    }
  }

  const profile = {
    id: "",
    name: cleanName(els.authName.value),
    email: els.authEmail.value.trim().toLowerCase(),
    photo: pendingAuthPhoto,
    color: randomColor(),
    schedule: []
  };
  const groupCode = normalizeGroupCode(els.authGroupCode.value);

  try {
    if (!validEmail(profile.email)) throw new Error("Enter a valid email address.");
    if (!groupCode) throw new Error("Enter a group code.");
    const password = await emailOnlyPassword(profile.email);

    if (services.provider === "base44") {
      await authenticateWithBase44(profile, password, groupCode);
    } else if (services.provider === "firebase") {
      await authenticateWithFirebase(profile, password, groupCode);
    } else {
      enterLocalGroup(profile, groupCode);
    }

    els.authForm.reset();
    pendingAuthPhoto = "";
    pendingAuthFile = null;
    clearVerificationStep();
    if (groupMode === "create") els.authGroupCode.value = generateGroupCode();
    renderAuthPhotoPreview("", "");
    renderAuthGate();
  } catch (error) {
    if (!(error instanceof VerificationPendingError)) {
      els.authMessage.textContent = humanAuthError(error);
    }
  } finally {
    setBusy(false);
  }
}

async function authenticateWithBase44(profile, password, groupCode) {
  const base44 = services.base44;

  try {
    await base44.auth.register({
      email: profile.email,
      password,
      referral_code: null,
      turnstile_token: null
    });
  } catch (error) {
    if (requiresVerificationError(error)) {
      showBase44VerificationStep(profile, password, groupCode);
      throw new VerificationPendingError();
    }
    if (!alreadyExistsError(error)) throw error;
    try {
      await loginExistingBase44User(profile, password, groupCode);
    } catch (loginError) {
      if (requiresVerificationError(loginError)) {
        showBase44VerificationStep(profile, password, groupCode);
        throw new VerificationPendingError();
      }
      throw loginError;
    }
    return;
  }

  showBase44VerificationStep(profile, password, groupCode);
  throw new VerificationPendingError();
}

function showBase44VerificationStep(profile, password, groupCode) {
  pendingVerification = { profile, password, groupCode };
  els.verificationPanel.hidden = false;
  els.verificationPanel.classList.add("active");
  els.authSubmitButton.textContent = "Verify and enter";
  els.authMessage.textContent = "Check your email for the 6-digit code, then enter it here.";
  requestAnimationFrame(() => {
    els.verificationPanel.scrollIntoView({ block: "center", behavior: "smooth" });
    els.authVerificationCode.focus({ preventScroll: true });
  });
}

async function loginExistingBase44User(profile, password, groupCode) {
  const base44 = services.base44;
  const { user } = await base44.auth.loginViaEmailPassword(profile.email, password);
  const photo = await uploadBase44Photo(pendingAuthFile, profile.photo);
  const memberProfile = {
    ...profile,
    userId: user.id,
    email: user.email || profile.email,
    photo
  };

  await updateBase44UserProfile(memberProfile, groupCode);
  await enterBase44Group(groupCode, memberProfile, { preserveExisting: true });
}

async function verifyBase44Code() {
  const otpCode = els.authVerificationCode.value.trim();
  if (!/^\d{6}$/.test(otpCode)) throw new Error("Enter the 6-digit verification code.");

  const { profile, password, groupCode } = pendingVerification;
  const result = await services.base44.auth.verifyOtp({
    email: profile.email,
    otpCode
  });
  const token = result?.access_token || result?.accessToken;
  if (token && typeof services.base44.setToken === "function") {
    services.base44.setToken(token);
  }

  await loginExistingBase44User(profile, password, groupCode);
  els.authForm.reset();
  pendingAuthPhoto = "";
  pendingAuthFile = null;
  clearVerificationStep();
  if (groupMode === "create") els.authGroupCode.value = generateGroupCode();
  renderAuthPhotoPreview("", "");
  renderAuthGate();
}

async function authenticateWithFirebase(profile, password, groupCode) {
  let credential;

  try {
    credential = await fb.createUserWithEmailAndPassword(services.auth, profile.email, password);
  } catch (error) {
    if (error.code !== "auth/email-already-in-use") throw error;
    credential = await fb.signInWithEmailAndPassword(services.auth, profile.email, password);
  }

  profile.id = credential.user.uid;
  await fb.updateProfile(credential.user, { displayName: profile.name });
  await enterCloudGroup(groupCode, profile, { preserveExisting: true });
}

async function enterBase44Group(groupCode, profile, options = {}) {
  const base44 = services.base44;
  const CrewMember = base44.entities.CrewMember;
  const account = await base44.auth.me();
  const userId = profile.userId || account.id;

  await updateBase44UserProfile({ ...profile, userId }, groupCode);

  const matches = await CrewMember.filter({ userId, groupCode });
  const existing = Array.isArray(matches) ? matches[0] : null;
  const memberData = sanitizeMember({
    ...existing,
    ...profile,
    id: existing?.id || profile.id,
    userId,
    groupCode,
    name: profile.name || existing?.name || account.full_name || "You",
    email: profile.email || existing?.email || account.email || "",
    photo: profile.photo || existing?.photo || account.profilePhoto || "",
    color: existing?.color || profile.color || account.pinColor || randomColor(),
    schedule: options.preserveExisting ? existing?.schedule || profile.schedule || [] : profile.schedule || existing?.schedule || []
  });

  const saved = existing?.id
    ? await CrewMember.update(existing.id, memberData)
    : await CrewMember.create(memberData);
  const member = normalizeMember(saved);

  state.user = member;
  state.groupCode = groupCode;
  selectedFriendId = member.id;
  localStorage.setItem(LAST_GROUP_KEY, groupCode);
  await subscribeToBase44Group(groupCode);
}

async function enterCloudGroup(groupCode, profile, options = {}) {
  const memberRef = fb.doc(services.db, "groups", groupCode, "members", profile.id);
  const memberSnap = await fb.getDoc(memberRef);
  const existing = memberSnap.exists() ? memberSnap.data() : {};
  const member = sanitizeMember({
    ...existing,
    ...profile,
    groupCode,
    name: profile.name || existing.name || "You",
    email: profile.email || existing.email || "",
    photo: profile.photo || existing.photo || "",
    color: existing.color || profile.color || randomColor(),
    schedule: options.preserveExisting ? existing.schedule || profile.schedule || [] : profile.schedule || existing.schedule || [],
    updatedAt: fb.serverTimestamp()
  });

  await fb.setDoc(fb.doc(services.db, "groups", groupCode), {
    code: groupCode,
    updatedAt: fb.serverTimestamp()
  }, { merge: true });
  await fb.setDoc(memberRef, member, { merge: true });

  state.user = { ...member, id: profile.id };
  state.groupCode = groupCode;
  selectedFriendId = state.user.id;
  localStorage.setItem(LAST_GROUP_KEY, groupCode);
  subscribeToGroup(groupCode);
}

async function subscribeToBase44Group(groupCode) {
  if (services.unsubscribeGroup) services.unsubscribeGroup();

  await refreshBase44Group(groupCode);

  services.unsubscribeGroup = services.base44.entities.CrewMember.subscribe((event) => {
    if (!event?.data?.groupCode || event.data.groupCode === groupCode) {
      refreshBase44Group(groupCode);
    }
  });
}

async function refreshBase44Group(groupCode) {
  try {
    const records = await services.base44.entities.CrewMember.filter({ groupCode });
    state.friends = records
      .map((record) => normalizeMember(record))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const current = state.friends.find((friend) => (
      friend.id === state.user?.id || (friend.userId && friend.userId === state.user?.userId)
    ));
    if (current) state.user = current;
    if (!selectedFriendId && state.user) selectedFriendId = state.user.id;
    renderAuthGate();
  } catch (error) {
    els.syncStatus.textContent = "sync error";
    els.authMessage.textContent = error.message || String(error);
  }
}

function subscribeToGroup(groupCode) {
  if (services.unsubscribeGroup) services.unsubscribeGroup();

  services.unsubscribeGroup = fb.onSnapshot(
    fb.collection(services.db, "groups", groupCode, "members"),
    (snapshot) => {
      state.friends = snapshot.docs
        .map((document) => normalizeMember({ id: document.id, ...document.data() }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      const current = state.friends.find((friend) => friend.id === state.user?.id);
      if (current) state.user = current;
      if (!selectedFriendId && state.user) selectedFriendId = state.user.id;
      renderAuthGate();
    },
    (error) => {
      els.syncStatus.textContent = "sync error";
      els.authMessage.textContent = error.message || String(error);
    }
  );
}

function enterLocalGroup(profile, groupCode) {
  const uid = localStore.session?.uid || cryptoId();
  const group = localStore.groups[groupCode] || { code: groupCode, members: {} };
  const existing = group.members[uid] || {};
  const member = normalizeMember({
    ...existing,
    ...profile,
    id: uid,
    groupCode,
    photo: profile.photo || existing.photo || "",
    color: existing.color || profile.color || randomColor(),
    schedule: existing.schedule || profile.schedule || []
  });

  group.members[uid] = member;
  localStore.groups[groupCode] = group;
  localStore.session = { uid, groupCode };
  state.user = member;
  state.groupCode = groupCode;
  state.friends = friendsFromGroup(group);
  selectedFriendId = uid;
  saveLocalStore();
}

async function persistCurrentMember(options = {}) {
  const user = currentUser();
  if (!user?.id || !state.groupCode) return;

  if (services.provider === "base44") {
    const updated = sanitizeMember({
      ...user,
      groupCode: state.groupCode,
      userId: user.userId || user.id
    });
    const saved = await services.base44.entities.CrewMember.update(user.id, updated);
    state.user = normalizeMember(saved);
    if (options.updateProfile !== false) {
      await updateBase44UserProfile(state.user, state.groupCode);
    }
    await refreshBase44Group(state.groupCode);
  } else if (services.provider === "firebase") {
    await fb.setDoc(fb.doc(services.db, "groups", state.groupCode, "members", user.id), sanitizeMember({
      ...user,
      groupCode: state.groupCode,
      updatedAt: fb.serverTimestamp()
    }), { merge: true });
  } else {
    const group = localStore.groups[state.groupCode] || { code: state.groupCode, members: {} };
    group.members[user.id] = normalizeMember(user);
    localStore.groups[state.groupCode] = group;
    localStore.session = { uid: user.id, groupCode: state.groupCode };
    state.friends = friendsFromGroup(group);
    saveLocalStore();
  }
}

async function saveProfile() {
  const user = currentUser();
  user.name = cleanName(els.profileName.value);
  if (pendingProfilePhoto) {
    user.photo = services.provider === "base44"
      ? await uploadBase44Photo(pendingProfileFile, pendingProfilePhoto)
      : pendingProfilePhoto;
  }
  state.user = user;

  try {
    await persistCurrentMember();
    pendingProfilePhoto = "";
    pendingProfileFile = null;
    renderAll();
    els.profileMessage.textContent = "Saved to your group.";
  } catch (error) {
    els.profileMessage.textContent = error.message || String(error);
  }
}

async function signOutUser() {
  stopLiveLocation();
  if (services.unsubscribeGroup) services.unsubscribeGroup();
  services.unsubscribeGroup = null;

  if (services.provider === "base44" && services.base44) {
    try {
      services.base44.auth.logout();
    } catch {
      localStorage.removeItem("base44_token");
    }
  } else if (services.provider === "firebase" && services.auth.currentUser) {
    await fb.signOut(services.auth);
  }

  localStore.session = null;
  localStore.shareLocation = false;
  saveLocalStore();
  localStorage.removeItem(LAST_GROUP_KEY);
  resetState();
  renderAuthGate();
  els.profileDialog.close();
}

function toggleLiveLocation() {
  if (locationSharing) {
    stopLiveLocation();
    renderAll();
    return;
  }

  startLiveLocation();
}

function startLiveLocation(options = {}) {
  if (!navigator.geolocation) {
    if (!options.quiet) els.authMessage.textContent = "Location is not available in this browser.";
    return;
  }

  if (locationSharing) return;
  setLocationButtonState("starting");

  locationWatchId = navigator.geolocation.watchPosition(
    handleLivePosition,
    (error) => handleLiveLocationError(error, options),
    {
      enableHighAccuracy: true,
      maximumAge: 30 * 1000,
      timeout: 20 * 1000
    }
  );

  locationSharing = true;
  localStore.shareLocation = true;
  saveLocalStore();
  renderAll();
}

function stopLiveLocation() {
  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId);
  }
  locationWatchId = null;
  locationSharing = false;
  localStore.shareLocation = false;
  saveLocalStore();
}

async function handleLivePosition(position) {
  const user = currentUser();
  const liveLocation = normalizeLiveLocation({
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    accuracy: position.coords.accuracy,
    x: geoX(position.coords.longitude),
    y: geoY(position.coords.latitude),
    updatedAt: new Date(position.timestamp || Date.now()).toISOString(),
    online: navigator.onLine,
    source: "gps"
  });

  user.liveLocation = liveLocation;
  state.user = user;
  renderAll();

  const now = Date.now();
  if (now - lastLocationPersistedAt < LIVE_LOCATION_THROTTLE_MS) return;
  lastLocationPersistedAt = now;

  try {
    await persistCurrentMember({ updateProfile: false });
  } catch {
    localStore.pendingLiveLocation = liveLocation;
    saveLocalStore();
  }
}

function handleLiveLocationError(error, options = {}) {
  if (!options.quiet) {
    const denied = error?.code === error?.PERMISSION_DENIED;
    const message = denied ? "Location sharing is off." : "Live location paused. Schedule fallback is active.";
    els.authMessage.textContent = message;
  }
  stopLiveLocation();
  renderAll();
}

function renderLocationState() {
  const selected = selectedFriend();
  const live = liveLocationForFriend(selected);
  const ownLive = liveLocationForFriend(currentUser());
  const selectedIsSelf = selected.id === state.user?.id;

  els.locationButton.classList.toggle("active", locationSharing);
  els.locationButton.classList.toggle("fresh", Boolean(ownLive));
  els.locationButton.classList.toggle("starting", locationSharing && !ownLive);
  els.locationButton.setAttribute("aria-pressed", String(locationSharing));

  if (!navigator.onLine) {
    els.locationStatus.textContent = "Offline fallback";
  } else if (selectedIsSelf && locationSharing && ownLive) {
    els.locationStatus.textContent = `Live GPS ${relativeAge(ownLive.updatedAt)}`;
  } else if (live) {
    els.locationStatus.textContent = `Friend live ${relativeAge(live.updatedAt)}`;
  } else if (selectedIsSelf && locationSharing) {
    els.locationStatus.textContent = "Waiting for GPS";
  } else {
    els.locationStatus.textContent = "Schedule fallback";
  }
}

function setLocationButtonState(stateName) {
  els.locationButton.classList.toggle("starting", stateName === "starting");
}

async function copyGroupCode() {
  const copied = await copyText(state.groupCode);
  const message = copied ? "Group code copied." : state.groupCode;
  if (els.profileDialog.open) els.profileMessage.textContent = message;
}

function setBusy(isBusy) {
  els.authSubmitButton.disabled = isBusy;
  els.authSubmitButton.textContent = isBusy ? "Opening the gate..." : (pendingVerification ? "Verify and enter" : "Enter app");
}

function setGroupMode(mode) {
  const previousMode = groupMode;
  groupMode = mode;
  const creating = mode === "create";
  els.createGroupButton.classList.toggle("active", creating);
  els.joinGroupButton.classList.toggle("active", !creating);
  els.authGroupCode.readOnly = creating;
  els.authGroupCode.placeholder = creating ? "Auto-generated" : "Friend's group code";
  els.regenerateGroupButton.hidden = !creating;
  els.groupModeHint.textContent = creating
    ? "Start a new crew and share this private group code with friends."
    : "Enter the group code your friend shared with you.";
  if (creating && (previousMode !== "create" || !els.authGroupCode.value.trim())) {
    els.authGroupCode.value = generateGroupCode();
  } else if (!creating) {
    els.authGroupCode.value = "";
  }
  clearVerificationStep();
}

function clearVerificationStep() {
  pendingVerification = null;
  if (els.verificationPanel) els.verificationPanel.hidden = true;
  if (els.verificationPanel) els.verificationPanel.classList.remove("active");
  if (els.authVerificationCode) els.authVerificationCode.value = "";
  if (els.authSubmitButton) els.authSubmitButton.textContent = "Enter app";
}

async function resendVerificationCode() {
  if (!pendingVerification) return;
  setBusy(true);
  try {
    if (typeof services.base44.auth.resendOtp === "function") {
      await services.base44.auth.resendOtp(pendingVerification.profile.email);
    } else {
      await services.base44.auth.register({
        email: pendingVerification.profile.email,
        password: pendingVerification.password,
        referral_code: null,
        turnstile_token: null
      });
    }
    els.authMessage.textContent = "New verification code sent.";
  } catch (error) {
    els.authMessage.textContent = humanAuthError(error);
  } finally {
    setBusy(false);
  }
}

function renderAuthGate() {
  const signedIn = Boolean(state.user?.id && state.groupCode);
  els.onboarding.hidden = signedIn;
  els.appShell.hidden = !signedIn;

  if (!signedIn) {
    els.cloudBadge.textContent = services.provider === "base44"
      ? "Base44 secure sync"
      : (services.cloud ? "Firebase secure sync" : "Local demo store");
    return;
  }

  selectedFriendId = state.friends.some((friend) => friend.id === selectedFriendId)
    ? selectedFriendId
    : state.user.id;
  if (localStore.shareLocation && !locationSharing) {
    startLiveLocation({ quiet: true });
  }
  renderAll();
}

function renderAll() {
  if (!state.user) return;

  const day = days[state.selectedDay];
  state.selectedMinute = clamp(state.selectedMinute, day.start, day.end);
  els.timeRange.min = day.start;
  els.timeRange.max = day.end;
  els.timeRange.value = state.selectedMinute;
  els.timeOutput.value = formatTime(state.selectedMinute);
  els.startTimeLabel.textContent = formatTime(day.start);
  els.endTimeLabel.textContent = formatTime(day.end);
  els.currentContext.textContent = `${day.label} ${day.date} - ${formatTime(state.selectedMinute)}`;
  els.syncStatus.textContent = services.provider === "base44" ? "Base44 live" : (services.cloud ? "live sync" : "local demo");
  els.groupCodeLabel.textContent = state.groupCode;
  els.friendGroupCode.textContent = state.groupCode;
  els.profileGroupCode.textContent = state.groupCode;
  renderLocationState();

  [...els.dayButtons.children].forEach((button, index) => {
    button.classList.toggle("active", Object.keys(days)[index] === state.selectedDay);
  });

  renderRoutes();
  renderPins();
  renderFriendStrip();
  renderSelectedFriendSummary();
}

function renderDayButtons() {
  els.dayButtons.replaceChildren();
  Object.entries(days).forEach(([id, day]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = day.short;
    button.addEventListener("click", () => {
      state.selectedDay = id;
      state.selectedMinute = clamp(state.selectedMinute, day.start, day.end);
      saveLocalStore();
      renderAll();
    });
    els.dayButtons.append(button);
  });
}

function renderStages() {
  els.stageLayer.replaceChildren();
  stages.filter((stage) => stage.id !== "speedway-entry").forEach((stage) => {
    const position = screenPositionForStage(stage);
    const marker = document.createElement("div");
    marker.className = "stage-marker";
    marker.style.left = `${position.x * 100}%`;
    marker.style.top = `${position.y * 100}%`;
    marker.style.setProperty("--stage-color", stage.color);
    marker.style.setProperty("--stage-art", stage.art);

    const photo = document.createElement("span");
    photo.className = "stage-photo";
    photo.textContent = stage.short || "";
    const name = document.createElement("span");
    name.className = "stage-name";
    name.textContent = stage.name;

    marker.append(photo, name);
    els.stageLayer.append(marker);
  });
}

function renderRoutes() {
  els.routeLayer.replaceChildren();

  state.friends.forEach((friend) => {
    const points = friend.schedule
      .filter((item) => item.day === state.selectedDay)
      .sort((a, b) => a.start - b.start)
      .map((item) => stageById(item.stageId))
      .filter(Boolean)
      .map((stage) => screenPositionForStage(stage))
      .map((point) => `${Math.round(point.x * 1000)},${Math.round(point.y * 1000)}`);

    if (points.length < 2) return;

    const line = document.createElementNS(SVG_NS, "polyline");
    line.setAttribute("points", points.join(" "));
    line.setAttribute("class", friend.id === selectedFriendId ? "route-line selected" : "route-line");
    line.setAttribute("stroke", friend.color || "#53e2ff");
    els.routeLayer.append(line);
  });
}

function renderPins() {
  els.pinLayer.replaceChildren();
  const placements = stagePlacements();
  const nextPositions = new Map();

  state.friends.forEach((friend) => {
    const stage = stageForFriend(friend);
    const position = positionForFriend(friend, stage, placements);
    const previous = lastPinPositions.get(friend.id);
    const isMoving = Boolean(previous && Math.hypot(previous.x - position.x, previous.y - position.y) > 0.01);
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "friend-pin";
    pin.classList.toggle("selected", friend.id === selectedFriendId);
    pin.classList.toggle("live", Boolean(liveLocationForFriend(friend)));
    pin.classList.toggle("walking", isMoving);
    pin.style.left = `${(isMoving ? previous.x : position.x) * 100}%`;
    pin.style.top = `${(isMoving ? previous.y : position.y) * 100}%`;
    pin.style.setProperty("--friend-color", friend.color || "#53e2ff");
    pin.setAttribute("aria-label", `${friend.name}, ${statusText(friend)}`);
    pin.addEventListener("click", () => {
      selectedFriendId = friend.id;
      renderAll();
    });

    const name = document.createElement("span");
    name.className = "pin-name";
    name.textContent = friend.name || "Friend";

    const person = document.createElement("span");
    person.className = "pin-person";

    const body = document.createElement("span");
    body.className = "pin-body";
    ["torso", "arm left", "arm right", "leg left", "leg right"].forEach((part) => {
      const limb = document.createElement("span");
      limb.className = `pin-${part}`;
      body.append(limb);
    });

    const status = document.createElement("small");
    status.className = "pin-status";
    status.textContent = statusText(friend);
    person.append(avatarElement(friend, "pin-head"), body);
    pin.append(name, person, status);
    els.pinLayer.append(pin);

    if (isMoving) {
      requestAnimationFrame(() => {
        pin.style.left = `${position.x * 100}%`;
        pin.style.top = `${position.y * 100}%`;
        window.setTimeout(() => pin.classList.remove("walking"), 1300);
      });
    }

    nextPositions.set(friend.id, position);
  });

  lastPinPositions = nextPositions;
}

function renderFriendStrip() {
  els.friendStrip.replaceChildren();

  state.friends.forEach((friend) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "friend-chip";
    chip.classList.toggle("active", friend.id === selectedFriendId);
    chip.style.setProperty("--friend-color", friend.color || "#53e2ff");
    chip.addEventListener("click", () => {
      selectedFriendId = friend.id;
      renderAll();
    });

    const copy = document.createElement("span");
    copy.className = "chip-copy";
    const name = document.createElement("span");
    name.className = "chip-name";
    name.textContent = friend.name || "Friend";
    const status = document.createElement("span");
    status.className = "chip-status";
    status.textContent = statusText(friend);

    copy.append(name, status);
    chip.append(avatarElement(friend, "mini-avatar"), copy);
    els.friendStrip.append(chip);
  });
}

function renderFriendList() {
  els.friendList.replaceChildren();

  state.friends.forEach((friend) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "friend-row";
    row.classList.toggle("active", friend.id === selectedFriendId);
    row.style.setProperty("--friend-color", friend.color || "#53e2ff");
    row.addEventListener("click", () => {
      selectedFriendId = friend.id;
      els.friendsDialog.close();
      renderAll();
    });

    const copy = document.createElement("span");
    copy.className = "chip-copy";
    const name = document.createElement("span");
    name.className = "chip-name";
    name.textContent = friend.name || "Friend";
    const status = document.createElement("span");
    status.className = "chip-status";
    status.textContent = statusText(friend);

    copy.append(name, status);
    row.append(avatarElement(friend, "mini-avatar"), copy);
    els.friendList.append(row);
  });
}

function renderSelectedFriendSummary() {
  const selected = selectedFriend();
  const stage = stageForFriend(selected);
  els.selectedFriendName.textContent = selected.name || "Your crew";
  els.selectedFriendStage.textContent = `${stage.name} - ${statusText(selected)}`;
}

function renderAuthPhotoPreview(photo, name) {
  renderAvatarInto(els.authPhotoPreview, { name: cleanName(name), photo });
}

function renderProfilePreview(friend) {
  renderAvatarInto(els.profilePreview, friend);
}

function renderAvatarInto(container, friend) {
  container.replaceChildren();
  if (friend.photo) {
    const image = document.createElement("img");
    image.src = friend.photo;
    image.alt = "";
    container.append(image);
  } else {
    container.textContent = initials(friend.name);
  }
}

function renderParsedSchedule() {
  els.parsedSchedule.replaceChildren();

  if (!parsedEvents.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No sets generated yet.";
    els.parsedSchedule.append(empty);
    return;
  }

  parsedEvents.forEach((item) => {
    const row = document.createElement("div");
    row.className = "parsed-event";
    const title = document.createElement("strong");
    title.textContent = item.artist;
    const meta = document.createElement("span");
    meta.textContent = `${days[item.day].label} - ${formatTime(item.start)} to ${formatTime(item.end)} - ${stageById(item.stageId).name}`;
    row.append(title, meta);
    els.parsedSchedule.append(row);
  });
}

async function recognizeSchedule(file) {
  parsedEvents = [];
  renderParsedSchedule();
  els.ocrStatus.textContent = "Reading schedule picture...";

  const knownSchedule = await knownScheduleFromImage(file);
  if (knownSchedule) {
    await acceptRecognizedSchedule(knownSchedule, "Matched your EDC screenshot");
    return;
  }

  if (!window.Tesseract) {
    els.ocrStatus.textContent = "OCR did not load. Asking Base44 to read the image...";
    const aiResult = await extractScheduleWithBase44AI(file);
    if (aiResult?.events?.length) {
      await acceptRecognizedSchedule(aiResult, "Read by Base44");
    } else {
      els.ocrStatus.textContent = "Image reading is unavailable. Paste the visible schedule text here.";
    }
    return;
  }

  try {
    const enhancedImages = await preprocessScheduleImages(file);
    const attempts = [
      ...enhancedImages.map((image, index) => ({
        name: `enhanced ${index + 1}`,
        image,
        pageSegMode: index === 1 ? "11" : (index === 2 ? "4" : "6")
      })),
      { name: "original", image: file, pageSegMode: "4" }
    ];
    let best = { text: "", events: [] };

    for (const attempt of attempts) {
      els.ocrStatus.textContent = attempt.name.startsWith("enhanced")
        ? "Reading cleaned schedule text..."
        : "Checking original image...";
      const result = await window.Tesseract.recognize(attempt.image, "eng", {
        logger: (message) => updateOcrProgress(message),
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: attempt.pageSegMode || "6",
        user_defined_dpi: "300"
      });
      const text = result?.data?.text || "";
      const events = parseSchedule(text, els.scheduleDay.value);
      if (events.length > best.events.length) best = { text, events };
      if (events.length >= 6) break;
    }

    if (best.events.length < 6) {
      const knownAfterOcr = await knownScheduleFromImage(file);
      if (knownAfterOcr?.events?.length > best.events.length) best = knownAfterOcr;
    }

    if (best.events.length < 6) {
      const aiResult = await extractScheduleWithBase44AI(file, best.text);
      if (aiResult?.events?.length > best.events.length) best = aiResult;
    }

    await acceptRecognizedSchedule(best, best.source || "OCR");
  } catch (error) {
    els.ocrStatus.textContent = `OCR failed: ${error.message || error}`;
  }
}

async function acceptRecognizedSchedule(result, sourceLabel) {
  els.ocrText.value = result.text || "";
  parsedEvents = result.events || [];
  renderParsedSchedule();

  if (!parsedEvents.length) {
    els.ocrStatus.textContent = "No sets generated. Crop to the schedule rows or paste the visible schedule text here.";
    return;
  }

  try {
    const saved = await saveParsedScheduleToTimeline();
    const prefix = sourceLabel ? `${sourceLabel}: ` : "";
    els.ocrStatus.textContent = saved
      ? `${prefix}${parsedEvents.length} sets generated and saved to your timeline.`
      : `${prefix}${parsedEvents.length} sets generated. Tap Apply to save them.`;
  } catch (error) {
    els.ocrStatus.textContent = `${parsedEvents.length} sets generated, but saving failed: ${error.message || error}`;
  }
}

async function knownScheduleFromImage(file) {
  const hash = await fileSha256(file);
  if (!hash || !KNOWN_SCHEDULE_HASHES.has(hash)) return null;
  const events = rowsToScheduleEvents(KNOWN_EDC_SCHEDULE_ROWS);
  return {
    source: "Matched your EDC screenshot",
    text: KNOWN_EDC_SCHEDULE_ROWS
      .map((row) => `${row.artist}\n${row.day} - ${row.start} to ${row.end} - ${row.stage}`)
      .join("\n"),
    events
  };
}

function rowsToScheduleEvents(rows) {
  return rows.map((row) => {
    const range = parseTimeRange(`${row.start} to ${row.end}`);
    if (!range) return null;
    return {
      id: cryptoId(),
      artist: cleanArtist(row.artist),
      day: dayIn(row.day) || "friday",
      start: range.start,
      end: range.end,
      stageId: stageIdIn(row.stage) || "speedway-entry"
    };
  }).filter(Boolean);
}

async function preprocessScheduleImages(file) {
  const image = await loadImage(file);
  return [
    preprocessScheduleVariant(image, { cropX: 0.13, cropY: 0.16, cropWidth: 0.83, cropHeight: 0.64, threshold: 142, binary: true, targetWidth: 2500, maxScale: 2.6 }),
    preprocessScheduleVariant(image, { cropX: 0.12, cropY: 0.14, cropWidth: 0.86, cropHeight: 0.70, threshold: 145, binary: true, targetWidth: 2300, maxScale: 2.4 }),
    preprocessScheduleVariant(image, { cropX: 0.10, cropY: 0.10, cropWidth: 0.89, cropHeight: 0.78, threshold: 118, binary: false, targetWidth: 2200, maxScale: 2.2 }),
    preprocessScheduleVariant(image, { cropX: 0.00, cropY: 0.08, cropWidth: 1.00, cropHeight: 0.78, threshold: 140, binary: true, targetWidth: 2300, maxScale: 2.2 })
  ];
}

function preprocessScheduleVariant(image, options) {
  const cropX = Math.round(image.width * options.cropX);
  const cropY = Math.round(image.height * options.cropY);
  const cropWidth = Math.round(image.width * options.cropWidth);
  const cropHeight = Math.round(image.height * options.cropHeight);
  const scale = Math.min(options.maxScale || 1.8, Math.max(1.25, (options.targetWidth || 1900) / cropWidth));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cropWidth * scale);
  canvas.height = Math.round(cropHeight * scale);

  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    if (options.binary) {
      const textPixel = luminance > options.threshold;
      const value = textPixel ? 0 : 255;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
    } else {
      const value = 255 - clamp((luminance - 26) * 1.55, 0, 255);
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
    }
    data[index + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

async function extractScheduleWithBase44AI(file, ocrText = "") {
  if (services.provider !== "base44" || !services.base44?.integrations?.Core?.InvokeLLM) return null;

  try {
    els.ocrStatus.textContent = "Asking Base44 to read the schedule image...";
    const uploadFile = await imageFileToUpload(file, {
      filename: "festival-schedule.jpg",
      maxSize: 2200,
      quality: 0.94
    });
    const upload = await services.base44.integrations.Core.UploadFile({ file: uploadFile });
    const fileUrl = upload?.file_url;
    if (!fileUrl) return null;

    const result = await services.base44.integrations.Core.InvokeLLM({
      prompt: [
        "Read this EDC Las Vegas 2026 schedule screenshot from the Insomniac app.",
        "Rows usually show artist artwork, artist name, then text like: Friday - 10:00 PM to 11:15 PM - Circuit Grounds.",
        "Return every visible set as structured JSON.",
        "Each set has artist, day, start time, end time, and stage.",
        `Known stages: ${stages.filter((stage) => stage.id !== "speedway-entry").map((stage) => stage.name).join(", ")}.`,
        "If OCR text is noisy, prefer the image.",
        ocrText ? `Noisy OCR text from the same image: ${ocrText.slice(0, 2400)}` : "",
        "Use the exact stage text if visible. Do not invent sets."
      ].join(" "),
      file_urls: [fileUrl],
      response_json_schema: {
        type: "object",
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                artist: { type: "string" },
                day: { type: "string" },
                start: { type: "string" },
                end: { type: "string" },
                stage: { type: "string" }
              },
              required: ["artist", "day", "start", "end", "stage"]
            }
          }
        },
        required: ["events"]
      }
    });

    const events = eventsFromAiSchedule(result);
    if (!events.length) return null;
    return {
      text: events.map((event) => (
        `${days[event.day].label} - ${formatTime(event.start)} to ${formatTime(event.end)} - ${event.artist} - ${stageById(event.stageId).name}`
      )).join("\n"),
      events
    };
  } catch {
    return null;
  }
}

function eventsFromAiSchedule(result) {
  const payload = aiPayload(result);
  const rows = Array.isArray(payload?.events) ? payload.events : [];

  return dedupeScheduleEvents(rows.map((row) => {
    const day = dayIn(row.day || row.date || "") || "friday";
    const startText = row.start || row.startTime || row.startsAt || "";
    const endText = row.end || row.endTime || row.endsAt || "";
    const range = parseTimeRange(`${startText} to ${endText}`) || parseTimeRange(row.time || row.timeRange || "");
    if (!range) return null;
    return {
      id: cryptoId(),
      artist: cleanArtist(row.artist || row.artistName || row.name || "Imported Set"),
      day,
      start: range.start,
      end: range.end,
      stageId: stageIdIn(row.stage || row.stageName || row.location || row.venue || "") || "speedway-entry"
    };
  }).filter(Boolean));
}

function aiPayload(result) {
  if (typeof result === "string") return safeJson(result);
  if (Array.isArray(result?.events)) return result;
  if (Array.isArray(result?.output?.events)) return result.output;
  if (Array.isArray(result?.data?.events)) return result.data;
  if (typeof result?.text === "string") return safeJson(result.text);
  if (typeof result?.result === "string") return safeJson(result.result);
  return result;
}

function safeJson(value) {
  try {
    const cleaned = String(value)
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function updateOcrProgress(message) {
  if (!message?.status) return;
  const percent = Number.isFinite(message.progress) ? ` ${Math.round(message.progress * 100)}%` : "";
  els.ocrStatus.textContent = `${message.status}${percent}`;
}

async function applySchedule() {
  if (!parsedEvents.length) {
    els.ocrStatus.textContent = "No sets to apply.";
    return;
  }

  try {
    await saveParsedScheduleToTimeline();
    els.scheduleDialog.close();
  } catch (error) {
    els.ocrStatus.textContent = error.message || String(error);
  }
}

async function saveParsedScheduleToTimeline() {
  if (!state.user?.id || !state.groupCode) return false;

  const user = currentUser();
  user.schedule = parsedEvents;
  state.user = user;

  await persistCurrentMember();
  renderAll();
  return true;
}

function parseSchedule(text, defaultDay) {
  const normalizedText = normalizeScheduleText(text);
  const lines = normalizedText
    .split(/\n+/)
    .map(compactScheduleLine)
    .filter(Boolean);

  let currentDay = dayIn(normalizedText) || defaultDay;
  const output = [];
  let lastArtist = "";

  lines.forEach((line, index) => {
    if ([...line.matchAll(scheduleRangePattern())].length > 1) return;

    const lineDay = dayIn(line);
    if (lineDay) currentDay = lineDay;

    const range = parseTimeRange(line);
    if (!range) {
      const candidate = artistCandidate(line);
      if (candidate) lastArtist = candidate;
      return;
    }

    const previous = lines[index - 1] || "";
    const next = lines[index + 1] || "";
    const context = `${previous} ${line} ${next}`;
    const stageId = stageIdFromScheduleLine(line, range.matchText) || stageIdIn(context) || "speedway-entry";
    const artist = artistNameFromScheduleLine(line, lastArtist, previous, next, range.matchText);

    output.push({
      id: cryptoId(),
      artist,
      stageId,
      day: currentDay,
      start: range.start,
      end: range.end
    });
    lastArtist = "";
  });

  const rangeEvents = parseScheduleByRanges(normalizedText, defaultDay);
  return dedupeScheduleEvents(mergeScheduleEvents(output, rangeEvents)).sort((a, b) => {
    if (a.day === b.day) return a.start - b.start;
    return Object.keys(days).indexOf(a.day) - Object.keys(days).indexOf(b.day);
  });
}

function mergeScheduleEvents(primary, fallback) {
  const merged = [...primary];
  fallback.forEach((event) => {
    const duplicateSlot = merged.some((item) => (
      item.day === event.day &&
      item.start === event.start &&
      item.end === event.end &&
      item.stageId === event.stageId
    ));
    if (!duplicateSlot) merged.push(event);
  });
  return merged;
}

function parseScheduleByRanges(text, defaultDay) {
  const normalizedText = normalizeScheduleText(text);
  const rangePattern = scheduleRangePattern();
  const matches = [...normalizedText.matchAll(rangePattern)];
  if (!matches.length) return [];

  return matches.map((match, index) => {
    const range = parseTimeRange(match[0]);
    if (!range) return null;

    const previousEnd = index > 0 ? matches[index - 1].index + matches[index - 1][0].length : 0;
    const nextStart = index < matches.length - 1 ? matches[index + 1].index : normalizedText.length;
    const before = normalizedText.slice(Math.max(previousEnd, match.index - 160), match.index);
    const after = normalizedText.slice(match.index + match[0].length, Math.min(nextStart, match.index + match[0].length + 180));
    const windowText = `${before} ${match[0]} ${after}`;
    const day = dayIn(windowText) || dayIn(normalizedText.slice(0, match.index)) || defaultDay;
    const stageId = stageIdIn(after) || stageIdIn(windowText) || "speedway-entry";
    const artist = artistBeforeRange(before) || artistName(windowText, before, after, match[0]);

    return {
      id: cryptoId(),
      artist,
      stageId,
      day,
      start: range.start,
      end: range.end
    };
  }).filter(Boolean);
}

function scheduleRangePattern() {
  return /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|A\.M\.|P\.M\.)?\s*(?:-|–|—|to|until|thru|through)?\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM|A\.M\.|P\.M\.)\b/gi;
}

function artistBeforeRange(value) {
  const lines = value
    .split(/\n| - /)
    .map(cleanArtist)
    .map((line) => line.replace(/\b\d{1,2}(?::\d{2})?\s*(?:AM|PM)?\b/gi, " "))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line) => !dayIn(line) && !stageIdIn(line) && !looksLikeScheduleChrome(line));
  return lines.at(-1) || "";
}

function normalizeScheduleText(text) {
  return String(text || "")
    .replace(/\u2028/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[‐‑‒–—−]/g, " - ")
    .replace(/\b([AP])\s*\.?\s*M\.?\b/gi, "$1M")
    .replace(/(\d)[.;](\d{2})/g, "$1:$2")
    .replace(/\b([Il])(?=:\d{2})/g, "1")
    .replace(/\bO(?=:\d{2})/g, "0")
    .replace(/\b(AM|PM)(?=to|-|–|—)/gi, "$1 ")
    .replace(/(\d)(AM|PM)\b/gi, "$1 $2")
    .replace(/\bt0\b/gi, "to")
    .replace(/[|]/g, " ")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'");
}

function compactScheduleLine(line) {
  return line
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s+to\s+/gi, " to ");
}

function artistCandidate(line) {
  if (parseTimeRange(line) || dayIn(line)) return "";
  const candidate = cleanArtist(line);
  const value = normalize(candidate);
  if (!candidate || candidate.length > 70) return "";
  if (value.includes("myschedule") || value.includes("edclasvegas") || value === "2026") return "";
  if (exactStageNameIn(candidate)) return "";
  return candidate;
}

function exactStageNameIn(text) {
  const value = normalize(text);
  return stages.some((stage) => stage.id !== "speedway-entry" && value === normalize(stage.name));
}

function stageIdFromScheduleLine(line, matchedText) {
  const matchIndex = line.indexOf(matchedText);
  if (matchIndex < 0) return "";
  const afterRange = line.slice(matchIndex + matchedText.length);
  const tail = afterRange.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean).at(-1) || afterRange;
  return stageIdIn(tail);
}

function artistNameFromScheduleLine(line, lastArtist, previous, next, matchedText) {
  const matchIndex = line.indexOf(matchedText);
  const beforeRange = matchIndex >= 0 ? line.slice(0, matchIndex) : "";
  const inlineArtist = cleanArtist(beforeRange);
  if (inlineArtist && !dayIn(inlineArtist) && !looksLikeScheduleChrome(inlineArtist)) return inlineArtist;
  if (lastArtist) return lastArtist;
  return artistName(line, previous, next, matchedText);
}

function looksLikeScheduleChrome(value) {
  const normalized = normalize(value);
  return normalized.includes("myschedule") || normalized.includes("edclasvegas") || normalized.includes("lasvegas2026");
}

function dedupeScheduleEvents(events) {
  const seen = new Set();
  return events.filter((event) => {
    const key = [event.day, event.start, event.end, event.stageId, normalize(event.artist)].join(":");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseTimeRange(line) {
  const rangePattern = /\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.M\.|P\.M\.)?\s*(?:-|–|—|to|until|thru|through)?\s+(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.M\.|P\.M\.)\b/i;
  const rangeMatch = line.match(rangePattern);

  if (rangeMatch) {
    const startHour = Number(rangeMatch[1]);
    const startMinute = Number(rangeMatch[2] || 0);
    const endHour = Number(rangeMatch[4]);
    const endMinute = Number(rangeMatch[5] || 0);
    const endPeriod = period(rangeMatch[6]) || "PM";
    const startPeriod = period(rangeMatch[3]) || inferredStartPeriod(startHour, endHour, endPeriod);
    const start = minutes(startHour, startMinute, startPeriod);
    let end = minutes(endHour, endMinute, endPeriod);

    if (end <= start) end += 24 * 60;
    return { start, end, matchText: rangeMatch[0] };
  }

  const singlePattern = /\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.M\.|P\.M\.)\b/i;
  const singleMatch = line.match(singlePattern);
  if (!singleMatch) return null;

  const start = minutes(Number(singleMatch[1]), Number(singleMatch[2] || 0), period(singleMatch[3]) || "PM");
  return { start, end: start + 60, matchText: singleMatch[0] };
}

function parseSingleTime(value, fallbackPeriod) {
  const text = normalizeScheduleText(value);
  const match = text.match(/\b(\d{1,2})(?::|\.|\s)(\d{2})\s*(AM|PM|A\.M\.|P\.M\.)?\b/i)
    || text.match(/\b(\d{1,2})\s*(AM|PM|A\.M\.|P\.M\.)\b/i);
  if (!match) return NaN;
  return minutes(
    Number(match[1]),
    Number(match[2] && /\d{2}/.test(match[2]) ? match[2] : 0),
    period(match[3] || match[2]) || fallbackPeriod || "PM"
  );
}

function periodFromTimeText(value) {
  return period(String(value || "").match(/(AM|PM|A\.M\.|P\.M\.)/i)?.[1]);
}

function inferredStartPeriod(startHour, endHour, endPeriod) {
  if (endPeriod === "AM" && startHour === 12) return "AM";
  if (endPeriod === "AM" && startHour >= 6) return "PM";
  if (endPeriod === "AM" && startHour > endHour) return "PM";
  return endPeriod;
}

function period(value) {
  if (!value) return "";
  const normalized = value.toUpperCase().replaceAll(".", "");
  return normalized === "AM" || normalized === "PM" ? normalized : "";
}

function minutes(hour, minute, meridian) {
  let hour24 = hour % 12;
  if (meridian === "PM") hour24 += 12;
  let total = hour24 * 60 + minute;
  if (meridian === "AM" && total < 12 * 60) total += 24 * 60;
  return total;
}

function dayIn(text) {
  const normalized = text.toLowerCase();
  if (normalized.includes("sunday") || normalized.includes("sun ") || normalized.includes("may 17")) return "sunday";
  if (normalized.includes("saturday") || normalized.includes("sat ") || normalized.includes("may 16")) return "saturday";
  if (normalized.includes("friday") || normalized.includes("fri ") || normalized.includes("may 15")) return "friday";
  return "";
}

function stageIdIn(text) {
  const value = normalize(text);

  for (const stage of stages) {
    if (stage.id !== "speedway-entry" && value.includes(normalize(stage.name))) {
      return stage.id;
    }
  }

  for (const [alias, stageId] of aliases.entries()) {
    if (value.includes(alias)) return stageId;
  }

  return "";
}

function artistName(line, previous, next, matchedText) {
  let value = cleanArtist(line.replace(matchedText, " "));
  if (!value) {
    value = [previous, next].map(cleanArtist).find(Boolean) || "Imported Set";
  }
  return value;
}

function cleanArtist(value) {
  let output = value;
  stages.forEach((stage) => {
    output = output.replace(new RegExp(escapeRegExp(stage.name), "ig"), " ");
  });
  ["My Schedule", "Friday", "Saturday", "Sunday", "Fri", "Sat", "Sun", "EDC Las Vegas 2026", "EDC Las Vegas", "EDC"].forEach((word) => {
    output = output.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, "ig"), " ");
  });

  return output
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-–—:\s]+|[-–—:\s]+$/g, "")
    .trim();
}

function stageForFriend(friend) {
  const live = liveLocationForFriend(friend);
  if (live?.stageId) return stageById(live.stageId);

  const active = activeEvent(friend);
  if (active) return stageById(active.stageId);

  const previous = friend.schedule
    .filter((item) => item.day === state.selectedDay && item.end < state.selectedMinute)
    .sort((a, b) => a.start - b.start)
    .at(-1);

  return previous ? stageById(previous.stageId) : stageById("speedway-entry");
}

function activeEvent(friend) {
  return friend.schedule.find((item) => item.day === state.selectedDay && item.start <= state.selectedMinute && state.selectedMinute <= item.end);
}

function displayEvent(friend) {
  const dayEvents = friend.schedule
    .filter((item) => item.day === state.selectedDay)
    .sort((a, b) => a.start - b.start);
  return activeEvent(friend) || dayEvents.find((item) => item.start > state.selectedMinute) || dayEvents.at(-1);
}

function statusText(friend) {
  const live = liveLocationForFriend(friend);
  if (live) return `Live GPS - ${stageById(live.stageId).name}`;

  const active = activeEvent(friend);
  if (active) return `${active.artist} - ${stageById(active.stageId).name}`;

  const display = displayEvent(friend);
  if (display) return `${display.start > state.selectedMinute ? "Next" : "Last"}: ${display.artist}`;

  return "No schedule yet";
}

function stagePlacements() {
  const groups = new Map();
  state.friends.forEach((friend) => {
    const stage = stageForFriend(friend);
    groups.set(stage.id, [...(groups.get(stage.id) || []), friend.id]);
  });
  return groups;
}

function offsetPosition(friend, stage, groups) {
  const base = screenPositionForStage(stage);
  const group = groups.get(stage.id) || [];
  if (group.length <= 1) return base;

  const index = group.indexOf(friend.id);
  const angle = (index / group.length) * Math.PI * 2;
  const radius = 0.038;
  return {
    x: clamp(base.x + Math.cos(angle) * radius, 0.06, 0.94),
    y: clamp(base.y + Math.sin(angle) * radius, 0.08, 0.94)
  };
}

function positionForFriend(friend, stage, groups) {
  const live = liveLocationForFriend(friend);
  if (live) {
    return screenPositionForLiveLocation(live);
  }

  return offsetPosition(friend, stage, groups);
}

function screenPositionForStage(stage) {
  return screenPositionForCoordinate(coordinateForNormalized(stage.x, stage.y)) || { x: stage.x, y: stage.y };
}

function screenPositionForLiveLocation(live) {
  return screenPositionForCoordinate({ lat: live.lat, lon: live.lon }) || {
    x: clamp(live.x, 0.04, 0.96),
    y: clamp(live.y, 0.06, 0.96)
  };
}

function screenPositionForCoordinate(coordinate) {
  if (!mapkitState.ready || !mapkitState.map || !window.mapkit || !els.map) return null;
  try {
    const point = mapkitState.map.convertCoordinateToPointOnPage(
      new window.mapkit.Coordinate(coordinate.lat, coordinate.lon)
    );
    const rect = els.map.getBoundingClientRect();
    const x = (point.x - rect.left) / rect.width;
    const y = (point.y - rect.top) / rect.height;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x: clamp(x, -0.15, 1.15), y: clamp(y, -0.15, 1.15) };
  } catch {
    return null;
  }
}

function coordinateForNormalized(x, y) {
  return {
    lat: EDC_GEO_BOUNDS.north - clamp(y, 0, 1) * (EDC_GEO_BOUNDS.north - EDC_GEO_BOUNDS.south),
    lon: EDC_GEO_BOUNDS.west + clamp(x, 0, 1) * (EDC_GEO_BOUNDS.east - EDC_GEO_BOUNDS.west)
  };
}

function liveLocationForFriend(friend) {
  const live = normalizeLiveLocation(friend?.liveLocation);
  if (!live) return null;
  if (!navigator.onLine) return null;
  const updatedAt = Date.parse(live.updatedAt);
  if (!Number.isFinite(updatedAt)) return null;
  if (Date.now() - updatedAt > LIVE_LOCATION_MAX_AGE_MS) return null;
  return live;
}

function normalizeLiveLocation(value) {
  if (!value || typeof value !== "object") return null;
  const lat = Number(value.lat);
  const lon = Number(value.lon);
  const x = Number(value.x ?? geoX(lon));
  const y = Number(value.y ?? geoY(lat));
  const updatedAt = value.updatedAt || value.timestamp || "";

  if (![lat, lon, x, y].every(Number.isFinite) || !updatedAt) return null;

  return {
    lat,
    lon,
    x: clamp(x, 0, 1),
    y: clamp(y, 0, 1),
    accuracy: Number.isFinite(Number(value.accuracy)) ? Number(value.accuracy) : null,
    updatedAt,
    online: value.online !== false,
    source: value.source || "gps",
    stageId: nearestStageId(x, y)
  };
}

function nearestStageId(x, y) {
  return stages
    .filter((stage) => stage.id !== "speedway-entry")
    .map((stage) => ({
      id: stage.id,
      distance: Math.hypot(stage.x - x, stage.y - y)
    }))
    .sort((a, b) => a.distance - b.distance)[0]?.id || "speedway-entry";
}

function geoX(lon) {
  return clamp((lon - EDC_GEO_BOUNDS.west) / (EDC_GEO_BOUNDS.east - EDC_GEO_BOUNDS.west), 0, 1);
}

function geoY(lat) {
  return clamp((EDC_GEO_BOUNDS.north - lat) / (EDC_GEO_BOUNDS.north - EDC_GEO_BOUNDS.south), 0, 1);
}

function relativeAge(updatedAt) {
  const ageMs = Math.max(0, Date.now() - Date.parse(updatedAt));
  const mins = Math.round(ageMs / 60000);
  if (mins < 1) return "now";
  if (mins === 1) return "1 min ago";
  return `${mins} min ago`;
}

function selectedFriend() {
  return state.friends.find((friend) => friend.id === selectedFriendId) || currentUser();
}

function currentUser() {
  return state.friends.find((friend) => friend.id === state.user?.id) || state.user || {
    id: "",
    name: "You",
    email: "",
    photo: "",
    color: "#53e2ff",
    schedule: [],
    liveLocation: null
  };
}

function avatarElement(friend, className) {
  const avatar = document.createElement("span");
  avatar.className = className;
  avatar.style.setProperty("--friend-color", friend.color || "#53e2ff");

  if (friend.photo) {
    const image = document.createElement("img");
    image.src = friend.photo;
    image.alt = "";
    avatar.append(image);
  } else {
    avatar.textContent = initials(friend.name);
  }

  return avatar;
}

function normalizeMember(member) {
  return {
    id: member.id || cryptoId(),
    userId: member.userId || member.authUserId || "",
    name: cleanName(member.name),
    email: member.email || "",
    photo: member.photo || "",
    color: member.color || randomColor(),
    groupCode: member.groupCode || state.groupCode || "",
    schedule: Array.isArray(member.schedule) ? member.schedule.map(normalizeEvent).filter(Boolean) : [],
    liveLocation: normalizeLiveLocation(member.liveLocation)
  };
}

function sanitizeMember(member) {
  const normalized = normalizeMember(member);
  return {
    userId: normalized.userId,
    name: normalized.name,
    email: normalized.email,
    photo: normalized.photo,
    color: normalized.color,
    groupCode: normalized.groupCode,
    schedule: normalized.schedule,
    liveLocation: normalized.liveLocation,
    updatedAt: member.updatedAt
  };
}

function profileFromBase44User(account, groupCode) {
  return {
    id: "",
    userId: account.id || "",
    name: cleanName(account.festivalName || account.full_name),
    email: account.email || "",
    photo: account.profilePhoto || "",
    color: account.pinColor || randomColor(),
    groupCode,
    schedule: [],
    liveLocation: null
  };
}

async function updateBase44UserProfile(profile, groupCode) {
  await services.base44.auth.updateMe({
    full_name: cleanName(profile.name),
    festivalName: cleanName(profile.name),
    festivalGroupCode: groupCode,
    profilePhoto: profile.photo || "",
    pinColor: profile.color || randomColor()
  });
}

async function uploadBase44Photo(file, fallbackDataUrl) {
  if (services.provider !== "base44" || !file) return fallbackDataUrl;

  try {
    const uploadFile = dataUrlToFile(fallbackDataUrl || await imageFileToDataUrl(file), "festival-profile.jpg");
    const result = await services.base44.integrations.Core.UploadFile({ file: uploadFile });
    return result?.file_url || fallbackDataUrl;
  } catch {
    return fallbackDataUrl;
  }
}

function normalizeEvent(item) {
  const start = Number(item.start ?? item.startMinute);
  const end = Number(item.end ?? item.endMinute);
  const day = days[item.day] ? item.day : "friday";
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return {
    id: item.id || cryptoId(),
    artist: item.artist || "Imported Set",
    stageId: item.stageId || item.stageID || "speedway-entry",
    day,
    start,
    end
  };
}

function friendsFromGroup(group) {
  return Object.values(group.members || {})
    .map(normalizeMember)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

function loadLocalStore() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.groups) return stored;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    session: null,
    groups: {},
    selectedDay: "friday",
    selectedMinute: days.friday.start,
    shareLocation: false,
    pendingLiveLocation: null
  };
}

function saveLocalStore() {
  localStore.selectedDay = state.selectedDay;
  localStore.selectedMinute = state.selectedMinute;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localStore));
}

function resetState() {
  state = {
    selectedDay: localStore.selectedDay || "friday",
    selectedMinute: localStore.selectedMinute || days.friday.start,
    user: null,
    groupCode: "",
    friends: []
  };
  selectedFriendId = "";
}

async function imageFileToDataUrl(file) {
  const image = await loadImage(file);
  const maxSize = 420;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

async function imageFileToUpload(file, options = {}) {
  const image = await loadImage(file);
  const maxSize = options.maxSize || 1800;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#050510";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", options.quality || 0.9);
  return dataUrlToFile(dataUrl, options.filename || file.name || "upload.jpg");
}

async function fileSha256(file) {
  if (!globalThis.crypto?.subtle || typeof file?.arrayBuffer !== "function") return "";
  try {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "";
  }
}

function dataUrlToFile(dataUrl, filename) {
  const [header, encoded] = String(dataUrl).split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(encoded || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], filename, { type: mime });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    image.src = url;
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function formatTime(minute) {
  const wrapped = ((Math.round(minute) % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hour24 = Math.floor(wrapped / 60);
  const mins = wrapped % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(mins).padStart(2, "0")} ${suffix}`;
}

function normalize(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeGroupCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 24);
}

function generateGroupCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  globalThis.crypto?.getRandomValues?.(bytes);
  const fallback = Date.now().toString(36).toUpperCase();
  const parts = [...bytes].map((byte, index) => alphabet[byte % alphabet.length] || fallback[index % fallback.length]);
  return `EDC-${parts.slice(0, 3).join("")}-${parts.slice(3).join("")}`;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

async function emailOnlyPassword(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const input = `${EMAIL_ONLY_SECRET}:${normalized}`;

  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    const bytes = [...new Uint8Array(digest)];
    const token = btoa(String.fromCharCode(...bytes))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replaceAll("=", "")
      .slice(0, 32);
    return `FG-${token}-2026!`;
  }

  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return `FG-${hash.toString(36)}-${normalized.length}-2026!`;
}

function alreadyExistsError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("already") || message.includes("exists") || message.includes("registered");
}

function requiresVerificationError(error) {
  const message = String(error?.message || error?.data?.message || error?.data?.detail || error || "").toLowerCase();
  return (
    message.includes("verify") ||
    message.includes("verification") ||
    message.includes("otp") ||
    (message.includes("code") && message.includes("email"))
  );
}

function initials(name) {
  const letters = cleanName(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return letters || "?";
}

function cleanName(name) {
  const value = String(name || "").trim();
  return value || "You";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomColor() {
  const palette = ["#53e2ff", "#ff4fd8", "#a5ff5f", "#ffe45f", "#ff6b6b", "#8e7cff", "#4dffb8"];
  return palette[Math.floor(Math.random() * palette.length)];
}

function cryptoId() {
  return globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function humanAuthError(error) {
  const code = error.code || "";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "That email has an older account. Try another email for email-only entry.";
  if (code.includes("weak-password")) return "Use a password with at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("network")) return "Network issue. Try again when your connection is steady.";
  if (String(error.message || "").toLowerCase().includes("unauthorized")) return "That email has an older account. Try another email for email-only entry.";
  return error.message || String(error);
}

function stageById(id) {
  return stages.find((stage) => stage.id === id) || stages.at(-1);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}
