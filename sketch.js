//vv1

let imgs = [];
let animals = [];
let blobs = [];
let sticks = [];

let song;
let fft;
let played = false;
let locked = false;
let started = false;
let lastTrigger = 0;

let smoothBass = 0;
let smoothMid = 0;
let smoothTreble = 0;
let motionEnv = 0;

const DESIGN_W = 1242;
const DESIGN_H = 886;

function preload() {
  imgs.push(loadImage("home.png"));
  imgs.push(loadImage("gross.png"));
  imgs.push(loadImage("rainbow.png"));
  imgs.push(loadImage("cloud.png"));

  song = loadSound("1-2.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);

  song.setVolume(1);

  fft = new p5.FFT();
  fft.setInput(song);

  generateArtwork();
}

function draw() {
  background(255);

  drawMagicDust();
  drawAnimals();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateArtwork();
}

function boardScale() {
  return min(width / DESIGN_W, height / DESIGN_H);
}

function generateArtwork() {
  animals = [];
  blobs = [];
  sticks = [];

  generateBackground();
  generateLayout();
  generateMagicDust();
}

function generateBackground() {
  let palette = [
    [255, 255, 255],
    [255, 255, 255],
    [255, 255, 255],
    [255, 255, 255],
    [255, 255, 255]
  ];

  for (let i = 0; i < 45; i++) {
    let c = random(palette);

    blobs.push({
      x: random(width),
      y: random(height),
      size: random(150, 500),
      color: c
    });
  }
}

function drawBackground() {
  background(255);

  if (fft && song && song.isPlaying()) {
    fft.analyze();
  }

  let bass = fft ? fft.getEnergy("bass") : 0;
  let mid = fft ? fft.getEnergy("mid") : 0;

  noStroke();

  for (let b of blobs) {
    let s = b.size + map(bass, 0, 255, 0, 120);
    let offsetX = sin(frameCount * 0.01 + b.y) * map(mid, 0, 255, 0, 25);
    let offsetY = cos(frameCount * 0.01 + b.x) * map(mid, 0, 255, 0, 15);

    fill(b.color[0], b.color[1], b.color[2], map(bass, 0, 255, 20, 70));
    ellipse(b.x + offsetX, b.y + offsetY, s);
  }

  let moonSize = 220 + map(bass, 0, 255, 0, 35);

  fill(140, 80, 255, 140);
  circle(width * 0.82, height * 0.18, moonSize);
}

function generateMagicDust() {
  let objectColors = [
    [255, 60, 40],
    [255, 130, 20],
    [255, 210, 20],
    [40, 190, 70],
    [30, 200, 60],
    [80, 220, 50],
    [30, 150, 240],
    [80, 190, 255],
    [20, 20, 20],
    [255, 130, 20]
  ];

  for (let i = 0; i < 300; i++) {
    sticks.push({
      x: random(width),
      y: random(height),
      size: random(2, 8),
      color: random(objectColors)
    });
  }
}

function drawMagicDust() {
  noStroke();

  for (let s of sticks) {
    fill(s.color);
    rect(s.x, s.y, s.size, s.size);
  }
}

function addPieces(img, count, minW, maxW) {
  const unit = boardScale();

  for (let i = 0; i < count; i++) {
    let w = random(minW, maxW) * unit;
    let h = w * (img.height / img.width);

    animals.push({
      img: img,
      x: random(w * 0.3, max(w * 0.3, width - w * 0.3)),
      y: random(h * 0.3, max(h * 0.3, height - h * 0.3)),
      w: w,
      h: h,
      angle: random(-PI / 14, PI / 14),
      phase: random(TWO_PI),
      speed: random(0.85, 1.45)
    });
  }
}

function generateLayout() {
  const phone = width < 600;

  addPieces(imgs[0], phone ? 5 : 8, 150, 230);
  addPieces(imgs[1], phone ? 8 : 14, 70, 130);
  addPieces(imgs[2], phone ? 2 : 4, 110, 170);
  addPieces(imgs[3], phone ? 3 : 5, 90, 150);
}

function drawAnimals() {
  imageMode(CENTER);

  const playing = song && song.isPlaying();
  const phone = width < 600;

  if (fft && playing) {
    fft.analyze();
  }

  smoothBass = lerp(smoothBass, fft && playing ? fft.getEnergy("bass") : 0, 0.03);
  smoothMid = lerp(smoothMid, fft && playing ? fft.getEnergy("mid") : 0, 0.03);
  smoothTreble = lerp(smoothTreble, fft && playing ? fft.getEnergy("treble") : 0, 0.03);
  motionEnv = lerp(motionEnv, playing ? 1 : 0, 0.05);

  const now = millis() * 0.001;

  for (let a of animals) {
    const t = now * 1.15 * a.speed + a.phase;
    const reach = a.w * (phone ? 0.62 : 0.36) * motionEnv;
    const breath = 1 + smoothBass / 500;

    const dx = sin(t) * reach * breath;
    const dy = cos(t * 0.82) * reach * 0.72 * breath;
    const spin = a.angle + sin(t * 0.7) * 0.18 * motionEnv;
    const s = 1 + sin(t * 0.9) * 0.045 * motionEnv;

    push();
    translate(a.x + dx, a.y + dy);
    rotate(spin);
    scale(s);
    tint(255, 255 - motionEnv * map(smoothTreble, 0, 180, 0, 30));
    image(a.img, 0, 0, a.w, a.h);
    pop();
  }

  noTint();
  imageMode(CORNER);
}

function triggerSound() {
  if (!song) return;
  if (millis() - lastTrigger < 400) return;
  lastTrigger = millis();

  userStartAudio();
  getAudioContext().resume();

  if (song.isPlaying()) {
    song.stop();
    locked = false;
  } else {
    song.play();
    locked = true;
    played = true;
    started = true;
  }
}

function mousePressed() {
  triggerSound();
  return false;
}

function touchStarted() {
  triggerSound();
  return false;
}

document.addEventListener("touchstart", (event) => {
  triggerSound();
  event.preventDefault();
}, { passive: false });

window.addEventListener("message", function(event) {
  if (event.data === "triggerSound") {
    triggerSound();
  }
});

function keyPressed() {
  if (key === "r" || key === "R") {
    saveGif("poison-garden", 8);
  }

  if (key === "s" || key === "S") {
    saveCanvas("poison-garden", "png");
  }
}
