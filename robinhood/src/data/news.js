const NEWS = {
  AAPL: [
    { id: 1, headline: 'Apple unveils M4 chip with breakthrough neural engine, 40% faster than M3', source: 'Bloomberg', time: '15m ago' },
    { id: 2, headline: 'iPhone shipments beat Wall Street estimates as demand surges in Asia', source: 'Reuters', time: '1h ago' },
    { id: 3, headline: "Apple's services revenue hits all-time high, Wall Street raises price targets", source: 'CNBC', time: '2h ago' },
    { id: 4, headline: 'Apple Vision Pro 2 reportedly enters mass production ahead of schedule', source: 'WSJ', time: '5h ago' },
  ],
  TSLA: [
    { id: 1, headline: 'Tesla Cybertruck deliveries accelerate as production costs decline sharply', source: 'Reuters', time: '22m ago' },
    { id: 2, headline: 'Tesla FSD v13 achieves 99.9% intervention-free mile milestone in testing', source: 'Bloomberg', time: '1h ago' },
    { id: 3, headline: 'Tesla energy storage business posts record quarter, Megapack backlog grows', source: 'CNBC', time: '3h ago' },
    { id: 4, headline: 'Elon Musk confirms $25,000 Tesla model on track for 2025 production', source: 'MarketWatch', time: '5h ago' },
  ],
  GOOGL: [
    { id: 1, headline: 'Google Gemini 2.0 outperforms GPT-4o on reasoning and coding benchmarks', source: 'TechCrunch', time: '30m ago' },
    { id: 2, headline: 'Alphabet ad revenue surges 18% as AI-powered search boosts click-through rates', source: 'Bloomberg', time: '2h ago' },
    { id: 3, headline: 'Google Cloud crosses $40B annual run rate, gaining enterprise share from AWS', source: 'CNBC', time: '3h ago' },
    { id: 4, headline: 'YouTube Premium hits 100M subscribers, ad revenue overtakes traditional TV', source: 'Reuters', time: '6h ago' },
  ],
  AMZN: [
    { id: 1, headline: 'Amazon AWS launches Trainium3 AI chips, undercutting Nvidia H100 pricing by 40%', source: 'Bloomberg', time: '45m ago' },
    { id: 2, headline: 'Prime membership crosses 250M globally as same-day delivery expands', source: 'Reuters', time: '2h ago' },
    { id: 3, headline: 'Amazon pharmacy grows 3x year-over-year, threatening CVS and Walgreens', source: 'WSJ', time: '4h ago' },
    { id: 4, headline: 'Project Kuiper satellite internet begins beta testing in 12 countries', source: 'CNBC', time: '7h ago' },
  ],
  MSFT: [
    { id: 1, headline: 'Microsoft Copilot adoption surpasses 1M enterprise seats ahead of forecast', source: 'Bloomberg', time: '20m ago' },
    { id: 2, headline: 'Azure revenue grows 33% as AI workloads drive unprecedented cloud spending', source: 'CNBC', time: '1h ago' },
    { id: 3, headline: 'Microsoft and OpenAI expand partnership with $10B investment and new exclusivity terms', source: 'WSJ', time: '3h ago' },
    { id: 4, headline: 'Xbox Game Pass crosses 35M subscribers, gaming division turns profitable', source: 'Reuters', time: '5h ago' },
  ],
  NVDA: [
    { id: 1, headline: 'Nvidia Blackwell GPU demand exceeds supply by 10x, Jensen Huang confirms', source: 'Bloomberg', time: '8m ago' },
    { id: 2, headline: 'Nvidia data center revenue triples year-over-year in record-breaking quarter', source: 'Reuters', time: '1h ago' },
    { id: 3, headline: 'TSMC gives Nvidia priority 3nm allocation through end of 2025', source: 'CNBC', time: '2h ago' },
    { id: 4, headline: 'Nvidia CUDA ecosystem cements AI dominance, AMD struggles to compete on software', source: 'TechCrunch', time: '4h ago' },
  ],
  META: [
    { id: 1, headline: 'Meta AI assistant reaches 500M monthly active users, fastest product in company history', source: 'Bloomberg', time: '35m ago' },
    { id: 2, headline: 'Instagram ad revenue overtakes Facebook for first time, targeting improvements cited', source: 'Reuters', time: '1h ago' },
    { id: 3, headline: 'Ray-Ban Meta smart glasses sell out globally, waitlist exceeds 2M', source: 'CNBC', time: '3h ago' },
    { id: 4, headline: 'Threads hits 200M daily active users as X continues to lose advertisers', source: 'TechCrunch', time: '5h ago' },
  ],
  NFLX: [
    { id: 1, headline: 'Netflix adds 9M subscribers in Q3, ad-supported tier now 40% of new signups', source: 'Bloomberg', time: '50m ago' },
    { id: 2, headline: 'Netflix live sports strategy pays off as NFL games draw record 30M viewers', source: 'Reuters', time: '2h ago' },
    { id: 3, headline: 'Netflix gaming reaches 10M daily players, turning into serious revenue stream', source: 'CNBC', time: '3h ago' },
    { id: 4, headline: 'Netflix raises prices again, analysts say pricing power reflects content moat', source: 'WSJ', time: '6h ago' },
  ],
  AMD: [
    { id: 1, headline: 'AMD MI300X AI accelerator wins Microsoft Azure contract worth $1.5B', source: 'Bloomberg', time: '40m ago' },
    { id: 2, headline: 'AMD Ryzen 9000 series dominates gaming benchmarks, Intel loses laptop share', source: 'TechCrunch', time: '1h ago' },
    { id: 3, headline: 'AMD data center GPU market share climbs to 15%, up from just 6% last year', source: 'Reuters', time: '3h ago' },
    { id: 4, headline: 'AMD acquires AI software startup to accelerate ROCm ecosystem development', source: 'CNBC', time: '5h ago' },
  ],
  COIN: [
    { id: 1, headline: 'Coinbase trading volume hits 2-year high as Bitcoin surges past key levels', source: 'Bloomberg', time: '18m ago' },
    { id: 2, headline: 'Coinbase Base layer-2 network processes 10M daily transactions, revenue soars', source: 'Reuters', time: '1h ago' },
    { id: 3, headline: 'Coinbase wins regulatory approval to expand operations across 5 European markets', source: 'CNBC', time: '2h ago' },
    { id: 4, headline: 'Coinbase institutional custody assets double to $200B amid crypto rally', source: 'WSJ', time: '4h ago' },
  ],
  SPOT: [
    { id: 1, headline: 'Spotify Premium subscribers cross 260M, gross margin hits record 28%', source: 'Bloomberg', time: '25m ago' },
    { id: 2, headline: 'Spotify AI DJ becomes most-used playlist feature, time spent listening up 20%', source: 'TechCrunch', time: '1h ago' },
    { id: 3, headline: 'Spotify audiobooks division growing 3x faster than music, per management', source: 'Reuters', time: '3h ago' },
    { id: 4, headline: 'Spotify reports first-ever profitable quarter after years of cost restructuring', source: 'WSJ', time: '5h ago' },
  ],
  UBER: [
    { id: 1, headline: 'Uber trips cross 10B annually for first time as ride-share demand normalizes', source: 'Bloomberg', time: '55m ago' },
    { id: 2, headline: 'Uber Eats gains market share in top metros as DoorDash struggles with profitability', source: 'Reuters', time: '2h ago' },
    { id: 3, headline: 'Uber Freight emerges as fastest-growing division, logistics giants take notice', source: 'CNBC', time: '3h ago' },
    { id: 4, headline: 'Uber autonomous vehicle partnership with Waymo expanding to 10 cities by year-end', source: 'TechCrunch', time: '6h ago' },
  ],
  DIS: [
    { id: 1, headline: "Disney+ reaches streaming profitability milestone, Bob Iger's turnaround on track", source: 'Bloomberg', time: '42m ago' },
    { id: 2, headline: 'Disney theme parks post record quarter as experience economy shows no signs of slowing', source: 'Reuters', time: '1h ago' },
    { id: 3, headline: 'Marvel Cinematic Universe reboot slate announced, fans react positively online', source: 'CNBC', time: '4h ago' },
    { id: 4, headline: 'Disney acquires Fubo TV to dominate sports streaming, combining with ESPN+', source: 'WSJ', time: '6h ago' },
  ],
  PYPL: [
    { id: 1, headline: 'PayPal Fastlane checkout boosts merchant conversion rates by 80% in pilot', source: 'Bloomberg', time: '38m ago' },
    { id: 2, headline: 'PayPal AI-powered fraud detection saves merchants an estimated $2B annually', source: 'Reuters', time: '2h ago' },
    { id: 3, headline: 'Venmo revenue grows 25% as peer-to-peer payments become mainstream for Gen Z', source: 'CNBC', time: '3h ago' },
    { id: 4, headline: 'PayPal stablecoin PYUSD transaction volume surges 300% in Q3', source: 'WSJ', time: '5h ago' },
  ],
  SQ: [
    { id: 1, headline: 'Block Square platform adds 50,000 new merchants in Q3, SMB market share grows', source: 'Bloomberg', time: '28m ago' },
    { id: 2, headline: 'Cash App monthly active users hit 57M, BNPL feature driving monetization', source: 'Reuters', time: '1h ago' },
    { id: 3, headline: 'Block Bitcoin revenue rebounds sharply as crypto market enters bull cycle', source: 'CNBC', time: '3h ago' },
    { id: 4, headline: 'Square launches AI inventory management for small businesses, early reviews strong', source: 'TechCrunch', time: '5h ago' },
  ],
};

export function getNews(ticker) {
  return NEWS[ticker] ?? [];
}
