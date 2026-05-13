import { BASE44_CONFIG, MAPKIT_CONFIG, base44IsConfigured } from "./base44-config.js";

const STORAGE_KEY = "festival-gps-pwa-v2";
const LAST_GROUP_KEY = "festival-gps-last-group";
const SESSION_BACKUP_KEY = "festival-gps-session-backup-v1";
const GROUP_BACKUP_PREFIX = "festival-gps-group-cache:";
const LIVE_LOCATION_MAX_AGE_MS = 30 * 60 * 1000;
const LIVE_LOCATION_THROTTLE_MS = 15 * 1000;
const PROFILE_PHOTO_SIZE = 192;
const PROFILE_PHOTO_QUALITY = 0.68;
const PIN_BUCKET_THRESHOLD = 3;
const PIN_DRAG_THRESHOLD_PX = 6;
const MAX_GROUP_MEMBERS = 20;
const MAX_ACTIVE_GROUPS = 10;
const FRIEND_STRIP_RENDER_LIMIT = 80;
const GROUP_REFRESH_DEBOUNCE_MS = 2500;
const GROUP_RENDER_DEBOUNCE_MS = 400;
const PIN_MOVE_THRESHOLD = 0.006;
const LARGE_GROUP_PIN_MOVE_THRESHOLD = 0.014;
const EDC_GEO_MARGIN = 0.00035;
const MAP_PIN_BOUNDS = {
  minX: 0.045,
  maxX: 0.742,
  minY: 0.095,
  maxY: 0.955
};
const OFFICIAL_MAP_FRAME = {
  minX: 0.045,
  maxX: 0.708,
  minY: 0.095,
  maxY: 0.936
};
const MAP_GRID = {
  columns: "ABCDEFGHIJKLMNOP".split(""),
  rows: 24,
  minX: 0.045,
  maxX: 0.708,
  minY: 0.095,
  maxY: 0.936
};
const EDC_GEO_BOUNDS = {
  north: 36.2770742,
  south: 36.2654495,
  west: -115.0163942,
  east: -115.0017109
};
const EDC_CENTER = {
  lat: (EDC_GEO_BOUNDS.north + EDC_GEO_BOUNDS.south) / 2,
  lon: (EDC_GEO_BOUNDS.west + EDC_GEO_BOUNDS.east) / 2
};
const EDC_GEO_POLYGON = [
  { lon: -115.0163942, lat: 36.2707411 },
  { lon: -115.0163248, lat: 36.2702104 },
  { lon: -115.0161589, lat: 36.2697504 },
  { lon: -115.015913, lat: 36.2692859 },
  { lon: -115.0155763, lat: 36.2688651 },
  { lon: -115.0151513, lat: 36.2684786 },
  { lon: -115.0146189, lat: 36.2681141 },
  { lon: -115.0142111, lat: 36.2678077 },
  { lon: -115.013404, lat: 36.2669562 },
  { lon: -115.0121568, lat: 36.2655194 },
  { lon: -115.0120249, lat: 36.2654495 },
  { lon: -115.0118933, lat: 36.2654612 },
  { lon: -115.0017109, lat: 36.2716334 },
  { lon: -115.0048341, lat: 36.2751385 },
  { lon: -115.0052525, lat: 36.2755833 },
  { lon: -115.005555, lat: 36.275843 },
  { lon: -115.0059528, lat: 36.2761208 },
  { lon: -115.0062162, lat: 36.2762753 },
  { lon: -115.0064887, lat: 36.2764129 },
  { lon: -115.006678, lat: 36.276501 },
  { lon: -115.0068788, lat: 36.2765836 },
  { lon: -115.0071433, lat: 36.2766748 },
  { lon: -115.0076017, lat: 36.2768073 },
  { lon: -115.007977, lat: 36.2768831 },
  { lon: -115.0082086, lat: 36.2769222 },
  { lon: -115.0083236, lat: 36.2769329 },
  { lon: -115.0085832, lat: 36.2769593 },
  { lon: -115.0088742, lat: 36.2769747 },
  { lon: -115.009731, lat: 36.2769713 },
  { lon: -115.0104888, lat: 36.2769599 },
  { lon: -115.0110861, lat: 36.2769499 },
  { lon: -115.0112513, lat: 36.2769549 },
  { lon: -115.0128231, lat: 36.2769497 },
  { lon: -115.014394, lat: 36.2769311 },
  { lon: -115.0149327, lat: 36.2769845 },
  { lon: -115.0155235, lat: 36.2770742 },
  { lon: -115.0155796, lat: 36.2770596 },
  { lon: -115.0156188, lat: 36.2770408 },
  { lon: -115.0156556, lat: 36.2770002 },
  { lon: -115.0156902, lat: 36.2769247 },
  { lon: -115.015771, lat: 36.2766237 },
  { lon: -115.0157997, lat: 36.2764091 },
  { lon: -115.0158184, lat: 36.2761294 },
  { lon: -115.0158068, lat: 36.2753271 },
  { lon: -115.0157886, lat: 36.2735973 },
  { lon: -115.0158676, lat: 36.2732193 },
  { lon: -115.0161365, lat: 36.2726833 },
  { lon: -115.0163195, lat: 36.2722226 },
  { lon: -115.0163764, lat: 36.2716953 }
];
const EDC_GRID_GEO_CORNERS = {
  topLeft: { lon: -115.0155235, lat: 36.2770742 },
  topRight: { lon: -115.0017109, lat: 36.2716334 },
  bottomRight: { lon: -115.0120249, lat: 36.2654495 },
  bottomLeft: { lon: -115.0163942, lat: 36.2707411 }
};
const GEO_X_SCALE = Math.cos(EDC_CENTER.lat * Math.PI / 180);
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
  { id: "kinetic-field", name: "Kinetic Field", short: "KF", x: 0.43, y: 0.19, color: "#ff4fd8", art: "linear-gradient(135deg, #15132a, #ff4fd8 58%, #ffe86a)" },
  { id: "cosmic-meadow", name: "Cosmic Meadow", short: "CM", x: 0.16, y: 0.54, color: "#53e2ff", art: "linear-gradient(135deg, #10263a, #53e2ff 54%, #f8f4a6)" },
  { id: "circuit-grounds", name: "Circuit Grounds", short: "CG", x: 0.54, y: 0.91, color: "#a5ff5f", art: "linear-gradient(135deg, #152918, #a5ff5f 56%, #53e2ff)" },
  { id: "neon-garden", name: "Neon Garden", short: "NG", x: 0.58, y: 0.54, color: "#ffe45f", art: "linear-gradient(135deg, #30250a, #ffe45f 54%, #ff4fd8)" },
  { id: "basspod", name: "Basspod", short: "BP", x: 0.42, y: 0.90, color: "#ff6b6b", art: "linear-gradient(135deg, #321414, #ff6b6b 56%, #8e7cff)" },
  { id: "wasteland", name: "Wasteland", short: "WL", x: 0.16, y: 0.87, color: "#ff9f43", art: "linear-gradient(135deg, #321c0b, #ff9f43 55%, #f8f4a6)" },
  { id: "quantum-valley", name: "Quantum Valley", short: "QV", x: 0.57, y: 0.34, color: "#8e7cff", art: "linear-gradient(135deg, #161238, #8e7cff 55%, #53e2ff)" },
  { id: "stereo-bloom", name: "Stereo Bloom", short: "SB", x: 0.28, y: 0.39, color: "#4dffb8", art: "linear-gradient(135deg, #102d27, #4dffb8 55%, #ffe45f)" },
  { id: "bionic-jungle", name: "Bionic Jungle", short: "BJ", x: 0.16, y: 0.34, color: "#f86fff", art: "linear-gradient(135deg, #2c1232, #f86fff 56%, #a5ff5f)" },
  { id: "art-cars", name: "Art Cars", short: "AC", x: 0.35, y: 0.51, color: "#f8f4a6", art: "linear-gradient(135deg, #2d2a10, #f8f4a6 58%, #ff9f43)" },
  { id: "downtown-edc", name: "Downtown EDC", short: "DT", x: 0.38, y: 0.61, color: "#7de2d1", art: "linear-gradient(135deg, #102b2c, #7de2d1 58%, #ff4fd8)" },
  { id: "speedway-entry", name: "Speedway Entry", short: "IN", x: 0.055, y: 0.63, color: "#007aff", art: "linear-gradient(135deg, #f5f7fb, #d9e5ff)" }
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

const OFFICIAL_SET_TIME_ROWS = [
  { day: "friday", stage: "Kinetic Field", sets: "Laidback Luke B2B Chuckie 07:00 PM - 08:00 PM Korolova 08:00 PM - 09:00 PM Argy 09:00 PM - 10:00 PM Chris Lorenzo 10:07 PM - 11:15 PM Sofi Tukker 11:19 PM - 12:28 AM The Chainsmokers 12:32 AM - 01:40 AM Fisher 01:47 AM - 02:57 AM Porter Robinson (DJ Set) 03:01 AM - 04:10 AM Charlotte de Witte 04:14 AM - 05:28 AM" },
  { day: "friday", stage: "Cosmic Meadow", sets: "Max Dean B2B Luke Dean 05:00 PM - 06:55 PM Jackie Hollander 07:00 PM - 07:55 PM Roddy Lima 07:55 PM - 08:55 PM Westend 08:55 PM - 09:55 PM Walker & Royce B2B VNSSA 09:55 PM - 10:55 PM Underworld 11:10 PM - 12:10 AM MEDUZA³ 12:25 AM - 01:40 AM Notion 01:47 AM - 02:47 AM MPH 02:47 AM - 04:02 AM San Pacho 04:02 AM - 05:30 AM" },
  { day: "friday", stage: "Circuit Grounds", sets: "1991 07:00 PM - 08:00 PM Bou 08:00 PM - 09:00 PM Nico Moreno 09:00 PM - 10:00 PM I Hate Models 10:00 PM - 11:15 PM Levity 11:15 PM - 12:25 AM Wooli 12:25 AM - 01:35 AM The Outlaw 01:35 AM - 02:35 AM Holy Priest 02:35 AM - 03:30 AM Ray Volpe 03:30 AM - 04:30 AM Level Up 04:30 AM - 05:30 AM" },
  { day: "friday", stage: "Neon Garden", sets: "Anastazja 07:00 PM - 08:30 PM MËSTIZA 08:30 PM - 10:00 PM DJ Tennis B2B Chloé Caillet 10:00 PM - 11:30 PM Peggy Gou 11:30 PM - 01:00 AM Adriatique 01:00 AM - 02:30 AM Joseph Capriati 02:30 AM - 04:00 AM Eli Brown 04:00 AM - 05:30 AM" },
  { day: "friday", stage: "Basspod", sets: "RIOT 07:00 PM - 07:50 PM The Masquerade 07:50 PM - 08:40 PM HEYZ 08:40 PM - 09:30 PM MUZZ 09:30 PM - 10:30 PM GorillaT 10:30 PM - 11:30 PM Ghengar 11:30 PM - 12:30 AM ATLiens 12:30 AM - 01:30 AM Kai Wachi 01:30 AM - 02:30 AM Adventure Club (Throwback Set) 02:30 AM - 03:30 AM Culture Shock 03:30 AM - 04:30 AM Cyclops 04:30 AM - 05:30 AM" },
  { day: "friday", stage: "Wasteland", sets: "DØMINA 07:00 PM - 08:30 PM Serafina 08:30 PM - 09:30 PM Johannes Schuster 09:30 PM - 10:30 PM Adrián Mills 10:30 PM - 11:30 PM Cloudy 11:30 PM - 12:30 AM KUKO 12:30 AM - 01:30 AM GRAVEDGR 01:30 AM - 02:30 AM Rebekah 02:30 AM - 03:30 AM DYEN 03:30 AM - 04:30 AM Stan Christ 04:30 AM - 05:30 AM" },
  { day: "friday", stage: "Quantum Valley", sets: "Sarah de Warren 07:00 PM - 08:00 PM Matty Ralph 08:00 PM - 09:00 PM Cold Blue 09:00 PM - 10:00 PM Pegassi 10:00 PM - 11:00 PM Darude 11:00 PM - 12:00 AM Cosmic Gate 12:00 AM - 01:00 AM Gareth Emery 01:00 AM - 02:00 AM Ilan Bluestone 02:00 AM - 03:00 AM Paul van Dyk 03:00 AM - 04:00 AM Darren Porter 04:00 AM - 05:30 AM" },
  { day: "friday", stage: "Stereo Bloom", sets: "Abana B2B Juliet Mendoza 07:00 PM - 08:00 PM SLAMM 08:00 PM - 09:00 PM Luuk van Dijk 09:00 PM - 10:15 PM Omar+ 10:15 PM - 11:30 PM Luke Dean 11:30 PM - 12:45 AM Josh Baker 12:45 AM - 02:00 AM Max Dean 02:00 AM - 03:15 AM Obskür 03:15 AM - 04:30 AM Toman 04:30 AM - 05:30 AM" },
  { day: "friday", stage: "Bionic Jungle", sets: "Heidi Lawden B2B Masha Mar 05:00 PM - 07:00 PM Stacy Christine 07:00 PM - 08:00 PM The Carry Nation 08:00 PM - 09:30 PM Massimiliano Pagliara 09:30 PM - 11:00 PM PARAMIDA 11:00 PM - 12:30 AM salute B2B Chloé Caillet 12:30 AM - 02:30 AM Robert Hood 02:30 AM - 04:00 AM Avalon Emerson 04:00 AM - 05:30 AM" },

  { day: "saturday", stage: "Kinetic Field", sets: "AR/CO 07:00 PM - 08:00 PM HAYLA 08:00 PM - 09:00 PM Sub Focus 09:00 PM - 10:00 PM Steve Aoki 10:07 PM - 11:15 PM Hardwell 11:19 PM - 12:28 AM John Summit 12:32 AM - 01:40 AM Subtronics 01:47 AM - 02:57 AM Kaskade 03:01 AM - 04:10 AM Above & Beyond (Sunrise Set) 04:14 AM - 05:28 AM" },
  { day: "saturday", stage: "Cosmic Meadow", sets: "Frost Children 07:00 PM - 08:15 PM Hannah Laing 08:15 PM - 09:25 PM Snow Strippers 09:25 PM - 10:15 PM VTSS (In The Round) 10:15 PM - 11:30 PM The Prodigy 11:35 PM - 12:35 AM BUNT. (In The Round) 12:40 AM - 02:10 AM Interplanetary Criminal 02:10 AM - 03:30 AM MALUGI 03:30 AM - 04:30 AM DJ Gigola B2B MCR-T 04:30 AM - 05:30 AM" },
  { day: "saturday", stage: "Circuit Grounds", sets: "DJ Mandy 07:00 PM - 08:00 PM RØZ 08:00 PM - 09:15 PM KETTAMA 09:15 PM - 10:45 PM Sammy Virji 10:45 PM - 12:15 AM Tiësto 12:15 AM - 01:45 AM Peggy Gou B2B KI/KI 01:45 AM - 03:15 AM Boys Noize 03:15 AM - 04:30 AM Lilly Palmer 04:30 AM - 05:30 AM" },
  { day: "saturday", stage: "Neon Garden", sets: "mink 07:00 PM - 08:30 PM Silvie Loto 08:30 PM - 10:00 PM Ahmed Spins 10:00 PM - 11:30 PM Luciano 11:30 PM - 01:30 AM Prospa 01:30 AM - 03:30 AM Josh Baker B2B KETTAMA B2B Prospa 03:30 AM - 05:30 AM" },
  { day: "saturday", stage: "Basspod", sets: "Fallen with MC Dino 07:00 PM - 07:50 PM AVELLO B2B Dennett 07:50 PM - 08:40 PM Viperactive 08:40 PM - 09:30 PM Hybrid Minds 09:30 PM - 10:30 PM YDG 10:30 PM - 11:30 PM Delta Heavy 11:30 PM - 12:30 AM Getter 12:30 AM - 01:30 AM Eptic B2B Space Laces 01:30 AM - 02:30 AM Doctor P B2B Flux Pavilion B2B FuntCase 02:30 AM - 03:30 AM HOL! 03:30 AM - 04:30 AM Mary Droppinz 04:30 AM - 05:30 AM" },
  { day: "saturday", stage: "Wasteland", sets: "CUTDWN 07:00 PM - 08:30 PM Dead X 08:30 PM - 09:30 PM The Saints 09:30 PM - 10:30 PM Rob Gee B2B Lenny Dee 10:30 PM - 11:30 PM Lady Faith B2B LNY TNZ 11:30 PM - 12:30 AM Audiofreq B2B Code Black B2B Toneshifterz 12:30 AM - 01:30 AM Da Tweekaz 01:30 AM - 02:30 AM Lil Texas 02:30 AM - 03:30 AM Mish 03:30 AM - 04:30 AM Alyssa Jolee 04:30 AM - 05:30 AM" },
  { day: "saturday", stage: "Quantum Valley", sets: "Maria Healy 07:00 PM - 08:30 PM SUPERSTRINGS 08:30 PM - 09:30 PM Billy Gillies 09:30 PM - 10:30 PM Paul Oakenfold 10:30 PM - 11:30 PM Andrew Rayel 11:30 PM - 12:30 AM Maddix 12:30 AM - 01:30 AM Mathame 01:30 AM - 02:30 AM Astrix 02:30 AM - 03:30 AM T78 03:30 AM - 04:30 AM Thomas Schumacher 04:30 AM - 05:30 AM" },
  { day: "saturday", stage: "Stereo Bloom", sets: "Slugg 07:00 PM - 08:00 PM DREYA V 08:00 PM - 09:00 PM Discip 09:00 PM - 10:00 PM OMNOM 10:00 PM - 11:15 PM Noizu 11:15 PM - 12:30 AM Wax Motif 12:30 AM - 01:45 AM CID 01:45 AM - 03:00 AM HNTR 03:00 AM - 04:15 AM BOLO (Sunrise Set) 04:15 AM - 05:30 AM" },
  { day: "saturday", stage: "Bionic Jungle", sets: "Player Dave 07:00 PM - 08:00 PM Spray 08:00 PM - 09:00 PM Bashkka B2B Sedef Adasï 09:00 PM - 10:30 PM HAAi B2B Luke Alessi 10:30 PM - 12:00 AM MCR-T 12:00 AM - 01:15 AM Bad Boombox B2B Ollie Lishman 01:15 AM - 02:30 AM Benwal 02:30 AM - 03:30 AM BAUGRUPPE90 03:30 AM - 04:30 AM Club Angel 04:30 AM - 05:30 AM" },

  { day: "sunday", stage: "Kinetic Field", sets: "Trace 07:00 PM - 08:00 PM Ship Wrek 08:00 PM - 09:00 PM Layton Giordani 09:00 PM - 10:00 PM Funk Tribu 10:07 PM - 11:15 PM GRiZ B2B Wooli 11:19 PM - 12:28 AM Zedd 12:32 AM - 01:40 AM Martin Garrix 01:47 AM - 02:57 AM Cloonee 03:01 AM - 04:10 AM Armin van Buuren (Sunrise Set) 04:14 AM - 05:28 AM" },
  { day: "sunday", stage: "Cosmic Meadow", sets: "GRAVAGERZ 07:00 PM - 08:00 PM Nostalgix 08:00 PM - 09:00 PM William Black 09:00 PM - 10:00 PM San Holo (Wholesome Riddim Set) 10:00 PM - 11:00 PM Dabin 11:00 PM - 12:05 AM Alison Wonderland 12:05 AM - 01:05 AM Seven Lions 01:05 AM - 02:20 AM Restricted 02:20 AM - 03:20 AM Black Tiger Sex Machine 03:20 AM - 04:30 AM Nico Moreno B2B Holy Priest 04:30 AM - 05:30 AM" },
  { day: "sunday", stage: "Circuit Grounds", sets: "Linska 07:00 PM - 08:30 PM ANNA 08:30 PM - 10:00 PM Beltran 10:00 PM - 11:30 PM Chris Stussy 11:30 PM - 01:00 AM Solomun 01:00 AM - 02:30 AM Vintage Culture 02:30 AM - 04:00 AM Kevin de Vries 04:00 AM - 05:30 AM" },
  { day: "sunday", stage: "Neon Garden", sets: "Bad Beat 07:00 PM - 08:15 PM Frankie Bones 08:15 PM - 09:30 PM Adiel 09:30 PM - 10:50 PM DJ Gigola 10:50 PM - 12:10 AM 999999999 12:10 AM - 01:30 AM Indira Paganotto 01:30 AM - 02:50 AM KI/KI 02:50 AM - 04:10 AM Klangkuenstler 04:10 AM - 05:30 AM" },
  { day: "sunday", stage: "Basspod", sets: "Nightstalker with MC Dino 07:00 PM - 07:50 PM Sippy 07:50 PM - 08:40 PM EAZYBAKED 08:40 PM - 09:30 PM INFEKT B2B Samplifire 09:30 PM - 10:30 PM A.M.C with MC Phantom 10:30 PM - 11:30 PM Virtual Riot 11:30 PM - 12:30 AM Peekaboo 12:30 AM - 01:30 AM AHEE B2B Liquid Stranger 01:30 AM - 02:30 AM Whethan 02:30 AM - 03:30 AM Boogie T B2B Distinct Motive 03:30 AM - 04:30 AM ÆON:MODE (Sunrise Set) 04:30 AM - 05:30 AM" },
  { day: "sunday", stage: "Wasteland", sets: "Sihk 07:00 PM - 08:30 PM Clawz 08:30 PM - 09:30 PM The Purge 09:30 PM - 10:30 PM Yosuf 10:30 PM - 11:30 PM DJ Isaac 11:30 PM - 12:30 AM Vieze Asbak 12:30 AM - 01:30 AM Sub Zero Project 01:30 AM - 02:30 AM Rooler 02:30 AM - 03:30 AM Warface 03:30 AM - 04:30 AM MADGRRL B2B VESSEL 04:30 AM - 05:30 AM" },
  { day: "sunday", stage: "Quantum Valley", sets: "Warung 07:00 PM - 08:00 PM Shingo Nakamura 08:00 PM - 09:00 PM Rebūke 09:00 PM - 10:00 PM Cristoph 10:00 PM - 11:00 PM Eli & Fur 11:00 PM - 12:00 AM Tinlicker (DJ Set) 12:00 AM - 01:00 AM Cassian 01:00 AM - 02:15 AM Massano 02:15 AM - 03:30 AM Innellea 03:30 AM - 04:30 AM KREAM 04:30 AM - 05:30 AM" },
  { day: "sunday", stage: "Stereo Bloom", sets: "Klo 07:00 PM - 08:00 PM Murphy's Law 08:00 PM - 09:15 PM Sidney Charles B2B Bushbaby 09:15 PM - 10:30 PM Skream 10:30 PM - 11:45 PM Hamdi 11:45 PM - 01:00 AM Chris Lorenzo B2B Bullet Tooth 01:00 AM - 02:15 AM Silva Bumpa 02:15 AM - 03:30 AM Morgan Seatree 03:30 AM - 04:30 AM Lu.Re 04:30 AM - 05:30 AM" },
  { day: "sunday", stage: "Bionic Jungle", sets: "Alves 07:00 PM - 08:30 PM ISAbella 08:30 PM - 10:30 PM KinAhau 10:30 PM - 12:00 AM Tiga 12:00 AM - 01:30 AM DJ Tennis B2B Red Axes 01:30 AM - 03:30 AM Beltran B2B Simas 03:30 AM - 05:30 AM" }
];

let officialSetTimeCache = null;

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
let currentLocationMode = Boolean(localStore.currentLocationMode);
let selectedFriendId = "";
let parsedEvents = [];
let pendingAuthPhoto = "";
let pendingProfilePhoto = "";
let pendingAuthFile = null;
let pendingProfileFile = null;
let authMode = "new";
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
let selectedStageId = "";
let selectedBucketId = "";
let activePinDrag = null;
let groupRefreshTimer = null;
let groupRenderTimer = null;
let savedGroupRenderToken = 0;
const pinDragOffsets = new Map();
const artistImageCache = new Map();
const artistImagePending = new Map();
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
  hideBase44EditBadge();
  renderDayButtons();
  renderStages();
  bindEvents();
  setGroupMode("create");
  setAuthMode("new");
  await initCloud();
  if (!state.user) hydrateLocalSession({ allowCloudFallback: true });
  renderAuthGate();
}

function hideBase44EditBadge() {
  const selectors = "a, button, div, span, iframe";
  let scanQueued = false;

  const queueScan = () => {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(() => {
      scanQueued = false;
      scan();
    });
  };

  const scan = (root = document) => {
    root.querySelectorAll?.(selectors).forEach((node) => {
      if (node.shadowRoot) scan(node.shadowRoot);
      if (isBase44EditBadge(node)) hideInjectedBadge(node);
    });
  };

  const observer = new MutationObserver(queueScan);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-label", "class", "href", "src", "style", "title"]
  });

  scan();
  window.setTimeout(scan, 800);
  window.setTimeout(scan, 2400);
}

function isBase44EditBadge(node) {
  if (!node || node.dataset?.festivalHideBase44 === "true") return false;

  const label = [
    node.textContent,
    node.getAttribute?.("aria-label"),
    node.getAttribute?.("title"),
    node.getAttribute?.("href"),
    node.getAttribute?.("src"),
    node.id,
    node.className
  ].map((value) => String(value || "")).join(" ").toLowerCase();

  if (!label.includes("base44")) return false;

  const hasEditText = label.includes("edit") || label.includes("remix") || label.includes("builder");
  const rect = typeof node.getBoundingClientRect === "function" ? node.getBoundingClientRect() : null;
  const style = node instanceof HTMLElement ? getComputedStyle(node) : null;
  const floating = style && ["fixed", "absolute", "sticky"].includes(style.position);
  const small = rect && rect.width <= 260 && rect.height <= 120;
  const bottomRight = rect
    && rect.right >= window.innerWidth - 280
    && rect.bottom >= window.innerHeight - 180;
  const iframeBadge = node.tagName === "IFRAME" && label.includes("base44") && floating && bottomRight;

  return Boolean((hasEditText && (floating || bottomRight || small)) || iframeBadge);
}

function hideInjectedBadge(node) {
  node.dataset.festivalHideBase44 = "true";
  node.setAttribute("aria-hidden", "true");
  node.style.setProperty("display", "none", "important");
  node.style.setProperty("visibility", "hidden", "important");
  node.style.setProperty("pointer-events", "none", "important");
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
    "newUserTab",
    "returningUserTab",
    "createGroupButton",
    "joinGroupButton",
    "groupModeHint",
    "regenerateGroupButton",
    "newUserFields",
    "savedGroupPanel",
    "authPhotoCard",
    "authMessage",
    "cloudBadge",
    "currentContext",
    "copyCodeButton",
    "crewProfileButton",
    "groupCodeLabel",
    "map",
    "mapExpandButton",
    "mapCloseButton",
    "expandedFriendList",
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
    "switchGroupButton",
    "profileMessage",
    "profileFriendList",
    "friendDetailDialog",
    "friendDetailName",
    "friendDetailAvatar",
    "friendDetailNow",
    "friendDetailSource",
    "friendDetailGrid",
    "friendDetailSchedule",
    "bucketDialog",
    "bucketTitle",
    "bucketSubtitle",
    "bucketList",
    "stageDetailDialog",
    "stageDetailName",
    "stageDetailPhoto",
    "stageDetailArtist",
    "stageDetailTime",
    "stageDetailSchedule",
    "photoCropDialog",
    "photoCropCanvas",
    "photoCropApply",
    "photoCropCancel",
    "scheduleDialog",
    "scheduleImage",
    "ocrStatus"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  els.authForm.addEventListener("submit", handleAuthSubmit);
  els.authName.addEventListener("input", () => {
    renderAuthPhotoPreview(pendingAuthPhoto, els.authName.value);
    renderSavedGroupOptions();
  });
  els.authPin.addEventListener("input", () => {
    els.authPin.value = cleanPin(els.authPin.value);
    clearVerificationStep();
    renderSavedGroupOptions();
  });
  els.newUserTab.addEventListener("click", () => setAuthMode("new"));
  els.returningUserTab.addEventListener("click", () => setAuthMode("returning"));
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
  els.map.addEventListener("click", handleMapClick);
  els.mapExpandButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setMapExpanded(true);
  });
  els.mapCloseButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setMapExpanded(false);
  });

  els.scheduleButton.addEventListener("click", () => {
    els.scheduleImage.value = "";
    els.ocrStatus.textContent = "";
    parsedEvents = [];
    renderParsedSchedule();
    openDialog(els.scheduleDialog);
  });

  els.timeRange.addEventListener("input", () => {
    timelineFollowsClock = false;
    currentLocationMode = false;
    state.selectedMinute = Number(els.timeRange.value);
    saveLocalStore();
    renderAll();
  });
  els.currentLocationButton.addEventListener("click", toggleCurrentLocationMode);

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

  els.photoCropCanvas.addEventListener("pointerdown", handlePhotoCropPointerDown);
  els.photoCropCanvas.addEventListener("pointermove", handlePhotoCropPointerMove);
  els.photoCropCanvas.addEventListener("pointerup", handlePhotoCropPointerEnd);
  els.photoCropCanvas.addEventListener("pointercancel", handlePhotoCropPointerEnd);
  els.photoCropCanvas.addEventListener("wheel", handlePhotoCropWheel, { passive: false });
  els.photoCropApply.addEventListener("click", applyPhotoCrop);
  els.photoCropCancel.addEventListener("click", cancelPhotoCrop);
  els.photoCropDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    cancelPhotoCrop();
  });

  els.saveProfileButton.addEventListener("click", saveProfile);
  els.switchGroupButton.addEventListener("click", switchGroup);
  els.copyGroupButton.addEventListener("click", copyGroupCode);
  els.copyGroupFromFriendsButton.addEventListener("click", copyGroupCode);

  els.scheduleImage.addEventListener("change", async () => {
    const files = [...(els.scheduleImage.files || [])];
    if (files.length) await recognizeScheduleFiles(files);
  });

  window.addEventListener("online", () => {
    if (state.user?.id && localStore.shareLocation && !locationSharing) {
      startLiveLocation({ quiet: true });
    }
    syncPendingLiveLocation();
    renderAll();
  });
  window.addEventListener("offline", renderAll);
  window.addEventListener("pagehide", captureLastLocationBeforeBackground);
  window.addEventListener("pageshow", resumeLocationAfterReturn);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.map.classList.contains("expanded")) {
      setMapExpanded(false);
    }
  });
  window.addEventListener("pointermove", handlePinDragMove, { passive: false });
  window.addEventListener("pointerup", finishPinDrag);
  window.addEventListener("pointercancel", finishPinDrag);
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
    els.authMessage.textContent = "";
    return false;
  }
}

async function resumeBase44Session() {
  const session = storedSession();
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

function hydrateLocalSession(options = {}) {
  if (services.cloud && !options.allowCloudFallback) return false;
  const session = storedSession();
  if (!session?.uid || !session?.groupCode) return false;

  const group = localStore.groups[session.groupCode] || readGroupBackup(session.groupCode);
  if (group && !localStore.groups[session.groupCode]) {
    localStore.groups[session.groupCode] = group;
  }

  const members = group?.members || {};
  const user = members[session.uid] || Object.values(members).find((member) => member.userId === session.uid);
  if (!group || !user) return false;

  state.selectedDay = localStore.selectedDay || state.selectedDay;
  state.selectedMinute = localStore.selectedMinute || state.selectedMinute;
  state.user = user;
  state.groupCode = session.groupCode;
  state.friends = friendsFromGroup(group);
  selectedFriendId = user.id;
  localStore.session = { uid: user.id, groupCode: session.groupCode };
  persistOfflineSessionBackup(localStore.session, group);
  return true;
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
    if (!validPin(pin)) throw new Error("Enter a 4-6 digit PIN.");
    if (authMode === "returning") {
      await enterFirstSavedGroup(rawName, pin);
      return;
    }
    if (!groupCode) throw new Error("Enter a group code.");
    requestLocationPermissionOnEntry();

    if (services.provider === "base44") {
      const cloudProfile = pendingAuthPhoto
        ? { ...profile, photo: await uploadBase44Photo(pendingAuthFile, pendingAuthPhoto) }
        : profile;
      await enterBase44GroupByName(groupCode, cloudProfile, pin, { creating: groupMode === "create" });
    } else {
      await enterLocalGroupByName(profile, groupCode, pin, { creating: groupMode === "create" });
    }

    els.authForm.reset();
    pendingAuthPhoto = "";
    pendingAuthFile = null;
    currentLocationMode = true;
    localStore.shareLocation = true;
    localStore.currentLocationMode = true;
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

async function enterBase44GroupByName(groupCode, profile, pin, options = {}) {
  const CrewMember = services.base44.entities.CrewMember;
  const records = await CrewMember.filter({ groupCode });
  const allMembers = records.map((record) => normalizeMember(record));
  const removedProfile = allMembers.find((friend) => sameName(friend.name, profile.name) && isRemovedMember(friend));
  if (removedProfile) throw new Error("That profile was removed from this group. Use another user name or ask the group manager.");

  const friends = activeMembers(allMembers);
  const existing = friends.find((friend) => sameName(friend.name, profile.name));
  if (!profile.photo && !existing?.photo) {
    throw new Error("Upload a profile picture before entering the app.");
  }
  const ownerExists = friends.some((friend) => friend.isGroupOwner);
  await enforceBase44GroupLimits(CrewMember, {
    groupCode,
    friends,
    existing,
    creating: Boolean(options.creating)
  });
  const secured = await securedMemberProfile(existing, {
    ...profile,
    isGroupOwner: existing?.isGroupOwner || !ownerExists
  }, groupCode, pin);
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
  window.clearTimeout(groupRefreshTimer);
  window.clearTimeout(groupRenderTimer);
  groupRefreshTimer = null;
  groupRenderTimer = null;

  await refreshBase44Group(groupCode);

  services.unsubscribeGroup = services.base44.entities.CrewMember.subscribe((event) => {
    handleBase44CrewEvent(event, groupCode);
  });
}

function handleBase44CrewEvent(event, groupCode) {
  const data = event?.data;
  if (data?.groupCode && data.groupCode !== groupCode) return;
  if (!data?.id) {
    scheduleGroupRefresh(groupCode);
    return;
  }

  const member = normalizeMember(data);
  if (member.groupCode && member.groupCode !== groupCode) return;

  if (isRemovedMember(member) && (
    member.id === state.user?.id ||
    (member.userId && member.userId === state.user?.userId)
  )) {
    signOutUser({ message: "You were removed from that group. Ask the group manager if this was a mistake." });
    return;
  }

  applyCrewMemberUpdate(member);
  scheduleGroupRender();
}

function scheduleGroupRefresh(groupCode) {
  window.clearTimeout(groupRefreshTimer);
  groupRefreshTimer = window.setTimeout(() => {
    groupRefreshTimer = null;
    refreshBase44Group(groupCode);
  }, GROUP_REFRESH_DEBOUNCE_MS);
}

function scheduleGroupRender() {
  if (groupRenderTimer) return;
  groupRenderTimer = window.setTimeout(() => {
    groupRenderTimer = null;
    cacheCurrentGroup();
    renderAuthGate();
  }, GROUP_RENDER_DEBOUNCE_MS);
}

function applyCrewMemberUpdate(member) {
  if (!member?.id) return;

  const nextFriends = state.friends.filter((friend) => friend.id !== member.id);
  if (!isRemovedMember(member)) nextFriends.push(member);
  state.friends = nextFriends.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  if (member.id === state.user?.id || (member.userId && member.userId === state.user?.userId)) {
    state.user = isRemovedMember(member) ? state.user : member;
  }

  if (selectedFriendId && !state.friends.some((friend) => friend.id === selectedFriendId)) {
    selectedFriendId = state.user?.id || state.friends[0]?.id || "";
  }
}

async function refreshBase44Group(groupCode) {
  try {
    const records = await services.base44.entities.CrewMember.filter({ groupCode });
    const allMembers = records.map((record) => normalizeMember(record));
    const removedCurrent = allMembers.find((friend) => (
      isRemovedMember(friend) &&
      (friend.id === state.user?.id || (friend.userId && friend.userId === state.user?.userId))
    ));
    if (removedCurrent) {
      await signOutUser({ message: "You were removed from that group. Ask the group manager if this was a mistake." });
      return;
    }

    state.friends = activeMembers(allMembers)
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

async function enterLocalGroupByName(profile, groupCode, pin, options = {}) {
  const group = localStore.groups[groupCode] || { code: groupCode, members: {} };
  const allMembers = Object.values(group.members || {}).map(normalizeMember);
  const removedProfile = allMembers.find((friend) => sameName(friend.name, profile.name) && isRemovedMember(friend));
  if (removedProfile) throw new Error("That profile was removed from this group. Use another user name or ask the group manager.");

  const friends = activeMembers(allMembers);
  const existing = friends.find((friend) => sameName(friend.name, profile.name));
  if (!profile.photo && !existing?.photo) {
    throw new Error("Upload a profile picture before entering the app.");
  }
  const ownerExists = friends.some((friend) => friend.isGroupOwner);
  enforceLocalGroupLimits({
    groupCode,
    friends,
    existing,
    creating: Boolean(options.creating)
  });
  const secured = await securedMemberProfile(existing, {
    ...profile,
    isGroupOwner: existing?.isGroupOwner || !ownerExists
  }, groupCode, pin);
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

async function enforceBase44GroupLimits(CrewMember, { groupCode, friends, existing, creating }) {
  if (!existing && friends.length >= MAX_GROUP_MEMBERS) {
    throw new Error(`This group is full. Festival Buddy allows up to ${MAX_GROUP_MEMBERS} people per group.`);
  }

  if (!creating) return;

  if (friends.length && !existing) {
    throw new Error("That group code already exists. Generate a new group code or join it instead.");
  }

  if (friends.length) return;

  const allMembers = await fetchAllCrewMembers(CrewMember);
  const groupCodes = mergedActiveGroupCodes(allMembers, cachedCrewMembers());
  if (!groupCodes.has(groupCode) && groupCodes.size >= MAX_ACTIVE_GROUPS) {
    throw new Error(`Festival Buddy already has ${MAX_ACTIVE_GROUPS} active groups. Ask Yang before creating another group.`);
  }
}

function enforceLocalGroupLimits({ groupCode, friends, existing, creating }) {
  if (!existing && friends.length >= MAX_GROUP_MEMBERS) {
    throw new Error(`This group is full. Festival Buddy allows up to ${MAX_GROUP_MEMBERS} people per group.`);
  }

  if (!creating) return;

  if (friends.length && !existing) {
    throw new Error("That group code already exists. Generate a new group code or join it instead.");
  }

  const groupCodes = activeGroupCodes(cachedCrewMembers());
  if (!groupCodes.has(groupCode) && groupCodes.size >= MAX_ACTIVE_GROUPS) {
    throw new Error(`Festival Buddy already has ${MAX_ACTIVE_GROUPS} active groups. Ask Yang before creating another group.`);
  }
}

async function fetchAllCrewMembers(CrewMember) {
  try {
    const records = await CrewMember.filter({});
    return records.map((record) => normalizeMember(record));
  } catch {
    return [];
  }
}

function activeGroupCodes(members) {
  return new Set(activeMembers(members)
    .map((member) => normalizeGroupCode(member.groupCode))
    .filter(Boolean));
}

function mergedActiveGroupCodes(...memberLists) {
  return new Set(memberLists.flatMap((members) => [...activeGroupCodes(members)]));
}

function cachedCrewMembers() {
  return Object.entries(localStore.groups || {}).flatMap(([code, group]) => (
    Object.values(group.members || {}).map((member) => normalizeMember({
      ...member,
      groupCode: member.groupCode || code
    }))
  ));
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
    applyCrewMemberUpdate(state.user);
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

async function removeFriendFromGroup(friendId) {
  if (!currentUserCanManageGroup()) {
    els.profileMessage.textContent = "Only the group manager can remove people.";
    return;
  }

  const target = state.friends.find((friend) => friend.id === friendId);
  if (!target || target.id === state.user?.id) return;

  const removedAt = new Date().toISOString();
  try {
    if (services.provider === "base44") {
      const removed = await services.base44.entities.CrewMember.update(target.id, sanitizeMember({
        ...target,
        liveLocation: null,
        removedAt,
        removedBy: state.user.id,
        updatedAt: removedAt
      }));
      applyCrewMemberUpdate(normalizeMember(removed));
      cacheCurrentGroup();
      renderAll();
    } else {
      const group = localStore.groups[state.groupCode] || { code: state.groupCode, members: {} };
      group.members[target.id] = normalizeMember({
        ...target,
        liveLocation: null,
        removedAt,
        removedBy: state.user.id
      });
      localStore.groups[state.groupCode] = group;
      state.friends = friendsFromGroup(group);
      cacheCurrentGroup();
      renderAll();
    }

    els.profileMessage.textContent = `${target.name || "Friend"} removed from this group.`;
  } catch (error) {
    els.profileMessage.textContent = error.message || String(error);
  }
}

async function signOutUser(options = {}) {
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
  localStore.currentLocationMode = false;
  currentLocationMode = false;
  clearOfflineSessionBackup();
  saveLocalStore();
  localStorage.removeItem(LAST_GROUP_KEY);
  resetState();
  renderAuthGate();
  if (options.message) els.authMessage.textContent = options.message;
  if (els.profileDialog.open) els.profileDialog.close();
}

async function switchGroup() {
  await signOutUser();
  setGroupMode("join");
  els.authName.value = "";
  els.authPin.value = "";
  els.authGroupCode.value = "";
  pendingAuthPhoto = "";
  pendingAuthFile = null;
  renderAuthPhotoPreview("", "");
  requestAnimationFrame(() => els.authGroupCode.focus());
}

async function toggleLiveLocation() {
  if (locationSharing) {
    const confirmed = window.confirm("Stop sharing live location with friends?");
    if (!confirmed) return;
    currentLocationMode = false;
    stopLiveLocation();
    await clearOwnLiveLocation({ persist: true });
    renderAll();
    return;
  }

  currentLocationMode = true;
  saveLocalStore();
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

  const liveLocation = normalizeLiveLocation({
    lat,
    lon,
    accuracy,
    updatedAt: new Date(position.timestamp || Date.now()).toISOString(),
    online: navigator.onLine,
    source: "gps"
  });

  if (!liveLocation) {
    lastLocationProblem = "GPS unavailable, using schedule";
    renderAll();
    return;
  }

  lastLocationProblem = liveLocation.outsideVenue ? "GPS outside EDC infield, showing the gate" : "";
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
    currentLocationMode = false;
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

function handleVisibilityChange() {
  if (document.visibilityState === "hidden") {
    captureLastLocationBeforeBackground();
    return;
  }

  resumeLocationAfterReturn();
}

function captureLastLocationBeforeBackground() {
  if (!state.user?.id || !localStore.shareLocation || !navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      handleLivePosition(position);
    },
    () => {},
    {
      enableHighAccuracy: true,
      maximumAge: 5 * 1000,
      timeout: 4500
    }
  );
}

function resumeLocationAfterReturn() {
  if (!state.user?.id) return;
  if (localStore.shareLocation && !locationSharing) {
    startLiveLocation({ quiet: true });
  }
  syncPendingLiveLocation();
  renderAll();
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
  els.profileMessage.textContent = currentUserCanManageGroup()
    ? "Manager mode: copy the group code to invite friends or remove stale people."
    : "";
  pendingProfilePhoto = "";
  renderProfilePreview(user);
  renderFriendList(els.profileFriendList, { closeDialog: null, management: true });
  openDialog(els.profileDialog);
}

function setBusy(isBusy) {
  els.authSubmitButton.disabled = isBusy;
  els.authSubmitButton.textContent = isBusy ? "Opening the gate..." : authSubmitLabel();
}

function authSubmitLabel() {
  return authMode === "returning" ? "Open saved group" : "Enter app";
}

function setAuthMode(mode) {
  authMode = mode === "returning" ? "returning" : "new";
  const returning = authMode === "returning";
  els.newUserTab.classList.toggle("active", !returning);
  els.returningUserTab.classList.toggle("active", returning);
  els.newUserTab.setAttribute("aria-selected", String(!returning));
  els.returningUserTab.setAttribute("aria-selected", String(returning));
  els.newUserFields.hidden = returning;
  els.authPhotoCard.hidden = returning;
  els.authGroupCode.required = !returning;
  els.authSubmitButton.textContent = authSubmitLabel();
  if (returning) {
    els.groupModeHint.textContent = "Type your saved user name and PIN, then pick one of your saved groups on this phone.";
  } else {
    setGroupMode(groupMode);
  }
  renderSavedGroupOptions();
  clearVerificationStep();
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
    ? `Start a private crew. Max ${MAX_GROUP_MEMBERS} people per group, ${MAX_ACTIVE_GROUPS} groups total.`
    : `Enter the group code your friend shared with you. Groups cap at ${MAX_GROUP_MEMBERS} people.`;
  if (creating && (previousMode !== "create" || !els.authGroupCode.value.trim())) {
    els.authGroupCode.value = generateGroupCode();
  } else if (!creating) {
    els.authGroupCode.value = "";
  }
  clearVerificationStep();
}

async function renderSavedGroupOptions() {
  if (!els.savedGroupPanel) return;
  const token = ++savedGroupRenderToken;
  els.savedGroupPanel.replaceChildren();

  if (authMode !== "returning") {
    els.savedGroupPanel.hidden = true;
    return;
  }

  els.savedGroupPanel.hidden = false;
  els.savedGroupPanel.append(savedGroupPanelTitle("Saved groups"));

  const rawName = els.authName.value.trim();
  const pin = cleanPin(els.authPin.value);
  if (!rawName) {
    els.savedGroupPanel.append(savedGroupMessage("Enter your user name to find saved groups on this phone."));
    return;
  }
  if (!validPin(pin)) {
    els.savedGroupPanel.append(savedGroupMessage("Enter your 4-6 digit PIN to unlock saved groups."));
    return;
  }

  const matches = await savedGroupMatches(rawName, pin);
  if (token !== savedGroupRenderToken) return;

  els.savedGroupPanel.replaceChildren(savedGroupPanelTitle("Saved groups"));
  if (!matches.length) {
    els.savedGroupPanel.append(savedGroupMessage("No saved group found for that name and PIN on this phone."));
    return;
  }

  matches.forEach((match) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "saved-group-button";
    button.append(
      Object.assign(document.createElement("strong"), { textContent: match.groupCode }),
      Object.assign(document.createElement("span"), { textContent: `${match.friendCount} crew` })
    );
    button.addEventListener("click", async () => {
      setBusy(true);
      els.authMessage.textContent = "";
      try {
        await enterSavedGroup(match);
      } catch (error) {
        els.authMessage.textContent = humanAuthError(error);
      } finally {
        setBusy(false);
      }
    });
    els.savedGroupPanel.append(button);
  });
}

function savedGroupPanelTitle(text) {
  const title = document.createElement("span");
  title.className = "saved-group-title";
  title.textContent = text;
  return title;
}

function savedGroupMessage(text) {
  const message = document.createElement("p");
  message.className = "group-hint";
  message.textContent = text;
  return message;
}

async function savedGroupMatches(rawName, pin) {
  const name = cleanName(rawName);
  const matches = [];
  const seen = new Set();

  for (const [code, group] of Object.entries(localStore.groups || {})) {
    const normalizedGroup = normalizeCachedGroup(code, group);
    if (!normalizedGroup || seen.has(normalizedGroup.code)) continue;
    seen.add(normalizedGroup.code);
    const members = activeMembers(Object.values(normalizedGroup.members || {}));
    const member = members.find((friend) => sameName(friend.name, name));
    if (!member?.pinHash) continue;
    if (await verifyPin(pin, member.pinHash, member.pinSalt, normalizedGroup.code)) {
      matches.push({
        groupCode: normalizedGroup.code,
        group: normalizedGroup,
        member,
        friendCount: members.length
      });
    }
  }

  return matches.sort((a, b) => a.groupCode.localeCompare(b.groupCode));
}

async function enterFirstSavedGroup(rawName, pin) {
  const matches = await savedGroupMatches(rawName, pin);
  if (!matches.length) throw new Error("No saved group found for that name and PIN on this phone.");
  if (matches.length > 1) {
    await renderSavedGroupOptions();
    throw new Error("Select one of your saved groups.");
  }
  await enterSavedGroup(matches[0]);
}

async function enterSavedGroup(match) {
  const group = match.group || localStore.groups[match.groupCode] || readGroupBackup(match.groupCode);
  const member = match.member || Object.values(group?.members || {}).find((friend) => sameName(friend.name, els.authName.value));
  if (!group || !member) throw new Error("That saved group is no longer cached on this phone.");

  const pin = cleanPin(els.authPin.value);
  if (member.pinHash && !(await verifyPin(pin, member.pinHash, member.pinSalt, match.groupCode))) {
    throw new Error("PIN is not correct.");
  }

  localStore.groups[match.groupCode] = group;
  state.user = member;
  state.groupCode = match.groupCode;
  state.friends = friendsFromGroup(group);
  selectedFriendId = member.id;
  localStore.session = { uid: member.id, groupCode: match.groupCode };
  localStorage.setItem(LAST_GROUP_KEY, match.groupCode);
  persistOfflineSessionBackup(localStore.session, group);
  saveLocalStore();

  currentLocationMode = Boolean(localStore.currentLocationMode);
  pendingAuthPhoto = "";
  pendingAuthFile = null;
  els.authForm.reset();
  renderAuthPhotoPreview("", "");
  renderAuthGate();

  if (services.provider === "base44" && services.base44 && navigator.onLine) {
    subscribeToBase44Group(match.groupCode).catch(() => {});
  }
}

function clearVerificationStep() {
  if (els.authSubmitButton) els.authSubmitButton.textContent = authSubmitLabel();
}

function renderAuthGate() {
  const signedIn = Boolean(state.user?.id && state.groupCode);
  els.onboarding.hidden = signedIn;
  els.appShell.hidden = !signedIn;

  if (!signedIn) {
    stopTimelineClock();
    setMapExpanded(false);
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
  els.currentLocationButton.classList.toggle("active", currentLocationMode);
  els.currentLocationButton.setAttribute("aria-pressed", String(currentLocationMode));
  renderLocationState();

  [...els.dayButtons.children].forEach((button, index) => {
    button.classList.toggle("active", Object.keys(days)[index] === state.selectedDay);
  });

  renderRoutes();
  renderStages();
  renderPins();
  renderFriendStrip();
  renderSelectedFriendSummary();
  renderExpandedFriendList();
  if (els.profileDialog.open) renderFriendList(els.profileFriendList, { closeDialog: null, management: true });
  if (els.friendDetailDialog.open) renderFriendDetail();
  if (els.bucketDialog.open) renderBucketDetail();
  if (els.stageDetailDialog.open) renderStageDetail();
}

function handleMapClick(event) {
  if (event.target.closest(".friend-pin, .bucket-pin, .stage-marker, .map-expand-button, .map-close-button, .expanded-friend-list")) return;
  if (!els.map.classList.contains("expanded")) {
    setMapExpanded(true);
  }
}

function setMapExpanded(expanded) {
  els.map.classList.toggle("expanded", expanded);
  document.body.classList.toggle("map-expanded", expanded);
  els.map.setAttribute("aria-expanded", String(expanded));
  els.mapExpandButton.hidden = expanded;
  els.mapCloseButton.hidden = !expanded;
  renderExpandedFriendList();
  window.setTimeout(syncMapOverlays, 80);
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

function toggleCurrentLocationMode() {
  currentLocationMode = !currentLocationMode;
  if (!currentLocationMode) {
    timelineFollowsClock = false;
    saveLocalStore();
    renderAll();
    return;
  }

  timelineFollowsClock = true;
  const synced = syncTimelineToNow({ render: false });

  if (!synced) {
    const day = days[state.selectedDay];
    state.selectedMinute = day.start;
  }

  if (!locationSharing) startLiveLocation({ quiet: true });
  saveLocalStore();
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
  const activeIds = new Set(stages.filter((stage) => stage.id !== "speedway-entry").map((stage) => stage.id));
  [...els.stageLayer.querySelectorAll(".stage-marker")].forEach((marker) => {
    if (!activeIds.has(marker.dataset.stageId)) marker.remove();
  });

  stages.filter((stage) => stage.id !== "speedway-entry").forEach((stage) => {
    const position = screenPositionForStage(stage);
    const now = stageNowSummary(stage);
    let marker = els.stageLayer.querySelector(`[data-stage-id="${cssEscape(stage.id)}"]`);

    if (!marker) {
      marker = document.createElement("button");
      marker.type = "button";
      marker.className = "stage-marker";
      marker.dataset.stageId = stage.id;
      marker.addEventListener("click", (event) => {
        event.stopPropagation();
        selectedStageId = stage.id;
        renderStageDetail(stage);
        openDialog(els.stageDetailDialog);
      });
      marker.append(
        Object.assign(document.createElement("span"), { className: "stage-photo" }),
        Object.assign(document.createElement("span"), { className: "stage-name" }),
        Object.assign(document.createElement("span"), { className: "stage-artist" })
      );
      els.stageLayer.append(marker);
    }

    marker.style.left = `${position.x * 100}%`;
    marker.style.top = `${position.y * 100}%`;
    marker.style.setProperty("--stage-color", stage.color);
    marker.style.setProperty("--stage-art", stage.art);
    marker.setAttribute("aria-label", now ? `${stage.name}, ${now.title}` : stage.name);

    const photo = marker.querySelector(".stage-photo");
    const name = marker.querySelector(".stage-name");
    const artist = marker.querySelector(".stage-artist");
    refreshStagePhoto(photo, stage, now);
    name.textContent = stage.name;
    artist.hidden = !now;
    if (now) {
      artist.textContent = now.label;
      artist.title = now.title;
    } else {
      artist.textContent = "";
      artist.title = "";
    }
  });
}

function refreshStagePhoto(photo, stage, now) {
  const artist = now?.artist || "";
  photo.classList.toggle("artist-active", Boolean(artist));
  photo.title = artist;
  refreshArtistPhoto(photo, artist, stage, stage.short || "");
}

function refreshArtistPhoto(container, artist, stage, fallbackText = "") {
  container.style.setProperty("--stage-art", artist ? artistGradient(artist, stage.color) : stage.art);

  if (!artist) {
    container.dataset.artist = "";
    container.dataset.image = "";
    if (container.textContent !== fallbackText || container.children.length) container.replaceChildren(fallbackText);
    return;
  }

  requestArtistImage(artist);
  const imageUrl = artistImageUrl(artist);
  let image = container.querySelector("img");

  if (!image) {
    container.replaceChildren();
    image = document.createElement("img");
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.hidden = true;
    });
    container.append(image);
  }

  image.hidden = false;
  image.alt = artist;
  if (container.dataset.artist !== artist || container.dataset.image !== imageUrl) {
    container.dataset.artist = artist;
    container.dataset.image = imageUrl;
    image.src = imageUrl;
  }
}

function stageNowSummary(stage) {
  const official = officialEventForStage(stage.id);
  if (!state.user || !state.friends.length) {
    return official ? officialStageSummary(official) : null;
  }

  const matches = state.friends.flatMap((friend) => (
    friend.schedule
      .filter((item) => item.day === state.selectedDay && item.stageId === stage.id && item.start <= state.selectedMinute && state.selectedMinute <= item.end)
      .map((item) => ({ friend, item }))
  ));
  if (!matches.length) return official ? officialStageSummary(official) : null;

  const artistCounts = new Map();
  const friendNames = new Set();
  matches.forEach(({ friend, item }) => {
    const artist = item.artist || "Current set";
    artistCounts.set(artist, (artistCounts.get(artist) || 0) + 1);
    friendNames.add(friend.name || "Friend");
  });

  const artists = [...artistCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([artist]) => artist);
  const visibleArtists = artists.slice(0, 2).join(", ");
  const moreArtists = artists.length > 2 ? ` +${artists.length - 2}` : "";
  const friendsText = friendNames.size === 1 ? "1 friend" : `${friendNames.size} friends`;

  return {
    label: `${visibleArtists}${moreArtists} · ${friendsText}`,
    title: `${artists.join(", ")} - ${[...friendNames].join(", ")}`,
    artist: artists[0]
  };
}

function officialStageSummary(event) {
  return {
    label: event.artist,
    title: `${event.artist} - ${formatTime(event.start)} to ${formatTime(event.end)}`,
    artist: event.artist
  };
}

function officialEventForStage(stageId) {
  return officialSetTimes()
    .filter((event) => (
      event.day === state.selectedDay &&
      event.stageId === stageId &&
      event.start <= state.selectedMinute &&
      state.selectedMinute <= event.end
    ))
    .sort((a, b) => b.start - a.start || a.end - b.end)[0] || null;
}

function officialSetTimes() {
  if (officialSetTimeCache) return officialSetTimeCache;

  officialSetTimeCache = OFFICIAL_SET_TIME_ROWS.flatMap((row) => {
    const stageId = stageIdIn(row.stage);
    if (!stageId) return [];
    return parseOfficialSetString(row.sets).map((event) => ({
      id: `official-${row.day}-${stageId}-${simpleHash(`${event.artist}-${event.start}-${event.end}`)}`,
      artist: cleanArtist(event.artist),
      day: row.day,
      stageId,
      start: event.start,
      end: event.end
    }));
  });

  return officialSetTimeCache;
}

function parseOfficialSetString(sets) {
  const pattern = /(.+?)\s+(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/gi;
  return [...String(sets || "").matchAll(pattern)].map((match) => {
    const range = parseTimeRange(`${match[2]} - ${match[3]}`);
    if (!range) return null;
    return {
      artist: match[1].trim(),
      start: range.start,
      end: range.end
    };
  }).filter(Boolean);
}

function renderRoutes() {
  els.routeLayer.replaceChildren();
}

function renderPins() {
  const layout = pinLayout();
  const nextPositions = new Map();
  const moveThreshold = pinMoveThreshold();
  const activeIds = new Set(layout.singles.map(({ friend }) => friend.id));
  const activeBucketIds = new Set(layout.buckets.map((bucket) => bucket.id));

  [...els.pinLayer.querySelectorAll(".friend-pin")].forEach((pin) => {
    if (!activeIds.has(pin.dataset.friendId)) pin.remove();
  });

  [...els.pinLayer.querySelectorAll(".bucket-pin")].forEach((bucket) => {
    if (!activeBucketIds.has(bucket.dataset.bucketId)) bucket.remove();
  });

  const friendPinById = new Map([...els.pinLayer.querySelectorAll(".friend-pin")]
    .map((pin) => [pin.dataset.friendId, pin]));
  const bucketPinById = new Map([...els.pinLayer.querySelectorAll(".bucket-pin")]
    .map((pin) => [pin.dataset.bucketId, pin]));

  layout.singles.forEach(({ friend, position, grid }) => {
    const previous = lastPinPositions.get(friend.id);
    const isMoving = pinMoved(previous, position, moveThreshold);
    const dragKey = `friend:${friend.id}`;
    let pin = friendPinById.get(friend.id);
    const isNew = !pin;

    if (!pin) {
      pin = document.createElement("button");
      pin.type = "button";
      pin.className = "friend-pin";
      pin.dataset.friendId = friend.id;
      pin.addEventListener("click", (event) => {
        event.stopPropagation();
        if (pin._suppressClick) {
          event.preventDefault();
          return;
        }
        selectedFriendId = friend.id;
        renderAll();
        renderFriendDetail(friend);
        openDialog(els.friendDetailDialog);
      });
      bindPinDrag(pin);
      els.pinLayer.append(pin);
    }

    pin.dataset.pinKey = dragKey;
    pin._basePosition = position;
    pin.classList.toggle("selected", friend.id === selectedFriendId);
    const friendGrid = grid || gridForFriend(friend, position);
    pin.classList.toggle("live", currentLocationMode && Boolean(liveLocationForFriend(friend)));
    pin.style.setProperty("--friend-color", friend.color || "#53e2ff");
    pin.setAttribute("aria-label", `${friend.name}, ${statusText(friend)}, grid ${friendGrid}`);
    pin.dataset.grid = friendGrid;

    let name = pin.querySelector(".pin-name");
    let avatar = pin.querySelector(".pin-head");
    let gridBadge = pin.querySelector(".pin-grid");
    if (!name || !avatar || !gridBadge) {
      pin.replaceChildren();
      name = document.createElement("span");
      name.className = "pin-name";
      avatar = avatarElement(friend, "pin-head");
      gridBadge = document.createElement("span");
      gridBadge.className = "pin-grid";
      pin.append(name, avatar, gridBadge);
    }

    name.textContent = friend.name || "Friend";
    gridBadge.textContent = friendGrid;
    refreshAvatarElement(avatar, friend);

    if (isNew) {
      const start = previous || position;
      setPinElementPosition(pin, visualPositionForPin(dragKey, start));
      if (isMoving) {
        pin.classList.add("walking");
        window.clearTimeout(pin._walkTimer);
        pin._walkTimer = window.setTimeout(() => pin.classList.remove("walking"), 1700);
        requestAnimationFrame(() => {
          setPinElementPosition(pin, visualPositionForPin(dragKey, position));
        });
      } else {
        setPinElementPosition(pin, visualPositionForPin(dragKey, position));
      }
    } else {
      pin.classList.toggle("walking", isMoving);
      if (isMoving) {
        window.clearTimeout(pin._walkTimer);
        pin._walkTimer = window.setTimeout(() => pin.classList.remove("walking"), 1700);
      }
      setPinElementPosition(pin, visualPositionForPin(dragKey, position));
    }

    nextPositions.set(friend.id, position);
  });

  layout.buckets.forEach((bucket) => {
    const key = `bucket:${bucket.id}`;
    const previous = lastPinPositions.get(key) || previousBucketPosition(bucket);
    const isMoving = pinMoved(previous, bucket.position, moveThreshold);
    let pin = bucketPinById.get(bucket.id);
    const isNew = !pin;

    if (!pin) {
      pin = document.createElement("button");
      pin.type = "button";
      pin.className = "bucket-pin";
      pin.dataset.bucketId = bucket.id;
      pin.addEventListener("click", (event) => {
        event.stopPropagation();
        if (pin._suppressClick) {
          event.preventDefault();
          return;
        }
        const currentBucket = pin._bucketData || bucket;
        selectedBucketId = currentBucket.id;
        renderBucketDetail(currentBucket);
        openDialog(els.bucketDialog);
      });
      bindPinDrag(pin);
      els.pinLayer.append(pin);
    }

    pin.dataset.pinKey = key;
    pin._basePosition = bucket.position;
    pin._bucketData = bucket;
    pin.classList.toggle("selected", bucket.friends.some((friend) => friend.id === selectedFriendId));
    pin.style.setProperty("--bucket-color", bucket.friends[0]?.color || "#53e2ff");
    pin.setAttribute("aria-label", `${bucket.friends.length} friends at ${bucket.label}, grid ${bucket.grid}`);
    pin.dataset.grid = bucket.grid;

    let name = pin.querySelector(".bucket-name");
    let stack = pin.querySelector(".bucket-stack");
    let count = pin.querySelector(".bucket-count");
    let smallOne = pin.querySelector(".bucket-small.one");
    let smallTwo = pin.querySelector(".bucket-small.two");
    let gridBadge = pin.querySelector(".pin-grid");
    if (!name || !stack || !count || !smallOne || !smallTwo || !gridBadge) {
      pin.replaceChildren();
      name = document.createElement("span");
      name.className = "bucket-name";
      stack = document.createElement("span");
      stack.className = "bucket-stack";
      count = document.createElement("span");
      count.className = "bucket-count";
      smallOne = document.createElement("span");
      smallOne.className = "bucket-small one";
      smallTwo = document.createElement("span");
      smallTwo.className = "bucket-small two";
      gridBadge = document.createElement("span");
      gridBadge.className = "pin-grid";
      stack.append(count, smallOne, smallTwo);
      pin.append(name, stack, gridBadge);
    }

    const previewFriends = bucket.friends.slice(0, 2);
    name.textContent = `${bucket.friends.length} friends`;
    count.textContent = bucket.friends.length;
    gridBadge.textContent = bucket.grid;
    refreshAvatarElement(smallOne, previewFriends[0] || bucket.friends[0]);
    refreshAvatarElement(smallTwo, previewFriends[1] || bucket.friends[0]);

    if (isNew) {
      const start = previous || bucket.position;
      setPinElementPosition(pin, visualPositionForPin(key, start));
      if (isMoving) {
        pin.classList.add("walking");
        window.clearTimeout(pin._walkTimer);
        pin._walkTimer = window.setTimeout(() => pin.classList.remove("walking"), 1700);
        requestAnimationFrame(() => {
          setPinElementPosition(pin, visualPositionForPin(key, bucket.position));
        });
      } else {
        setPinElementPosition(pin, visualPositionForPin(key, bucket.position));
      }
    } else {
      pin.classList.toggle("walking", isMoving);
      if (isMoving) {
        window.clearTimeout(pin._walkTimer);
        pin._walkTimer = window.setTimeout(() => pin.classList.remove("walking"), 1700);
      }
      setPinElementPosition(pin, visualPositionForPin(key, bucket.position));
    }

    nextPositions.set(key, bucket.position);
    bucket.friends.forEach((friend) => nextPositions.set(friend.id, bucket.position));
  });

  lastPinPositions = nextPositions;
}

function previousBucketPosition(bucket) {
  const positions = bucket.friends
    .map((friend) => lastPinPositions.get(friend.id))
    .filter(Boolean);
  return positions.length ? averagePosition(positions) : null;
}

function pinMoveThreshold() {
  return state.friends.length >= 24 ? LARGE_GROUP_PIN_MOVE_THRESHOLD : PIN_MOVE_THRESHOLD;
}

function pinMoved(previous, next, threshold = PIN_MOVE_THRESHOLD) {
  return Boolean(previous && next && Math.hypot(previous.x - next.x, previous.y - next.y) > threshold);
}

function bindPinDrag(pin) {
  pin.addEventListener("pointerdown", startPinDrag);
}

function startPinDrag(event) {
  if (event.button !== undefined && event.button !== 0) return;

  const pin = event.currentTarget;
  const key = pin.dataset.pinKey;
  if (!key) return;

  activePinDrag = {
    pin,
    key,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startOffset: pinDragOffsets.get(key) || { x: 0, y: 0 },
    basePosition: pin._basePosition || positionFromPinElement(pin),
    moved: false
  };
  pin.classList.add("drag-ready");
  pin.setPointerCapture?.(event.pointerId);
}

function handlePinDragMove(event) {
  if (!activePinDrag || event.pointerId !== activePinDrag.pointerId) return;

  const rect = els.pinLayer.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const dxPixels = event.clientX - activePinDrag.startX;
  const dyPixels = event.clientY - activePinDrag.startY;
  const movedEnough = Math.hypot(dxPixels, dyPixels) >= PIN_DRAG_THRESHOLD_PX;
  if (!activePinDrag.moved && !movedEnough) return;

  activePinDrag.moved = true;
  activePinDrag.pin.classList.add("dragging");
  activePinDrag.pin.classList.remove("walking");
  window.clearTimeout(activePinDrag.pin._walkTimer);

  const nextOffset = {
    x: activePinDrag.startOffset.x + dxPixels / rect.width,
    y: activePinDrag.startOffset.y + dyPixels / rect.height
  };
  const nextPosition = clampMapPosition({
    x: activePinDrag.basePosition.x + nextOffset.x,
    y: activePinDrag.basePosition.y + nextOffset.y
  });
  const clampedOffset = {
    x: nextPosition.x - activePinDrag.basePosition.x,
    y: nextPosition.y - activePinDrag.basePosition.y
  };

  pinDragOffsets.set(activePinDrag.key, clampedOffset);
  setPinElementPosition(activePinDrag.pin, nextPosition);
  event.preventDefault();
}

function finishPinDrag(event) {
  if (!activePinDrag || event.pointerId !== activePinDrag.pointerId) return;

  const { pin, moved, pointerId } = activePinDrag;
  pin.classList.remove("drag-ready", "dragging");
  pin.releasePointerCapture?.(pointerId);
  if (moved) {
    pin._suppressClick = true;
    window.setTimeout(() => {
      pin._suppressClick = false;
    }, 220);
  }
  activePinDrag = null;
}

function visualPositionForPin(key, position) {
  const offset = pinDragOffsets.get(key);
  if (!offset) return position;
  return clampMapPosition({
    x: position.x + offset.x,
    y: position.y + offset.y
  });
}

function setPinElementPosition(pin, position) {
  pin.style.left = `${position.x * 100}%`;
  pin.style.top = `${position.y * 100}%`;
}

function positionFromPinElement(pin) {
  return clampMapPosition({
    x: Number.parseFloat(pin.style.left) / 100 || stageById("speedway-entry").x,
    y: Number.parseFloat(pin.style.top) / 100 || stageById("speedway-entry").y
  });
}

function renderFriendStrip() {
  const members = friendStripMembers();
  const activeIds = new Set(members.map((friend) => friend.id));

  [...els.friendStrip.querySelectorAll(".friend-chip")].forEach((chip) => {
    if (!activeIds.has(chip.dataset.friendId)) chip.remove();
  });

  const existing = new Map([...els.friendStrip.querySelectorAll(".friend-chip")]
    .map((chip) => [chip.dataset.friendId, chip]));

  members.forEach((friend) => {
    let chip = existing.get(friend.id);
    if (!chip) {
      chip = document.createElement("button");
      chip.type = "button";
      chip.className = "friend-chip";
      chip.dataset.friendId = friend.id;
      chip.addEventListener("click", () => {
        openFriendDetailById(chip.dataset.friendId);
      });

      const copy = document.createElement("span");
      copy.className = "chip-copy";
      const name = document.createElement("span");
      name.className = "chip-name";
      const status = document.createElement("span");
      status.className = "chip-status";

      copy.append(name, status);
      chip.append(avatarElement(friend, "mini-avatar"), copy);
    }

    chip.dataset.friendId = friend.id;
    chip.classList.toggle("active", friend.id === selectedFriendId);
    chip.style.setProperty("--friend-color", friend.color || "#53e2ff");
    refreshAvatarElement(chip.querySelector(".mini-avatar"), friend);
    const name = chip.querySelector(".chip-name");
    name.textContent = friend.name || "Friend";
    const status = chip.querySelector(".chip-status");
    status.textContent = statusText(friend);
    els.friendStrip.append(chip);
  });
}

function friendStripMembers() {
  if (state.friends.length <= FRIEND_STRIP_RENDER_LIMIT) return state.friends;

  const priority = [selectedFriend(), currentUser()].filter((friend) => friend?.id);
  const seen = new Set();
  const output = [];
  priority.concat(state.friends).some((friend) => {
    if (!friend?.id || seen.has(friend.id)) return false;
    seen.add(friend.id);
    output.push(friend);
    return output.length >= FRIEND_STRIP_RENDER_LIMIT;
  });
  return output;
}

function renderFriendList(target = els.friendList, options = {}) {
  const closeDialog = options.closeDialog === undefined ? els.friendsDialog : options.closeDialog;
  const management = Boolean(options.management);
  const canManage = management && currentUserCanManageGroup();
  const mode = canManage ? "manager" : "viewer";
  if (target.dataset.listMode !== mode) {
    target.replaceChildren();
    target.dataset.listMode = mode;
  }
  target.classList.toggle("manager-list", management);

  const activeIds = new Set(state.friends.map((friend) => friend.id));
  [...target.querySelectorAll(".friend-row")].forEach((row) => {
    if (!activeIds.has(row.dataset.friendId)) row.remove();
  });
  const existingRows = new Map([...target.querySelectorAll(".friend-row")]
    .map((row) => [row.dataset.friendId, row]));

  state.friends.forEach((friend) => {
    let row = existingRows.get(friend.id);
    if (!row) {
      row = createFriendListRow(friend, { canManage, closeDialog });
    }

    updateFriendListRow(row, friend, { canManage, closeDialog });
    target.append(row);
  });
}

function createFriendListRow(friend, { canManage, closeDialog }) {
  const row = document.createElement(canManage ? "div" : "button");
  if (!canManage) row.type = "button";
  row.className = "friend-row";
  row.dataset.friendId = friend.id;
  row._closeDialog = closeDialog;

  const copy = document.createElement("span");
  copy.className = "chip-copy";
  const name = document.createElement("span");
  name.className = "chip-name";
  const status = document.createElement("span");
  status.className = "chip-status";
  copy.append(name, status);

  if (canManage) {
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "friend-row-main";
    openButton.addEventListener("click", () => openFriendDetailById(row.dataset.friendId, row._closeDialog));
    openButton.append(avatarElement(friend, "mini-avatar"), copy);
    row.append(openButton);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-friend-button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeFriendFromGroup(row.dataset.friendId));
    row.append(removeButton);
  } else {
    row.addEventListener("click", () => openFriendDetailById(row.dataset.friendId, row._closeDialog));
    row.append(avatarElement(friend, "mini-avatar"), copy);
  }

  return row;
}

function updateFriendListRow(row, friend, { canManage, closeDialog }) {
  row.dataset.friendId = friend.id;
  row._closeDialog = closeDialog;
  row.classList.toggle("has-actions", canManage);
  row.classList.toggle("active", friend.id === selectedFriendId);
  row.style.setProperty("--friend-color", friend.color || "#53e2ff");
  refreshAvatarElement(row.querySelector(".mini-avatar"), friend);

  const name = row.querySelector(".chip-name");
  name.textContent = friend.name || "Friend";
  if (friend.isGroupOwner) {
    const manager = document.createElement("span");
    manager.className = "manager-pill";
    manager.textContent = "Manager";
    name.append(manager);
  }

  row.querySelector(".chip-status").textContent = statusText(friend);
  const removeButton = row.querySelector(".remove-friend-button");
  if (removeButton) removeButton.hidden = friend.id === state.user?.id;
}

function openFriendDetailById(friendId, closeDialog = null) {
  const friend = state.friends.find((item) => item.id === friendId);
  if (!friend) return;
  selectedFriendId = friend.id;
  renderAll();
  renderFriendDetail(friend);
  if (closeDialog?.open) closeDialog.close();
  openDialog(els.friendDetailDialog);
}

function renderBucketDetail(bucket = null) {
  const currentBucket = bucket || pinLayout().buckets.find((item) => item.id === selectedBucketId);
  if (!currentBucket) {
    if (els.bucketDialog.open) els.bucketDialog.close();
    return;
  }

  selectedBucketId = currentBucket.id;
  els.bucketTitle.textContent = `${currentBucket.friends.length} friends here`;
  els.bucketSubtitle.textContent = `${currentBucket.label} - GRID ${currentBucket.grid}`;
  if (els.bucketList.dataset.bucketId !== currentBucket.id) {
    els.bucketList.replaceChildren();
    els.bucketList.dataset.bucketId = currentBucket.id;
  }

  const activeIds = new Set(currentBucket.friends.map((friend) => friend.id));
  [...els.bucketList.querySelectorAll(".bucket-row")].forEach((row) => {
    if (!activeIds.has(row.dataset.friendId)) row.remove();
  });
  const existingRows = new Map([...els.bucketList.querySelectorAll(".bucket-row")]
    .map((row) => [row.dataset.friendId, row]));

  currentBucket.friends.forEach((friend) => {
    let row = existingRows.get(friend.id);
    if (!row) {
      row = document.createElement("button");
      row.type = "button";
      row.className = "friend-row bucket-row";
      row.dataset.friendId = friend.id;
      row.addEventListener("click", () => {
        openFriendDetailById(row.dataset.friendId);
        if (els.bucketDialog.open) els.bucketDialog.close();
      });

      const copy = document.createElement("span");
      copy.className = "chip-copy";
      const name = document.createElement("span");
      name.className = "chip-name";
      const status = document.createElement("span");
      status.className = "chip-status";
      const grid = document.createElement("span");
      grid.className = "bucket-row-grid";

      copy.append(name, status);
      row.append(avatarElement(friend, "mini-avatar"), copy, grid);
    }

    row.dataset.friendId = friend.id;
    row.classList.toggle("active", friend.id === selectedFriendId);
    row.style.setProperty("--friend-color", friend.color || "#53e2ff");
    refreshAvatarElement(row.querySelector(".mini-avatar"), friend);
    const friendGrid = gridForFriend(friend);
    const name = row.querySelector(".chip-name");
    name.textContent = friend.name || "Friend";
    name.append(` · ${friendGrid}`);
    row.querySelector(".chip-status").textContent = statusText(friend);
    const grid = row.querySelector(".bucket-row-grid");
    grid.textContent = friendGrid;
    els.bucketList.append(row);
  });
}

function renderFriendDetail(friend = selectedFriend()) {
  const current = state.friends.find((item) => item.id === friend.id) || friend;
  els.friendDetailName.textContent = current.name || "Friend";
  renderAvatarInto(els.friendDetailAvatar, current);
  els.friendDetailNow.textContent = statusText(current);
  const currentGrid = gridForFriend(current);
  els.friendDetailSource.textContent = locationSourceText(current);
  els.friendDetailGrid.textContent = `GRID ${currentGrid}`;
  els.friendDetailSchedule.replaceChildren();

  const dayOrder = new Map(Object.keys(days).map((day, index) => [day, index]));
  const schedule = [...(current.schedule || [])].sort((a, b) => {
    const dayDiff = (dayOrder.get(a.day) || 0) - (dayOrder.get(b.day) || 0);
    return dayDiff || a.start - b.start;
  });

  Object.entries(days).forEach(([dayId, day]) => {
    const dayEvents = schedule.filter((item) => item.day === dayId);
    const section = document.createElement("section");
    section.className = "friend-schedule-day";

    const header = document.createElement("div");
    header.className = "friend-schedule-day-header";
    const title = document.createElement("strong");
    title.textContent = day.label;
    const count = document.createElement("span");
    count.textContent = dayEvents.length ? `${dayEvents.length} sets` : "No sets";
    header.append(title, count);
    section.append(header);

    if (!dayEvents.length) {
      const empty = document.createElement("p");
      empty.className = "friend-schedule-empty";
      empty.textContent = schedule.length ? "Nothing uploaded for this day." : "No schedule uploaded yet.";
      section.append(empty);
      els.friendDetailSchedule.append(section);
      return;
    }

    dayEvents.forEach((item) => {
      const row = document.createElement("div");
      row.className = "parsed-event friend-schedule-event";
      const artist = document.createElement("strong");
      artist.textContent = item.artist;
      const meta = document.createElement("span");
      meta.textContent = `${formatTime(item.start)} to ${formatTime(item.end)} - ${stageById(item.stageId).name}`;
      row.append(artist, meta);
      section.append(row);
    });

    els.friendDetailSchedule.append(section);
  });
}

function renderStageDetail(stage = null) {
  const currentStage = stage || stageById(selectedStageId);
  if (!currentStage?.id || currentStage.id === "speedway-entry") return;

  selectedStageId = currentStage.id;
  const currentSet = officialEventForStage(currentStage.id);
  const currentSummary = currentSet ? officialStageSummary(currentSet) : stageNowSummary(currentStage);
  const artist = currentSummary?.artist || "";

  els.stageDetailName.textContent = currentStage.name;
  refreshArtistPhoto(els.stageDetailPhoto, artist, currentStage, currentStage.short || "");

  els.stageDetailArtist.textContent = artist || "No official set at this time";
  els.stageDetailTime.textContent = currentSet
    ? `${formatTime(currentSet.start)} to ${formatTime(currentSet.end)} on ${days[currentSet.day].label}`
    : `${days[state.selectedDay].label} ${formatTime(state.selectedMinute)}`;

  const sets = officialSetTimes()
    .filter((item) => item.day === state.selectedDay && item.stageId === currentStage.id)
    .sort((a, b) => a.start - b.start);
  const activeIds = new Set(sets.map((item) => item.id));

  [...els.stageDetailSchedule.children].forEach((row) => {
    if (row.dataset.empty === "true" || !activeIds.has(row.dataset.setId)) row.remove();
  });

  if (!sets.length) {
    let empty = els.stageDetailSchedule.querySelector("[data-empty='true']");
    if (!empty) {
      empty = document.createElement("p");
      empty.className = "friend-schedule-empty";
      empty.dataset.empty = "true";
      els.stageDetailSchedule.append(empty);
    }
    empty.textContent = "No official timeline loaded for this stage.";
    return;
  }

  sets.forEach((item) => {
    let row = els.stageDetailSchedule.querySelector(`[data-set-id="${cssEscape(item.id)}"]`);

    if (!row) {
      row = document.createElement("button");
      row.type = "button";
      row.className = "stage-set-row";
      row.dataset.setId = item.id;
      row.addEventListener("click", () => {
        state.selectedDay = item.day;
        state.selectedMinute = item.start;
        timelineFollowsClock = false;
        currentLocationMode = false;
        saveLocalStore();
        renderAll();
      });

      const thumb = document.createElement("span");
      thumb.className = "stage-set-thumb";
      const copy = document.createElement("span");
      copy.className = "chip-copy";
      const name = document.createElement("span");
      name.className = "chip-name";
      const meta = document.createElement("span");
      meta.className = "chip-status";
      copy.append(name, meta);
      row.append(thumb, copy);
    }

    row.classList.toggle("active", item.start <= state.selectedMinute && state.selectedMinute <= item.end);
    row.querySelector(".chip-name").textContent = item.artist;
    row.querySelector(".chip-status").textContent = `${formatTime(item.start)} to ${formatTime(item.end)}`;
    refreshArtistPhoto(row.querySelector(".stage-set-thumb"), item.artist, currentStage, currentStage.short || "");
    els.stageDetailSchedule.append(row);
  });
}

function renderSelectedFriendSummary() {
  const selected = selectedFriend();
  const grid = gridForFriend(selected);
  els.selectedFriendName.replaceChildren(
    document.createTextNode(selected.name || "Your crew"),
    gridBadgeElement(grid, "now-grid")
  );
  els.selectedFriendStage.textContent = nextStopText(selected);
}

function renderExpandedFriendList() {
  if (!els.expandedFriendList) return;
  if (!els.map.classList.contains("expanded")) {
    els.expandedFriendList.replaceChildren();
    return;
  }

  let title = els.expandedFriendList.querySelector(".expanded-friend-title");
  if (!title) {
    title = document.createElement("strong");
    title.className = "expanded-friend-title";
    title.textContent = "Crew grid";
    els.expandedFriendList.append(title);
  }

  const activeIds = new Set(state.friends.map((friend) => friend.id));
  [...els.expandedFriendList.querySelectorAll(".expanded-friend-row")].forEach((row) => {
    if (!activeIds.has(row.dataset.friendId)) row.remove();
  });
  const existingRows = new Map([...els.expandedFriendList.querySelectorAll(".expanded-friend-row")]
    .map((row) => [row.dataset.friendId, row]));

  state.friends.forEach((friend) => {
    let row = existingRows.get(friend.id);
    if (!row) {
      row = document.createElement("button");
      row.type = "button";
      row.className = "expanded-friend-row";
      row.dataset.friendId = friend.id;
      row.addEventListener("click", () => openFriendDetailById(row.dataset.friendId));
      row.append(
        avatarElement(friend, "expanded-avatar"),
        gridBadgeElement(gridForFriend(friend), "expanded-grid-badge"),
        Object.assign(document.createElement("span"), { className: "expanded-friend-name" })
      );
    }

    row.dataset.friendId = friend.id;
    row.classList.toggle("active", friend.id === selectedFriendId);
    row.style.setProperty("--friend-color", friend.color || "#53e2ff");
    refreshAvatarElement(row.querySelector(".expanded-avatar"), friend);
    row.querySelector(".expanded-grid-badge").textContent = gridForFriend(friend);
    row.querySelector(".expanded-friend-name").textContent = friend.name || "Friend";
    els.expandedFriendList.append(row);
  });
}

function gridBadgeElement(grid, className) {
  const badge = document.createElement("span");
  badge.className = className;
  badge.textContent = grid;
  return badge;
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
  refreshAvatarElement(container, friend);
}

function renderParsedSchedule() {
  if (!els.parsedSchedule) return;
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
  parsedEvents = result.events || [];
  renderParsedSchedule();

  if (!parsedEvents.length) {
    els.ocrStatus.textContent = "No sets generated. Try a clearer Insomniac schedule screenshot.";
    return;
  }

  try {
    const saved = await saveParsedScheduleToTimeline();
    const prefix = sourceLabel ? `${sourceLabel}: ` : "";
    els.ocrStatus.textContent = saved
      ? `${prefix}${parsedEvents.length} sets generated and saved to your timeline.`
      : `${prefix}${parsedEvents.length} sets generated.`;
    if (saved) {
      window.setTimeout(() => {
        if (els.scheduleDialog.open) els.scheduleDialog.close();
      }, 900);
    }
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
  if (currentLocationMode) {
    const mapped = locationOverrideForFriend(friend);
    if (mapped?.stageId) return stageById(mapped.stageId);
    return liveModeScheduleStageForFriend(friend) || stageById("speedway-entry");
  }

  return scheduledStageForFriend(friend) || stageById("speedway-entry");
}

function liveModeScheduleStageForFriend(friend) {
  const lastKnown = lastKnownLocationForFriend(friend);
  if (!lastKnown || lastKnown.outsideVenue) return null;
  if (staleLocationShouldUseSchedule(friend, lastKnown) || scheduleSupersedesLastLocation(friend, lastKnown)) {
    return scheduledStageForFriend(friend, { includeUpcoming: true });
  }
  return null;
}

function scheduledStageForFriend(friend, options = {}) {
  const active = activeEvent(friend);
  if (active) return stageById(active.stageId);

  const previous = friend.schedule
    .filter((item) => item.day === state.selectedDay && item.end < state.selectedMinute)
    .sort((a, b) => a.start - b.start)
    .at(-1);

  if (!previous && options.includeUpcoming) {
    const display = displayEvent(friend);
    if (display) return stageById(display.stageId);
  }

  return previous ? stageById(previous.stageId) : null;
}

function activeEvent(friend) {
  return friend.schedule
    .filter((item) => item.day === state.selectedDay && item.start <= state.selectedMinute && state.selectedMinute <= item.end)
    .sort((a, b) => b.start - a.start || a.end - b.end)[0];
}

function displayEvent(friend) {
  const dayEvents = friend.schedule
    .filter((item) => item.day === state.selectedDay)
    .sort((a, b) => a.start - b.start);
  return activeEvent(friend) || dayEvents.find((item) => item.start > state.selectedMinute) || dayEvents.at(-1);
}

function statusText(friend) {
  if (currentLocationMode) {
    const live = liveLocationForFriend(friend);
    if (live) {
      const prefix = live.outsideVenue ? "Outside venue" : "Live GPS";
      return `${prefix}: Grid ${gridForLiveLocation(live)}, ${stageById(live.stageId).name}`;
    }

    const lastKnown = lastKnownLocationForFriend(friend);
    if (lastKnown && staleLocationShouldUseSchedule(friend, lastKnown)) {
      const fallback = activeEvent(friend) || displayEvent(friend);
      if (fallback) return `Schedule fallback: ${fallback.artist}, ${stageById(fallback.stageId).name}`;
    }
    if (lastKnown && !scheduleSupersedesLastLocation(friend, lastKnown)) {
      const prefix = lastKnown.outsideVenue ? "Outside venue" : "Last seen";
      return `${prefix}: Grid ${gridForLiveLocation(lastKnown)}, ${stageById(lastKnown.stageId).name}`;
    }
    return "No live GPS: Speedway Entry";
  }

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
  const selectedIsSelf = friend.id === state.user?.id;

  if (currentLocationMode) {
    const live = liveLocationForFriend(friend);
    const lastKnown = lastKnownLocationForFriend(friend);
    if (live) {
      const source = live.outsideVenue ? "outside EDC, pinned to gate" : "live GPS";
      return `${selectedIsSelf ? "Your" : "Friend"} ${source} at grid ${gridForLiveLocation(live)} ${relativeAge(live.updatedAt)}`;
    }
    if (lastKnown && staleLocationShouldUseSchedule(friend, lastKnown)) {
      const fallback = activeEvent(friend) || displayEvent(friend);
      if (fallback) return `Last seen grid ${gridForLiveLocation(lastKnown)} ${relativeAge(lastKnown.updatedAt)}, using schedule at ${stageById(fallback.stageId).name}`;
    }
    if (lastKnown && !scheduleSupersedesLastLocation(friend, lastKnown)) {
      const source = lastKnown.outsideVenue ? "Last outside EDC, pinned to gate" : (navigator.onLine ? "Last GPS" : "Offline last seen");
      return `${source} grid ${gridForLiveLocation(lastKnown)} ${relativeAge(lastKnown.updatedAt)}`;
    }
    if (lastKnown) return "Schedule after last GPS";
    return "No live GPS, pinned to gate";
  }

  if (selectedIsSelf && lastLocationProblem) return lastLocationProblem;
  return "Timeline";
}

function pinLayout() {
  const groups = new Map();

  state.friends.forEach((friend) => {
    const stage = stageForFriend(friend);
    const basePosition = basePositionForFriend(friend, stage);
    const grid = gridForPosition(basePosition);
    const live = currentLocationMode && liveLocationForFriend(friend);
    const id = live ? `${stage.id}-${grid}` : stage.id;
    const existing = groups.get(id) || {
      id,
      stage,
      label: stage.name,
      friends: [],
      positions: []
    };

    existing.friends.push(friend);
    existing.positions.push(basePosition);
    groups.set(id, existing);
  });

  const singles = [];
  const buckets = [];

  groups.forEach((group) => {
    const center = averagePosition(group.positions);
    const centerGrid = gridForPosition(center);

    if (group.friends.length >= PIN_BUCKET_THRESHOLD) {
      buckets.push({
        id: group.id,
        stageId: group.stage.id,
        label: group.label,
        friends: group.friends,
        position: center,
        grid: centerGrid
      });
      return;
    }

    group.friends.forEach((friend, index) => {
      const position = offsetAroundPosition(group.positions[index] || center, index, group.friends.length);
      singles.push({
        friend,
        stage: group.stage,
        position,
        grid: gridForPosition(position)
      });
    });
  });

  return { singles, buckets };
}

function basePositionForFriend(friend, stage) {
  if (currentLocationMode) {
    const mapped = locationOverrideForFriend(friend);
    if (mapped) return clampMapPosition(screenPositionForLiveLocation(mapped));
  }

  return screenPositionForStage(stage);
}

function averagePosition(positions) {
  if (!positions.length) return screenPositionForStage(stageById("speedway-entry"));
  const total = positions.reduce((sum, position) => ({
    x: sum.x + position.x,
    y: sum.y + position.y
  }), { x: 0, y: 0 });
  return clampMapPosition({
    x: total.x / positions.length,
    y: total.y / positions.length
  });
}

function offsetAroundPosition(position, index, count) {
  if (count <= 1) return clampMapPosition(position);
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  const radius = count === 2 ? 0.026 : 0.036;
  return clampMapPosition({
    x: position.x + Math.cos(angle) * radius,
    y: position.y + Math.sin(angle) * radius
  });
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
  if (currentLocationMode) {
    const mapped = locationOverrideForFriend(friend);
    if (mapped) {
      return clampMapPosition(screenPositionForLiveLocation(mapped));
    }
  }

  return clampMapPosition(offsetPosition(friend, stage, groups));
}

function gridForFriend(friend, knownPosition = null) {
  const position = knownPosition || basePositionForFriend(friend, stageForFriend(friend));
  return gridForPosition(position);
}

function gridForPosition(position) {
  const rawX = Number(position?.x);
  const rawY = Number(position?.y);
  const x = clamp(Number.isFinite(rawX) ? rawX : stageById("speedway-entry").x, MAP_GRID.minX, MAP_GRID.maxX);
  const y = clamp(Number.isFinite(rawY) ? rawY : stageById("speedway-entry").y, MAP_GRID.minY, MAP_GRID.maxY);
  const columnSize = (MAP_GRID.maxX - MAP_GRID.minX) / MAP_GRID.columns.length;
  const rowSize = (MAP_GRID.maxY - MAP_GRID.minY) / MAP_GRID.rows;
  const columnIndex = clamp(Math.floor((x - MAP_GRID.minX) / columnSize), 0, MAP_GRID.columns.length - 1);
  const rowIndex = clamp(Math.floor((y - MAP_GRID.minY) / rowSize), 0, MAP_GRID.rows - 1);
  return `${MAP_GRID.columns[columnIndex]}${rowIndex + 1}`;
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
  const u = (clamp(x, MAP_GRID.minX, MAP_GRID.maxX) - MAP_GRID.minX) / (MAP_GRID.maxX - MAP_GRID.minX);
  const v = (clamp(y, MAP_GRID.minY, MAP_GRID.maxY) - MAP_GRID.minY) / (MAP_GRID.maxY - MAP_GRID.minY);
  return unprojectGeoPoint(bilinearPoint(geoCorner("topLeft"), geoCorner("topRight"), geoCorner("bottomRight"), geoCorner("bottomLeft"), u, v));
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
  if (!locationCanPin(live)) return null;
  if (!navigator.onLine) return null;
  const updatedAt = Date.parse(live.updatedAt);
  if (!Number.isFinite(updatedAt)) return null;
  if (Date.now() - updatedAt > LIVE_LOCATION_MAX_AGE_MS) return null;
  return live;
}

function locationOverrideForFriend(friend) {
  const live = liveLocationForFriend(friend);
  if (live) return live;

  const lastKnown = lastKnownLocationForFriend(friend);
  if (!lastKnown) return null;
  if (staleLocationShouldUseSchedule(friend, lastKnown)) return null;
  return scheduleSupersedesLastLocation(friend, lastKnown) ? null : lastKnown;
}

function lastKnownLocationForFriend(friend) {
  const live = normalizeLiveLocation(friend?.liveLocation);
  if (!locationCanPin(live)) return null;
  return live;
}

function locationCanPin(live) {
  return Boolean(live && (live.insideFestival || live.outsideVenue));
}

function staleLocationShouldUseSchedule(friend, lastKnown) {
  if (lastKnown?.outsideVenue) return false;
  if (!liveLocationIsStale(lastKnown)) return false;
  return Boolean(activeEvent(friend) || displayEvent(friend));
}

function liveLocationIsStale(live) {
  const updatedAt = Date.parse(live?.updatedAt || "");
  return Number.isFinite(updatedAt) && Date.now() - updatedAt > LIVE_LOCATION_MAX_AGE_MS;
}

function gridForLiveLocation(live) {
  return gridForPosition(screenPositionForLiveLocation(live));
}

function scheduleSupersedesLastLocation(friend, lastKnown) {
  if (lastKnown?.outsideVenue) return false;
  const active = activeEvent(friend);
  if (!active) return false;

  const lastUpdated = Date.parse(lastKnown.updatedAt);
  const activeStart = eventStartDate(active)?.getTime();
  const selectedMoment = selectedMomentDate()?.getTime();
  if (![lastUpdated, activeStart, selectedMoment].every(Number.isFinite)) return false;

  return selectedMoment >= activeStart && lastUpdated < activeStart;
}

function selectedMomentDate() {
  const day = days[state.selectedDay] ? state.selectedDay : "friday";
  return festivalMinuteDate(day, state.selectedMinute);
}

function eventStartDate(event) {
  if (!event?.day || !days[event.day]) return null;
  return festivalMinuteDate(event.day, event.start);
}

function festivalMinuteDate(day, minute) {
  const windowStart = festivalWindows[day]?.start;
  if (!windowStart || !Number.isFinite(Number(minute))) return null;
  const midnight = new Date(windowStart);
  midnight.setHours(0, 0, 0, 0);
  return new Date(midnight.getTime() + Number(minute) * 60 * 1000);
}

function normalizeLiveLocation(value) {
  if (!value || typeof value !== "object") return null;
  const lat = Number(value.lat);
  const lon = Number(value.lon);
  const updatedAt = value.updatedAt || value.timestamp || "";

  if (![lat, lon].every(Number.isFinite) || !updatedAt) return null;

  const mappedPosition = mapPositionForCoordinate(lat, lon);
  const insideFestival = coordinateWithinEdc(lat, lon, value.accuracy) && Boolean(mappedPosition);
  const outsideVenue = value.outsideVenue === true || value.source === "outside-gate" || !insideFestival;
  const gate = stageById("speedway-entry");
  const legacyX = Number(value.x);
  const legacyY = Number(value.y);
  const rawX = mappedPosition?.x ?? legacyX;
  const rawY = mappedPosition?.y ?? legacyY;
  const x = outsideVenue ? gate.x : rawX;
  const y = outsideVenue ? gate.y : rawY;
  if (![x, y].every(Number.isFinite)) return null;

  return {
    lat,
    lon,
    x: clamp(x, 0, 1),
    y: clamp(y, 0, 1),
    accuracy: Number.isFinite(Number(value.accuracy)) ? Number(value.accuracy) : null,
    updatedAt,
    online: value.online !== false,
    source: outsideVenue ? "outside-gate" : (value.source || "gps"),
    stageId: outsideVenue ? "speedway-entry" : nearestStageId(x, y),
    insideFestival,
    outsideVenue
  };
}

function coordinateWithinEdc(lat, lon, accuracy = 0) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return false;
  const accuracyMargin = Number.isFinite(Number(accuracy)) ? Math.min(0.002, Math.max(0, Number(accuracy) / 111000)) : 0;
  const margin = Math.max(EDC_GEO_MARGIN, accuracyMargin);
  const inBounds = lat >= EDC_GEO_BOUNDS.south - margin
    && lat <= EDC_GEO_BOUNDS.north + margin
    && lon >= EDC_GEO_BOUNDS.west - margin
    && lon <= EDC_GEO_BOUNDS.east + margin;
  if (!inBounds) return false;

  return pointInGeoPolygon({ lat, lon }, EDC_GEO_POLYGON)
    || distanceToGeoPolygon({ lat, lon }, EDC_GEO_POLYGON) <= margin;
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
  return mapPositionForCoordinate(EDC_CENTER.lat, lon)?.x ?? OFFICIAL_MAP_FRAME.minX;
}

function geoY(lat) {
  return mapPositionForCoordinate(lat, EDC_CENTER.lon)?.y ?? OFFICIAL_MAP_FRAME.minY;
}

function normalizedGeoPoint(lat, lon) {
  return {
    x: (lon - EDC_GEO_BOUNDS.west) / (EDC_GEO_BOUNDS.east - EDC_GEO_BOUNDS.west),
    y: (EDC_GEO_BOUNDS.north - lat) / (EDC_GEO_BOUNDS.north - EDC_GEO_BOUNDS.south)
  };
}

function mapPositionForCoordinate(lat, lon) {
  const grid = geoGridCoordinates(lat, lon);
  if (!grid) return null;

  return clampMapPosition({
    x: MAP_GRID.minX + clamp(grid.u, 0, 1) * (MAP_GRID.maxX - MAP_GRID.minX),
    y: MAP_GRID.minY + clamp(grid.v, 0, 1) * (MAP_GRID.maxY - MAP_GRID.minY)
  });
}

function geoGridCoordinates(lat, lon) {
  if (![lat, lon].every(Number.isFinite)) return null;

  const point = projectGeoPoint({ lat, lon });
  const topLeft = geoCorner("topLeft");
  const topRight = geoCorner("topRight");
  const bottomRight = geoCorner("bottomRight");
  const bottomLeft = geoCorner("bottomLeft");
  let { u, v } = initialGridGuess(point, topLeft, topRight, bottomLeft);

  for (let index = 0; index < 8; index += 1) {
    const current = bilinearPoint(topLeft, topRight, bottomRight, bottomLeft, u, v);
    const du = {
      x: (1 - v) * (topRight.x - topLeft.x) + v * (bottomRight.x - bottomLeft.x),
      y: (1 - v) * (topRight.y - topLeft.y) + v * (bottomRight.y - bottomLeft.y)
    };
    const dv = {
      x: (1 - u) * (bottomLeft.x - topLeft.x) + u * (bottomRight.x - topRight.x),
      y: (1 - u) * (bottomLeft.y - topLeft.y) + u * (bottomRight.y - topRight.y)
    };
    const delta = { x: point.x - current.x, y: point.y - current.y };
    const det = du.x * dv.y - du.y * dv.x;
    if (Math.abs(det) < 1e-12) break;
    u += (delta.x * dv.y - delta.y * dv.x) / det;
    v += (du.x * delta.y - du.y * delta.x) / det;
  }

  return Number.isFinite(u) && Number.isFinite(v) ? { u, v } : null;
}

function initialGridGuess(point, topLeft, topRight, bottomLeft) {
  const a = { x: topRight.x - topLeft.x, y: topRight.y - topLeft.y };
  const b = { x: bottomLeft.x - topLeft.x, y: bottomLeft.y - topLeft.y };
  const p = { x: point.x - topLeft.x, y: point.y - topLeft.y };
  const det = a.x * b.y - a.y * b.x;
  if (Math.abs(det) < 1e-12) return { u: 0.5, v: 0.5 };
  return {
    u: (p.x * b.y - p.y * b.x) / det,
    v: (a.x * p.y - a.y * p.x) / det
  };
}

function pointInGeoPolygon(point, polygon) {
  let inside = false;
  for (let index = 0, prev = polygon.length - 1; index < polygon.length; prev = index, index += 1) {
    const current = polygon[index];
    const previous = polygon[prev];
    const crosses = ((current.lat > point.lat) !== (previous.lat > point.lat))
      && point.lon < (previous.lon - current.lon) * (point.lat - current.lat) / (previous.lat - current.lat) + current.lon;
    if (crosses) inside = !inside;
  }
  return inside;
}

function distanceToGeoPolygon(point, polygon) {
  const projected = projectGeoPoint(point);
  let best = Infinity;
  for (let index = 0; index < polygon.length; index += 1) {
    const start = projectGeoPoint(polygon[index]);
    const end = projectGeoPoint(polygon[(index + 1) % polygon.length]);
    best = Math.min(best, distanceToSegment(projected, start, end));
  }
  return best;
}

function distanceToSegment(point, start, end) {
  const segment = { x: end.x - start.x, y: end.y - start.y };
  const lengthSquared = segment.x ** 2 + segment.y ** 2;
  if (!lengthSquared) return Math.hypot(point.x - start.x, point.y - start.y);
  const t = clamp(((point.x - start.x) * segment.x + (point.y - start.y) * segment.y) / lengthSquared, 0, 1);
  return Math.hypot(point.x - (start.x + segment.x * t), point.y - (start.y + segment.y * t));
}

function geoCorner(name) {
  return projectGeoPoint(EDC_GRID_GEO_CORNERS[name]);
}

function projectGeoPoint(point) {
  return {
    x: (point.lon - EDC_CENTER.lon) * GEO_X_SCALE,
    y: point.lat - EDC_CENTER.lat
  };
}

function unprojectGeoPoint(point) {
  return {
    lat: point.y + EDC_CENTER.lat,
    lon: point.x / GEO_X_SCALE + EDC_CENTER.lon
  };
}

function bilinearPoint(topLeft, topRight, bottomRight, bottomLeft, u, v) {
  return {
    x: (1 - u) * (1 - v) * topLeft.x + u * (1 - v) * topRight.x + u * v * bottomRight.x + (1 - u) * v * bottomLeft.x,
    y: (1 - u) * (1 - v) * topLeft.y + u * (1 - v) * topRight.y + u * v * bottomRight.y + (1 - u) * v * bottomLeft.y
  };
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

function friendWithDisplayName(friend) {
  return {
    ...friend,
    name: cleanName(friend?.name || "Friend")
  };
}

function avatarElement(friend, className) {
  const avatar = document.createElement("span");
  const displayFriend = friendWithDisplayName(friend);
  avatar.className = className;
  refreshAvatarElement(avatar, displayFriend);
  return avatar;
}

function refreshAvatarElement(avatar, friend) {
  const displayFriend = friendWithDisplayName(friend);
  avatar.style.setProperty("--friend-color", displayFriend.color || "#53e2ff");
  const nextPhoto = navigator.onLine ? displayFriend.photo || "" : "";
  const nextInitials = initials(displayFriend.name);
  if (avatar.dataset.photo === nextPhoto && avatar.dataset.initials === nextInitials) return;

  avatar.dataset.photo = nextPhoto;
  avatar.dataset.initials = nextInitials;
  avatar.replaceChildren();

  if (nextPhoto) {
    const image = document.createElement("img");
    image.src = nextPhoto;
    image.alt = "";
    avatar.append(image);
  } else {
    avatar.textContent = nextInitials;
  }
}

async function securedMemberProfile(existing, profile, groupCode, pin) {
  if (existing?.pinHash) {
    const pinMatches = await verifyPin(pin, existing.pinHash, existing.pinSalt, groupCode);
    if (!pinMatches) {
      throw new Error("PIN is not correct.");
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
    isGroupOwner: Boolean(existing?.isGroupOwner || profile.isGroupOwner),
    createdAt: existing?.createdAt || profile.createdAt || new Date().toISOString(),
    removedAt: "",
    removedBy: "",
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
    isGroupOwner: Boolean(member.isGroupOwner),
    createdAt: member.createdAt || member.created_at || member.created_date || "",
    removedAt: member.removedAt || "",
    removedBy: member.removedBy || "",
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
    isGroupOwner: normalized.isGroupOwner,
    createdAt: normalized.createdAt,
    removedAt: normalized.removedAt,
    removedBy: normalized.removedBy,
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
  return activeMembers(Object.values(group.members || {}).map(normalizeMember))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

function activeMembers(members) {
  return members.filter((member) => !isRemovedMember(member));
}

function isRemovedMember(member) {
  return Boolean(member?.removedAt);
}

function currentUserCanManageGroup() {
  const user = currentUser();
  if (!user?.id) return false;
  if (user.isGroupOwner) return true;
  return !state.friends.some((friend) => friend.isGroupOwner && !isRemovedMember(friend));
}

function defaultLocalStore() {
  return {
    session: null,
    groups: {},
    selectedDay: "friday",
    selectedMinute: days.friday.start,
    shareLocation: false,
    currentLocationMode: false,
    pendingLiveLocation: null
  };
}

function loadLocalStore() {
  const defaults = defaultLocalStore();
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.groups) {
      return storeWithOfflineBackups({
        ...defaults,
        ...stored,
        shareLocation: Boolean(stored.shareLocation),
        currentLocationMode: Boolean(stored.currentLocationMode),
        pendingLiveLocation: stored.pendingLiveLocation || null
      });
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return storeWithOfflineBackups(defaults);
}

function storeWithOfflineBackups(store) {
  const next = {
    ...store,
    groups: { ...(store.groups || {}) }
  };
  const session = normalizeSession(next.session) || readSessionBackup();
  if (session) {
    next.session = session;
    if (days[session.selectedDay]) next.selectedDay = session.selectedDay;
    if (Number.isFinite(session.selectedMinute)) next.selectedMinute = session.selectedMinute;
    if (typeof session.currentLocationMode === "boolean") next.currentLocationMode = session.currentLocationMode;
    if (typeof session.shareLocation === "boolean") next.shareLocation = session.shareLocation;
    const backupGroup = readGroupBackup(session.groupCode);
    if (backupGroup && !next.groups[session.groupCode]) {
      next.groups[session.groupCode] = backupGroup;
    }
  }
  return next;
}

function saveLocalStore() {
  localStore.selectedDay = state.selectedDay;
  localStore.selectedMinute = state.selectedMinute;
  localStore.currentLocationMode = currentLocationMode;
  persistOfflineSessionBackup(
    localStore.session,
    localStore.session?.groupCode ? localStore.groups[localStore.session.groupCode] : null
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localStore));
  } catch {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leanLocalStore(localStore)));
    } catch {
      // Keep the in-memory group alive even if the browser storage quota is full.
    }
  }
}

function leanLocalStore(store) {
  const groups = {};
  Object.entries(store.groups || {}).forEach(([code, group]) => {
    const members = {};
    Object.entries(group.members || {}).forEach(([id, member]) => {
      members[id] = {
        ...member,
        photo: ""
      };
    });
    groups[code] = {
      ...group,
      members
    };
  });

  return {
    ...store,
    groups
  };
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
  persistOfflineSessionBackup(localStore.session, localStore.groups[state.groupCode]);
  saveLocalStore();
}

function storedSession() {
  return normalizeSession(localStore.session) || readSessionBackup();
}

function normalizeSession(session) {
  const uid = session?.uid || session?.userId || "";
  const groupCode = normalizeGroupCode(session?.groupCode || "");
  if (!uid || !groupCode) return null;
  return {
    uid,
    groupCode,
    selectedDay: days[session.selectedDay] ? session.selectedDay : "",
    selectedMinute: Number.isFinite(Number(session.selectedMinute)) ? Number(session.selectedMinute) : null,
    currentLocationMode: typeof session.currentLocationMode === "boolean" ? session.currentLocationMode : null,
    shareLocation: typeof session.shareLocation === "boolean" ? session.shareLocation : null
  };
}

function readSessionBackup() {
  try {
    return normalizeSession(JSON.parse(localStorage.getItem(SESSION_BACKUP_KEY) || "null"));
  } catch {
    localStorage.removeItem(SESSION_BACKUP_KEY);
    return null;
  }
}

function readGroupBackup(groupCode) {
  const code = normalizeGroupCode(groupCode);
  if (!code) return null;
  try {
    const stored = JSON.parse(localStorage.getItem(`${GROUP_BACKUP_PREFIX}${code}`) || "null");
    return normalizeCachedGroup(code, stored?.group || stored);
  } catch {
    localStorage.removeItem(`${GROUP_BACKUP_PREFIX}${code}`);
    return null;
  }
}

function normalizeCachedGroup(groupCode, group) {
  if (!group?.members) return null;
  const code = normalizeGroupCode(group?.code || groupCode);
  const members = {};
  Object.entries(group.members || {}).forEach(([id, member]) => {
    const normalized = normalizeMember({
      ...member,
      id: member.id || id,
      groupCode: member.groupCode || code
    });
    members[normalized.id || id] = normalized;
  });
  return { code, members };
}

function persistOfflineSessionBackup(session, group) {
  const normalized = normalizeSession(session);
  if (!normalized) return;

  try {
    localStorage.setItem(SESSION_BACKUP_KEY, JSON.stringify({
      ...normalized,
      selectedDay: state.selectedDay,
      selectedMinute: state.selectedMinute,
      currentLocationMode,
      shareLocation: Boolean(localStore.shareLocation),
      savedAt: new Date().toISOString()
    }));
    localStorage.setItem(LAST_GROUP_KEY, normalized.groupCode);
  } catch {
    // The main store still holds the live in-memory session for this page.
  }

  if (!group) return;
  try {
    localStorage.setItem(`${GROUP_BACKUP_PREFIX}${normalized.groupCode}`, JSON.stringify({
      savedAt: new Date().toISOString(),
      group: compactOfflineGroup(normalized.groupCode, group)
    }));
  } catch {
    // Offline restore can still use the primary store if this compact backup cannot be written.
  }
}

function compactOfflineGroup(groupCode, group) {
  const code = normalizeGroupCode(group?.code || groupCode);
  const members = {};
  Object.entries(group?.members || {}).forEach(([id, member]) => {
    const normalized = normalizeMember({
      ...member,
      id: member.id || id,
      groupCode: member.groupCode || code
    });
    members[normalized.id || id] = {
      id: normalized.id,
      userId: normalized.userId,
      name: normalized.name,
      photo: offlinePhotoValue(normalized.photo),
      color: normalized.color,
      isGroupOwner: normalized.isGroupOwner,
      createdAt: normalized.createdAt,
      removedAt: normalized.removedAt,
      removedBy: normalized.removedBy,
      pinHash: normalized.pinHash,
      pinSalt: normalized.pinSalt,
      groupCode: code,
      schedule: normalized.schedule,
      liveLocation: normalized.liveLocation
    };
  });
  return { code, members };
}

function offlinePhotoValue(photo) {
  if (!photo || String(photo).startsWith("data:")) return "";
  return photo;
}

function clearOfflineSessionBackup() {
  const session = storedSession();
  try {
    localStorage.removeItem(SESSION_BACKUP_KEY);
    if (session?.groupCode) localStorage.removeItem(`${GROUP_BACKUP_PREFIX}${session.groupCode}`);
  } catch {
    // Storage cleanup is best effort.
  }
}

function resetState() {
  currentLocationMode = Boolean(localStore.currentLocationMode);
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
      resolve,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      pointers: new Map(),
      gesture: null
    };
    drawPhotoCropPreview();
    openDialog(els.photoCropDialog);
  });
}

function drawPhotoCropPreview() {
  if (!cropState?.image) return;

  const canvas = els.photoCropCanvas;
  const context = canvas.getContext("2d");
  const size = canvas.width;
  clampPhotoCropOffset();
  const metrics = photoCropMetrics(size);

  context.clearRect(0, 0, size, size);
  context.fillStyle = "#f2f3f7";
  context.fillRect(0, 0, size, size);

  context.save();
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.465, 0, Math.PI * 2);
  context.clip();
  context.drawImage(cropState.image, metrics.x, metrics.y, metrics.width, metrics.height);
  context.restore();

  context.save();
  context.fillStyle = "rgba(17, 17, 20, 0.16)";
  context.fillRect(0, 0, size, size);
  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.465, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.lineWidth = 5;
  context.strokeStyle = "rgba(255, 255, 255, 0.94)";
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.465, 0, Math.PI * 2);
  context.stroke();
}

function photoCropMetrics(size, zoom = cropState.zoom, offsetX = cropState.offsetX, offsetY = cropState.offsetY) {
  const image = cropState.image;
  const scale = Math.max(size / image.width, size / image.height) * zoom;
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    x: (size - width) / 2 + offsetX,
    y: (size - height) / 2 + offsetY,
    width,
    height,
    scale,
    maxOffsetX: Math.max(0, (width - size) / 2),
    maxOffsetY: Math.max(0, (height - size) / 2)
  };
}

function clampPhotoCropOffset() {
  if (!cropState?.image) return;
  cropState.zoom = clamp(cropState.zoom || 1, 1, 3.5);
  const metrics = photoCropMetrics(els.photoCropCanvas.width);
  cropState.offsetX = clamp(cropState.offsetX || 0, -metrics.maxOffsetX, metrics.maxOffsetX);
  cropState.offsetY = clamp(cropState.offsetY || 0, -metrics.maxOffsetY, metrics.maxOffsetY);
}

function photoCropPoint(event) {
  const canvas = els.photoCropCanvas;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function distanceBetween(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function midpoint(left, right) {
  return {
    x: (left.x + right.x) / 2,
    y: (left.y + right.y) / 2
  };
}

function activeCropPointers() {
  return [...(cropState?.pointers?.values() || [])];
}

function setPhotoCropZoom(nextZoom, focus) {
  if (!cropState?.image) return;
  const size = els.photoCropCanvas.width;
  const current = photoCropMetrics(size);
  const imageFocusX = (focus.x - current.x) / current.scale;
  const imageFocusY = (focus.y - current.y) / current.scale;

  cropState.zoom = clamp(nextZoom, 1, 3.5);
  const next = photoCropMetrics(size);
  cropState.offsetX = focus.x - imageFocusX * next.scale - (size - next.width) / 2;
  cropState.offsetY = focus.y - imageFocusY * next.scale - (size - next.height) / 2;
  clampPhotoCropOffset();
}

function handlePhotoCropPointerDown(event) {
  if (!cropState) return;
  event.preventDefault();
  els.photoCropCanvas.setPointerCapture?.(event.pointerId);
  cropState.pointers.set(event.pointerId, photoCropPoint(event));
  const points = activeCropPointers();

  if (points.length === 1) {
    cropState.gesture = {
      type: "pan",
      startPoint: points[0],
      startOffsetX: cropState.offsetX,
      startOffsetY: cropState.offsetY
    };
    return;
  }

  if (points.length >= 2) {
    cropState.gesture = {
      type: "pinch",
      lastDistance: distanceBetween(points[0], points[1]),
      lastCenter: midpoint(points[0], points[1])
    };
  }
}

function handlePhotoCropPointerMove(event) {
  if (!cropState?.pointers?.has(event.pointerId)) return;
  event.preventDefault();
  cropState.pointers.set(event.pointerId, photoCropPoint(event));
  const points = activeCropPointers();

  if (points.length >= 2) {
    const distance = Math.max(1, distanceBetween(points[0], points[1]));
    const center = midpoint(points[0], points[1]);
    const lastDistance = Math.max(1, cropState.gesture?.lastDistance || distance);
    const lastCenter = cropState.gesture?.lastCenter || center;
    setPhotoCropZoom(cropState.zoom * (distance / lastDistance), center);
    cropState.offsetX += center.x - lastCenter.x;
    cropState.offsetY += center.y - lastCenter.y;
    cropState.gesture = { type: "pinch", lastDistance: distance, lastCenter: center };
    clampPhotoCropOffset();
    drawPhotoCropPreview();
    return;
  }

  if (points.length === 1) {
    if (cropState.gesture?.type !== "pan") {
      cropState.gesture = {
        type: "pan",
        startPoint: points[0],
        startOffsetX: cropState.offsetX,
        startOffsetY: cropState.offsetY
      };
    }
    cropState.offsetX = cropState.gesture.startOffsetX + points[0].x - cropState.gesture.startPoint.x;
    cropState.offsetY = cropState.gesture.startOffsetY + points[0].y - cropState.gesture.startPoint.y;
    clampPhotoCropOffset();
    drawPhotoCropPreview();
  }
}

function handlePhotoCropPointerEnd(event) {
  if (!cropState?.pointers) return;
  cropState.pointers.delete(event.pointerId);
  els.photoCropCanvas.releasePointerCapture?.(event.pointerId);
  const points = activeCropPointers();

  cropState.gesture = points.length === 1
    ? {
      type: "pan",
      startPoint: points[0],
      startOffsetX: cropState.offsetX,
      startOffsetY: cropState.offsetY
    }
    : null;
}

function handlePhotoCropWheel(event) {
  if (!cropState) return;
  event.preventDefault();
  const point = photoCropPoint(event);
  const factor = event.deltaY > 0 ? 0.92 : 1.08;
  setPhotoCropZoom(cropState.zoom * factor, point);
  drawPhotoCropPreview();
}

function croppedPhotoDataUrl() {
  const output = document.createElement("canvas");
  output.width = PROFILE_PHOTO_SIZE;
  output.height = PROFILE_PHOTO_SIZE;
  const context = output.getContext("2d");
  const previewSize = els.photoCropCanvas.width;
  const scale = output.width / previewSize;
  const metrics = photoCropMetrics(previewSize);
  context.fillStyle = "#f2f3f7";
  context.fillRect(0, 0, output.width, output.height);
  context.drawImage(
    cropState.image,
    metrics.x * scale,
    metrics.y * scale,
    metrics.width * scale,
    metrics.height * scale
  );
  return output.toDataURL("image/jpeg", PROFILE_PHOTO_QUALITY);
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
    .map((part) => part.match(/[\p{L}\p{N}]/u)?.[0] || "")
    .filter(Boolean)
    .join("")
    .toUpperCase();
  return letters || "Y";
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

function artistGradient(name, fallbackColor = "#007aff") {
  const palette = ["#007aff", "#34c759", "#ffcc00", "#ff5bd7", "#5856d6", "#00c7be", "#ff3b30"];
  const hash = parseInt(simpleHash(name || fallbackColor), 36) || 0;
  const first = palette[hash % palette.length];
  const second = palette[(hash >> 3) % palette.length] || fallbackColor;
  return `linear-gradient(135deg, #ffffff 0%, ${first} 42%, ${second} 100%)`;
}

function artistImageUrl(name) {
  return artistImageCache.get(artistImageKey(name)) || artistFallbackImageUrl(name);
}

function requestArtistImage(name) {
  const key = artistImageKey(name);
  if (!key || artistImageCache.has(key) || artistImagePending.has(key)) return;

  const pending = loadDeezerArtistImage(name)
    .then((url) => {
      if (url) {
        artistImageCache.set(key, url);
        renderStages();
        if (els.stageDetailDialog?.open) renderStageDetail();
      }
    })
    .catch(() => {})
    .finally(() => artistImagePending.delete(key));

  artistImagePending.set(key, pending);
}

function loadDeezerArtistImage(name) {
  return new Promise((resolve) => {
    const search = primaryArtistName(name);
    if (!search) {
      resolve("");
      return;
    }

    const callback = `__festivalArtistImage${Date.now()}${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const cleanup = () => {
      window.clearTimeout(timer);
      delete window[callback];
      script.remove();
    };
    const timer = window.setTimeout(() => {
      cleanup();
      resolve("");
    }, 4500);

    window[callback] = (payload) => {
      cleanup();
      const match = bestDeezerArtistMatch(payload?.data || [], search);
      resolve(match?.picture_big || match?.picture_medium || match?.picture || "");
    };

    script.onerror = () => {
      cleanup();
      resolve("");
    };
    script.src = `https://api.deezer.com/search/artist?q=${encodeURIComponent(search)}&output=jsonp&callback=${callback}`;
    document.head.append(script);
  });
}

function bestDeezerArtistMatch(artists, search) {
  const searchKey = normalize(search);
  const visible = artists.filter((artist) => (
    artist?.picture_big &&
    !String(artist.picture_big).includes("/artist//") &&
    normalize(artist.name).includes(searchKey.slice(0, Math.max(4, Math.min(10, searchKey.length))))
  ));
  return visible.find((artist) => normalize(artist.name) === searchKey)
    || visible.find((artist) => normalize(artist.name).startsWith(searchKey))
    || visible[0]
    || null;
}

function artistImageKey(name) {
  return normalize(primaryArtistName(name));
}

function primaryArtistName(name) {
  return String(name || "EDC")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(B2B|with|presents|ft\.?|feat\.?)\b.*$/i, " ")
    .replace(/[^\p{L}\p{N}&\s.'-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function artistFallbackImageUrl(name) {
  const seed = encodeURIComponent(primaryArtistName(name) || "EDC");
  return `https://api.dicebear.com/9.x/personas/svg?seed=${seed}&radius=50&backgroundType=gradientLinear`;
}

function cryptoId() {
  return globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function humanAuthError(error) {
  const code = error.code || "";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "PIN is not correct.";
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
