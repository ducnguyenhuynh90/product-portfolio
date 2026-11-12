(function(){
const S = window.SITE;
const $ = (s, r=document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Render "[TBD...]" fragments as visible placeholders
const tx = s => esc(s).replace(/\[TBD[^\]]*\]/g, m => `<em class="tbd">${m}</em>`);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = {
  int: v => Math.round(v).toLocaleString('en-US'),
  pct: v => (v*100).toFixed(v < 0.1 ? 1 : 0) + '%',
  pct1: v => (v*100).toFixed(1) + '%',
  usd: v => (Math.abs(v) >= 1e6 ? '$' + (v/1e6).toFixed(2) + 'M' : Math.abs(v) >= 1e3 ? '$' + (v/1e3).toFixed(1) + 'k' : '$' + Math.round(v)).replace('$-','−$'),
  score: v => v.toFixed(1),
  min: v => Math.round(v) + ' min'
};
const caseById = id => S.cases.find(c => c.id === id);
const islandById = id => S.islands.find(i => i.id === id);
const metricById = id => S.metrics.find(m => m.id === id);
const visibleMetric = m => m && (m.publishApproved || !S.PUBLIC_MODE);
const typeChip = m => m.type === 'target' ? '<span class="chip target">Target</span>' : m.type === 'illustrative' ? '<span class="chip illus">Simulation</span>' : '<span class="chip reported">Reported</span>';
const pendChip = m => (!m.publishApproved && !S.PUBLIC_MODE) ? '<span class="chip pending" title="Not yet approved for public display">Pending</span>' : '';
const badge = '<span class="sim-badge">Simplified simulation · not company data</span>';

/* ---------- IMPACT STRIP ---------- */
function renderImpact(){
  const ms = S.heroMetrics.map(metricById).filter(visibleMetric);
  $('#impact').innerHTML = ms.map(m => `
    <div class="metric">
      <span class="v">${esc(m.display)}</span>
      <span class="l">${esc(m.label)}</span>
      <span class="c">${esc(m.company)}${m.period && !m.period.startsWith('[') ? ' · ' + esc(m.period) : ''}</span>
      <span class="chips">${typeChip(m)}${pendChip(m)}</span>
    </div>`).join('');
  $('#impactNote').textContent = S.PUBLIC_MODE ? 'Reported outcomes during David\'s tenure; not attributed to single features.'
    : 'Preview: these are self-reported figures awaiting definition and approval. Set PUBLIC_MODE to true to show only approved metrics.';
}

/* ---------- CASES ---------- */
function renderCaseList(){
  $('#caselist').innerHTML = S.cases.map(c => {
    const isl = islandById(c.id);
    return `<button class="ccard" type="button" data-case="${c.id}" style="--acc:${isl.acc}">
      <span class="ind">${esc(isl.sub)}</span><b>${esc(c.company)}</b><span>${esc(c.title)}</span></button>`;
  }).join('');
  $('#caselist').addEventListener('click', e => { const b = e.target.closest('[data-case]'); if (b) go('case-' + b.dataset.case); });
}

const lockSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';

const AGENTS = {
  nami:{ n:'Nami', r:'Reporter & alarm', c:'#F472B6', d:'Runs the daily and weekly reports and raises an alert when a metric breaks from its normal range.' },
  zoro:{ n:'Zoro', r:'Researcher & ticket writer', c:'#10B981', d:'Pulls product data, researches the market, runs simulations on the current product, then writes the hypothesis and the ticket.' },
  luffy:{ n:'Luffy', r:'Gatekeeper', c:'#F59E0B', d:'Reviews every ticket against a versioned rubric. Blocks weak framing, scores the rest, ranks the fixes. Never approves.' },
  human:{ n:'Product lead', r:'Decision', c:'#38BDF8', d:'A person makes every final call. Each decision becomes learning for the crew.' }
};
function crewExtra(){
  return `
  <div class="blk" style="max-width:none">
    <h4>The crew</h4>
    <div class="rooms">${Object.values(AGENTS).map(a => `<div class="room" style="border-color:${a.c}55"><small style="color:${a.c}">${esc(a.r)}</small><b>${esc(a.n)}</b><p>${esc(a.d)}</p></div>`).join('')}</div>
  </div>
  <div class="blk" style="max-width:none">
    <h4>How a problem moves through the crew</h4>
    <div class="flow">
      <div class="st" style="border-color:${AGENTS.nami.c}"><b>Nami notices</b>Daily report flags a metric outside its normal range</div>
      <div class="st" style="border-color:${AGENTS.zoro.c}"><b>Zoro investigates</b>Data, market research, simulation of the fix</div>
      <div class="st" style="border-color:${AGENTS.zoro.c}"><b>Zoro writes</b>Hypothesis and a ticket with evidence attached</div>
      <div class="st" style="border-color:${AGENTS.luffy.c}"><b>Luffy gates</b>Framing check, rubric score, ranked fixes</div>
      <div class="st" style="border-color:${AGENTS.human.c}"><b>A person decides</b>Approve, or send back with notes</div>
    </div>
    <p class="muted" style="font-size:14px">Ideas from people enter at Luffy's gate too. If the framing fails, the author gets three to five fixes and Zoro offers to pull the missing data.</p>
  </div>
  <div class="blk" style="max-width:none">
    <h4>Luffy's four locks</h4>
    <div class="locks">
      <div>${lockSvg}<span>Baseline metric and the query that produced it</span></div>
      <div>${lockSvg}<span>Root-cause hypothesis backed by data</span></div>
      <div>${lockSvg}<span>Two rejected alternatives and why they lost</span></div>
      <div>${lockSvg}<span>Success threshold defined before launch</span></div>
    </div>
  </div>`;
}

function renderReader(id){
  const c = caseById(id) || S.cases[0];
  const isl = islandById(c.id);
  document.querySelectorAll('.ccard').forEach(b => b.classList.toggle('on', b.dataset.case === c.id));
  const outs = c.outcome.map(metricById).filter(visibleMetric);
  const decs = c.decisions.length ? `<div class="decisions">${c.decisions.map(d => `
      <div class="dec"><b>${esc(d.t)}</b><dl>
        <dt>Options</dt><dd>${esc(d.opts)}</dd><dt>Choice</dt><dd>${esc(d.choice)}</dd>
        <dt>Why</dt><dd>${esc(d.why)}</dd><dt>Trade-off</dt><dd>${esc(d.trade)}</dd></dl></div>`).join('')}</div>`
    : `<p><em class="tbd">[TBD: 2–4 real decisions with options, choice, why and trade-off]</em></p>`;
  const sims = c.sims.map(s => { const d = SIMS[s]; return d ? `<a class="btn sm" href="#sim-${s}">${esc(d.title)}</a>` : ''; }).join('');
  const r = $('#reader');
  r.style.setProperty('--acc', isl.acc);
  r.innerHTML = `
    <div class="blk" style="max-width:none;gap:14px">
      <span class="eyebrow" style="color:${isl.acc}">Case ${c.num} · ${esc(c.company)}</span>
      <h3>${esc(c.title)}</h3>
      <dl class="snap">
        <div><dt>Industry</dt><dd>${tx(c.industry)}</dd></div>
        <div><dt>Role</dt><dd>${tx(c.role)}</dd></div>
        <div><dt>Period</dt><dd>${tx(c.period)}</dd></div>
        <div><dt>Markets</dt><dd>${tx(c.markets)}</dd></div>
        <div><dt>Team</dt><dd>${tx(c.team)}</dd></div>
      </dl>
    </div>
    <div class="blk"><h4>Context</h4><p>${tx(c.context)}</p></div>
    <div class="blk"><h4>Problem</h4><p>${tx(c.problem)}</p></div>
    <div class="blk"><h4>My role</h4><p>${tx(c.myrole)}</p></div>
    ${c.crew ? crewExtra() : ''}
    <div class="blk" style="max-width:none"><h4>Key decisions</h4>${decs}</div>
    <div class="blk" style="max-width:none"><h4>Outcome</h4>
      ${outs.length ? `<div class="snap">${outs.map(m => `<div><dt>${esc(m.label)}</dt><dd style="font-family:var(--display);font-weight:800;font-size:24px">${esc(m.display)}</dd><dd style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${typeChip(m)}${pendChip(m)}</dd></div>`).join('')}</div>` : ''}
      <p class="muted" style="font-size:14px">${tx(c.outcomeNote)}</p></div>
    <div class="blk"><h4>Try it</h4><div style="display:flex;gap:8px;flex-wrap:wrap">${sims}</div></div>
    <p class="lesson">“${esc(c.lesson)}”</p>`;
}

/* ---------- SIMULATIONS ---------- */
const SIMS = {};
const GROUPS = [
  ['S5 Tech · AI agent crew', ['crew','luffy','nami']],
  ['EV charging · VinFast, AmpUp', ['ev-network','ev','command','ev-demo','vf-demo']],
  ['Logistics · Giao Hàng Nhanh', ['ghn-scale','logistics','ghn-demo']],
  ['Live streaming · Uplive', ['uplive-lang','live','up-demo']],
  ['Growth lab', ['conversion','experiment','flaws']],
  ['Retail · Vinmart', ['retail']]
];

/* Generic slider sim */
function sliderSim(def){
  SIMS[def.id] = { title:def.title, island:def.island, render(stage){
    const v = {}; def.inputs.forEach(i => v[i[0]] = i[5]);
    stage.innerHTML = head(def) + `<div class="simgrid"><div class="controls">${def.inputs.map(i => ctl(def.id, i)).join('')}</div>
      <div style="display:flex;flex-direction:column;gap:12px;min-width:0"><div class="outs" id="outs"></div><div id="extra"></div></div></div>
      <details class="how"><summary>How this works</summary><pre>${esc(def.formulas)}</pre></details>
      ${def.lesson ? `<p class="lesson" style="font-size:18px">“${esc(def.lesson)}”</p>` : ''}`;
    const update = () => {
      const o = def.compute(v);
      $('#outs', stage).innerHTML = o.outs.map(x => `<div class="out${x.warn ? ' warn' : ''}"><span class="v">${x.f(x.v)}</span><span class="l">${esc(x.l)}</span>${x.max ? `<span class="bar"><i style="width:${Math.max(0, Math.min(100, x.v / x.max * 100))}%"></i></span>` : ''}</div>`).join('');
      $('#extra', stage).innerHTML = o.extra || '';
    };
    bindSliders(stage, def.id, def.inputs, v, update); update();
  }};
}
function head(def){
  return `<div class="stage-head"><div><span class="eyebrow" style="color:var(--acc)">${esc(def.eyebrow || islandById(def.island)?.name || '')}</span><h3>${esc(def.title)}</h3><p>${esc(def.intro)}</p></div>${def.noBadge ? '' : badge}</div>`;
}
function ctl(sid, i){
  const [k, l, min, max, step, val, f] = i;
  return `<div class="ctl"><label for="${sid}-${k}"><span>${esc(l)}</span><output id="${sid}-${k}-o">${(f || fmt.int)(val)}</output></label>
    <input type="range" id="${sid}-${k}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
}
function bindSliders(stage, sid, inputs, v, update){
  inputs.forEach(i => {
    const el = $('#' + CSS.escape(sid + '-' + i[0]), stage), out = $('#' + CSS.escape(sid + '-' + i[0] + '-o'), stage);
    el.addEventListener('input', () => { v[i[0]] = +el.value; out.textContent = (i[6] || fmt.int)(+el.value); update(); });
  });
}
const P = v => (v).toFixed(0) + '%';

sliderSim({ id:'ev', island:'ampup', title:'EV Charging Tycoon', intro:'You run a charging network. Grow it without breaking it.',
  inputs:[['stations','Charging stations',10,500,10,120],['drivers','Active drivers',1000,50000,500,12000],['apd','Charging attempts per driver / month',1,12,1,4],
    ['cs','Charging success rate',70,99,1,88,P],['ps','Payment success rate',80,99,1,94,P],['price','Avg revenue per session ($)',5,30,1,12,v => '$' + v],['auto','Support automation',0,80,5,20,P]],
  compute(v){
    const attempts = v.drivers * v.apd, cap = v.stations * 300;
    const served = Math.min(attempts, cap), completed = served * v.cs/100 * v.ps/100;
    const failed = served - completed, turnedAway = attempts - served;
    const revenue = completed * v.price, util = served / cap;
    const tickets = (failed + turnedAway * 0.3) * 0.25 * (1 - v.auto/100);
    const cost = v.stations * 400 + tickets * 6;
    const sat = Math.max(0, 100 * Math.pow(v.cs/100 * v.ps/100, 2) * (1 - Math.max(0, util - .85) * 2) * (1 - turnedAway / attempts * .8));
    return { outs:[
      { l:'Completed sessions / month', v:completed, f:fmt.int, max:attempts },
      { l:'Revenue / month', v:revenue, f:fmt.usd },
      { l:'Charger utilisation', v:util, f:fmt.pct, max:1, warn:util > .9 },
      { l:'Driver satisfaction index', v:sat, f:fmt.int, max:100, warn:sat < 50 },
      { l:'Support tickets / month', v:tickets, f:fmt.int, warn:tickets > 2000 },
      { l:'Operating contribution', v:revenue - cost, f:fmt.usd, warn:revenue - cost < 0 }
    ], extra: util > .9 ? '<div class="callout warn">Utilisation above 90%: drivers queue or get turned away. Add stations before buying more drivers.</div>' : ''};
  },
  formulas:`Attempts           = Drivers × Attempts per driver
Capacity           = Stations × 300 sessions / month
Completed sessions = min(Attempts, Capacity) × Charging success × Payment success
Revenue            = Completed sessions × Avg revenue per session
Utilisation        = Served attempts ÷ Capacity
Support tickets    = (Failed + 0.3 × Turned away) × 25% × (1 − Automation)
Operating contrib. = Revenue − $400 × Stations − $6 × Tickets
All constants are illustrative.`,
  lesson:'Growth is not simply acquiring more users. It is building a reliable system that repeatedly delivers value.' });

sliderSim({ id:'command', island:'vinfast', title:'Charging Network Command Center', intro:'You are the regional product director. Keep sessions flowing across markets.',
  inputs:[['chargers','Chargers in region',50,2000,50,600],['demand','Charging demand / day',1000,50000,500,8000],['uptime','Charger uptime',85,99.9,.1,96,v => v.toFixed(1)+'%'],
    ['start','Session start success',80,99.5,.5,92,v => v.toFixed(1)+'%'],['pay','Payment reliability',85,99.9,.1,97,v => v.toFixed(1)+'%'],['roam','Roaming availability',0,100,5,60,P],['resp','Support response time',1,120,1,30,fmt.min]],
  compute(v){
    const eff = v.demand * (0.75 + 0.25 * v.roam/100), cap = v.chargers * v.uptime/100 * 12;
    const att = Math.min(eff, cap), ok = att * v.start/100 * v.pay/100, fail = att - ok, unmet = v.demand - att;
    const util = att / (v.chargers * 12);
    const csat = Math.max(0, 100 * ok / v.demand - Math.min(25, v.resp / 5));
    const alerts = [];
    if (v.uptime < 95) alerts.push(['bad','Uptime below 95%: dispatch field technicians to top offline sites']);
    if (v.start < 90) alerts.push(['bad','Session start failures high: check charger firmware and backend handshake']);
    if (v.pay < 95) alerts.push(['warnc','Payment rejections rising: enable fallback method']);
    if (v.roam < 40) alerts.push(['warnc','Roaming coverage low: partner drivers are being turned away']);
    if (att >= cap - 1) alerts.push(['bad','Network at capacity: demand exceeds available chargers']);
    if (v.resp > 45) alerts.push(['warnc','Support response slow: stuck sessions drive complaints']);
    if (!alerts.length) alerts.push(['ok','All systems normal']);
    return { outs:[
      { l:'Successful sessions / day', v:ok, f:fmt.int, max:v.demand },
      { l:'Failed attempts / day', v:fail, f:fmt.int, warn:fail / Math.max(1, att) > .12 },
      { l:'Unmet demand / day', v:unmet, f:fmt.int, warn:unmet > v.demand * .1 },
      { l:'Station utilisation', v:util, f:fmt.pct, max:1 },
      { l:'Satisfaction index', v:csat, f:fmt.int, max:100, warn:csat < 60 }
    ], extra:`<div class="callout"><b>Operational alerts</b><ul style="margin:8px 0 0;padding-left:18px">${alerts.map(a => `<li class="${a[0]}">${a[1]}</li>`).join('')}</ul></div>` };
  },
  formulas:`Reachable demand  = Demand × (75% + 25% × Roaming availability)
Capacity          = Chargers × Uptime × 12 sessions / day
Attempts          = min(Reachable demand, Capacity)
Successful        = Attempts × Start success × Payment reliability
Satisfaction      = 100 × Successful ÷ Demand − min(25, Response time ÷ 5)
All constants are illustrative.`,
  lesson:'In infrastructure products, reliability is part of the core user experience.' });

sliderSim({ id:'live', island:'uplive', title:'Live Streaming Growth Lab', intro:'Grow viewers, payers and creators. Watch what too many notifications do.',
  inputs:[['users','New users / month',10000,500000,10000,100000],['fric','Onboarding friction',0,100,5,60,P],['rec','Recommendation quality',0,100,5,40,P],
    ['notif','Notifications per week',0,30,1,10],['inc','Creator incentives',0,100,5,40,P],['gift','Gift conversion (of retained)',0.5,10,.5,2,v => v.toFixed(1)+'%']],
  compute(v){
    const act = 0.25 + 0.55 * (1 - v.fric/100);
    const n = v.notif, nfx = 0.06 * (n/6) * Math.exp(1 - n/6) - 0.006 * Math.max(0, n - 8);
    const d7 = Math.max(0.005, (0.04 + 0.16 * v.rec/100 + 0.05 * v.inc/100) * (0.6 + act * 0.6) + nfx);
    const retained = v.users * act * d7, payers = retained * v.gift/100, rev = payers * 8;
    const mins = 8 + 30 * v.rec/100 + 10 * v.inc/100 - Math.max(0, n - 12) * .4;
    let curve = '<svg viewBox="0 0 300 90" width="100%" height="90" role="img" aria-label="Retention effect by notifications per week; peaks near six, falls after ten"><line x1="0" y1="60" x2="300" y2="60" stroke="var(--line)" stroke-width="1"/>';
    let d = ''; for (let i = 0; i <= 30; i++){ const e = 0.06*(i/6)*Math.exp(1-i/6) - 0.006*Math.max(0,i-8); d += (i ? 'L' : 'M') + (i*10) + ',' + (60 - e*700).toFixed(1); }
    curve += `<path d="${d}" fill="none" stroke="var(--pink)" stroke-width="2"/><circle cx="${n*10}" cy="${(60 - nfx*700).toFixed(1)}" r="5" fill="var(--pink)"/><text x="4" y="12" font-size="10" fill="var(--muted)">Retention effect of notifications</text><text x="250" y="84" font-size="10" fill="var(--muted)">30 / wk</text><text x="2" y="84" font-size="10" fill="var(--muted)">0</text></svg>`;
    return { outs:[
      { l:'Activated users', v:v.users * act, f:fmt.int, max:v.users },
      { l:'D7 retention', v:d7, f:fmt.pct1, max:.35 },
      { l:'Engagement min / day', v:mins, f:v => v.toFixed(0) + ' min', max:50 },
      { l:'Paying users', v:payers, f:fmt.int },
      { l:'Gift revenue / month', v:rev, f:fmt.usd },
      { l:'Creator earnings (50%)', v:rev/2, f:fmt.usd }
    ], extra:`<div class="callout">${curve}${n > 12 ? '<p class="bad" style="margin-top:6px">Past about ten a week, notifications cost retention.</p>' : ''}</div>` };
  },
  formulas:`Activation      = 25% + 55% × (1 − Onboarding friction)
Notification fx = 6% × (n/6) × e^(1 − n/6) − 0.6% × max(0, n − 8)
D7 retention    = (4% + 16% × Rec quality + 5% × Incentives) × (0.6 + 0.6 × Activation) + Notification fx
Paying users    = New users × Activation × D7 × Gift conversion
Gift revenue    = Paying users × $8 avg
All constants are illustrative.`,
  lesson:'Retention improves when users repeatedly experience meaningful value, not when a product sends more notifications.' });

sliderSim({ id:'logistics', island:'ghn', title:'Logistics Operations Tycoon', intro:'Orders flow through four stages. The slowest one sets the pace. Find it.',
  inputs:[['orders','Orders / day',5000,100000,1000,40000],['wh','Warehouse throughput / day',5000,100000,1000,45000],['sort','Sorting throughput / day',5000,100000,1000,36000],
    ['cour','Couriers',200,5000,50,1500],['dpc','Deliveries per courier / day',10,60,1,28],['route','Route efficiency',50,100,1,80,P],['disp','Dispatch reliability',70,100,1,90,P],['faild','Failed first attempts',1,20,1,8,P]],
  compute(v){
    const courierCap = v.cour * v.dpc * v.route/100;
    const stages = [['Warehouse', v.wh],['Sorting', v.sort],['Couriers', courierCap]];
    const b = stages.reduce((a, s) => s[1] < a[1] ? s : a);
    const done = Math.min(v.orders, b[1]), backlog = v.orders - done;
    const ontime = done / v.orders * v.disp/100 * (1 - v.faild/100 * .6);
    const util = Math.min(1, v.orders / courierCap);
    const cost = v.cour * 25 + v.orders * v.faild/100 * 1.5 + backlog * .8;
    return { outs:[
      { l:'On-time delivery', v:ontime, f:fmt.pct, max:1, warn:ontime < .8 },
      { l:'Late orders / day', v:v.orders * (1 - ontime), f:fmt.int },
      { l:'Backlog added / day', v:backlog, f:fmt.int, warn:backlog > 0 },
      { l:'Courier utilisation', v:util, f:fmt.pct, max:1 },
      { l:'Operating cost / day', v:cost, f:fmt.usd }
    ], extra:`<div class="callout ${backlog > 0 ? 'bad' : ''}"><b>Bottleneck: ${b[0]}</b> · capacity ${fmt.int(b[1])} / day vs ${fmt.int(v.orders)} orders.${backlog > 0 ? ' Raise this stage first; adding capacity anywhere else changes nothing.' : ' Every stage keeps up with demand.'}</div>` };
  },
  formulas:`Courier capacity = Couriers × Deliveries per courier × Route efficiency
Bottleneck       = min(Warehouse, Sorting, Courier capacity)
Delivered        = min(Orders, Bottleneck);  Backlog = Orders − Delivered
On-time          = Delivered ÷ Orders × Dispatch reliability × (1 − 0.6 × Failed first attempts)
All constants are illustrative.`,
  lesson:'Operational excellence comes from improving the system, not asking people to work harder.' });

sliderSim({ id:'retail', island:'vinmart', title:'Retail Experience Lab', intro:'Customer experience is a sum of small things. Move them and see the score.',
  inputs:[['disc','Product discovery',0,100,5,50,P],['chk','Checkout speed',0,100,5,40,P],['inv','Inventory availability',70,99,1,88,P],['sup','Customer support',0,100,5,45,P],['ful','Online order fulfilment on time',50,100,1,80,P],['loy','Loyalty experience',0,100,5,30,P]],
  compute(v){
    const n = k => v[k]/100;
    const sat = 2 + 8 * (0.18*n('disc') + 0.2*n('chk') + 0.22*(n('inv')-.7)/.29 + 0.14*n('sup') + 0.16*(n('ful')-.5)/.5 + 0.1*n('loy'));
    const comp = 0.55 + 0.4 * n('chk') * n('inv');
    const rep = 0.15 + 0.45 * (sat/10) * (0.6 + 0.4*n('loy'));
    const cmp = 40 * (1 - n('sup')*.7) * (1.4 - n('inv')) * (1.3 - n('ful'));
    const eff = 100 * (0.35*n('chk') + 0.35*(n('ful')-.5)/.5 + 0.3*(n('inv')-.7)/.29);
    return { outs:[
      { l:'Customer score (0–10)', v:sat, f:fmt.score, max:10 },
      { l:'Checkout completion', v:comp, f:fmt.pct, max:1 },
      { l:'Repeat purchase rate', v:rep, f:fmt.pct, max:1 },
      { l:'Complaints per 1,000 orders', v:cmp, f:v => v.toFixed(1), warn:cmp > 15 },
      { l:'Operational efficiency index', v:eff, f:fmt.int, max:100 }
    ]};
  },
  formulas:`Customer score = 2 + 8 × weighted mix (discovery 18%, checkout 20%, inventory 22%, support 14%, fulfilment 16%, loyalty 10%)
Checkout completion = 55% + 40% × Checkout speed × Inventory availability
Repeat purchase = 15% + 45% × Score/10 × (0.6 + 0.4 × Loyalty)
All weights are illustrative; the score is not NPS.`,
  lesson:'Customer experience is the cumulative result of many small operational and product decisions.' });

/* ---- Conversion Lab ---- */
const CONV = { reg:30, promo:55, intent:40, pay:70, d2:30, dep:15 };
SIMS.conversion = { title:'Conversion Lab', island:'s5', eyebrow:'Growth lab', render(stage){
  const def = { id:'conversion', island:'s5', eyebrow:'Growth lab', title:'Conversion Lab', intro:'10,000 simulated visitors walk a first-time journey. Change a step and every step after it moves. This is the kind of model Zoro runs before writing a ticket.' };
  const inputs = [['reg','Visitor → registration',10,60,1,CONV.reg,P],['promo','Registered players who see a promotion',20,90,1,CONV.promo,P],['intent','Registered → click deposit',10,80,1,CONV.intent,P],
    ['pay','Deposit click → completed (payment step)',40,95,1,CONV.pay,P],['d2','First depositors who return on day 2',10,60,1,CONV.d2,P],['dep','Assumed avg first deposit ($)',5,50,1,CONV.dep,v => '$' + v]];
  stage.innerHTML = head(def) + `<div class="simgrid"><div class="controls">${inputs.map(i => ctl('conversion', i)).join('')}</div><div style="display:flex;flex-direction:column;gap:14px;min-width:0"><div class="funnel" id="fun"></div><div class="outs" id="outs"></div></div></div>
    <details class="how"><summary>How this works</summary><pre>Registered      = 10,000 × Visitor → registration
Saw promotion   = Registered × Promotion discovery
Deposit clicks  = Registered × Click-deposit rate × (0.8 + 0.4 × Promotion discovery), capped at Registered
First deposits  = Deposit clicks × Payment completion
D2 depositors   = First deposits × Day-2 return
Deposit volume  = First deposits × Assumed avg first deposit   (illustrative)</pre></details>
    <p class="lesson" style="font-size:18px">“Optimising conversion requires understanding the entire system, not merely improving individual screens.”</p>`;
  const update = () => {
    const V = 10000, r = V * CONV.reg/100, p = r * CONV.promo/100;
    const c = Math.min(r, r * CONV.intent/100 * (0.8 + 0.4 * CONV.promo/100)), f = c * CONV.pay/100, d = f * CONV.d2/100;
    const rows = [['Visitors',V,0],['Registered',r,0],['Saw a promotion',p,0],['Clicked deposit',c,0],['First deposit',f,1],['D2 deposit',d,0]];
    $('#fun', stage).innerHTML = rows.map((x, i) => `<div class="frow"><span>${x[0]}${x[2] ? ' <span class="muted" style="font-size:11px">· payment</span>' : ''}</span><span class="track"><i class="${x[2] ? 'ho' : ''}" style="width:${x[1]/V*100}%"></i></span><span class="n">${fmt.int(x[1])}${i ? `<br><span class="muted" style="font-weight:400;font-size:11px">${fmt.pct(x[1]/rows[i === 3 ? 1 : i-1][1])}</span>` : ''}</span></div>`).join('');
    $('#outs', stage).innerHTML = [
      ['Register → click deposit', c/r, fmt.pct], ['Visitor → first deposit', f/V, fmt.pct1], ['Biggest drop', null], ['First-deposit volume', f * CONV.dep, fmt.usd]
    ].map(x => {
      if (x[1] === null){ const drops = rows.slice(1).map((y, i) => [y[0], rows[i === 2 ? 1 : i][1] - y[1]]); const m = drops.reduce((a, b) => b[1] > a[1] ? b : a); return `<div class="out"><span class="v" style="font-size:18px">${m[0]}</span><span class="l">Biggest loss: ${fmt.int(m[1])} people</span></div>`; }
      return `<div class="out"><span class="v">${x[2](x[1])}</span><span class="l">${x[0]}</span></div>`;
    }).join('');
  };
  bindSliders(stage, 'conversion', inputs, CONV, update); update();
}};

/* ---- Experiment Mode ---- */
const EXPS = [
  { id:'fields', n:'Reduce registration fields', step:'reg', lift:.08, g:[['Login success','ok','No change expected'],['Abuse / duplicate accounts','warnc','Watch: fewer fields can mean weaker identity checks']] },
  { id:'google', n:'Introduce Google login', step:'reg', lift:.12, g:[['Market scope','warnc','Exclude markets where only phone-number login exists'],['Login success','ok','Expected to improve']] },
  { id:'otp', n:'Improve OTP recovery', step:'reg', lift:.05, g:[['SMS cost per registration','warnc','Watch resend volume'],['Login success','ok','Expected to improve']] },
  { id:'deposit', n:'Simplify deposit steps', step:'intent', lift:.10, g:[['Payment completion','warnc','Coordinate with the team that owns the payment form'],['D2 deposit retention','ok','Primary guardrail']] },
  { id:'promo', n:'Improve promotion discovery', step:'intent', lift:.06, g:[['Promotion cost per depositor','bad','Rises if bonuses go to players who would deposit anyway'],['Reward rule','ok','Reward only paid actions']] },
  { id:'onboard', n:'Personalise onboarding', step:'intent', lift:.07, g:[['D2 deposit retention','ok','Primary guardrail'],['Responsible-gaming signals','ok','Exclude players with limits set']] }
];
let EXP = { id:'fields', n:20000, daily:8000 };
SIMS.experiment = { title:'Experiment Mode', island:'s5', eyebrow:'Growth lab', render(stage){
  const def = { id:'experiment', island:'s5', eyebrow:'Growth lab', title:'Experiment Mode', intro:'Pick an experiment, set the sample, and see whether the result could be read. The expected lift is an assumption for teaching, not a real result.' };
  const inputs = [['n','Sample per arm',1000,100000,1000,EXP.n],['daily','Eligible players per day (both arms)',1000,50000,500,EXP.daily]];
  stage.innerHTML = head(def) + `<div class="tabs" role="tablist" aria-label="Experiments">${EXPS.map(e => `<button type="button" role="tab" data-exp="${e.id}" aria-selected="${e.id === EXP.id}" class="${e.id === EXP.id ? 'on' : ''}">${esc(e.n)}</button>`).join('')}</div>
    <div class="simgrid"><div class="controls">${inputs.map(i => ctl('experiment', i)).join('')}<p class="muted" style="font-size:13px">Baseline comes from the Conversion Lab settings.</p></div><div style="display:flex;flex-direction:column;gap:12px;min-width:0" id="expout"></div></div>
    <details class="how"><summary>How this works</summary><pre>Variant rate  = Control rate × (1 + assumed lift)
95% CI        = diff ± 1.96 × √(p₁(1−p₁)/n + p₂(1−p₂)/n)
Required n    = (1.96 + 0.84)² × (p₁(1−p₁) + p₂(1−p₂)) ÷ diff²    (80% power, α = 5%)
Days to run   = 2 × Required n ÷ Eligible players per day
Expected values only; a real test also has random noise.</pre></details>`;
  const update = () => {
    const e = EXPS.find(x => x.id === EXP.id);
    const p1 = e.step === 'reg' ? CONV.reg/100 : Math.min(1, CONV.intent/100 * (0.8 + 0.4*CONV.promo/100));
    const p2 = Math.min(.99, p1 * (1 + e.lift)), d = p2 - p1, n = EXP.n;
    const se = Math.sqrt(p1*(1-p1)/n + p2*(1-p2)/n), lo = d - 1.96*se, hi = d + 1.96*se;
    const req = Math.ceil(Math.pow(2.8, 2) * (p1*(1-p1) + p2*(1-p2)) / (d*d)), days = Math.ceil(2*req / EXP.daily);
    const readable = lo > 0;
    $('#expout', stage).innerHTML = `<div class="tblwrap"><table class="cmp"><thead><tr><th>Metric</th><th>Control</th><th>Variant</th></tr></thead><tbody>
      <tr><td>${e.step === 'reg' ? 'Visitor → registration' : 'Registered → click deposit'}</td><td>${fmt.pct1(p1)}</td><td>${fmt.pct1(p2)}</td></tr>
      <tr><td>Absolute difference</td><td colspan="2">${d >= 0 ? '+' : ''}${(d*100).toFixed(2)} pts</td></tr>
      <tr><td>Relative lift (assumed)</td><td colspan="2">+${(e.lift*100).toFixed(0)}%</td></tr>
      <tr><td>Sample size</td><td>${fmt.int(n)}</td><td>${fmt.int(n)}</td></tr>
      <tr><td>95% confidence interval</td><td colspan="2" class="${readable ? 'ok' : 'bad'}">${(lo*100).toFixed(2)} to ${(hi*100).toFixed(2)} pts</td></tr></tbody></table></div>
      <div class="callout ${readable ? '' : 'bad'}">${readable ? `<b class="ok">Readable.</b> The interval stays above zero at this sample.` : `<b class="bad">Underpowered.</b> The interval crosses zero, so this test could not tell a win from noise.`} You need about <b>${fmt.int(req)}</b> per arm for 80% power, roughly <b>${fmt.int(days)} days</b> at current traffic.</div>
      <div class="tblwrap"><table class="cmp"><thead><tr><th>Guardrail</th><th>Status</th><th>Note</th></tr></thead><tbody>${e.g.map(g => `<tr><td>${esc(g[0])}</td><td class="${g[1]}">${g[1] === 'ok' ? 'OK' : g[1] === 'bad' ? 'Risk' : 'Watch'}</td><td>${esc(g[2])}</td></tr>`).join('')}</tbody></table></div>`;
  };
  stage.querySelector('.tabs').addEventListener('click', ev => { const b = ev.target.closest('[data-exp]'); if (!b) return; EXP.id = b.dataset.exp; stage.querySelectorAll('[data-exp]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); update(); });
  bindSliders(stage, 'experiment', inputs, EXP, update); update();
}};

function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
/* ---- Agent Crew: full loop ---- */
const CREW_SCENARIOS = [
  { id:'alert', n:'A metric breaks overnight', d:'Nami spots a drop; the crew finds the cause and drafts the fix', steps:[
    ['nami','Daily report, 07:00','Visitor → registration is 18% below its 7-day average in one market since 14:00 yesterday. Other markets are flat. Alert posted to the team channel.'],
    ['zoro','Pulls the funnel','Splits the drop by step, device and app version. All of it sits at OTP verification, Android app only.'],
    ['zoro','Checks the outside world','SMS provider status page reports delivery delays in that country since 13:40.'],
    ['zoro','Runs a simulation','On the 10,000-visitor model, restoring OTP success recovers about 410 registrations a day.'],
    ['zoro','Writes hypothesis and ticket','If we fall back to a second OTP channel when SMS is delayed over 30 s, registration recovers to baseline. Two alternatives rejected: wait for the provider; switch provider outright.'],
    ['luffy','Gate and score','Framing passes. Rubric 86 / 100, priority P1. Fixes: add SMS cost as a guardrail; define the rollback.'],
    ['human','Decision','Approve, or send back.']], pass:true },
  { id:'research', n:'An opportunity from research', d:'Zoro finds a pattern in reviews and sizes it before anyone builds', steps:[
    ['zoro','Market research','Scans app-store reviews and social posts from new players. Top complaint this month: "I can\'t find my bonus."'],
    ['zoro','Checks product data','41% of new players never open the promotions page in their first session.'],
    ['zoro','Runs a simulation','Raising promotion discovery from 55% to 75% adds about 70 deposit clicks per 10,000 visitors in the model.'],
    ['zoro','Writes hypothesis and ticket','If the first-session home screen shows the welcome offer, discovery rises and deposit clicks follow. Rejected: a pop-up (interrupts); a push message (arrives after they leave).'],
    ['luffy','Gate and score','Framing passes. Rubric 78 / 100, priority P2. Fixes: add promotion cost per depositor as a guardrail; reward only paid actions.'],
    ['nami','Adds to the watchlist','After launch, promotion discovery and cost per depositor join the weekly report.'],
    ['human','Decision','Approve, or send back.']], pass:true },
  { id:'idea', n:'A raw idea from a teammate', d:'"Add more pop-ups to increase deposits"', steps:[
    ['luffy','Framing gate','Fails. The idea names a solution, not a problem.'],
    ['luffy','Returns framing fixes','1. Which players are not depositing, and at which step?  2. Bring the current rate and the query.  3. State a testable hypothesis.  4. Check pop-up fatigue on high-value sessions.  5. Name two alternatives and why they lose.'],
    ['zoro','Offers help','Pulls the deposit-click rate by segment so the author can reframe. The ticket goes back to its author, not to the approver.']], pass:false }
];
let CREW = { id:'alert' };
SIMS.crew = { title:'Agent Crew Loop', island:'s5', render(stage){
  const def = { island:'s5', title:'Agent Crew Loop', intro:'Pick a starting point and watch Nami, Zoro and Luffy hand the work along until a person decides. Scripted demo; the data in it is synthetic.', noBadge:true };
  stage.innerHTML = head(def) + `<div class="personas" id="scn">${CREW_SCENARIOS.map(s => `<button type="button" class="persona${s.id === CREW.id ? ' on' : ''}" data-s="${s.id}" aria-pressed="${s.id === CREW.id}"><b>${esc(s.n)}</b><span>${esc(s.d)}</span></button>`).join('')}</div>
    <div class="crewbar" id="cbar">${Object.entries(AGENTS).map(([k, a]) => `<div class="agent" data-a="${k}" style="--c:${a.c}"><span class="av">${a.n[0]}</span><span><b>${esc(a.n)}</b><small>${esc(a.r)}</small></span></div>`).join('')}</div>
    <div id="crewout"></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="button" id="replay">Replay</button></div>`;
  let timers = [];
  const run = () => {
    timers.forEach(clearTimeout); timers = [];
    const s = CREW_SCENARIOS.find(x => x.id === CREW.id), o = $('#crewout', stage);
    const setActive = k => stage.querySelectorAll('.agent').forEach(a => a.classList.toggle('on', a.dataset.a === k));
    o.innerHTML = `<div class="steps">${s.steps.map((st, i) => { const a = AGENTS[st[0]]; const last = st[0] === 'human';
      return `<div class="step ${reduce ? 'lit' : 'off'}${!s.pass && i === 0 ? ' fail' : ''}" style="--acc:${a.c}" data-i="${i}"><span class="k">${a.n[0]}</span><div><b>${esc(st[1])} <span class="muted" style="font-weight:400;font-size:12px">· ${esc(a.n)}</span></b><p>${esc(st[2])}</p>${last ? `<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn sm primary" type="button" data-hd="ok">Approve</button><button class="btn sm" type="button" data-hd="back">Send back</button></div><p class="hdr" style="margin-top:8px;font-size:14px" aria-live="polite"></p>` : ''}</div></div>`; }).join('')}</div>`;
    o.querySelectorAll('[data-hd]').forEach(b => b.addEventListener('click', () => { o.querySelector('.hdr').textContent = b.dataset.hd === 'ok' ? 'Approved. Logged as learning for Luffy\'s rubric; Nami will track the result.' : 'Sent back with notes. Zoro revises and resubmits.'; }));
    if (reduce){ setActive(s.steps[s.steps.length - 1][0]); return; }
    o.querySelectorAll('.step').forEach((el, i) => timers.push(setTimeout(() => { el.classList.remove('off'); el.classList.add('lit'); setActive(s.steps[i][0]); }, 200 + i * 650)));
  };
  $('#scn', stage).addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; CREW.id = b.dataset.s; stage.querySelectorAll('[data-s]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); run(); });
  $('#replay', stage).addEventListener('click', run);
  run();
}};

/* ---- Luffy Gatekeeper ---- */
const TICKET = [
  { k:'problem', l:'Problem statement', w:15, gate:true, fix:'State the problem: who is affected, at which step, and how often.' },
  { k:'data', l:'Baseline metric + query', w:15, gate:true, fix:'Attach the current number and the query that produced it.' },
  { k:'hyp', l:'Testable hypothesis', w:15, gate:true, fix:'Write "If we X, then Y, because Z" with a measurable Y.' },
  { k:'alts', l:'Two rejected alternatives', w:12, fix:'List two other ways to solve it and why they lose.' },
  { k:'thr', l:'Success threshold set up front', w:12, fix:'Decide what counts as a win before launch.' },
  { k:'guard', l:'Guardrail metrics', w:10, fix:'Name what must not get worse (cost, abuse, retention).' },
  { k:'scope', l:'Audience and market scope', w:8, fix:'Say which players and markets, and why any are excluded.' },
  { k:'design', l:'Design or flow attached', w:7, fix:'Link the design or describe the flow.' },
  { k:'roll', l:'Rollback plan', w:6, fix:'Say how to turn it off if a guardrail breaks.' }
];
let LUF = new Set(['problem','hyp','design']);
SIMS.luffy = { title:'Luffy Gatekeeper', island:'s5', render(stage){
  const def = { island:'s5', title:'Luffy Gatekeeper', intro:'Tick what a ticket contains. Luffy checks the framing first, then scores the rest and ranks what to fix. Illustrative rubric.', noBadge:true };
  stage.innerHTML = head(def) + `<div class="simgrid"><div class="controls"><div class="toggles"><b style="font-size:13px;color:var(--muted)">The ticket includes…</b>${TICKET.map(t => `<label class="tg"><input type="checkbox" data-t="${t.k}"${LUF.has(t.k) ? ' checked' : ''}> ${esc(t.l)}${t.gate ? ' <span class="chip target" style="font-size:9px;padding:2px 6px">Gate</span>' : ''}</label>`).join('')}</div></div><div id="lout" style="display:flex;flex-direction:column;gap:12px;min-width:0" aria-live="polite"></div></div>`;
  const draw = () => {
    const gateMiss = TICKET.filter(t => t.gate && !LUF.has(t.k));
    const score = TICKET.reduce((s, t) => s + (LUF.has(t.k) ? t.w : 0), 0);
    const miss = TICKET.filter(t => !LUF.has(t.k)).sort((a, b) => b.w - a.w);
    const o = $('#lout', stage);
    if (gateMiss.length){
      o.innerHTML = `<div class="out warn"><span class="v">Blocked</span><span class="l">Framing gate failed: the rest of the ticket is not reviewed yet</span></div>
        <div class="callout bad"><b>Fix the framing first</b><ol style="margin:8px 0 0;padding-left:20px">${gateMiss.map(t => `<li>${esc(t.fix)}</li>`).join('')}</ol></div>
        <p class="muted" style="font-size:13px">Polishing a ticket built on no evidence wastes the reviewer's time, so Luffy stops here.</p>`;
      return;
    }
    const pr = score >= 85 ? 'Ready for approval' : score >= 65 ? 'Close: fix the top items' : 'Needs work';
    o.innerHTML = `<div class="outs"><div class="out"><span class="v">${score}<span style="font-size:14px;color:var(--muted)"> / 100</span></span><span class="l">Rubric score</span><span class="bar"><i style="width:${score}%;background:var(--gold)"></i></span></div><div class="out"><span class="v" style="font-size:18px">${pr}</span><span class="l">Gate passed</span></div></div>
      ${miss.length ? `<div class="callout"><b>Ranked fixes</b><ol style="margin:8px 0 0;padding-left:20px">${miss.map(t => `<li>${esc(t.fix)} <span class="muted">(+${t.w})</span></li>`).join('')}</ol></div>` : '<div class="callout"><b class="ok">Nothing left to fix.</b></div>'}
      <div class="callout" style="border-color:rgba(56,189,248,.5)">Luffy never approves. The ticket goes to a person with the score and fix list attached.</div>`;
  };
  stage.querySelectorAll('[data-t]').forEach(c => c.addEventListener('change', () => { c.checked ? LUF.add(c.dataset.t) : LUF.delete(c.dataset.t); draw(); }));
  draw();
}};

/* ---- Nami Monitor ---- */
const NAMI_METRICS = [
  { k:'reg', l:'Visitor → registration', base:.31, noise:.008 },
  { k:'dep', l:'Registration → deposit click', base:.40, noise:.01 },
  { k:'login', l:'Login success', base:.93, noise:.006 }
];
const NAMI_INC = [
  { k:'otp', l:'SMS/OTP provider delay (day 26)', day:26, m:'reg', eff:-.06, cause:'OTP verification step, Android only' },
  { k:'rel', l:'Release bug on deposit button (day 21)', day:21, m:'dep', eff:-.07, cause:'App release on day 21; deposit button unresponsive on one screen size', len:3 },
  { k:'auth', l:'Login service degradation (day 24)', day:24, m:'login', eff:-.05, cause:'Auth service latency above 2 s', len:2 }
];
let NAMI = { m:'reg', inc:new Set(['otp']), mode:'daily' };
SIMS.nami = { title:'Nami Monitor', island:'s5', render(stage){
  const def = { island:'s5', title:'Nami Monitor', intro:'28 days of synthetic metrics. Inject an incident and see what Nami flags in the daily and weekly reports.', noBadge:false };
  stage.innerHTML = head(def) + `<div class="simgrid"><div class="controls">
      <div class="toggles"><b style="font-size:13px;color:var(--muted)">Inject incidents</b>${NAMI_INC.map(i => `<label class="tg"><input type="checkbox" data-i="${i.k}"${NAMI.inc.has(i.k) ? ' checked' : ''}> ${esc(i.l)}</label>`).join('')}</div>
      <div class="ctl"><label for="nm">Metric on the chart</label><select id="nm" style="width:100%;min-height:44px;border-radius:10px;background:var(--bg);color:var(--text);border:1px solid var(--line);padding:0 12px;font:inherit">${NAMI_METRICS.map(m => `<option value="${m.k}"${m.k === NAMI.m ? ' selected' : ''}>${esc(m.l)}</option>`).join('')}</select></div>
      <div class="tabs" id="nmode"><button type="button" data-m="daily" class="${NAMI.mode === 'daily' ? 'on' : ''}">Daily report</button><button type="button" data-m="weekly" class="${NAMI.mode === 'weekly' ? 'on' : ''}">Weekly report</button></div>
    </div><div id="nout" style="display:flex;flex-direction:column;gap:12px;min-width:0"></div></div>
    <details class="how"><summary>How Nami decides</summary><pre>Each day, compare the metric with its trailing 7-day mean and spread.
z = (today − mean) ÷ standard deviation
Alert when |z| ≥ 3 and the move is larger than 8% of the average,
then name the step, platform or release where the change concentrates.
The 8% floor keeps small weekend dips from paging anyone.</pre></details>`;
  const series = () => { const r = rng(7); const out = {};
    NAMI_METRICS.forEach(m => { out[m.k] = []; for (let d = 1; d <= 28; d++){ let v = m.base * (1 + ((d % 7 === 6 || d % 7 === 0) ? -.03 : 0)) + (r() - .5) * 2 * m.noise;
      NAMI_INC.forEach(i => { if (NAMI.inc.has(i.k) && i.m === m.k && d >= i.day && d < i.day + (i.len || 3)) v += i.eff; }); out[m.k].push(v); } });
    return out; };
  const alertsFor = (data, k) => { const s = data[k], res = []; for (let d = 7; d < 28; d++){ const w = s.slice(d - 7, d), mu = w.reduce((a, b) => a + b) / 7, sd = Math.sqrt(w.reduce((a, b) => a + (b - mu) ** 2, 0) / 7) || .001, z = (s[d] - mu) / sd; if (Math.abs(z) >= 3 && Math.abs((s[d] - mu) / mu) > .08) res.push({ day:d + 1, z, v:s[d], mu }); } return res; };
  const draw = () => {
    const data = series(), m = NAMI_METRICS.find(x => x.k === NAMI.m), s = data[m.k], al = alertsFor(data, m.k);
    const lo = Math.min(...s) - .02, hi = Math.max(...s) + .02, W = 560, H = 200, px = d => 34 + (d / 27) * (W - 44), py = v => 12 + (1 - (v - lo) / (hi - lo)) * (H - 36);
    let path = s.map((v, d) => (d ? 'L' : 'M') + px(d).toFixed(1) + ',' + py(v).toFixed(1)).join('');
    const ticks = [lo + .02, (lo + hi) / 2, hi - .02];
    const svg = `<div class="tblwrap" style="padding:10px"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(m.l)} over 28 days${al.length ? ', with ' + al.length + ' alert days' : ''}">
      ${ticks.map(t => `<line x1="34" x2="${W - 10}" y1="${py(t)}" y2="${py(t)}" stroke="var(--line-soft)"/><text x="0" y="${py(t) + 4}" font-size="10" fill="var(--muted)">${(t * 100).toFixed(0)}%</text>`).join('')}
      <path d="${path}" fill="none" stroke="#F472B6" stroke-width="2"/>
      ${al.map(a => `<circle cx="${px(a.day - 1)}" cy="${py(a.v)}" r="6" fill="none" stroke="var(--red)" stroke-width="2"/>`).join('')}
      <text x="34" y="${H - 4}" font-size="10" fill="var(--muted)">Day 1</text><text x="${W - 50}" y="${H - 4}" font-size="10" fill="var(--muted)">Day 28</text></svg></div>`;
    const allAlerts = NAMI_METRICS.flatMap(mm => alertsFor(data, mm.k).map(a => ({ ...a, m:mm })));
    let rep;
    if (NAMI.mode === 'daily'){
      const today = allAlerts.filter(a => a.day >= 26);
      rep = `<div class="callout ${today.length ? 'bad' : ''}"><b>Nami · daily report · day 28, 07:00</b><ul style="margin:8px 0 0;padding-left:18px">${NAMI_METRICS.map(mm => { const v = data[mm.k][27], w = data[mm.k].slice(20, 27), mu = w.reduce((a, b) => a + b) / 7; const ch = (v - mu) / mu; return `<li>${esc(mm.l)}: ${(v * 100).toFixed(1)}% (${ch >= 0 ? '+' : ''}${(ch * 100).toFixed(1)}% vs 7-day avg)</li>`; }).join('')}</ul>
        ${today.length ? `<p style="margin-top:8px"><b class="bad">Alert:</b> ${today.map(a => { const inc = NAMI_INC.find(i => i.m === a.m.k && NAMI.inc.has(i.k)); return `${esc(a.m.l)} broke its normal range on day ${a.day}${inc ? `; change concentrates in: ${esc(inc.cause)}` : ''}`; }).join('. ')}. Handed to Zoro to investigate.</p>` : '<p class="ok" style="margin-top:8px">No alerts in the last three days.</p>'}</div>`;
    } else {
      rep = `<div class="callout"><b>Nami · weekly report · weeks 3–4</b><ul style="margin:8px 0 0;padding-left:18px">${NAMI_METRICS.map(mm => { const a = data[mm.k].slice(14, 21), b = data[mm.k].slice(21, 28); const ma = a.reduce((x, y) => x + y) / 7, mb = b.reduce((x, y) => x + y) / 7; return `<li>${esc(mm.l)}: ${(mb * 100).toFixed(1)}% avg (${mb >= ma ? '+' : ''}${((mb - ma) * 100).toFixed(1)} pts week on week)</li>`; }).join('')}</ul>
        <p style="margin-top:8px">${allAlerts.filter(a => a.day > 14).length ? `<b>Incidents this period:</b> ${[...new Set(allAlerts.filter(a => a.day > 14).map(a => a.m.l))].map(esc).join(', ')}. Root causes and fixes are tracked in Zoro's tickets.` : 'No incidents this period.'}</p></div>`;
    }
    $('#nout', stage).innerHTML = svg + rep;
  };
  stage.querySelectorAll('[data-i]').forEach(c => c.addEventListener('change', () => { c.checked ? NAMI.inc.add(c.dataset.i) : NAMI.inc.delete(c.dataset.i); draw(); }));
  $('#nm', stage).addEventListener('change', e => { NAMI.m = e.target.value; draw(); });
  $('#nmode', stage).addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; NAMI.mode = b.dataset.m; stage.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); draw(); });
  draw();
}};

/* ---- Spot the Flaws ---- */
const BRIEF = [
  ['Hypothesis','Rewarding new players who install the app (PWA) will increase D2 deposit retention.', false],
  ['Primary metric','Number of PWA installs.', true, 'Metric mismatch: the hypothesis is about D2 deposit retention, but success is measured in installs.'],
  ['Audience','New registered players in one market, 50/50 split.', false],
  ['Sample','500 players per arm for 7 days. Expected lift on D2: +2% relative.', true, 'Underpowered: a 2% relative lift needs tens of thousands per arm. This test cannot be read.'],
  ['Reward','50 bonus credits on install, before any deposit.', true, 'Rewards an unpaid action: invites farming and pays players who never deposit.'],
  ['Cost cap','Maximum 1,000 credits for the whole test.', true, 'Contradicts the reward: about 200 installers × 50 credits is 10,000 credits, ten times the cap.'],
  ['Anti-abuse','Exclude players who claim this bonus more than once.', true, 'Logically dead: the bonus can only be claimed once, so this rule never triggers.'],
  ['Eligibility','Fixed at assignment time.', false],
  ['Guardrails','Deposit success rate · bonus cost per depositor · D2 deposit retention.', false],
  ['Decision rule','Ship if D2 lift is at least 1 point with the 95% interval above zero.', false]
];
let FL = { marked:new Set(), checked:false };
SIMS.flaws = { title:'Spot the Flaws', island:'s5', eyebrow:'Growth lab', render(stage){
  const def = { id:'flaws', island:'s5', eyebrow:'Growth lab', title:'Spot the Flaws', intro:'A fictional experiment brief with five planted problems, the kind Luffy is built to catch. Click every line you think is wrong, then check.', noBadge:true };
  stage.innerHTML = head(def) + `<div class="brief"><div class="bh">Experiment brief · "Install bonus" · fictional</div><div id="bl"></div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="btn primary" type="button" id="chk">Check my answers</button><button class="btn" type="button" id="rst">Reset</button><span id="score" class="muted" aria-live="polite"></span></div>`;
  const draw = () => {
    $('#bl', stage).innerHTML = BRIEF.map((b, i) => {
      let cls = FL.marked.has(i) ? ' mark' : '';
      if (FL.checked){ cls = b[2] && FL.marked.has(i) ? ' hit' : !b[2] && FL.marked.has(i) ? ' miss' : b[2] ? ' missed' : ''; }
      return `<button type="button" class="bline${cls}" data-i="${i}" aria-pressed="${FL.marked.has(i)}"><span>${b[0]}</span><span>${esc(b[1])}</span>${FL.checked && b[2] ? `<span class="why">${FL.marked.has(i) ? '✓ Found. ' : 'Missed. '}${esc(b[3])}</span>` : ''}${FL.checked && !b[2] && FL.marked.has(i) ? '<span class="why">This line is fine.</span>' : ''}</button>`;
    }).join('');
    if (FL.checked){ const hits = BRIEF.filter((b, i) => b[2] && FL.marked.has(i)).length, fp = [...FL.marked].filter(i => !BRIEF[i][2]).length; $('#score', stage).textContent = `${hits} of 5 found${fp ? `, ${fp} false alarm${fp > 1 ? 's' : ''}` : ''}.`; }
    else $('#score', stage).textContent = `${FL.marked.size} marked`;
  };
  $('#bl', stage).addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b || FL.checked) return; const i = +b.dataset.i; FL.marked.has(i) ? FL.marked.delete(i) : FL.marked.add(i); draw(); });
  $('#chk', stage).addEventListener('click', () => { FL.checked = true; draw(); });
  $('#rst', stage).addEventListener('click', () => { FL = { marked:new Set(), checked:false }; draw(); });
  draw();
}};

/* ---- Product flow demos (phone mockups) ---- */
const FLOWS = {
  'ev-demo': { island:'ampup', title:'EV charging app', intro:'Walk the driver journey. Turn on real-world friction, then switch on the improved version.',
    steps:[['Find station','3 stations nearby. Nearest: Oakridge Mall, 0.4 mi, 4 of 6 chargers available.','Choose station'],['Select charger','Charger B3 · 7.2 kW · $0.32/kWh','Select B3'],['Start charging','Plug in, then tap start.','Start'],['Monitor session','Charging · 42% · 14.1 kWh · 38 min remaining','Stop charging'],['Pay','Total $4.51 · Visa •••• 4242','Pay'],['Finish','Done. Receipt sent. Unplug and drive.','Find another station']],
    fr:[{ k:'info', at:0, l:'Poor station information', err:'No photos, no access notes. The garage gate code is missing.', fix:'Photos, access notes and gate codes from operators and drivers.' },
        { k:'unav', at:1, l:'Charger unavailable', err:'Shown as available, but B3 is occupied when you arrive.', fix:'Live status from the charger heartbeat; hold the charger for 10 minutes.' },
        { k:'start', at:2, l:'Failed session start', err:'Session failed to start. Error 0x31.', fix:'Automatic retry, then one tap to move to the next free charger.' },
        { k:'pay', at:4, l:'Payment failure', err:'Card declined. Cable stays locked.', fix:'Saved backup method; session completes and the cable unlocks, retry later.' }] },
  'vf-demo': { island:'vinfast', title:'Charging session recovery', intro:'A cross-market charging journey with the failures infrastructure teams fight every day.',
    steps:[['Find charger','Highway hub, 12 km ahead · 8 DC chargers','Navigate'],['Navigate','Arriving in 9 min','I\'m here'],['Plug in','Connect the cable to your car','Continue'],['Start session','Authorising…','Start'],['Monitor','Charging · 61% · 22 min remaining','Stop'],['Complete','Session complete · 31 kWh','Done']],
    fr:[{ k:'off', at:0, l:'Charger offline', err:'2 of 8 chargers went offline after you set off.', fix:'Live availability re-routes you before arrival and reserves a working charger.' },
        { k:'roam', at:3, l:'Roaming authorisation failure', err:'Partner network rejected your card.', fix:'Fallback to pay-as-you-go by QR, roaming retried in the background.' },
        { k:'stuck', at:4, l:'Session stuck', err:'Progress frozen at 61% for 10 minutes.', fix:'Remote reset from the operations centre; support notified automatically.' },
        { k:'pay', at:5, l:'Payment rejected', err:'Payment rejected. Session cannot close.', fix:'Session closes and unlocks; the balance is retried and shown in the app.' }] },
  'up-demo': { island:'uplive', title:'Live-streaming onboarding', intro:'Join, find a creator, interact, return. Compare the before and after onboarding.',
    steps:[['Join','Create your account','Continue'],['Discover a creator','Live now for you','Watch'],['Live room','1,204 watching · chat is busy','Say hi'],['Chat','You: Hi from Manila!','Send a gift'],['Send a gift','Rose · 10 coins','Send'],['Follow','Follow to get notified when she goes live','Follow'],['Return later','Next day','Open app']],
    fr:[{ k:'form', at:0, l:'Long sign-up form', err:'Seven fields, email verification, profile photo required.', fix:'One-tap phone sign-up; profile later.' },
        { k:'feed', at:1, l:'Generic discovery', err:'A grid of the most popular streams, none in your language.', fix:'Three live creators picked from language, location and the interests you tapped.' },
        { k:'ret', at:6, l:'Generic notification', err:'"Come back! Lots of streams live now."', fix:'"Ana, who you followed, is live now." Sent once, when it matters.' }] },
  'ghn-demo': { island:'ghn', title:'Package journey', intro:'Follow one package. Turn on a bottleneck, see where it hurts, then apply the fix.',
    steps:[['Order created','Order #VN-20831 · Hanoi → Ho Chi Minh City','Next'],['Pickup','Courier assigned · pickup 14:00','Next'],['Sorting','Hub: Long Bien sorting centre','Next'],['Dispatch','Out for delivery','Next'],['Delivery','Courier arriving','Next'],['Confirmation','Delivered 10:42 · photo proof','Done']],
    fr:[{ k:'sort', at:2, l:'Sorting backlog', err:'Hub is 9 hours behind; package missed the evening line-haul.', fix:'Wave planning by destination; extra night shift triggered when the queue passes a threshold.' },
        { k:'disp', at:3, l:'Dispatch no-show', err:'Assigned courier did not start the route.', fix:'Auto-reassign after 20 minutes to the nearest courier with capacity.' },
        { k:'fail', at:4, l:'Failed delivery', err:'Customer not home. Package returns to hub.', fix:'Time-window confirmation by SMS the night before; redirect to a pickup point.' }] }
};
Object.keys(FLOWS).forEach(id => {
  const F = FLOWS[id], st = { i:0, on:new Set(F.fr.map(f => f.k)), fixed:false };
  SIMS[id] = { title:F.title, island:F.island, render(stage){
    stage.innerHTML = head({ island:F.island, title:F.title, intro:F.intro, noBadge:true }) + `<div class="simgrid"><div class="controls"><div class="toggles"><b style="font-size:13px;color:var(--muted)">Real-world friction</b>${F.fr.map(f => `<label class="tg"><input type="checkbox" data-k="${f.k}"${st.on.has(f.k) ? ' checked' : ''}> ${esc(f.l)}</label>`).join('')}</div>
      <label class="tg" style="margin-top:6px"><input type="checkbox" id="fixed"${st.fixed ? ' checked' : ''}> <b>Show the improved product</b></label><p class="muted" style="font-size:13px">Product mockup for illustration.</p></div><div id="ph"></div></div>`;
    const draw = () => {
      const s = F.steps[st.i], f = F.fr.find(x => x.at === st.i && st.on.has(x.k));
      $('#ph', stage).innerHTML = `<div class="phone" style="--acc:${islandById(F.island).acc}"><div class="notch"></div><div class="dots">${F.steps.map((_, i) => `<i class="${i <= st.i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="scr" aria-live="polite"><span class="muted" style="font-size:11px;letter-spacing:.08em;text-transform:uppercase">Step ${st.i+1} of ${F.steps.length}</span><h5>${esc(s[0])}</h5><div class="card">${esc(s[1])}</div>
        ${f ? (st.fixed ? `<div class="fix"><b>Improved:</b> ${esc(f.fix)}</div>` : `<div class="err"><b>${esc(f.l)}:</b> ${esc(f.err)}</div>`) : ''}</div>
        <div style="display:flex;gap:8px"><button class="btn sm" type="button" id="bk"${st.i ? '' : ' disabled'}>Back</button><button class="btn sm primary" type="button" id="nx" style="flex:1;justify-content:center">${st.i === F.steps.length - 1 ? 'Start over' : esc(s[2])}</button></div></div>`;
      $('#bk', stage).onclick = () => { st.i = Math.max(0, st.i - 1); draw(); };
      $('#nx', stage).onclick = () => { st.i = st.i === F.steps.length - 1 ? 0 : st.i + 1; draw(); };
    };
    stage.querySelectorAll('[data-k]').forEach(c => c.addEventListener('change', () => { c.checked ? st.on.add(c.dataset.k) : st.on.delete(c.dataset.k); draw(); }));
    $('#fixed', stage).addEventListener('change', e => { st.fixed = e.target.checked; draw(); });
    draw();
  }};
});

/* ---- 3D case scenes ---- */
let SCENE = null;
const hasGL = (() => { try { const c = document.createElement('canvas'); return !!(window.THREE && window.SCENES && (c.getContext('webgl2') || c.getContext('webgl'))); } catch(e){ return false; } })();
const noGL = '<div class="callout warn">3D is not available in this browser. The case page has the same story in text.</div>';
const legend = items => `<div class="legend">${items.map(([c, l]) => `<span><i style="background:${c}"></i>${esc(l)}</span>`).join('')}</div>`;

/* EV network */
const EVS = { market:'key', ai:true, wallet:true, hub:false };
SIMS['ev-network'] = { title:'EV Network in 3D', island:'vinfast', render(stage){
  stage.innerHTML = head({ island:'vinfast', eyebrow:'VinFast · AmpUp', title:'EV Network in 3D', intro:'Cars arrive, the cloud routes them, chargers fail and recover, drivers pay. Switch strategies and watch waiting time and uptime change. One second of animation is one minute.' }) + `
    <div class="tabs" id="evm" role="group" aria-label="Market"><button type="button" data-m="key" class="${EVS.market === 'key' ? 'on' : ''}">Key market: in-house network</button><button type="button" data-m="exp" class="${EVS.market === 'exp' ? 'on' : ''}">New market: partner hub</button></div>
    <div class="toggles row">
      <label class="tg"><input type="checkbox" id="ev-ai"${EVS.ai ? ' checked' : ''}> AI cloud control</label>
      <label class="tg"><input type="checkbox" id="ev-wallet"${EVS.wallet ? ' checked' : ''}> Wallet charging</label>
      <label class="tg" id="ev-hubw"${EVS.market === 'exp' ? '' : ' hidden'}><input type="checkbox" id="ev-hub"${EVS.hub ? ' checked' : ''}> Connect to the largest local network</label>
    </div>
    <div id="evscene" class="scene-box"></div>
    ${legend([['#10B981','Own charger, free'],['#A78BFA','Partner charger'],['#38BDF8','Charging'],['#F87171','Fault'],['#F59E0B','Car waiting or paying']])}
    <div class="outs" id="evout"></div>
    <div class="rooms">
      <div class="room"><small>New markets</small><b>Swarm onto the biggest hub</b><p>Connect once to the largest local network by roaming. Drivers get hundreds of chargers on day one, without building them first.</p></div>
      <div class="room"><small>Key markets</small><b>Own it, run it from the cloud</b><p>In-house chargers controlled by AI: predict demand, route drivers to a free charger, detect faults and reset remotely. Uptime and experience above the market standard.</p></div>
      <div class="room"><small>Every market</small><b>Wallet charging</b><p>Plug in and charge. The wallet authorises in the background: no app juggling, no card at the post, no waiting for a failed start.</p></div>
    </div>
    <details class="how"><summary>How this works</summary><pre>Cars arrive at a steady rate and ask the network for a charger.
AI control on : the cloud sends each car to the best free, working charger and re-routes cars stuck in a queue.
AI control off: drivers go to the nearest charger, even if it is busy or broken.
Faults happen at random. With AI control the cloud spots and resets them in about 1 minute; without it, about 14.
Wallet on : authorisation takes seconds and never fails.  Wallet off: app + QR + card, 25% of starts fail and retry.
Every number is measured from this simulation. It is illustrative, not company data.</pre></details>`;
  if (!hasGL){ $('#evscene', stage).outerHTML = noGL; return; }
  const out = $('#evout', stage);
  SCENE = window.SCENES.evNetwork($('#evscene', stage), { ...EVS }, s => {
    out.innerHTML = [['Avg wait to start charging', s.wait.toFixed(1) + ' min', s.wait > 3],['Sessions per hour', fmt.int(s.sessions)],['Network uptime', fmt.pct1(s.uptime), s.uptime < .9],['Failed starts per hour', fmt.int(s.fails), s.fails > 5],['Chargers available', fmt.int(s.chargers)],['Cars queuing now', fmt.int(s.queue), s.queue > 6]]
      .map(([l, v, w]) => `<div class="out${w ? ' warn' : ''}"><span class="v">${v}</span><span class="l">${l}</span></div>`).join(''); });
  const push = () => SCENE && SCENE.set({ ...EVS });
  $('#evm', stage).addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; EVS.market = b.dataset.m; stage.querySelectorAll('#evm [data-m]').forEach(x => x.classList.toggle('on', x === b)); $('#ev-hubw', stage).hidden = EVS.market !== 'exp'; push(); });
  [['ev-ai','ai'],['ev-wallet','wallet'],['ev-hub','hub']].forEach(([id, k]) => $('#' + id, stage).addEventListener('change', e => { EVS[k] = e.target.checked; push(); }));
}};

/* GHN */
const GH = { scale:false, track:false, fixed:0 };
const GH_REASONS = ['Customer unreachable','Wrong or incomplete address','Missed line-haul cut-off','Courier over capacity','Damaged or mis-sorted'];
const GH_SHARE = [30,25,20,15,10];
const GH_OT = [.46,.62,.755,.862,.942,.996];
SIMS['ghn-scale'] = { title:'Network Scale-up in 3D', island:'ghn', render(stage){
  stage.innerHTML = head({ island:'ghn', title:'Network Scale-up in 3D', intro:'From three centres to a nationwide network. Then break delivery into steps, track every failure reason, and fix the biggest one first.' }) + `
    <div class="tabs" id="ghs"><button type="button" data-s="0" class="${GH.scale ? '' : 'on'}">When I joined · 3 centres</button><button type="button" data-s="1" class="${GH.scale ? 'on' : ''}">At scale · 64 centres</button></div>
    <div id="ghscene" class="scene-box"></div>
    ${legend([['#FB923C','Sort hub'],['#38BDF8','Delivery centre'],['#10B981','Delivered on time'],['#F87171','Late or failed']])}
    <div class="outs" id="ghout"></div>
    <div class="blk" style="gap:10px"><b style="font-size:14px">Delivery funnel, step by step</b>
      <div class="flow">${['Order created','Pickup','Hub sort','Line-haul','Centre sort','Out for delivery','Delivered'].map(s => `<div class="st"><b>${s}</b>fail reasons tracked</div>`).join('')}</div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <label class="tg"><input type="checkbox" id="gh-track"${GH.track ? ' checked' : ''}> Track every failure reason</label>
      <button class="btn primary sm" type="button" id="gh-fix">Fix the biggest reason</button><button class="btn sm" type="button" id="gh-reset">Reset</button></div>
    <div id="ghbins"></div>
    <div class="callout">Learned from Amazon's operating practice: measure every step, find the root cause of every miss, standardise the fix, then scale the network.</div>
    <details class="how"><summary>How this works</summary><pre>Packages fly from a sort hub to a delivery centre, then to a home.
Each package is late or failed with probability (1 − on-time rate).
Tracking assigns each miss a reason. Fixing removes the biggest remaining reason.
On-time: 46% at the start and 99.6% at the end are reported; the steps between are illustrative.
Failure categories are examples. Package counts on screen are visual, not literal volumes.</pre></details>`;
  if (!hasGL){ $('#ghscene', stage).outerHTML = noGL; }
  const shares = () => GH_SHARE.map((s, i) => i < GH.fixed ? 0 : s);
  const st = () => ({ scale:GH.scale, track:GH.track, onTime:GH_OT[GH.fixed], shares:shares() });
  const draw = s => {
    $('#ghout', stage).innerHTML = [['Delivery centres', GH.scale ? '64' : '3'],['Orders per day', GH.scale ? '30,000' : '300'],['On-time delivery', (GH_OT[GH.fixed] * 100).toFixed(GH.fixed === 5 ? 1 : 0) + '%']]
      .map(([l, v]) => `<div class="out"><span class="v">${v}</span><span class="l">${l}</span></div>`).join('');
    const b = s?.bins || [0,0,0,0,0], mx = Math.max(1, ...b);
    $('#ghbins', stage).innerHTML = GH.track ? `<div class="callout"><b>Misses grouped by reason</b> <span class="muted" style="font-size:12px">· example categories</span>${GH_REASONS.map((r, i) => `<div class="frow" style="margin-top:8px"><span style="${i < GH.fixed ? 'text-decoration:line-through;color:var(--dim)' : ''}">${r}</span><span class="track"><i style="width:${b[i] / mx * 100}%;background:${i < GH.fixed ? 'var(--line)' : 'var(--red)'}"></i></span><span class="n">${i < GH.fixed ? '<span class="ok">fixed</span>' : fmt.int(b[i])}</span></div>`).join('')}</div>` : '';
    $('#gh-fix', stage).disabled = !GH.track || GH.fixed >= 5;
  };
  if (hasGL) SCENE = window.SCENES.ghn($('#ghscene', stage), st(), draw);
  draw();
  const push = extra => { if (SCENE) SCENE.set({ ...st(), ...extra }); draw(); };
  $('#ghs', stage).addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (!b) return; GH.scale = b.dataset.s === '1'; stage.querySelectorAll('#ghs [data-s]').forEach(x => x.classList.toggle('on', x === b)); push(); });
  $('#gh-track', stage).addEventListener('change', e => { GH.track = e.target.checked; push({ resetBins:true }); });
  $('#gh-fix', stage).addEventListener('click', () => { if (GH.fixed < 5){ GH.fixed++; push({ resetBins:true }); } });
  $('#gh-reset', stage).addEventListener('click', () => { GH.fixed = 0; GH.track = false; $('#gh-track', stage).checked = false; push({ resetBins:true }); });
}};

/* Uplive */
const UP = { mode:'lang', opt:false };
const SOURCES = [['Channel A', 25, 1.0],['Channel B', 20, 2.4],['Channel C', 25, .6],['Channel D', 15, 3.1],['Channel E', 15, .4]];
SIMS['uplive-lang'] = { title:'Language-first Expansion in 3D', island:'uplive', render(stage){
  stage.innerHTML = head({ island:'uplive', title:'Language-first Expansion in 3D', intro:'Launch by language, not by country: one Chinese-language release tests Hong Kong, Taiwan, Malaysia and Singapore at once. Invest where the return shows up.' }) + `
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><div class="tabs" id="upm"><button type="button" data-m="lang" class="${UP.mode === 'lang' ? 'on' : ''}">Launch by language</button><button type="button" data-m="country" class="${UP.mode === 'country' ? 'on' : ''}">Launch by country</button></div><button class="btn primary sm" type="button" id="up-go">Run the launch</button></div>
    <div id="upscene" class="scene-box"></div>
    ${legend([['#F472B6','Chinese'],['#F59E0B','Arabic'],['#38BDF8','Spanish'],['#10B981','Live today']])}
    <div class="outs" id="upout"></div>
    <div class="simgrid" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">
      <div class="callout"><b>Traffic-source optimisation</b> <span class="muted" style="font-size:12px">· example channels</span>
        <label class="tg" style="margin-top:6px"><input type="checkbox" id="up-opt"${UP.opt ? ' checked' : ''}> Shift budget to the sources with the highest pay rate</label><div id="upsrc"></div></div>
      <div class="callout"><b>Reported results</b><ul style="margin:8px 0 0;padding-left:18px"><li>Paying-user rate about <b>5× Bigo's</b>, which made growth faster and more profitable</li><li>Live in <b>50+ countries</b> today</li></ul></div>
    </div>
    <details class="how"><summary>How this works</summary><pre>By language: one release per language reaches every market that speaks it. Each market's return is measured, and the best one gets investment.
By country: each market is launched and measured on its own, one after another.
Weeks per launch, market returns and channels are illustrative. The 5× pay rate and 50+ countries are reported results.</pre></details>`;
  const drawSrc = () => { const act = UP.opt ? SOURCES.map(s => [s[0], s[2] >= 1 ? s[1] / .55 * 1 : 0, s[2]]) : SOURCES; const tot = act.reduce((a, s) => a + s[1], 0); const blended = act.reduce((a, s) => a + s[1] / tot * s[2], 0);
    $('#upsrc', stage).innerHTML = act.map(s => `<div class="frow" style="grid-template-columns:90px minmax(0,1fr) 110px;margin-top:6px"><span>${s[0]}</span><span class="track"><i style="width:${s[1] / tot * 100}%;background:${s[2] >= 1 ? 'var(--emerald)' : 'var(--line)'}"></i></span><span class="n">${(s[1] / tot * 100).toFixed(0)}% · ${s[2].toFixed(1)}%</span></div>`).join('') + `<p style="margin-top:8px;font-size:14px">Blended pay rate: <b>${blended.toFixed(2)}%</b></p>`; };
  const draw = s => { $('#upout', stage).innerHTML = [['Weeks elapsed', s ? Math.round(s.week) : 0],['Markets tested', s ? s.tested : 0],['Invest next in', s && s.invest.length ? s.invest.join(', ') : '—']]
    .map(([l, v]) => `<div class="out"><span class="v" style="${typeof v === 'string' && v.length > 6 ? 'font-size:16px' : ''}">${v}</span><span class="l">${l}</span></div>`).join(''); };
  draw(); drawSrc();
  if (!hasGL){ $('#upscene', stage).outerHTML = noGL; }
  else SCENE = window.SCENES.uplive($('#upscene', stage), { ...UP }, draw);
  $('#upm', stage).addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; UP.mode = b.dataset.m; stage.querySelectorAll('#upm [data-m]').forEach(x => x.classList.toggle('on', x === b)); SCENE && SCENE.set({ mode:UP.mode, go:true }); });
  $('#up-go', stage).addEventListener('click', () => SCENE && SCENE.set({ mode:UP.mode, go:true }));
  $('#up-opt', stage).addEventListener('change', e => { UP.opt = e.target.checked; drawSrc(); });
  setTimeout(() => SCENE && SCENE.set({ mode:UP.mode, go:true }), 600);
}};

let currentSim = 'crew';
function renderSimNav(){
  $('#simnav').innerHTML = GROUPS.map(g => `<div><h4>${esc(g[0])}</h4><div class="grp">${g[1].map(id => `<button type="button" data-sim="${id}" style="--acc:${islandById(SIMS[id].island).acc}">${esc(SIMS[id].title)}</button>`).join('')}</div></div>`).join('');
  $('#simnav').addEventListener('click', e => { const b = e.target.closest('[data-sim]'); if (b) go('sim-' + b.dataset.sim, true); });
}
function openSim(id){
  if (!SIMS[id]) id = 'crew';
  currentSim = id;
  if (SCENE){ SCENE.dispose(); SCENE = null; }
  document.querySelectorAll('#simnav [data-sim]').forEach(b => { b.classList.toggle('on', b.dataset.sim === id); b.setAttribute('aria-current', b.dataset.sim === id ? 'true' : 'false'); });
  const stage = $('#stage'); stage.style.setProperty('--acc', islandById(SIMS[id].island).acc);
  SIMS[id].render(stage);
}

/* ---------- THINKING / ABOUT ---------- */
const monSym = ['<path d="M12 3l9 18H3z"/>','<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>','<rect x="5" y="5" width="14" height="14" rx="3"/><path d="M9 9h6v6H9z"/>','<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0"/>'];
function renderThinking(){
  $('#mons').innerHTML = S.monuments.map((m, i) => `<div class="mon"><span class="sym"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${m.c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${monSym[i]}</svg></span><h3>${esc(m.t)}</h3><p class="pr">${esc(m.pr)}</p><ul>${m.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');
  $('#bio').innerHTML = tx(S.bio);
  $('#timeline').innerHTML = S.timeline.map(t => `<li style="--acc:${t.acc}"><span class="dot"></span><div><b>${esc(t.company)}</b><span>${tx(t.role)} · ${tx(t.years)}</span></div></li>`).join('') + `<li style="--acc:var(--line)"><span class="dot"></span><div><span class="muted" style="font-size:13px">${esc(S.timelineNote)}</span></div></li>`;
}

/* ---------- ROUTING (plain #name only) ---------- */
function go(hash, keep){ if (location.hash === '#' + hash) route(keep); else location.hash = hash; }
function route(){
  const h = location.hash.slice(1);
  if (h.startsWith('case-')){ renderReader(h.slice(5)); $('#reader').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  else if (h.startsWith('sim-')){ openSim(h.slice(4)); $('#playground').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
  document.querySelectorAll('.nav ul a').forEach(a => { const t = a.getAttribute('href').slice(1); a.classList.toggle('on', h === t || h.startsWith(t === 'cases' ? 'case-' : t === 'playground' ? 'sim-' : '#')); });
}
window.addEventListener('hashchange', route);

renderImpact(); renderCaseList(); renderSimNav(); renderThinking();
renderReader('s5'); openSim('crew');
if (location.hash) route();
window.APP = { islands:S.islands, center:S.center, caseById, metricById, visibleMetric };
})();
