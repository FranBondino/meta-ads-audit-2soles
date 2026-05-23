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
| **Conversion a WhatsApp - trafico frio B2B** | [`120240934489910593`](https://www.facebook.com/ads/library/?id=120240934489910593) | 🟢 **Activa** | `$335,142.61` | 3,613 | 2.47% | **`$92.76`** (El costo más alto) |
| **Conversion - evento compra a pagina web** | [`120242751389540593`](https://www.facebook.com/ads/library/?id=120242751389540593) | 🔴 **Pausada** | `$92,141.54` | 1,073 | **`4.75%`** (El mejor CTR) | **`$85.87`** |
| **Conversion a pagina web - trafico frio** | [`120240887374240593`](https://www.facebook.com/ads/library/?id=120240887374240593) | 🔴 **Pausada** | `$70,241.46` | 896 | **`3.69%`** | **`$78.39`** (El clic más barato) |

> [!WARNING]
> **Costo de Oportunidad:** La campaña de compras web (`120242751389540593`) tenía un **CTR del 4.75%** (prácticamente el doble que WhatsApp) y un CPC más económico. Pausarla privó al negocio del embudo digital más automatizado. La campaña actual activa está pagando un **"impuesto de ineficiencia" de +$14.37 por cada clic** en comparación con el tráfico frío directo a la web.

---

## 🎥 Hallazgo Crítico 2: Auditoría Interna de Creativos (WhatsApp B2B)
Analizamos el comportamiento de los anuncios activos dentro de la campaña de WhatsApp B2B (`120240934489910593`). Esto nos permite ver qué anuncios específicos están ganando o perdiendo plata con total trazabilidad:

### 1. El Gran Sostén (Ganador Absoluto) 🏆
*   **Anuncio:** *`Reel - Herramientas que podes encontrar`*
*   **ID de Anuncio (Meta):** `120240973680070593`
*   **Gasto:** `$171,255.54` (Se llevó más del 50% de todo el presupuesto)
*   **CPC:** **`$79.84`** (El costo por clic más bajo de toda la campaña activa)
*   **CTR:** `2.53%` | **Clics:** 2,145
*   *Diagnóstico:* El algoritmo de Meta actuó correctamente acá. Detectó la excelente respuesta de la gente y le asignó presupuesto de forma masiva porque rinde muy bien.

### 2. La Mina de Oro Desaprovechada 🚀
*   **Anuncio:** *`Reel - si tenes un salon`*
*   **ID de Anuncio (Meta):** `120240934489890593`
*   **Gasto:** `$22,462.65` (Apenas el 6% de la inversión)
*   **CTR:** **`3.51%`** (¡El CTR más alto entre todos los Reels activos!)
*   **CPC:** `$92.44` | **Clics:** 243
*   *Diagnóstico:* Esta pieza es un misil. Llama muchísimo la atención de los dueños de salones. Como Meta le dio poco presupuesto (está infrapautada), nos estamos perdiendo de escalar un creativo estrella.

### 3. La Fuga de Dinero Directa ❌
*   **Anuncio:** *`Reel - somos distrib de matrix`*
*   **ID de Anuncio (Meta):** `120240973659820593`
*   **CPC:** **`$218.35`** (¡Más del doble del costo promedio de la cuenta!)
*   **CTR:** **`1.28%`** (El peor CTR y más ineficiente de toda la cuenta)
*   *Diagnóstico:* Aunque gastó poco ($1,965), mantener activo este anuncio es tirar la plata. Baja el promedio de la cuenta y desaprovecha recursos que deberían ir a las piezas ganadoras.

### 4. El Creativo Lento (Para Pausar) ⚠️
*   **Anuncio:** *`Reel - Si sos estilista o tenes..`*
*   **ID de Anuncio (Meta):** `120243024605250593`
*   *Diagnóstico:* Muestra un CPC elevado de **`$161`** y un rendimiento muy por debajo del promedio. Debe desactivarse para concentrar el dinero en lo que funciona.

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
| 13/05/2026 | Reel - General HOT | [`120244971916580593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQLeZFIkAMNubcDh-R5fLUESXdzZqU6-f51IeOskcLmcCuOv6MEDlcwuNo4U5mI-Smm5MttM0NbZ-2jBaLdwXGWETLP94IjtsPBRofU7Tl9YgXKpTo1NIG1hkTyShKMCq22WASakqDR1PwfvTfwfYTgua5eUG-GLaiRLLtaHbVb28K0zppmWt2h64MGOtwWa9hXhC1ixoi8P5uz6RxK2Y5NKZff-9AG0eJdqDlh_Fbur4KVkWT-wE7Rcv0BUjSf508nns62eYgOIvOjwRK2ao-666uwGWgj0osujYX2QwOSicgcR4guPOqRrg8p7t-4mZxI7BFK5XTxHw0uvQ_gQL1DvmoIli-YaYjc26kqajbiY5wDmSnKCwjMbEh23sICvgZCWKagMD9PIpKJSy8__fLRb3H6JEidFoYJRMctCbjg3tm5hllx9g_oZlSZNTwhPzI0&t=AQKDLx_fHAoonpiYZWc) | Conversion - evento compra a pagina web | `120242751389540593` | 🔴 Pausada |
| 11/05/2026 | UGC - Joana Don - HS | [`120244790839150593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQK-c4xCf20Blx0ofAkr9I9p5lOg8V-yoQuzv07PrUzRsNhmKKG2VO8wNX9p0GXvEFB7zdbTzUzA_xQ8L44FLu3iQ_zfAXXqRwBeiiCQWg8-_rN7B1teknMRmVvrXkROvkYoNoD6Q5ba-pbuHOr05ojO8YDUiXZ7ZC7i-il4ly7jxqKXFuJrHQMSISoYMAWktn6AFzXThernpShXw_WBFv2CmqPiSnMK-t61mhoNh7oOfk4oMekHyAqmoOiLKBwfnPqvOWi1VjJrIo9u4-cFiL2cjYP66EtQ1JpjV60QpGOqN2Ke1GqU5xcdI4khNfLHYBeMNo-PbhLhJMj0Kfmya3ywaaVZmkRPkBAQFqYGJj-tnl8Um3Hi2Hv36yZET3q4TDHfdrut2bV_5WAIXa6b3d93TvJGjAFJmfwXhe2L8ZiFY7-FDzMAxK4BheDxxvOU8_Y&t=AQLykOLNV5Ueg9Qd-dc) | Conversion - evento compra a pagina web | `120242751389540593` | 🔴 Pausada |
| 11/05/2026 | Jaz UGC 2 | [`120244790485120593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQKHB8bQy83DyCTQntKMG-zybidkmIdnbfjFrFyEAAuJd8Sx3BYDS4MKNXB-i5JaA-Lecy3Oy5HfX0Exaqjh16SpS5qcKJ3fXlTBeYNU8yNaMoCCKf8Ztumuae1MXe1MsTDqAc2Lc5jlR0XtfOLADz4GN07rgI6ZAyM0DTmvJAhXWJSci7q_J8cJo8jQz8k1jUlqO-9CsQZALhNNdUHJy-XBgTCxXW0HDZtjERg416f6gjt6e0l6yLajQL6AnwuT075ZiOTBL6EGB-iSLZgAcICiqssg5zZCcRqrcQIKm2EY8xBnLh55IBj8RpKCk0fhrWjoc00539MnBvAzm0XQcQ_K_An5xhjXExEqiKA-_9xiD4C2tPfopdiOJUf1H_sncRdHHHtLSDt7bTTdxB3Cs-IqLKhldeii0FTDjzDX7qT-aUe3IItcsyVlvsfK0wO8W-Y&t=AQKNgXb7mKQcnSymqyg) | Conversion - evento compra a pagina web | `120242751389540593` | 🔴 Pausada |
| 11/05/2026 | Jaz UGC 1 | [`120244789448460593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQIZeO3nM0BO6mYTN4939NUWUoJ1Tiqm6pACPwNEclCma3d2--EM6gtHNjzxMVmsD-f7ElOvfXGKLVgoPAP93F1AvRaZmXDCiQgHq_dp6NmUabAPNvvbnYev_-TZUpyZDX21ICMzOPCwJlqTIrkGdfcPx64rnKDUCL3B5ZAK8w_HdvRmcjUt1PBIh8M5Sl6yGO_1v5OSIl5y4pIPNI1p7gOYzyd6VVPCLjcMijkaz4FycI0zDEesvv4hB_mZ8R9J8JG6iUyUcXWpezQku1w_FnnKh2HtP5qdQbBxvh1bYpPscmb4cM59sqAX07ixGWSFEGAarffmBB-UebWmzo7-5Jg-Ksh4BAn2ksu1h6mdOHq3oLxPze_WKLu7buSDH8l-6my4D_bFCDHxsyWIhEhSdjw3Lh1pTBJKMcytZPG_G9scGRrTBpRm9vJAq5nSyokS57o&t=AQKJQqfAPpoOVLppweE) | Conversion - evento compra a pagina web | `120242751389540593` | 🔴 Pausada |
| 08/05/2026 | Dos Soles Sale Flyer | [`120244538628700593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQI1ncPAoa3n6IsUV3qBojDZXU22frCCULqqSxu0Z52iuPG1mtlWV5eXyz7NeDPqJ-Y8nexe3cuAxy510SGpb3H1UBRatDYT5NIVdR-yuWjJjOZA14vxeQoRrkdqG3zx9BHYQDoDFzfKmW7ylDRalx4nxi1stESsu10MpUWOWX-8jc-946NMv-SAfJ2E8x4fEJSBZcvfOWi2qqjTpqP0UW0Vi8MfI-PFnusQ_ChZFvbFapsMA9BfJbWlTw75vRToj6252IC0HpMxWZ1m8lIrU4OTxX5n9_kElDFAqJhNDo2ih-qEUWiTj9IE3OrIS2x025axXrUdu7lu4UWr0WpC1Rv-XmU7SnaVgrbJ-ykhzkbOcs5kW3WXA3GBZXObLv-12FFPyxLG53nP6wRAPLU0pkUR5DWnfxeJzG_-ZUbKWBep6QsL_6w3TJsrofQzxaPax7M&t=AQIBs96-Lc8KYc3OjTY) | Conversion - evento compra a pagina web | `120242751389540593` | 🔴 Pausada |
| 23/04/2026 | Reel - para cada necesidad | [`120243585452130593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQLeA-clK2Id82fMKNwqZvvyPpejztoDTnQpnmHYsMVeIzcCo2h_NZ8skY-8MSx5QCtCq5zVzndsiHRDh8_dZ22gIMqIpIytiWWn8uWynbm2MEuPqEBWJ7Iz9DFPotXVyTMoD9fIvw_sSkmxbP2Xcz3Mjm-HVavZA_6EU77KEzaHxXzXaZMYKbCOxkI_edJwhkgDf7GCLVngNNpCh0qJ1RtebHeTi1ZxbHY1ECC2FyKjY-k03-H3N7NEdfByIdG53M0d4_c8xZI_MPt-rXNN9uX3ciJJGdCG2qrIqcyWGrxLYwZxekwcDCeELuZokiPXMfGVIurZrx4ITr-_AMj1R7NYKBnmSsfJO4v04bp8Qan9w2kfGCU9eOeL8cQ4FzeCDvqHEt-bSfmupP3LQ6vd0e-_Uf4nlP_vMTdvIrbCpfx0inKsVvt_0PF5V-ggCmd2eyA&t=AQKaPeo4-BpAjsjFmAk) | Conversion - evento compra a pagina web | `120242751389540593` | 🟢 Activa |
| 23/04/2026 | Reel - Tenes alguno de estos sintomas?? | [`120243585452140593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQJ-2mXpsx99oCuEZ3KSyjMyNJJDlODK3_s0tQuXy_Xcm88ZcE5n889aoZehQF1lcLEHh--svBqR6_vCBcySDfC0hX_0b91s8N6InwkUuDYv-LDSZo6Hb65ddrUo_UDlnQ4x7moO2DMEsg3dOv0yp0IE_4l1ME13MYP9t6w4IrE4lNBFUvYms4CNEYQ44C5Kbjb7qJsrb1mBQWRpgCiNitefYEn5BSlosQEi2fumeEadd4VHKLah-1u1d4VEzA64SWxfgUIsdrk8c9-tOqEqiEKjRrYaqM4vRskOUrbB1mEPg9n2xQ1HezJ4j1t3xe8nWiqx-9JEWujLHdmwrk4cemvkvj0XWmy8LbXU-BGaggzfNOO9Z7QpR26VjUvtu1t212dxCwWuLP-oRhBCTRU76YuAytmhUgPteaijhODbiR2g98YGRgLDPCRd6XcY-qwuvYk&t=AQKygkhhRqAnJW4Mggc) | Conversion - evento compra a pagina web | `120242751389540593` | 🟢 Activa |
| 23/04/2026 | Reel - Cuida tu rubio | [`120243585452120593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQKpqbjZmzFptIrcdS0kdRK4LRuJi5jwxn2_PIf6J4bZXXIW01ygfSK4aIMGeTNzVPaaRaZDIK365YBB36C_2i76Zjc4BWXi9WJ_ujpSmgv7s6sSRgdSYd8XRjmu8DBwMtS6C55Mo6_MKEN5fJLpjzthCoOt4bYY_d1Pgye2tYXKLn_vzj2OdX-v4I-O9Vz8GsIk8Mdjr6qlCostYUFEbAu4WdMVxEQOC3kF5VSiBGmKob7q5rC2XYvlToTI8ET0-gSDEq4bTtdO6q5C_djQjocLbN4_SY8PCRAtYSfLkmUF9QiKj3KLu3QUOp6aQoEi1Kk2qA47-3OW-BN6nUQ5y2tWphWtPsqiP0vHw5_ohADxWf-zIT_F7c5PkHi8AO-BQc3UQDrM-6e4bpl3gVVUDmqqRN8wwMqWTogJvv5rv86nDvmLtDkUeZk9yRXglJUNyfA&t=AQKotlXc4_PxgFAVlMQ) | Conversion - evento compra a pagina web | `120242751389540593` | 🟢 Activa |
| 23/04/2026 | Reel - Tenes rulos ?? | [`120243585452150593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQLcNFEnyr6MP1cB9E87sL2zB0LniROLAT8pUL_ZWh6LGc9Ti_KA0LWT5g_MUr3cVM2Ru_cJBpLA3g1JneHiz4fUDMc-NbmToaVPOvKloaV1lnM5hCTh3KUhDCXSQTFRqYr7d3l86RalOiuQhPnvs5md3RcMEr6CJ7LpczWGHDlsA8_lyukKYETKpM2Acf1LzF38Ve7rEJasiwmkLKWDj_6VSJpMYDPf4b1dLbr8f0tToOM9HVlVCDjvJBsWjqD_Dr12PoIFiPDWzCty0aOHU4Q58_6xLhEXHA_Elv-qh0_m2_xPHSqYOcjvekvrXJUA_hG3AYCVKTLnxBOMBrK6wNrtE4CbTR493iH7ebTZCd38WN1x5Qwku641O3OtPqZGtOrcW3QbiR5WpYmwm77aIeuGPVnOuMwOTf3H1B6eXwMx-B-StlinBcJftcAhi-wHquI&t=AQJPQ-pZ2sN_CpMD-P8) | Conversion - evento compra a pagina web | `120242751389540593` | 🟢 Activa |
| 12/04/2026 | Reel - Si sos estilista o tenes.. | [`120243024605250593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQISok93uYPdU8C-BXWgqNZAa1jxNjAxRO8y_-j2FAQJQ9MRYH05X8z1BbtpSnVhnKQunmLoao7vAtGmcXAypNhzqoGCkUp8NibDx9HJGAhzZT3HBT2ClsP4mrgwcnQ6c1UiiI1Y7egIHVRiQASx47jCqFhBFO54N6rW5TvWFrzqia3krG0gwZXJDujhx31swfpxiOI3vQwlcv44la9f9gtQ1vrWugcBukqonW4ZWjBus_DQdgReAmdSlOPi9hi6quNgO-LxEXqTGuS9Q2UPs6QPVuEQ_EPpoue2AA2quz_s4xuB9-WTISbI7EzvPR2ZNZOWMJ7lbWIPXXv_bzjSf_b2pd23bjHcZ-V_PfAKWFDqdJsHneohqWTDU9OUeT6ZO9vdPzv2V0Fvzf5VGu3SD9bYtAFfpZim1WKgELc8WB4BUnNBtR50VeTwewmnUz7qvlg&t=AQJSjCA-NRY5xTBDxNI) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - cuidado pre y post solar | [`120240974567520593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQJOYYBGTNE1wK7zISMc2G4JShiXJDY0ugTGPxtDikjwKZ8chl8k4xcWZfXatT1ahwuMN5aCL_f3K0o-mtPLs4rosl1WchvcXaR9HMQU0YUjzAD4hqcsQmqsKnGUB1GWn7-cQwlw3M5N7VklxYpL4rP9e-NACOpu6CIrn6lV-4A15C_vHfa56lMmckUOeluX35ng1wCygOIVv0dGvMdEJaIt10cA7YHrQrc3ZhhIpqBhcAGZAKzZyC3b80mMhxpw_dvDPLjx-IDzYAlPfRLSZxm6io8EtZVwuxW351CGgvZn_e815DR5xs9RG1SnZ3SGJxkiv1xMSjuE-txFfIXh7xdvMPZGaP-G6j5X22t-qIqy8ZaDTSgDA1Zp9J19Or8NdvbWFvsXP8mBMr7EB0tR9YX8Ithng5uQUCoSHfVou6XBpXk-K_77_I20kGn4zPmmXiU&t=AQLFxnAGEG--G2A8qj4) | Conversion a pagina web - trafico frio | `120240887374240593` | 🟢 Activa |
| 27/02/2026 | Reel - Tenes rulos ? | [`120240974496280593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQK6KTp3EYf9E4kiJaycvwVsHn8Wt0N3DH9xMjhv_lxNgYb7RSgxGLH0csziJWGC7zj4FbNNIbrl1CwEF_kfOT-kBk1yWWgUFZwF8lJW67pDAxO35sUT-5ZM_nNAqSk0bXLIQLe7Qtp_GPcipRaYgk72FaYWnmVJubWrdKtpp5ZdAKahrpxZfo94nsyGTcEk1lNyfwwW1diaML3zIPai9i8G5eqVHWK8TrzbfuwoZV6Od6GlkRYyel7NZWHwAky0rZKVTLsD3WX9TApfTbYL2PTxw69K1JQwydujlxaWw8-MN2EmLNT7i5WU6mJlRQKq42PnqNVRw_S_WkQwMpJKKjuJwd5X78dJnwrfqAWy7klCPubMrGI7NIbx3kw05EPXMCT-Y6P2AcTkExBHRZBmzlvfNhy7tzeGE-96-6s0Z8m0kN_I6h00YffJsh0MdDnAOdg&t=AQLVMrnWqcat5Bv8F-A) | Conversion a pagina web - trafico frio | `120240887374240593` | 🟢 Activa |
| 27/02/2026 | Reel - Tenes alguno de estos sintomas? | [`120240974349340593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQLkTTC4-Hw9X5n4aFCfh7bEhwKLmPVaRRnXBDxUx9AyMt6DQoM3H7OZIUul5eiw7v8xQY36jjMlzepEbpvrk49Gltb1Gbr_y81omXvvAFgF0nes6J5OAb52Mg8dUlx11USBLpOEn_2zmO5UpFIYjRxVJj0DSapuwUcTR1PDOflw7MMgLO6oQaZlhb5MZHc46VVAXfYBGbYnVSfn4K6udbiIiMATa1BwBvNXZ-b9Tr3h0NCCS1755ccecVY6oNDL-ZAWVduM-0KBKTBeqeEA4VU237pUo-rLmP0xvBbpWc1ZDTMA2BqpVYuHroofxqOTnjJ9DwX6pjTrpTSAwQ-KUGg77PO6tnGeqv8MXxHx_pQGv970rfROMjKb8gCnYlXkfhS3YkxzwT6EkWjrw8KMuSX_6XlHaxHeaFXRwDdLbgpXtmJkVDFDTQYjlT3UVlqoI7U&t=AQIUZ6t9h_CETQAiIk4) | Conversion a pagina web - trafico frio | `120240887374240593` | 🟢 Activa |
| 27/02/2026 | Reel - Protege tu cabello | [`120240974349330593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQI5elReOX4WqAmBj7ss9dNLY1rJYBFGPeqSpVtz-mtrEtBRIwehzrpS1DNP1TvqsdRP6mnOr4u8mkHS5n9gH_aeVzuoQ1yo7bgnFCspITCspUvk60yH26rrKeHyfKWVYiWIA05_CswBB08ogvoCbnGuPReXM46sLzmxJmIoeQmO8PukM4arkwqVyFHuGKqe_us6zPNEbmRVl6_3zqusmj_69Rv6S6r91jCnprgtq53_n9maxZGi79MCd52amKsI84cA8svqWKohq4NeIsi-360RU3Stb8hd1iOHJsPcveaSEDu2ejNW6NCB5ySYkxOPYOlTCHMgSPqJsFreloXtWlw86uVPSRGstXLV63SRJheKjGrKTPj6bbH7-Nira95qlOphph43ID75l0CLc9n5W4nw1UjcNF0Gm0y6IwJLpYc1rjyrM1IOADqrJNW1OHPhKqU&t=AQKENf4F2qSIa0o7qlk) | Conversion a pagina web - trafico frio | `120240887374240593` | 🟢 Activa |
| 27/02/2026 | Reel - UGC Jaz febrero | [`120240974349310593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQKyz6Oo9-ttqmrA23lAcrVuTSBIpGQZVx5x5csPcMNu8KftOm97YSO25uwXfopJxaavppqQVNoumDh-0XFvyF2GjaMnlsSUmrZV8I6fhQD1XZ3BdgMmHcUYeE8B4kssZQqRDoKMXlttMSdRXK2hWnqAWzIx1FsqB6g7bAj94MN31-MwdFX9fwvPpuKaGIhUCNpnzoUk-AvE45aJQnTv-NBHaVxyYHKRbtTJvsslke-wTqsmVR7xn2OBv8_TteAANzaC-ZP-4xxh_sEGvtOQ5DzagAm8yRYXU6SLcEcAcI7c9pFVTOTSwQmqRIZnPSTYrFhVeqJ3eJHbHqlNxKhFEiY5oCPkVIXig-i5DDbVi247sKmwBqa9rZYRM5eOTMbQIAv_zD3OnkrUzLFqEhD7BKAl1RqGQQKAUtLMoh4DfCvfc3Oh4W3Vlit5PxW8fRtM5Q8&t=AQKf9yCNYPcD1QKKgys) | Conversion a pagina web - trafico frio | `120240887374240593` | 🟢 Activa |
| 27/02/2026 | Reel - descubri lo ultimo.. | [`120240973711800593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQKjAghYPI_5V82i_uw0vYmuUU5EgoXX7ZNOyWaAdwqlJ_h74ixpnjMkPpvflFXiObTVOvhiu7y3yZw28DNHvaTKNKBGMY_isPLTuUk6rADmFPZQfczrM6TRy3iodDVdiBqcLAARniw9Vw90W0X3vYW7HUsmbSgF6ICF5TDF9BvpdgNMI4fzDQ8wlEHO1Tc1dbxDU_dndXzeD4UGz3bOI6vkqAqedjHEwOTz7tV_-cDfhSU7N_jMz-j5zJphhDmRKVuMvSEvFbVlnwLdMMW8oD1qoUYgr4NEeIMSc3M2vgpK7en0LgVADehJHgTIM8oEe-OBv1_xzwXzuEweWK840NOW5VEZbkptlFcAHk9RfVWBUcmdRhNpWrdEb5_nj_a883YYW4n88liVQAbeylOtOuJbiO9tuWtk4Qvy7xP-nmFwbvY-8iZ867LsTYGi52uDh6M&t=AQKTwE4Sp3sO7bVRZLY) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - 18 años confiando en matrrix | [`120240973745010593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQK5jMNG4S1ZLAVsOpVB-1oVUR3gzr7T4jT8ELUIrw7_KHZVGIY0lhx3fuXswibaRxLU8tE1mhl65c3UW0VSusAYmZ5V9Kv_PJC7J13qWNnLE2VOjF9XC4-wQYtHZk8SCZ3k67GuPX-F9RlaPiujB18o61wlBsbXfvmPonCjIP64dqdAojacMhi3WdAL9JgHQzqjrKztdOqM32eKV3Bxs2mc33d4H57e9RLUuOdu_LWZbSK4izcUsjs2IjvmWq4RGfJeiZN6xwkWFdSPDyYSB01UOwk_5lrFf-3Td5A7eIWSAZnyxAJUxPy7IlZfWMdtglcIzKWCo46i8fqc60a31U0a0tMg5biZI3FEWpHfYV0ehOugy4rH4WnBGDW4rnCMtHcnvptNlaUBlHlcNh2422RDSkKk3HcIIaNKa2THy615UFP4R1BWxEgREmW5F5kAmOU&t=AQLbNyz4niVSuag8y-I) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - Herramientas que podes encontrar | [`120240973680070593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQIfCnz8MvEjR_RQcjxFxV_m4EmpIC1nRjktYLdQAJb9s7mW7h0hzKr8ee25DwrS6DatRmkVDPTklXioisjq-7Rh2Uoi0jCv2jZ2dfTsnFoLpKbTvH-w2KkG73yG5FAx0Uq4YAc2hOP_cTgkurtbVnJDv7z6Sv2qKmiWmGxG4ajMV10l-FDL-0CUQUGphT_LwozQTmImV8INMjPdldHKmKfXBKXDmZbUqhPhK07GZ09suqloI7hQs_1d6_uW3JJuXzovG54IZZjt4t87IB9KqwEoPebT3BC5MgxMoCXWouBDuiVHTvTYfmfkXQm7LzTSfddS8YLUL0OCm1s2fG2_R8NOMJoSvRRHxt0vG7Y5nRwPMlbcOx37zw8V2xS4WTdEhymp5a4uBeoM8B7MBMfhkvlPlEmqBiIJ7Bo83qUZ6ybapR4-UtNWIAJ7xUdmw-kbfAY&t=AQIxlI9pr_TjP-reDro) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - si tenes un salon | [`120240934489890593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQJWtROC4vS3yjlWj4x-I90-WNg3vNrCajlWmcmg-QczvczvrinCopTJiMiJE4hpxytvTW8Uns2x_EWpsNj3PDKI7L0SAJXdsNEj95_cyY6jn5ybWQOFpgbYWFEcjcNIgPaQknOQwKcvnSMv0ohIkmlWaX4_MKi9gVhBKg2bIOqCxzQ0Ju036RVqAqHDmBncd19RqD6_S67c_5AVWyJgsk4CugYkBh3ENe9oLWBfqXAFewkJNbeAQOD_TjqV4W_IAK-sNWGv9VJbWMqNTN9Yb7UdNsSD6HTObZEDeLJPQxPUK-_242GeLHHmZNAPgt4_H7f0rdiEsQpjriHMfalxWpstJx3iuk9VuPtKhOz1vQ2Jvyax6JOK2BUYOKQwhA7YJih1HbVExB2GMeuMTfcRgAZqM-Oi_jCYXr_ik6OeI4-1gYpbYezwI67UAM_MW2W3vuM&t=AQKSpcwvAM3M3fs5k5o) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - que podes encontrar en dos soles? | [`120240973691170593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQLhRwCKkUwpYRAKN29diq6A26FDXThcmMGxoiGt9es0nP_e21Gv7cUR4Qpw6-MY5rMGRr_N85Y3VMdToL-5j3lQqOvjk3b6R5QwmBhbIDBYtvbqfrhSJpI8AmtCyUhFsZAk897WROLrDQE6hgwfmO6eWWIq8AHUY66JAS64G6-6GPRfgJJawxUk4Gg2Q4dbmf6ZWLYJfjSK70adcqacM1pVJBzPRzNzWNmxecjqIvZCzy15ulEqtHXzgMi94tCX2spTgvx6ilNplPg8U41oOB_o0tDQKDnUTfT4SplbV0AsmPspciX-AG-n7hMivdsOUaHhXTrTjfAPES4DMAD1vx_0YLPAsSfgj23V2yQdJNGXgQKra5cOTbsxa2Ri2surl43M4vVUc9Y8mVr0arYwZbLvwzOEy4th25cwpV0hmRRo-XeaC0BjRt3CUdmkeUTLzKw&t=AQIxCFQ8BVyMGsbS680) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - somos distrib de matrix | [`120240973659820593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQLz9mVJ72ktVh1e9C2L69LH5eNsrFHs8bkZqvpp36wWht7Awz5jEL6XlMZKqX-H-oAlDXr41yB2m7z0H8PnSmxmgAERiOpRKJQ1lOcqyOTZxq5dQQOgcjs6MTmqyukvXeFqd3LiXlh6GKT6T4Y-oxiHhMJj8c-8STY1NoGxTMsRqO63NH-_bHwk4BEcFJy-ZxMMYwG8MxQhlJMTF4X1IJiPC61gFtnROZRsKUkpjAd5TE-obezpJ4xZpTttx2J4MA0q6ss-e8lOsJGoB-DD15_7DAM6WuCMzDKnuAFBeHrXGFd4Pqo7uNOsgdkGfbjtPgcZUUpgIguy9DL8w1zkjGj0m87dXVe47RTouZRcBI4GCYhxwiDYv50rcImgQVwRUrh8wnyXwjk-15vBr04W_HySKdEAJk-OUr3o90riG24QWkIMiG-7uT8Myw_OyDpxRzM&t=AQImtg8e0r6cSK0ff0I) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - equipa tu salon | [`120240973645810593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQLsRDsJ0AUl_4xQHJvpAVCli88Y9MeBkAxTnDDVIuYR2IF6RnYan0i4zIPMukUFqE0dijmDAdpj7ASu5qXoXgC6egWFAikiX-tnFcCOHdu5OqPi7qM_KEBemxaAG8YV6-iaoOBCfwLTJR9ch5vttix-GtCS6bjqRCW1ogdtWjiY1tThlufrOZeszawP3uZvb_7vv9dUMBbR9mQNXUrHiZxIEnE-YwFo1DLTqCFh7fyW-x0AXo_gKxwekox1szg1DsOeMY5RbrFKgJFmadD0ySie_vNg05W9HyESs_Xw2czOhBMCSfAz1X3hK8BQ2kWu_SxvEBJ6zhAShRbfcgimt0MKehTjO1J5OZj4AUDW_t1tschtlnDTqVXbMm5jDuXOecapbF7VB4IruJbAN77v-S442ljXsO3jWViVeE3JzIN4v2Ea8quxhTQ2367O256pPdQ&t=AQJNbJjX8d_LbVqDtQs) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |
| 27/02/2026 | Reel - queres incorporar.. | [`120240973923650593`](https://business.facebook.com/ads/api/preview_iframe.php?d=AQIY6isTxYggbqjt304HbCpaY09iemF3cDOPEr1js-zTTvTAsf6YuiiIokjeDqkvuecJttU5jBdI45UIZ3A8mdMNYsQQ933rnyIZ72D4ikYDHvG_i9wkJQWrhnazUNEHgRFVC3KGbfAj4ACG7IjLA4XEuhWp9UklHJuniDoG5h0umolatKXXVwn2izgv_IIhfFZkt1byTGXz8g8P5TbTbyaA5DfUJtY0z0LYrP3NmwJRiHGoyNkF-ocKqawa4XchF_812xC_hjfU0AtrH5XCSf5B5PJt2HPrztX9fsT0eirs1Z8giziX972AHXqAmiA8Vih8y2y1WVS3GugfXLsJiecvywQKhSBNrq1eoXAFQKAQbCblVmzhbqpNGazj99ZAa0m-ItF1W2mVpS3GXbb1UyghtBy25csnb8pcZcG_Db4yL6Ez-KGoWJuzgVWqAlT5RDc&t=AQJmC1LNx3wmwfaxE3w) | Conversion a WhatsApp - trafico frio B2B | `120240934489910593` | 🟢 Activa |

---

## 🛠️ Plan de Acción Estratégico (Roadmap de 4 Pasos)
1. **Detener la fuga (Hoy mismo):** Pausar en el Administrador de Anuncios los Reels ineficientes: *`Reel - somos distrib de matrix`* (ID `120240973659820593`) y *`Reel - Si sos estilista o tenes..`* (ID `120243024605250593`).
2. **Escalar el ganador oculto:** Tomar el presupuesto de esos anuncios pausados e inyectárselo a la mina de oro: *`Reel - si tenes un salon`* (ID `120240934489890593`), aprovechando su increíble CTR de 3.51%.
3. **Reactivar la Campaña de Conversión Web:** Volver a encender la campaña *`Conversion - evento compra a pagina web`* (ID `120242751389540593`) con un presupuesto diario inicial moderado para recuperar ese altísimo CTR del 4.75%.
4. **Optimizar el Cierre en WhatsApp:** Configurar plantillas semi-automatizadas y respuestas rápidas en WhatsApp Business para atender el volumen frío que genera la campaña activa (`120240934489910593`) y que no se enfríen las ventas.

---

*El archivo HTML interactivo y optimizado para exportar a PDF ya está actualizado con esta trazabilidad e información en tu carpeta scratch como `auditoria_meta_ads_dos_soles.html`.*
