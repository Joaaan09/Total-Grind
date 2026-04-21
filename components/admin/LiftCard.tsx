import React from 'react';

export const LiftCard: React.FC<{
    title: string;
    data: { estimated: number; actual: number };
    isTotal?: boolean;
}> = ({ title, data, isTotal }) => {
    return (
        <div className={`${isTotal ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-600/50'} rounded-lg p-3`}>
            <p className={`text-sm font-medium ${isTotal ? 'text-amber-500' : 'text-slate-400'} mb-2`}>
                {title}
            </p>
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Est:</span>
                    <span className="text-slate-50 font-bold">{data.estimated || '-'} kg</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Real:</span>
                    <span className="text-emerald-500 font-bold">{data.actual || '-'} kg</span>
                </div>
            </div>
        </div>
    );
};
