# Auditoría Estratégica de Meta Ads: Dos Soles (Distribuidor Matrix)
> **Fecha de la Auditoría:** 22 de Mayo de 2026  
> **Periodo Analizado:** Últimos 6 Meses (Noviembre 2025 - Mayo 2026)  
> **Preparado por:** Consultor Antigravity (Conexión Integrada vía Meta Ads MCP)  
> **Cuenta Publicitaria Auditada:** `Dos Soles (Matrix)` - ID: `act_23843398705180592`

---

## 📖 Glosario de Métricas "En Criollo"
Para que estemos todos en la misma página y hablemos el mismo idioma, acá te explicamos qué significa cada métrica clave de esta auditoría, sin tecnicismos raros:

*   **Inversión Total / Gasto (Spend):**
    *   *Qué es científicamente:* El costo total cobrado por Meta en el periodo.
    *   *En criollo:* La plata real que pusiste de tu bolsillo en la publicidad. El combustible que le cargaste al tanque para que los anuncios anden.
*   **Alcance (Reach):**
    *   *Qué es científicamente:* El número de usuarios únicos que vieron tus anuncios al menos una vez.
    *   *En criollo:* A cuántas "cabezas" o personas reales les llegó el anuncio. Si le mostrás un anuncio a Juan diez veces, el Alcance sigue siendo **1** (Juan). Te da la pauta de qué tan grande es la red que tiraste al mar.
*   **Impresiones (Impressions):**
    *   *Qué es científicamente:* La cantidad total de veces que tus anuncios se mostraron en pantalla.
    *   *En criollo:* Cuántas veces apareció tu volante por los ojos de alguien. Ojo: si Juan vio tu Reel 3 veces en su celular, esto suma **3 impresiones** (pero el alcance sigue siendo 1). Sirve para saber qué tan expuesto estuvo tu anuncio.
*   **Frecuencia (Frequency):**
    *   *Qué es científicamente:* El promedio de veces que cada persona única vio tus anuncios (`Impresiones / Alcance`).
    *   *En criollo:* Qué tan pesado te estás volviendo. Una frecuencia de **2.1** significa que, en promedio, cada estilista vio tus anuncios 2 veces. En negocios B2B (de distribuidor a salón) querés que te vean un par de veces para que te recuerden, pero si sube a más de 5 o 6, ya los estás cansando ("fatiga de anuncio").
*   **Clics Totales (Clicks):**
    *   *Qué es científicamente:* Las pulsaciones registradas en cualquier parte del anuncio que dirijan a un destino.
    *   *En criollo:* La gente que no sólo miró la vidriera de reojo, sino que se frenó, tocó el timbre o tocó la puerta del local para entrar a chusmear. Indica interés real y activo.
*   **CTR Promedio (Click-Through Rate):**
    *   *Qué es científicamente:* El porcentaje de clics en relación a las impresiones (`[Clics / Impresiones] * 100`).
    *   *En criollo:* Qué tan ganchero, atractivo y magnético es tu anuncio. Si de cada 100 personas que lo ven en Instagram, 3 hacen clic, tenés un CTR del **3%**. Si el CTR es alto, significa que el video o imagen gusta mucho y le habla directo al dolor de tu cliente. Si es bajo (menos del 1%), el anuncio está aburriendo o no se entiende.
*   **CPC Promedio (Cost Per Click):**
    *   *Qué es científicamente:* El costo promedio cobrado por cada clic redirigido (`Inversión / Clics`).
    *   *En criollo:* Cuánta plata te cuesta que una persona interesada toque tu anuncio y entre a tu embudo. Cuanto más bajo sea este costo, más visitas y leads vas a conseguir con el mismo presupuesto.

---

## 📈 Resumen General del Rendimiento (KPIs)
*   **Inversión Total:** `$497,527` (La cuenta publicitaria inició actividad real en febrero de 2026)
*   **Alcance Promedio:** `25,966` personas únicas
*   **Impresiones:** `192,934` veces en pantalla
*   **Frecuencia Promedio:** **`2.10`** (Nivel óptimo de recordación sin saturar a la audiencia)
*   **Clics Totales:** `5,582` clics de alta intención
*   **CTR Promedio:** **`2.89%`** (Excelente, la media de mercado B2B suele rondar del 1.20% al 1.50%. ¡Estamos duplicando la eficiencia!)
*   **CPC Promedio:** **`$89.13`** (Costo por clic promedio general)

---

## 📅 Evolución Mensual de la Inversión
| Mes | Gasto Total (ARS) | Impresiones | Clics | CTR | CPC |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Febrero 2026** | `$12,155.93` | 4,161 | 145 | **3.48%** | `$83.83` |
| **Marzo 2026** | `$172,988.48` | 77,441 | 2,104 | 2.72% | `$82.22` |
| **Abril 2026** | `$169,313.82` | 62,076 | 1,633 | 2.63% | `$103.68` |
| **Mayo 2026 (Al 22)** | `$143,067.38` | 49,256 | 1,700 | **3.45%** | `$84.16` |

---

## 🔍 Hallazgo Crítico 1: El Gran Costo de Oportunidad de Campañas Pausadas
Actualmente la cuenta concentra el **100%** de su presupuesto activo en una sola campaña que envía gente a WhatsApp. Sin embargo, al cruzar los datos históricos mediante la API de Meta Ads, descubrimos que se tomaron decisiones de pausa sumamente ineficientes:

| Campaña | ID de Campaña (Trazabilidad Meta) | Estado | Inversión Histórica | Clics | CTR Promedio | CPC Promedio |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Conversion a WhatsApp - trafico frio B2B** | [`120240934489910593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=estilista) | 🟢 **Activa** | `$335,142.61` | 3,613 | 2.47% | **`$92.76`** (El costo más alto) |
| **Conversion - evento compra a pagina web** | [`120242751389540593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=sale) | 🔴 **Pausada** | `$92,141.54` | 1,073 | **`4.75%`** (El mejor CTR) | **`$85.87`** |
| **Conversion a pagina web - trafico frio** | [`120240887374240593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=cabello) | 🔴 **Pausada** | `$70,241.46` | 896 | **`3.69%`** | **`$78.39`** (El clic más barato) |

> [!WARNING]
> **Costo de Oportunidad:** La campaña de compras web (`120242751389540593`) tenía un **CTR del 4.75%** (prácticamente el doble que WhatsApp) y un CPC más económico. Pausarla privó al negocio del embudo digital más automatizado. La campaña actual activa está pagando un **"impuesto de ineficiencia" de +$14.37 por cada clic** en comparación con el tráfico frío directo a la web.

---

## 🎥 Hallazgo Crítico 2: Auditoría Interna de Creativos (WhatsApp B2B)
Analizamos el comportamiento de los anuncios **activos con inversión estadísticamente significativa** dentro de la campaña de WhatsApp B2B (`120240934489910593`). Solo consideramos como dato concluyente anuncios con gasto relevante — ads con inversión mínima (~$1,000-2,000 ARS) no tienen volumen suficiente para diagnosticar rendimiento real.

### 1. El Gran Sostén (Ganador Absoluto) 🏆
*   **Anuncio:** *`Reel - Herramientas que podes encontrar`*
*   **ID de Anuncio (Meta):** `120240973680070593`
*   **Gasto:** `$171,255.54` (Se llevó más del 50% de todo el presupuesto)
*   **CPC:** **`$79.84`** (El costo por clic más bajo de toda la campaña activa)
*   **CTR:** `2.53%` | **Clics:** 2,145
*   *Diagnóstico:* El algoritmo de Meta actuó correctamente acá. Detectó la excelente respuesta de la gente y le asignó presupuesto de forma masiva porque rinde muy bien. Es el pilar de la cuenta.

### 2. La Mina de Oro Desaprovechada 🚀
*   **Anuncio:** *`Reel - si tenes un salon`*
*   **ID de Anuncio (Meta):** `120240934489890593`
*   **Gasto:** `$22,462.65` (Apenas el 6% de la inversión)
*   **CTR:** **`3.51%`** (¡El CTR más alto entre todos los Reels activos con inversión relevante!)
*   **CPC:** `$92.44` | **Clics:** 243
*   *Diagnóstico:* Esta pieza es un misil. Llama muchísimo la atención de los dueños de salones. Como Meta le dio poco presupuesto (está infrapautada), nos estamos perdiendo de escalar un creativo estrella. La oportunidad es clara: darle más nafta.

### 3. Ads Activos con Datos Insuficientes (Sin Diagnóstico Definitivo) 📊
*   **Anuncios:** *`Reel - somos distrib de matrix`* (ID `120240973659820593`) y *`Reel - Si sos estilista o tenes..`* (ID `120243024605250593`)
*   *Diagnóstico:* Ambos anuncios están **activos** pero con inversión muy baja hasta la fecha — por debajo del umbral estadístico necesario para sacar conclusiones sólidas sobre su rendimiento real. Muestran métricas de CPC elevado, pero con tan poco volumen de datos, esas cifras no son representativas. **La recomendación es monitorearlos** con un presupuesto controlado durante las próximas 2-3 semanas antes de tomar cualquier decisión de pausa.

---

## 📅 Registro Histórico de Trazabilidad Completa (Anuncios desde Febrero 2026)

> [!CAUTION]
> **Grave Error Operativo Identificado (Fuga de Presupuesto Post-Evento):**
> Al auditar la fecha exacta de pausa de los anuncios específicos de **"Hot Sale / Dos Soles Sale"** (IDs `...580593`, `...150593`, `...120593`, `...460593`, `...700593`), descubrimos que **fueron pausados en masa recién el 20 de Mayo de 2026 a las 20:00 hs**.
> Sin embargo, el evento comercial oficial de Hot Sale finalizó el **17 de Mayo de 2026**.
> **Consecuencias:** La agencia anterior dejó correr anuncios con ofertas del Hot Sale vencidas por **3 días adicionales**. Esto no sólo significó un desperdicio neto de presupuesto en clics fríos inútiles, sino también un perjuicio reputacional (fricción y rebote de usuarios ingresando a la web buscando precios con descuento que ya habían expirado).


> **Pérdida Financiera y Operativa Verificada (Vía Meta API Insights):**
> *   **Presupuesto Desperdiciado (Fuga Neta):** **`$7,435.35 ARS`** tirados directamente a la basura.
> *   **Clics de Fricción (Usuarios Frustrados):** **136 clics** de personas interesadas que ingresaron a la web buscando descuentos vencidos.
> *   **Impresiones Inútiles:** **1,915 veces** que se mostró la oferta vencida.
> *   **Alcance:** **1,313 personas/estilistas únicos** impactados con comunicación desactualizada.
> *   **El Mayor Agujero Negro:** El creativo **Jaz UGC 2** (ID `...120593`) consumió el **91%** del desperdicio, gastando **`$6,777.37`** por sí solo en esos 3 días adicionales.


| Fecha | Nombre del Anuncio | ID Anuncio | Campaña | ID Campaña | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 13/05/2026 | Reel - General HOT | [`120244971916580593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Aprovech%C3%A1%20SALE%20Soles) | Conversion - evento compra a pagina web | `120242751389540593` | 🔴 Pausada |
| 11/05/2026 | UGC - Joana Don - HS | [`120244790839150593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=SALE%20%40dossolesdistribuidora%20LOr%C3%A9al) | Conversion - evento compra a pagina web | `120242751389540593` | 🔴 Pausada |
| 11/05/2026 | Jaz UGC 2 | [`120244790485120593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Aprovech%C3%A1%20SALE%20Soles) | Conversion - evento compra a pagina web | `120242751389540593` | 🔴 Pausada |
| 11/05/2026 | Jaz UGC 1 | [`120244789448460593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Aprovech%C3%A1%20SALE%20Soles) | Conversion - evento compra a pagina web | `120242751389540593` | 🔴 Pausada |
| 08/05/2026 | Dos Soles Sale Flyer | [`120244538628700593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Lleg%C3%B3%20Soles%20Sale) | Conversion - evento compra a pagina web | `120242751389540593` | 🔴 Pausada |
| 23/04/2026 | Reel - para cada necesidad | [`120243585452130593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Para%20cada%20necesidad) | Conversion - evento compra a pagina web | `120242751389540593` | 🟢 Activa |
| 23/04/2026 | Reel - Tenes alguno de estos sintomas?? | [`120243585452140593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Ten%C3%A9s%20alguno%20estos) | Conversion - evento compra a pagina web | `120242751389540593` | 🟢 Activa |
| 23/04/2026 | Reel - Cuida tu rubio | [`120243585452120593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Cuid%C3%A1%20rubio%20como) | Conversion - evento compra a pagina web | `120242751389540593` | 🟢 Activa |
| 23/04/2026 | Reel - Tenes rulos ?? | [`120243585452150593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Luci%20rulos%20manera) | Conversion - evento compra a pagina web | `120242751389540593` | 🟢 Activa |
| 12/04/2026 | Reel - Si sos estilista o tenes.. | [`120243024605250593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=estilista%20ten%C3%A9s%20sal%C3%B3n) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - cuidado pre y post solar | [`120240974567520593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Cuidar%20cabello%20calor) | Conversion a pagina web - trafico frio | `120240887374240593` | 🟢 Activa |
| 27/02/2026 | Reel - Tenes rulos ? | [`120240974496280593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Luci%20rulos%20manera) | Conversion a pagina web - trafico frio | `120240887374240593` | 🟢 Activa |
| 27/02/2026 | Reel - Tenes alguno de estos sintomas? | [`120240974349340593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Ten%C3%A9s%20alguno%20estos) | Conversion a pagina web - trafico frio | `120240887374240593` | 🟢 Activa |
| 27/02/2026 | Reel - Protege tu cabello | [`120240974349330593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Aprovecha%20BLACK%20FRIDAY) | Conversion a pagina web - trafico frio | `120240887374240593` | 🟢 Activa |
| 27/02/2026 | Reel - UGC Jaz febrero | [`120240974349310593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=tenes%20puntas%20deshidratadas) | Conversion a pagina web - trafico frio | `120240887374240593` | 🟢 Activa |
| 27/02/2026 | Reel - descubri lo ultimo.. | [`120240973711800593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Descubr%C3%AD%20%C3%BAltimo%20cuidado) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - 18 años confiando en matrrix | [`120240973745010593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=a%C3%B1os%20confiando%20Matrix) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - Herramientas que podes encontrar | [`120240973680070593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Herramientas%20peluquer%C3%ADa%20pod%C3%A9s) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - si tenes un salon | [`120240934489890593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=ten%C3%A9s%20sal%C3%B3n%20est%C3%A1s) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - que podes encontrar en dos soles? | [`120240973691170593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Quer%C3%A9s%20incorporar%20productos) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - somos distrib de matrix | [`120240973659820593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Somos%20distribuidores%20oficiales) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - equipa tu salon | [`120240973645810593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Equip%C3%A1%20sal%C3%B3n%20herramientas) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - queres incorporar.. | [`120240973923650593`](https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=AR&view_all_page_id=406051269418159&q=Quer%C3%A9s%20incorporar%20productos) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |

---

## 🛠️ Plan de Acción Estratégico (Roadmap de 4 Pasos)
1. **Escalar el ganador oculto (Prioridad #1):** Aumentar el presupuesto del creativo estrella *`Reel - si tenes un salon`* (ID `120240934489890593`). Con un CTR de 3.51% y solo el 6% del presupuesto asignado, escalar este anuncio es la oportunidad más obvia de la cuenta.
2. **Monitorear los activos con datos insuficientes:** Los Reels *`somos distrib de matrix`* (ID `120240973659820593`) y *`Si sos estilista o tenes..`* (ID `120243024605250593`) tienen muy poca inversión acumulada para diagnosticarlos. Darles 2-3 semanas de rodaje con volumen real antes de tomar decisiones de pausa.
3. **Reactivar la Campaña de Conversión Web:** Volver a encender la campaña *`Conversion - evento compra a pagina web`* (ID `120242751389540593`) con un presupuesto diario inicial moderado para recuperar ese altísimo CTR del 4.75% y el embudo digital automatizado.
4. **Optimizar el Cierre en WhatsApp:** Configurar plantillas semi-automatizadas y respuestas rápidas en WhatsApp Business para atender el volumen frío que genera la campaña activa (`120240934489910593`) y que no se enfríen las ventas.

---

*El archivo HTML interactivo y optimizado para exportar a PDF ya está actualizado con esta trazabilidad e información en tu carpeta scratch como `auditoria_meta_ads_dos_soles.html`.*
