const ACCESS_TOKEN = "EAAOCXeSxZAZCcBRqY7tmGyc0jFWxedW6aFP3yXV8kilO33aBny9YfWMYhxiVcWWW92WSiDl7PlEWrEMdZCCkcZAYevYwhK5oUfiyOMJ7mrF9x5yRdFcqx0PbiOiLltFWURK4xaL8FfKKMghQ87frRikI9nj9TomeZABAc67abMn6BVuoFExJJ19R1CBUE3WkdCqmXVwFLZBk2ZA1xc9TV9jfSiHYx8VwI8znMWYjgZDZD";
const PAGE_ID = "406051269418159";

async function runFB() {
  try {
    console.log("=== 1. OBTIENEN INFO DE LA PÁGINA ===");
    const pageRes = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}?fields=name,username,fan_count,followers_count,picture{url}&access_token=${ACCESS_TOKEN}`);
    const pageData = await pageRes.json();
    console.log("Página:", pageData);
    
    console.log("\n=== 2. PROBANDO FEED (ÚLTIMOS 5 POSTS) ===");
    const feedRes = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed?fields=id,message,created_time,shares,likes.summary(true).limit(0),comments.summary(true).limit(0),reactions.summary(true).limit(0),permalink_url,full_picture,attachments{media_type,type}&limit=5&access_token=${ACCESS_TOKEN}`);
    const feedData = await feedRes.json();
    
    if (feedData.error) {
      console.error("Error en feed:", feedData.error);
      return;
    }
    
    if (feedData.data) {
      feedData.data.forEach((post, i) => {
        console.log(`\nPost #${i+1}:`);
        console.log("- ID:", post.id);
        console.log("- Texto:", post.message ? post.message.substring(0, 50) + "..." : "(Sin texto)");
        console.log("- Fecha:", post.created_time);
        console.log("- Likes Total:", post.likes?.summary?.total_count || 0);
        console.log("- Reactions Total:", post.reactions?.summary?.total_count || 0);
        console.log("- Comments Total:", post.comments?.summary?.total_count || 0);
        console.log("- Shares:", post.shares ? post.shares.count : 0);
        console.log("- Link:", post.permalink_url);
        console.log("- Attachments:", JSON.stringify(post.attachments));
      });
    } else {
      console.log("No se devolvió data.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

runFB();
