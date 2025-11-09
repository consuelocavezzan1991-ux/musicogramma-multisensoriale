let danzaAudio, sarabandaAudio;
let currentTrack = null;
let currentName = "";
let fft;
let amplitude;
let ready = false;

function preload() {
  // I nomi devono coincidere con i file nel repo
  danzaAudio = loadSound("danza.mp3");
  sarabandaAudio = loadSound("sarabanda.mp3");
}

function setup() {
  const canvas = createCanvas(800, 400);
  canvas.parent("canvas-container");

  fft = new p5.FFT();
  amplitude = new p5.Amplitude();

  noFill();

  // Collego i pulsanti HTML
  document.getElementById("btn-danza").addEventListener("click", () => {
    selectTrack("danza");
  });

  document.getElementById("btn-sarabanda").addEventListener("click", () => {
    selectTrack("sarabanda");
  });

  document.getElementById("btn-play").addEventListener("click", () => {
    playTrack();
  });

  document.getElementById("btn-stop").addEventListener("click", () => {
    stopTrack();
  });

  ready = true;
  setStatus("Pronto. Seleziona un brano.");
}

function draw() {
  if (!ready) return;

  background(245);

  // Nessun brano selezionato
  if (!currentTrack) {
    fill(100);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Seleziona un brano e premi Play", width / 2, height / 2);
    return;
  }

  // Titolo
  fill(0);
  textAlign(CENTER, TOP);
  textSize(24);
  text(currentName, width / 2, 10);

  // Se non sta suonando, mostra solo il titolo
  if (!currentTrack.isPlaying()) {
    textSize(14);
    fill(120);
    text("Brano in pausa (premi Play per ascoltare)", width / 2, 40);
    return;
  }

  // Analisi audio
  let spectrum = fft.analyze();
  let wave = fft.waveform();
  let level = amplitude.getLevel();

  // Visualizzazione diversa per i due brani
  if (currentName === "Danza delle ore") {
    drawDanzaVisual(spectrum, wave, level);
  } else if (currentName === "Sarabanda") {
    drawSarabandaVisual(spectrum, wave, level);
  }
}

/* ---------------- SELEZIONE / PLAY / STOP ---------------- */

function selectTrack(name) {
  stopTrack();

  if (name === "danza") {
    currentTrack = danzaAudio;
    currentName = "Danza delle ore";
  } else if (name === "sarabanda") {
    currentTrack = sarabandaAudio;
    currentName = "Sarabanda";
  }

  setStatus(`Brano selezionato: ${currentName}. Premi "Play".`);
}

function playTrack() {
  if (!currentTrack) {
    setStatus("Seleziona prima un brano.");
    return;
  }

  // Sblocco audio (richiesto da alcuni browser)
  userStartAudio().then(() => {
    if (!currentTrack.isPlaying()) {
      currentTrack.play();
      fft.setInput(currentTrack);
      amplitude.setInput(currentTrack);
      setStatus(`Riproduzione di: ${currentName}`);
    }
  });
}

function stopTrack() {
  if (danzaAudio && danzaAudio.isPlaying()) danzaAudio.stop();
  if (sarabandaAudio && sarabandaAudio.isPlaying()) sarabandaAudio.stop();
  setStatus("Riproduzione interrotta.");
}

function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}

/* ---------------- VISUAL DANZA DELLE ORE ---------------- */

// zig-zag “da seguire col dito”
function drawZigZagLine(yBase, amp, col, wave) {
  stroke(col);
  strokeWeight(3);
  noFill();
  beginShape();
  for (let i = 0; i < wave.length; i += 10) {
    let x = map(i, 0, wave.length, 0, width);
    // zig-zag + piccola modulazione con la forma d’onda
    let z = (i % 40 < 20 ? -1 : 1) * amp;
    let y = yBase + z + wave[i] * 80;
    vertex(x, y);
  }
  endShape();
}

// barre colorate ritmiche
function drawBeatBars(spectrum, level) {
  let step = 20;
  for (let x = 0; x < width; x += step) {
    let index = floor(map(x, 0, width, 0, spectrum.length - 1));
    let energy = spectrum[index];

    let h = map(energy, 0, 255, 0, height / 2) + level * 80;
    let y = height - h;

    // alterno colori vivaci
    let m = (x / step) % 4;
    if (m === 0) fill(255, 80, 80, 180);      // rosso
    else if (m === 1) fill(255, 200, 80, 180); // giallo
    else if (m === 2) fill(80, 200, 120, 180); // verde
    else fill(80, 160, 255, 180);             // azzurro

    noStroke();
    rect(x, y, step - 2, h, 4);
  }
}

function drawDanzaVisual(spectrum, wave, level) {
  // sfondo leggermente “ballerino”
  let bg = map(level, 0, 0.4, 245, 230);
  background(bg);

  // barre ritmiche in basso
  drawBeatBars(spectrum, level);

  // due righe di zig-zag “danza”
  let y1 = height * 0.30;
  let y2 = height * 0.50;
  drawZigZagLine(y1, 25 + level * 60, color(255, 80, 120), wave);
  drawZigZagLine(y2, 20 + level * 50, color(80, 160, 255), wave);

  // cerchio centrale pulsante
  let size = map(level, 0, 0.4, 40, 180);
  noStroke();
  fill(255, 150, 0, 150);
  ellipse(width / 2, height * 0.18, size, size * 0.6);
}

/* ---------------- VISUAL SARABANDA ---------------- */

function drawCalmPills(spectrum, level) {
  let bands = 6;
  let bandHeight = 30;
  let gap = 15;
  let startY = height * 0.3;

  rectMode(CENTER);
  noStroke();

  for (let b = 0; b < bands; b++) {
    let y = startY + b * (bandHeight + gap);

    // prendo energia di una fetta di spettro
    let start = floor((b / bands) * spectrum.length);
    let end = floor(((b + 1) / bands) * spectrum.length);
    let avg = 0;
    for (let i = start; i < end; i++) avg += spectrum[i];
    avg /= max(end - start, 1);

    let w = map(avg, 0, 255, width * 0.2, width * 0.85);

    // palette calma
    let c;
    if (b < 2) c = color(180, 200, 255, 200);      // azzurrino
    else if (b < 4) c = color(160, 220, 200, 200); // verde acqua
    else c = color(220, 190, 255, 200);            // lilla

    fill(c);
    rect(width / 2, y, w, bandHeight + level * 30, bandHeight);
  }
}

function drawSlowWave(wave, level) {
  noFill();
  stroke(90, 120, 200);
  strokeWeight(3 + level * 10);
  beginShape();
  for (let i = 0; i < wave.length; i += 8) {
    let x = map(i, 0, wave.length, 0, width);
    let y = height * 0.80 + wave[i] * 60;
    vertex(x, y);
  }
  endShape();
}

function drawSarabandaVisual(spectrum, wave, level) {
  // sfondo freddo e calmo
  let bg = lerpColor(color(235, 240, 255), color(225, 230, 245), constrain(level * 5, 0, 1));
  background(bg);

  drawCalmPills(spectrum, level);
  drawSlowWave(wave, level);

  // puntini lenti come “passi”
  let steps = 6;
  let baseY = height * 0.2;
  noStroke();
  fill(80, 120, 180, 200);
  for (let i = 0; i < steps; i++) {
    let x = map(i, 0, steps - 1, width * 0.15, width * 0.85);
    let d = 14 + level * 40;
    ellipse(x, baseY, d, d);
  }
}









