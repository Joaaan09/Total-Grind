import React from 'react';

export const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ title, value, icon, color }) => {
    const colors = {
        blue: 'bg-slate-800 text-brandRed-500 border-slate-700',
        green: 'bg-green-500/20 text-emerald-500 border-green-500/30',
        purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        orange: 'bg-orange-500/20 text-amber-500 border-orange-500/30'
    };

    return (
        <div className={`${colors[color]} border rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
                {icon}
            </div>
            <p className="text-2xl md:text-3xl font-bold text-slate-50">{value}</p>
            <p className="text-sm text-slate-400">{title}</p>
        </div>
    );
};
