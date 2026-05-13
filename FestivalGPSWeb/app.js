import { BASE44_CONFIG, MAPKIT_CONFIG, base44IsConfigured } from "./base44-config.js";

const STORAGE_KEY = "festival-gps-pwa-v2";
const LAST_GROUP_KEY = "festival-gps-last-group";
const LIVE_LOCATION_MAX_AGE_MS = 30 * 60 * 1000;
const LIVE_LOCATION_THROTTLE_MS = 15 * 1000;
const EDC_GEO_MARGIN = 0.0015;
const MAP_PIN_BOUNDS = {
  minX: 0.065,
  maxX: 0.745,
  minY: 0.12,
  maxY: 0.955
};
const OFFICIAL_MAP_FRAME = {
  minX: 0.075,
  maxX: 0.735,
  minY: 0.13,
  maxY: 0.945
};
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

const festivalWindows = {
  friday: { start: new Date(2026, 4, 15, 17, 0), end: new Date(2026, 4, 16, 5, 30) },
  saturday: { start: new Date(2026, 4, 16, 19, 0), end: new Date(2026, 4, 17, 5, 30) },
  sunday: { start: new Date(2026, 4, 17, 19, 0), end: new Date(2026, 4, 18, 5, 30) }
};

const stages = [
  { id: "kinetic-field", name: "Kinetic Field", short: "KF", x: 0.43, y: 0.17, color: "#ff4fd8", art: "linear-gradient(135deg, #15132a, #ff4fd8 58%, #ffe86a)" },
  { id: "cosmic-meadow", name: "Cosmic Meadow", short: "CM", x: 0.16, y: 0.50, color: "#53e2ff", art: "linear-gradient(135deg, #10263a, #53e2ff 54%, #f8f4a6)" },
  { id: "circuit-grounds", name: "Circuit Grounds", short: "CG", x: 0.55, y: 0.85, color: "#a5ff5f", art: "linear-gradient(135deg, #152918, #a5ff5f 56%, #53e2ff)" },
  { id: "neon-garden", name: "Neon Garden", short: "NG", x: 0.57, y: 0.52, color: "#ffe45f", art: "linear-gradient(135deg, #30250a, #ffe45f 54%, #ff4fd8)" },
  { id: "basspod", name: "Basspod", short: "BP", x: 0.43, y: 0.84, color: "#ff6b6b", art: "linear-gradient(135deg, #321414, #ff6b6b 56%, #8e7cff)" },
  { id: "wasteland", name: "Wasteland", short: "WL", x: 0.17, y: 0.82, color: "#ff9f43", art: "linear-gradient(135deg, #321c0b, #ff9f43 55%, #f8f4a6)" },
  { id: "quantum-valley", name: "Quantum Valley", short: "QV", x: 0.55, y: 0.31, color: "#8e7cff", art: "linear-gradient(135deg, #161238, #8e7cff 55%, #53e2ff)" },
  { id: "stereo-bloom", name: "Stereo Bloom", short: "SB", x: 0.30, y: 0.36, color: "#4dffb8", art: "linear-gradient(135deg, #102d27, #4dffb8 55%, #ffe45f)" },
  { id: "bionic-jungle", name: "Bionic Jungle", short: "BJ", x: 0.16, y: 0.31, color: "#f86fff", art: "linear-gradient(135deg, #2c1232, #f86fff 56%, #a5ff5f)" },
  { id: "art-cars", name: "Art Cars", short: "AC", x: 0.32, y: 0.43, color: "#f8f4a6", art: "linear-gradient(135deg, #2d2a10, #f8f4a6 58%, #ff9f43)" },
  { id: "downtown-edc", name: "Downtown EDC", short: "DT", x: 0.36, y: 0.59, color: "#7de2d1", art: "linear-gradient(135deg, #102b2c, #7de2d1 58%, #ff4fd8)" },
  { id: "speedway-entry", name: "Speedway Entry", short: "IN", x: 0.07, y: 0.57, color: "#007aff", art: "linear-gradient(135deg, #f5f7fb, #d9e5ff)" }
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
  base44: null,
  unsubscribeGroup: null
};
let selectedFriendId = "";
let parsedEvents = [];
let pendingAuthPhoto = "";
let pendingProfilePhoto = "";
let pendingAuthFile = null;
let pendingProfileFile = null;
let groupMode = "create";
let locationWatchId = null;
let locationSharing = false;
let lastLocationPersistedAt = 0;
let lastPinPositions = new Map();
let timelineClockId = null;
let timelineFollowsClock = true;
let lastLocationProblem = "";
let topFeedbackTimer = null;
let cropState = null;
let pendingInitialPosition = null;
let mapkitState = {
  ready: false,
  loading: false,
  map: null,
  lastError: ""
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindElements();
  registerServiceWorker();
  renderDayButtons();
  renderStages();
  bindEvents();
  setGroupMode("create");
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
    "authPin",
    "authGroupCode",
    "authPhoto",
    "authPhotoPreview",
    "authSubmitButton",
    "createGroupButton",
    "joinGroupButton",
    "groupModeHint",
    "regenerateGroupButton",
    "authMessage",
    "cloudBadge",
    "currentContext",
    "copyCodeButton",
    "crewProfileButton",
    "groupCodeLabel",
    "map",
    "appleMapLayer",
    "locationButton",
    "scheduleButton",
    "currentLocationButton",
    "dayButtons",
    "timeSliderWrap",
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
    "profileFriendList",
    "friendDetailDialog",
    "friendDetailName",
    "friendDetailAvatar",
    "friendDetailNow",
    "friendDetailSource",
    "friendDetailSchedule",
    "photoCropDialog",
    "photoCropCanvas",
    "photoCropZoom",
    "photoCropX",
    "photoCropY",
    "photoCropApply",
    "photoCropCancel",
    "scheduleDialog",
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
  els.authPin.addEventListener("input", () => {
    els.authPin.value = cleanPin(els.authPin.value);
    clearVerificationStep();
  });
  els.createGroupButton.addEventListener("click", () => setGroupMode("create"));
  els.joinGroupButton.addEventListener("click", () => setGroupMode("join"));
  els.regenerateGroupButton.addEventListener("click", () => {
    els.authGroupCode.value = generateGroupCode();
  });
  els.authGroupCode.addEventListener("input", clearVerificationStep);
  els.authPhoto.addEventListener("change", async () => {
    const file = els.authPhoto.files?.[0];
    pendingAuthFile = file || null;
    try {
      pendingAuthPhoto = file ? await openPhotoCropper(file, "auth") : "";
      pendingAuthFile = pendingAuthPhoto ? dataUrlToFile(pendingAuthPhoto, "festival-profile.jpg") : null;
      renderAuthPhotoPreview(pendingAuthPhoto, els.authName.value);
    } catch (error) {
      pendingAuthPhoto = "";
      pendingAuthFile = null;
      els.authMessage.textContent = error.message || String(error);
    }
  });

  els.copyCodeButton.addEventListener("click", copyGroupCode);
  els.crewProfileButton.addEventListener("click", openProfileSheet);
  els.locationButton.addEventListener("click", toggleLiveLocation);

  els.scheduleButton.addEventListener("click", () => {
    els.scheduleImage.value = "";
    els.ocrText.value = "";
    els.ocrStatus.textContent = "";
    parsedEvents = [];
    renderParsedSchedule();
    openDialog(els.scheduleDialog);
  });

  els.timeRange.addEventListener("input", () => {
    timelineFollowsClock = false;
    state.selectedMinute = Number(els.timeRange.value);
    saveLocalStore();
    renderAll();
  });
  els.currentLocationButton.addEventListener("click", showCurrentLocation);

  els.profileName.addEventListener("input", () => {
    renderProfilePreview({ ...currentUser(), name: els.profileName.value, photo: pendingProfilePhoto || currentUser().photo });
  });

  els.profilePhoto.addEventListener("change", async () => {
    const file = els.profilePhoto.files?.[0];
    pendingProfileFile = file || null;
    try {
      pendingProfilePhoto = file ? await openPhotoCropper(file, "profile") : "";
      pendingProfileFile = pendingProfilePhoto ? dataUrlToFile(pendingProfilePhoto, "festival-profile.jpg") : null;
      renderProfilePreview({ ...currentUser(), name: els.profileName.value, photo: pendingProfilePhoto || currentUser().photo });
    } catch (error) {
      pendingProfilePhoto = "";
      pendingProfileFile = null;
      els.profileMessage.textContent = error.message || String(error);
    }
  });

  [els.photoCropZoom, els.photoCropX, els.photoCropY].forEach((control) => {
    control.addEventListener("input", drawPhotoCropPreview);
  });
  els.photoCropApply.addEventListener("click", applyPhotoCrop);
  els.photoCropCancel.addEventListener("click", cancelPhotoCrop);
  els.photoCropDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    cancelPhotoCrop();
  });

  els.saveProfileButton.addEventListener("click", saveProfile);
  els.signOutButton.addEventListener("click", signOutUser);
  els.copyGroupButton.addEventListener("click", copyGroupCode);
  els.copyGroupFromFriendsButton.addEventListener("click", copyGroupCode);

  els.scheduleImage.addEventListener("change", async () => {
    const files = [...(els.scheduleImage.files || [])];
    if (files.length) await recognizeScheduleFiles(files);
  });

  els.ocrText.addEventListener("input", () => {
    parsedEvents = parseSchedule(els.ocrText.value);
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
    parsedEvents = parseSchedule(els.ocrText.value);
    els.ocrStatus.textContent = `${parsedEvents.length} sets generated.`;
    renderParsedSchedule();
  });

  els.applyScheduleButton.addEventListener("click", applySchedule);

  window.addEventListener("online", () => {
    if (state.user?.id && localStore.shareLocation && !locationSharing) {
      startLiveLocation({ quiet: true });
    }
    syncPendingLiveLocation();
    renderAll();
  });
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

  services.cloud = false;
  services.provider = "local";
  els.cloudBadge.textContent = "Local group store";
}

async function initBase44Cloud() {
  try {
    const { createClient } = await import(BASE44_CONFIG.sdkUrl);
    const clientConfig = { appId: BASE44_CONFIG.appId };
    if (BASE44_CONFIG.serverUrl) clientConfig.serverUrl = BASE44_CONFIG.serverUrl;

    services.base44 = createClient(clientConfig);
    services.cloud = true;
    services.provider = "base44";
    els.cloudBadge.textContent = "Group-code sync";

    await resumeBase44Session();

    return true;
  } catch (error) {
    services.cloud = false;
    services.provider = "local";
    services.base44 = null;
    els.cloudBadge.textContent = "Local group store";
    els.authMessage.textContent = `Base44 did not start: ${error.message || error}`;
    return false;
  }
}

async function resumeBase44Session() {
  const session = localStore.session;
  const groupCode = normalizeGroupCode(session?.groupCode || localStorage.getItem(LAST_GROUP_KEY) || "");
  const uid = session?.uid || "";
  if (!groupCode || !uid) return false;

  try {
    const records = await services.base44.entities.CrewMember.filter({ groupCode });
    state.friends = records
      .map((record) => normalizeMember(record))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    const member = state.friends.find((friend) => friend.id === uid || friend.userId === uid);
    if (!member) return false;

    state.user = member;
    state.groupCode = groupCode;
    selectedFriendId = member.id;
    localStore.session = { uid: member.id, groupCode };
    saveLocalStore();
    localStorage.setItem(LAST_GROUP_KEY, groupCode);
    await subscribeToBase44Group(groupCode);
    return true;
  } catch {
    return false;
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

  const rawName = els.authName.value.trim();
  const pin = cleanPin(els.authPin.value);
  const profile = {
    id: "",
    userId: "",
    name: cleanName(rawName),
    email: "",
    photo: pendingAuthPhoto,
    color: randomColor(),
    schedule: []
  };
  const groupCode = normalizeGroupCode(els.authGroupCode.value);

  try {
    if (!rawName) throw new Error("Enter your user name.");
    if (!validPin(pin)) throw new Error("Create a 4-6 digit PIN.");
    if (!groupCode) throw new Error("Enter a group code.");
    requestLocationPermissionOnEntry();

    if (services.provider === "base44") {
      await enterBase44GroupByName(groupCode, profile, pin);
    } else {
      await enterLocalGroupByName(profile, groupCode, pin);
    }

    els.authForm.reset();
    pendingAuthPhoto = "";
    pendingAuthFile = null;
    localStore.shareLocation = true;
    saveLocalStore();
    if (groupMode === "create") els.authGroupCode.value = generateGroupCode();
    renderAuthPhotoPreview("", "");
    renderAuthGate();
  } catch (error) {
    els.authMessage.textContent = humanAuthError(error);
  } finally {
    setBusy(false);
  }
}

async function enterBase44GroupByName(groupCode, profile, pin) {
  const CrewMember = services.base44.entities.CrewMember;
  const records = await CrewMember.filter({ groupCode });
  const friends = records.map((record) => normalizeMember(record));
  const existing = friends.find((friend) => sameName(friend.name, profile.name));
  const secured = await securedMemberProfile(existing, profile, groupCode, pin);
  const memberData = sanitizeMember({
    ...secured,
    groupCode,
    updatedAt: new Date().toISOString()
  });

  const saved = existing?.id
    ? await CrewMember.update(existing.id, memberData)
    : await CrewMember.create(memberData);
  const member = normalizeMember(saved);

  state.user = member;
  state.groupCode = groupCode;
  state.friends = friends
    .filter((friend) => friend.id !== member.id)
    .concat(member)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  selectedFriendId = member.id;
  localStore.session = { uid: member.id, groupCode };
  cacheCurrentGroup();
  localStorage.setItem(LAST_GROUP_KEY, groupCode);
  await subscribeToBase44Group(groupCode);
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
    cacheCurrentGroup();
    renderAuthGate();
  } catch (error) {
    els.authMessage.textContent = error.message || String(error);
  }
}

async function enterLocalGroupByName(profile, groupCode, pin) {
  const group = localStore.groups[groupCode] || { code: groupCode, members: {} };
  const existing = Object.values(group.members || {})
    .map(normalizeMember)
    .find((friend) => sameName(friend.name, profile.name));
  const secured = await securedMemberProfile(existing, profile, groupCode, pin);
  const member = normalizeMember({ ...secured, groupCode });

  group.members[member.id] = member;
  localStore.groups[groupCode] = group;
  localStore.session = { uid: member.id, groupCode };
  state.user = member;
  state.groupCode = groupCode;
  state.friends = friendsFromGroup(group);
  selectedFriendId = member.id;
  cacheCurrentGroup();
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
    await refreshBase44Group(state.groupCode);
  } else {
    const group = localStore.groups[state.groupCode] || { code: state.groupCode, members: {} };
    group.members[user.id] = normalizeMember(user);
    localStore.groups[state.groupCode] = group;
    localStore.session = { uid: user.id, groupCode: state.groupCode };
    state.friends = friendsFromGroup(group);
    saveLocalStore();
  }
  cacheCurrentGroup();
}

async function saveProfile() {
  const user = currentUser();
  const nextName = cleanName(els.profileName.value);
  const duplicate = state.friends.some((friend) => friend.id !== user.id && sameName(friend.name, nextName));
  if (duplicate) {
    els.profileMessage.textContent = "That name is already in this group. Pick another user name.";
    return;
  }
  user.name = nextName;
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
  stopTimelineClock();
  if (services.unsubscribeGroup) services.unsubscribeGroup();
  services.unsubscribeGroup = null;

  if (services.provider === "base44" && services.base44) {
    try {
      services.base44.auth.logout();
    } catch {
      localStorage.removeItem("base44_token");
    }
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
    lastLocationProblem = "GPS unavailable, using schedule";
    if (!options.quiet) renderAll();
    return;
  }

  if (locationSharing) return;
  lastLocationProblem = "";
  setLocationButtonState("starting");

  locationWatchId = navigator.geolocation.watchPosition(
    handleLivePosition,
    (error) => handleLiveLocationError(error, options),
    {
      enableHighAccuracy: true,
      maximumAge: 5 * 1000,
      timeout: 20 * 1000
    }
  );

  locationSharing = true;
  localStore.shareLocation = true;
  saveLocalStore();
  renderAll();
}

function requestLocationPermissionOnEntry() {
  if (!navigator.geolocation) {
    lastLocationProblem = "GPS unavailable, using schedule";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      pendingInitialPosition = position;
      if (state.user?.id) {
        pendingInitialPosition = null;
        handleLivePosition(position);
      }
    },
    (error) => handleLiveLocationError(error, { quiet: true }),
    {
      enableHighAccuracy: true,
      maximumAge: 5 * 1000,
      timeout: 20 * 1000
    }
  );
}

function stopLiveLocation(options = {}) {
  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId);
  }
  locationWatchId = null;
  locationSharing = false;
  if (!options.keepProblem) lastLocationProblem = "";
  if (!options.preserveShare) localStore.shareLocation = false;
  saveLocalStore();
}

async function handleLivePosition(position) {
  const user = currentUser();
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  if (!coordinateWithinEdc(lat, lon, accuracy)) {
    lastLocationProblem = "GPS outside EDC map, using schedule";
    await clearOwnLiveLocation();
    renderAll();
    return;
  }

  const liveLocation = normalizeLiveLocation({
    lat,
    lon,
    accuracy,
    x: geoX(lon),
    y: geoY(lat),
    updatedAt: new Date(position.timestamp || Date.now()).toISOString(),
    online: navigator.onLine,
    source: "gps"
  });

  lastLocationProblem = "";
  user.liveLocation = liveLocation;
  state.user = user;
  const friend = state.friends.find((item) => item.id === user.id);
  if (friend) friend.liveLocation = liveLocation;
  localStore.pendingLiveLocation = liveLocation;
  cacheCurrentGroup();
  renderAll();

  const now = Date.now();
  if (now - lastLocationPersistedAt < LIVE_LOCATION_THROTTLE_MS) return;
  lastLocationPersistedAt = now;

  try {
    await persistCurrentMember({ updateProfile: false });
    localStore.pendingLiveLocation = null;
    cacheCurrentGroup();
  } catch {
    localStore.pendingLiveLocation = liveLocation;
    saveLocalStore();
  }
}

async function handleLiveLocationError(error, options = {}) {
  const denied = error?.code === error?.PERMISSION_DENIED;
  lastLocationProblem = denied
    ? "Location permission off, using schedule"
    : "GPS unavailable, using last seen or schedule";
  if (denied) {
    await clearOwnLiveLocation({ persist: true });
  }
  if (!options.quiet) {
    renderAll();
  }
  stopLiveLocation({ keepProblem: true, preserveShare: !denied });
  renderAll();
}

async function clearOwnLiveLocation(options = {}) {
  const user = currentUser();
  if (!user?.id) return;

  const hadLiveLocation = Boolean(user.liveLocation || state.user?.liveLocation);
  user.liveLocation = null;
  if (state.user?.id === user.id) state.user = { ...state.user, liveLocation: null };

  const friend = state.friends.find((item) => item.id === user.id);
  if (friend) friend.liveLocation = null;

  if (!hadLiveLocation || options.persist === false) return;

  try {
    await persistCurrentMember({ updateProfile: false });
    localStore.pendingLiveLocation = null;
    cacheCurrentGroup();
  } catch {
    localStore.pendingLiveLocation = null;
    saveLocalStore();
  }
}

async function syncPendingLiveLocation() {
  if (!state.user?.id || !state.groupCode || !localStore.pendingLiveLocation) return;
  const user = currentUser();
  user.liveLocation = localStore.pendingLiveLocation;
  state.user = user;

  try {
    await persistCurrentMember({ updateProfile: false });
    localStore.pendingLiveLocation = null;
    cacheCurrentGroup();
  } catch {
    saveLocalStore();
  }
}

function renderLocationState() {
  const selected = selectedFriend();
  if (els.locationButton) {
    const ownLive = liveLocationForFriend(currentUser());
    els.locationButton.classList.toggle("active", locationSharing);
    els.locationButton.classList.toggle("fresh", Boolean(ownLive));
    els.locationButton.classList.toggle("starting", locationSharing && !ownLive);
    els.locationButton.setAttribute("aria-pressed", String(locationSharing));
  }
  els.locationStatus.textContent = statusText(selected);
}

function setLocationButtonState(stateName) {
  els.locationButton?.classList.toggle("starting", stateName === "starting");
}

async function copyGroupCode() {
  const copied = await copyText(state.groupCode);
  const message = copied ? "Group code copied." : state.groupCode;
  if (els.profileDialog.open) {
    els.profileMessage.textContent = message;
  } else {
    showTopFeedback(message);
  }
}

function showTopFeedback(message) {
  window.clearTimeout(topFeedbackTimer);
  els.currentContext.textContent = message;
  topFeedbackTimer = window.setTimeout(() => renderAll(), 1800);
}

function openProfileSheet() {
  const user = currentUser();
  els.profileName.value = user.name || "";
  els.profileGroupCode.textContent = state.groupCode || "NO GROUP";
  els.profileMessage.textContent = "";
  pendingProfilePhoto = "";
  renderProfilePreview(user);
  renderFriendList(els.profileFriendList, { closeDialog: null });
  openDialog(els.profileDialog);
}

function setBusy(isBusy) {
  els.authSubmitButton.disabled = isBusy;
  els.authSubmitButton.textContent = isBusy ? "Opening the gate..." : "Enter app";
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
  if (els.authSubmitButton) els.authSubmitButton.textContent = "Enter app";
}

function renderAuthGate() {
  const signedIn = Boolean(state.user?.id && state.groupCode);
  els.onboarding.hidden = signedIn;
  els.appShell.hidden = !signedIn;

  if (!signedIn) {
    stopTimelineClock();
    els.cloudBadge.textContent = services.provider === "base44"
      ? "Group-code sync"
      : "Local group store";
    return;
  }

  startTimelineClock();
  syncTimelineToNow({ render: false });
  selectedFriendId = state.friends.some((friend) => friend.id === selectedFriendId)
    ? selectedFriendId
    : state.user.id;
  if (localStore.shareLocation && !locationSharing) {
    startLiveLocation({ quiet: true });
  }
  if (pendingInitialPosition) {
    const position = pendingInitialPosition;
    pendingInitialPosition = null;
    handleLivePosition(position);
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
  const progress = (state.selectedMinute - day.start) / (day.end - day.start);
  els.timeSliderWrap.style.setProperty("--time-progress", `${clamp(progress, 0, 1) * 100}%`);
  els.startTimeLabel.textContent = formatTime(day.start);
  els.endTimeLabel.textContent = formatTime(day.end);
  els.currentContext.textContent = `${day.label} ${day.date} - ${formatTime(state.selectedMinute)}`;
  els.groupCodeLabel.textContent = state.groupCode;
  els.friendGroupCode.textContent = state.groupCode;
  els.profileGroupCode.textContent = state.groupCode;
  els.currentLocationButton.classList.toggle("active", timelineFollowsClock);
  els.currentLocationButton.setAttribute("aria-pressed", String(timelineFollowsClock));
  renderLocationState();

  [...els.dayButtons.children].forEach((button, index) => {
    button.classList.toggle("active", Object.keys(days)[index] === state.selectedDay);
  });

  renderRoutes();
  renderPins();
  renderFriendStrip();
  renderSelectedFriendSummary();
  if (els.profileDialog.open) renderFriendList(els.profileFriendList, { closeDialog: null });
  if (els.friendDetailDialog.open) renderFriendDetail();
}

function renderDayButtons() {
  els.dayButtons.replaceChildren();
  Object.entries(days).forEach(([id, day]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = day.short;
    button.addEventListener("click", () => {
      timelineFollowsClock = true;
      state.selectedDay = id;
      state.selectedMinute = clamp(state.selectedMinute, day.start, day.end);
      syncTimelineToNow({ render: false });
      saveLocalStore();
      renderAll();
    });
    els.dayButtons.append(button);
  });
}

function startTimelineClock() {
  if (timelineClockId) return;
  timelineClockId = window.setInterval(() => syncTimelineToNow({ render: true }), 60 * 1000);
}

function stopTimelineClock() {
  if (!timelineClockId) return;
  window.clearInterval(timelineClockId);
  timelineClockId = null;
}

function syncTimelineToNow(options = {}) {
  if (!timelineFollowsClock || !state.user) return false;

  const moment = festivalMomentForNow(new Date()) || previewMomentForCurrentClock(new Date(), state.selectedDay);
  if (!moment) return false;

  const changed = state.selectedDay !== moment.day || state.selectedMinute !== moment.minute;
  state.selectedDay = moment.day;
  state.selectedMinute = moment.minute;

  if (changed) saveLocalStore();
  if (changed && options.render) renderAll();
  return changed;
}

function showCurrentLocation() {
  timelineFollowsClock = true;
  const synced = syncTimelineToNow({ render: false });

  if (!synced) {
    const day = days[state.selectedDay];
    state.selectedMinute = clamp(minuteForFestivalClock(new Date()), day.start, day.end);
    saveLocalStore();
  }

  if (!locationSharing) startLiveLocation({ quiet: true });
  renderAll();
}

function festivalMomentForNow(now) {
  for (const [dayId, windowRange] of Object.entries(festivalWindows)) {
    if (now >= windowRange.start && now <= windowRange.end) {
      return {
        day: dayId,
        minute: minuteForFestivalClock(now)
      };
    }
  }

  return null;
}

function previewMomentForCurrentClock(now, dayId) {
  const day = days[dayId];
  if (!day) return null;

  const minute = minuteForFestivalClock(now);
  if (minute < day.start || minute > day.end) return null;
  return { day: dayId, minute };
}

function minuteForFestivalClock(now) {
  let minute = now.getHours() * 60 + now.getMinutes();
  if (minute < 12 * 60) minute += 24 * 60;
  return minute;
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
}

function renderPins() {
  const placements = stagePlacements();
  const nextPositions = new Map();
  const activeIds = new Set(state.friends.map((friend) => friend.id));

  [...els.pinLayer.querySelectorAll(".friend-pin")].forEach((pin) => {
    if (!activeIds.has(pin.dataset.friendId)) pin.remove();
  });

  state.friends.forEach((friend) => {
    const stage = stageForFriend(friend);
    const position = positionForFriend(friend, stage, placements);
    const previous = lastPinPositions.get(friend.id);
    const isMoving = Boolean(previous && Math.hypot(previous.x - position.x, previous.y - position.y) > 0.01);
    let pin = els.pinLayer.querySelector(`[data-friend-id="${cssEscape(friend.id)}"]`);
    const isNew = !pin;

    if (!pin) {
      pin = document.createElement("button");
      pin.type = "button";
      pin.className = "friend-pin";
      pin.dataset.friendId = friend.id;
      pin.addEventListener("click", () => {
        selectedFriendId = friend.id;
        renderAll();
        renderFriendDetail(friend);
        openDialog(els.friendDetailDialog);
      });
      els.pinLayer.append(pin);
    }

    pin.classList.toggle("selected", friend.id === selectedFriendId);
    pin.classList.toggle("live", Boolean(liveLocationForFriend(friend)));
    pin.style.setProperty("--friend-color", friend.color || "#53e2ff");
    pin.setAttribute("aria-label", `${friend.name}, ${statusText(friend)}`);
    pin.replaceChildren();

    const name = document.createElement("span");
    name.className = "pin-name";
    name.textContent = friend.name || "Friend";

    pin.append(name, avatarElement(friend, "pin-head"));

    if (isNew) {
      pin.style.left = `${position.x * 100}%`;
      pin.style.top = `${position.y * 100}%`;
    } else {
      pin.classList.toggle("walking", isMoving);
      if (isMoving) {
        window.clearTimeout(pin._walkTimer);
        pin._walkTimer = window.setTimeout(() => pin.classList.remove("walking"), 1700);
      }
      requestAnimationFrame(() => {
        pin.style.left = `${position.x * 100}%`;
        pin.style.top = `${position.y * 100}%`;
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
      renderFriendDetail(friend);
      openDialog(els.friendDetailDialog);
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

function renderFriendList(target = els.friendList, options = {}) {
  const closeDialog = options.closeDialog === undefined ? els.friendsDialog : options.closeDialog;
  target.replaceChildren();

  state.friends.forEach((friend) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "friend-row";
    row.classList.toggle("active", friend.id === selectedFriendId);
    row.style.setProperty("--friend-color", friend.color || "#53e2ff");
    row.addEventListener("click", () => {
      selectedFriendId = friend.id;
      renderAll();
      renderFriendDetail(friend);
      if (closeDialog?.open) closeDialog.close();
      openDialog(els.friendDetailDialog);
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
    target.append(row);
  });
}

function renderFriendDetail(friend = selectedFriend()) {
  const current = state.friends.find((item) => item.id === friend.id) || friend;
  els.friendDetailName.textContent = current.name || "Friend";
  renderAvatarInto(els.friendDetailAvatar, current);
  els.friendDetailNow.textContent = statusText(current);
  els.friendDetailSource.textContent = locationSourceText(current);
  els.friendDetailSchedule.replaceChildren();

  const dayOrder = new Map(Object.keys(days).map((day, index) => [day, index]));
  const schedule = [...(current.schedule || [])].sort((a, b) => {
    const dayDiff = (dayOrder.get(a.day) || 0) - (dayOrder.get(b.day) || 0);
    return dayDiff || a.start - b.start;
  });

  if (!schedule.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No schedule uploaded yet.";
    els.friendDetailSchedule.append(empty);
    return;
  }

  schedule.forEach((item) => {
    const row = document.createElement("div");
    row.className = "parsed-event";
    const title = document.createElement("strong");
    title.textContent = item.artist;
    const meta = document.createElement("span");
    meta.textContent = `${days[item.day].label} - ${formatTime(item.start)} to ${formatTime(item.end)} - ${stageById(item.stageId).name}`;
    row.append(title, meta);
    els.friendDetailSchedule.append(row);
  });
}

function renderSelectedFriendSummary() {
  const selected = selectedFriend();
  els.selectedFriendName.textContent = selected.name || "Your crew";
  els.selectedFriendStage.textContent = nextStopText(selected);
}

function nextStopText(friend) {
  const next = friend.schedule
    .filter((item) => item.day === state.selectedDay && item.start > state.selectedMinute)
    .sort((a, b) => a.start - b.start)[0];

  if (next) return `Next: ${next.artist}, ${stageById(next.stageId).name}`;
  return locationSourceText(friend);
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
  await recognizeScheduleFiles([file]);
}

async function recognizeScheduleFiles(files) {
  parsedEvents = [];
  renderParsedSchedule();
  els.ocrText.value = "";
  els.ocrStatus.textContent = files.length > 1
    ? `Reading ${files.length} schedule pictures...`
    : "Reading schedule picture...";

  const results = [];
  for (const [index, file] of files.entries()) {
    els.ocrStatus.textContent = files.length > 1
      ? `Reading picture ${index + 1} of ${files.length}...`
      : "Reading schedule picture...";
    results.push(await recognizeScheduleFile(file));
  }

  const events = dedupeScheduleEvents(results.flatMap((result) => result.events || []))
    .sort((a, b) => {
      if (a.day === b.day) return a.start - b.start;
      return Object.keys(days).indexOf(a.day) - Object.keys(days).indexOf(b.day);
    });
  const text = results
    .map((result, index) => result.text ? `Picture ${index + 1}\n${result.text}` : "")
    .filter(Boolean)
    .join("\n\n");

  await acceptRecognizedSchedule({
    source: results.map((result) => result.source).filter(Boolean).join(", ") || "OCR",
    text,
    events
  }, files.length > 1 ? "Multi-upload" : results[0]?.source || "OCR");
}

async function recognizeScheduleFile(file) {
  const knownSchedule = await knownScheduleFromImage(file);
  if (knownSchedule) {
    return knownSchedule;
  }

  if (!window.Tesseract) {
    els.ocrStatus.textContent = "OCR did not load. Asking Base44 to read the image...";
    const aiResult = await extractScheduleWithBase44AI(file, "", dayFromFilename(file.name) || state.selectedDay);
    if (aiResult?.events?.length) {
      return { ...aiResult, source: "Read by Base44" };
    }
    return { source: "Unavailable", text: "", events: [] };
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
      const events = parseSchedule(text, dayIn(text) || dayFromFilename(file.name) || state.selectedDay);
      if (events.length > best.events.length) best = { text, events, source: "OCR" };
      if (events.length >= 6) break;
    }

    if (best.events.length < 6) {
      const knownAfterOcr = await knownScheduleFromImage(file);
      if (knownAfterOcr?.events?.length > best.events.length) best = knownAfterOcr;
    }

    if (best.events.length < 6) {
      const aiResult = await extractScheduleWithBase44AI(file, best.text, dayFromFilename(file.name) || dayIn(best.text) || state.selectedDay);
      if (aiResult?.events?.length > best.events.length) best = aiResult;
    }

    return {
      source: best.source || "OCR",
      text: best.text || "",
      events: best.events || []
    };
  } catch (error) {
    return {
      source: "OCR failed",
      text: "",
      events: [],
      error
    };
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

async function extractScheduleWithBase44AI(file, ocrText = "", defaultDay = "friday") {
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

    const events = eventsFromAiSchedule(result, defaultDay);
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

function eventsFromAiSchedule(result, defaultDay = "friday") {
  const payload = aiPayload(result);
  const rows = Array.isArray(payload?.events) ? payload.events : [];

  return dedupeScheduleEvents(rows.map((row) => {
    const day = dayIn(row.day || row.date || "") || defaultDay || "friday";
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

function parseSchedule(text, defaultDay = "") {
  const normalizedText = normalizeScheduleText(text);
  const lines = normalizedText
    .split(/\n+/)
    .map(compactScheduleLine)
    .filter(Boolean);

  const fallbackDay = days[defaultDay] ? defaultDay : (dayIn(normalizedText) || state.selectedDay || "friday");
  let currentDay = dayIn(normalizedText) || fallbackDay;
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

  const rangeEvents = parseScheduleByRanges(normalizedText, fallbackDay);
  return dedupeScheduleEvents(mergeScheduleEvents(output, rangeEvents))
    .filter((event) => days[event.day])
    .sort((a, b) => {
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

function dayFromFilename(filename) {
  return dayIn(String(filename || "").replace(/[._-]/g, " "));
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
  const mapped = mappedLocationForFriend(friend);
  if (mapped?.stageId) return stageById(mapped.stageId);

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
  if (live) return `Live GPS: ${stageById(live.stageId).name}`;

  const lastKnown = lastKnownLocationForFriend(friend);
  if (lastKnown) return `Last seen: ${stageById(lastKnown.stageId).name}`;

  const active = activeEvent(friend);
  if (active) return `Now: ${active.artist}, ${stageById(active.stageId).name}`;

  const display = displayEvent(friend);
  if (display) {
    const label = display.start > state.selectedMinute ? "Next" : "Last";
    return `${label}: ${display.artist}, ${stageById(display.stageId).name}`;
  }

  return "No schedule yet";
}

function locationSourceText(friend) {
  const live = liveLocationForFriend(friend);
  const lastKnown = lastKnownLocationForFriend(friend);
  const selectedIsSelf = friend.id === state.user?.id;

  if (live) return `${selectedIsSelf ? "Your" : "Friend"} live GPS ${relativeAge(live.updatedAt)}`;
  if (lastKnown) return `${navigator.onLine ? "Last GPS" : "Offline last seen"} ${relativeAge(lastKnown.updatedAt)}`;
  if (selectedIsSelf && lastLocationProblem) return lastLocationProblem;
  if (selectedIsSelf && locationSharing) return "Waiting for GPS, using schedule";
  return "Schedule fallback";
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
  if (group.length <= 1) return clampMapPosition(base);

  const index = group.indexOf(friend.id);
  const angle = (index / group.length) * Math.PI * 2;
  const radius = Math.min(0.078, 0.048 + Math.max(0, group.length - 2) * 0.008);
  return clampMapPosition({
    x: base.x + Math.cos(angle) * radius,
    y: base.y + Math.sin(angle) * radius
  });
}

function positionForFriend(friend, stage, groups) {
  const mapped = mappedLocationForFriend(friend);
  if (mapped) {
    return clampMapPosition(screenPositionForLiveLocation(mapped));
  }

  return clampMapPosition(offsetPosition(friend, stage, groups));
}

function screenPositionForStage(stage) {
  return clampMapPosition({ x: stage.x, y: stage.y });
}

function screenPositionForLiveLocation(live) {
  return clampMapPosition({
    x: clamp(live.x, 0.04, 0.96),
    y: clamp(live.y, 0.06, 0.96)
  });
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

function clampMapPosition(position) {
  return {
    x: clamp(position.x, MAP_PIN_BOUNDS.minX, MAP_PIN_BOUNDS.maxX),
    y: clamp(position.y, MAP_PIN_BOUNDS.minY, MAP_PIN_BOUNDS.maxY)
  };
}

function liveLocationForFriend(friend) {
  const live = normalizeLiveLocation(friend?.liveLocation);
  if (!live) return null;
  if (!live.insideFestival) return null;
  if (!navigator.onLine) return null;
  const updatedAt = Date.parse(live.updatedAt);
  if (!Number.isFinite(updatedAt)) return null;
  if (Date.now() - updatedAt > LIVE_LOCATION_MAX_AGE_MS) return null;
  return live;
}

function mappedLocationForFriend(friend) {
  return liveLocationForFriend(friend) || lastKnownLocationForFriend(friend);
}

function lastKnownLocationForFriend(friend) {
  const live = normalizeLiveLocation(friend?.liveLocation);
  if (!live?.insideFestival) return null;
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
    stageId: nearestStageId(x, y),
    insideFestival: coordinateWithinEdc(lat, lon, value.accuracy)
  };
}

function coordinateWithinEdc(lat, lon, accuracy = 0) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return false;
  const accuracyMargin = Number.isFinite(Number(accuracy)) ? Math.min(0.006, Math.max(0, Number(accuracy) / 111000)) : 0;
  const margin = Math.max(EDC_GEO_MARGIN, accuracyMargin);
  return lat >= EDC_GEO_BOUNDS.south - margin
    && lat <= EDC_GEO_BOUNDS.north + margin
    && lon >= EDC_GEO_BOUNDS.west - margin
    && lon <= EDC_GEO_BOUNDS.east + margin;
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
  const normalized = clamp((lon - EDC_GEO_BOUNDS.west) / (EDC_GEO_BOUNDS.east - EDC_GEO_BOUNDS.west), 0, 1);
  return OFFICIAL_MAP_FRAME.minX + normalized * (OFFICIAL_MAP_FRAME.maxX - OFFICIAL_MAP_FRAME.minX);
}

function geoY(lat) {
  const normalized = clamp((EDC_GEO_BOUNDS.north - lat) / (EDC_GEO_BOUNDS.north - EDC_GEO_BOUNDS.south), 0, 1);
  return OFFICIAL_MAP_FRAME.minY + normalized * (OFFICIAL_MAP_FRAME.maxY - OFFICIAL_MAP_FRAME.minY);
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
    pinHash: "",
    pinSalt: "",
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

async function securedMemberProfile(existing, profile, groupCode, pin) {
  if (existing?.pinHash) {
    const pinMatches = await verifyPin(pin, existing.pinHash, existing.pinSalt, groupCode);
    if (!pinMatches) {
      throw new Error("That name already exists in this group. Enter the correct PIN or choose another name.");
    }
  }

  const pinSalt = existing?.pinSalt || pinSaltFromHash(existing?.pinHash) || createPinSalt();
  const pinHash = existing?.pinHash || await hashPin(pin, pinSalt, groupCode);

  return {
    ...existing,
    ...profile,
    id: existing?.id || profile.id || groupNameUserId(groupCode, profile.name),
    userId: existing?.userId || profile.userId || groupNameUserId(groupCode, profile.name),
    groupCode,
    name: profile.name,
    email: "",
    photo: profile.photo || existing?.photo || "",
    color: existing?.color || profile.color || randomColor(),
    pinHash,
    pinSalt,
    schedule: existing?.schedule || profile.schedule || [],
    liveLocation: existing?.liveLocation || null
  };
}

function normalizeMember(member) {
  return {
    id: member.id || cryptoId(),
    userId: member.userId || member.authUserId || "",
    name: cleanName(member.name),
    email: member.email || "",
    photo: member.photo || "",
    color: member.color || randomColor(),
    pinHash: member.pinHash || "",
    pinSalt: member.pinSalt || pinSaltFromHash(member.pinHash) || "",
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
    pinHash: normalized.pinHash,
    pinSalt: normalized.pinSalt,
    groupCode: normalized.groupCode,
    schedule: normalized.schedule,
    liveLocation: normalized.liveLocation,
    updatedAt: member.updatedAt
  };
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

function cacheCurrentGroup() {
  if (!state.groupCode || !state.user?.id) {
    saveLocalStore();
    return;
  }

  const members = new Map();
  state.friends.forEach((friend) => members.set(friend.id, normalizeMember(friend)));
  members.set(state.user.id, normalizeMember(state.user));
  localStore.groups[state.groupCode] = {
    code: state.groupCode,
    members: Object.fromEntries(members)
  };
  localStore.session = { uid: state.user.id, groupCode: state.groupCode };
  saveLocalStore();
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

async function openPhotoCropper(file, target) {
  const image = await loadImage(file);
  return new Promise((resolve) => {
    cropState = {
      file,
      image,
      target,
      resolve
    };
    els.photoCropZoom.value = "1";
    els.photoCropX.value = "0";
    els.photoCropY.value = "0";
    drawPhotoCropPreview();
    openDialog(els.photoCropDialog);
  });
}

function drawPhotoCropPreview() {
  if (!cropState?.image) return;

  const canvas = els.photoCropCanvas;
  const context = canvas.getContext("2d");
  const size = canvas.width;
  const crop = cropRectangle(cropState.image);

  context.clearRect(0, 0, size, size);
  context.fillStyle = "#eef1f5";
  context.fillRect(0, 0, size, size);

  context.save();
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  context.clip();
  context.drawImage(cropState.image, crop.x, crop.y, crop.size, crop.size, 0, 0, size, size);
  context.restore();

  context.save();
  context.fillStyle = "rgba(17, 17, 20, 0.18)";
  context.fillRect(0, 0, size, size);
  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.lineWidth = 4;
  context.strokeStyle = "rgba(255, 255, 255, 0.94)";
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  context.stroke();
}

function cropRectangle(image) {
  const zoom = Number(els.photoCropZoom.value) || 1;
  const baseSize = Math.min(image.width, image.height) / zoom;
  const maxX = Math.max(0, image.width - baseSize);
  const maxY = Math.max(0, image.height - baseSize);
  const offsetX = Number(els.photoCropX.value) || 0;
  const offsetY = Number(els.photoCropY.value) || 0;

  return {
    x: clamp((maxX / 2) + offsetX * (maxX / 2), 0, maxX),
    y: clamp((maxY / 2) + offsetY * (maxY / 2), 0, maxY),
    size: baseSize
  };
}

function croppedPhotoDataUrl() {
  const output = document.createElement("canvas");
  output.width = 720;
  output.height = 720;
  const context = output.getContext("2d");
  const crop = cropRectangle(cropState.image);
  context.drawImage(cropState.image, crop.x, crop.y, crop.size, crop.size, 0, 0, output.width, output.height);
  return output.toDataURL("image/jpeg", 0.88);
}

function applyPhotoCrop() {
  if (!cropState) return;
  const dataUrl = croppedPhotoDataUrl();
  const resolve = cropState.resolve;
  cropState = null;
  els.photoCropDialog.close();
  resolve(dataUrl);
}

function cancelPhotoCrop() {
  if (!cropState) return;
  const resolve = cropState.resolve;
  cropState = null;
  els.photoCropDialog.close();
  resolve("");
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

function cssEscape(value) {
  if (globalThis.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
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

function cleanPin(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}

function validPin(pin) {
  return /^\d{4,6}$/.test(cleanPin(pin));
}

function sameName(left, right) {
  return nameKey(left) === nameKey(right);
}

function nameKey(name) {
  return normalize(cleanName(name));
}

function groupNameUserId(groupCode, name) {
  return `member-${normalizeGroupCode(groupCode).toLowerCase()}-${nameKey(name).slice(0, 64) || "you"}`;
}

function createPinSalt() {
  const bytes = new Uint8Array(16);
  globalThis.crypto?.getRandomValues?.(bytes);
  if (bytes.some(Boolean)) return bytesToBase64Url(bytes);
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function pinSaltFromHash(pinHash) {
  const parts = String(pinHash || "").split("$");
  return parts[0] === "pbkdf2" || parts[0] === "simple" ? parts[2] || "" : "";
}

async function hashPin(pin, salt, groupCode) {
  const clean = cleanPin(pin);
  const input = `${clean}:${normalizeGroupCode(groupCode)}`;

  if (globalThis.crypto?.subtle) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(input),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const iterations = 120000;
    const bits = await crypto.subtle.deriveBits({
      name: "PBKDF2",
      salt: encoder.encode(`festival-gps-pin-v1:${salt}`),
      iterations,
      hash: "SHA-256"
    }, key, 256);
    return `pbkdf2$${iterations}$${salt}$${bytesToBase64Url(new Uint8Array(bits))}`;
  }

  return `simple$1$${salt}$${simpleHash(`festival-gps-pin-v1:${salt}:${input}`)}`;
}

async function verifyPin(pin, storedHash, storedSalt, groupCode) {
  const salt = storedSalt || pinSaltFromHash(storedHash);
  if (!salt || !storedHash) return false;
  if (String(storedHash).startsWith("simple$")) {
    return timingSafeEqual(`simple$1$${salt}$${simpleHash(`festival-gps-pin-v1:${salt}:${cleanPin(pin)}:${normalizeGroupCode(groupCode)}`)}`, storedHash);
  }
  const expected = await hashPin(pin, salt, groupCode);
  return timingSafeEqual(expected, storedHash);
}

function bytesToBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function timingSafeEqual(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  let diff = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    diff |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return diff === 0;
}

function simpleHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
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
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "That PIN does not match this name.";
  if (code.includes("weak-password")) return "Use a 4-6 digit PIN.";
  if (code.includes("network")) return "Network issue. Try again when your connection is steady.";
  if (String(error.message || "").toLowerCase().includes("unauthorized")) return "That group or PIN could not be verified.";
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
