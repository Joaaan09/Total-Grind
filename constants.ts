import { TrainingBlock, User, ProgressData } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  email: 'atleta@powerlift.pro',
  name: 'Alex Atleta',
  role: 'athlete',
  coachId: 'c1'
};

export const MOCK_COACH: User = {
  id: 'c1',
  email: 'coach@powerlift.pro',
  name: 'Entrenador Carlos',
  role: 'coach'
};

export const MOCK_PROGRESS: ProgressData[] = [
  {
    exerciseName: 'Squat',
    history: [
      { date: '2023-10-01', weight: 180 },
      { date: '2023-11-01', weight: 185 },
      { date: '2023-12-01', weight: 190 },
      { date: '2024-01-01', weight: 195 },
      { date: '2024-02-01', weight: 200 },
    ]
  },
  {
    exerciseName: 'Bench Press',
    history: [
      { date: '2023-10-01', weight: 110 },
      { date: '2023-11-01', weight: 112.5 },
      { date: '2023-12-01', weight: 115 },
      { date: '2024-01-01', weight: 117.5 },
      { date: '2024-02-01', weight: 120 },
    ]
  },
  {
    exerciseName: 'Deadlift',
    history: [
      { date: '2023-10-01', weight: 210 },
      { date: '2023-11-01', weight: 215 },
      { date: '2023-12-01', weight: 220 },
      { date: '2024-01-01', weight: 225 },
      { date: '2024-02-01', weight: 235 },
    ]
  }
];

export const MOCK_BLOCKS: TrainingBlock[] = [
  {
    id: 'b1',
    title: 'Bloque de Hipertrofia',
    ownerId: 'u1',
    source: 'assigned',
    assignedBy: 'Entrenador Carlos',
    startDate: '2023-10-01',
    weeks: [
      {
        id: 'w1',
        blockId: 'b1',
        weekNumber: 1,
        days: [
          {
            id: 'd1',
            weekId: 'w1',
            dayName: 'Día 1: Sentadilla',
            isCompleted: true,
            exercises: [
              {
                id: 'e1',
                dayId: 'd1',
                name: 'Competition Squat',
                sets: [
                  { id: 's1', exerciseId: 'e1', targetReps: '5', targetRpe: 7, reps: 5, weight: 160, rpe: 7, isCompleted: true, estimated1rm: 186 },
                  { id: 's2', exerciseId: 'e1', targetReps: '5', targetRpe: 7, reps: 5, weight: 160, rpe: 7.5, isCompleted: true, estimated1rm: 186 },
                  { id: 's3', exerciseId: 'e1', targetReps: '5', targetRpe: 8, reps: 5, weight: 165, rpe: 8, isCompleted: true, estimated1rm: 192 }
                ]
              },
              {
                id: 'e2',
                dayId: 'd1',
                name: 'Leg Press',
                sets: [
                  { id: 's4', exerciseId: 'e2', targetReps: '10', targetRpe: 8, reps: 10, weight: 200, rpe: 8, isCompleted: true }
                ]
              }
            ]
          },
          {
            id: 'd2',
            weekId: 'w1',
            dayName: 'Día 2: Banca',
            isCompleted: false,
            exercises: [
              {
                id: 'e3',
                dayId: 'd2',
                name: 'Competition Bench Press',
                sets: [
                  { id: 's5', exerciseId: 'e3', targetReps: '6', targetRpe: 7, isCompleted: false },
                  { id: 's6', exerciseId: 'e3', targetReps: '6', targetRpe: 8, isCompleted: false },
                  { id: 's7', exerciseId: 'e3', targetReps: '6', targetRpe: 9, isCompleted: false }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'b2',
    title: 'Bloque Personalizado Fuerza',
    ownerId: 'u1',
    source: 'personal',
    startDate: '2024-03-01',
    weeks: [
      {
        id: 'w2',
        blockId: 'b2',
        weekNumber: 1,
        days: [
          {
            id: 'd3',
            weekId: 'w2',
            dayName: 'Día 1: SBD',
            isCompleted: false,
            exercises: []
          }
        ]
      }
    ]
  }
];