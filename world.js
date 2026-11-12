(function(){
const APP = window.APP, S = window.SITE;
const uni = document.getElementById('universe'), canvas = document.getElementById('world');
const labelsEl = document.getElementById('labels'), panel = document.getElementById('panel');
const listwrap = document.getElementById('listwrap'), listview = document.getElementById('listview'), listBtn = document.getElementById('listToggle');
const hint = document.getElementById('uhint');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip = s => String(s).replace(/\[TBD[^\]]*\]/g, '').replace(/\s+/g,' ').trim();

/* ---------- 2D list view (always available) ---------- */
const all = [...APP.islands, APP.center];
listview.innerHTML = all.map(i => `<button class="icard" type="button" data-id="${i.id}" style="--acc:${i.acc}"><em>${esc(i.sub)}</em><b>${esc(i.name)}</b><span>${i.id === 'leadership' ? 'How I think about strategy, growth, AI and teams' : esc(APP.caseById(i.id).title)}</span></button>`).join('');
listview.addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (!b) return; location.hash = b.dataset.id === 'leadership' ? 'thinking' : 'case-' + b.dataset.id; });
function setList(on){ listwrap.hidden = !on; listBtn.setAttribute('aria-pressed', on); listBtn.textContent = on ? 'Hide list' : 'List view'; }
listBtn.addEventListener('click', () => setList(listwrap.hidden));

/* ---------- WebGL check ---------- */
let gl = null; try { gl = window.THREE && (canvas.getContext('webgl2') || canvas.getContext('webgl')); } catch(e){}
if (!gl){ canvas.hidden = true; hint.hidden = true; listBtn.hidden = true; setList(true); return; }
const THREE = window.THREE;

/* ---------- Renderer / scene ---------- */
const mobile = matchMedia('(max-width: 720px)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
renderer.shadowMap.enabled = !mobile; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0B1020, 45, 110);
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 300);

scene.add(new THREE.HemisphereLight(0xB8D4FF, 0x0B1020, 0.6));
const sun = new THREE.DirectionalLight(0xFFF1DC, 1.15); sun.position.set(18, 30, 14);
sun.castShadow = !mobile; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left:-34, right:34, top:34, bottom:-34, near:1, far:90 });
scene.add(sun);
const rim = new THREE.DirectionalLight(0x8B5CF6, 0.5); rim.position.set(-20, 10, -20); scene.add(rim);

const M = (c, o={}) => new THREE.MeshStandardMaterial(Object.assign({ color:c, flatShading:true, roughness:.75, metalness:.05 }, o));
const E = (c, i=1) => new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:i, flatShading:true, roughness:.4 });
function mesh(geo, mat, x=0, y=0, z=0, cast=true){ const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; return m; }
const box = (w, h, d, mat, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y + h/2, z);
const updaters = [];

/* ---------- Water ---------- */
const wgeo = new THREE.PlaneGeometry(240, 240, 90, 90); wgeo.rotateX(-Math.PI/2);
const water = mesh(wgeo, new THREE.MeshStandardMaterial({ color:0x0F1F48, roughness:.3, metalness:.35, flatShading:true, transparent:true, opacity:.92 }), 0, -2.2, 0, false);
scene.add(water);
const wpos = wgeo.attributes.position, wbase = Float32Array.from(wpos.array);
updaters.push(t => { if (reduce) return; for (let i = 0; i < wpos.count; i++){ const x = wbase[i*3], z = wbase[i*3+2]; wpos.array[i*3+1] = Math.sin(x*.18 + t*.8) * .18 + Math.cos(z*.22 + t*.6) * .14; } wpos.needsUpdate = true; });

/* ---------- Island base ---------- */
function islandBase(R, topColor, acc){
  const g = new THREE.Group();
  const top = mesh(new THREE.CylinderGeometry(R, R*.92, .9, 9), M(topColor), 0, 0, 0, false); g.add(top);
  const rim = mesh(new THREE.CylinderGeometry(R*1.02, R*1.02, .14, 9), E(acc, .35), 0, .3, 0, false); g.add(rim);
  const rock = mesh(new THREE.ConeGeometry(R*.92, R*1.35, 9), M(0x1B2645), 0, -.45 - R*.675, 0, false); rock.rotation.y = .3; g.add(rock);
  const rock2 = mesh(new THREE.ConeGeometry(R*.5, R*.9, 7), M(0x223056), R*.35, -.45 - R*.45, -R*.2, false); g.add(rock2);
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(R*1.05, R*1.05, 6, 12), new THREE.MeshBasicMaterial({ visible:false })); hit.position.y = 1.5; g.add(hit);
  const glow = new THREE.Mesh(new THREE.RingGeometry(R*1.1, R*1.35, 48), new THREE.MeshBasicMaterial({ color:acc, transparent:true, opacity:0, side:THREE.DoubleSide, depthWrite:false }));
  glow.rotation.x = -Math.PI/2; glow.position.y = -1.9; g.add(glow);
  return { g, hit, rim, glow };
}
const Y = .45; // top surface

/* ---------- Kit builders ---------- */
function car(color){ const c = new THREE.Group(); c.add(box(.7, .28, .38, M(color, { metalness:.4, roughness:.35 }), 0, 0, 0)); c.add(box(.38, .2, .34, M(0x9FB4D8, { metalness:.6, roughness:.2 }), -.04, .28, 0)); return c; }
function looper(obj, r, speed, phase, y, faceOut){ updaters.push(t => { const a = (reduce ? 0 : t) * speed + phase; obj.position.set(Math.cos(a)*r, y, Math.sin(a)*r); obj.rotation.y = -a + (faceOut ? Math.PI/2 : -Math.PI/2) * Math.sign(speed); }); }

const kinds = {
  ev(top, acc, acc2){
    const twr = M(0x2A3A63), win = E(0x7DD3FC, .5);
    [[-2.2,-1.6,1.1,3.2],[-1.0,-2.5,1.0,2.2],[2.3,-1.5,1.2,2.6],[1.0,-2.6,.9,1.6],[-2.6,1.2,1.0,1.4]].forEach(([x,z,w,h]) => { top.add(box(w, h, w, twr, x, Y, z)); top.add(box(w*1.02, .08, w*1.02, win, x, Y + h*.7, z)); });
    top.add(box(3.6, .06, 2.0, M(0x121A30), .4, Y, 1.3));
    for (let i = 0; i < 4; i++){ const x = -.8 + i*.8, p = box(.16, .7, .16, M(0xE2E8F0), x, Y, .5); top.add(p);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.22, .04, 6, 20), E(acc, 1.2)); ring.rotation.x = Math.PI/2; ring.position.set(x, Y + .08, .5); top.add(ring);
      updaters.push(t => { ring.material.emissiveIntensity = .6 + Math.sin(t*3 + i) * .6; }); }
    [0x10B981, 0xE2E8F0, 0x38BDF8].forEach((c, i) => { const k = car(c); top.add(k); looper(k, 3.3, .35, i*2.1, Y, false); });
    const line = new THREE.Mesh(new THREE.TorusGeometry(3.3, .03, 4, 64), E(acc2, .6)); line.rotation.x = Math.PI/2; line.position.y = Y + .02; top.add(line);
  },
  grid(top, acc, acc2){
    top.add(box(8.6, .05, 1.1, M(0x121A30), 0, Y, .6));
    for (let i = -3; i <= 3; i++) top.add(box(.5, .02, .08, E(0xF8FAFC, .4), i*1.2, Y + .05, .6));
    const canopy = new THREE.Group(); canopy.position.set(-1, Y, -1.6);
    canopy.add(box(3.4, .14, 1.8, M(0xE2E8F0), 0, 1.2, 0)); canopy.add(box(3.2, .04, 1.6, E(acc, .8), 0, 1.18, 0));
    [[-1.5,-.8],[1.5,-.8],[-1.5,.8],[1.5,.8]].forEach(([x,z]) => canopy.add(box(.1, 1.2, .1, M(0x94A3B8), x, 0, z)));
    for (let i = 0; i < 4; i++) canopy.add(box(.18, .6, .18, M(0x1F2937), -1.2 + i*.8, 0, 0));
    top.add(canopy);
    const twr = mesh(new THREE.CylinderGeometry(.35, .5, 3.2, 8), M(0x2A3A63), 2.6, Y + 1.6, -1.6); top.add(twr);
    const beacon = mesh(new THREE.SphereGeometry(.22, 10, 8), E(acc2, 1.5), 2.6, Y + 3.4, -1.6); top.add(beacon);
    updaters.push(t => { beacon.material.emissiveIntensity = 1 + Math.sin(t*4) * .8; });
    [0x34D399, 0xF8FAFC, 0x38BDF8, 0xA78BFA].forEach((c, i) => { const k = car(c); top.add(k); updaters.push(t => { const s = ((reduce ? .2*i : t*.12 + i*.25) % 1); const dir = i % 2 ? 1 : -1; k.position.set((s*8.6 - 4.3) * dir, Y + .05, .6 + (i % 2 ? .25 : -.25)); k.rotation.y = dir > 0 ? 0 : Math.PI; }); });
  },
  live(top, acc, acc2){
    top.add(box(3.4, .4, 1.8, M(0x2A2350), 0, Y, -1.4));
    const scr = mesh(new THREE.PlaneGeometry(3, 1.6), E(acc, .9), 0, Y + 1.4, -2.25); top.add(scr);
    updaters.push(t => { scr.material.emissive.setHSL((.9 + Math.sin(t*.5)*.05) % 1, .8, .45); });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++){ const a = mesh(new THREE.CylinderGeometry(.12, .14, .4, 6), M([0xF472B6,0xA78BFA,0xE2E8F0][(r+c)%3]), -1.5 + c*.6, Y + .2, .4 + r*.6); top.add(a); }
    [[2.7,1.4,0xF59E0B],[3.2,1.0,0xCBD5E1],[2.2,.7,0xFB923C]].forEach(([x,h,c]) => top.add(box(.4, h, .4, E(c, .25), x, Y, 1.2)));
    const studio = box(1.2, 1.1, 1.2, M(0x3B2A63), -2.7, Y, 1.0); top.add(studio);
    for (let i = 0; i < 10; i++){ const h = mesh(new THREE.OctahedronGeometry(.13), E(i % 2 ? acc : acc2, 1), 0, 0, 0, false); top.add(h);
      const x = (Math.random() - .5) * 3, z = .4 + Math.random() * 1.4, ph = Math.random() * 4;
      updaters.push(t => { const s = reduce ? .5 : ((t*.35 + ph) % 4) / 4; h.position.set(x + Math.sin(t + ph)*.2, Y + .6 + s*3, z); h.scale.setScalar(1 - s*.6); h.rotation.y = t*2; }); }
  },
  s5(top, acc, acc2){
    // AI agent crew: Nami (alarm tower), Zoro (data + research tower), Luffy (gate), and the human decision desk
    const C = { nami:0xF472B6, zoro:0x10B981, luffy:0xF59E0B, human:0x38BDF8 };
    const stations = { nami:new THREE.Vector3(-2.6, 0, -1.4), zoro:new THREE.Vector3(.2, 0, -2.4), luffy:new THREE.Vector3(2.4, 0, -.2), human:new THREE.Vector3(.4, 0, 2.4) };
    // Nami: slim tower with pulsing beacon
    top.add(mesh(new THREE.CylinderGeometry(.25, .35, 2.6, 8), M(0x2A2350), stations.nami.x, Y + 1.3, stations.nami.z));
    const beacon = mesh(new THREE.SphereGeometry(.3, 12, 8), E(C.nami, 1.2), stations.nami.x, Y + 2.8, stations.nami.z); top.add(beacon);
    const pulse = new THREE.Mesh(new THREE.TorusGeometry(.5, .03, 6, 32), E(C.nami, 1)); pulse.rotation.x = Math.PI/2; pulse.position.set(stations.nami.x, Y + 2.8, stations.nami.z); top.add(pulse);
    updaters.push(t => { const s = reduce ? .5 : (t*.6) % 1; pulse.scale.setScalar(1 + s*2.2); pulse.material.opacity = 1 - s; pulse.material.transparent = true; beacon.material.emissiveIntensity = .8 + Math.sin(t*3)*.5; });
    // Zoro: data tower with spinning rings + small research dish
    top.add(mesh(new THREE.CylinderGeometry(.3, .45, 3.0, 8), M(0x1F3A3A), stations.zoro.x, Y + 1.5, stations.zoro.z));
    for (let i = 0; i < 3; i++){ const r = new THREE.Mesh(new THREE.TorusGeometry(.6, .04, 6, 24), E(C.zoro, .9)); r.rotation.x = Math.PI/2; r.position.set(stations.zoro.x, Y + .9 + i*.8, stations.zoro.z); top.add(r); updaters.push(t => { r.rotation.z = t*(.5 + i*.3); r.rotation.x = Math.PI/2 + Math.sin(t*.7 + i)*.2; }); }
    const dish = mesh(new THREE.SphereGeometry(.45, 12, 6, 0, Math.PI*2, 0, Math.PI/2.4), M(0xCBD5E1), stations.zoro.x + 1.3, Y + .7, stations.zoro.z + .3); dish.rotation.x = -.8; top.add(dish);
    top.add(box(.12, .6, .12, M(0x94A3B8), stations.zoro.x + 1.3, Y, stations.zoro.z + .3));
    updaters.push(t => { dish.rotation.z = Math.sin(t*.5)*.6; });
    // Luffy: gate arch with gold lintel; packets pass through it
    const gate = new THREE.Group(); gate.position.set(stations.luffy.x, Y, stations.luffy.z); gate.rotation.y = -.6;
    gate.add(box(.26, 1.8, .26, M(0xE2E8F0), -.7, 0, 0)); gate.add(box(.26, 1.8, .26, M(0xE2E8F0), .7, 0, 0)); gate.add(box(1.8, .26, .34, E(C.luffy, 1), 0, 1.8, 0));
    top.add(gate);
    // Human decision desk
    top.add(box(1.4, .5, .8, M(0x22315A), stations.human.x, Y, stations.human.z)); top.add(box(1.0, .5, .06, E(C.human, .7), stations.human.x, Y + .55, stations.human.z - .3));
    // Agent figures hovering at their stations
    [['nami', 3.4], ['zoro', 3.6], ['luffy', 2.6], ['human', 1.4]].forEach(([k, h], i) => {
      const fig = mesh(k === 'human' ? new THREE.CapsuleGeometry(.14, .3, 3, 8) : new THREE.OctahedronGeometry(.28), k === 'human' ? M(0xF8FAFC) : E(C[k], 1), stations[k].x + (k === 'luffy' ? 0 : .0), Y + h, stations[k].z, false);
      if (k === 'human'){ fig.position.x += .9; fig.position.y = Y + .35; }
      top.add(fig); if (k !== 'human') updaters.push(t => { fig.rotation.y = t*1.2 + i; fig.position.y = Y + h + Math.sin(t*2 + i)*.12; });
    });
    // Work packets: Nami → Zoro → Luffy (gate) → human desk
    const route = new THREE.CatmullRomCurve3([stations.nami, stations.zoro, stations.luffy, stations.human].map(v => v.clone().setY(Y + 1.1)));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(route.getPoints(60)), new THREE.LineDashedMaterial({ color:0xF8FAFC, dashSize:.2, gapSize:.15, transparent:true, opacity:.35 })); line.computeLineDistances(); top.add(line);
    for (let i = 0; i < 6; i++){ const p = mesh(new THREE.BoxGeometry(.18, .18, .18), E(0xF8FAFC, 1.2), 0, 0, 0, false); top.add(p);
      updaters.push(t => { const s = reduce ? i/6 : ((t*.08 + i/6) % 1 + 1) % 1; p.position.copy(route.getPointAt(s)); p.position.y += Math.sin(s*Math.PI*6)*.15; p.rotation.y = t*2;
        p.material.emissive.setHex(s < .33 ? C.nami : s < .66 ? C.zoro : C.luffy); }); }
  },
  logi(top, acc, acc2){
    [[-1.6,-1.6,3.0],[1.6,-1.8,2.4]].forEach(([x,z,w]) => { top.add(box(w, 1.0, 1.4, M(0x3A3F55), x, Y, z)); const roof = mesh(new THREE.CylinderGeometry(.72, .72, w, 3), M(0xFB923C), x, Y + 1.0, z); roof.rotation.z = Math.PI/2; roof.rotation.x = Math.PI/6; roof.scale.set(1, 1, .5); top.add(roof); });
    top.add(box(4.6, .1, .3, M(0x1F2937), 0, Y, -.4));
    for (let i = 0; i < 8; i++){ const p = box(.22, .22, .22, M(0xD6A36A), 0, Y + .1, -.4); top.add(p); updaters.push(t => { p.position.x = (((reduce ? i*.12 : t*.25 + i/8) % 1) * 4.6) - 2.3; }); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, .25, 4, 48), M(0x121A30)); ring.rotation.x = Math.PI/2; ring.position.y = Y; ring.scale.set(1,1,.2); top.add(ring);
    [0xFB923C, 0x38BDF8, 0xF8FAFC].forEach((c, i) => { const tr = new THREE.Group(); tr.add(box(.9, .5, .45, M(c), -.1, .02, 0)); tr.add(box(.35, .35, .45, M(0x1F2937), .5, .02, 0)); top.add(tr); looper(tr, 3.2, .28, i*2.1, Y, false); });
    for (let i = 0; i < 3; i++){ const b = box(.35, .25, .14, E(acc2, .4), 0, 0, 0); top.add(b); looper(b, 2.4, -.6, i*2.1, Y + .05, false); }
    [[2.6,1.6],[-2.6,1.6],[0,2.4]].forEach(([x,z]) => top.add(box(.7, .9, .7, M(0x2A3A63), x, Y, z)));
  },
  retail(top, acc, acc2){
    top.add(box(4.2, 1.5, 2.4, M(0x22315A), 0, Y, -1.2));
    top.add(box(4.0, .9, .06, E(acc, .5), 0, Y + .3, 0.01));
    top.add(box(4.3, .14, 2.5, M(0xE2E8F0), 0, Y + 1.5, -1.2));
    top.add(box(1.6, .3, .3, E(acc2, .9), 0, Y + 1.7, -.05));
    for (let i = 0; i < 4; i++) top.add(box(.18, .6, 1.6, M([0x10B981,0xF59E0B,0x38BDF8,0xF472B6][i]), -1.5 + i, Y, 1.6));
    top.add(box(1.0, 1.0, .5, M(0x0EA5E9), 2.6, Y, 1.6));
    for (let i = 0; i < 4; i++){ const cart = box(.3, .22, .22, M(0xCBD5E1), 0, 0, 0); top.add(cart); looper(cart, 2.9, .3, i*1.6, Y + .02, false); }
  },
  ai(top, acc, acc2){
    const dome = mesh(new THREE.SphereGeometry(1.4, 16, 10, 0, Math.PI*2, 0, Math.PI/2), new THREE.MeshStandardMaterial({ color:0x22D3EE, emissive:0x0E7490, emissiveIntensity:.6, transparent:true, opacity:.55, flatShading:true, roughness:.2 }), 0, Y, 0); top.add(dome);
    const core = mesh(new THREE.IcosahedronGeometry(.45), E(acc2, 1.2), 0, Y + .7, 0); top.add(core);
    updaters.push(t => { core.rotation.y = t*.8; core.rotation.x = t*.4; core.position.y = Y + .7 + Math.sin(t*1.5)*.1; });
    const pads = [];
    for (let i = 0; i < 6; i++){ const a = i/6 * Math.PI*2, x = Math.cos(a)*2.7, z = Math.sin(a)*2.7;
      top.add(mesh(new THREE.CylinderGeometry(.42, .5, .35, 8), M(0x2A3A63), x, Y + .17, z));
      const ag = mesh(new THREE.OctahedronGeometry(.26), E(i % 2 ? acc : acc2, 1), x, Y + .8, z); top.add(ag); pads.push(new THREE.Vector3(x, Y + .8, z));
      updaters.push(t => { ag.rotation.y = t*1.2 + i; ag.position.y = Y + .8 + Math.sin(t*2 + i)*.12; }); }
    for (let i = 0; i < 8; i++){ const p = mesh(new THREE.SphereGeometry(.07, 6, 4), E(0xF8FAFC, 1.4), 0, 0, 0, false); top.add(p);
      updaters.push(t => { const s = reduce ? .5 : (t*.5 + i*.37) % 1, k = (Math.floor(t*.5 + i*.37) + i) % 6; const a = pads[k], b = pads[(k + 1 + i % 3) % 6]; p.position.lerpVectors(a, b, s); p.position.y += Math.sin(s*Math.PI) * .8; }); }
  },
  center(top){
    const stone = M(0x94A3B8), dark = M(0x475569);
    const m1 = mesh(new THREE.ConeGeometry(.9, 2.2, 4), M(0x38BDF8, { roughness:.5 }), -1.8, Y + 1.1, -1.4); m1.rotation.y = Math.PI/4; top.add(m1);
    [.8, 1.4, 2.1].forEach((h, i) => top.add(box(.4, h, .4, E(0xF59E0B, .2 + i*.15), 1.2 + i*.5, Y, -1.6)));
    const ai = mesh(new THREE.IcosahedronGeometry(.6), E(0x22D3EE, .8), -1.6, Y + 1.7, 1.6); top.add(ai); top.add(box(.5, .9, .5, dark, -1.6, Y, 1.6));
    updaters.push(t => { ai.rotation.y = t*.5; ai.position.y = Y + 1.7 + Math.sin(t*1.2)*.12; });
    for (let i = 0; i < 4; i++){ const a = i/4*Math.PI*2; top.add(box(.28, 1.1, .28, M(0x10B981), 1.8 + Math.cos(a)*.6, Y, 1.6 + Math.sin(a)*.6)); }
    top.add(box(1.6, .12, 1.6, stone, 1.8, Y, 1.6));
    const obel = box(.5, 3.2, .5, stone, 0, Y, 0); top.add(obel); top.add(mesh(new THREE.ConeGeometry(.36, .5, 4), E(0xF8FAFC, .6), 0, Y + 3.45, 0));
  }
};

/* ---------- Build islands ---------- */
const islands = [];
const ringR = 17;
APP.islands.forEach((d, i) => {
  const a = -Math.PI/2 + i / APP.islands.length * Math.PI * 2 + .25;
  const R = d.kind === 's5' ? 4.8 : 4.1;
  const hsl = {}; new THREE.Color(d.acc).getHSL(hsl); const tint = new THREE.Color().setHSL(hsl.h, .3, .1);
  const b = islandBase(R, tint, d.acc);
  const top = new THREE.Group(); b.g.add(top);
  kinds[d.kind](top, d.acc, d.acc2);
  b.g.position.set(Math.cos(a)*ringR, 0, Math.sin(a)*ringR*.78);
  scene.add(b.g);
  islands.push({ d, ...b, R, base:b.g.position.clone(), ph:i*1.3 });
});
{ const d = APP.center, b = islandBase(5.2, new THREE.Color().setHSL(.62, .18, .12), 0xF8FAFC); const top = new THREE.Group(); b.g.add(top); kinds.center(top); scene.add(b.g);
  islands.push({ d, ...b, R:5.2, base:b.g.position.clone(), ph:0, center:true }); }

/* ---------- Data streams to centre + bridges ---------- */
const streams = [];
islands.filter(x => !x.center).forEach((isl, i) => {
  const a = isl.base.clone().setY(1.2), b = new THREE.Vector3(0, 1.2, 0), mid = a.clone().lerp(b, .5).setY(5);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)), new THREE.LineBasicMaterial({ color:isl.d.acc, transparent:true, opacity:.22 }));
  scene.add(line);
  const n = 5, g = new THREE.BufferGeometry(), arr = new Float32Array(n*3); g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color:isl.d.acc, size:.32, transparent:true, opacity:.95, depthWrite:false }));
  scene.add(pts); streams.push({ curve, arr, g, n, ph:i*.17 });
  const nx = islands[(i + 1) % APP.islands.length];
  const p1 = isl.base.clone().setY(.2), p2 = nx.base.clone().setY(.2), m2 = p1.clone().lerp(p2, .5).setY(-.6);
  const br = new THREE.QuadraticBezierCurve3(p1, m2, p2);
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(br.getPoints(30)), new THREE.LineDashedMaterial({ color:0x38BDF8, dashSize:.5, gapSize:.4, transparent:true, opacity:.25 })).computeLineDistances());
});
updaters.push(t => streams.forEach(s => { for (let k = 0; k < s.n; k++){ const u = reduce ? k / s.n : (t*.12 + k/s.n + s.ph) % 1; const p = s.curve.getPoint(u); s.arr[k*3] = p.x; s.arr[k*3+1] = p.y; s.arr[k*3+2] = p.z; } s.g.attributes.position.needsUpdate = true; }));

/* stars */
{ const g = new THREE.BufferGeometry(), a = new Float32Array(900); for (let i = 0; i < 300; i++){ a[i*3] = (Math.random()-.5)*200; a[i*3+1] = 20 + Math.random()*60; a[i*3+2] = -40 - Math.random()*80; } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color:0x5B6B93, size:.35 }))); }

/* ---------- Labels ---------- */
islands.forEach(isl => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'ilabel'; b.style.setProperty('--acc', isl.d.acc);
  b.innerHTML = `<small>${esc(isl.d.sub)}</small>${esc(isl.d.name)}`;
  b.setAttribute('aria-label', `${isl.d.name}: ${isl.d.sub}. Open details`);
  b.addEventListener('click', () => select(isl));
  b.addEventListener('pointerenter', () => hovered = isl); b.addEventListener('pointerleave', () => hovered = null);
  b.addEventListener('focus', () => hovered = isl); b.addEventListener('blur', () => hovered = null);
  labelsEl.appendChild(b); isl.label = b;
});

/* ---------- Camera ---------- */
const home = { theta:.0, phi:mobile ? .8 : .68, r:mobile ? 88 : 62, target:new THREE.Vector3(mobile ? 0 : -15, mobile ? 12 : -1, 2) };
let theta = home.theta, phi = home.phi, radius = home.r; const target = home.target.clone();
let wTheta = theta, wPhi = phi, wR = radius; const wTarget = target.clone();
let selected = null, hovered = null, idle = 0;
function resize(){ const w = uni.clientWidth, h = uni.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

/* ---------- Input ---------- */
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(9, 9);
let down = null, dragged = false;
canvas.addEventListener('pointerdown', e => { down = { x:e.clientX, y:e.clientY, th:wTheta, ph:wPhi }; dragged = false; });
addEventListener('pointerup', () => down = null);
canvas.addEventListener('pointercancel', () => down = null);
canvas.addEventListener('pointermove', e => {
  const r = canvas.getBoundingClientRect(); mouse.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  if (down){ const dx = e.clientX - down.x, dy = e.clientY - down.y; if (Math.abs(dx) + Math.abs(dy) > 4) dragged = true;
    wTheta = down.th - dx * .006; wPhi = Math.max(.35, Math.min(1.25, down.ph - dy * .004)); idle = 0; hint.style.opacity = 0; }
});
canvas.addEventListener('pointerleave', () => mouse.set(9, 9));
canvas.addEventListener('click', () => { if (dragged) return; ray.setFromCamera(mouse, camera); const h = ray.intersectObjects(islands.map(i => i.hit))[0]; if (h) select(islands.find(i => i.hit === h.object)); });
addEventListener('keydown', e => { if (e.key === 'Escape' && selected) deselect(); });

/* ---------- Selection + panel ---------- */
function select(isl){
  selected = isl; idle = 0; hint.style.opacity = 0;
  const camRight = new THREE.Vector3(Math.cos(wTheta), 0, -Math.sin(wTheta));
  wTarget.copy(isl.base).setY(1).add(camRight.multiplyScalar(mobile ? 0 : -4)); if (mobile) wTarget.y += 9;
  wR = mobile ? 56 : 32; wPhi = .6;
  const d = isl.d;
  if (isl.center){
    panel.innerHTML = `<button class="x" type="button" aria-label="Close">×</button><span class="eyebrow">Centre island</span><h3>${esc(d.name)}</h3>
      <p class="muted" style="font-size:14px">Four monuments for what carries across every industry.</p>
      <dl class="meta">${S.monuments.map(m => `<dt style="color:${m.c}">●</dt><dd>${esc(m.t)}</dd>`).join('')}</dl>
      <div class="acts"><a class="btn primary sm" href="#thinking">See how I think</a><button class="btn sm" type="button" data-back>Back to universe</button></div>`;
  } else {
    const c = APP.caseById(d.id), m = c.outcome.map(APP.metricById).filter(APP.visibleMetric)[0];
    panel.innerHTML = `<button class="x" type="button" aria-label="Close">×</button><span class="eyebrow" style="color:${d.acc}">${esc(d.sub)}</span><h3>${esc(d.name)}</h3>
      <p style="font-size:15px">${esc(c.title)}</p>
      <dl class="meta"><dt>Role</dt><dd>${esc(strip(c.role) || 'To be confirmed')}</dd>${strip(c.markets) && c.markets !== '—' ? `<dt>Markets</dt><dd>${esc(c.markets)}</dd>` : ''}${m ? `<dt>${m.type === 'target' ? 'Target' : 'Reported'}</dt><dd><b>${esc(m.display)}</b> ${esc(m.label.toLowerCase())}</dd>` : ''}</dl>
      <div class="acts"><a class="btn primary sm" href="#case-${d.id}">Read case</a><a class="btn sm" href="#sim-${d.sim}">Try simulation</a><button class="btn sm" type="button" data-back>Back</button></div>`;
  }
  panel.hidden = false;
  panel.querySelector('.x').onclick = deselect; panel.querySelector('[data-back]').onclick = deselect;
  if (reduce) snap();
}
function deselect(){ selected = null; panel.hidden = true; wTarget.copy(home.target); wR = home.r; wPhi = home.phi; if (reduce) snap(); }
function snap(){ theta = wTheta; phi = wPhi; radius = wR; target.copy(wTarget); }

/* ---------- Loop ---------- */
let visible = true, last = performance.now(), t = 0, running = false;
function kick(){ if (!running && visible && !document.hidden){ running = true; last = performance.now(); requestAnimationFrame(frame); } }
new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); }, { threshold:0 }).observe(uni);
document.addEventListener('visibilitychange', kick);
const v3 = new THREE.Vector3();
function frame(now){
  if (!visible || document.hidden){ running = false; return; }
  const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now; t += dt; idle += dt;
  if (!selected && !down && idle > 2 && !reduce) wTheta += dt * .04;
  const k = reduce ? 1 : 1 - Math.pow(.02, dt);
  theta += (wTheta - theta) * k; phi += (wPhi - phi) * k; radius += (wR - radius) * k; target.lerp(wTarget, k);
  camera.position.set(target.x + radius*Math.cos(phi)*Math.sin(theta), target.y + radius*Math.sin(phi), target.z + radius*Math.cos(phi)*Math.cos(theta));
  camera.lookAt(target);
  scene.fog.near = radius * .75; scene.fog.far = radius * 1.9;
  ray.setFromCamera(mouse, camera); const h = ray.intersectObjects(islands.map(i => i.hit))[0];
  const hov = h ? islands.find(i => i.hit === h.object) : hovered;
  canvas.style.cursor = h ? 'pointer' : down ? 'grabbing' : 'grab';
  islands.forEach(isl => {
    const on = isl === hov || isl === selected, dim = selected && isl !== selected;
    const bob = reduce ? 0 : Math.sin(t * .8 + isl.ph) * .25;
    isl.g.position.y += ((on ? .7 : 0) + bob - isl.g.position.y) * Math.min(1, dt * 6);
    isl.glow.material.opacity += ((on ? .5 : 0) - isl.glow.material.opacity) * Math.min(1, dt * 6);
    isl.rim.material.emissiveIntensity = on ? 1.4 : .35;
    v3.copy(isl.g.position).setY(isl.g.position.y + (isl.center ? 5.4 : 4.4)).project(camera);
    const x = (v3.x + 1) / 2 * uni.clientWidth, y = (1 - v3.y) / 2 * uni.clientHeight;
    isl.label.style.left = x + 'px'; isl.label.style.top = y + 'px';
    isl.label.style.opacity = v3.z > 1 ? 0 : dim ? .35 : 1;
    isl.label.classList.toggle('on', on);
  });
  updaters.forEach(f => f(t));
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
kick();
})();
