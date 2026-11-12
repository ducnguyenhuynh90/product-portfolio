/* Case scenes: three interactive 3D simulations mounted inside the Playground.
   Each mount returns { set(state), dispose() }. Only one runs at a time. */
(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const T = () => window.THREE;
function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- shared stage ---------- */
function stage(el, o){
  const THREE = T();
  el.classList.add('scene');
  const canvas = document.createElement('canvas'); canvas.className = 'scene-canvas'; canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', o.aria || '3D scene');
  const labels = document.createElement('div'); labels.className = 'scene-labels';
  el.append(canvas, labels);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(o.fov || 38, 1, .1, 500);
  scene.add(new THREE.HemisphereLight(0xB8D4FF, 0x0B1020, .75));
  const sun = new THREE.DirectionalLight(0xFFF1DC, 1.1); sun.position.set(10, 22, 12); scene.add(sun);
  const lbls = [];
  const label = (html, obj, dy = 0, cls = '') => { const d = document.createElement('div'); d.className = 'slabel ' + cls; d.innerHTML = html; labels.appendChild(d); const l = { d, obj, dy, show:true }; lbls.push(l); return l; };
  let theta = o.theta || 0, phi = o.phi || .9, r = o.r || 34, wTheta = theta, down = null, auto = o.auto ?? true;
  const target = (o.target || new THREE.Vector3()).clone();
  const pd = e => { down = { x:e.clientX, y:e.clientY, th:wTheta, ph:phi }; };
  const pm = e => { if (!down) return; wTheta = down.th - (e.clientX - down.x) * .006; phi = Math.max(.25, Math.min(1.35, down.ph - (e.clientY - down.y) * .004)); };
  const pu = () => down = null;
  canvas.addEventListener('pointerdown', pd); addEventListener('pointermove', pm); addEventListener('pointerup', pu);
  const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let raf = 0, last = performance.now(), t = 0, alive = true, visible = true, tick = () => {};
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && alive && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }); io.observe(el);
  const v = new THREE.Vector3();
  function frame(now){
    raf = 0; if (!alive || !visible) return;
    const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now; t += dt;
    if (auto && !down && !reduce) wTheta += dt * .03;
    theta += (wTheta - theta) * .12;
    const rr = r * Math.max(1, 1.15 / camera.aspect);
    camera.position.set(target.x + rr * Math.cos(phi) * Math.sin(theta), target.y + rr * Math.sin(phi), target.z + rr * Math.cos(phi) * Math.cos(theta));
    camera.lookAt(target);
    tick(dt, t);
    lbls.forEach(l => { if (!l.show){ l.d.style.opacity = 0; return; } l.obj.getWorldPosition(v); v.y += l.dy;
      if (l.occlude && v.dot(camera.position.clone().sub(v)) < 0){ l.d.style.opacity = 0; return; } v.project(camera);
      l.d.style.opacity = v.z > 1 ? 0 : 1; l.d.style.left = ((v.x + 1) / 2 * el.clientWidth) + 'px'; l.d.style.top = ((1 - v.y) / 2 * el.clientHeight) + 'px'; });
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return { THREE, scene, camera, label, target, el,
    onTick(f){ tick = f; },
    setAuto(a){ auto = a; },
    dispose(){ alive = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); removeEventListener('pointermove', pm); removeEventListener('pointerup', pu);
      scene.traverse(o => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
      renderer.dispose(); renderer.forceContextLoss(); el.innerHTML = ''; el.classList.remove('scene'); } };
}
const kit = THREE => ({
  M:(c, x = {}) => new THREE.MeshStandardMaterial(Object.assign({ color:c, flatShading:true, roughness:.75 }, x)),
  E:(c, i = 1) => new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:i, flatShading:true, roughness:.4 }),
  mesh(g, m, x = 0, y = 0, z = 0){ const k = new THREE.Mesh(g, m); k.position.set(x, y, z); return k; },
  box(w, h, d, m, x = 0, y = 0, z = 0){ const k = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); k.position.set(x, y + h/2, z); return k; }
});

/* =========================================================
   1. EV NETWORK: cloud control, in-house AI network, partner hub, wallet
   ========================================================= */
function evNetwork(el, state, onStats){
  const S = stage(el, { theta:.5, phi:.78, r:54, target:new (T().Vector3)(0, 4, 0), aria:'EV charging network: chargers connected to a cloud control layer, cars arriving, charging and leaving' });
  const { THREE, scene } = S, K = kit(THREE), R = rng(11);
  const C = { own:0x10B981, partner:0xA78BFA, busy:0x38BDF8, down:0xF87171, gold:0xF59E0B, cloud:0x7DD3FC };
  // ground + roads
  scene.add(K.mesh(new THREE.BoxGeometry(46, .4, 32), K.M(0x111A33), 0, -.2, 0));
  [-8, 0, 8].forEach(z => scene.add(K.box(46, .02, 1.4, K.M(0x1C2846), 0, 0, z)));
  [-16, -6, 6, 16].forEach(x => scene.add(K.box(1.4, .02, 32, K.M(0x1C2846), x, 0, 0)));
  // a few low buildings for context
  for (let i = 0; i < 18; i++){ const x = -20 + R() * 40, z = -14 + R() * 28; if (Math.abs(z) % 8 < 2 || [-16,-6,6,16].some(q => Math.abs(x - q) < 2)) continue; scene.add(K.box(1.6, .6 + R() * 2.4, 1.6, K.M(0x1E2A4A), x, 0, z)); }
  // cloud
  const cloud = new THREE.Group(); cloud.position.set(0, 17, 0); cloud.scale.setScalar(.75); scene.add(cloud);
  [[0,0,0,2.2],[2,-.3,.5,1.6],[-2.1,-.2,-.3,1.7],[.8,.6,-1,1.5],[-1,.5,1,1.4]].forEach(([x,y,z,s]) => cloud.add(K.mesh(new THREE.IcosahedronGeometry(s, 1), new THREE.MeshStandardMaterial({ color:0xBFE6FF, emissive:C.cloud, emissiveIntensity:.35, flatShading:true, transparent:true, opacity:.9 }), x, y, z)));
  S.label('<b>Cloud control</b><small>VinFast / AmpUp platform</small>', cloud, 3.2, 'big');
  // partner hub
  const hub = new THREE.Group(); hub.position.set(0, 0, -13); scene.add(hub);
  hub.add(K.mesh(new THREE.CylinderGeometry(.9, 1.3, 7, 8), K.M(0x3B2A63), 0, 3.5, 0));
  const hubTop = K.mesh(new THREE.SphereGeometry(.9, 12, 8), K.E(C.partner, .8), 0, 7.3, 0); hub.add(hubTop);
  const hubLbl = S.label('<b>Largest local network</b><small>partner hub</small>', hub, 9);
  // chargers
  const ownPos = [[-16,-4],[-16,4],[-6,-11],[-6,11],[6,-11],[6,11],[16,-4],[16,4],[-11,0],[11,0]];
  const partPos = []; for (let i = 0; i < 20; i++) partPos.push([-21 + R() * 42, -15 + R() * 26]);
  const chargers = [];
  function makeCharger(p, kind){
    const g = new THREE.Group(); g.position.set(p[0], 0, p[1]); scene.add(g);
    g.add(K.box(.5, 1.3, .5, K.M(0xE2E8F0)));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.75, .09, 6, 24), K.E(kind === 'own' ? C.own : C.partner, 1)); ring.rotation.x = Math.PI/2; ring.position.y = .1; g.add(ring);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p[0], 1.4, p[1]), kind === 'own' ? cloud.position.clone() : new THREE.Vector3(0, 7, -13)]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color:kind === 'own' ? C.cloud : C.partner, transparent:true, opacity:.18 })); scene.add(line);
    const c = { g, ring, line, kind, pos:new THREE.Vector3(p[0], 0, p[1]), up:true, downT:0, occ:null, queue:[], active:true, upTime:0, totTime:0 };
    chargers.push(c); return c;
  }
  ownPos.forEach(p => makeCharger(p, 'own')); partPos.forEach(p => makeCharger(p, 'partner'));
  const roam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([cloud.position.clone(), new THREE.Vector3(0, 7.3, -13)]), new THREE.LineDashedMaterial({ color:C.gold, dashSize:.6, gapSize:.4 })); roam.computeLineDistances(); scene.add(roam);
  const roamLbl = S.label('<b>Roaming link</b><small>connect once, scale fast</small>', roam, 0, 'gold'); roamLbl.obj = new THREE.Object3D(); roamLbl.obj.position.set(0, 10.4, -6.5); scene.add(roamLbl.obj);
  // beams (cloud ↔ object flashes)
  const beams = []; for (let i = 0; i < 8; i++){ const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color:0xffffff, transparent:true, opacity:0 })); scene.add(l); beams.push({ l, t:0 }); }
  function beam(to, color){ const b = beams.find(x => x.t <= 0) || beams[0]; const a = b.l.geometry.attributes.position; a.setXYZ(0, cloud.position.x, cloud.position.y - 1.5, cloud.position.z); a.setXYZ(1, to.x, to.y + 1.5, to.z); a.needsUpdate = true; b.l.material.color.setHex(color); b.t = .7; }
  // cars
  const pal = [0xF8FAFC, 0x38BDF8, 0x10B981, 0xF59E0B, 0xF472B6, 0x94A3B8];
  const cars = [];
  function spawnCar(){
    const g = new THREE.Group(); g.scale.setScalar(1.35); const body = K.box(1.2, .45, .62, K.M(pal[Math.floor(R() * pal.length)], { metalness:.4, roughness:.35 })); g.add(body); g.add(K.box(.62, .32, .56, K.M(0x9FB4D8, { metalness:.6, roughness:.2 }), -.08, .45, 0));
    const dot = K.mesh(new THREE.SphereGeometry(.2, 8, 6), K.E(0xF59E0B, 1.4), 0, 1.3, 0); g.add(dot);
    const side = R() < .5 ? -1 : 1, z = [-8, 0, 8][Math.floor(R() * 3)];
    g.position.set(side * 24, 0, z); scene.add(g);
    const car = { g, dot, st:'drive', ch:null, t:0, arrived:0, auth:0, rerouted:false };
    cars.push(car); assign(car);
  }
  const usable = () => chargers.filter(c => c.active);
  function assign(car){
    const list = usable(); let best = null, bs = 1e9;
    list.forEach(c => { const d = c.pos.distanceTo(car.g.position); const s = state.ai ? d + (c.up ? 0 : 999) + (c.occ ? 12 : 0) + c.queue.length * 14 : d; if (s < bs){ bs = s; best = c; } });
    if (car.ch) car.ch.queue = car.ch.queue.filter(x => x !== car);
    car.ch = best; car.st = 'drive';
    if (state.ai) beam(best.pos, 0x7DD3FC);
  }
  const stats = { waits:[], sessions:[], fails:[], t:0, since:0 }; let now = 0;
  let spawnT = 0, faultT = 3, statT = 0;
  function setMarket(){
    chargers.forEach((c, i) => { const isOwn = c.kind === 'own'; c.active = state.market === 'key' ? isOwn : (isOwn ? (i === 8 || i === 9) : state.hub);
      c.g.visible = c.active || (c.kind === 'partner' && state.market === 'exp'); c.line.visible = c.active; c.ring.material.opacity = 1;
      if (!c.active){ c.ring.material.emissive.setHex(0x334155); c.ring.material.color.setHex(0x334155); } });
    hub.visible = state.market === 'exp'; hubLbl.show = hub.visible; roam.visible = state.market === 'exp' && state.hub; roamLbl.show = roam.visible;
    cars.forEach(car => { if (car.ch && !car.ch.active && (car.st === 'drive' || car.st === 'queue')) assign(car); });
  }
  setMarket();
  S.onTick((dt, t) => {
    const sp = reduce ? 0 : 1; now = t;
    // spawn demand
    spawnT -= dt * sp; if (spawnT <= 0 && cars.length < 34){ spawnCar(); spawnT = .55 + R() * .4; }
    // faults
    faultT -= dt * sp; if (faultT <= 0){ const ups = usable().filter(c => c.up); if (ups.length > 1){ const c = ups[Math.floor(R() * ups.length)]; c.up = false; c.downT = state.ai ? 1.4 : 14; if (state.ai) beam(c.pos, 0xF87171); } faultT = (36 + R() * 20) / Math.max(1, usable().length); }
    chargers.forEach(c => { if (!c.active) return; c.totTime += dt; if (c.up) c.upTime += dt; else { c.downT -= dt * sp; if (c.downT <= 0){ c.up = true; if (state.ai) beam(c.pos, 0x10B981); } }
      const col = !c.up ? C.down : c.occ ? C.busy : (c.kind === 'own' ? C.own : C.partner); c.ring.material.color.setHex(col); c.ring.material.emissive.setHex(col);
      c.ring.material.emissiveIntensity = !c.up ? 1 + Math.sin(t * 10) * .8 : c.occ ? .9 + Math.sin(t * 4) * .4 : .8; });
    // cars
    for (let i = cars.length - 1; i >= 0; i--){
      const car = cars[i], c = car.ch; car.t += dt * sp;
      if (car.st === 'drive'){ const tgt = c.pos.clone().add(new THREE.Vector3(1.4, 0, 0)); const d = tgt.clone().sub(car.g.position); const dist = d.length();
        if (dist < .3){ car.arrived = car.arrived || t; car.st = 'queue'; if (!c.queue.includes(car)) c.queue.push(car); }
        else { d.normalize(); car.g.position.addScaledVector(d, Math.min(dist, 9 * dt * sp)); car.g.rotation.y = Math.atan2(-d.z, d.x); } car.dot.material.emissive.setHex(0x94A3B8); }
      else if (car.st === 'queue'){ const qi = c.queue.indexOf(car); car.g.position.lerp(c.pos.clone().add(new THREE.Vector3(1.4 + qi * 1.5, 0, .9)), .1); car.dot.material.emissive.setHex(0xF59E0B);
        if (c.up && !c.occ && qi === 0){ c.queue.shift(); c.occ = car; car.st = 'auth'; car.auth = state.wallet ? .35 : 2.4; }
        else if (state.ai && t - car.arrived > .8 && t - (car.rerouted || 0) > 2){ const alt = usable().filter(x => x.up && !x.occ && !x.queue.length && x !== c).sort((a, b) => a.pos.distanceTo(car.g.position) - b.pos.distanceTo(car.g.position))[0]; if (alt){ car.rerouted = t; c.queue = c.queue.filter(x => x !== car); car.ch = alt; car.st = 'drive'; beam(alt.pos, 0x7DD3FC); } } }
      else if (car.st === 'auth'){ car.auth -= dt * sp; car.dot.material.emissive.setHex(state.wallet ? 0x10B981 : 0xF59E0B);
        if (car.auth <= 0){ if (!state.wallet && R() < .3){ car.auth = 2.4; car.dot.material.emissive.setHex(0xF87171); stats.fails.push(t); } else { car.st = 'charge'; car.t = 0; stats.waits.push(t - car.arrived); car.chargeFor = 3.5 + R() * 2; } } }
      else if (car.st === 'charge'){ car.dot.material.emissive.setHex(0x38BDF8); if (car.t > car.chargeFor){ c.occ = null; car.st = 'leave'; stats.sessions.push(t); car.exit = new THREE.Vector3((R() < .5 ? -1 : 1) * 25, 0, [-8, 0, 8][Math.floor(R() * 3)]); } }
      else if (car.st === 'leave'){ const d = car.exit.clone().sub(car.g.position); if (d.length() < .5){ scene.remove(car.g); cars.splice(i, 1); continue; } d.normalize(); car.g.position.addScaledVector(d, 10 * dt * sp); car.g.rotation.y = Math.atan2(-d.z, d.x); }
      car.dot.position.y = 1.3 + Math.sin(t * 4 + i) * .08;
    }
    beams.forEach(b => { if (b.t > 0){ b.t -= dt; b.l.material.opacity = Math.max(0, b.t / .7); } });
    cloud.rotation.y = t * .1;
    // stats (1 s of sim = 1 min)
    statT -= dt; if (statT <= 0){ statT = .5;
      const win = 60; const ws = stats.waits.slice(-30); const sess = stats.sessions.filter(x => t - x < win).length; const fails = stats.fails.filter(x => t - x < win).length;
      const act = usable(); const up = act.reduce((s, c) => s + c.upTime, 0) / Math.max(1e-6, act.reduce((s, c) => s + c.totTime, 0));
      const span = Math.min(win, Math.max(5, t - stats.since)); onStats({ wait:ws.length ? ws.reduce((a, b) => a + b) / ws.length : 0, sessions:sess * (60 / span), fails:Math.round(fails * (60 / span)), uptime:up, chargers:act.length, queue:act.reduce((s, c) => s + c.queue.length, 0) }); }
  });
  return { set(s){ const resetUp = s.market !== state.market || s.hub !== state.hub || s.ai !== state.ai; Object.assign(state, s); setMarket();
      if (resetUp){ chargers.forEach(c => { c.upTime = 0; c.totTime = 0; }); stats.waits.length = 0; stats.sessions.length = 0; stats.fails.length = 0; stats.since = now;
        cars.forEach(car => { if (car.st === 'queue' || car.st === 'drive'){ car.arrived = 0; assign(car); } }); } },
    dispose:S.dispose };
}

/* =========================================================
   2. GHN: from 3 to 64 centres, fail reasons tracked and fixed
   ========================================================= */
const VN = [[-3,-15],[3,-15.5],[5,-13],[3,-11],[1,-9],[2,-6],[3.5,-3],[5,0],[6,3],[6.5,6],[6,9],[4.5,11],[2,13.5],[-1,15],[-3.5,14],[-2.5,12],[-.5,10],[1,7],[1.5,4],[.5,1],[-1,-2],[-2.5,-5],[-4,-8],[-6,-11],[-5,-13.5]];
function inPoly(x, z){ let ins = false; for (let i = 0, j = VN.length - 1; i < VN.length; j = i++){ const [xi, zi] = VN[i], [xj, zj] = VN[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) ins = !ins; } return ins; }
function ghn(el, state, onStats){
  const S = stage(el, { theta:.35, phi:1.0, r:40, target:new (T().Vector3)(0, 0, 0), aria:'Stylised map of Vietnam with delivery centres; packages flow from sort hubs to centres to homes' });
  const { THREE, scene } = S, K = kit(THREE), R = rng(5);
  const shape = new THREE.Shape(VN.map(([x, z]) => new THREE.Vector2(x, -z)));
  const land = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth:.8, bevelEnabled:false }), K.M(0x1E3A5F)); land.rotation.x = -Math.PI/2; land.position.y = -.8; scene.add(land);
  scene.add(K.mesh(new THREE.BoxGeometry(60, .2, 50), K.M(0x0F1F48, { roughness:.35, metalness:.3 }), 0, -1, 0));
  const hubs = [[-1,-12,'Hanoi'],[3.6,-1,'Da Nang'],[1,12,'Ho Chi Minh City']];
  const centres = [];
  hubs.forEach(([x, z, n]) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.add(K.box(1.6, 1.2, 1.6, K.M(0xFB923C))); g.add(K.box(1.7, .12, 1.7, K.E(0xFB923C, .9), 0, 1.2, 0)); scene.add(g); centres.push({ g, x, z, hub:true }); S.label(`<b>${n}</b>`, g, 2.2); });
  let tries = 0; while (centres.length < 64 && tries++ < 5000){ const x = -6 + R() * 12.5, z = -15 + R() * 30; if (!inPoly(x, z) || centres.some(c => Math.hypot(c.x - x, c.z - z) < 1.15)) continue;
    const g = new THREE.Group(); g.position.set(x, 0, z); g.add(K.box(.55, .5, .55, K.M(0x38BDF8))); g.add(K.box(.6, .06, .6, K.E(0x38BDF8, .8), 0, .5, 0)); g.scale.setScalar(.001); scene.add(g); centres.push({ g, x, z }); }
  const nearestHub = c => hubs.reduce((b, h, i) => Math.hypot(h[0] - c.x, h[1] - c.z) < Math.hypot(hubs[b][0] - c.x, hubs[b][1] - c.z) ? i : b, 0);
  const pk = []; const geo = new THREE.BoxGeometry(.28, .28, .28);
  const matOk = K.E(0xF8FAFC, .5), matGood = K.E(0x10B981, 1), matBad = K.E(0xF87171, 1.2);
  let spawnT = 0, statT = 0, delivered = 0, late = 0; const bins = [0,0,0,0,0];
  S.onTick((dt, t) => {
    const sp = reduce ? 0 : 1;
    const target = state.scale ? 64 : 3;
    centres.forEach((c, i) => { const want = i < target ? 1 : .001; const s = c.g.scale.x + (want - c.g.scale.x) * Math.min(1, dt * (2 + i * .02)); c.g.scale.setScalar(s); });
    const live = centres.filter((c, i) => i < target && c.g.scale.x > .5);
    spawnT -= dt * sp; const rate = state.scale ? 22 : 2.5;
    while (spawnT <= 0 && pk.length < 260){ spawnT += 1 / rate; const dest = live[Math.floor(R() * live.length)]; const h = hubs[dest.hub ? centres.indexOf(dest) : nearestHub(dest)];
      const m = new THREE.Mesh(geo, matOk); m.position.set(h[0], 1.4, h[1]); scene.add(m);
      const home = new THREE.Vector3(dest.x + (R() - .5) * 2.4, .2, dest.z + (R() - .5) * 2.4);
      pk.push({ m, a:new THREE.Vector3(h[0], 1.4, h[1]), b:new THREE.Vector3(dest.x, .9, dest.z), c:home, t:0, fail:R() > state.onTime, reason:0 }); }
    for (let i = pk.length - 1; i >= 0; i--){ const p = pk[i]; p.t += dt * sp * .9;
      if (p.t < 1){ const u = p.t; p.m.position.lerpVectors(p.a, p.b, u); p.m.position.y += Math.sin(u * Math.PI) * 2.2; }
      else if (p.t < 1.5){ p.m.position.lerpVectors(p.b, p.c, (p.t - 1) * 2); }
      else if (p.t < 1.52){ if (p.fail){ p.m.material = matBad; late++; if (state.track){ const w = state.shares; let x = R() * w.reduce((a, b) => a + b, 0), k = 0; while (k < 4 && x > w[k]){ x -= w[k]; k++; } bins[k]++; } } else { p.m.material = matGood; delivered++; } }
      else if (p.t < 2.4){ if (p.fail && state.track){ p.m.position.y += dt * 4; p.m.position.x += dt * 6; } else p.m.position.y += dt * .6; p.m.scale.setScalar(Math.max(.01, 1 - (p.t - 1.52))); }
      else { scene.remove(p.m); pk.splice(i, 1); } }
    statT -= dt; if (statT <= 0){ statT = .4; onStats({ bins:bins.slice(), centres:live.length, onTime:state.onTime }); }
  });
  return { set(s){ Object.assign(state, s); if (s.resetBins) bins.fill(0); }, dispose:S.dispose };
}

/* =========================================================
   3. UPLIVE: launch by language, invest by country ROI
   ========================================================= */
const LANG = {
  zh:{ n:'Chinese', c:0xF472B6, m:[['Hong Kong',22.3,114.2,.6],['Taiwan',23.7,121,1],['Malaysia',3.1,101.7,.8],['Singapore',1.35,103.8,.45]] },
  ar:{ n:'Arabic', c:0xF59E0B, m:[['Saudi Arabia',24.7,46.7,.9],['UAE',25.2,55.3,.7],['Egypt',30,31.2,.5]] },
  es:{ n:'Spanish', c:0x38BDF8, m:[['Mexico',19.4,-99.1,.8],['Colombia',4.7,-74,.55],['Spain',40.4,-3.7,.4]] }
};
const WORLD = [[35.7,139.7],[37.6,127],[14.6,121],[-6.2,106.8],[13.8,100.5],[21,105.8],[28.6,77.2],[23.8,90.4],[24.9,67],[41,29],[55.8,37.6],[51.5,-.1],[48.9,2.35],[52.5,13.4],[41.9,12.5],[6.5,3.4],[-1.3,36.8],[-26.2,28],[40.7,-74],[34,-118.2],[43.7,-79.4],[-12,-77],[-23.5,-46.6],[-34.6,-58.4],[-33.4,-70.6],[-33.9,151.2],[10.8,106.7],[35.7,51.4],[33.3,44.4],[31.9,35.9],[33.6,-7.6],[52.2,21],[50.4,30.5],[38,23.7],[38.7,-9.1],[10.5,-66.9],[-.2,-78.5],[11.6,104.9],[16.8,96.2],[6.9,79.9],[27.7,85.3],[25.3,51.5],[29.4,47.98],[59.3,18.1],[60.2,24.9],[47.5,19],[44.4,26.1],[-4.3,15.3],[9,38.7],[-18.9,47.5]];
function uplive(el, state, onStats){
  const S = stage(el, { theta:0, phi:.25, r:34, auto:false, aria:'Globe showing language-first launches: markers light up together for each language, and the highest-return market gets more investment' });
  const { THREE, scene } = S, K = kit(THREE);
  const RAD = 10, globe = new THREE.Group(); scene.add(globe);
  globe.add(K.mesh(new THREE.SphereGeometry(RAD * .985, 48, 32), new THREE.MeshStandardMaterial({ color:0x13204A, roughness:.6, metalness:.1 })));
  { const n = 1600, a = new Float32Array(n * 3); for (let i = 0; i < n; i++){ const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y*y), th = i * 2.399963; a[i*3] = Math.cos(th) * r * RAD; a[i*3+1] = y * RAD; a[i*3+2] = Math.sin(th) * r * RAD; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); globe.add(new THREE.Points(g, new THREE.PointsMaterial({ color:0x2B3D6B, size:.12 }))); }
  const ll = (lat, lon, r = RAD) => { const p = (90 - lat) * Math.PI / 180, t = (lon + 180) * Math.PI / 180; return new THREE.Vector3(-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)); };
  const markers = [];
  Object.entries(LANG).forEach(([k, L]) => L.m.forEach(([n, la, lo, roi]) => {
    const g = new THREE.Group(); const p = ll(la, lo); g.position.copy(p); g.lookAt(p.clone().multiplyScalar(2)); globe.add(g);
    const pin = K.mesh(new THREE.CylinderGeometry(.12, .12, .5, 8), K.E(0x475569, .3), 0, 0, .25); pin.rotation.x = Math.PI/2; g.add(pin);
    const bar = K.mesh(new THREE.BoxGeometry(.35, .35, 1), K.E(L.c, .9), 0, 0, .5); bar.scale.z = .001; g.add(bar);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.4, .55, 24), new THREE.MeshBasicMaterial({ color:L.c, transparent:true, opacity:0, side:THREE.DoubleSide })); ring.position.z = .05; g.add(ring);
    const tip = new THREE.Object3D(); tip.position.z = 1.2; g.add(tip);
    const lab = S.label(`<b>${n}</b><small></small>`, tip, 0); lab.show = false; lab.occlude = true;
    markers.push({ k, n, roi, g, pin, bar, ring, lab, tip, lit:0, test:0, invest:false });
  }));
  const CN = new THREE.Group(); { const p = ll(35, 103); CN.position.copy(p); CN.lookAt(p.clone().multiplyScalar(2)); const pin = K.mesh(new THREE.CylinderGeometry(.14, .14, .5, 8), K.E(0x64748B, .3), 0, 0, .25); pin.rotation.x = Math.PI/2; CN.add(pin); globe.add(CN); }
  const cnTip = new THREE.Object3D(); cnTip.position.z = 1; CN.add(cnTip); const cnLab = S.label('<b>Mainland China</b><small>single-country launch: slow</small>', cnTip, 0, 'muted'); cnLab.show = false; cnLab.occlude = true;
  const world = WORLD.map(([la, lo]) => { const m = K.mesh(new THREE.SphereGeometry(.13, 8, 6), K.E(0x10B981, 1), 0, 0, 0); m.position.copy(ll(la, lo, RAD * 1.01)); m.scale.setScalar(.001); globe.add(m); return m; });
  const arcs = new THREE.Group(); globe.add(arcs);
  function arc(a, b, color){ const mid = a.clone().add(b).multiplyScalar(.5).normalize().multiplyScalar(RAD * 1.35); const c = new THREE.QuadraticBezierCurve3(a, mid, b);
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(30)), new THREE.LineBasicMaterial({ color, transparent:true, opacity:.7 })); arcs.add(l); }
  let run = null; let rotY = -1.9, wRotY = -1.9;
  function start(){
    markers.forEach(m => { m.lit = 0; m.test = 0; m.invest = false; m.bar.scale.z = .001; m.lab.show = false; });
    while (arcs.children.length) arcs.remove(arcs.children[0]);
    world.forEach(w => w.scale.setScalar(.001)); cnLab.show = false;
    run = { t:0, week:0, done:false, plan: state.mode === 'lang'
      ? ['zh','ar','es'].map((k, i) => ({ at:i * 3.2, keys:markers.filter(m => m.k === k), k }))
      : [{ at:0, cn:true }, ...markers.map((m, i) => ({ at:3.4 + i * 2.2, keys:[m], k:m.k }))] };
  }
  S.onTick((dt, t) => {
    rotY += (wRotY - rotY) * .04; globe.rotation.y = rotY;
    if (!run){ if (!reduce) wRotY += dt * .08; return; }
    run.t += dt * (reduce ? 50 : 1);
    const wpp = state.mode === 'lang' ? 4 / 3.2 : 4 / 2.2; // weeks per second of animation
    run.week = Math.min(state.mode === 'lang' ? 12 : 4 + markers.length * 4, run.t * wpp);
    run.plan.forEach(p => { if (run.t >= p.at && !p.on){ p.on = true;
      if (p.cn){ cnLab.show = true; const ll0 = 103; wRotY = -(ll0 + 90) * Math.PI / 180; return; }
      p.keys.forEach(m => { m.lit = run.t; m.lab.show = true; });
      const lon = LANG[p.k].m.reduce((s, x) => s + x[2], 0) / LANG[p.k].m.length; wRotY = -(lon + 90) * Math.PI / 180;
      if (state.mode === 'lang' && p.keys.length > 1) for (let i = 1; i < p.keys.length; i++) arc(p.keys[0].g.position.clone(), p.keys[i].g.position.clone(), LANG[p.k].c); } });
    markers.forEach(m => { if (!m.lit) return; const age = run.t - m.lit;
      m.ring.material.opacity = Math.max(0, .9 - (age % 1.2)); m.ring.scale.setScalar(1 + (age % 1.2) * 1.4);
      m.bar.scale.z = Math.min(1, age / 1.4) * m.roi * 2.4 + .001; m.bar.position.z = m.bar.scale.z / 2 + .1;
      m.tip.position.z = m.bar.scale.z + .9;
      const grp = markers.filter(x => x.k === m.k && x.lit); const best = grp.reduce((a, b) => b.roi > a.roi ? b : a);
      if (age > 1.6 && m === best && (state.mode === 'country' || grp.length === LANG[m.k].m.length)) m.invest = true;
      m.lab.d.querySelector('small').textContent = age < 1.4 ? 'testing…' : m.invest ? 'high ROI → invest' : 'ROI measured';
      m.lab.d.classList.toggle('gold', m.invest); });
    const total = run.plan[run.plan.length - 1].at + 2.4;
    if (run.t > total && !run.done){ run.done = true; }
    if (run.done && state.mode === 'lang'){ world.forEach((w, i) => { const s = Math.min(1, Math.max(.001, (run.t - total - i * .04) * 2)); w.scale.setScalar(s); }); if (!reduce) wRotY += dt * .15; }
    onStats({ week:run.week, tested:markers.filter(m => m.lit).length, invest:markers.filter(m => m.invest).map(m => m.n), done:run.done, mode:state.mode });
  });
  return { set(s){ Object.assign(state, s); if (s.go) start(); }, dispose:S.dispose };
}

/* =========================================================
   4. AGENT CREW HQ: Nami → Zoro → Luffy → person
   ========================================================= */
function crew(el, state){
  const S = stage(el, { theta:.15, phi:.72, r:40, target:new (T().Vector3)(0, 1, 1), aria:'Agent crew headquarters: Nami monitors, Zoro researches, Luffy gates, a person decides; work packets move between them' });
  const { THREE, scene } = S, K = kit(THREE);
  const C = { nami:0xF472B6, zoro:0x10B981, luffy:0xF59E0B, human:0x38BDF8 };
  scene.add(K.mesh(new THREE.CylinderGeometry(15, 14, 1, 40), K.M(0x141E3A), 0, -.5, 0));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(15, .08, 6, 80), K.E(0x38BDF8, .5)); rim.rotation.x = Math.PI/2; scene.add(rim);
  const P = { nami:new THREE.Vector3(-9, 0, 1), zoro:new THREE.Vector3(-3, 0, -6), luffy:new THREE.Vector3(4, 0, -5), human:new THREE.Vector3(9, 0, 2) };
  const st = {};
  Object.entries(P).forEach(([k, p]) => {
    const g = new THREE.Group(); g.position.copy(p); scene.add(g);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, .2, 32), K.M(0x1C2846)); pad.position.y = .1; g.add(pad);
    const glow = new THREE.Mesh(new THREE.RingGeometry(2.7, 3.2, 40), new THREE.MeshBasicMaterial({ color:C[k], transparent:true, opacity:.15, side:THREE.DoubleSide })); glow.rotation.x = -Math.PI/2; glow.position.y = .22; g.add(glow);
    st[k] = { g, glow, on:0 };
  });
  // Nami: alarm tower + report screens
  const n = st.nami.g; n.add(K.mesh(new THREE.CylinderGeometry(.35, .5, 4.4, 8), K.M(0x2A2350), 0, 2.4, 0));
  const beacon = K.mesh(new THREE.SphereGeometry(.55, 14, 10), K.E(C.nami, 1), 0, 4.9, 0); n.add(beacon);
  const ping = new THREE.Mesh(new THREE.TorusGeometry(.8, .05, 6, 32), new THREE.MeshBasicMaterial({ color:C.nami, transparent:true })); ping.rotation.x = Math.PI/2; ping.position.y = 4.9; n.add(ping);
  [-1.3, 1.3].forEach((x, i) => { const s = K.box(1.6, 1.1, .1, K.M(0x0F172A), x, .6, 1.2); n.add(s); for (let j = 0; j < 4; j++){ const b = K.box(.22, .2 + j * .15, .04, K.E(i ? 0xF87171 : C.nami, .9), x - .5 + j * .33, .75, 1.27); b.userData.base = .2 + j * .15; n.add(b); st.nami.bars = (st.nami.bars || []).concat(b); } });
  // Zoro: data tower, dish, analysis screens
  const z = st.zoro.g; z.add(K.mesh(new THREE.CylinderGeometry(.45, .6, 4, 8), K.M(0x1F3A3A), 0, 2.2, 0));
  const rings = [0, 1, 2].map(i => { const r = new THREE.Mesh(new THREE.TorusGeometry(.9, .05, 6, 28), K.E(C.zoro, .9)); r.rotation.x = Math.PI/2; r.position.y = 1.3 + i * 1.1; z.add(r); return r; });
  const dish = K.mesh(new THREE.SphereGeometry(.8, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2.4), K.M(0xCBD5E1), 1.8, 1.4, .6); dish.rotation.x = -.8; z.add(dish); z.add(K.box(.15, .9, .15, K.M(0x94A3B8), 1.8, 0, .6));
  const curve = []; for (let j = 0; j < 7; j++){ const b = K.box(.2, .3, .2, K.E(C.zoro, .8), -1.9 + j * .3, .3, 1.4); curve.push(b); z.add(b); }
  // Luffy: gate
  const L = st.luffy.g; const gate = new THREE.Group(); L.add(gate); gate.rotation.y = -.5;
  gate.add(K.box(.4, 3, .4, K.M(0xE2E8F0), -1.3, 0, 0)); gate.add(K.box(.4, 3, .4, K.M(0xE2E8F0), 1.3, 0, 0));
  const lintel = K.box(3.2, .4, .5, K.E(C.luffy, 1), 0, 3, 0); gate.add(lintel);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.8), new THREE.MeshBasicMaterial({ color:C.luffy, transparent:true, opacity:.12, side:THREE.DoubleSide })); scan.position.y = 1.5; gate.add(scan);
  // Human desk
  const H = st.human.g; H.add(K.box(2.2, .8, 1.2, K.M(0x22315A), 0, 0, 0)); H.add(K.box(1.6, .9, .08, K.E(C.human, .7), 0, .85, -.4));
  H.add(K.mesh(new THREE.CapsuleGeometry(.3, .7, 4, 10), K.M(0xF8FAFC), 0, .9, 1.1)); H.add(K.mesh(new THREE.SphereGeometry(.28, 12, 8), K.M(0xF8FAFC), 0, 1.75, 1.1));
  // Agent figures
  const figs = {}; [['nami', 6], ['zoro', 5.6], ['luffy', 4.4]].forEach(([k, h]) => { const f = K.mesh(new THREE.OctahedronGeometry(.6), K.E(C[k], 1), 0, h, 0); st[k].g.add(f); figs[k] = { f, h }; });
  S.label('<b>Nami</b><small>reports &amp; alerts</small>', st.nami.g, 7.2);
  S.label('<b>Zoro</b><small>research, simulation, tickets</small>', st.zoro.g, 6.8);
  S.label('<b>Luffy</b><small>gatekeeper</small>', st.luffy.g, 5.6);
  S.label('<b>Product lead</b><small>decides</small>', st.human.g, 3);
  // links + packet
  const link = (a, b) => { const m = P[a].clone().add(P[b]).multiplyScalar(.5).setY(5); return new THREE.QuadraticBezierCurve3(P[a].clone().setY(2.5), m, P[b].clone().setY(2.5)); };
  [['nami','zoro'],['zoro','luffy'],['luffy','human'],['luffy','zoro']].forEach(([a, b], i) => { if (i === 3) return; const c = link(a, b); const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(30)), new THREE.LineDashedMaterial({ color:0x94A3B8, dashSize:.3, gapSize:.25, transparent:true, opacity:.4 })); l.computeLineDistances(); scene.add(l); });
  const packet = K.mesh(new THREE.BoxGeometry(.6, .6, .6), K.E(0xF8FAFC, 1.4), P.nami.x, 2.5, P.nami.z); scene.add(packet);
  let hop = null, cur = 'nami', gateFail = 0, gatePass = 0, alarm = 0;
  function go(agent, fail){
    if (agent === cur && !fail){ st[agent].on = 1; return; }
    if (fail){ gateFail = 2.5; st.luffy.on = 1; if (cur !== 'luffy') hop = { c:link(cur, 'luffy'), t:0, to:'luffy', bounce:true }; else hop = { c:link('luffy', 'zoro'), t:0, to:'zoro', red:true }; return; }
    hop = { c:link(cur, agent), t:0, to:agent };
    if (cur === 'luffy' && agent !== 'zoro') gatePass = 2;
  }
  S.onTick((dt, t) => {
    const sp = reduce ? 10 : 1;
    // ambient
    ping.scale.setScalar(1 + ((t * .8) % 1) * 2.5); ping.material.opacity = (1 - (t * .8) % 1) * (alarm > 0 ? 1 : .35);
    beacon.material.emissiveIntensity = alarm > 0 ? 1 + Math.sin(t * 12) * .9 : .8; alarm -= dt;
    st.nami.bars.forEach((b, i) => { b.scale.y = 1 + Math.sin(t * 2 + i) * .3; });
    rings.forEach((r, i) => { r.rotation.z = t * (.6 + i * .3); }); dish.rotation.z = Math.sin(t * .6) * .7;
    curve.forEach((b, j) => { b.scale.y = 1 + 2.5 * (.5 + .5 * Math.sin(t * 1.5 + j * .7)); });
    scan.position.y = 1.5 + Math.sin(t * 2) * .9;
    Object.entries(figs).forEach(([k, o], i) => { o.f.rotation.y = t * 1.2 + i; o.f.position.y = o.h + Math.sin(t * 2 + i) * .15; });
    Object.entries(st).forEach(([k, s]) => { s.on = Math.max(0, s.on - dt * .35); s.glow.material.opacity = .12 + s.on * .6; });
    lintel.material.emissive.setHex(gateFail > 0 ? 0xF87171 : gatePass > 0 ? 0x10B981 : C.luffy); gateFail -= dt; gatePass -= dt;
    scan.material.color.setHex(gateFail > 0 ? 0xF87171 : gatePass > 0 ? 0x10B981 : C.luffy);
    if (hop){ hop.t = Math.min(1, hop.t + dt * .9 * sp); packet.position.copy(hop.c.getPoint(hop.t)); packet.rotation.y = t * 3; packet.rotation.x = t * 2;
      packet.material.emissive.setHex(hop.red ? 0xF87171 : 0xF8FAFC);
      if (hop.t >= 1){ cur = hop.to; st[cur].on = 1; const h = hop; hop = null; if (h.bounce) hop = { c:link('luffy', 'zoro'), t:0, to:'zoro', red:true }; } }
    else { packet.position.y = 2.5 + Math.sin(t * 3) * .15; packet.rotation.y = t; }
  });
  return { set(s){ if (s.reset){ cur = s.start || 'nami'; hop = null; packet.position.copy(P[cur]).setY(2.5); alarm = s.alarm ? 6 : 0; Object.values(st).forEach(x => x.on = 0); st[cur].on = 1; }
      if (s.agent) go(s.agent, s.fail); }, dispose:S.dispose };
}

/* =========================================================
   5. VINMART: smart supermarket
   ========================================================= */
function retail(el, state, onStats){
  const S = stage(el, { theta:.55, phi:.85, r:34, target:new (T().Vector3)(0, 0, 0), aria:'Supermarket: shoppers walk aisles to find items, some shelves empty, then queue at checkout' });
  const { THREE, scene } = S, K = kit(THREE), R = rng(21);
  scene.add(K.mesh(new THREE.BoxGeometry(32, .4, 22), K.M(0x1A2440), 0, -.2, 0));
  for (let x = -15; x <= 15; x += 2) scene.add(K.box(.04, .01, 22, K.M(0x222E50), x, 0, 0));
  // walls
  scene.add(K.box(32, 2.2, .3, K.M(0x22315A), 0, 0, -11)); scene.add(K.box(.3, 2.2, 22, K.M(0x22315A), -16, 0, 0)); scene.add(K.box(.3, 2.2, 22, K.M(0x22315A), 16, 0, 0));
  const sign = K.box(6, .9, .2, K.E(0x38BDF8, .8), -12, 2.6, -11); scene.add(sign);
  // aisles: 5 shelves along z, at x = -10..6
  const shelfX = [-10, -6, -2, 2, 6], cols = [0x10B981, 0xF59E0B, 0xF472B6, 0x38BDF8, 0xA78BFA];
  const slots = [];
  shelfX.forEach((x, si) => { scene.add(K.box(1.2, 2, 12, K.M(0x334155), x, 0, -3));
    for (let lv = 0; lv < 3; lv++) for (let s = 0; s < 10; s++){ const b = K.box(.5, .45, .9, K.M(cols[si]), x + (s % 2 ? .35 : -.35), .2 + lv * .62, -8.4 + s * 1.2); scene.add(b); slots.push({ b, si, z:-8.4 + s * 1.2 }); } });
  const zoneSigns = shelfX.map((x, i) => { const g = K.box(1.6, .5, .1, K.E(cols[i], .9), x, 2.6, 3.4); scene.add(g); return g; });
  // checkouts at front (z = 7)
  const lanesX = [-6, -3, 0, 3, 6, 9];
  const lanes = lanesX.map(x => { const g = new THREE.Group(); g.position.set(x, 0, 6.5); g.add(K.box(.9, .9, 2.2, K.M(0x475569))); const light = K.mesh(new THREE.SphereGeometry(.2, 8, 6), K.E(0x10B981, 1), 0, 1.4, 0); g.add(light); scene.add(g); return { g, light, q:[], busy:null, open:true }; });
  // pickup lockers for online orders
  const lock = new THREE.Group(); lock.position.set(13, 0, -6); for (let i = 0; i < 3; i++) lock.add(K.box(1, 2.2, 1, K.E(0x0EA5E9, .25), 0, 0, i * 1.1 - 1.1)); scene.add(lock);
  S.label('<b>Online pickup</b><small>lockers</small>', lock, 3);
  const entry = new THREE.Vector3(-14, 0, 9.5), exitP = new THREE.Vector3(14, 0, 9.5);
  S.label('<b>Entrance</b>', { getWorldPosition:v => v.copy(entry) }, 1.6);
  const shoppers = []; let spawnT = 0, statT = 0; const done = [];
  function refreshShelves(){ slots.forEach(s => { s.b.visible = R() < state.inv / 100 + .02; }); zoneSigns.forEach(z => z.visible = state.disc >= 50);
    const open = Math.max(2, Math.round(2 + state.chk / 100 * 4)); lanes.forEach((l, i) => { l.open = i < open; l.light.material.emissive.setHex(l.open ? 0x10B981 : 0x475569); l.light.material.color.setHex(l.open ? 0x10B981 : 0x475569); }); }
  refreshShelves();
  function spawn(){
    const g = new THREE.Group(); g.add(K.mesh(new THREE.CapsuleGeometry(.28, .6, 3, 8), K.M([0xF8FAFC, 0xFDE68A, 0xC7D2FE, 0xFBCFE8][Math.floor(R() * 4)]), 0, .6, 0));
    const dot = K.mesh(new THREE.SphereGeometry(.16, 8, 6), K.E(0x94A3B8, 1), 0, 1.5, 0); g.add(dot);
    g.add(K.box(.5, .35, .6, K.M(0xCBD5E1), .5, .15, 0));
    g.position.copy(entry); scene.add(g);
    const items = [0, 1, 2].map(() => slots[Math.floor(R() * slots.length)]);
    const way = []; let search = 0;
    items.forEach(it => { const x = shelfX[it.si] + (R() < .5 ? -1.3 : 1.3);
      if (R() > state.disc / 100 * .9 + .1){ const wx = shelfX[Math.floor(R() * 5)] + 1.3; way.push(new THREE.Vector3(wx, 0, 3.8), new THREE.Vector3(wx, 0, -9)); search++; }
      way.push(new THREE.Vector3(x, 0, 3.8), new THREE.Vector3(x, 0, it.z)); way.push({ pick:it }); way.push(new THREE.Vector3(x, 0, 3.8)); });
    shoppers.push({ g, dot, way, i:0, st:'walk', t0:spawnT, born:clock, miss:0, search, wait:0 });
  }
  let clock = 0;
  S.onTick((dt, t) => {
    const sp = reduce ? 0 : 1; clock += dt * sp;
    spawnT -= dt * sp; if (spawnT <= 0 && shoppers.length < 40){ spawn(); spawnT = .9 + R() * .5; }
    for (let k = shoppers.length - 1; k >= 0; k--){ const s = shoppers[k];
      if (s.st === 'walk'){ const w = s.way[s.i];
        if (!w){ const open = lanes.filter(l => l.open); const lane = open.reduce((a, b) => (b.q.length + (b.busy ? 1 : 0)) < (a.q.length + (a.busy ? 1 : 0)) ? b : a); lane.q.push(s); s.lane = lane; s.st = 'queue'; s.qt = clock; continue; }
        if (w.pick){ if (!w.pick.b.visible){ s.miss++; s.dot.material.emissive.setHex(0xF87171); } else s.dot.material.emissive.setHex(0x10B981); s.i++; continue; }
        const d = w.clone().sub(s.g.position); const L = d.length(); if (L < .2){ s.i++; continue; } d.normalize(); s.g.position.addScaledVector(d, Math.min(L, 7.5 * dt * sp)); s.g.rotation.y = Math.atan2(-d.z, d.x); }
      else if (s.st === 'queue'){ const qi = s.lane.q.indexOf(s); const tgt = s.lane.g.position.clone().add(new THREE.Vector3(0, 0, -1.6 - qi * 1.1)); s.g.position.lerp(tgt, .12); s.dot.material.emissive.setHex(0xF59E0B);
        if (qi === 0 && !s.lane.busy){ s.lane.q.shift(); s.lane.busy = s; s.st = 'pay'; s.pt = 2.2 - state.chk / 100 * 1.4; s.wait = clock - s.qt; } }
      else if (s.st === 'pay'){ s.pt -= dt * sp; s.g.position.lerp(s.lane.g.position.clone().add(new THREE.Vector3(.9, 0, 0)), .15); if (s.pt <= 0){ s.lane.busy = null; s.st = 'exit'; } }
      else if (s.st === 'exit'){ const d = exitP.clone().sub(s.g.position); if (d.length() < .4){ const sat = Math.max(0, Math.min(10, 9.6 - s.miss * 2.2 - s.wait * .45 - s.search * .7)); done.push({ sat, miss:s.miss, wait:s.wait, time:clock - s.born, at:clock }); scene.remove(s.g); shoppers.splice(k, 1); continue; } d.normalize(); s.g.position.addScaledVector(d, 5 * dt * sp); }
      s.dot.position.y = 1.5 + Math.sin(t * 4 + k) * .06; }
    statT -= dt; if (statT <= 0){ statT = .5; const w = done.slice(-25); const avg = f => w.length ? w.reduce((a, b) => a + f(b), 0) / w.length : 0;
      onStats({ sat:avg(x => x.sat), found:w.length ? 1 - avg(x => x.miss) / 3 : 0, wait:avg(x => x.wait), time:avg(x => x.time), n:w.length }); }
  });
  return { set(s){ Object.assign(state, s); refreshShelves(); done.length = 0; }, dispose:S.dispose };
}

window.SCENES = { evNetwork, ghn, uplive, crew, retail };
})();
