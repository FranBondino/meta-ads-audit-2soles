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
const INSTAGRAM_ACCOUNT_ID = config.INSTAGRAM_ACCOUNT_ID;

// Resolver nombres de archivos de forma dinámica
let dataFilename = `instagram_data_${accountArg}.json`;
let reportFilename = `reporte_instagram_${accountArg}.html`;

// Fallbacks de compatibilidad para dos_soles
if (accountArg === 'dos_soles') {
  if (!fs.existsSync(path.join(__dirname, `instagram_data_dos_soles.json`)) && fs.existsSync(path.join(__dirname, 'instagram_data.json'))) {
    dataFilename = 'instagram_data.json';
  }
  if (!fs.existsSync(path.join(__dirname, `reporte_instagram_dos_soles.html`)) && fs.existsSync(path.join(__dirname, 'reporte_instagram_dos_soles.html'))) {
    reportFilename = 'reporte_instagram_dos_soles.html';
  }
}

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

async function runAnalysis() {
  const cacheMap = new Map();
  let cachedStats = null;
  
  // 0. Cargar la base de datos local al inicio (Cache local)
  try {
    const cachePath = path.join(__dirname, dataFilename);
    if (fs.existsSync(cachePath)) {
      const cacheRaw = fs.readFileSync(cachePath, 'utf8');
      cachedStats = JSON.parse(cacheRaw);
      if (cachedStats && cachedStats.posts) {
        cachedStats.posts.forEach(p => {
          cacheMap.set(p.id, p);
        });
        console.log(`✅ Base de datos local cargada: ${cachedStats.posts.length} posts.`);
      }
    }
  } catch (cacheError) {
    console.warn("⚠️ No se pudo cargar el caché local:", cacheError.message);
  }

  try {
    console.log("=========================================");
    console.log("INICIANDO ANÁLISIS DE INSTAGRAM: DOS SOLES");
    console.log("=========================================");
    
    // 1. Obtener perfil básico
    console.log("\n[1/4] Obteniendo información de la cuenta...");
    const profileRes = await fetch(`https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}?fields=followers_count,username,name,profile_picture_url&access_token=${ACCESS_TOKEN}`);
    const profile = await profileRes.json();
    if (profile.error) {
      throw new Error(`Error al obtener perfil: ${JSON.stringify(profile.error)}`);
    }
    console.log(`✅ Cuenta: ${profile.name} (@${profile.username})`);
    console.log(`✅ Seguidores: ${profile.followers_count}`);

    // 2. Obtener actividad de seguidores (online_followers)
    console.log("\n[2/4] Obteniendo datos de actividad horaria (online_followers)...");
    const insightsRes = await fetch(`https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}/insights?metric=online_followers&period=lifetime&access_token=${ACCESS_TOKEN}`);
    const insights = await insightsRes.json();
    
    let onlineFollowersRaw = null;
    if (insights.data && insights.data.length > 0) {
      onlineFollowersRaw = insights.data[0].values;
      // Verificar si los datos realmente contienen números (no están vacíos)
      const hasRealData = onlineFollowersRaw.some(v => v.value && Object.keys(v.value).length > 0);
      if (hasRealData) {
        console.log(`✅ Datos de actividad obtenidos con éxito (${onlineFollowersRaw.length} días de histórico).`);
      } else {
        console.log(`⚠️ La API devolvió la estructura de actividad pero vacía (común en modo de desarrollo). Usaremos datos históricos del feed.`);
        onlineFollowersRaw = null;
      }
    } else {
      console.log("⚠️ No se pudo obtener la métrica 'online_followers'. Usaremos estadísticas basadas en posts.");
    }

    // 3. Obtener el feed orgánico (últimos 200 posts)
    console.log("\n[3/4] Descargando publicaciones del feed...");
    let mediaList = [];
    let nextUrl = `https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}/media?fields=id,caption,media_type,media_product_type,timestamp,like_count,comments_count,permalink,media_url&limit=100&access_token=${ACCESS_TOKEN}`;
    
    for (let i = 0; i < 2; i++) {
      if (!nextUrl) break;
      console.log(`   Descargando página ${i + 1}...`);
      const mediaRes = await fetch(nextUrl);
      const mediaJson = await mediaRes.json();
      if (mediaJson.error) {
        console.error("   Error al descargar posts:", mediaJson.error);
        break;
      }
      if (mediaJson.data) {
        mediaList = mediaList.concat(mediaJson.data);
      }
      nextUrl = mediaJson.paging && mediaJson.paging.next ? mediaJson.paging.next : null;
    }
    console.log(`✅ Se obtuvieron ${mediaList.length} publicaciones del feed.`);

    // 3.5. Obtener insights usando batching e incremental fetching
    console.log("\n[3.5] Obteniendo insights detallados para las publicaciones...");
    const postsToFetch = [];
    const now = new Date();

    mediaList.forEach(post => {
      const cached = cacheMap.get(post.id);
      const postDate = new Date(post.timestamp);
      const ageDays = (now - postDate) / (1000 * 60 * 60 * 24);
      
      const needsFetch = !cached || ageDays < 7;
      if (needsFetch) {
        postsToFetch.push(post);
      } else {
        post.insights = {
          reach: cached.insights && cached.insights.reach !== undefined ? cached.insights.reach : null,
          impressions: cached.insights && cached.insights.impressions !== undefined ? cached.insights.impressions : null,
          saved: cached.insights && cached.insights.saved !== undefined ? cached.insights.saved : null,
          video_views: cached.insights && cached.insights.video_views !== undefined ? cached.insights.video_views : null,
          plays: cached.insights && cached.insights.plays !== undefined ? cached.insights.plays : null,
          ig_reels_video_view_total_time: cached.insights && cached.insights.ig_reels_video_view_total_time !== undefined ? cached.insights.ig_reels_video_view_total_time : null,
          ig_reels_avg_watch_time: cached.insights && cached.insights.ig_reels_avg_watch_time !== undefined ? cached.insights.ig_reels_avg_watch_time : null
        };
      }
    });

    console.log(`   Total de posts para actualizar insights: ${postsToFetch.length} de ${mediaList.length}`);

    const setDefaultInsights = (post) => {
      post.insights = {
        reach: null,
        impressions: null,
        saved: null,
        video_views: null,
        plays: null,
        ig_reels_video_view_total_time: null,
        ig_reels_avg_watch_time: null
      };
    };

    const chunkSize = 50;
    for (let i = 0; i < postsToFetch.length; i += chunkSize) {
      const chunk = postsToFetch.slice(i, i + chunkSize);
      console.log(`   Procesando lote de insights ${Math.floor(i / chunkSize) + 1} (${chunk.length} posts)...`);
      
      const batchRequests = chunk.map(post => {
        let metrics = [];
        if (post.media_product_type === 'REELS') {
          metrics = ['reach', 'views', 'saved', 'ig_reels_video_view_total_time', 'ig_reels_avg_watch_time'];
        } else if (post.media_type === 'VIDEO') {
          metrics = ['reach', 'saved', 'views'];
        } else {
          metrics = ['reach', 'saved'];
        }
        return {
          method: 'GET',
          relative_url: `v19.0/${post.id}/insights?metric=${metrics.join(',')}`
        };
      });

      try {
        const batchRes = await fetch(`https://graph.facebook.com`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            access_token: ACCESS_TOKEN,
            batch: batchRequests
          })
        });
        const batchJson = await batchRes.json();

        if (Array.isArray(batchJson)) {
          batchJson.forEach((responseItem, idx) => {
            const post = chunk[idx];
            if (responseItem.code === 200) {
              try {
                const body = JSON.parse(responseItem.body);
                if (body.data) {
                  const insights = {};
                  body.data.forEach(item => {
                    insights[item.name] = (item.values && item.values[0]) ? item.values[0].value : 0;
                  });
                  post.insights = {
                    reach: insights.reach !== undefined ? insights.reach : 0,
                    impressions: insights.impressions !== undefined ? insights.impressions : 0,
                    saved: insights.saved !== undefined ? insights.saved : 0,
                    video_views: insights.views !== undefined ? insights.views : (insights.video_views !== undefined ? insights.video_views : 0),
                    plays: insights.views !== undefined ? insights.views : (insights.plays !== undefined ? insights.plays : 0),
                    ig_reels_video_view_total_time: insights.ig_reels_video_view_total_time !== undefined ? insights.ig_reels_video_view_total_time : 0,
                    ig_reels_avg_watch_time: insights.ig_reels_avg_watch_time !== undefined ? insights.ig_reels_avg_watch_time : 0
                  };
                } else {
                  setDefaultInsights(post);
                }
              } catch (e) {
                console.warn(`   ⚠️ Error al parsear insights para post ${post.id}:`, e.message);
                setDefaultInsights(post);
              }
            } else {
              console.warn(`   ⚠️ Error de API (código ${responseItem.code}) en insights para post ${post.id}: ${responseItem.body}`);
              setDefaultInsights(post);
            }
          });
        } else {
          console.error("   ⚠️ Respuesta de lote inválida:", batchJson);
          chunk.forEach(post => setDefaultInsights(post));
        }
      } catch (batchError) {
        console.error("   ⚠️ Error de conexión al obtener lote de insights:", batchError.message);
        chunk.forEach(post => setDefaultInsights(post));
      }
    }

    // 4. Procesar estadísticas
    console.log("\n[4/4] Procesando estadísticas y cruzando datos...");
    const stats = processStats(profile, onlineFollowersRaw, mediaList);

    // Guardar JSON para respaldo
    fs.writeFileSync(path.join(__dirname, dataFilename), JSON.stringify(stats, null, 2));
    console.log(`✅ Archivo '${dataFilename}' guardado.`);

    // Generar el reporte HTML
    generateHTMLReport(stats);
    console.log(`✅ Reporte HTML '${reportFilename}' generado con éxito.`);
    
    console.log("\n=========================================");
    console.log("ANÁLISIS COMPLETADO");
    console.log("=========================================");
    
  } catch (error) {
    console.warn("\n⚠️ ERROR AL CONECTAR CON LA API DE META:", error.message || error);
    console.log(`🔄 Intentando regenerar reportes usando la base de datos local ('${dataFilename}')...`);
    
    try {
      const localDataRaw = fs.readFileSync(path.join(__dirname, dataFilename), 'utf8');
      const localData = JSON.parse(localDataRaw);
      
      console.log(`✅ Datos locales cargados. Recalculando estadísticas completas para ${localData.posts.length} posts...`);
      
      // Recalcular estadísticas completas a partir de los posts guardados localmente
      const stats = processStats(
        { 
          name: localData.accountName, 
          username: localData.username, 
          followers_count: localData.followersCount, 
          profile_picture_url: localData.profilePicture 
        }, 
        null, 
        localData.posts
      );
      
      // Guardar el JSON actualizado con estadísticas recalculadas
      fs.writeFileSync(path.join(__dirname, dataFilename), JSON.stringify(stats, null, 2));
      console.log(`✅ Archivo '${dataFilename}' actualizado con estadísticas y medianas.`);
      
      // Re-generar el reporte HTML con los datos recalculados
      generateHTMLReport(stats);
      console.log(`✅ Reporte HTML '${reportFilename}' regenerado con éxito.`);
      
    } catch (fallbackError) {
      console.error("\n❌ ERROR CRÍTICO AL CARGAR FALLBACK LOCAL:", fallbackError.message || fallbackError);
    }
  }
}

function detectColabType(caption) {
  const textLower = (caption || "").toLowerCase();
  const brandHandles = ['@matrix', '@trusshairargentina', '@truss', '@bbcos_argentina', '@framesi', '@lorealpro', '@loreal', '@framesiarg', '@bbcos', '@colorespeluqueria', '@capilares', '@distribuidora', '@exiline', '@schwarzkopf', '@opihair', '@wella', '@salerm', '@pulpriot', '@alfaparf', '@kadus', '@pivotpoint', '@wellapro_argentina', '@matrix_argentina'];
  
  const mentions = (caption.match(/@[a-zA-Z0-9._]+/g) || [])
    .map(m => m.toLowerCase())
    .filter(m => m !== '@dossoles.distribuidora');
    
  if (mentions.length > 0) {
    const hasBrandMention = mentions.some(m => brandHandles.some(bh => m.includes(bh) || bh.includes(m)));
    return hasBrandMention ? 'brand' : 'stylist';
  }
  return 'none';
}

function getMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2 * 10) / 10;
}

function processStats(profile, onlineFollowersRaw, mediaList) {
  // Inicializar acumuladores por día (0-6)
  const statsByDay = Array.from({ length: 7 }, (_, i) => ({
    dayIndex: i,
    dayName: DAYS_ES[i],
    postCount: 0,
    totalLikes: 0,
    totalComments: 0,
    totalInteractions: 0,
    medianInteractions: 0
  }));

  // Inicializar acumuladores por hora (0-23)
  const statsByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    postCount: 0,
    totalLikes: 0,
    totalComments: 0,
    totalInteractions: 0,
    medianInteractions: 0
  }));

  // Grid de 7 x 24 para matriz de calor con objetos detallados
  const heatmap = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => ({
      totalInteractions: 0,
      reelsCount: 0,
      carouselsCount: 0,
      b2bCount: 0,
      b2cCount: 0
    }))
  );

  // Procesar todos los posts
  const processedPosts = mediaList.map(post => {
    // Convertir de UTC a Argentina (UTC-3)
    const timestamp = post.timestamp || post.timestampRaw;
    const utcDate = new Date(timestamp);
    const argDate = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
    
    const localDay = argDate.getUTCDay();
    const localHour = argDate.getUTCHours();
    
    const likes = post.like_count !== undefined ? post.like_count : (post.likes !== undefined ? post.likes : 0);
    const comments = post.comments_count !== undefined ? post.comments_count : (post.comments !== undefined ? post.comments : 0);
    const interactions = likes + comments;
    const caption = post.caption || "(Sin texto)";
    
    // Clasificación B2B vs B2C
    const b2bKeywords = ["mayorista", "distribuidor", "comerciante", "negocio", "local", "caja", "bulto", "pack", "franquicia", "revendedor", "gondola", "estanteria", "pedido", "lista de precios", "cantidad", "comercial", "compras", "stock", "abastecer", "proveedor", "distribuidora", "minorista", "comercio", "descuentos", "salón", "salones", "estilista", "estilistas", "profesional", "profesionales", "cliente", "clientes", "diagnóstico", "marca", "negocios"];
    const b2cKeywords = ["receta", "cocina", "hogar", "familia", "casa", "almuerzo", "cena", "merienda", "comer", "disfrutar", "tip", "consejo", "sabías que", "sorteo", "participá", "etiqueta", "regalamos", "postre", "saludable", "nutrición", "sabor", "delicioso", "rico", "pelo", "cabello", "brillo", "suavidad", "hidratación", "tratamiento", "cuidadocapilar", "tips", "rutina", "peinado"];
    
    let classification = post.classification || "B2B";
    if (!post.classification) {
      const textLower = caption.toLowerCase();
      let b2bMatches = 0;
      let b2cMatches = 0;
      b2bKeywords.forEach(kw => { if(textLower.includes(kw)) b2bMatches++; });
      b2cKeywords.forEach(kw => { if(textLower.includes(kw)) b2cMatches++; });
      
      if (b2cMatches > b2bMatches) {
        classification = "B2C";
      } else if (b2bMatches === 0 && b2cMatches === 0) {
        if (textLower.includes("ingredientes") || textLower.includes("pasos") || textLower.includes("preparación") || textLower.includes("disfrutá") || textLower.includes("sano") || textLower.includes("suave")) {
          classification = "B2C";
        } else {
          classification = "B2B";
        }
      }
    }

    return {
      id: post.id,
      caption: caption,
      media_type: post.media_type,
      media_product_type: post.media_product_type || null,
      permalink: post.permalink,
      media_url: post.media_url,
      timestampRaw: timestamp,
      localDateStr: argDate.toISOString().split('T')[0],
      localDayName: DAYS_ES[localDay],
      localDayIndex: localDay,
      localHour: localHour,
      likes,
      comments,
      interactions,
      classification,
      colabType: post.colabType || detectColabType(caption),
      insights: post.insights ? {
        reach: post.insights.reach !== undefined ? post.insights.reach : null,
        impressions: post.insights.impressions !== undefined ? post.insights.impressions : null,
        saved: post.insights.saved !== undefined ? post.insights.saved : null,
        video_views: post.insights.video_views !== undefined ? post.insights.video_views : null,
        plays: post.insights.plays !== undefined ? post.insights.plays : null,
        ig_reels_video_view_total_time: post.insights.ig_reels_video_view_total_time !== undefined ? post.insights.ig_reels_video_view_total_time : null,
        ig_reels_avg_watch_time: post.insights.ig_reels_avg_watch_time !== undefined ? post.insights.ig_reels_avg_watch_time : null
      } : {
        reach: null,
        impressions: null,
        saved: null,
        video_views: null,
        plays: null,
        ig_reels_video_view_total_time: null,
        ig_reels_avg_watch_time: null
      }
    };
  });

  // Tomar los últimos 100 posts (los más recientes) para las estadísticas
  const recentPosts = processedPosts.slice(0, 100);
  
  let totalLikesAll = 0;
  let totalCommentsAll = 0;

  // Acumular estadísticas sobre los últimos 100 posts
  recentPosts.forEach(post => {
    const localDay = post.localDayIndex;
    const localHour = post.localHour;
    const likes = post.likes;
    const comments = post.comments;
    const interactions = post.interactions;
    
    totalLikesAll += likes;
    totalCommentsAll += comments;
    
    statsByDay[localDay].postCount++;
    statsByDay[localDay].totalLikes += likes;
    statsByDay[localDay].totalComments += comments;
    statsByDay[localDay].totalInteractions += interactions;
    
    statsByHour[localHour].postCount++;
    statsByHour[localHour].totalLikes += likes;
    statsByHour[localHour].totalComments += comments;
    statsByHour[localHour].totalInteractions += interactions;
    
    // Actualizar celda del mapa de calor
    const cell = heatmap[localDay][localHour];
    cell.totalInteractions += interactions;
    
    const isReel = post.media_product_type === 'REELS';
    if (isReel) {
      cell.reelsCount++;
    }
    const isCarousel = post.media_type === 'CAROUSEL_ALBUM';
    if (isCarousel) {
      cell.carouselsCount++;
    }
    const classificationUpper = post.classification ? post.classification.toUpperCase() : '';
    if (classificationUpper === 'B2B') {
      cell.b2bCount++;
    } else if (classificationUpper === 'B2C') {
      cell.b2cCount++;
    }
  });

  // Calcular promedios y medianas por día sobre los últimos 100 posts
  statsByDay.forEach(day => {
    day.avgLikes = day.postCount > 0 ? Math.round((day.totalLikes / day.postCount) * 10) / 10 : 0;
    day.avgComments = day.postCount > 0 ? Math.round((day.totalComments / day.postCount) * 10) / 10 : 0;
    day.avgInteractions = day.postCount > 0 ? Math.round((day.totalInteractions / day.postCount) * 10) / 10 : 0;
    
    const dayPosts = recentPosts.filter(p => p.localDayName === day.dayName);
    day.medianInteractions = getMedian(dayPosts.map(p => p.interactions));
  });

  // Calcular promedios y medianas por hora sobre los últimos 100 posts
  statsByHour.forEach(h => {
    h.avgLikes = h.postCount > 0 ? Math.round((h.totalLikes / h.postCount) * 10) / 10 : 0;
    h.avgComments = h.postCount > 0 ? Math.round((h.totalComments / h.postCount) * 10) / 10 : 0;
    h.avgInteractions = h.postCount > 0 ? Math.round((h.totalInteractions / h.postCount) * 10) / 10 : 0;
    
    const hourPosts = recentPosts.filter(p => p.localHour === h.hour);
    h.medianInteractions = getMedian(hourPosts.map(p => p.interactions));
  });

  // Procesar actividad de seguidores (online_followers)
  const followerActivityByHour = Array(24).fill(0);
  let daysCounted = 0;
  let onlineFollowersAvailable = false;

  if (onlineFollowersRaw) {
    onlineFollowersRaw.forEach(dayRecord => {
      if (dayRecord.value && Object.keys(dayRecord.value).length > 0) {
        daysCounted++;
        onlineFollowersAvailable = true;
        Object.entries(dayRecord.value).forEach(([hourStr, count]) => {
          const pacificHour = parseInt(hourStr);
          const argentinaHour = (pacificHour + 4) % 24;
          followerActivityByHour[argentinaHour] += count;
        });
      }
    });

    // Promediar la actividad
    if (daysCounted > 0) {
      for (let i = 0; i < 24; i++) {
        followerActivityByHour[i] = Math.round(followerActivityByHour[i] / daysCounted);
      }
    }
  }

  // Encontrar el mejor día real (considerando tamaño de muestra N >= 15 y mediana)
  const daysWithGoodSample = statsByDay.filter(d => d.postCount >= 15);
  const bestDayPost = [...daysWithGoodSample].sort((a, b) => b.medianInteractions - a.medianInteractions)[0] || [...statsByDay].sort((a, b) => b.avgInteractions - a.avgInteractions)[0];

  // Encontrar la mejor hora real (considerando tamaño de muestra N >= 10 y mediana)
  const hoursWithGoodSample = statsByHour.filter(h => h.postCount >= 10);
  const fallbackHours = hoursWithGoodSample.length > 0 
    ? hoursWithGoodSample 
    : (statsByHour.filter(h => h.postCount >= 5).length > 0 
        ? statsByHour.filter(h => h.postCount >= 5) 
        : statsByHour.filter(h => h.postCount >= 2));
  const bestHourPost = [...fallbackHours].sort((a, b) => b.medianInteractions - a.medianInteractions)[0] || statsByHour[18];

  // Encontrar el pico de seguidores online
  let peakOnlineHour = 0;
  let peakOnlineCount = 0;
  if (onlineFollowersAvailable) {
    followerActivityByHour.forEach((count, hour) => {
      if (count > peakOnlineCount) {
        peakOnlineCount = count;
        peakOnlineHour = hour;
      }
    });
  }

  // Si no tenemos datos de seguidores online, hacemos recomendación basada en histórico de engagement
  let recommendedSlot = "";
  if (onlineFollowersAvailable) {
    recommendedSlot = `${(peakOnlineHour - 1 + 24) % 24}:00 hs a ${peakOnlineHour}:00 hs`;
  } else {
    // Si la mejor hora es por ejemplo 18hs, recomendamos la franja de 17:30hs a 19:30hs
    recommendedSlot = `${(bestHourPost.hour - 1 + 24) % 24}:30 hs a ${(bestHourPost.hour + 1) % 24}:30 hs`;
  }

  return {
    accountName: profile.name,
    username: profile.username,
    followersCount: profile.followers_count,
    profilePicture: profile.profile_picture_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
    totalPostsAnalyzed: processedPosts.length,
    medianInteractions: getMedian(recentPosts.map(p => p.interactions)),
    onlineFollowersAvailable,
    totals: {
      likes: totalLikesAll,
      comments: totalCommentsAll,
      interactions: totalLikesAll + totalCommentsAll,
      avgLikesPerPost: processedPosts.length > 0 ? Math.round((totalLikesAll / processedPosts.length) * 10) / 10 : 0,
      avgCommentsPerPost: processedPosts.length > 0 ? Math.round((totalCommentsAll / processedPosts.length) * 10) / 10 : 0,
    },
    recommendations: {
      bestDay: bestDayPost.dayName,
      bestDayAvgInteractions: bestDayPost.avgInteractions,
      bestDayMedian: bestDayPost.medianInteractions,
      bestDayCount: bestDayPost.postCount,
      bestHourReal: `${bestHourPost.hour}:00 hs`,
      bestHourRealAvgInteractions: bestHourPost.avgInteractions,
      bestHourRealMedian: bestHourPost.medianInteractions,
      bestHourRealCount: bestHourPost.postCount,
      peakOnlineHour: onlineFollowersAvailable ? `${peakOnlineHour}:00 hs` : "Basado en posts",
      recommendedSlot: recommendedSlot
    },
    statsByDay,
    statsByHour,
    followerActivityByHour,
    heatmap,
    posts: processedPosts
  };
}

function generateHTMLReport(data) {
  let chartJsScriptTag = '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>';
  try {
    const chartPath = path.join(__dirname, 'chart.min.js');
    if (fs.existsSync(chartPath)) {
      const chartJsCode = fs.readFileSync(chartPath, 'utf8');
      chartJsScriptTag = `<script>${chartJsCode}</script>`;
      console.log("✅ Librería Chart.js cargada localmente y embebida en el reporte.");
    }
  } catch (err) {
    console.warn("⚠️ No se pudo cargar chart.min.js localmente, usando fallback de CDN:", err.message);
  }

  let metaAdsSection = '';
  if (accountArg.includes('vernuccio')) {
    metaAdsSection = `
    <!-- SECCIÓN DE META ADS - ESTRATEGIA Y BORRADOR -->
    <div class="chart-box" style="margin-top: 30px; border-color: rgba(245, 158, 11, 0.35);">
      <h2><i class="fa-solid fa-rectangle-ad" style="color: var(--color-gold);"></i> Auditoría & Estrategia de Meta Ads - Julio 2026</h2>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">
        Planificación estratégica y estado de automatización de campañas publicitarias en Meta Ads.
      </p>

      <!-- Alerta Crítica de Conexión de WhatsApp -->
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <div style="display: flex; align-items: flex-start; gap: 15px;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.8rem; color: #ef4444; flex-shrink: 0; margin-top: 2px;"></i>
          <div>
            <h3 style="color: #ef4444; margin-bottom: 8px; font-size: 1.05rem; font-family: var(--font-title); font-weight: 800;">
              ⚠️ Blocker Requerido: Vincular WhatsApp Business a tu Página de Facebook
            </h3>
            <p style="color: var(--text-main); font-size: 0.88rem; line-height: 1.5; margin-bottom: 12px;">
              La campaña principal ha sido creada en borrador en Meta Ads Manager. Sin embargo, para crear los anuncios que redirigen a WhatsApp, la API de Meta requiere que vincules tu cuenta de <strong>WhatsApp Business</strong> a tu página de Facebook.
            </p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <a href="https://www.facebook.com/980777565129504/settings/?tab=whatsapp" target="_blank" style="background: #25d366; color: #000000; padding: 8px 16px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 6px;">
                <i class="fa-brands fa-whatsapp" style="font-size: 1rem;"></i> Vincular en Facebook
              </a>
              <a href="https://business.facebook.com/settings/whatsapp-business-accounts/?business_id=2316847981824079" target="_blank" style="background: rgba(255,255,255,0.08); color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 0.82rem; border: 1px solid rgba(255,255,255,0.15);">
                Configuración Comercial (Meta Manager)
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Bento Grid de Campaña -->
      <div class="bento-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 25px; gap: 15px;">
        <div class="bento-card" style="padding: 15px; border-color: rgba(255,255,255,0.03);">
          <div class="card-label">Presupuesto Mensual</div>
          <div class="card-value" style="font-size: 1.6rem; color: var(--color-gold);">$80,000 ARS</div>
          <div class="card-subtext">Para el mes de Julio 2026</div>
        </div>
        <div class="bento-card" style="padding: 15px; border-color: rgba(255,255,255,0.03);">
          <div class="card-label">Presupuesto Diario CBO</div>
          <div class="card-value" style="font-size: 1.6rem; color: var(--accent-cyan);">$3,800 ARS</div>
          <div class="card-subtext">Durante 21 días de campaña</div>
        </div>
        <div class="bento-card" style="padding: 15px; border-color: rgba(255,255,255,0.03);">
          <div class="card-label">Objetivo de Campaña</div>
          <div class="card-value" style="font-size: 1.3rem; color: #ffffff;">Clientes Potenciales</div>
          <div class="card-subtext">Tráfico y conversiones directas</div>
        </div>
        <div class="bento-card" style="padding: 15px; border-color: rgba(255,255,255,0.03);">
          <div class="card-label">ID de Campaña (Borrador)</div>
          <div class="card-value" style="font-size: 1.1rem; color: var(--text-muted); word-break: break-all;">120250890960140560</div>
          <div class="card-subtext">Creada en Meta Ads Manager</div>
        </div>
      </div>

      <!-- Segmentación y Públicos -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); padding: 20px; border-radius: 16px;">
          <h3 style="color: #ffffff; font-family: var(--font-title); margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-location-dot" style="color: var(--color-gold);"></i> Segmentación Geográfica
          </h3>
          <ul style="color: var(--text-muted); padding-left: 20px; line-height: 1.6; font-size: 0.88rem;">
            <li><strong>Rosario (Ciudad y región metropolitana)</strong>: Concentración principal.</li>
            <li><strong>Provincia de Santa Fe</strong>: Eje productivo agroindustrial.</li>
            <li><strong>Provincia de Buenos Aires & CABA</strong>: Principal centro corporativo del país.</li>
          </ul>
        </div>
        <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); padding: 20px; border-radius: 16px;">
          <h3 style="color: #ffffff; font-family: var(--font-title); margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-users-gear" style="color: var(--accent-cyan);"></i> Target B2B & Demografía
          </h3>
          <ul style="color: var(--text-muted); padding-left: 20px; line-height: 1.6; font-size: 0.88rem;">
            <li><strong>Rango de Edad</strong>: 30 a 55 años (Dueños de Pymes, Directores de RRHH, Gerentes).</li>
            <li><strong>Comportamiento</strong>: Administradores de páginas comerciales de Facebook.</li>
            <li><strong>Intereses Acotados</strong>: Propietario de pequeña empresa, Recursos humanos, Desarrollo organizacional, Consultoría de gestión.</li>
          </ul>
        </div>
      </div>

      <!-- Tabla de Creativos Elegidos y Descartados -->
      <h3 style="color: #ffffff; font-family: var(--font-title); margin-bottom: 15px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-photo-film" style="color: var(--color-gold);"></i> Justificación de Selección de Anuncios
      </h3>
      <div class="table-wrapper">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
          <thead>
            <tr style="background: rgba(255,255,255,0.02); text-align: left;">
              <th style="padding: 12px;">Publicación</th>
              <th style="padding: 12px;">Estado</th>
              <th style="padding: 12px;">Razones y Justificativo de Conversión</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.02);">
              <td style="padding: 12px; font-weight: 600;">
                <a href="https://www.instagram.com/reel/DXfnfnKEbbj/" target="_blank" style="color: var(--color-gold); text-decoration: none;">
                  Reel de Presentación Profesional <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem;"></i>
                </a>
              </td>
              <td style="padding: 12px;"><span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">APROBADO</span></td>
              <td style="padding: 12px; color: var(--text-muted); line-height: 1.4;">
                Video Reels de alta calidad donde te presentas directamente a la cámara. Explica tus dos líneas principales de servicio (consultoría psicosocial empresarial e inglés corporativo). Genera confianza inicial indispensable para vender servicios premium a empresas.
              </td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.02);">
              <td style="padding: 12px; font-weight: 600;">
                <a href="https://www.instagram.com/p/DYisTJMEdSY/" target="_blank" style="color: var(--color-gold); text-decoration: none;">
                  Carrusel de IA y Tecnología <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem;"></i>
                </a>
              </td>
              <td style="padding: 12px;"><span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">APROBADO</span></td>
              <td style="padding: 12px; color: var(--text-muted); line-height: 1.4;">
                Contenido con enfoque de cambio tecnológico. Habla directamente del dilema de las Pymes sobre liderar o sufrir la llegada de la Inteligencia Artificial y la tecnología, invitando a mandar un mensaje directo para diagnóstico.
              </td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.02);">
              <td style="padding: 12px; font-weight: 600;">
                <a href="https://www.instagram.com/reel/DZ55dTQvx65/" target="_blank" style="color: var(--color-gold); text-decoration: none;">
                  Reel de Feedback vs Castigo ante Errores <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.75rem;"></i>
                </a>
              </td>
              <td style="padding: 12px;"><span style="background: rgba(16,185,129,0.1); color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">APROBADO</span></td>
              <td style="padding: 12px; color: var(--text-muted); line-height: 1.4;">
                Toca un dolor crítico en la operación de mandos medios: cómo reaccionar ante errores de colaboradores. Explica el impacto en tiempo y dinero, ofreciendo directamente capacitaciones a mandos medios.
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: 600; color: #a1a1aa;">
                Post de Graduación / Festejos Personales
              </td>
              <td style="padding: 12px;"><span style="background: rgba(239,68,68,0.1); color: #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">DESCARTADO</span></td>
              <td style="padding: 12px; color: var(--text-muted); line-height: 1.4;">
                Aunque es la publicación con más likes y comentarios orgánicos de tu feed, su tracción se debe a relaciones sociales (felicitaciones de amigos y conocidos). Al pautarlo en frío, no generará valor comercial ni conversiones comerciales para tu consultora.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    `;
  } else {
    metaAdsSection = `
    <!-- SECCIÓN DE META ADS - DOS SOLES -->
    <div class="chart-box" style="margin-top: 30px; border-color: rgba(245, 158, 11, 0.35);">
      <h2><i class="fa-solid fa-rectangle-ad" style="color: var(--color-gold);"></i> Auditoría & Estrategia de Meta Ads - Dos Soles</h2>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">
        Historial de rendimiento de pauta publicitaria e insights de campañas de tráfico para Dos Soles Distribuidora.
      </p>
      <div class="bento-grid" style="grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div class="bento-card" style="padding: 15px;">
          <div class="card-label">Presupuesto Auditado</div>
          <div class="card-value" style="font-size: 1.6rem; color: var(--color-gold);">$529,289 ARS</div>
          <div class="card-subtext">Histórico de inversión auditada</div>
        </div>
        <div class="bento-card" style="padding: 15px;">
          <div class="card-label">CPC Promedio</div>
          <div class="card-value" style="font-size: 1.6rem; color: var(--accent-cyan);">$88.70 ARS</div>
          <div class="card-subtext">Costo por Clic Promedio en pauta</div>
        </div>
      </div>
      <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5;">
        Para consultar la presentación completa de slides ejecutivos de Meta Ads, puedes abrir el archivo <a href="presentacion_meta_ads.html" style="color: var(--color-gold); text-decoration: none; font-weight: bold;">presentacion_meta_ads.html</a> o leer el informe técnico <a href="report.html" style="color: var(--color-gold); text-decoration: none; font-weight: bold;">report.html</a>.
      </p>
    </div>
    `;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.accountName} - Auditoría & Estrategia</title>
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- Chart.js Placeholder -->
  <!-- CHART_JS_PLACEHOLDER -->
  
  <style>
    :root {
      /* Charcoal base themes */
      --bg-dark: #09090b; /* Charcoal (#09090B) */
      --bg-card: rgba(18, 18, 22, 0.75);
      --border-card: rgba(245, 158, 11, 0.15); /* Sunset Gold tint */
      --text-main: #fafafa;
      --text-muted: #a1a1aa; /* Zinc 400 */
      
      /* Base palette themes */
      --color-gold: #f59e0b; /* Sunset Gold */
      --color-crimson: #e11d48; /* Crimson */
      --color-charcoal: #09090b; /* Charcoal */

      /* Accent Mappings */
      --accent-violet: var(--color-gold); /* Sunset Gold mapped to --accent-violet */
      --accent-cyan: #38bdf8;
      --accent-emerald: #10b981;
      
      --gradient-ig: linear-gradient(45deg, #d97706 0%, #ea580c 35%, #e11d48 70%, #be123c 100%);
      --gradient-neon: linear-gradient(135deg, var(--color-gold) 0%, var(--color-crimson) 100%); /* Gold to Crimson */
      --gradient-cyan: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
      --font-title: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
    }

    /* Collapsible layout cards styling */
    details.warning-details {
      margin-top: 10px;
      background: rgba(245, 158, 11, 0.04);
      border: 1px solid rgba(245, 158, 11, 0.15);
      border-radius: 12px;
      overflow: hidden;
    }
    details.warning-details[open] {
      background: rgba(245, 158, 11, 0.08);
    }
    details.warning-details summary {
      padding: 10px 14px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--accent-violet);
      cursor: pointer;
      list-style: none;
      display: flex;
      align-items: center;
      gap: 8px;
      outline: none;
      user-select: none;
    }
    details.warning-details summary::-webkit-details-marker {
      display: none;
    }
    details.warning-details summary:hover {
      background: rgba(245, 158, 11, 0.12);
    }
    details.warning-details summary::after {
      content: '\f107';
      font-family: 'Font Awesome 6 Free';
      font-weight: 900;
      margin-left: auto;
      transition: transform 0.2s;
    }
    details.warning-details[open] summary::after {
      transform: rotate(180deg);
    }
    details.warning-details .warning-content {
      padding: 12px 14px;
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.4;
      border-top: 1px solid rgba(245, 158, 11, 0.1);
    }
    details.warning-details.danger-alert {
      background: rgba(225, 29, 72, 0.04);
      border-color: rgba(225, 29, 72, 0.15);
    }
    details.warning-details.danger-alert[open] {
      background: rgba(225, 29, 72, 0.08);
    }
    details.warning-details.danger-alert summary {
      color: var(--color-crimson);
    }
    details.warning-details.danger-alert summary:hover {
      background: rgba(225, 29, 72, 0.12);
    }
    details.warning-details.danger-alert .warning-content {
      border-top: 1px solid rgba(225, 29, 72, 0.15);
      color: #fafafa;
    }

    /* Floating Tooltip styling */
    .custom-tooltip {
      background: rgba(9, 9, 11, 0.95); /* Charcoal base with high opacity */
      border: 1px solid var(--border-card);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      color: #fafafa;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      font-family: var(--font-body);
      pointer-events: none;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 10% 15%, rgba(245, 158, 11, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 90% 85%, rgba(225, 29, 72, 0.06) 0%, transparent 45%);
      background-attachment: fixed;
      font-family: var(--font-body);
      color: var(--text-main);
      line-height: 1.6;
      overflow-x: hidden;
      padding-bottom: 80px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px 40px;
    }
    
    /* Header section */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30px 0;
      border-bottom: 1px solid var(--border-card);
      margin-bottom: 40px;
    }
    
    .profile-card {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .profile-img {
      width: 75px;
      height: 75px;
      border-radius: 50%;
      border: 3px solid transparent;
      background-image: var(--gradient-ig);
      background-origin: border-box;
      background-clip: content-box, border-box;
      padding: 3px;
      box-shadow: 0 8px 25px rgba(214, 41, 118, 0.25);
    }
    
    .profile-info h1 {
      font-family: var(--font-title);
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(to right, #ffffff, #d8b4fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .profile-info p {
      color: var(--text-muted);
      font-size: 1.05rem;
      font-weight: 600;
    }
    
    .badge-api {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: var(--accent-emerald);
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Bento Grid */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 40px;
    }
    
    .bento-card {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-card);
      border-radius: 24px;
      padding: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    
    .bento-card:hover {
      transform: translateY(-4px);
      border-color: rgba(245, 158, 11, 0.22);
      box-shadow: 0 12px 30px rgba(245, 158, 11, 0.05);
    }
    
    .bento-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: transparent;
    }
    
    .bento-card.highlight::before {
      background: var(--gradient-neon);
    }
    
    .card-icon {
      font-size: 1.4rem;
      margin-bottom: 12px;
      color: var(--accent-violet);
    }
    
    .card-label {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    
    .card-value {
      font-family: var(--font-title);
      font-size: 2.2rem;
      font-weight: 800;
      margin-top: 5px;
    }
    
    .card-subtext {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 5px;
    }
    
    /* Rows structure */
    .section-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .chart-box {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-card);
      border-radius: 28px;
      padding: 30px;
    }
    
    .chart-box h2 {
      font-family: var(--font-title);
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .chart-box h2 i {
      color: var(--accent-violet);
    }
    
    /* Recommendations Box */
    .rec-box {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.03) 100%);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 28px;
      padding: 30px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .rec-box h2 {
      font-family: var(--font-title);
      font-size: 1.5rem;
      font-weight: 800;
      background: var(--gradient-neon);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .rec-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
      background: rgba(255, 255, 255, 0.02);
      padding: 16px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    
    .rec-title {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .rec-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .rec-value i {
      color: var(--accent-cyan);
    }
    
    /* Heatmap styling */
    .heatmap-container {
      margin-top: 10px;
      overflow-x: auto;
    }
    
    .heatmap-grid {
      display: grid;
      grid-template-columns: 90px repeat(24, 1fr);
      gap: 4px;
      min-width: 850px;
    }
    
    .heatmap-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      font-weight: 600;
      height: 30px;
    }
    
    .heatmap-cell {
      height: 30px;
      border-radius: 5px;
      transition: all 0.2s;
      cursor: pointer;
      position: relative;
    }
    
    .heatmap-cell:hover {
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
      z-index: 5;
    }
    
    /* Collapsible layout cards styling */
    details.warning-details {
      margin-top: 10px;
      background: rgba(245, 158, 11, 0.04);
      border: 1px solid rgba(245, 158, 11, 0.15);
      border-radius: 12px;
      overflow: hidden;
    }
    details.warning-details[open] {
      background: rgba(245, 158, 11, 0.08);
    }
    details.warning-details summary {
      padding: 10px 14px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--accent-violet);
      cursor: pointer;
      list-style: none;
      display: flex;
      align-items: center;
      gap: 8px;
      outline: none;
      user-select: none;
    }
    details.warning-details summary::-webkit-details-marker {
      display: none;
    }
    details.warning-details summary:hover {
      background: rgba(245, 158, 11, 0.12);
    }
    details.warning-details summary::after {
      content: '\f107';
      font-family: 'Font Awesome 6 Free';
      font-weight: 900;
      margin-left: auto;
      transition: transform 0.2s;
    }
    details.warning-details[open] summary::after {
      transform: rotate(180deg);
    }
    details.warning-details .warning-content {
      padding: 12px 14px;
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.4;
      border-top: 1px solid rgba(245, 158, 11, 0.1);
    }
    details.warning-details.danger-alert {
      background: rgba(225, 29, 72, 0.04);
      border-color: rgba(225, 29, 72, 0.15);
    }
    details.warning-details.danger-alert[open] {
      background: rgba(225, 29, 72, 0.08);
    }
    details.warning-details.danger-alert summary {
      color: var(--color-crimson);
    }
    details.warning-details.danger-alert summary:hover {
      background: rgba(225, 29, 72, 0.12);
    }
    details.warning-details.danger-alert .warning-content {
      border-top: 1px solid rgba(225, 29, 72, 0.15);
      color: #fafafa;
    }

    /* Floating Tooltip styling */
    .custom-tooltip {
      background: rgba(9, 9, 11, 0.95); /* Charcoal base with high opacity */
      border: 1px solid var(--border-card);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      color: #fafafa;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      font-family: var(--font-body);
      pointer-events: none;
    }
    
    /* Colaboración tags */
    .tag-colab-none { background: rgba(148, 163, 184, 0.12); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); }
    .tag-colab-brand { background: rgba(236, 72, 153, 0.12); color: #ec4899; border: 1px solid rgba(236, 72, 153, 0.2); }
    .tag-colab-stylist { background: rgba(139, 92, 246, 0.12); color: var(--accent-violet); border: 1px solid rgba(139, 92, 246, 0.2); }
    
    /* Destino / CTA tags */
    .tag-link-none { background: rgba(148, 163, 184, 0.12); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); }
    .tag-link-wa { background: rgba(34, 197, 94, 0.12); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
    .tag-link-web { background: rgba(56, 189, 248, 0.12); color: var(--accent-cyan); border: 1px solid rgba(56, 189, 248, 0.2); }
    .tag-link-both { background: rgba(234, 179, 8, 0.12); color: #eab308; border: 1px solid rgba(234, 179, 8, 0.2); }
    
    /* Rendimiento tags */
    .tag-rend-alto { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 0 4px rgba(16, 185, 129, 0.2); }
    .tag-rend-promedio { background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
    .tag-rend-bajo { background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
    
    /* Table styling */
    .table-section {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border-card);
      border-radius: 28px;
      padding: 30px;
      margin-top: 40px;
    }
    
    .table-section h2 {
      font-family: var(--font-title);
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 20px;
    }
    
    .table-wrapper {
      overflow-x: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    
    th {
      padding: 16px;
      border-bottom: 1px solid var(--border-card);
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.02);
      font-size: 0.95rem;
    }
    
    tr:hover td {
      background: rgba(255, 255, 255, 0.015);
    }
    
    .post-cell {
      display: flex;
      align-items: center;
      gap: 15px;
      max-width: 450px;
    }
    
    .post-thumb {
      width: 52px;
      height: 52px;
      border-radius: 10px;
      object-fit: cover;
      border: 1px solid var(--border-card);
      background: #121217;
    }
    
    .post-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600;
    }
    
    .post-date {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 3px;
    }
    
    .metric-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }
    
    .metric-badge i {
      color: var(--accent-violet);
    }
    
    .btn-link {
      color: var(--accent-cyan);
      text-decoration: none;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: color 0.2s;
    }
    
    .btn-link:hover {
      color: var(--accent-violet);
    }
    
    .type-tag {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
    }
    
    .tag-image { background: rgba(6, 182, 212, 0.12); color: var(--accent-cyan); }
    .tag-video { background: rgba(139, 92, 246, 0.12); color: var(--accent-violet); }
    .tag-carousel { background: rgba(236, 72, 153, 0.12); color: #ec4899; }
    .tag-b2b { background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
    .tag-b2c { background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
    
    /* Table Filters */
    .table-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .filter-btn {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-card);
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .filter-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
    
    .filter-btn.active {
      background: var(--gradient-neon);
      border-color: transparent;
      color: var(--bg-dark);
      font-weight: 700;
    }
    
  </style>
</head>
<body>
  
  <div class="container">
    
    <header>
      <div class="profile-card">
        <img class="profile-img" src="${data.profilePicture}" alt="Dos Soles">
        <div class="profile-info">
          <h1>${data.accountName}</h1>
          <p>@${data.username}</p>
        </div>
      </div>
      <div class="badge-api">
        <i class="fa-solid fa-circle-check"></i>
        Instagram Graph API Activa
      </div>
    </header>
    
    <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 16px; padding: 15px 20px; margin-bottom: 30px; font-size: 0.88rem; line-height: 1.5; color: var(--accent-cyan); display: flex; align-items: center; gap: 15px;">
      <i class="fa-solid fa-circle-info" style="font-size: 1.5rem; flex-shrink: 0;"></i>
      <div>
        <strong>Análisis del Algoritmo Reciente:</strong> Para adaptarnos a las últimas actualizaciones de Instagram, los KPIs, gráficos y recomendaciones horarias/diarias se calculan en base a los <strong>últimos 100 posts</strong> (Mayo 2025 - Junio 2026). El historial completo (200 posts) se puede consultar en la tabla de abajo.
      </div>
    </div>
    
    <!-- Bento Stats -->
    <div class="bento-grid">
      <div class="bento-card highlight">
        <div class="card-icon"><i class="fa-solid fa-users"></i></div>
        <div class="card-label">Seguidores</div>
        <div class="card-value">${data.followersCount.toLocaleString()}</div>
        <div class="card-subtext">Seguidores en Instagram</div>
      </div>
      <div class="bento-card">
        <div class="card-icon"><i class="fa-solid fa-photo-film"></i></div>
        <div class="card-label">Muestra Estadística</div>
        <div class="card-value">${data.totalPostsAnalyzed}</div>
        <div class="card-subtext">Últimos 100 posts (algoritmo actual)</div>
      </div>
      <div class="bento-card">
        <div class="card-icon"><i class="fa-solid fa-heart"></i></div>
        <div class="card-label">Promedio Likes</div>
        <div class="card-value">${data.totals.avgLikesPerPost}</div>
        <div class="card-subtext">Likes por post orgánico</div>
      </div>
      <div class="bento-card">
        <div class="card-icon"><i class="fa-solid fa-comment"></i></div>
        <div class="card-label">Promedio Comentarios</div>
        <div class="card-value">${data.totals.avgCommentsPerPost}</div>
        <div class="card-subtext">Comentarios por post</div>
      </div>
    </div>
    
    <!-- Row 1: Charts & Recommendations -->
    <div class="section-row">
      <div class="chart-box">
        <h2><i class="fa-solid fa-chart-line"></i> Engagement Promedio según la Hora de Publicación</h2>
        <div style="height: 380px; position: relative;">
          <canvas id="chartHourlyPerformance"></canvas>
        </div>
      </div>
      
      <div class="chart-box">
        <div class="rec-box">
          <h2><i class="fa-solid fa-wand-magic-sparkles"></i> Horario Recomendado</h2>
        
        <div class="rec-item">
          <div class="rec-title">Día Recomendado (Consistente)</div>
          <div class="rec-value">
            <i class="fa-solid fa-calendar-days"></i>
            ${data.recommendations.bestDay} (Mediana: ${data.recommendations.bestDayMedian} | N: ${data.recommendations.bestDayCount})
          </div>
          <details class="warning-details">
            <summary class="warning-summary">
              <i class="fa-solid fa-chart-pie"></i> Ver detalle de tamaño de muestra
            </summary>
            <div class="warning-content">
              Seleccionado por consistencia estadística (máxima mediana con muestra robusta N >= 15). Los fines de semana promedian sobre 80 interacciones pero sufren de <strong>muestras minúsculas (Domingo N=7, Sábado N=6)</strong> y están distorsionados por posts atípicos.
            </div>
          </details>
        </div>
        
        <div class="rec-item">
          <div class="rec-title">Horario Recomendado (Consistente)</div>
          <div class="rec-value">
            <i class="fa-solid fa-clock"></i>
            ${data.recommendations.bestHourReal} (Mediana: ${data.recommendations.bestHourRealMedian} | N: ${data.recommendations.bestHourRealCount})
          </div>
          <details class="warning-details danger-alert" open>
            <summary class="warning-summary warning-highlight">
              <i class="fa-solid fa-triangle-exclamation"></i> ¡Sesgo de Colaboración Detectado!
            </summary>
            <div class="warning-content">
              Aunque las 18:00 hs tiene la mayor mediana general (${data.recommendations.bestHourRealMedian}), sufre un sesgo crítico: el <strong>41.6% de sus posts (5 de 12) son colaboraciones</strong> de marca/estilistas con alto engagement. Si filtramos el contenido directo (sin colab), el volumen cae a N=7 y los Reels directos a solo N=3. El horario nocturno más limpio y estadísticamente confiable para contenido propio son las <strong>20:00 hs (N=21, Reels directos N=12 con mediana de 49.5 interacciones)</strong>.
            </div>
          </details>
        </div>
        
        <div class="rec-item" style="background: rgba(139, 92, 246, 0.12); border-color: rgba(139, 92, 246, 0.35);">
          <div class="rec-title" style="color: #ffffff;">Franja de Publicación Sugerida</div>
          <div class="rec-value" style="color: #ffffff; font-size: 1.35rem;">
            <i class="fa-solid fa-circle-play" style="color: var(--accent-violet);"></i>
            19:00 hs a 20:30 hs
          </div>
          <div class="card-subtext" style="color: rgba(255,255,255,0.7); margin-top: 5px; line-height: 1.35;">
            * Para posteos de la marca sin colaboración (directos), programar a las <strong>19:30 hs / 20:00 hs</strong> para maximizar el engagement orgánico real. Las 18:00 hs deben reservarse de forma táctica para co-autorías/colaboraciones que impulsan su propio alcance.
          </div>
        </div>
      </div>
    </div>
    
    <!-- Row 2: Day of Week Performance -->
    <div class="section-row" style="grid-template-columns: 1fr 1fr;">
      <div class="chart-box">
        <h2><i class="fa-solid fa-chart-simple"></i> Rendimiento por Día de la Semana (Muestra vs Mediana)</h2>
        <div style="height: 300px; position: relative;">
          <canvas id="chartDayPerformance"></canvas>
        </div>
        <details class="warning-details">
          <summary>
            <i class="fa-solid fa-circle-info"></i> Nota sobre el sesgo de outliers
          </summary>
          <div class="warning-content">
            Aunque los Sábados y Domingos promedian sobre 80 interacciones, esto se debe a outliers en muestras minúsculas (6 y 7 posts). La comparación con la <strong>mediana</strong> revela que los Viernes y Miércoles tienen un rendimiento típico mucho más confiable y libre de sesgo.
          </div>
        </details>
      </div>
      
      <div class="chart-box">
        <h2><i class="fa-solid fa-chart-column"></i> Cantidad de Publicaciones por Hora (Frecuencia)</h2>
        <div style="height: 320px; position: relative;">
          <canvas id="chartHourFrequency"></canvas>
        </div>
      </div>
    </div>
    
    <!-- Heatmap Grid -->
    <div class="chart-box">
      <h2><i class="fa-solid fa-border-all"></i> Distribución de Engagement (Día vs. Hora de Publicación)</h2>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">
        Esta cuadrícula muestra en qué momentos históricos tus publicaciones han generado la mayor suma de interacciones (Likes + Comentarios) en hora local de Argentina.
      </p>
      
      <div class="heatmap-container">
        <div class="heatmap-grid" id="heatmapGrid">
          <div></div>
          ${Array.from({length: 24}, (_, h) => `<div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${h}h</div>`).join('')}
          
          ${data.heatmap.map((hoursArr, dayIdx) => `
            <div class="heatmap-label">${DAYS_ES[dayIdx]}</div>
            ${hoursArr.map((cell, hourIdx) => {
              const maxVal = Math.max(...data.heatmap.flatMap(row => row.map(c => c.totalInteractions))) || 1;
              const val = cell.totalInteractions;
              const opacity = val > 0 ? 0.1 + (val / maxVal) * 0.9 : 0.04;
              const bgStyle = val > 0 ? `background: rgba(245, 158, 11, ${opacity});` : `background: rgba(255,255,255,0.015);`;
              return `<div class="heatmap-cell" style="${bgStyle}" data-total="${val}" data-reels="${cell.reelsCount}" data-carousels="${cell.carouselsCount}" data-b2b="${cell.b2bCount}" data-b2c="${cell.b2cCount}" data-day="${DAYS_ES[dayIdx]}" data-hour="${hourIdx}"></div>`;
            }).join('')}
          `).join('')}
        </div>
      </div>
    </div>
    
    <!-- META_ADS_PLACEHOLDER -->
    
    <!-- Table: Recent Posts -->
    <div class="table-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
        <h2><i class="fa-solid fa-list"></i> Todas las Publicaciones Analizadas (${data.posts.length})</h2>
        
        <!-- Table Filters -->
        <div class="table-filters">
          <button class="filter-btn active" data-filter="all">Todos</button>
          <button class="filter-btn" data-filter="b2b">Enfoque B2B</button>
          <button class="filter-btn" data-filter="b2c">Enfoque B2C</button>
          <button class="filter-btn" data-filter="link-web">Enlace: Web</button>
          <button class="filter-btn" data-filter="link-wa">Enlace: WhatsApp</button>
          <button class="filter-btn" data-filter="link-none">Sin Enlaces</button>
          <button class="filter-btn" data-filter="colab-stylist">Colab: Estilistas</button>
          <button class="filter-btn" data-filter="colab-brand">Colab: Marcas</button>
          <button class="filter-btn" data-filter="colab-none">Sin Colaboración</button>
        </div>
      </div>

      <div class="table-wrapper" style="max-height: 600px; overflow-y: auto;">
        <table>
          <thead>
            <tr style="position: sticky; top: 0; background: #121217; z-index: 10;">
              <th>Publicación</th>
              <th>Tipo</th>
              <th>Enfoque</th>
              <th>Colaboración</th>
              <th>Destino / CTA</th>
              <th>Fecha y Hora (ARG)</th>
              <th>Likes</th>
              <th>Comentarios</th>
              <th>Total</th>
              <th>ER%</th>
              <th>Rendimiento</th>
              <th>Enlace</th>
            </tr>
          </thead>
          <tbody>
            ${data.posts.map(post => {
              const text = post.caption.toLowerCase();
              const hasWeb = text.includes('web') || text.includes('.com') || text.includes('tienda') || text.includes('link');
              const hasWa = text.includes('whatsapp') || text.includes('wa.me') || text.includes('escribinos') || text.includes('contacto') || text.includes('📲') || text.includes('celular');
              let linkType = 'none';
              if (hasWeb && hasWa) linkType = 'both';
              else if (hasWeb) linkType = 'web';
              else if (hasWa) linkType = 'wa';

              return `
              <tr data-classification="${post.classification.toLowerCase()}" data-linktype="${linkType}" data-colab="${post.colabType || 'none'}" data-interactions="${post.interactions}">
                <td>
                  <div class="post-cell">
                    <img class="post-thumb" src="${post.media_url}" onerror="this.src='https://placehold.co/100x100/18181b/ffffff?text=IG';" alt="Post">
                    <div>
                      <div class="post-text">${post.caption.substring(0, 50)}...</div>
                      <div class="post-date">ID: ${post.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="type-tag tag-${post.media_type.toLowerCase() === 'carousel_album' ? 'carousel' : post.media_type.toLowerCase()}">
                    ${post.media_type === 'CAROUSEL_ALBUM' ? 'carrusel' : post.media_type.toLowerCase() === 'video' ? 'video' : 'imagen'}
                  </span>
                </td>
                <td>
                  <span class="type-tag tag-${post.classification.toLowerCase()}">
                    ${post.classification}
                  </span>
                </td>
                <td class="col-colab"></td>
                <td class="col-cta"></td>
                <td>${post.localDateStr} a las ${post.localHour}:00 hs</td>
                <td>
                  <div class="metric-badge"><i class="fa-solid fa-heart"></i> ${post.likes}</div>
                </td>
                <td>
                  <div class="metric-badge"><i class="fa-solid fa-comment"></i> ${post.comments}</div>
                </td>
                <td><strong>${post.interactions}</strong></td>
                <td class="col-er"></td>
                <td class="col-rendimiento"></td>
                <td>
                  <a href="${post.permalink}" target="_blank" class="btn-link">Ver <i class="fa-solid fa-up-right-from-square"></i></a>
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
  </div>
  
  <!-- Heatmap Dynamic Tooltip -->
  <div id="heatmapTooltip" class="custom-tooltip" style="opacity: 0; position: absolute; pointer-events: none; transition: opacity 0.15s ease; z-index: 9999;"></div>
  
  <script>
    // Shared Chart.js External Tooltip Handler
    const externalTooltipHandler = (context) => {
      let tooltipEl = document.getElementById('chartjs-tooltip');
      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.className = 'custom-tooltip';
        tooltipEl.style.opacity = 0;
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.transition = 'all .1s ease';
        tooltipEl.style.border = '1px solid rgba(245, 158, 11, 0.35)'; // Sunset Gold border
        tooltipEl.style.zIndex = '10000';
        document.body.appendChild(tooltipEl);
      }

      const tooltipModel = context.tooltip;
      if (tooltipModel.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
      }

      if (tooltipModel.body) {
        const titleLines = tooltipModel.title || [];
        const bodyLines = tooltipModel.body.map(bodyItem => bodyItem.lines);

        let innerHtml = '<thead>';
        titleLines.forEach(title => {
          innerHtml += '<tr><th style="font-family: \'Outfit\', sans-serif; font-weight: 700; color: #f59e0b; font-size: 0.8rem; padding-bottom: 6px; text-align: left; border-bottom: 1px solid rgba(245, 158, 11, 0.15);">' + title + '</th></tr>';
        });
        innerHtml += '</thead><tbody>';

        bodyLines.forEach((body, i) => {
          const colors = tooltipModel.labelColors[i];
          const bg = colors.backgroundColor;
          const border = colors.borderColor;
          const indicator = '<span style="display:inline-block; margin-right: 8px; width: 8px; height: 8px; border-radius: 50%; background: ' + bg + '; border: 1px solid ' + border + ';"></span>';
          innerHtml += '<tr><td style="padding: 4px 0 0 0; display: flex; align-items: center; font-size: 0.75rem; color: #e4e4e7;">' + indicator + body + '</td></tr>';
        });
        innerHtml += '</tbody>';

        const tableRoot = document.createElement('table');
        tableRoot.style.width = '100%';
        tableRoot.style.borderCollapse = 'collapse';
        tableRoot.innerHTML = innerHtml;

        while (tooltipEl.firstChild) {
          tooltipEl.firstChild.remove();
        }
        tooltipEl.appendChild(tableRoot);
      }

      const position = context.chart.canvas.getBoundingClientRect();
      tooltipEl.style.opacity = 1;
      const leftPos = position.left + window.scrollX + tooltipModel.caretX;
      const topPos = position.top + window.scrollY + tooltipModel.caretY;
      
      tooltipEl.style.left = leftPos + 'px';
      tooltipEl.style.top = (topPos - tooltipEl.offsetHeight - 12) + 'px';
      tooltipEl.style.transform = 'translateX(-50%)';
    };

    const hourlyLabels = Array.from({length: 24}, (_, i) => i + ' hs');
    const avgPostInteractions = ${JSON.stringify(data.statsByHour.map(h => h.avgInteractions))};
    const medianPostInteractions = ${JSON.stringify(data.statsByHour.map(h => h.medianInteractions))};
    const postCountsByHour = ${JSON.stringify(data.statsByHour.map(h => h.postCount))};
    
    // 1. Chart Engagement Promedio y Mediano por Hora de Publicación
    const ctxHourly = document.getElementById('chartHourlyPerformance').getContext('2d');
    const gradientInteractions = ctxHourly.createLinearGradient(0, 0, 0, 400);
    gradientInteractions.addColorStop(0, 'rgba(245, 158, 11, 0.2)');
    gradientInteractions.addColorStop(1, 'rgba(245, 158, 11, 0)');
    
    new Chart(ctxHourly, {
      type: 'line',
      data: {
        labels: hourlyLabels,
        datasets: [
          {
            label: 'Promedio (Interacciones)',
            data: avgPostInteractions,
            borderColor: '#f59e0b',
            backgroundColor: gradientInteractions,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#be123c',
            pointRadius: 4
          },
          {
            label: 'Mediana (Post Típico)',
            data: medianPostInteractions,
            borderColor: '#38bdf8',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#0369a1',
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: true,
            labels: { color: '#9f9fad', font: { family: 'Plus Jakarta Sans', weight: 600 } }
          },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler
          }
        },
        scales: {
          x: { ticks: { color: '#9f9fad' }, grid: { color: 'rgba(255,255,255,0.03)' } },
          y: {
            ticks: { color: '#9f9fad' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'Engagement (Likes + Comentarios)', color: '#9f9fad' }
          }
        }
      }
    });
    
    // 2. Chart Rendimiento por Día de la Semana (Promedio vs Mediana)
    const dayLabels = ${JSON.stringify(data.statsByDay.map(d => `${d.dayName} (N=${d.postCount})`))};
    const dayInteractions = ${JSON.stringify(data.statsByDay.map(d => d.avgInteractions))};
    const dayMedians = ${JSON.stringify(data.statsByDay.map(d => d.medianInteractions))};
    const ctxDay = document.getElementById('chartDayPerformance').getContext('2d');
    
    new Chart(ctxDay, {
      type: 'bar',
      data: {
        labels: dayLabels,
        datasets: [
          {
            label: 'Promedio',
            data: dayInteractions,
            backgroundColor: '#be123c',
            borderRadius: 6,
            hoverBackgroundColor: '#9f1239'
          },
          {
            label: 'Mediana',
            data: dayMedians,
            backgroundColor: '#38bdf8',
            borderRadius: 6,
            hoverBackgroundColor: '#0369a1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            display: true,
            labels: { color: '#9f9fad', font: { family: 'Plus Jakarta Sans', weight: 600 } }
          },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler
          }
        },
        scales: {
          x: { ticks: { color: '#9f9fad' }, grid: { display: false } },
          y: { ticks: { color: '#9f9fad' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });

    // 3. Chart Frecuencia de Publicación por Hora
    const ctxHourFreq = document.getElementById('chartHourFrequency').getContext('2d');
    new Chart(ctxHourFreq, {
      type: 'bar',
      data: {
        labels: hourlyLabels,
        datasets: [{
          label: 'Posts Publicados',
          data: postCountsByHour,
          backgroundColor: 'rgba(56, 189, 248, 0.3)',
          borderColor: '#38bdf8',
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: '#0369a1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler
          }
        },
        scales: {
          x: { ticks: { color: '#9f9fad' }, grid: { display: false } },
          y: { ticks: { color: '#9f9fad' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });

    // 4. Lógica de Filtrado de la Tabla
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tableRows = document.querySelectorAll('tbody tr');
    
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Cambiar botón activo
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        tableRows.forEach(row => {
          const classification = row.getAttribute('data-classification');
          const linkType = row.getAttribute('data-linktype');
          const colab = row.getAttribute('data-colab') || 'none';
          
          let visible = false;
          if (filter === 'all') {
            visible = true;
          } else if (filter === 'b2b') {
            visible = classification === 'b2b';
          } else if (filter === 'b2c') {
            visible = classification === 'b2c';
          } else if (filter === 'link-web') {
            visible = linkType === 'web' || linkType === 'both';
          } else if (filter === 'link-wa') {
            visible = linkType === 'wa' || linkType === 'both';
          } else if (filter === 'link-none') {
            visible = linkType === 'none';
          } else if (filter === 'colab-stylist') {
            visible = colab === 'stylist';
          } else if (filter === 'colab-brand') {
            visible = colab === 'brand';
          } else if (filter === 'colab-none') {
            visible = colab === 'none';
          }
          
          row.style.display = visible ? '' : 'none';
        });
      });
    });

    // 5. Enriquecimiento de Columnas en Tabla (DOM Load)
    document.addEventListener("DOMContentLoaded", () => {
      const followersCount = ${data.followersCount};
      const medianInteractions = ${data.medianInteractions || 16};
      
      const rows = document.querySelectorAll("tbody tr");
      rows.forEach(row => {
        const colabAttr = row.getAttribute("data-colab") || "none";
        const linktypeAttr = row.getAttribute("data-linktype") || "none";
        const interactions = parseInt(row.getAttribute("data-interactions") || "0", 10);
        
        // Colaboración
        let colabText = "Propio";
        let colabClass = "tag-colab-none";
        if (colabAttr === "brand") {
          colabText = "Marca";
          colabClass = "tag-colab-brand";
        } else if (colabAttr === "stylist") {
          colabText = "Estilista";
          colabClass = "tag-colab-stylist";
        }
        const colabCell = row.querySelector(".col-colab");
        if (colabCell) {
          colabCell.innerHTML = \`<span class="type-tag \${colabClass}">\${colabText}</span>\`;
        }
        
        // Destino / CTA
        let linkText = "Sin Enlace";
        let linkClass = "tag-link-none";
        if (linktypeAttr === "wa") {
          linkText = "WhatsApp";
          linkClass = "tag-link-wa";
        } else if (linktypeAttr === "web") {
          linkText = "Sitio Web";
          linkClass = "tag-link-web";
        } else if (linktypeAttr === "both") {
          linkText = "Ambos";
          linkClass = "tag-link-both";
        }
        const ctaCell = row.querySelector(".col-cta");
        if (ctaCell) {
          ctaCell.innerHTML = \`<span class="type-tag \${linkClass}">\${linkText}</span>\`;
        }
        
        // ER%
        const er = ((interactions / 7461) * 100).toFixed(2);
        const erCell = row.querySelector(".col-er");
        if (erCell) {
          erCell.innerHTML = \`<strong>\${er}%</strong>\`;
        }
        
        // Rendimiento
        let rendText = "Promedio";
        let rendClass = "tag-rend-promedio";
        if (interactions > 24) {
          rendText = "★ Alto";
          rendClass = "tag-rend-alto";
        } else if (interactions < 11.2) {
          rendText = "Bajo";
          rendClass = "tag-rend-bajo";
        }
        const rendCell = row.querySelector(".col-rendimiento");
        if (rendCell) {
          rendCell.innerHTML = \`<span class="type-tag \${rendClass}">\${rendText}</span>\`;
        }
      });
    });

    // 6. Lógica de Tooltip flotante para el Heatmap
    const heatmapCells = document.querySelectorAll('.heatmap-cell');
    const heatmapTooltip = document.getElementById('heatmapTooltip');

    heatmapCells.forEach(cell => {
      cell.addEventListener('mouseenter', () => {
        const day = cell.getAttribute('data-day');
        const hour = cell.getAttribute('data-hour');
        const interactions = cell.getAttribute('data-total');
        const reels = cell.getAttribute('data-reels');
        const carousels = cell.getAttribute('data-carousels');
        const b2b = cell.getAttribute('data-b2b');
        const b2c = cell.getAttribute('data-b2c');
        
        heatmapTooltip.innerHTML = \`
          <div style="font-weight: 700; color: var(--color-gold); margin-bottom: 6px; font-size: 0.8rem; border-bottom: 1px solid rgba(245, 158, 11, 0.15); padding-bottom: 4px;">
            \${day} a las \${hour} hs
          </div>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <div><strong>Interacciones:</strong> \${interactions}</div>
            <div><strong>Reels:</strong> \${reels}</div>
            <div><strong>Carruseles:</strong> \${carousels}</div>
            <div><strong>B2B:</strong> \${b2b}</div>
            <div><strong>B2C:</strong> \${b2c}</div>
          </div>
        \`;
        heatmapTooltip.style.opacity = '1';
      });
      cell.addEventListener('mousemove', (e) => {
        const tooltipWidth = heatmapTooltip.offsetWidth;
        const tooltipHeight = heatmapTooltip.offsetHeight;
        let x = e.pageX + 12;
        let y = e.pageY - tooltipHeight - 12;
        if (x + tooltipWidth > window.innerWidth + window.scrollX - 10) {
          x = e.pageX - tooltipWidth - 12;
        }
        if (y < window.scrollY + 10) {
          y = e.pageY + 20;
        }
        heatmapTooltip.style.left = x + 'px';
        heatmapTooltip.style.top = y + 'px';
      });
      cell.addEventListener('mouseleave', () => {
        heatmapTooltip.style.opacity = '0';
      });
    });
  </script>
</body>
</html>`;

  let finalHtml = htmlContent
    .replace('<!-- CHART_JS_PLACEHOLDER -->', chartJsScriptTag)
    .replace('<!-- META_ADS_PLACEHOLDER -->', metaAdsSection);

  fs.writeFileSync(path.join(__dirname, reportFilename), finalHtml);
}

runAnalysis();

