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
    { id:'ghn-otd', label:'On-time delivery, best in market at the time', display:'99.6%', company:'Giao Hàng Nhanh', period:'[TBD]', definition:'On-time delivery rate; started near 46%', type:'reported', source:'David', verified:true, publishApproved:true },
    { id:'ghn-orders', label:'Orders per day', display:'300 → 30k', company:'Giao Hàng Nhanh', period:'[TBD]', definition:'Daily orders, when David joined vs at scale', type:'reported', source:'David', verified:true, publishApproved:true },
    { id:'ghn-cd', label:'Delivery centres nationwide', display:'3 → 64', company:'Giao Hàng Nhanh', period:'[TBD]', definition:'Centres across Vietnam, when David joined vs at scale', type:'reported', source:'David', verified:true, publishApproved:true },
    { id:'uplive-pay', label:'Paying-user rate vs Bigo', display:'5×', company:'Uplive', period:'[TBD]', definition:'Paying-user rate compared with Bigo', type:'reported', source:'David', verified:true, publishApproved:true },
    { id:'uplive-countries', label:'Countries live', display:'50+', company:'Uplive', period:'Today', definition:'Countries where the app operates', type:'reported', source:'David', verified:true, publishApproved:true },
    { id:'vinmart-sat', label:'Customer score', display:'4.5 → 8.0', company:'Vinmart', period:'[TBD]', definition:'[TBD: scale; not labelled NPS until confirmed]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'ampup-releases', label:'Product releases', display:'40+', company:'AmpUp', period:'[TBD]', definition:'Count of shipped releases', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'ampup-support', label:'Support reduction', display:'−30%', company:'AmpUp', period:'[TBD]', definition:'[TBD: tickets per session or absolute?]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'uplive-ret', label:'Retention', display:'<1% → ~10%', company:'Uplive', period:'[TBD]', definition:'[TBD: which retention (D7? D30?), which cohort]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false },
    { id:'uplive-onb', label:'Onboarding retention', display:'+30%', company:'Uplive', period:'[TBD]', definition:'[TBD: relative or points?]', type:'reported', source:'David, self-reported', verified:false, publishApproved:false }
  ],
  heroMetrics: ['ghn-otd','ghn-orders','ghn-cd','uplive-pay','uplive-countries','ampup-rev'],

  /* ---------------- ISLANDS ---------------- */
  islands: [
    { id:'s5', name:'S5 Tech', sub:'AI agent crew', acc:'#F59E0B', acc2:'#22D3EE', kind:'s5', sim:'crew' },
    { id:'ampup', name:'AmpUp', sub:'EV charging', acc:'#10B981', acc2:'#22D3EE', kind:'ev', sim:'ev-network' },
    { id:'vinfast', name:'VinFast / V-Green', sub:'Charging infrastructure', acc:'#34D399', acc2:'#38BDF8', kind:'grid', sim:'ev-network' },
    { id:'uplive', name:'Uplive', sub:'Live streaming', acc:'#F472B6', acc2:'#8B5CF6', kind:'live', sim:'uplive-lang' },
    { id:'ghn', name:'Giao Hàng Nhanh', sub:'Logistics', acc:'#FB923C', acc2:'#38BDF8', kind:'logi', sim:'ghn-scale' },
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
      id:'ampup', num:'02', title:'Scaling an EV charging network that drivers can rely on',
      company:'AmpUp', industry:'EV charging · climate tech · SaaS · marketplace',
      role:'Head of Product', period:'[TBD]', markets:'[TBD]', team:'[TBD]',
      context:'AmpUp connects charging hardware, station operators, property owners and EV drivers through one cloud platform. Growth depends on two things at once: more chargers for drivers, and a network that works every time they plug in.',
      problem:'Building chargers one site at a time is slow and capital-heavy, but a network that grows faster than it can be run loses drivers to failed sessions, broken chargers and payment trouble at the post.',
      myrole:'[TBD: scope of ownership and team]',
      decisions:[
        { t:'Swarm onto the biggest hub in new markets', opts:'Build our own chargers first, or connect to the largest local network', choice:'Connect by roaming to the biggest local hub, then build selectively', why:'Drivers get a large network on day one, and we learn where demand really is before spending capital.', trade:'Less control over partner hardware and experience.' },
        { t:'Own and run key markets from the cloud', opts:'Rely on operators to maintain chargers, or control the network centrally', choice:'In-house network, monitored and controlled by AI from the cloud', why:'Predict demand, route drivers to a free working charger, spot faults and reset them remotely, so uptime and experience stay above the market standard.', trade:'Higher build and operating cost per site.' },
        { t:'Wallet charging', opts:'App + QR + card at the post, or one wallet that authorises in the background', choice:'Plug in and charge; the wallet pays', why:'Removes failed starts and waiting at the charger, the moments drivers remember most.', trade:'Wallet and top-up flows to build and support.' }
      ],
      outcome:['ampup-rev','ampup-releases','ampup-support'],
      outcomeNote:'Reported outcomes during my tenure, not attributed to individual features.',
      sims:['ev-network','ev','ev-demo'],
      lesson:'Growth is not simply acquiring more users. It is building a reliable system that repeatedly delivers value.'
    },
    {
      id:'vinfast', num:'03', title:'Expanding EV charging across markets: partner fast, own where it matters',
      company:'VinFast / V-Green', industry:'Electric mobility · charging infrastructure · international expansion',
      role:'Product Director, Charging Services Software', period:'[TBD]', markets:'Vietnam · Indonesia · Philippines · India', team:'[TBD]',
      context:'Charging infrastructure only works when drivers, chargers, operators, payments, roaming partners and operations act as one system, coordinated from the cloud.',
      problem:'Scale a charging service into several countries quickly, while keeping the driver experience at home above the market standard.',
      myrole:'[TBD]',
      decisions:[
        { t:'Two expansion modes', opts:'One model everywhere, or a model per market type', choice:'New markets: connect to the largest local hub and scale through roaming. Key markets: in-house network controlled by AI.', why:'Speed where we are new, control where our reputation is made.', trade:'Two operating models to run.' },
        { t:'Cloud control centre', opts:'Fix chargers when drivers complain, or watch every charger live', choice:'Every session and charger reports to the cloud; AI routes drivers and triggers remote resets', why:'Problems get fixed before drivers arrive at a broken charger.', trade:'Investment in telemetry and operations tooling.' },
        { t:'Wallet charging', opts:'Card at every post, or one wallet', choice:'One wallet across own and partner chargers', why:'Drivers charge without struggle or waiting, wherever they are.', trade:'Roaming settlement behind the scenes.' }
      ],
      outcome:[], outcomeNote:'Outcome metrics [TBD].',
      sims:['ev-network','command','vf-demo'],
      lesson:'In infrastructure products, reliability is part of the core user experience.'
    },
    {
      id:'uplive', num:'04', title:'Scaling a live-streaming app by language, not by country',
      company:'Uplive', industry:'Consumer social · live streaming · creator economy',
      role:'Head of Product', period:'[TBD]', markets:'50+ countries today', team:'[TBD]',
      context:'A multi-sided ecosystem of viewers, creators, virtual gifts and live interaction. Growth needs audiences, creators and paying users to arrive together.',
      problem:'Launching country by country is slow and expensive, and the largest single markets take the longest to prove. Growth also had to be profitable, which meant paying users, not just installs.',
      myrole:'[TBD]',
      decisions:[
        { t:'Expand by language, not by country', opts:'Enter one big country at a time, or release per language', choice:'One Chinese-language release tested Hong Kong, Taiwan and Malaysia together instead of waiting on mainland China', why:'Many markets are tested for the cost of one, and the data shows where to go deeper.', trade:'Less local tailoring in the first release.' },
        { t:'Invest by country only when ROI shows', opts:'Spread budget evenly, or follow the return', choice:'Measure each market\'s return; invest more where it is highest', why:'Capital goes to proven markets.', trade:'Some markets stay under-served at first.' },
        { t:'Optimise traffic for payers', opts:'Buy the cheapest installs, or the sources that bring paying users', choice:'Shift spend to the traffic sources with the highest pay rate', why:'Pay rate about 5× Bigo\'s made scaling faster and more profitable.', trade:'Higher cost per install on some channels.' }
      ],
      outcome:['uplive-pay','uplive-countries','uplive-ret','uplive-rev','uplive-onb'],
      outcomeNote:'Reported outcomes. Definitions for retention and revenue to be confirmed.',
      sims:['uplive-lang','live','up-demo'],
      lesson:'Retention improves when users repeatedly experience meaningful value, not when a product sends more notifications.'
    },
    {
      id:'ghn', num:'05', title:'From 3 centres to 64: scaling delivery without losing on-time',
      company:'Giao Hàng Nhanh', industry:'Logistics · last-mile delivery · operations technology',
      role:'[TBD]', period:'[TBD]', markets:'Vietnam, nationwide', team:'[TBD]',
      context:'Last-mile delivery runs through sort hubs, line-haul, delivery centres and couriers. A delay at any step becomes a late order at the customer\'s door.',
      problem:'When I joined, the network had 3 delivery centres and about 300 orders a day. The business needed to go nationwide and grow a hundredfold without on-time delivery falling apart.',
      myrole:'[TBD]',
      decisions:[
        { t:'Make every step visible', opts:'Track only delivered or not, or break delivery into small funnel steps', choice:'Every package tracked through each step, from order to confirmation', why:'You can only fix the step you can see.', trade:'More scanning and data discipline in operations.' },
        { t:'Group every failure by reason', opts:'Push couriers to work harder, or find the root cause', choice:'Record every failure reason, group them, fix the biggest group first', why:'System fixes compound; pressure on people does not.', trade:'Slower start while the data was built.' },
        { t:'Borrow from the best', opts:'Invent our own playbook, or adapt Amazon\'s operating practices', choice:'Adapt Amazon\'s practice of per-step metrics, root cause and standard work', why:'Proven at scale, so the team could focus on applying it locally.', trade:'Local conditions needed adaptation.' }
      ],
      outcome:['ghn-otd','ghn-orders','ghn-cd'], outcomeNote:'Reported outcomes. 99.6% on-time was the best in the market at the time; the result helped the company win share and expand.',
      sims:['ghn-scale','logistics','ghn-demo'],
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
    { company:'Giao Hàng Nhanh', role:'[TBD]', years:'[TBD]', acc:'#FB923C' },
    { company:'Uplive', role:'Head of Product', years:'[TBD]', acc:'#F472B6' },
    { company:'VinFast / V-Green', role:'Product Director, Charging Services Software', years:'[TBD]', acc:'#34D399' },
    { company:'AmpUp', role:'Head of Product', years:'[TBD]', acc:'#10B981' },
    { company:'S5 Tech', role:'Product Director', years:'[TBD] – present', acc:'#F59E0B' }
  ],
  timelineNote:'Order is a placeholder until dates are confirmed.'
};
