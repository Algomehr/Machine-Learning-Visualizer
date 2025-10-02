
import React, { useRef, useEffect, useMemo } from 'react';
import type { DataPoint } from '../types';

interface DataVisualizerProps {
    data: DataPoint[];
    predict: ((inputs: number[]) => number) | null | undefined;
}

const RESOLUTION = 25; // Lower for better performance
const POINT_RADIUS = 3.5;

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ data, predict }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const dataBounds = useMemo(() => {
        if (!data || data.length === 0) return { minX: -2, maxX: 2, minY: -2, maxY: 2 };
        
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const point of data) {
            minX = Math.min(minX, point.inputs[0]);
            maxX = Math.max(maxX, point.inputs[0]);
            minY = Math.min(minY, point.inputs[1]);
            maxY = Math.max(maxY, point.inputs[1]);
        }
        const padding = 0.5;
        return { minX: minX-padding, maxX: maxX+padding, minY: minY-padding, maxY: maxY+padding };
    }, [data]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        const { minX, maxX, minY, maxY } = dataBounds;
        const xScale = width / (maxX - minX);
        const yScale = height / (maxY - minY);

        // Draw decision boundary
        if (predict) {
            const stepX = (maxX - minX) / RESOLUTION;
            const stepY = (maxY - minY) / RESOLUTION;

            for (let i = 0; i < RESOLUTION; i++) {
                for (let j = 0; j < RESOLUTION; j++) {
                    const x = minX + i * stepX;
                    const y = minY + j * stepY;
                    
                    const output = predict([x, y]);
                    
                    // Using HSL for better visual separation
                    // Blue (class 0) to Yellow (class 1)
                    const hue = 240 - (output * 180); // 240 (blue) to 60 (yellow)
                    ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.4)`;
                    ctx.fillRect(i * (width / RESOLUTION), j * (height / RESOLUTION), (width / RESOLUTION)+1, (height / RESOLUTION)+1);
                }
            }
        } else {
             ctx.fillStyle = '#1f2937'; // gray-800
             ctx.fillRect(0, 0, width, height);
        }

        // Draw data points
        data.forEach(point => {
            const x = (point.inputs[0] - minX) * xScale;
            const y = height - ((point.inputs[1] - minY) * yScale); // Invert Y for canvas coords

            ctx.beginPath();
            ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI);
            ctx.fillStyle = point.label === 1 ? 'rgb(250, 204, 21)' : 'rgb(59, 130, 246)'; // yellow-400 or blue-500
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

    }, [data, predict, dataBounds]);

    return (
        <div className="w-full aspect-square relative">
            <canvas ref={canvasRef} className="w-full h-full rounded-md bg-gray-700/50" width="400" height="400"></canvas>
        </div>
    );
};
