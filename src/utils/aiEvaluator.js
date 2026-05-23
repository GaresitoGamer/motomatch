/**
 * MotoMatch AI Engine
 * Analizador lógico de características de motocicletas
 */

export function evaluateComparison(bikes) {
  if (!bikes || bikes.length === 0) {
    return {
      status: "empty",
      title: "Esperando selección...",
      mismatches: [],
      analysis: "Selecciona al menos una moto para comenzar el análisis de MotoMatch AI.",
      verdict: null,
      stats: []
    };
  }

  if (bikes.length === 1) {
    const bike = bikes[0];
    const powerToWeight = (bike.power_hp / bike.weight_kg).toFixed(3);
    
    return {
      status: "single",
      title: `Análisis de la ${bike.brand} ${bike.model}`,
      mismatches: [],
      analysis: `Estás analizando la **${bike.brand} ${bike.model}** (${bike.category}). Esta moto equipa un motor de **${bike.engine_cc}cc** que desarrolla **${bike.power_hp} CV** para un peso de **${bike.weight_kg} kg**. Su relación peso-potencia es de **${powerToWeight} CV/kg**.\n\nEs una excelente opción orientada al perfil **${bike.difficulty}**. Su diseño destaca por: *${bike.description}*`,
      verdict: {
        recommendation: `Esta moto es ideal si buscas una conducción enfocada a: ${getUseCases(bike.category)}.`,
        pros: [
          `Buena potencia de ${bike.power_hp} CV en su segmento.`,
          `Ergonomía de asiento de ${bike.seat_height_mm}mm, adecuada para su tipo (${bike.category}).`,
          `Precio medio usado de unos ${bike.price_used_avg_eur.toLocaleString()} €.`
        ],
        cons: [
          bike.weight_kg > 220 ? "Es una moto pesada, maniobrar en parado requiere atención." : "Depósito de combustible limitado para viajes muy largos.",
          bike.difficulty === "Experto" ? "Requiere mucha experiencia para exprimirla con seguridad." : "Puede quedarse corta de sensaciones en autopista."
        ]
      },
      stats: []
    };
  }

  // Si comparamos 2 o más motos
  const mismatches = [];
  const warnings = [];
  
  // 1. Detectar diferencia de Categorías
  const categories = [...new Set(bikes.map(b => b.category))];
  if (categories.length > 1) {
    mismatches.push({
      type: "category",
      title: "Comparación de estilos asimétricos",
      severity: "warning",
      text: `Estás comparando estilos muy diferentes: ${categories.join(" vs. ")}. Las posturas de conducción, aerodinámica y propósitos son completamente dispares. Una moto ${categories[0]} no se comporta ni busca el mismo cliente que una ${categories[1]}.`
    });
  }

  // 2. Detectar diferencia drástica de cilindrada (ej. diferencia > 400cc)
  const ccs = bikes.map(b => b.engine_cc);
  const maxCc = Math.max(...ccs);
  const minCc = Math.min(...ccs);
  if (maxCc - minCc > 450) {
    const heavyBike = bikes.find(b => b.engine_cc === maxCc);
    const lightBike = bikes.find(b => b.engine_cc === minCc);
    mismatches.push({
      type: "displacement",
      title: "Desequilibrio de cilindrada (David vs. Goliat)",
      severity: "danger",
      text: `¡Diferencia brutal de cilindrada! La **${heavyBike.brand} ${heavyBike.model}** (${heavyBike.engine_cc}cc) dobla o triplica en cubicaje a la **${lightBike.brand} ${lightBike.model}** (${lightBike.engine_cc}cc). El empuje, el peso y el consumo no juegan en la misma liga.`
    });
  }

  // 3. Diferencia drástica de pesos (ej. diferencia > 70 kg)
  const weights = bikes.map(b => b.weight_kg);
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  if (maxWeight - minWeight > 70) {
    const heavy = bikes.find(b => b.weight_kg === maxWeight);
    const light = bikes.find(b => b.weight_kg === minWeight);
    mismatches.push({
      type: "weight",
      title: "Batalla de Pesos Pesados contra Plumas",
      severity: "warning",
      text: `La **${heavy.brand} ${heavy.model}** pesa **${heavy.weight_kg} kg**, mientras que la **${light.brand} ${light.model}** es una pluma de **${light.weight_kg} kg** (diferencia de ${maxWeight - minWeight} kg). Esto afectará drásticamente a la agilidad urbana y la estabilidad en autopista.`
    });
  }

  // 4. Calcular métricas comparativas
  const ratedBikes = bikes.map(b => ({
    ...b,
    powerToWeight: b.power_hp / b.weight_kg,
    priceDiffPct: ((b.price_new_eur - b.price_used_avg_eur) / b.price_new_eur * 100).toFixed(0)
  }));

  // Encontrar campeones de métricas
  const bestPowerToWeight = [...ratedBikes].sort((a,b) => b.powerToWeight - a.powerToWeight)[0];
  const cheapestNew = [...ratedBikes].sort((a,b) => a.price_new_eur - b.price_new_eur)[0];
  const cheapestUsed = [...ratedBikes].sort((a,b) => a.price_used_avg_eur - b.price_used_avg_eur)[0];
  const lightest = [...ratedBikes].sort((a,b) => a.weight_kg - b.weight_kg)[0];

  let analysis = `### Análisis MotoMatch AI\n\n`;
  
  if (mismatches.length > 0) {
    analysis += `Esta comparativa es **desigual en su concepto**, pero analíticamente fascinante. Aquí tienes los puntos clave:\n\n`;
  } else {
    analysis += `Estás comparando motos de un rango similar (${categories[0]}). Esta es una comparativa directa cara a cara:\n\n`;
  }

  // Redacción del cuerpo del análisis
  analysis += `* **Relación Peso-Potencia:** La campeona en rendimiento puro es la **${bestPowerToWeight.brand} ${bestPowerToWeight.model}** con **${bestPowerToWeight.powerToWeight.toFixed(3)} CV/kg**. `;
  if (bikes.length > 1) {
    const worstPowerToWeight = [...ratedBikes].sort((a,b) => a.powerToWeight - b.powerToWeight)[0];
    if (bestPowerToWeight.id !== worstPowerToWeight.id) {
      analysis += `Esto es notablemente superior a la **${worstPowerToWeight.brand} ${worstPowerToWeight.model}** (${worstPowerToWeight.powerToWeight.toFixed(3)} CV/kg), que prioriza un enfoque más ${worstPowerToWeight.category === "Cruiser" || worstPowerToWeight.category === "Scooter" ? "relajado y práctico" : "progresivo"}.`;
    }
  }
  analysis += `\n\n`;

  analysis += `* **Depreciación y Segunda Mano:** `;
  ratedBikes.forEach(b => {
    analysis += `La **${b.brand} ${b.model}** se devalúa aproximadamente un **${b.priceDiffPct}%** en el mercado de ocasión frente a su precio original de venta (de ${b.price_new_eur.toLocaleString()} € a ${b.price_used_avg_eur.toLocaleString()} € de media). `;
  });
  analysis += `\n\n`;

  analysis += `* **Ergonomía de Asiento:** La moto más accesible para pilotos de menor estatura es la **${[...bikes].sort((a,b) => a.seat_height_mm - b.seat_height_mm)[0].brand} ${[...bikes].sort((a,b) => a.seat_height_mm - b.seat_height_mm)[0].model}** con solo **${Math.min(...bikes.map(b => b.seat_height_mm))} mm** de altura al suelo. La más alta es la **${[...bikes].sort((a,b) => b.seat_height_mm - a.seat_height_mm)[0].brand} ${[...bikes].sort((a,b) => b.seat_height_mm - a.seat_height_mm)[0].model}** (${Math.max(...bikes.map(b => b.seat_height_mm))} mm), típica de orientación off-road o postura erguida.`;

  // Construir el veredicto
  const recommendations = {};
  
  if (bikes.length === 2) {
    const [b1, b2] = ratedBikes;
    recommendations.summary = `¿Cuál deberías elegir?`;
    recommendations.options = [
      {
        profile: `Para el día a día y economía total`,
        choice: cheapestUsed.id === b1.id ? `${b1.brand} ${b1.model}` : `${b2.brand} ${b2.model}`,
        reason: `Es la más económica de mantener, ligera (${lightest.weight_kg} kg) y con mejor precio de segunda mano.`
      },
      {
        profile: `Para sensaciones fuertes y carretera abierta`,
        choice: bestPowerToWeight.id === b1.id ? `${b1.brand} ${b1.model}` : `${b2.brand} ${b2.model}`,
        reason: `Entrega la mejor respuesta al acelerador con una relación de ${bestPowerToWeight.powerToWeight.toFixed(3)} CV por kilo.`
      },
      {
        profile: `Para viajes largos y comodidad de equipaje`,
        choice: bikes.find(b => b.category === "Touring" || b.category === "Trail")?.brand ? `${bikes.find(b => b.category === "Touring" || b.category === "Trail").brand} ${bikes.find(b => b.category === "Touring" || b.category === "Trail").model}` : `${bikes.sort((a,b) => b.fuel_capacity_l - a.fuel_capacity_l)[0].brand} ${bikes.sort((a,b) => b.fuel_capacity_l - a.fuel_capacity_l)[0].model}`,
        reason: `Ofrece la mejor autonomía con un depósito de ${Math.max(...bikes.map(b => b.fuel_capacity_l))} litros y una ergonomía más cómoda.`
      }
    ];
  } else {
    // Para 3 motos
    recommendations.summary = `Veredicto de MotoMatch AI para la terna:`;
    recommendations.options = ratedBikes.map(b => {
      let mainStrength = "";
      if (b.id === bestPowerToWeight.id) mainStrength = "Es la bala deportiva / Prestaciones puras.";
      else if (b.id === lightest.id) mainStrength = "Es el peso pluma / Agilidad urbana inmejorable.";
      else if (b.id === cheapestUsed.id) mainStrength = "Es la opción inteligente por presupuesto / Segunda mano.";
      else mainStrength = "Equilibrio general y versatilidad diaria.";

      return {
        profile: `Si buscas: ${getUseCases(b.category)}`,
        choice: `${b.brand} ${b.model}`,
        reason: `${mainStrength} Con un asiento a ${b.seat_height_mm}mm e ideal para el nivel: ${b.difficulty}.`
      };
    });
  }

  return {
    status: "compared",
    title: `Comparación: ${bikes.map(b => b.model).join(" vs. ")}`,
    mismatches,
    analysis,
    verdict: recommendations,
    keyComparisons: [
      { label: "Más potente", value: `${[...bikes].sort((a,b) => b.power_hp - a.power_hp)[0].brand} (${Math.max(...bikes.map(b => b.power_hp))} CV)` },
      { label: "Más ligera", value: `${lightest.brand} ${lightest.model} (${lightest.weight_kg} kg)` },
      { label: "Más barata (PVP)", value: `${cheapestNew.brand} ${cheapestNew.model} (${cheapestNew.price_new_eur.toLocaleString()} €)` },
      { label: "Mejor Ocasión", value: `${cheapestUsed.brand} ${cheapestUsed.model} (~${cheapestUsed.price_used_avg_eur.toLocaleString()} €)` }
    ]
  };
}

function getUseCases(category) {
  switch (category) {
    case "Sport": return "velocidad, circuito, paso por curva rápido y estética de carreras";
    case "Naked": return "diversión en curvas los fines de semana, estética agresiva y agilidad diaria";
    case "Trail": return "viajes de aventura, pistas de tierra, comodidad total y robustez";
    case "Cruiser": return "rutas tranquilas, estética custom, sonido tradicional y conducción relajada";
    case "Scooter": return "movilidad urbana diaria, practicidad de maletero y facilidad sin marchas";
    case "Touring": return "viajes infinitos por autopista con protección contra el viento y maletas";
    default: return "uso polivalente";
  }
}
