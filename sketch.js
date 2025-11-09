let musica;
let scelta = "danza"; // puoi cambiare con "sarabanda"

function preload() {
  if (scelta === "danza") {
    musica = loadSound("Danza delle Ore - MUSICOGRAMMA - Normal.mp3");
  } else if (scelta === "sarabanda") {
    musica = loadSound("Sarabanda MUSICOGRAMMA Handel - Musica.mp3");
  }
}

function setup() {
  createCanvas(800, 400);
  background(240);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("Clicca per avviare il musicogramma", width / 2, height / 2);
}

function draw() {
  // esempio semplice di visualizzazione
  if (musica && musica.isPlaying()) {
    background(100, 150, 255);
    let amp = musica.getLevel();
    let size = map(amp, 0, 1, 10, 200);
    fill(255, 200, 0);
    ellipse(width / 2, height / 2, size);
  }
}

function mousePressed() {
  if (musica.isPlaying()) {
    musica.pause();
  } else {
    musica.loop();
  }
}

// === Variabili globali ===
let danzaSound, sarabandaSound;
let currentTrack = null;     // 'danza' | 'sarabanda' | null
let amp;                     // Amplitude analyzer
let isPlaying = false;

// Struttura del "musicogramma" per i due brani
// Tempi di esempio in secondi – puoi affinarli ascoltando i brani
const tracks = {
  danza: {
    label: "Danza delle ore – Ponchielli",
    sections: [
      { start: 0,   end: 10,  color: [255, 204, 128], label: "Introduzione" },
      { start: 10,  end: 25,  color: [255, 138, 128], label: "Parte A" },
      { start: 25,  end: 40,  color: [244, 143, 177], label: "Contrasto" },
      { start: 40,  end: 60,  color: [129, 212, 250], label: "Ripresa" }
    ]
  },
  sarabanda: {
    label: "Sarabanda – Händel",
    sections: [
      { start: 0,   end: 12,  color: [179, 229, 252], label: "Introduzione" },
      { start: 12,  end: 30,  color: [144, 164, 174], label: "Parte A" },
      { start: 30,  end: 48,  color: [207, 216, 220], label: "Ripetizione" }
    ]
  }
};

// === p5.js: preload per caricare i suoni ===
function preload() {
  danzaSound = loadSound("assets/danza_delle_ore.mp3");
  sarabandaSound = loadSound("assets/sarabanda.mp3");
}

// === p5.js: setup iniziale ===
function setup() {
  const canvas = createCanvas(800, 400);
  canvas.parent(document.body);

  amp = new p5.Amplitude();

  // Eventi per i pulsanti HTML
  document.getElementById("btnDanza").addEventListener("click", () => {
    selectTrack("danza");
  });

  document.getElementById("btnSarabanda").addEventListener("click", () => {
    selectTrack("sarabanda");
  });

  document.getElementById("btnPlayPause").addEventListener("click", () => {
    togglePlayPause();
  });

  document.getElementById("btnStop").addEventListener("click", () => {
    stopPlayback();
  });

  // Se vuoi partire con un brano selezionato
  selectTrack("danza");
}

// === p5.js: draw continuo ===
function draw() {
  background(250);

  // Titolo e info
  fill(33);
  textSize(18);
  textAlign(LEFT, TOP);
  text("Musicogramma interattivo", 20, 20);

  textSize(14);
  if (currentTrack) {
    text(`Brano: ${tracks[currentTrack].label}`, 20, 50);
  } else {
    text("Seleziona un brano per iniziare.", 20, 50);
  }

  // Se non c'è un brano selezionato, esco
  if (!currentTrack) return;

  // Ottieni riferimento al suono attuale
  const sound = currentTrack === "danza" ? danzaSound : sarabandaSound;
  if (!sound || !sound.buffer) return;

  // Dati temporali
  const dur = sound.duration();
  const t = sound.currentTime();

  // === 1) Musicogramma a fasce orizzontali (timeline) ===
  const timelineX = 50;
  const timelineY = 120;
  const timelineWidth = width - 100;
  const timelineHeight = 60;

  // Bordo timeline
  noFill();
  stroke(0);
  rect(timelineX, timelineY, timelineWidth, timelineHeight);

  noStroke();

  // Coloro le sezioni in base alla struttura del brano
  const sections = tracks[currentTrack].sections;

  sections.forEach((sec) => {
    const secStartX =
      timelineX + (sec.start / dur) * timelineWidth;
    const secEndX =
      timelineX + (sec.end / dur) * timelineWidth;
    const w = secEndX - secStartX;

    fill(sec.color[0], sec.color[1], sec.color[2], 200);
    rect(secStartX, timelineY, w, timelineHeight);
  });

  // Cursore che si muove lungo la timeline
  const cursorX = timelineX + (t / dur) * timelineWidth;
  stroke(0);
  strokeWeight(2);
  line(cursorX, timelineY, cursorX, timelineY + timelineHeight);

  // Etichette delle sezioni
  textSize(12);
  fill(0);
  let labelY = timelineY + timelineHeight + 20;
  sections.forEach((sec) => {
    text(`• ${sec.label} (${sec.start}"–${sec.end}")`, timelineX, labelY);
    labelY += 16;
  });

  // === 2) Cerchio centrale che reagisce al volume (ampiezza) ===
  const level = amp.getLevel();
  const circleSize = map(level, 0, 0.4, 50, 200);
  const colorValue = map(level, 0, 0.4, 150, 255);

  noStroke();
  fill(100, colorValue, 180, 180);
  ellipse(width / 2, 90, circleSize, circleSize);

  // Testo istruzioni
  fill(50);
  textAlign(CENTER, TOP);
  textSize(13);
  text(
    "Il cerchio segue l’intensità del suono.\nLa linea verticale mostra la posizione nel brano.",
    width / 2,
    260
  );
}

// === Selezione brano ===
function selectTrack(name) {
  // Ferma eventuale brano in riproduzione
  stopPlayback();

  currentTrack = name;
  const info = document.getElementById("info");

  if (name === "danza") {
    info.textContent = "Hai selezionato: Danza delle ore (Ponchielli).";
  } else if (name === "sarabanda") {
    info.textContent = "Hai selezionato: Sarabanda (Händel).";
  }

  // Reset stato play/pause
  document.getElementById("btnPlayPause").textContent = "Play";
  isPlaying = false;
}

// === Play / Pausa ===
function togglePlayPause() {
  if (!currentTrack) return;

  const sound = currentTrack === "danza" ? danzaSound : sarabandaSound;
  const btn = document.getElementById("btnPlayPause");

  if (!isPlaying) {
    // Se è fermo, parte da capo
    if (!sound.isPlaying()) {
      sound.play();
    } else {
      sound.loop();
    }
    amp.setInput(sound);
    isPlaying = true;
    btn.textContent = "Pausa";
  } else {
    // Metti in pausa
    sound.pause();
    isPlaying = false;
    btn.textContent = "Play";
  }
}

// === Stop completo ===
function stopPlayback() {
  danzaSound.stop();
  sarabandaSound.stop();
  isPlaying = false;
  document.getElementById("btnPlayPause").textContent = "Play";
}

