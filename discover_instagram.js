const ACCESS_TOKEN = "EAAOCXeSxZAZCcBRiBBsymh4Y5gECxCtYVSZCZAbAC9V3Q3r93HDHET1dLngFW6bx0cztLttxI75KBH8yZC3sV7opXo7dbv6bqgFEsqM7YpDKZBMYiGchbzBLLFroi6N1DjeOkasWIP354XDdCMug8NW4wtWSTdmRptWsQ3iAawWqU7zTOnvA7eOPNiNHYRB6xtOHTtzfZCqT7LLyTTMtDpiZCV2wApmrrVLyuGCX3rqS6FC6cFLe2TScPW7Cj81XBeDcVdFDsUcHdyX4rKdVdoTuX5wZD";

async function runAll() {
  try {
    console.log("=== 1. VALIDANDO TOKEN ===");
    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${ACCESS_TOKEN}`);
    const meData = await meRes.json();
    console.log("Usuario:", meData);
    
    console.log("\n=== 2. PERMISOS ACTIVOS ===");
    const permRes = await fetch(`https://graph.facebook.com/v19.0/me/permissions?access_token=${ACCESS_TOKEN}`);
    const permData = await permRes.json();
    if (permData.data) {
      permData.data.forEach(p => console.log(`- ${p.permission}: ${p.status}`));
    }
    
    console.log("\n=== 3. BUSCANDO PÁGINAS DE FACEBOOK ===");
    const accountsRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${ACCESS_TOKEN}`);
    const accountsData = await accountsRes.json();
    
    if (accountsData.error) {
      console.error("Error al obtener páginas:", accountsData.error);
      return;
    }
    
    if (!accountsData.data || accountsData.data.length === 0) {
      console.log("⚠️ No se encontraron páginas de Facebook vinculadas a este token.");
      console.log("Esto significa que la API no tiene acceso a ninguna página.");
      return;
    }
    
    console.log(`Se encontraron ${accountsData.data.length} páginas.`);
    for (const page of accountsData.data) {
      console.log(`\n- Página: "${page.name}" (ID: ${page.id})`);
      const pageUrl = `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account,name&access_token=${ACCESS_TOKEN}`;
      const pageRes = await fetch(pageUrl);
      const pageData = await pageRes.json();
      
      if (pageData.instagram_business_account) {
        console.log(`   ✅ Cuenta de Instagram vinculada encontrada!`);
        console.log(`   Instagram Business Account ID: ${pageData.instagram_business_account.id}`);
      } else {
        console.log(`   ❌ No tiene cuenta de Instagram Business vinculada.`);
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

runAll();
