// DompetKeluarga — grafik canvas buatan sendiri (donat, batang, garis).
// Tanpa pustaka, tanpa jaringan: semua digambar dengan Canvas 2D API.

function setupCanvas(canvas, heightCss) {
  const dpr = window.devicePixelRatio || 1;
  const widthCss = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  canvas.width = Math.round(widthCss * dpr);
  canvas.height = Math.round(heightCss * dpr);
  canvas.style.height = heightCss + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, widthCss, heightCss);
  return { ctx, w: widthCss, h: heightCss };
}

function fmtShort(n) {
  if (n >= 1000000) return 'Rp' + (n / 1000000).toFixed(1).replace(/\.0$/, '') + ' jt';
  if (n >= 1000) return 'Rp' + Math.round(n / 1000) + ' rb';
  return 'Rp' + n;
}

// Donat: segments [{label, value, color}]. Mengembalikan daftar segmen dgn persen.
function drawDonut(canvas, segments) {
  const { ctx, w, h } = setupCanvas(canvas, 240);
  const total = segments.reduce((s, x) => s + x.value, 0);
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 14, inner = r * 0.62;
  if (total <= 0) {
    ctx.fillStyle = '#8d99ae';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Belum ada pengeluaran', cx, cy);
    return segments.map((s) => ({ ...s, pct: 0 }));
  }
  let a0 = -Math.PI / 2;
  for (const s of segments) {
    const a1 = a0 + (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a0, a1);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    a0 = a1;
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#1d3557';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(fmtShort(total), cx, cy - 2);
  ctx.fillStyle = '#5c677d';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('Total belanja', cx, cy + 16);
  return segments.map((s) => ({ ...s, pct: total ? (s.value / total) * 100 : 0 }));
}

// Batang berkelompok: labels, series [{label, color, values}].
function drawGroupedBars(canvas, labels, series) {
  const { ctx, w, h } = setupCanvas(canvas, 260);
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 1);
  const padL = 52, padB = 26, padT = 18, padR = 8;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  ctx.strokeStyle = '#e2e8f0';
  ctx.fillStyle = '#5c677d';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y = padT + (plotH * i) / 4;
    const v = (max * (4 - i)) / 4;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
    ctx.fillText(fmtShort(v), padL - 6, y + 4);
  }
  const groupW = plotW / labels.length;
  const barW = Math.min(22, (groupW - 16) / series.length);
  labels.forEach((lab, gi) => {
    const gx = padL + gi * groupW;
    series.forEach((s, si) => {
      const v = s.values[gi];
      const bh = (v / max) * plotH;
      const x = gx + (groupW - barW * series.length) / 2 + si * barW;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.roundRect(x, padT + plotH - bh, barW, bh, [3, 3, 0, 0]);
      ctx.fill();
    });
    ctx.fillStyle = '#1d3557';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(lab, gx + groupW / 2, h - 8);
  });
}

// Batang horizontal kategori: rows [{label, value, color, max}].
function drawCategoryBars(canvas, rows) {
  const rowH = 34;
  const { ctx, w, h } = setupCanvas(canvas, rows.length * rowH + 8);
  const max = Math.max(...rows.map((r) => r.max || r.value), 1);
  ctx.font = '12px system-ui, sans-serif';
  rows.forEach((r, i) => {
    const y = 8 + i * rowH;
    ctx.fillStyle = '#1d3557';
    ctx.textAlign = 'left';
    ctx.fillText(r.label, 0, y + 12);
    ctx.fillStyle = '#5c677d';
    ctx.textAlign = 'right';
    ctx.fillText(fmtShort(r.value) + ' / ' + fmtShort(r.max || r.value), w, y + 12);
    const barY = y + 18, barH = 9;
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(0, barY, w, barH, 4);
    ctx.fill();
    const frac = Math.min(1, (r.value || 0) / max);
    ctx.fillStyle = r.value > (r.max || Infinity) ? '#e76f51' : r.color;
    ctx.beginPath();
    ctx.roundRect(0, barY, Math.max(2, w * frac), barH, 4);
    ctx.fill();
  });
}

// Garis tren saldo: points [{label, value}].
function drawLine(canvas, points) {
  const { ctx, w, h } = setupCanvas(canvas, 220);
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const padL = 52, padB = 26, padT = 16, padR = 12;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  ctx.strokeStyle = '#e2e8f0';
  ctx.fillStyle = '#5c677d';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 3; i++) {
    const y = padT + (plotH * i) / 3;
    const v = max - (span * i) / 3;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
    ctx.fillText(fmtShort(v), padL - 6, y + 4);
  }
  const xs = points.map((_, i) => padL + (plotW * i) / (points.length - 1));
  const ys = points.map((p) => padT + plotH - ((p.value - min) / span) * plotH);
  ctx.beginPath();
  ctx.moveTo(xs[0], ys[0]);
  for (let i = 1; i < xs.length; i++) ctx.lineTo(xs[i], ys[i]);
  ctx.strokeStyle = '#2a9d8f';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.lineTo(xs[xs.length - 1], padT + plotH);
  ctx.lineTo(xs[0], padT + plotH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(42,157,143,0.12)';
  ctx.fill();
  ctx.fillStyle = '#2a9d8f';
  xs.forEach((x, i) => {
    ctx.beginPath();
    ctx.arc(x, ys[i], 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#1d3557';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  points.forEach((p, i) => ctx.fillText(p.label, xs[i], h - 8));
}
