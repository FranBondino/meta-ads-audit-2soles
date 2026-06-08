const ACCESS_TOKEN = "EAAOCXeSxZAZCcBRiBBsymh4Y5gECxCtYVSZCZAbAC9V3Q3r93HDHET1dLngFW6bx0cztLttxI75KBH8yZC3sV7opXo7dbv6bqgFEsqM7YpDKZBMYiGchbzBLLFroi6N1DjeOkasWIP354XDdCMug8NW4wtWSTdmRptWsQ3iAawWqU7zTOnvA7eOPNiNHYRB6xtOHTtzfZCqT7LLyTTMtDpiZCV2wApmrrVLyuGCX3rqS6FC6cFLe2TScPW7Cj81XBeDcVdFDsUcHdyX4rKdVdoTuX5wZD";
const INSTAGRAM_ACCOUNT_ID = "17841403287688257";
const fs = require('fs');
const path = require('path');

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

async function runAnalysis() {
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
    let nextUrl = `https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink,media_url&limit=100&access_token=${ACCESS_TOKEN}`;
    
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

    // 4. Procesar estadísticas
    console.log("\n[4/4] Procesando estadísticas y cruzando datos...");
    const stats = processStats(profile, onlineFollowersRaw, mediaList);

    // Guardar JSON para respaldo
    fs.writeFileSync(path.join(__dirname, 'instagram_data.json'), JSON.stringify(stats, null, 2));
    console.log("✅ Archivo 'instagram_data.json' guardado.");

    // Generar el reporte HTML
    generateHTMLReport(stats);
    console.log("✅ Reporte HTML 'reporte_instagram_dos_soles.html' generado con éxito.");
    
    console.log("\n=========================================");
    console.log("ANÁLISIS COMPLETADO");
    console.log("=========================================");
    
  } catch (error) {
    console.error("\n❌ ERROR DURANTE EL PROCESO:", error.message || error);
  }
}

function processStats(profile, onlineFollowersRaw, mediaList) {
  // Inicializar acumuladores por día (0-6)
  const statsByDay = Array.from({ length: 7 }, (_, i) => ({
    dayIndex: i,
    dayName: DAYS_ES[i],
    postCount: 0,
    totalLikes: 0,
    totalComments: 0,
    totalInteractions: 0
  }));

  // Inicializar acumuladores por hora (0-23)
  const statsByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    postCount: 0,
    totalLikes: 0,
    totalComments: 0,
    totalInteractions: 0
  }));

  // Grid de 7 x 24 para matriz de calor
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));

  // Procesar posts
  let totalLikesAll = 0;
  let totalCommentsAll = 0;
  
  const processedPosts = mediaList.map(post => {
    // Convertir de UTC a Argentina (UTC-3)
    const utcDate = new Date(post.timestamp);
    const argDate = new Date(utcDate.getTime() - (3 * 60 * 60 * 1000));
    
    const localDay = argDate.getUTCDay();
    const localHour = argDate.getUTCHours();
    
    const likes = post.like_count || 0;
    const comments = post.comments_count || 0;
    const interactions = likes + comments;
    
    totalLikesAll += likes;
    totalCommentsAll += comments;
    
    // Sumar a estadísticas
    statsByDay[localDay].postCount++;
    statsByDay[localDay].totalLikes += likes;
    statsByDay[localDay].totalComments += comments;
    statsByDay[localDay].totalInteractions += interactions;
    
    statsByHour[localHour].postCount++;
    statsByHour[localHour].totalLikes += likes;
    statsByHour[localHour].totalComments += comments;
    statsByHour[localHour].totalInteractions += interactions;
    
    heatmap[localDay][localHour] += interactions;

    return {
      id: post.id,
      caption: post.caption || "(Sin texto)",
      media_type: post.media_type,
      permalink: post.permalink,
      media_url: post.media_url,
      timestampRaw: post.timestamp,
      localDateStr: argDate.toISOString().split('T')[0],
      localDayName: DAYS_ES[localDay],
      localHour: localHour,
      likes,
      comments,
      interactions
    };
  });

  // Calcular promedios por día
  statsByDay.forEach(day => {
    day.avgLikes = day.postCount > 0 ? Math.round((day.totalLikes / day.postCount) * 10) / 10 : 0;
    day.avgComments = day.postCount > 0 ? Math.round((day.totalComments / day.postCount) * 10) / 10 : 0;
    day.avgInteractions = day.postCount > 0 ? Math.round((day.totalInteractions / day.postCount) * 10) / 10 : 0;
  });

  // Calcular promedios por hora
  statsByHour.forEach(h => {
    h.avgLikes = h.postCount > 0 ? Math.round((h.totalLikes / h.postCount) * 10) / 10 : 0;
    h.avgComments = h.postCount > 0 ? Math.round((h.totalComments / h.postCount) * 10) / 10 : 0;
    h.avgInteractions = h.postCount > 0 ? Math.round((h.totalInteractions / h.postCount) * 10) / 10 : 0;
  });

  // Procesar actividad de seguidores (online_followers)
  // El API devuelve la hora en horario del Pacífico (California, UTC-7).
  // Para pasarlo a Argentina (UTC-3), le sumamos 4 horas (con mod 24).
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

  // Filtrar horas con una muestra de posts mínima (ej: >= 5 posts) para recomendaciones confiables
  const hoursWithGoodSample = statsByHour.filter(h => h.postCount >= 5);
  
  // Si no hay suficientes horas con 5 posts, bajamos a 2
  const fallbackHours = hoursWithGoodSample.length > 0 ? hoursWithGoodSample : statsByHour.filter(h => h.postCount >= 2);
  
  // Ordenar horas por promedio de interacciones para buscar la mejor hora histórica
  const bestHourPost = [...fallbackHours].sort((a, b) => b.avgInteractions - a.avgInteractions)[0] || statsByHour[13]; // Default a las 13 si no hay posts

  // Encontrar el mejor día real
  const bestDayPost = [...statsByDay].sort((a, b) => b.avgInteractions - a.avgInteractions)[0];

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
    // Si la mejor hora es por ejemplo 21hs, recomendamos la franja de 20hs a 21hs
    recommendedSlot = `${(bestHourPost.hour - 1 + 24) % 24}:00 hs a ${bestHourPost.hour}:00 hs`;
  }

  return {
    accountName: profile.name,
    username: profile.username,
    followersCount: profile.followers_count,
    profilePicture: profile.profile_picture_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
    totalPostsAnalyzed: processedPosts.length,
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
      bestHourReal: `${bestHourPost.hour}:00 hs`,
      bestHourRealAvgInteractions: bestHourPost.avgInteractions,
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
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dos Soles - Auditoría de Instagram</title>
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  
  <style>
    :root {
      --bg-dark: #07070a;
      --bg-card: rgba(18, 18, 24, 0.65);
      --border-card: rgba(255, 255, 255, 0.06);
      --text-main: #f4f4f5;
      --text-muted: #9f9fad;
      
      --ig-pink: #d62976;
      --ig-orange: #f77737;
      --accent-violet: #8b5cf6;
      --accent-cyan: #06b6d4;
      --accent-emerald: #10b981;
      
      --gradient-ig: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
      --gradient-neon: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      --gradient-cyan: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
      --font-title: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 10% 15%, rgba(139, 92, 246, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 90% 85%, rgba(236, 72, 153, 0.12) 0%, transparent 45%);
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
      border-color: rgba(139, 92, 246, 0.25);
      box-shadow: 0 12px 30px rgba(139, 92, 246, 0.08);
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
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
      z-index: 5;
    }
    
    .heatmap-cell:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 115%;
      left: 50%;
      transform: translateX(-50%);
      background: #0d0d12;
      border: 1px solid var(--border-card);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      white-space: nowrap;
      z-index: 10;
      color: #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
    }
    
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
        <div class="card-label">Publicaciones Analizadas</div>
        <div class="card-value">${data.totalPostsAnalyzed}</div>
        <div class="card-subtext">Muestra total descargada</div>
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
      
      <div class="rec-box">
        <h2><i class="fa-solid fa-wand-magic-sparkles"></i> Horario Recomendado</h2>
        
        <div class="rec-item">
          <div class="rec-title">Mejor Día Recomendado</div>
          <div class="rec-value">
            <i class="fa-solid fa-calendar-days"></i>
            ${data.recommendations.bestDay}
          </div>
        </div>
        
        <div class="rec-item">
          <div class="rec-title">Pico Histórico de Engagement</div>
          <div class="rec-value">
            <i class="fa-solid fa-clock"></i>
            ${data.recommendations.bestHourReal}
          </div>
        </div>
        
        <div class="rec-item" style="background: rgba(139, 92, 246, 0.12); border-color: rgba(139, 92, 246, 0.35);">
          <div class="rec-title" style="color: #ffffff;">Franja de Publicación Sugerida</div>
          <div class="rec-value" style="color: #ffffff; font-size: 1.35rem;">
            <i class="fa-solid fa-circle-play" style="color: var(--accent-violet);"></i>
            ${data.recommendations.recommendedSlot}
          </div>
          <div class="card-subtext" style="color: rgba(255,255,255,0.7); margin-top: 5px;">
            * Se aconseja publicar una hora antes del pico de mayor interacción para que el algoritmo distribuya el contenido.
          </div>
        </div>
      </div>
    </div>
    
    <!-- Row 2: Day of Week Performance -->
    <div class="section-row" style="grid-template-columns: 1fr 1fr;">
      <div class="chart-box">
        <h2><i class="fa-solid fa-chart-simple"></i> Rendimiento por Día de la Semana (Promedio)</h2>
        <div style="height: 320px; position: relative;">
          <canvas id="chartDayPerformance"></canvas>
        </div>
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
            ${hoursArr.map((val, hourIdx) => {
              const maxVal = Math.max(...data.heatmap.flatMap(x => x)) || 1;
              const opacity = val > 0 ? 0.1 + (val / maxVal) * 0.9 : 0.04;
              const bgStyle = val > 0 ? `background: rgba(139, 92, 246, ${opacity});` : `background: rgba(255,255,255,0.015);`;
              return `<div class="heatmap-cell" style="${bgStyle}" data-tooltip="${DAYS_ES[dayIdx]} a las ${hourIdx}h: ${val} interacciones en total"></div>`;
            }).join('')}
          `).join('')}
        </div>
      </div>
    </div>
    
    <!-- Table: Recent Posts -->
    <div class="table-section">
      <h2><i class="fa-solid fa-list"></i> Últimas 20 Publicaciones Analizadas</h2>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Publicación</th>
              <th>Tipo</th>
              <th>Fecha y Hora (ARG)</th>
              <th>Likes</th>
              <th>Comentarios</th>
              <th>Total</th>
              <th>Enlace</th>
            </tr>
          </thead>
          <tbody>
            ${data.posts.slice(0, 20).map(post => `
              <tr>
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
                <td>${post.localDateStr} a las ${post.localHour}:00 hs</td>
                <td>
                  <div class="metric-badge"><i class="fa-solid fa-heart"></i> ${post.likes}</div>
                </td>
                <td>
                  <div class="metric-badge"><i class="fa-solid fa-comment"></i> ${post.comments}</div>
                </td>
                <td><strong>${post.interactions}</strong></td>
                <td>
                  <a href="${post.permalink}" target="_blank" class="btn-link">Ver <i class="fa-solid fa-up-right-from-square"></i></a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    
  </div>
  
  <script>
    const hourlyLabels = Array.from({length: 24}, (_, i) => i + ' hs');
    const avgPostInteractions = ${JSON.stringify(data.statsByHour.map(h => h.avgInteractions))};
    const postCountsByHour = ${JSON.stringify(data.statsByHour.map(h => h.postCount))};
    
    // 1. Chart Engagement Promedio por Hora de Publicación
    const ctxHourly = document.getElementById('chartHourlyPerformance').getContext('2d');
    const gradientInteractions = ctxHourly.createLinearGradient(0, 0, 0, 400);
    gradientInteractions.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradientInteractions.addColorStop(1, 'rgba(139, 92, 246, 0)');
    
    new Chart(ctxHourly, {
      type: 'line',
      data: {
        labels: hourlyLabels,
        datasets: [
          {
            label: 'Interacciones Promedio',
            data: avgPostInteractions,
            borderColor: '#8b5cf6',
            backgroundColor: gradientInteractions,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#ec4899',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#9f9fad' }, grid: { color: 'rgba(255,255,255,0.03)' } },
          y: {
            ticks: { color: '#9f9fad' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'Engagement Promedio (Likes + Comentarios)', color: '#9f9fad' }
          }
        }
      }
    });
    
    // 2. Chart Rendimiento por Día de la Semana
    const dayLabels = ${JSON.stringify(data.statsByDay.map(d => d.dayName))};
    const dayInteractions = ${JSON.stringify(data.statsByDay.map(d => d.avgInteractions))};
    const ctxDay = document.getElementById('chartDayPerformance').getContext('2d');
    
    new Chart(ctxDay, {
      type: 'bar',
      data: {
        labels: dayLabels,
        datasets: [{
          label: 'Engagement Promedio',
          data: dayInteractions,
          backgroundColor: '#ec4899',
          borderRadius: 8,
          hoverBackgroundColor: '#db2777'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
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
        labels: hourLabels,
        datasets: [{
          label: 'Posts Publicados',
          data: postCountsByHour,
          backgroundColor: '#06b6d4',
          borderRadius: 6,
          hoverBackgroundColor: '#0891b2'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#9f9fad' }, grid: { display: false } },
          y: { ticks: { color: '#9f9fad' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'reporte_instagram_dos_soles.html'), htmlContent);
}

runAnalysis();
