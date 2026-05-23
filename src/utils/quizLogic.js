/**
 * Algoritmo de recomendación para calcular la coincidencia
 * de una moto con el perfil de conducción del usuario.
 */
export function calculateMatchScore(bike, profile) {
  // profile: { license, budget, height, usage }
  if (!profile.license || !profile.height || !profile.usage) return 0;
  
  // 1. Carnet / Dificultad (Peso: 35%)
  let licenseScore = 100;
  const difficulty = bike.difficulty.toLowerCase();
  const engine = bike.engine_cc;
  const power = bike.power_hp;
  
  if (profile.license === 'B/A1') {
    // Solo scooters o motos de hasta 125cc
    if (engine <= 125 || difficulty.includes('b') || difficulty.includes('a1')) {
      licenseScore = 100;
    } else {
      licenseScore = 0; // Bloqueador duro: no puede conducir cilindrada mayor
    }
  } else if (profile.license === 'A2') {
    // A2: motos limitables (hasta 95 CV en origen) y de potencia máxima 47 CV
    if (difficulty.includes('a2') || difficulty.includes('b') || difficulty.includes('principiante') || power <= 48 || engine <= 500) {
      licenseScore = 100;
    } else if (difficulty.includes('intermedio') || power <= 95) {
      // Es limitable, pero requiere pasar por taller para instalar el kit
      licenseScore = 60; 
    } else {
      licenseScore = 0; // Bloqueador duro: motos de experto o >95 CV (no limitables legalmente para A2)
    }
  } else {
    // Carnet A: puede conducir cualquier moto
    licenseScore = 100;
  }
  
  if (licenseScore === 0) return 0; // Si es ilegal, la coincidencia es nula
  
  // 2. Presupuesto (Peso: 25%)
  let budgetScore = 100;
  const price = bike.price_used_avg_eur || 0;
  
  if (price > profile.budget) {
    const diffPct = (price - profile.budget) / profile.budget;
    if (diffPct <= 0.20) {
      // Penalización lineal si supera el presupuesto hasta un 20%
      budgetScore = Math.round(100 - (diffPct * 500)); 
    } else {
      budgetScore = 0; // Supera por más del 20%
    }
  }
  
  if (budgetScore === 0) return 0; // Si supera mucho el presupuesto, descartamos
  
  // 3. Altura del piloto / Altura Asiento (Peso: 20%)
  let heightScore = 100;
  const seat = bike.seat_height_mm || 800;
  
  if (profile.height === 'low') {
    // Pilotos bajos (< 1.70m): asientos bajos (< 800mm es idóneo, cruisers/scooters)
    if (seat < 800) {
      heightScore = 100;
    } else if (seat <= 830) {
      heightScore = Math.max(40, 100 - (seat - 799) * 2);
    } else {
      heightScore = 20; // Asiento muy alto (ej. Trail a 880mm)
    }
  } else if (profile.height === 'medium') {
    // Pilotos promedio (1.70m - 1.85m): se adaptan a casi todo
    if (seat >= 770 && seat <= 840) {
      heightScore = 100;
    } else {
      heightScore = 80;
    }
  } else {
    // Pilotos altos (> 1.85m): prefieren motos altas (trail/touring)
    if (seat >= 820) {
      heightScore = 100;
    } else if (seat >= 780) {
      heightScore = 80;
    } else {
      heightScore = 50; // Demasiado baja, las piernas irían muy flexionadas
    }
  }
  
  // 4. Uso Principal (Peso: 20%)
  let usageScore = 100;
  const cat = bike.category.toLowerCase();
  
  if (profile.usage === 'urbano') {
    if (cat === 'scooter') usageScore = 100;
    else if (cat === 'naked') usageScore = 90;
    else if (cat === 'cruiser') usageScore = 75;
    else if (cat === 'trail') usageScore = 65;
    else usageScore = 40; // Deporte o turismo largo es incómodo
  } else if (profile.usage === 'rutas') {
    if (cat === 'sport') usageScore = 100;
    else if (cat === 'naked') usageScore = 95;
    else if (cat === 'touring') usageScore = 80;
    else if (cat === 'trail') usageScore = 70;
    else usageScore = 45;
  } else if (profile.usage === 'viajes') {
    if (cat === 'touring') usageScore = 100;
    else if (cat === 'trail') usageScore = 90;
    else if (cat === 'cruiser') usageScore = 80;
    else if (cat === 'scooter' && engine >= 300) usageScore = 70;
    else usageScore = 30; // 125cc o R1 pura no son para viajes largos
  } else if (profile.usage === 'aventura') {
    if (cat === 'trail') usageScore = 100;
    else usageScore = 10; // Solo las trail/adventure valen para tierra
  }
  
  // Promedio ponderado final
  const finalScore = Math.round(
    (licenseScore * 0.35) + 
    (budgetScore * 0.25) + 
    (heightScore * 0.20) + 
    (usageScore * 0.20)
  );
  
  return finalScore;
}
