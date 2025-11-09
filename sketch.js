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
  const canvas = createCanvas(800, 450);
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

  // Messaggio di stato
  textSize(14);
  fill(120);
  if (!currentTrack.isPlaying()) {
    text("Brano in pausa (premi Play per ascoltare)", width / 2, 40);
  } else {
    text("Segui le linee con il dito mentre ascolti", width / 2, 40);
  }

  // Se non sta suonando, niente animazione
  if (!currentTrack.isPlaying()) return;

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

/* ---------------- FUNZIONCINE DI DISEGNO ---------------- */

// zig-zag “da seguire col dito”
function drawZigZagLine(yBase, amp, col, wave, densita = 10) {
  stroke(col);
  strokeWeight(3);
  noFill();
  beginShape();
  for (let i = 0; i < wave.length; i += densita) {
    let x = map(i, 0, wave.length, 40, width - 40);
    // zig-zag regolare + piccola modulazione con la forma d’onda
    let z = (i % (densita * 4) < (densita * 2) ? -1 : 1) * amp;
    let y = yBase + z + wave[i] * 40; // meno rumore verticale
    vertex(x, y);
  }
  endShape();
}

// barre ritmiche in basso (più basse e separate)
function drawBeatBars(spectrum, level) {
  let step = 22;
  let maxH = 120; // altezza massima barre
  for (let x = 40; x < width - 40; x += step) {
    let index = floor(map(x, 40, width - 40, 0, spectrum.length - 1));
    let energy = spectrum[index];

    let h = map(energy, 0, 255, 10, maxH) + level * 40;
    let y = height - 30 - h; // distacco dal bordo basso

    // alterno colori vivaci
    let m = (x / step) % 4;
    if (m === 0) fill(255, 80, 80, 200);        // rosso
    else if (m === 1) fill(255, 200, 80, 200); // giallo
    else if (m === 2) fill(80, 200, 120, 200); // verde
    else fill(80, 160, 255, 200);              // azzurro

    noStroke();
    rect(x, y, step - 4, h, 4);
  }
}

/* ---------------- DANZA DELLE ORE ---------------- */

function drawDanzaVisual(spectrum, wave, level) {
  // sfondo leggermente “ballerino”
  let bg = map(level, 0, 0.4, 245, 230);
  background(bg);

  // Zona centrale per le linee da seguire col dito
  let y1 = height * 0.30; // ~135
  let y2 = height * 0.45; // ~200

  // prima linea zig-zag (più ampia)
  drawZigZagLine(y1, 25 + level * 50, color(255, 80, 120), wave, 12);

  // seconda linea zig-zag (più calma)
  drawZigZagLine(y2, 18 + level * 40, color(80, 160, 255), wave, 12);

  // barre ritmiche ben separate in basso
  drawBeatBars(spectrum, level);

  // ovale “danza” in alto, ma piccolo per non coprire
  let size = map(level, 0, 0.4, 40, 120);
  noStroke();
  fill(255, 150, 0, 150);
  ellipse(width / 2, height * 0.18, size, size * 0.6);
}

/* ---------------- SARABANDA ---------------- */

function drawCalmPills(spectrum, level) {
  let bands = 5;
  let bandHeight = 22;
  let gap = 18;
  let startY = height * 0.30; // parte centrale, ben staccata dalle scritte

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

    let w = map(avg, 0, 255, width * 0.25, width * 0.80);

    // palette calma
    let c;
    if (b === 0) c = color(190, 210, 255, 210);      // azzurrino
    else if (b === 1) c = color(170, 225, 205, 210); // verde acqua
    else if (b === 2) c = color(215, 200, 255, 210); // lilla
    else if (b === 3) c = color(200, 220, 240, 210); // celeste
    else c = color(230, 210, 245, 210);              // viola chiaro

    fill(c);
    rect(width / 2, y, w, bandHeight + level * 25, bandHeight);
  }
}

function drawSlowWave(wave, level) {
  noFill();
  stroke(90, 120, 200);
  strokeWeight(2 + level * 6);
  beginShape();
  for (let i = 0; i < wave.length; i += 10) {
    let x = map(i, 0, wave.length, 40, width - 40);
    let y = height * 0.80 + wave[i] * 35; // ondina morbida
    vertex(x, y);
  }
  endShape();
}

function drawStepDots(level) {
  let steps = 6;
  let baseY = height * 0.20;
  noStroke();
  fill(80, 120, 180, 220);
  for (let i = 0; i < steps; i++) {
    let x = map(i, 0, steps - 1, width * 0.15, width * 0.85);
    let d = 10 + level * 30;
    ellipse(x, baseY, d, d);
  }
}

function drawSarabandaVisual(spectrum, wave, level) {
  // sfondo freddo e calmo
  let bg = lerpColor(
    color(235, 240, 255),
    color(220, 225, 240),
    constrain(level * 4, 0, 1)
  );
  background(bg);

  // piccoli “passi lenti” in alto
  drawStepDots(level);

  // pilloline orizzontali al centro
  drawCalmPills(spectrum, level);

  // onda lenta in basso
  drawSlowWave(wave, level);
}











