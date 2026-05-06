import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrainingBlock } from '../types';
import { TrainingService } from '../services/apiService';
import { TrainingBlockList, BlockDetail } from '../components/TrainingBlock';
import { CreateBlockModal } from '../components/CreateBlockModal';
import { EditBlockModal } from '../components/EditBlockModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useTrainingData } from '../contexts/TrainingDataContext';

export const TrainingPage: React.FC = () => {
  const { blocks, refreshData: refreshBlocks } = useTrainingData();
  const { user, token } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TrainingBlock | null>(null);
  const [isRestrictionDialogOpen, setIsRestrictionDialogOpen] = useState(false);
  const [adminLoadedBlock, setAdminLoadedBlock] = useState<TrainingBlock | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { blockId } = useParams();

  useEffect(() => {
    if (blockId) {
      setSelectedBlockId(blockId);
      // Si es admin y el bloque no está en la lista local, cargarlo
      if (user?.role === 'admin' && token) {
        const localBlock = blocks.find(b => b.id === blockId);
        if (!localBlock) {
          TrainingService.getBlockById(token, blockId).then(remoteBlock => {
            if (remoteBlock) {
              setAdminLoadedBlock(remoteBlock);
            }
          });
        }
      }
    } else {
      setSelectedBlockId(null);
      setAdminLoadedBlock(null);
    }
  }, [blockId, user?.role, token, blocks]);

  if (selectedBlockId) {
    // Primero buscar en bloques locales, luego en el bloque cargado por admin
    const block = blocks.find(b => b.id === selectedBlockId) || adminLoadedBlock;
    if (!block) return <div className="flex items-center justify-center h-64 text-slate-400">Cargando bloque...</div>;

    return (
      <>
        <BlockDetail
          block={block}
          onBack={() => {
            setSelectedBlockId(null);
            setAdminLoadedBlock(null);
            // Admin vuelve a /admin, otros usuarios a /training
            window.location.hash = user?.role === 'admin' ? '/admin' : '/training';
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
          if (user?.coachId) {
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
              description: blockData.description,
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
