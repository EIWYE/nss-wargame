/* ================================================================
 * 背景粒子网络 — 深空态势感知底图
 * ================================================================ */
function initBackground(){
  const canvas = document.getElementById('bgCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const count = Math.min(70, Math.floor(window.innerWidth / 22));

  for(let i = 0; i < count; i++){
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.2 + 0.4,
      pulse: Math.random() * Math.PI * 2,
    });
  }

  // 数据流粒子（偶尔划过的"信号"）
  const signals = [];
  function spawnSignal(){
    if(signals.length < 3 && Math.random() < 0.015){
      signals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        color: Math.random() < 0.5 ? '0,180,216' : '255,165,2',
      });
    }
  }

  function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 粒子 + 连线
    for(let i = 0; i < particles.length; i++){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.pulse += 0.03;
      if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if(p.y < 0 || p.y > canvas.height) p.vy *= -1;

      const alpha = 0.45 + Math.sin(p.pulse) * 0.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,180,216,${alpha})`;
      ctx.fill();

      for(let j = i + 1; j < particles.length; j++){
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if(d < 130){
          const a = 0.18 * (1 - d / 130);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,180,216,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // 信号粒子
    spawnSignal();
    for(let i = signals.length - 1; i >= 0; i--){
      const s = signals[i];
      s.x += s.vx; s.y += s.vy;
      s.life -= 0.008;
      if(s.life <= 0){ signals.splice(i, 1); continue; }

      const trail = 30;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * trail, s.y - s.vy * trail);
      ctx.strokeStyle = `rgba(${s.color},${s.life * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color},${s.life})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
}
