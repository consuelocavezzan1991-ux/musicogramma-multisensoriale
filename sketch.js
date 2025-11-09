let danzaAudio, sarabandaAudio;
let currentTrack = null;
let currentName = "";
let fft;
let amplitude;
let ready = false;

function preload() {
  danzaAudio = loadSound("danza.mp3");
  sarabandaAudio = loadSound("sarabanda.mp3");
}

function setup() {
  const canvas = createCanvas(800, 400);
  canvas.parent("canvas-container");
  noFill();
  fft = new p5.FFT();
  amplitude = new p5.Amplitude();

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

  if (!currentTrack || !currentTrack.isPlaying()) {
    fill(100);
    textAlign(CENTER, CENTER);
    text("Seleziona un brano e premi Play", width / 2, height / 2);
    return;
  }

  // Analisi del suono
  let spectrum = fft.analyze();
  let level = amplitude.getLevel();
  let wave = fft.waveform();

  // Disegno dinamico (zigzag + onde colorate)
  noFill();
  strokeWeight(2);

  if (currentName === "Danza delle ore") {
    stroke(0, 150, 255);
  } else {
    stroke(255, 100, 150);
  }

  beginShape();
  for (let i = 0; i < wave.length; i++) {
    let x = map(i, 0, wave.length, 0, width);
    let y = height / 2 + wave[i] * 200;
    vertex(x, y);
  }
  endShape();

  // cerchi pulsanti a ritmo
  let size = map(level, 0, 0.3, 50, 250);
  noStroke();
  fill(currentName === "Danza delle ore" ? color(0, 120, 255, 150) : color(255, 100, 180, 150));
  ellipse(width / 2, height / 2, size);

  fill(0);
  textSize(20);
  text(currentName, width / 2, 30);
}

function selectTrack(name) {
  stopTrack();
  if (name === "danza") {
    currentTrack = danzaAudio;
    currentName = "Danza delle ore";
  } else {
    currentTrack = sarabandaAudio;
    currentName = "Sarabanda";
  }
  setStatus(`Brano selezionato: ${currentName}. Premi Play.`);
}

function playTrack() {
  if (!currentTrack) return;
  if (!currentTrack.isPlaying()) {
    currentTrack.play();
    fft.setInput(currentTrack);
    amplitude.setInput(currentTrack);
    setStatus(`Riproduzione di: ${currentName}`);
  }
}

function stopTrack() {
  if (danzaAudio && danzaAudio.isPlaying()) danzaAudio.stop();
  if (sarabandaAudio && sarabandaAudio.isPlaying()) sarabandaAudio.stop();
  setStatus("Riproduzione interrotta.");
}

function setStatus(msg) {
  document.getElementById("status").textContent = msg;
}







