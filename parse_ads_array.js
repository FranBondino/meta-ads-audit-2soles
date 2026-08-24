const fs = require('fs');

function parseAdsArray() {
  const data = JSON.parse(fs.readFileSync('ads_fetched.json', 'utf8'));
  console.log(`Array length: ${data.length || Object.keys(data).length}`);
  const firstKey = Object.keys(data)[0];
  console.log("First element keys:", Object.keys(data[firstKey]));
  console.log("First element content:", JSON.stringify(data[firstKey], null, 2));
}

parseAdsArray();
