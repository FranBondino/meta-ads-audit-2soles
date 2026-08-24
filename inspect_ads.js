const fs = require('fs');

function inspectAds() {
  if (!fs.existsSync('ads_fetched.json')) {
    console.log("ads_fetched.json does not exist.");
    return;
  }
  const data = JSON.parse(fs.readFileSync('ads_fetched.json', 'utf8'));
  console.log("Root keys in ads_fetched.json:", Object.keys(data));
  
  if (data.campaignsList) {
    console.log(`\nFound ${data.campaignsList.length} campaigns:`);
    data.campaignsList.forEach(c => {
      console.log(`- Campaign: "${c.name}" (ID: ${c.id}) | Status: ${c.status}`);
      if (c.insights) {
        console.log(`  Spend: $${c.insights.spend} | Clicks: ${c.insights.clicks} | Impressions: ${c.insights.impressions} | CTR: ${c.insights.ctr}% | CPC: $${c.insights.cpc}`);
      }
    });
  }
  
  if (data.adsList) {
    console.log(`\nFound ${data.adsList.length} ads:`);
    console.log("First few ads properties:", Object.keys(data.adsList[0]));
    // Print first 5 ads details
    data.adsList.slice(0, 5).forEach(ad => {
      console.log(`- Ad: "${ad.name}" (ID: ${ad.id}) | Campaign: ${ad.campaign_id}`);
      if (ad.creative) {
        console.log(`  Creative Title: ${ad.creative.title || ad.creative.name}`);
        console.log(`  Body: ${ad.creative.body ? ad.creative.body.substring(0, 80) : 'N/A'}`);
      }
    });
  }
}

inspectAds();
