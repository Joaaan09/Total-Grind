import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TrainingBlockList, BlockDetail } from './components/TrainingBlock';
import { ProgressCharts } from './components/Progress';
import { Profile } from './components/Profile';
import { CoachDashboard } from './components/CoachDashboard';
import { Login, Register } from './components/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TrainingService } from './services/mockService';
import { CreateBlockModal } from './components/CreateBlockModal';
import { EditBlockModal } from './components/EditBlockModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { TrainingBlock, ProgressData, User } from './types';
import { Loader2 } from 'lucide-react';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Auth pages wrapper (redirect if already logged in)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { user, token } = useAuth();
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Load data when authenticated
  useEffect(() => {
    const loadData = async () => {
      if (token) {
        const b = await TrainingService.getBlocks(token);
        const p = await TrainingService.getProgress(token);
        setBlocks(b);
        setProgressData(p);
      }
    };
    loadData();
  }, [token]);

  // Refresh blocks and progress after changes
  const refreshBlocks = async () => {
    if (token) {
      const b = await TrainingService.getBlocks(token);
      const p = await TrainingService.getProgress(token);
      setBlocks(b);
      setProgressData(p);
    }
  };

  // Convert auth user to app User type
  const appUser: User | null = user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    coachId: user.coachId,
    profilePicture: user.profilePicture
  } : null;

  // Training View Wrapper
  const TrainingView = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<TrainingBlock | null>(null);
    const [isRestrictionDialogOpen, setIsRestrictionDialogOpen] = useState(false);
    const { blockId } = useParams();

    useEffect(() => {
      if (blockId) {
        setSelectedBlockId(blockId);
      } else {
        setSelectedBlockId(null);
      }
    }, [blockId]);

    if (selectedBlockId) {
      const block = blocks.find(b => b.id === selectedBlockId);
      if (!block) return <div>Error loading block</div>;

      return (
        <>
          <BlockDetail
            block={block}
            onBack={() => {
              setSelectedBlockId(null);
              window.location.hash = '/training'; // Clear URL param
            }}
            onEdit={(b) => setEditingBlock(b)}
            onRefresh={refreshBlocks}
          />
          {editingBlock && (
            <EditBlockModal
              isOpen={!!editingBlock}
              block={editingBlock}
              onClose={() => setEditingBlock(null)}
              onUpdate={async (id, data) => {
                if (token) {
                  await TrainingService.updateBlock(token, id, data);
                  await refreshBlocks();
                }
              }}
              onDelete={async (id) => {
                if (token) {
                  await TrainingService.deleteBlock(token, id);
                  await refreshBlocks();
                  setSelectedBlockId(null);
                  window.location.hash = '/training';
                }
              }}
            />
          )}
        </>
      );
    }

    return (
      <>
        <TrainingBlockList
          blocks={blocks}
          onSelectBlock={(id) => window.location.hash = `/training/${id}`}
          onCreateBlock={() => {
            if (appUser?.coachId) {
              setIsRestrictionDialogOpen(true);
            } else {
              setIsCreateModalOpen(true);
            }
          }}
        />
        <CreateBlockModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={async (blockData) => {
            if (token) {
              await TrainingService.createBlock(token, {
                title: blockData.title!,
                source: blockData.source,
                startDate: blockData.startDate,
                weeks: blockData.weeks
              });
              await refreshBlocks();
            }
          }}
        />
        <ConfirmDialog
          isOpen={isRestrictionDialogOpen}
          onClose={() => setIsRestrictionDialogOpen(false)}
          onConfirm={() => setIsRestrictionDialogOpen(false)}
          title="Acción Restringida"
          message="No puedes crear bloques propios porque tienes un entrenador asignado. Contacta con tu entrenador para solicitar cambios en tu planificación."
          confirmText="Entendido"
          cancelText="Cerrar"
          type="info"
        />
      </>
    );
  };

  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              {authMode === 'login'
                ? <Login onSwitchToRegister={() => setAuthMode('register')} />
                : <Register onSwitchToLogin={() => setAuthMode('login')} />
              }
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register onSwitchToLogin={() => setAuthMode('login')} />
            </AuthRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard
                  user={appUser!}
                  activeBlocks={blocks}
                  progressData={progressData}
                  onNavigate={(path) => window.location.hash = path}
                />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/training/:blockId?"
          element={
            <ProtectedRoute>
              <Layout>
                <TrainingView />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Layout>
                <ProgressCharts data={progressData} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile user={appUser!} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach"
          element={
            <ProtectedRoute>
              <Layout>
                <CoachDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;