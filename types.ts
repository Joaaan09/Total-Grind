export type Role = 'athlete' | 'coach' | 'admin';

export interface User {
  _id?: string;
  id: string;
  email: string;
  name: string;
  role: Role;
  coachId?: string | { _id: string; name: string; email: string; profilePicture?: string }; // Si es un atleta, ID o objeto del entrenador
  profilePicture?: string;
}

export interface TrainingBlock {
  _id?: string;
  id: string;
  title: string;
  description?: string; // Descripción opcional del bloque
  weeks: TrainingWeek[];
  ownerId: string;
  source: 'personal' | 'assigned';
  assignedBy?: string; // Nombre del entrenador que asignó el bloque
  startDate?: string;
}

export interface TrainingWeek {
  id: string;
  blockId: string;
  weekNumber: number;
  days: TrainingDay[];
}

export interface TrainingDay {
  id: string;
  weekId: string;
  dayName: string; // Ej: "Día 1 - Squat"
  description?: string; // Descripción opcional de la sesión
  athleteNotes?: string; // Notas del atleta al rellenar
  exercises: Exercise[];
  isCompleted: boolean;
}

export interface Exercise {
  id: string;
  dayId: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface ExerciseSet {
  id: string;
  exerciseId: string;
  reps?: number | string; // Puede ser un rango "3-5" para prescripción, o número para real
  rpe?: number; // Esfuerzo Percibido (RPE) real
  weight?: number;
  targetRpe?: number; // RPE prescrito
  targetReps?: string; // Repeticiones prescritas
  suggestedWeight?: number; // Peso sugerido para esta serie (opcional)
  estimated1rm?: number;
  isCompleted: boolean;
}

export interface OneRMHistory {
  date: string;
  estimatedMax: number; // 1RM estimado calculado a partir de reps y peso
  actualMax: number;    // Peso máximo real levantado
}

export interface ProgressData {
  exerciseName: string;
  history: OneRMHistory[];
}

export interface AdminStats {
  totalUsers: number;
  totalAthletes: number;
  totalCoaches: number;
  totalBlocks: number;
}

export interface UserListItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profilePicture?: string;
  coachId?: { _id: string; name: string; email: string } | null;
}

export interface BestLifts {
  'Comp SQ': { estimated: number; actual: number };
  'Comp BP': { estimated: number; actual: number };
  'Comp DL': { estimated: number; actual: number };
  'Total': { estimated: number; actual: number };
}

export interface UserDetail {
  user: UserListItem;
  blocks: TrainingBlock[];
  progress: ProgressData[];
  bestLifts: BestLifts;
}