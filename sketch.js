let danzaAudio, sarabandaAudio;
let currentTrack = null;
let currentName = "";
let fft;
let amplitude;
let ready = false;

function preload() {
  // I NOMI devono coincidere con i file nel repo
  danzaAudio = loadSound("danza.mp3");
  sarabandaAudio = loadSound("sarabanda.mp3");
}

function setup() {
  const canvas = createCanvas(800, 400);
  canvas.parent("canvas-container");

  fft = new p5.FFT();
  amplitude = new p5.Amplitude();

  // Collego i pulsanti
  document.getElementById("btn-danza").addEventListener("click", () => selectTrack("danza"));
  document.getElementById("btn-sarabanda").addEventListener("click", () => selectTrack("sarabanda"));
  document.getElementById("btn-play").addEventListener("click", playTrack);
  document.getElementById("btn-stop").addEventListener("click", stopTrack);

  ready = true;
  setStatus("Pronto. Seleziona un brano.");
}

function draw() {
  if (!ready) return;
  background(245);

  // Se non ho ancora scelto o il brano è fermo, mostro un messaggio
  if (!currentTrack || !currentTrack.isPlaying()) {
    fill(100);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Seleziona un brano e premi Play", width / 2, height / 2);
    return;
  }

  // Analisi del suono
  let spectrum = fft.analyze();
  let level = amplitude.getLevel();
  let wave = fft.waveform();

  // ONDA che si muove a tempo
  noFill();
  strokeWeight(2);
  if (currentName === "Danza delle ore") {
    stroke(0, 150, 255);      // blu per Danza
  } else {
    stroke(255, 100, 150);    // rosa per Sarabanda
  }

  beginShape();
  for (let i = 0; i < wave.length; i++) {
    let x = map(i, 0, wave.length, 0, width);
    let y = height / 2 + wave[i] * 200;
    vertex(x, y);
  }
  endShape();

  // CERCHIO che pulsa col volume
  let size = map(level, 0, 0.3, 50, 250);
  noStroke();
  fill(
    currentName === "Danza delle ore"
      ? color(0, 120, 255, 150)
      : color(255, 100, 180, 150)
  );
  ellipse(width / 2, height / 2, size);

  // Titolo
  fill(0);
  textAlign(CENTER, TOP);
  textSize(22);
  text(currentName, width / 2, 20);
}

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

  // Sblocca l’audio con il click dell’utente (necessario per Chrome/Edge ecc.)
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
  if (danzaAudio && danzaAudio.isPlaying()) {
    danzaAudio.stop();
  }
  if (sarabandaAudio && sarabandaAudio.isPlaying()) {
    sarabandaAudio.stop();
  }
  setStatus("Riproduzione interrotta.");
}

function setStatus(msg) {
  const el = document.getElementById("status");
  if (el) el.textContent = msg;
}







