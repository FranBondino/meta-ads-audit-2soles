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
  console.log(`Uso: node discover_all.js [nombre_cuenta | ruta_al_json]`);
  console.log(`Ejemplo: node discover_all.js configs/template.json`);
  process.exit(1);
}

console.log(`📂 Cargando configuración de: ${configPath}`);
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const ACCESS_TOKEN = config.ACCESS_TOKEN;

if (!ACCESS_TOKEN || ACCESS_TOKEN.startsWith('PEGA_AQUI')) {
  console.error("❌ Error: ACCESS_TOKEN inválido o no configurado en el archivo JSON.");
  process.exit(1);
}

async function discover() {
  try {
    console.log("\n==================================================");
    console.log("🔍 AUTODESCUBRIMIENTO DE META: ANALIZANDO TOKEN");
    console.log("==================================================\n");

    // 1. Validar el token y obtener usuario
    console.log("1. Validando Token con Meta...");
    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${ACCESS_TOKEN}`);
    const meData = await meRes.json();
    if (meData.error) {
      throw new Error(`Token inválido o expirado: ${meData.error.message}`);
    }
    console.log(`   ✅ Conectado como: ${meData.name} (ID: ${meData.id})`);

    // 2. Obtener páginas de Facebook y cuentas de Instagram vinculadas
    console.log("\n2. Buscando Páginas de Facebook y Cuentas de Instagram...");
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=name,id,instagram_business_account{id,username,name}&access_token=${ACCESS_TOKEN}`);
    const pagesData = await pagesRes.json();

    if (pagesData.error) {
      console.warn(`   ⚠️ Error al buscar páginas: ${pagesData.error.message}`);
    } else if (!pagesData.data || pagesData.data.length === 0) {
      console.log("   ❌ No se encontraron páginas de Facebook vinculadas.");
    } else {
      console.log(`   Se encontraron ${pagesData.data.length} páginas de Facebook:`);
      pagesData.data.forEach((page, i) => {
        console.log(`   [${i + 1}] Página FB: "${page.name}" (ID: ${page.id})`);
        if (page.instagram_business_account) {
          const ig = page.instagram_business_account;
          console.log(`       └─ ✅ Instagram Business vinculado: "${ig.name || ig.username}" (ID: ${ig.id})`);
        } else {
          console.log("       └─ ❌ Sin cuenta de Instagram Business vinculada.");
        }
      });
    }

    // 3. Obtener cuentas publicitarias (Meta Ads)
    console.log("\n3. Buscando Cuentas Publicitarias (Meta Ads)...");
    const adsRes = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=name,account_id,id,account_status&access_token=${ACCESS_TOKEN}`);
    const adsData = await adsRes.json();

    if (adsData.error) {
      console.warn(`   ⚠️ Error al buscar cuentas publicitarias: ${adsData.error.message}`);
    } else if (!adsData.data || adsData.data.length === 0) {
      console.log("   ❌ No se encontraron cuentas publicitarias vinculadas.");
    } else {
      console.log(`   Se encontraron ${adsData.data.length} cuentas publicitarias:`);
      adsData.data.forEach((ad, i) => {
        console.log(`   [${i + 1}] Ad Account: "${ad.name}" (ID: ${ad.id} | Account ID: ${ad.account_id}) | Estado: ${ad.account_status === 1 ? 'Activa' : 'Inactiva/Pausada'}`);
      });
    }

    console.log("\n==================================================");
    console.log("📋 CÓMO COMPLETAR TU CONFIGURACIÓN:");
    console.log("==================================================");
    console.log("Copia los IDs listados arriba y agrégalos a tu archivo JSON:");
    console.log(`Configuración: ${configPath}`);
    console.log("\nEjemplo de campos a completar:");
    console.log(`"PAGE_ID": "ID_DE_LA_PAGINA_ELEGIDA",`);
    console.log(`"INSTAGRAM_ACCOUNT_ID": "ID_DE_INSTAGRAM_ELEGIDO",`);
    console.log(`"AD_ACCOUNT_ID": "act_ID_DE_CUENTA_PUBLICITARIA"`);
    console.log("==================================================\n");

  } catch (error) {
    console.error(`\n❌ Error de Conexión: ${error.message}`);
  }
}

discover();
