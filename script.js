// 23rd Birthday Celebration Web Application for Mik (Mary Janet Buenavista)
// Gated Balloon Popping (23 Balloons) -> Instagram Story Card Reveal

document.addEventListener('DOMContentLoaded', () => {

  // --- Confetti Engine ---
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let confettiPieces = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const confettiColors = ['#f2ce73', '#d4af37', '#e8a598', '#ff80ab', '#ffffff', '#e040fb', '#00e5ff'];

  class ConfettiPiece {
    constructor(x, y, isBurst = false) {
      this.x = x !== undefined ? x : Math.random() * canvas.width;
      this.y = y !== undefined ? y : (isBurst ? canvas.height * 0.45 : -20);
      this.size = Math.random() * 8 + 5;
      this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;
      this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
      
      if (isBurst) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 4;
        this.gravity = 0.22;
      } else {
        this.vx = (Math.random() - 0.5) * 1.8;
        this.vy = Math.random() * 2 + 1.2;
        this.gravity = 0.04;
      }
      this.opacity = 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.rotation += this.rotationSpeed;
      
      if (this.y > canvas.height + 20) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
        this.vy = Math.random() * 2 + 1.2;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;

      if (this.shape === 'rect') {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Initial subtle ambient confetti
  for (let i = 0; i < 40; i++) {
    confettiPieces.push(new ConfettiPiece(undefined, Math.random() * canvas.height, false));
  }

  function launchConfettiBurst(count = 70, originX = window.innerWidth / 2, originY = window.innerHeight * 0.45) {
    for (let i = 0; i < count; i++) {
      confettiPieces.push(new ConfettiPiece(originX, originY, true));
    }
    if (confettiPieces.length > 250) {
      confettiPieces.splice(0, confettiPieces.length - 250);
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < confettiPieces.length; i++) {
      confettiPieces[i].update();
      confettiPieces[i].draw();
    }
    requestAnimationFrame(animateConfetti);
  }
  animateConfetti();


  // --- Web Audio Synthesizer ---
  let audioCtx = null;
  let isPlayingMusic = false;
  let melodyTimeout = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Realistic Pop Sound
  function playPopSound() {
    initAudio();
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  // Chime Note Player
  function playNote(frequency, duration = 0.5, delay = 0) {
    if (!audioCtx) return;
    setTimeout(() => {
      try {
        const now = audioCtx.currentTime;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + duration);

        const oscHarmonic = audioCtx.createOscillator();
        const gainHarmonic = audioCtx.createGain();
        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(frequency * 2, now);

        gainHarmonic.gain.setValueAtTime(0, now);
        gainHarmonic.gain.linearRampToValueAtTime(0.08, now + 0.02);
        gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.75);

        oscHarmonic.connect(gainHarmonic);
        gainHarmonic.connect(audioCtx.destination);
        oscHarmonic.start(now);
        oscHarmonic.stop(now + duration);
      } catch (e) {
        console.error(e);
      }
    }, delay * 1000);
  }

  const notes = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
    A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
    F5: 698.46, G5: 783.99
  };

  const happyBirthdayScore = [
    { note: notes.G4, dur: 0.35, pause: 0.4 },
    { note: notes.G4, dur: 0.35, pause: 0.4 },
    { note: notes.A4, dur: 0.7, pause: 0.8 },
    { note: notes.G4, dur: 0.7, pause: 0.8 },
    { note: notes.C5, dur: 0.7, pause: 0.8 },
    { note: notes.B4, dur: 1.2, pause: 1.4 },

    { note: notes.G4, dur: 0.35, pause: 0.4 },
    { note: notes.G4, dur: 0.35, pause: 0.4 },
    { note: notes.A4, dur: 0.7, pause: 0.8 },
    { note: notes.G4, dur: 0.7, pause: 0.8 },
    { note: notes.D5, dur: 0.7, pause: 0.8 },
    { note: notes.C5, dur: 1.2, pause: 1.4 },

    { note: notes.G4, dur: 0.35, pause: 0.4 },
    { note: notes.G4, dur: 0.35, pause: 0.4 },
    { note: notes.G5, dur: 0.7, pause: 0.8 },
    { note: notes.E5, dur: 0.7, pause: 0.8 },
    { note: notes.C5, dur: 0.7, pause: 0.8 },
    { note: notes.B4, dur: 0.7, pause: 0.8 },
    { note: notes.A4, dur: 1.2, pause: 1.4 },

    { note: notes.F5, dur: 0.35, pause: 0.4 },
    { note: notes.F5, dur: 0.35, pause: 0.4 },
    { note: notes.E5, dur: 0.7, pause: 0.8 },
    { note: notes.C5, dur: 0.7, pause: 0.8 },
    { note: notes.D5, dur: 0.7, pause: 0.8 },
    { note: notes.C5, dur: 1.6, pause: 2.2 }
  ];

  function playHappyBirthdaySong() {
    if (!isPlayingMusic) return;
    initAudio();

    let currentTime = 0;
    happyBirthdayScore.forEach(item => {
      playNote(item.note, item.dur, currentTime);
      currentTime += item.pause;
    });

    melodyTimeout = setTimeout(() => {
      if (isPlayingMusic) {
        playHappyBirthdaySong();
      }
    }, currentTime * 1000 + 800);
  }

  function startMusic() {
    initAudio();
    isPlayingMusic = true;
    const sticker = document.getElementById('story-music-sticker');
    if (sticker) sticker.classList.remove('paused');
    playHappyBirthdaySong();
  }

  function pauseMusic() {
    isPlayingMusic = false;
    clearTimeout(melodyTimeout);
    const sticker = document.getElementById('story-music-sticker');
    if (sticker) sticker.classList.add('paused');
  }

  function toggleMusic() {
    if (isPlayingMusic) {
      pauseMusic();
    } else {
      startMusic();
    }
  }


  // --- 23 Balloons Dynamic Setup & Strict Gating ---
  const balloonStage = document.getElementById('balloon-stage');
  const balloonsRack = document.getElementById('balloons-rack');
  const balloonCounter = document.getElementById('balloon-counter');
  const storyShowcase = document.getElementById('story-showcase');
  const totalBalloons = 23;
  let poppedCount = 0;

  // Render the 23 balloons
  if (balloonsRack) {
    balloonsRack.innerHTML = '';
    for (let i = 1; i <= totalBalloons; i++) {
      const colorIndex = ((i - 1) % 5) + 1;
      const delay = ((i * 0.14) % 1.6).toFixed(2);
      
      const wrapper = document.createElement('div');
      wrapper.className = 'game-balloon-wrapper';
      wrapper.setAttribute('data-balloon-index', i);
      wrapper.title = `Balloon #${i}`;

      wrapper.innerHTML = `
        <div class="game-balloon balloon-color-${colorIndex}" style="animation-delay: ${delay}s">
          <span class="balloon-shine"></span>
          <span class="balloon-number">${i}</span>
          <div class="balloon-tail"></div>
          <div class="balloon-string-line"></div>
        </div>
      `;

      wrapper.addEventListener('click', (e) => {
        handleBalloonPop(wrapper, e);
      });

      balloonsRack.appendChild(wrapper);
    }
  }

  function handleBalloonPop(wrapper, event) {
    if (wrapper.classList.contains('popped')) return;

    wrapper.classList.add('popped');
    playPopSound();
    poppedCount++;

    if (balloonCounter) {
      balloonCounter.textContent = poppedCount;
    }

    const rect = wrapper.getBoundingClientRect();
    const posX = rect.left + rect.width / 2;
    const posY = rect.top + rect.height / 2;
    launchConfettiBurst(20, posX, posY);

    // When the 23rd balloon is popped -> UNVEIL INSTAGRAM STORY CARD
    if (poppedCount === totalBalloons) {
      setTimeout(() => {
        revealInstagramStory();
      }, 450);
    }
  }

  function revealInstagramStory() {
    // 1. Hide the balloon stage with smooth fade
    if (balloonStage) {
      balloonStage.classList.add('fade-out');
    }

    // 2. Unveil the Instagram Story Showcase
    if (storyShowcase) {
      storyShowcase.classList.remove('hidden-story');
      storyShowcase.scrollIntoView({ behavior: 'smooth' });
    }

    // 3. Grand celebration confetti explosion
    launchConfettiBurst(180, window.innerWidth / 2, window.innerHeight * 0.4);

    // 4. Begin the Happy Birthday chime melody
    startMusic();
  }


  // --- Step 1: Envelope Opening ---
  const envelopeOverlay = document.getElementById('envelope-overlay');
  const openCardBtn = document.getElementById('open-card-btn');

  if (openCardBtn && envelopeOverlay) {
    openCardBtn.addEventListener('click', () => {
      initAudio();
      envelopeOverlay.classList.add('hidden-overlay');
      launchConfettiBurst(100, window.innerWidth / 2, window.innerHeight * 0.4);
    });
  }

  // Click music sticker on story card to play/pause
  const storyMusicSticker = document.getElementById('story-music-sticker');
  if (storyMusicSticker) {
    storyMusicSticker.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }

  // Tapping the story card triggers celebratory sparkles
  const instagramCard = document.getElementById('instagram-card');
  if (instagramCard) {
    instagramCard.addEventListener('click', (e) => {
      launchConfettiBurst(25, e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight * 0.4);
    });
  }

});
