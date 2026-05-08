const STORAGE_KEY = "festival-gps-pwa-v1";
const MAP_URL = "https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/sites/21/2026/05/08131244/edclv_2026_de_festival_map_1080x1350_r05_blurred.jpg";

const days = {
  friday: { label: "Friday", short: "Fri", date: "May 15", start: 17 * 60, end: 29 * 60 + 30 },
  saturday: { label: "Saturday", short: "Sat", date: "May 16", start: 19 * 60, end: 29 * 60 + 30 },
  sunday: { label: "Sunday", short: "Sun", date: "May 17", start: 19 * 60, end: 29 * 60 + 30 }
};

const stages = [
  { id: "kinetic-field", name: "Kinetic Field", x: 0.48, y: 0.68, color: "#ff4fd8" },
  { id: "cosmic-meadow", name: "Cosmic Meadow", x: 0.27, y: 0.23, color: "#53e2ff" },
  { id: "circuit-grounds", name: "Circuit Grounds", x: 0.69, y: 0.27, color: "#a5ff5f" },
  { id: "neon-garden", name: "Neon Garden", x: 0.70, y: 0.48, color: "#ffe45f" },
  { id: "basspod", name: "Basspod", x: 0.30, y: 0.47, color: "#ff6b6b" },
  { id: "wasteland", name: "Wasteland", x: 0.25, y: 0.66, color: "#ff9f43" },
  { id: "quantum-valley", name: "Quantum Valley", x: 0.73, y: 0.68, color: "#8e7cff" },
  { id: "stereo-bloom", name: "Stereo Bloom", x: 0.52, y: 0.47, color: "#4dffb8" },
  { id: "bionic-jungle", name: "Bionic Jungle", x: 0.60, y: 0.58, color: "#f86fff" },
  { id: "art-cars", name: "Art Cars", x: 0.49, y: 0.82, color: "#f8f4a6" },
  { id: "downtown-edc", name: "Downtown EDC", x: 0.41, y: 0.55, color: "#7de2d1" },
  { id: "speedway-entry", name: "Speedway Entry", x: 0.50, y: 0.92, color: "#f7f7ff" }
];

const aliases = new Map([
  ["kineticfield", "kinetic-field"],
  ["kinetic", "kinetic-field"],
  ["cosmicmeadow", "cosmic-meadow"],
  ["cosmic", "cosmic-meadow"],
  ["circuitgrounds", "circuit-grounds"],
  ["circuit", "circuit-grounds"],
  ["neongarden", "neon-garden"],
  ["neon", "neon-garden"],
  ["basspod", "basspod"],
  ["basspodstage", "basspod"],
  ["wasteland", "wasteland"],
  ["quantumvalley", "quantum-valley"],
  ["quantum", "quantum-valley"],
  ["stereobloom", "stereo-bloom"],
  ["bionicjungle", "bionic-jungle"],
  ["artcars", "art-cars"],
  ["artcar", "art-cars"],
  ["downtownedc", "downtown-edc"],
  ["downtown", "downtown-edc"]
]);

const sampleFriends = [
  {
    id: "you",
    name: "You",
    handle: "@you",
    color: "#53e2ff",
    photo: "",
    schedule: [
      event("Opening Ceremony", "cosmic-meadow", "friday", 17 * 60, 19 * 60),
      event("Demo Mainstage Set", "kinetic-field", "friday", 21 * 60, 22 * 60 + 15),
      event("Late Night Techno", "neon-garden", "friday", 24 * 60 + 45, 26 * 60)
    ]
  },
  {
    id: "maya",
    name: "Maya Chen",
    handle: "@maya",
    color: "#ff4fd8",
    photo: "",
    schedule: [
      event("House Warmup", "stereo-bloom", "friday", 20 * 60, 21 * 60),
      event("Circuit Run", "circuit-grounds", "friday", 22 * 60 + 20, 23 * 60 + 30),
      event("Trance Hour", "quantum-valley", "friday", 24 * 60 + 30, 25 * 60 + 30)
    ]
  },
  {
    id: "leo",
    name: "Leo Park",
    handle: "@leo",
    color: "#a5ff5f",
    photo: "",
    schedule: [
      event("Bass Meetup", "basspod", "friday", 20 * 60 + 30, 21 * 60 + 30),
      event("Hard Dance Block", "wasteland", "friday", 23 * 60, 24 * 60 + 15),
      event("Afterglow", "art-cars", "friday", 26 * 60, 27 * 60)
    ]
  }
];

let state = loadState();
let selectedFriendId = state.friends[0]?.id || "you";
let parsedEvents = [];

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  registerServiceWorker();
  setMapImage();
  renderDayButtons();
  renderStages();
  renderAll();
  bindEvents();
});

function event(artist, stageId, day, start, end) {
  return { id: cryptoId(), artist, stageId, day, start, end };
}

function bindElements() {
  [
    "currentContext",
    "friendsButton",
    "profileButton",
    "scheduleButton",
    "dayButtons",
    "timeRange",
    "timeOutput",
    "startTimeLabel",
    "endTimeLabel",
    "friendStrip",
    "stageLayer",
    "pinLayer",
    "friendsDialog",
    "friendList",
    "friendCode",
    "importFriendButton",
    "friendImportMessage",
    "profileDialog",
    "profileName",
    "profilePhoto",
    "profilePreview",
    "saveProfileButton",
    "copyPinButton",
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
  els.friendsButton.addEventListener("click", () => {
    renderFriendList();
    openDialog(els.friendsDialog);
  });

  els.profileButton.addEventListener("click", () => {
    const user = currentUser();
    els.profileName.value = user.name;
    els.profileMessage.textContent = "";
    renderProfilePreview(user);
    openDialog(els.profileDialog);
  });

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
    saveState();
    renderAll();
  });

  els.profileName.addEventListener("input", () => {
    renderProfilePreview({ ...currentUser(), name: els.profileName.value });
  });

  els.profilePhoto.addEventListener("change", async () => {
    const file = els.profilePhoto.files?.[0];
    if (!file) return;
    const photo = await fileToDataUrl(file);
    renderProfilePreview({ ...currentUser(), photo });
  });

  els.saveProfileButton.addEventListener("click", async () => {
    const user = currentUser();
    user.name = cleanName(els.profileName.value);
    const file = els.profilePhoto.files?.[0];
    if (file) {
      user.photo = await fileToDataUrl(file);
    }
    saveState();
    renderAll();
    els.profileMessage.textContent = "Saved.";
  });

  els.copyPinButton.addEventListener("click", async () => {
    const code = encodeFriend(currentUser());
    const copied = await copyText(code);
    els.profileMessage.textContent = copied ? "Pin code copied." : code;
  });

  els.importFriendButton.addEventListener("click", () => {
    const message = importFriendCode(els.friendCode.value);
    els.friendImportMessage.textContent = message;
    renderAll();
    renderFriendList();
  });

  els.scheduleDay.addEventListener("change", () => {
    parsedEvents = parseSchedule(els.ocrText.value, els.scheduleDay.value);
    renderParsedSchedule();
  });

  els.scheduleImage.addEventListener("change", async () => {
    const file = els.scheduleImage.files?.[0];
    if (!file) return;
    await recognizeSchedule(file);
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
      "1:00 AM - 2:00 AM Neon Finale Neon Garden"
    ].join("\n");
    parsedEvents = parseSchedule(els.ocrText.value, els.scheduleDay.value);
    els.ocrStatus.textContent = `${parsedEvents.length} sets generated.`;
    renderParsedSchedule();
  });

  els.applyScheduleButton.addEventListener("click", () => {
    if (!parsedEvents.length) {
      els.ocrStatus.textContent = "No sets to apply.";
      return;
    }
    currentUser().schedule = parsedEvents;
    saveState();
    renderAll();
    els.scheduleDialog.close();
  });
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.friends?.length) {
      return {
        selectedDay: stored.selectedDay || "friday",
        selectedMinute: stored.selectedMinute || days.friday.start,
        friends: stored.friends
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    selectedDay: "friday",
    selectedMinute: days.friday.start,
    friends: structuredClone(sampleFriends)
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentUser() {
  return state.friends[0];
}

function setMapImage() {
  document.querySelector(".map-photo").style.backgroundImage = `linear-gradient(rgba(5, 6, 17, 0.18), rgba(5, 6, 17, 0.34)), url("${MAP_URL}")`;
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
      saveState();
      renderDayButtons();
      renderAll();
    });
    els.dayButtons.append(button);
  });
}

function renderStages() {
  els.stageLayer.replaceChildren();
  stages.filter((stage) => stage.id !== "speedway-entry").forEach((stage) => {
    const marker = document.createElement("div");
    marker.className = "stage-marker";
    marker.style.left = `${stage.x * 100}%`;
    marker.style.top = `${stage.y * 100}%`;
    marker.style.setProperty("--stage-color", stage.color);

    const dot = document.createElement("div");
    dot.className = "stage-dot";
    const name = document.createElement("span");
    name.className = "stage-name";
    name.textContent = stage.name;

    marker.append(dot, name);
    els.stageLayer.append(marker);
  });
}

function renderAll() {
  const day = days[state.selectedDay];
  state.selectedMinute = clamp(state.selectedMinute, day.start, day.end);
  els.timeRange.min = day.start;
  els.timeRange.max = day.end;
  els.timeRange.value = state.selectedMinute;
  els.timeOutput.value = formatTime(state.selectedMinute);
  els.startTimeLabel.textContent = formatTime(day.start);
  els.endTimeLabel.textContent = formatTime(day.end);
  els.currentContext.textContent = `${day.label} ${day.date} • ${formatTime(state.selectedMinute)}`;

  [...els.dayButtons.children].forEach((button, index) => {
    button.classList.toggle("active", Object.keys(days)[index] === state.selectedDay);
  });

  renderPins();
  renderFriendStrip();
}

function renderPins() {
  els.pinLayer.replaceChildren();
  const placements = stagePlacements();

  state.friends.forEach((friend) => {
    const stage = stageForFriend(friend);
    const position = offsetPosition(friend, stage, placements);
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "friend-pin";
    pin.classList.toggle("selected", friend.id === selectedFriendId);
    pin.style.left = `${position.x * 100}%`;
    pin.style.top = `${position.y * 100}%`;
    pin.style.setProperty("--friend-color", friend.color);
    pin.setAttribute("aria-label", `${friend.name}, ${statusText(friend)}`);
    pin.addEventListener("click", () => {
      selectedFriendId = friend.id;
      renderAll();
    });

    const avatar = avatarElement(friend, "avatar");
    const label = document.createElement("span");
    label.className = "pin-label";
    label.append(document.createTextNode(friend.name));
    const status = document.createElement("small");
    status.textContent = statusText(friend);
    label.append(status);
    pin.append(avatar, label);
    els.pinLayer.append(pin);
  });
}

function renderFriendStrip() {
  els.friendStrip.replaceChildren();
  state.friends.forEach((friend) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "friend-chip";
    chip.classList.toggle("active", friend.id === selectedFriendId);
    chip.style.setProperty("--friend-color", friend.color);
    chip.addEventListener("click", () => {
      selectedFriendId = friend.id;
      renderAll();
    });

    const copy = document.createElement("span");
    copy.className = "chip-copy";
    const name = document.createElement("span");
    name.className = "chip-name";
    name.textContent = friend.name;
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
    row.style.setProperty("--friend-color", friend.color);
    row.addEventListener("click", () => {
      selectedFriendId = friend.id;
      els.friendsDialog.close();
      renderAll();
    });

    const copy = document.createElement("span");
    copy.className = "chip-copy";
    const name = document.createElement("span");
    name.className = "chip-name";
    name.textContent = friend.name;
    const status = document.createElement("span");
    status.className = "chip-status";
    status.textContent = statusText(friend);
    copy.append(name, status);
    row.append(avatarElement(friend, "mini-avatar"), copy);
    els.friendList.append(row);
  });
}

function renderProfilePreview(friend) {
  els.profilePreview.replaceChildren();
  if (friend.photo) {
    const image = document.createElement("img");
    image.src = friend.photo;
    image.alt = "";
    els.profilePreview.append(image);
  } else {
    els.profilePreview.textContent = initials(friend.name);
  }
}

function renderParsedSchedule() {
  els.parsedSchedule.replaceChildren();
  if (!parsedEvents.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No sets generated.";
    els.parsedSchedule.append(empty);
    return;
  }

  parsedEvents.forEach((item) => {
    const row = document.createElement("div");
    row.className = "parsed-event";
    const title = document.createElement("strong");
    title.textContent = item.artist;
    const meta = document.createElement("span");
    meta.textContent = `${formatTime(item.start)} - ${formatTime(item.end)} • ${stageById(item.stageId).name}`;
    row.append(title, meta);
    els.parsedSchedule.append(row);
  });
}

async function recognizeSchedule(file) {
  parsedEvents = [];
  renderParsedSchedule();

  if (!window.Tesseract) {
    els.ocrStatus.textContent = "OCR did not load. Paste schedule text instead.";
    return;
  }

  els.ocrStatus.textContent = "Reading schedule picture...";

  try {
    let result;
    if (typeof window.Tesseract.recognize === "function") {
      result = await window.Tesseract.recognize(file, "eng", {
        logger: (message) => updateOcrProgress(message)
      });
    } else {
      const worker = await window.Tesseract.createWorker("eng");
      result = await worker.recognize(file);
      await worker.terminate();
    }

    const text = result?.data?.text || "";
    els.ocrText.value = text;
    parsedEvents = parseSchedule(text, els.scheduleDay.value);
    els.ocrStatus.textContent = parsedEvents.length ? `${parsedEvents.length} sets generated.` : "No sets generated.";
    renderParsedSchedule();
  } catch (error) {
    els.ocrStatus.textContent = `OCR failed: ${error.message || error}`;
  }
}

function updateOcrProgress(message) {
  if (!message?.status) return;
  const percent = Number.isFinite(message.progress) ? ` ${Math.round(message.progress * 100)}%` : "";
  els.ocrStatus.textContent = `${message.status}${percent}`;
}

function parseSchedule(text, defaultDay) {
  const lines = text
    .replace(/\u2028/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const documentDay = dayIn(text) || defaultDay;
  const output = [];

  lines.forEach((line, index) => {
    const range = parseTimeRange(line);
    if (!range) return;

    const previous = lines[index - 1] || "";
    const next = lines[index + 1] || "";
    const context = `${previous} ${line} ${next}`;
    const stageId = stageIdIn(context) || "speedway-entry";
    const artist = artistName(line, previous, next, range.matchText);

    output.push({
      id: cryptoId(),
      artist,
      stageId,
      day: dayIn(line) || documentDay,
      start: range.start,
      end: range.end
    });
  });

  return output.sort((a, b) => {
    if (a.day === b.day) return a.start - b.start;
    return Object.keys(days).indexOf(a.day) - Object.keys(days).indexOf(b.day);
  });
}

function parseTimeRange(line) {
  const rangePattern = /\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.M\.|P\.M\.)?\s*(?:-|–|—|to|until|thru|through)\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.M\.|P\.M\.)\b/i;
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

    if (end <= start) {
      end += 24 * 60;
    }

    return { start, end, matchText: rangeMatch[0] };
  }

  const singlePattern = /\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM|A\.M\.|P\.M\.)\b/i;
  const singleMatch = line.match(singlePattern);
  if (!singleMatch) return null;

  const start = minutes(Number(singleMatch[1]), Number(singleMatch[2] || 0), period(singleMatch[3]) || "PM");
  return { start, end: start + 60, matchText: singleMatch[0] };
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
  ["Friday", "Saturday", "Sunday", "Fri", "Sat", "Sun", "EDC", "EDC Las Vegas"].forEach((word) => {
    output = output.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, "ig"), " ");
  });

  return output
    .replace(/[•|]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-–—:\s]+|[-–—:\s]+$/g, "")
    .trim();
}

function stageForFriend(friend) {
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
  const active = activeEvent(friend);
  if (active) {
    return `${active.artist} • ${stageById(active.stageId).name}`;
  }

  const display = displayEvent(friend);
  if (display) {
    return `${display.start > state.selectedMinute ? "Next" : "Last"}: ${display.artist}`;
  }

  return "No schedule";
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
  const group = groups.get(stage.id) || [];
  if (group.length <= 1) return { x: stage.x, y: stage.y };

  const index = group.indexOf(friend.id);
  const angle = (index / group.length) * Math.PI * 2;
  const radius = 0.036;
  return {
    x: clamp(stage.x + Math.cos(angle) * radius, 0.06, 0.94),
    y: clamp(stage.y + Math.sin(angle) * radius, 0.08, 0.94)
  };
}

function stageById(id) {
  return stages.find((stage) => stage.id === id) || stages.at(-1);
}

function avatarElement(friend, className) {
  const avatar = document.createElement("span");
  avatar.className = className;
  avatar.style.setProperty("--friend-color", friend.color);
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

function encodeFriend(friend) {
  const payload = {
    version: 1,
    friend: {
      id: friend.id === "you" ? cryptoId() : friend.id,
      name: friend.name,
      handle: friend.handle,
      color: friend.color,
      photo: friend.photo,
      schedule: friend.schedule
    }
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function importFriendCode(code) {
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    const friend = payload.friend;
    if (!friend?.name || !Array.isArray(friend.schedule)) {
      return "That code is not a Festival GPS pin.";
    }

    const imported = {
      id: friend.id || cryptoId(),
      name: cleanName(friend.name),
      handle: friend.handle || "",
      color: friend.color || randomColor(),
      photo: friend.photo || "",
      schedule: friend.schedule.map((item) => ({
        id: item.id || cryptoId(),
        artist: item.artist || "Imported Set",
        stageId: item.stageId || item.stageID || "speedway-entry",
        day: item.day || "friday",
        start: Number(item.start ?? item.startMinute),
        end: Number(item.end ?? item.endMinute)
      })).filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end))
    };

    const existingIndex = state.friends.findIndex((item) => item.id === imported.id);
    if (existingIndex >= 0) {
      state.friends[existingIndex] = imported;
    } else {
      state.friends.push(imported);
    }
    selectedFriendId = imported.id;
    saveState();
    els.friendCode.value = "";
    return `${imported.name} imported.`;
  } catch {
    return "That code could not be imported.";
  }
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

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
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

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}
