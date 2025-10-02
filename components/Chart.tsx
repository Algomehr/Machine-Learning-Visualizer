
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TrainingHistory } from '../types';

interface PerformanceChartsProps {
    history: TrainingHistory;
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ history }) => {
    return (
        <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.loss} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                        dataKey="epoch" 
                        stroke="#9ca3af" 
                        tick={{ fontSize: 10 }} 
                        domain={['dataMin', 'dataMax']}
                        type="number"
                    />
                    <YAxis 
                        stroke="#9ca3af" 
                        tick={{ fontSize: 10 }}
                        domain={[0, 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                        labelStyle={{ color: '#d1d5db' }}
                    />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Loss" 
                        stroke="#f472b6" // pink-400
                        strokeWidth={2}
                        dot={false} 
                        isAnimationActive={false}
                        data={history.loss}
                    />
                     <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Accuracy" 
                        stroke="#2dd4bf" // teal-400
                        strokeWidth={2}
                        dot={false} 
                        isAnimationActive={false}
                        data={history.accuracy}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
