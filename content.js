/* All site content lives here. Components never hard-code copy.
   PUBLIC_MODE: set to true before deploying publicly. When true, only metrics
   with publishApproved:true render. When false (preview), unapproved metrics
   render with a "Pending approval" chip. */
window.SITE = {
  PUBLIC_MODE: false,

  /* ---------------- METRICS REGISTRY ---------------- */
  metrics: [
    { id:'ampup-rev', label:'Revenue growth', display:'+39%', company:'AmpUp', period:'2023', definition:'[TBD: YoY? which revenue line?]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'uplive-rev', label:'Revenue growth', display:'+50%', company:'Uplive', period:'[TBD]', definition:'[TBD: period and revenue type]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'ghn-otd', label:'On-time delivery', display:'46% → 99%', company:'Giaohangnhanh', period:'[TBD]', definition:'[TBD: definition, scope, period]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'vinmart-sat', label:'Customer score', display:'4.5 → 8.0', company:'Vinmart', period:'[TBD]', definition:'[TBD: scale; not labelled NPS until confirmed]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'ampup-releases', label:'Product releases', display:'40+', company:'AmpUp', period:'[TBD]', definition:'Count of shipped releases', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'ampup-support', label:'Support reduction', display:'−30%', company:'AmpUp', period:'[TBD]', definition:'[TBD: tickets per session or absolute?]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'uplive-ret', label:'Retention', display:'<1% → ~10%', company:'Uplive', period:'[TBD]', definition:'[TBD: which retention (D7? D30?), which cohort]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'uplive-onb', label:'Onboarding retention', display:'+30%', company:'Uplive', period:'[TBD]', definition:'[TBD: relative or points?]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false }
  ],
  heroMetrics: ['ampup-rev','uplive-rev','ghn-otd','vinmart-sat','ampup-releases','ampup-support'],

  /* ---------------- ISLANDS ---------------- */
  islands: [
    { id:'s5', name:'S5 Tech', sub:'AI agent crew', acc:'#F59E0B', acc2:'#22D3EE', kind:'s5', sim:'crew' },
    { id:'ampup', name:'AmpUp', sub:'EV charging', acc:'#10B981', acc2:'#22D3EE', kind:'ev', sim:'ev' },
    { id:'vinfast', name:'VinFast / V-Green', sub:'Charging infrastructure', acc:'#34D399', acc2:'#38BDF8', kind:'grid', sim:'command' },
    { id:'uplive', name:'Uplive', sub:'Live streaming', acc:'#F472B6', acc2:'#8B5CF6', kind:'live', sim:'live' },
    { id:'ghn', name:'Giaohangnhanh', sub:'Logistics', acc:'#FB923C', acc2:'#38BDF8', kind:'logi', sim:'logistics' },
    { id:'vinmart', name:'Vinmart', sub:'Retail experience', acc:'#38BDF8', acc2:'#10B981', kind:'retail', sim:'retail' }
  ],
  center: { id:'leadership', name:'Product Leadership', sub:'Strategy · Growth · AI · Team', acc:'#F8FAFC' },

  /* ---------------- CASES ---------------- */
  cases: [
    {
      id:'s5', num:'01', title:'Building an AI agent crew for a product team',
      company:'S5 Tech', industry:'iGaming technology · AI-native product operations',
      role:'Product Director', period:'[TBD] – present', markets:'Multi-market', team:'Product team + three AI agents',
      context:'Product teams spend much of their week on the same loops: checking dashboards, digging into a drop, researching a market, writing tickets, and waiting for review. Most of that work follows judgement that can be written down.',
      problem:'Product tickets queued for a single approver and often took five or six review rounds to reach good quality. Problems in the data were noticed late, and investigation started from scratch each time.',
      myrole:'I designed and built a crew of three AI agents that work inside the team\'s chat, each with one job, handing work to each other and to the people who decide.',
      crew:true,
      decisions:[
        { t:'One job per agent', opts:'One general assistant, or a crew with narrow roles', choice:'Three agents: Nami monitors and reports, Zoro investigates and writes, Luffy gates', why:'Narrow roles are easier to test, trust and improve one at a time.', trade:'More hand-offs to design.' },
        { t:'AI reviews, humans approve', opts:'Let the gatekeeper approve, or keep a person as the decision', choice:'Luffy scores and ranks fixes; a person always approves', why:'Trust and accountability stay with people while wasted review rounds disappear.', trade:'Slower than full automation.' },
        { t:'Gate the framing before the detail', opts:'Review everything at once, or stop at a failed problem statement', choice:'Framing gate first; a failed ticket gets three to five fixes and stops', why:'Polishing a ticket built on no evidence wastes everyone\'s time.', trade:'Feedback can feel blunt.' },
        { t:'Judgement as a versioned rubric', opts:'Free-form AI opinions, or a scored rubric learned from real reviews', choice:'Rubric built from how senior reviewers judge tickets, versioned and updated from each decision', why:'Consistent, explainable and improvable.', trade:'Needs ongoing curation.' }
      ],
      outcome:[], outcomeNote:'Outcome metrics for review rounds and time-to-ticket are [TBD].',
      sims:['crew','luffy','nami','conversion'],
      lesson:'AI multiplies a product team only when the judgement it applies is explicit, versioned and owned by people.'
    },
    {
      id:'ampup', num:'02', title:'Scaling an EV charging platform through product-led growth',
      company:'AmpUp', industry:'EV charging · climate tech · SaaS · marketplace',
      role:'Head of Product', period:'[TBD]', markets:'[TBD]', team:'[TBD]',
      context:'AmpUp connects charging hardware, station operators, property owners and EV drivers. The business balances station availability, charger utilisation, driver experience, operator revenue, payment reliability, hardware connectivity, support cost and platform scalability.',
      problem:'Growth meant more than adding drivers: every failed session, payment error or offline charger cost revenue and created support work. The challenge was to grow while making the network more reliable.',
      myrole:'[TBD: scope of ownership and team]',
      decisions:[], outcome:['ampup-rev','ampup-releases','ampup-support'],
      outcomeNote:'Reported outcomes during my tenure, not attributed to individual features.',
      sims:['ev','ev-demo'],
      lesson:'Growth is not simply acquiring more users. It is building a reliable system that repeatedly delivers value.'
    },
    {
      id:'vinfast', num:'03', title:'Scaling EV charging infrastructure across multiple markets',
      company:'VinFast / V-Green', industry:'Electric mobility · charging infrastructure · international expansion',
      role:'Product Director, Charging Services Software', period:'[TBD]', markets:'Vietnam · Indonesia · Philippines · India', team:'[TBD]',
      context:'Charging infrastructure only works when operators, drivers, hardware, backend, payments, roaming partners, support and operations work as one. Product areas: session reliability, charger discovery, uptime, payments, roaming, promotions, VIP charging, multi-market configuration and monitoring.',
      problem:'[TBD: the specific challenge]',
      myrole:'[TBD]',
      decisions:[], outcome:[], outcomeNote:'Outcome [TBD].',
      sims:['command','vf-demo'],
      lesson:'In infrastructure products, reliability is part of the core user experience.'
    },
    {
      id:'uplive', num:'04', title:'Building engagement and monetisation in a live-streaming ecosystem',
      company:'Uplive', industry:'Consumer social · live streaming · creator economy',
      role:'Head of Product', period:'[TBD]', markets:'[TBD]', team:'[TBD]',
      context:'A multi-sided ecosystem of viewers, creators, virtual gifts, live interaction, creator incentives and communities. Growth needs both audience engagement and creator success.',
      problem:'New users rarely found a reason to come back. Onboarding, discovery, gifting and creator incentives all had to work together for retention to move.',
      myrole:'[TBD]',
      decisions:[], outcome:['uplive-ret','uplive-rev','uplive-onb'],
      outcomeNote:'Reported outcomes; definitions and measurement windows to be confirmed.',
      sims:['live','up-demo'],
      lesson:'Retention improves when users repeatedly experience meaningful value, not when a product sends more notifications.'
    },
    {
      id:'ghn', num:'05', title:'Transforming delivery reliability through product and operational systems',
      company:'Giaohangnhanh', industry:'Logistics · last-mile delivery · operations technology',
      role:'[TBD]', period:'[TBD]', markets:'Vietnam', team:'[TBD]',
      context:'Last-mile delivery runs through warehouses, sorting centres, dispatch and couriers. A delay at any stage becomes a late order at the door.',
      problem:'[TBD: the specific challenge]',
      myrole:'[TBD]',
      decisions:[], outcome:['ghn-otd'], outcomeNote:'Reported outcome; definition, scope and period to be confirmed.',
      sims:['logistics','ghn-demo'],
      lesson:'Operational excellence comes from improving the system, not asking people to work harder.'
    },
    {
      id:'vinmart', num:'06', title:'Improving retail customer experience through product thinking',
      company:'Vinmart', industry:'Retail · omnichannel commerce · customer experience',
      role:'[TBD]', period:'[TBD]', markets:'Vietnam', team:'[TBD]',
      context:'A supermarket experience is the sum of discovery, stock, checkout, service, fulfilment and loyalty, in store and online.',
      problem:'[TBD: the specific challenge]',
      myrole:'[TBD]',
      decisions:[], outcome:['vinmart-sat'], outcomeNote:'Reported outcome; the scale must be confirmed before calling it NPS.',
      sims:['retail'],
      lesson:'Customer experience is the cumulative result of many small operational and product decisions.'
    }
  ],

  /* ---------------- THINKING ---------------- */
  monuments: [
    { t:'Product Strategy', c:'#38BDF8', pr:'Decide where to win, and where you are willing to lose.',
      items:['Strategy frame: Minimum to Compete · Willing to Lose At · What We Win At','PMF and Product Ownership frameworks: POs own outcomes, not backlogs','Admin-toggle framework: when a feature earns an on/off switch'] },
    { t:'Growth & Monetisation', c:'#F59E0B', pr:'One north star, honest ownership, and experiments you can read.',
      items:['One north-star metric the whole team can move','Every team owns one measurable metric','Four locks before any ticket: baseline, root cause, alternatives, threshold','Reward only paid actions; freeze eligibility at assignment','If a change is clearly better, ship it without a test'] },
    { t:'AI & Automation', c:'#22D3EE', pr:'AI reviews and drafts. Humans decide.',
      items:['Judgement made explicit as a versioned rubric','A crew with narrow roles: monitor, investigate, gate','Every human decision becomes learning for the agents'] },
    { t:'Team & Organisation', c:'#10B981', pr:'Build a team that does not depend on me.',
      items:['Career ladder E1 → D2 with IC and leadership tracks; goals must hold two quarters','Four-week PO onboarding and a real data assignment','Data Thinking Field Manual: five modules, three real cases','One 60-minute weekly for the whole product organisation','#BeClear: specific, short, simple, obvious','Organising the company\'s first hackathon'] }
  ],

  bio: '[TBD: 80–120 words in David\'s voice.] Product Director who has led product across EV charging, live streaming, logistics, retail and iGaming, and who now builds AI agent crews into how product teams work.',
  timeline: [
    { company:'Vinmart', role:'[TBD]', years:'[TBD]', acc:'#38BDF8' },
    { company:'Giaohangnhanh', role:'[TBD]', years:'[TBD]', acc:'#FB923C' },
    { company:'Uplive', role:'Head of Product', years:'[TBD]', acc:'#F472B6' },
    { company:'VinFast / V-Green', role:'Product Director, Charging Services Software', years:'[TBD]', acc:'#34D399' },
    { company:'AmpUp', role:'Head of Product', years:'[TBD]', acc:'#10B981' },
    { company:'S5 Tech', role:'Product Director', years:'[TBD] – present', acc:'#F59E0B' }
  ],
  timelineNote:'Order is a placeholder until dates are confirmed.'
};
