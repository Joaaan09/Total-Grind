// ============================================================
// LISTAS DE EJERCICIOS PARA LOS SELECTORES DE BLOQUE
// ============================================================

// Clave base para cada categoría
export const COMPETITION_LIFTS = ['Comp SQ', 'Comp BP', 'Comp DL'] as const;

// Variantes de los tres movimientos de competición
export const SQUAT_VARIANTS: string[] = [
  'Squat tempo',
  'Squat pausa',
  'Pin Squat',
  'Box Squat',
  'High Bar Squat',
  'Low Bar Squat',
  'Front Squat',
  'Safety Squat',
  'Belt Squat',
];

export const BENCH_VARIANTS: string[] = [
  'Bench Press tempo',
  'Bench Press pausa',
  'Spoto Press',
  'Pin Press',
  'Bench Press con board',
  'Bench Press agarre cerrado',
  'Bench Press agarre medio',
  'Bench Press agarre abierto',
  'Feet Up Bench Press',
  'Larsen Press',
];

export const DEADLIFT_VARIANTS: string[] = [
  'Deadlift tempo',
  'Deadlift pausa',
  'Deficit Deadlift',
  'Block Deadlift',
  'Sumo Deadlift',
  'Conventional Deadlift',
];

// Todos los variantes en un único array para clasificarlos fácilmente
export const ALL_VARIANTS: string[] = [
  ...SQUAT_VARIANTS,
  ...BENCH_VARIANTS,
  ...DEADLIFT_VARIANTS,
];

// Lista de accesorios (el último elemento actúa como "Otro")
export const ACCESSORY_LIST: string[] = [
  'Sentadilla búlgara',
  'Prensa de piernas',
  'Hack squat',
  'Zancadas',
  'Extensión de cuádriceps',
  'Aductores',
  'Abductores',
  'Peso muerto rumano',
  'Peso muerto piernas rígidas',
  'Buenos días',
  'Hip thrust',
  'Extensión lumbar',
  'Curl femoral sentado',
  'Curl femoral estirado',
  'Curl femoral de pie',
  'Bench Press inclinado multipower',
  'Bench Press inclinado con mancuernas',
  'Bench Press inclinado con barra',
  'Máquina de pecho',
  'Fondos',
  'Jalones de tríceps',
  'Extensión de tríceps por encima de la cabeza',
  'Extensión de tríceps polea',
  'Remo con barra',
  'Remo con mancuerna',
  'Remo con polea',
  'Remo en T',
  'Jalón al pecho',
  'Dominadas',
  'Elevaciones laterales',
  'Pájaros',
  'Elevaciones frontales',
  'Elevaciones de piernas colgado',
  'Crunch en polea',
  'Plancha',
  'Rueda abdominal',
  'Otros',
];

// ──────────────────────────────────────────────
// Helpers para determinar la categoría de un ejercicio
// ──────────────────────────────────────────────

/** Devuelve la categoría del primer selector según el nombre del ejercicio. */
export type ExerciseCategory =
  | 'comp_sq'
  | 'comp_bp'
  | 'comp_dl'
  | 'variant_sq'
  | 'variant_bp'
  | 'variant_dl'
  | 'accessory'
  | 'accessory_other'
  | '';

export const getExerciseCategory = (name: string): ExerciseCategory => {
  if (!name) return '';
  if (name === 'Comp SQ') return 'comp_sq';
  if (name === 'Comp BP') return 'comp_bp';
  if (name === 'Comp DL') return 'comp_dl';
  if (SQUAT_VARIANTS.includes(name)) return 'variant_sq';
  if (BENCH_VARIANTS.includes(name)) return 'variant_bp';
  if (DEADLIFT_VARIANTS.includes(name)) return 'variant_dl';
  // Accesorios de la lista (excluye "Otros", que se trata especial)
  if (ACCESSORY_LIST.includes(name) && name !== 'Otros') return 'accessory';
  // Cualquier texto libre → accesorio personalizado
  return 'accessory_other';
};

/** Devuelve el valor del primer selector para un nombre dado. */
export const getPrimarySelectValue = (name: string): string => {
  const cat = getExerciseCategory(name);
  if (cat === 'comp_sq') return 'Comp SQ';
  if (cat === 'comp_bp') return 'Comp BP';
  if (cat === 'comp_dl') return 'Comp DL';
  if (cat === 'variant_sq' || cat === 'variant_bp' || cat === 'variant_dl') return 'variant';
  if (cat === 'accessory' || cat === 'accessory_other') return 'accessory';
  return '';
};

/** Devuelve el subgrupo de variantes correspondiente a una categoría de variante. */
export const getVariantSubgroup = (primaryValue: string, exerciseName: string): string => {
  // Si ya hay un nombre en la lista de variantes, detectar el subgrupo
  if (SQUAT_VARIANTS.includes(exerciseName)) return 'sq';
  if (BENCH_VARIANTS.includes(exerciseName)) return 'bp';
  if (DEADLIFT_VARIANTS.includes(exerciseName)) return 'dl';
  // Por defecto empezamos en squat
  return 'sq';
};
