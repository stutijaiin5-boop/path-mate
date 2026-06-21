class AuroraField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
    this.sparks = [];
    this.resize();
    this.initSparks();
    this.animate();
    this.bindEvents();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initSparks() {
    for (let i = 0; i < 25; i++) {
      this.sparks.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height * 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.3 - 0.1,
        life: Math.random(),
        lifeSpeed: 0.005 + Math.random() * 0.01,
        size: 1.5 + Math.random() * 2.5,
        hue: [260, 185, 140, 220][Math.floor(Math.random() * 4)],
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
  }

  animate() {
    this.time += 0.008;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const t = this.time;
    const dim = Math.min(w, h);

    ctx.clearRect(0, 0, w, h);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    if (!isDark) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    // --- vibrant base glow ---
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.12, 0, w * 0.5, h * 0.12, dim * 0.7);
    bg.addColorStop(0, 'rgba(90, 30, 140, 0.3)');
    bg.addColorStop(0.4, 'rgba(40, 15, 80, 0.15)');
    bg.addColorStop(1, 'transparent');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // --- energy wave bands (brighter, faster) ---
    const amp = dim * 0.055;
    const waves = [
      { r: 139, g: 92,  b: 246, a: 0.35, base: h * 0.03, spd: 0.35, freq: 0.0012 },
      { r: 6,   g: 182, b: 212, a: 0.28, base: h * 0.11, spd: 0.40, freq: 0.0015 },
      { r: 34,  g: 197, b: 94,  a: 0.22, base: h * 0.18, spd: 0.45, freq: 0.0018 },
      { r: 168, g: 85,  b: 247, a: 0.20, base: h * 0.06, spd: 0.30, freq: 0.0009 },
    ];

    for (const wv of waves) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i <= 120; i++) {
        const px = (i / 120) * w;
        const y = wv.base
          + Math.sin(px * wv.freq + t * wv.spd) * amp
          + Math.sin(px * wv.freq * 2.2 + t * wv.spd * 0.65 + 2.0) * amp * 0.5
          + Math.sin(px * wv.freq * 4.5 + t * wv.spd * 0.4 + 4.5) * amp * 0.25;
        ctx.lineTo(px, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      const g = ctx.createLinearGradient(0, wv.base - amp - 15, 0, wv.base + h * 0.45);
      g.addColorStop(0, `rgba(${wv.r}, ${wv.g}, ${wv.b}, ${wv.a})`);
      g.addColorStop(0.5, `rgba(${wv.r}, ${wv.g}, ${wv.b}, ${wv.a * 0.4})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fill();
    }

    // --- bright sweeping arc ---
    ctx.beginPath();
    ctx.moveTo(0, h);
    const amp2 = amp * 0.7;
    for (let i = 0; i <= 120; i++) {
      const px = (i / 120) * w;
      const y = h * 0.05
        + Math.sin(px * 0.0007 + t * 0.18) * amp2
        + Math.sin(px * 0.0018 + t * 0.10 + 1.8) * amp2 * 0.4;
      ctx.lineTo(px, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    const gb = ctx.createLinearGradient(0, 0, 0, h * 0.45);
    gb.addColorStop(0, 'rgba(139, 92, 246, 0.18)');
    gb.addColorStop(0.4, 'rgba(6, 182, 212, 0.08)');
    gb.addColorStop(1, 'transparent');
    ctx.fillStyle = gb;
    ctx.fill();

    // --- light pillars (screen blend) ---
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++) {
      const cx = w * (0.08 + i * 0.21) + Math.sin(t * 0.08 + i * 2.0) * w * 0.06;
      const pg = ctx.createLinearGradient(cx, 0, cx, h * 0.5);
      const hue = [265, 190, 135, 225, 280][i];
      pg.addColorStop(0, `hsla(${hue}, 100%, 80%, 0.10)`);
      pg.addColorStop(0.5, `hsla(${hue}, 80%, 65%, 0.05)`);
      pg.addColorStop(1, 'transparent');
      ctx.fillStyle = pg;
      ctx.fillRect(cx - 25, 0, 50, h * 0.5);
    }
    ctx.restore();

    // --- rising energy sparks ---
    for (const s of this.sparks) {
      s.x += s.vx + Math.sin(t * 0.5 + s.y * 0.01) * 0.3;
      s.y += s.vy;
      s.life += s.lifeSpeed;
      if (s.life > 1 || s.y < -10 || s.x < -10 || s.x > w + 10) {
        s.x = Math.random() * w;
        s.y = h * 0.3 + Math.random() * h * 0.2;
        s.life = 0;
        s.hue = [260, 185, 140, 220][Math.floor(Math.random() * 4)];
      }

      const alpha = Math.sin(s.life * Math.PI) * 0.7;
      const sz = s.size * (0.5 + Math.sin(s.life * Math.PI) * 0.5);

      // glow
      ctx.beginPath();
      ctx.arc(s.x, s.y, sz * 4, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, ${alpha * 0.1})`;
      ctx.fill();

      // core
      ctx.beginPath();
      ctx.arc(s.x, s.y, sz, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 100%, 85%, ${alpha})`;
      ctx.fill();

      // bright center
      ctx.beginPath();
      ctx.arc(s.x, s.y, sz * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
      ctx.fill();
    }

    // --- stars ---
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 173.3 + 40) % w);
      const sy = ((i * 89.7 + 10) % Math.max(1, h * 0.35));
      const tw = Math.sin(t * 1.5 + i * 4.1) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.6 + tw * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${tw * 0.5})`;
      ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}
