// ---------------------------------------------------------------------------
//  MUSICOGRAMMA MULTISENSORIALE - sketch.js
// ---------------------------------------------------------------------------

let danzaAudio, sarabandaAudio;
let currentTrack = null;
let currentName = "";
let ready = false;
let ampAnalyzer;
let animOffset = 0;

// Timeline degli eventi visivi per DANZA
let danzaTimeline = [
  { time: 2, type: "zigzag", x: 100, y: 150, col: "red" },
  { time: 4, type: "zigzag", x: 250, y: 150, col: "red" },
  { time: 6, type: "zigzag", x: 400, y: 150, col: "red" },
  { time: 8, type: "smile", x: 200, y: 250, col: "orange" },
  { time: 10, type: "smile", x: 350, y: 250, col: "orange" },
  { time: 12, type: "swirl", x: 500, y: 250, col: "green" },
  { time: 14, type: "wave", x: 100, y: 350, col: "blue" },
  { time: 16, type: "wave", x: 100, y: 410, col: "blue" },
  { time: 18, type: "zigzag", x: 160, y: 520, col: "red" },
  { time: 20, type: "wave", x: 160, y: 560, col: "blue" },
];

// Timeline degli eventi visivi per SARABANDA
let sarabanda
