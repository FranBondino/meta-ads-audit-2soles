const fs = require('fs');
const path = require('path');

// Resolver configuración
let accountArg = process.argv[2] || 'dos_soles';
let configPath = accountArg;
if (!accountArg.endsWith('.json')) {
  configPath = path.join(__dirname, 'configs', `${accountArg}.json`);
}

if (!fs.existsSync(configPath)) {
  console.error(`❌ Archivo de configuración no encontrado en: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const ACCESS_TOKEN = config.ACCESS_TOKEN;

// Resolver archivos de ads
let adsSummaryFile = `ads_summary_${accountArg}.json`;
if (accountArg === 'dos_soles' && !fs.existsSync(adsSummaryFile)) {
  adsSummaryFile = 'ads_summary.json';
}

async function fetchPastCampaigns() {
  try {
    const summary = JSON.parse(fs.readFileSync(adsSummaryFile, 'utf8'));
    const campaigns = summary.campaignsList || [];
    console.log(`Analyzing ${campaigns.length} historical campaigns...`);
    
    const results = [];
    
    for (let c of campaigns) {
      console.log(`Fetching insights for "${c.name}" (ID: ${c.id})...`);
      // Query insights for all-time (2025 to 2026)
      const url = `https://graph.facebook.com/v19.0/${c.id}/insights?time_range={"since":"2025-01-01","until":"2026-07-02"}&fields=spend,clicks,impressions,reach,ctr,cpc&access_token=${ACCESS_TOKEN}`;
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.data && json.data.length > 0) {
        const ins = json.data[0];
        results.push({
          id: c.id,
          name: c.name,
          spend: parseFloat(ins.spend || 0),
          clicks: parseInt(ins.clicks || 0, 10),
          impressions: parseInt(ins.impressions || 0, 10),
          reach: parseInt(ins.reach || 0, 10),
          ctr: parseFloat(ins.ctr || 0),
          cpc: parseFloat(ins.cpc || 0)
        });
      } else {
        // No spend or no data
        results.push({
          id: c.id,
          name: c.name,
          spend: 0,
          clicks: 0,
          impressions: 0,
          reach: 0,
          ctr: 0,
          cpc: 0
        });
      }
    }
    
    // Sort by spend descending
    results.sort((a, b) => b.spend - a.spend);
    
    console.log("\n--- HISTORICAL CAMPAIGN PERFORMANCE (Ranked by Spend) ---");
    results.forEach((r, idx) => {
      if (r.spend > 0) {
        console.log(`${idx + 1}. Campaign: "${r.name}" (ID: ${r.id})`);
        console.log(`   Spend: $${r.spend.toFixed(2)} ARS`);
        console.log(`   Impressions: ${r.impressions} | Reach: ${r.reach}`);
        console.log(`   Clicks: ${r.clicks} | CTR: ${r.ctr.toFixed(2)}% | CPC: $${r.cpc.toFixed(2)} ARS`);
      } else {
        console.log(`${idx + 1}. Campaign: "${r.name}" (ID: ${r.id}) -> [No spend recorded in 2025/2026]`);
      }
      console.log();
    });
    
  } catch (err) {
    console.error(err);
  }
}

fetchPastCampaigns();
