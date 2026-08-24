const ACCESS_TOKEN = "EAAOCXeSxZAZCcBRwQmdvOENsKFCYaAltfnpHcmB87YdYsMIpJzPIv3yiUCqE8Dch49LGmfGgXePFWFPjJageaGiI1UQ5ZBFmCWjLwCEpXpwZCAEWznQ6Fg8itOOj6snABieaZClc6Pa5cQEcSfQiR23ObvqQ8EJC9W9wK11WAD71ZAZAXxEeGiKjfcFuQs7HAZDZD";
const INSTAGRAM_ACCOUNT_ID = "17841403287688257";

async function test() {
  try {
    console.log("Fetching latest 5 media items...");
    const res = await fetch(`https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}/media?fields=id,media_type,media_url,caption&limit=5&access_token=${ACCESS_TOKEN}`);
    const json = await res.json();
    
    if (json.error) {
      console.error("Error fetching media list:", json.error);
      return;
    }
    
    for (const post of json.data) {
      console.log(`\nPost ID: ${post.id} | Type: ${post.media_type}`);
      // Try to fetch insights
      let metrics = [];
      if (post.media_type === "VIDEO") {
        metrics = ["impressions", "reach", "saved", "video_views", "plays"];
      } else {
        metrics = ["impressions", "reach", "saved"];
      }
      
      const insightsUrl = `https://graph.facebook.com/v19.0/${post.id}/insights?metric=${metrics.join(",")}&access_token=${ACCESS_TOKEN}`;
      const insightsRes = await fetch(insightsUrl);
      const insightsJson = await insightsRes.json();
      
      if (insightsJson.error) {
        console.log("  Insights Error:", insightsJson.error.message);
      } else {
        console.log("  Insights Data:");
        insightsJson.data.forEach(m => {
          console.log(`    - ${m.name}: ${m.values[0].value}`);
        });
      }
    }
  } catch (err) {
    console.error("Test error:", err);
  }
}

test();
