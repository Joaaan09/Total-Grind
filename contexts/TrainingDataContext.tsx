import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TrainingBlock, ProgressData } from '../types';
import { TrainingService } from '../services/apiService';
import { useAuth } from './AuthContext';

interface TrainingDataContextType {
  blocks: TrainingBlock[];
  progressData: ProgressData[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
}

const TrainingDataContext = createContext<TrainingDataContextType | undefined>(undefined);

export const TrainingDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchAllData = async (authToken: string) => {
    setIsLoadingData(true);
    try {
      const [b, p] = await Promise.all([
        TrainingService.getBlocks(authToken),
        TrainingService.getProgress(authToken)
      ]);
      setBlocks(b);
      setProgressData(p);
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Cargar datos cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAllData(token);
    } else {
      // Limpiar datos si se cierra sesión
      setBlocks([]);
      setProgressData([]);
    }
  }, [token, isAuthenticated]);

  const refreshData = async () => {
    if (token) {
      await fetchAllData(token);
    }
  };

  return (
    <TrainingDataContext.Provider value={{ blocks, progressData, isLoadingData, refreshData }}>
      {children}
    </TrainingDataContext.Provider>
  );
};

export const useTrainingData = () => {
  const context = useContext(TrainingDataContext);
  if (context === undefined) {
    throw new Error('useTrainingData must be used within a TrainingDataProvider');
  }
  return context;
};
