const fs = require('fs');
const path = require('path');

// Resolver configuración
let accountArg = process.argv[2] || 'jor_vernuccio';
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
const AD_ACCOUNT_ID = config.AD_ACCOUNT_ID;

// ID de la campaña activa que acabamos de crear para Jorgelina
const CAMPAIGN_ID = "120250905860530560"; 

function extractConversations(actions) {
  if (!actions) return 0;
  // Prioridad 1: Conversaciones respondidas
  const replied = actions.find(a => a.action_type === 'onsite_conversion.messaging_conversation_replied_7d');
  if (replied) return parseInt(replied.value || 0, 10);
  
  // Prioridad 2: Conexión total de mensajería (total messaging connection)
  const conn = actions.find(a => a.action_type === 'onsite_conversion.total_messaging_connection');
  if (conn) return parseInt(conn.value || 0, 10);
  
  // Prioridad 3: Primera respuesta (messaging first reply)
  const firstReply = actions.find(a => a.action_type === 'onsite_conversion.messaging_first_reply');
  if (firstReply) return parseInt(firstReply.value || 0, 10);
  
  // Prioridad 4: Conversación iniciada
  const started = actions.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d');
  if (started) return parseInt(started.value || 0, 10);

  return 0;
}

function extractLinkClicks(actions) {
  if (!actions) return 0;
  const lc = actions.find(a => a.action_type === 'link_click');
  return lc ? parseInt(lc.value || 0, 10) : 0;
}

async function getInsights() {
  try {
    console.log("=========================================");
    console.log("📊 ESTADÍSTICAS EN REAL-TIME: META ADS");
    console.log("=========================================");
    console.log(`Campaña ID: ${CAMPAIGN_ID}`);
    console.log("Obteniendo métricas acumuladas de este mes...\n");

    // 1. Obtener métricas a nivel Campaña
    const campaignUrl = `https://graph.facebook.com/v19.0/${CAMPAIGN_ID}/insights?fields=spend,impressions,reach,clicks,ctr,cpc,actions&date_preset=this_month&access_token=${ACCESS_TOKEN}`;
    const campaignRes = await fetch(campaignUrl);
    const campaignJson = await campaignRes.json();

    if (campaignJson.error) {
      throw new Error(campaignJson.error.message);
    }

    if (!campaignJson.data || campaignJson.data.length === 0) {
      console.log("ℹ️ La campaña aún no ha registrado impresiones ni gasto hoy (está recién aprobada/en revisión).");
      console.log("Vuelve a ejecutar este script en unas horas cuando empiece a circular.\n");
      return;
    }

    const cData = campaignJson.data[0];
    const spend = parseFloat(cData.spend || 0);
    const impressions = parseInt(cData.impressions || 0, 10);
    const reach = parseInt(cData.reach || 0, 10);
    const clicks = parseInt(cData.clicks || 0, 10);
    const ctr = parseFloat(cData.ctr || 0);
    const cpc = parseFloat(cData.cpc || 0);

    // Buscar conversaciones y clics de salida
    const conversations = extractConversations(cData.actions);
    const linkClicks = extractLinkClicks(cData.actions);

    console.log("📈 RESUMEN DE LA CAMPAÑA:");
    console.log(`💵 Gasto total: $${spend.toFixed(2)} ARS`);
    console.log(`👁️ Visualizaciones (Impresiones): ${impressions}`);
    console.log(`👤 Alcance (Personas únicas): ${reach}`);
    console.log(`🖱️ Clics en el anuncio (totales): ${clicks}`);
    console.log(`🔗 Clics que abrieron WhatsApp (Salidas): ${linkClicks}`);
    console.log(`🎯 Porcentaje de Clics (CTR): ${ctr.toFixed(2)}%`);
    console.log(`💰 Costo por Clic (CPC): $${cpc.toFixed(2)} ARS`);
    console.log(`💬 Chats de WhatsApp Efectivos: ${conversations}`);
    if (conversations > 0) {
      console.log(`💸 Costo por Conversación Efectiva: $${(spend / conversations).toFixed(2)} ARS`);
    }
    console.log("-----------------------------------------");

    // 2. Obtener desglose por anuncios
    console.log("\n🔍 RENDIMIENTO POR ANUNCIO:");
    const adsUrl = `https://graph.facebook.com/v19.0/${CAMPAIGN_ID}/insights?level=ad&fields=ad_name,spend,impressions,reach,clicks,ctr,cpc,actions&date_preset=this_month&access_token=${ACCESS_TOKEN}`;
    const adsRes = await fetch(adsUrl);
    const adsJson = await adsRes.json();

    if (adsJson.data && adsJson.data.length > 0) {
      adsJson.data.forEach((ad, i) => {
        const adSpend = parseFloat(ad.spend || 0);
        const adImpressions = parseInt(ad.impressions || 0, 10);
        const adClicks = parseInt(ad.clicks || 0, 10);
        const adCtr = parseFloat(ad.ctr || 0);
        
        const adConversations = extractConversations(ad.actions);
        const adLinkClicks = extractLinkClicks(ad.actions);

        console.log(`\n[${i + 1}] Anuncio: "${ad.ad_name}"`);
        console.log(`   └─ Gasto: $${adSpend.toFixed(2)} ARS`);
        console.log(`   └─ Impresiones: ${adImpressions} | Clics: ${adClicks}`);
        console.log(`   └─ Redirecciones a WhatsApp: ${adLinkClicks}`);
        console.log(`   └─ Chats WhatsApp Efectivos: ${adConversations}`);
      });
    } else {
      console.log("No hay desglose de anuncios disponible todavía.");
    }
    console.log("\n=========================================");

  } catch (error) {
    console.error(`❌ Error al obtener estadísticas: ${error.message}`);
  }
}

getInsights();
