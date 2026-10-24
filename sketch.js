let imgs = [];
let animals = [];
let blobs = [];
let sticks = [];

let song;
let fft;
let played = false;
let locked = false;
let started = false;

// 원본 디자인 기준
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

  userStartAudio();

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

// 화면 크기 변경 대응
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateArtwork();
}

// 작품 전체 재생성
function generateArtwork() {
  animals = [];
  blobs = [];
  sticks = [];

  generateBackground();
  generateLayout();
  generateMagicDust();
}

// 배경 데이터
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

// 기존 음악 반응형 배경 함수 유지
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

    let offsetX =
      sin(frameCount * 0.01 + b.y) *
      map(mid, 0, 255, 0, 25);

    let offsetY =
      cos(frameCount * 0.01 + b.x) *
      map(mid, 0, 255, 0, 15);

    fill(
      b.color[0],
      b.color[1],
      b.color[2],
      map(bass, 0, 255, 20, 70)
    );

    ellipse(
      b.x + offsetX,
      b.y + offsetY,
      s
    );
  }

  let moonSize = 220 + map(bass, 0, 255, 0, 35);

  fill(140, 80, 255, 140);

  circle(
    width * 0.82,
    height * 0.18,
    moonSize
  );
}

// 컬러 매직 더스트
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

    rect(
      s.x,
      s.y,
      s.size,
      s.size
    );
  }
}

// 이미지 배치
function generateLayout() {
  let tries = 0;

  // 화면 크기에 따라 오브젝트 수 조정
  let targetCount = width < 600 ? 24 : 45;

  while (
    animals.length < targetCount &&
    tries < 10000
  ) {
    let img = random(imgs);

    // 기존보다 이미지 크기를 키움
    let scaleValue = random(0.16, 0.26);

    let w = img.width * scaleValue;
    let h = img.height * scaleValue;

    // 화면 전체 영역에 분산
    let x = random(0, width);
    let y = random(0, height);

    let ok = true;

    for (let other of animals) {
      let d = dist(
        x,
        y,
        other.x,
        other.y
      );

      // 기존보다 간격을 줄여 밀도 높임
      let minDist =
        max(w, h) / 2 +
        max(other.w, other.h) / 2 +
        (width < 600 ? 8 : 20);

      if (d < minDist) {
        ok = false;
        break;
      }
    }

    if (ok) {
      animals.push({
        img: img,
        x: x,
        y: y,
        w: w,
        h: h,
        angle: random(-PI / 3, PI / 3)
      });
    }

    tries++;
  }
}

// 이미지 애니메이션
function drawAnimals() {
  imageMode(CENTER);

  if (fft && song && song.isPlaying()) {
    fft.analyze();
  }

  let bass = fft ? fft.getEnergy("bass") : 0;
  let mid = fft ? fft.getEnergy("mid") : 0;
  let treble = fft ? fft.getEnergy("treble") : 0;

  for (let a of animals) {
    push();

    translate(a.x, a.y);

    rotate(
      a.angle +
      sin(frameCount * 0.04 + a.x) *
      map(mid, 0, 255, 0, 0.2)
    );

    let s = map(bass, 0, 255, 1, 1.15);

    scale(s);

    tint(
      255,
      map(treble, 0, 255, 180, 255)
    );

    image(
      a.img,
      0,
      0,
      a.w,
      a.h
    );

    pop();
  }

  noTint();
  imageMode(CORNER);
}

// 클릭으로 음악 재생 / 정지
function triggerSound() {
  if (!song) return;

  userStartAudio();

  if (song.isPlaying()) {
    song.stop();
    locked = false;
  } else {
    song.play();
    locked = true;
  }

  generateArtwork();
}

function mousePressed() {
  triggerSound();
}

window.addEventListener("message", function(event) {
  if (event.data === "triggerSound") {
    triggerSound();
  }
});

// 저장 기능
function keyPressed() {
  if (key === "r" || key === "R") {
    saveGif("poison-garden", 8);
  }

  if (key === "s" || key === "S") {
    saveCanvas("poison-garden", "png");
  }
}
