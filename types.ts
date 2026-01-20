export type Role = 'athlete' | 'coach';

export interface User {
  _id?: string;
  id: string;
  email: string;
  name: string;
  role: Role;
  coachId?: string | { _id: string; name: string; email: string }; // If athlete
  profilePicture?: string;
}

export interface TrainingBlock {
  _id?: string;
  id: string;
  title: string;
  weeks: TrainingWeek[];
  ownerId: string;
  source: 'personal' | 'assigned';
  assignedBy?: string; // Coach Name
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
  dayName: string; // e.g., "Día 1 - Squat"
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
  reps?: number | string; // Can be a range string "3-5" for prescription, number for actual
  rpe?: number; // Rated Perceived Exertion
  weight?: number;
  targetRpe?: number; // Prescribed RPE
  targetReps?: string; // Prescribed Reps
  estimated1rm?: number;
  isCompleted: boolean;
}

export interface OneRMHistory {
  date: string;
  estimatedMax: number; // e1RM calculated from reps
  actualMax: number;    // Real max weight lifted
}

export interface ProgressData {
  exerciseName: string;
  history: OneRMHistory[];
}