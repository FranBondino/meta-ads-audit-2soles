const fs = require('fs');
const path = require('path');

// Resolver configuración
let accountArg = 'jor_vernuccio';
let configPath = path.join(__dirname, 'configs', 'jor_vernuccio.json');

if (!fs.existsSync(configPath)) {
  console.error(`❌ Archivo de configuración no encontrado en: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const ACCESS_TOKEN = config.ACCESS_TOKEN;
const PAGE_ID = config.PAGE_ID;
const INSTAGRAM_ACCOUNT_ID = config.INSTAGRAM_ACCOUNT_ID;
const AD_ACCOUNT_ID = config.AD_ACCOUNT_ID;

if (!ACCESS_TOKEN || !PAGE_ID || !AD_ACCOUNT_ID) {
  console.error("❌ Error: Asegúrate de tener configurados ACCESS_TOKEN, PAGE_ID y AD_ACCOUNT_ID en jor_vernuccio.json.");
  process.exit(1);
}

async function createDraft() {
  try {
    console.log("=========================================");
    console.log("🚀 CREANDO CAMPAÑA EN BORRADOR EN META ADS");
    console.log("=========================================");
    console.log(`Ad Account: ${AD_ACCOUNT_ID}`);
    console.log(`Página FB: ${PAGE_ID}`);
    console.log(`Instagram: ${INSTAGRAM_ACCOUNT_ID}\n`);

    // 1. Crear Campaña
    console.log("1. Creando Campaña...");
    const campaignUrl = `https://graph.facebook.com/v19.0/${AD_ACCOUNT_ID}/campaigns`;
    const campaignParams = new URLSearchParams({
      name: "[B2B] Leads WhatsApp - Julio 2026 Final",
      objective: "OUTCOME_LEADS",
      daily_budget: "380000", // Presupuesto de $3,800 ARS en la campaña (CBO)
      bid_strategy: "LOWEST_COST_WITHOUT_CAP", // Volumen más alto
      status: "ACTIVE", // Subir en activo y corriendo
      special_ad_categories: "NONE",
      access_token: ACCESS_TOKEN
    });

    const campaignRes = await fetch(`${campaignUrl}?${campaignParams.toString()}`, { method: 'POST' });
    const campaignJson = await campaignRes.json();

    if (campaignJson.error) {
      throw new Error(`Error al crear campaña: ${JSON.stringify(campaignJson.error)}`);
    }

    const campaignId = campaignJson.id;
    console.log(`   ✅ Campaña creada con ID: ${campaignId}`);

    // 2. Crear Ad Set (Conjunto de Anuncios)
    console.log("\n2. Creando Conjunto de Anuncios...");
    const adSetUrl = `https://graph.facebook.com/v19.0/${AD_ACCOUNT_ID}/adsets`;

    // Segmentación geográfica por defecto: Argentina (el usuario la afinará en Ads Manager)
    const targeting = JSON.stringify({
      geo_locations: {
        countries: ["AR"]
      },
      age_min: 30,
      age_max: 55,
      targeting_automation: {
        advantage_audience: 0 // Requerido por la API
      }
    });

    // Fecha de finalización: 31 de Julio de 2026 inclusive (Argentina UTC-3 -> 2026-08-01T03:00:00Z)
    const endTimeUnix = Math.floor(new Date('2026-08-01T03:00:00Z').getTime() / 1000);

    const adSetParams = new URLSearchParams({
      name: "[Público B2B] Rosario - SF - BA (30-55)",
      campaign_id: campaignId,
      billing_event: "IMPRESSIONS",
      optimization_goal: "CONVERSATIONS", // Optimizar conversaciones por WhatsApp
      destination_type: "WHATSAPP", // Envío a WhatsApp Business
      promoted_object: JSON.stringify({ page_id: PAGE_ID }),
      targeting: targeting,
      end_time: endTimeUnix.toString(), // Finaliza el 31 de Julio inclusive
      status: "ACTIVE", // Subir en activo y corriendo
      access_token: ACCESS_TOKEN
    });

    const adSetRes = await fetch(`${adSetUrl}?${adSetParams.toString()}`, { method: 'POST' });
    const adSetJson = await adSetRes.json();

    if (adSetJson.error) {
      throw new Error(`Error al crear Ad Set: ${JSON.stringify(adSetJson.error)}`);
    }

    const adSetId = adSetJson.id;
    console.log(`   ✅ Conjunto de anuncios creado con ID: ${adSetId}`);

    // 3. Crear Anuncios (Ads)
    console.log("\n3. Creando Creativos y Anuncios...");
    const adsToCreate = [
      {
        name: "Anuncio A - Introducción de Servicios",
        type: "REEL",
        instagram_story_id: "17882378526550655", // ID del Reel de presentación
        caption: "Soy Jorgelina Vernuccio y mi propósito es ayudar a las empresas a fortalecer su capital humano..."
      },
      {
        name: "Anuncio B - Carrusel IA y Tecnología",
        type: "CAROUSEL",
        instagram_story_id: "17994223160958807", // ID del Carrusel de tecnología
        caption: "No dejes que la tecnología te pase por encima. 🤖🫶🏽 El cambio está pasando ahora..."
      },
      {
        name: "Anuncio C - Reel Feedback y Errores",
        type: "REEL",
        instagram_story_id: "18102491024108867", // ID del Reel de feedback/comunicación
        caption: "Dos caminos claros ante un error operativo: apelar negativamente a la personalidad del colaborador..."
      }
    ];

    for (let adInfo of adsToCreate) {
      console.log(`   Creando creativo para "${adInfo.name}"...`);
      const creativeUrl = `https://graph.facebook.com/v19.0/${AD_ACCOUNT_ID}/adcreatives`;
      let creativeId = null;

      if (adInfo.type === "CAROUSEL") {
        console.log("      [Carrusel] Obteniendo diapositivas orgánicas de Instagram...");
        try {
          const childrenRes = await fetch(`https://graph.facebook.com/v19.0/${adInfo.instagram_story_id}/children?fields=media_url,media_type&access_token=${ACCESS_TOKEN}`);
          const childrenJson = await childrenRes.json();
          if (childrenJson.error) {
            throw new Error(childrenJson.error.message);
          }

          const slides = childrenJson.data.filter(c => c.media_type === 'IMAGE' || c.media_type === 'VIDEO');
          const titles = ["IA y Tecnología", "El cambio es hoy", "Adaptación digital", "Equipos del futuro", "Consultanos"];
          const child_attachments = slides.map((slide, index) => ({
            link: `https://www.facebook.com/${PAGE_ID}`,
            picture: slide.media_url,
            name: titles[index] || "Consultoría B2B"
          }));

          const creativeParams = {
            name: `Creativo - ${adInfo.name}`,
            object_story_spec: {
              page_id: PAGE_ID,
              instagram_user_id: INSTAGRAM_ACCOUNT_ID,
              link_data: {
                message: adInfo.caption,
                link: `https://www.facebook.com/${PAGE_ID}`,
                call_to_action: { type: "WHATSAPP_MESSAGE" },
                child_attachments: child_attachments
              }
            }
          };

          const creativeRes = await fetch(`${creativeUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...creativeParams,
              access_token: ACCESS_TOKEN
            })
          });
          const creativeJson = await creativeRes.json();
          if (creativeJson.error) {
            throw new Error(creativeJson.error.message);
          }
          creativeId = creativeJson.id;
        } catch (err) {
          console.error(`      ❌ Error al crear creativo del carrusel: ${err.message}`);
          continue;
        }
      } else {
        // Intentar crear el creativo asociando directamente el post de Instagram orgánico (para Reels) con botón de WhatsApp
        try {
          const creativeParams = {
            name: `Creativo - ${adInfo.name}`,
            source_instagram_media_id: adInfo.instagram_story_id,
            instagram_user_id: INSTAGRAM_ACCOUNT_ID,
            object_id: PAGE_ID,
            call_to_action: {
              type: "WHATSAPP_MESSAGE",
              value: {
                app_destination: "WHATSAPP",
                link: "https://api.whatsapp.com/send"
              }
            }
          };

          const creativeRes = await fetch(`${creativeUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...creativeParams,
              access_token: ACCESS_TOKEN
            })
          });
          const creativeJson = await creativeRes.json();
          if (creativeJson.error) {
            throw new Error(creativeJson.error.message);
          }
          creativeId = creativeJson.id;
        } catch (err) {
          console.warn(`      ⚠️ No se pudo vincular el post de IG orgánico directamente (${err.message}).`);
          console.log("      Creando anuncio con borrador de texto alternativo para vinculación manual en el administrador.");
          
          // Crear un creativo tipo "link" alternativo si la vinculación directa falla
          try {
            const altCreativeParams = {
              name: `Borrador Alternativo - ${adInfo.name}`,
              object_story_spec: {
                page_id: PAGE_ID,
                instagram_user_id: INSTAGRAM_ACCOUNT_ID,
                link_data: {
                  message: adInfo.caption,
                  link: `https://www.facebook.com/${PAGE_ID}`,
                  call_to_action: { type: "WHATSAPP_MESSAGE" }
                }
              }
            };
            const altRes = await fetch(`${creativeUrl}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...altCreativeParams,
                access_token: ACCESS_TOKEN
              })
            });
            const altJson = await altRes.json();
            if (altJson.error) {
              throw new Error(altJson.error.message);
            }
            creativeId = altJson.id;
          } catch (altErr) {
            console.error(`      ❌ Error al crear creativo alternativo: ${altErr.message}`);
            continue; // Saltar al siguiente ad
          }
        }
      }

      console.log(`      ✅ Creativo creado con ID: ${creativeId}`);

      // Crear el anuncio asociado al Ad Set y al Creativo
      console.log(`      Creando anuncio para "${adInfo.name}"...`);
      const adUrl = `https://graph.facebook.com/v19.0/${AD_ACCOUNT_ID}/ads`;
      const adParams = new URLSearchParams({
        name: adInfo.name,
        adset_id: adSetId,
        creative: JSON.stringify({ creative_id: creativeId }),
        status: "ACTIVE", // Subir en activo y corriendo
        access_token: ACCESS_TOKEN
      });

      const adRes = await fetch(`${adUrl}?${adParams.toString()}`, { method: 'POST' });
      const adJson = await adRes.json();

      if (adJson.error) {
        console.error(`      ❌ Error al crear el anuncio: ${adJson.error.message}`);
      } else {
        console.log(`      ✅ Anuncio creado con ID: ${adJson.id}`);
      }
    }

    console.log("\n=========================================");
    console.log("🎉 CONFIGURACIÓN EN VIVO COMPLETADA");
    console.log("=========================================");
    console.log("La campaña ha sido subida y activada con éxito.");
    console.log("Los anuncios se encuentran activos y en revisión por Meta.");
    console.log("=========================================");

  } catch (error) {
    console.error(`\n❌ Error crítico: ${error.message}`);
  }
}

createDraft();
