
import type { DataPoint } from '../types';

function generateSpiralData(pointsPerArm: number = 100, noise: number = 0.2): DataPoint[] {
    const data: DataPoint[] = [];
    for (let i = 0; i < pointsPerArm; i++) {
        const r1 = i / pointsPerArm * 5;
        const t1 = 1.75 * i / pointsPerArm * 2 * Math.PI;
        const x1 = r1 * Math.sin(t1) + (Math.random() - 0.5) * noise;
        const y1 = r1 * Math.cos(t1) + (Math.random() - 0.5) * noise;
        data.push({ inputs: [x1/5, y1/5], label: 0 });

        const r2 = i / pointsPerArm * 5;
        const t2 = 1.75 * i / pointsPerArm * 2 * Math.PI + Math.PI;
        const x2 = r2 * Math.sin(t2) + (Math.random() - 0.5) * noise;
        const y2 = r2 * Math.cos(t2) + (Math.random() - 0.5) * noise;
        data.push({ inputs: [x2/5, y2/5], label: 1 });
    }
    return data;
}

function generateCircleData(numPoints: number = 200, noise: number = 0.1): DataPoint[] {
    const data: DataPoint[] = [];
    const radius = 2;
    for (let i = 0; i < numPoints; i++) {
        const r = Math.random() * radius;
        const angle = Math.random() * 2 * Math.PI;
        const x = r * Math.sin(angle);
        const y = r * Math.cos(angle);
        const label = (r < radius * 0.6) ? 1 : 0;
        const noisyX = x + (Math.random() - 0.5) * noise;
        const noisyY = y + (Math.random() - 0.5) * noise;
        data.push({ inputs: [noisyX, noisyY], label });
    }
    return data;
}


function generateXORData(numPoints: number = 200, noise: number = 0.2): DataPoint[] {
    const data: DataPoint[] = [];
    for (let i = 0; i < numPoints; i++) {
        const x = Math.random() * 4 - 2;
        const y = Math.random() * 4 - 2;
        const label = (x > 0) !== (y > 0) ? 1 : 0;
        const noisyX = x + (Math.random() - 0.5) * noise;
        const noisyY = y + (Math.random() - 0.5) * noise;
        data.push({ inputs: [noisyX / 2, noisyY / 2], label });
    }
    return data;
}


function generateTwoGaussiansData(numPoints: number = 200, noise: number = 0.5): DataPoint[] {
    const data: DataPoint[] = [];
    const cx1 = 2, cy1 = 2, cx2 = -2, cy2 = -2;

    for (let i = 0; i < numPoints / 2; i++) {
        data.push({
            inputs: [
                cx1 + (Math.random() - 0.5) * noise * 4,
                cy1 + (Math.random() - 0.5) * noise * 4
            ],
            label: 1
        });
        data.push({
            inputs: [
                cx2 + (Math.random() - 0.5) * noise * 4,
                cy2 + (Math.random() - 0.5) * noise * 4
            ],
            label: 0
        });
    }
    return data.map(d => ({ inputs: [d.inputs[0]/3, d.inputs[1]/3], label: d.label}));
}

export const DATASETS: { [key: string]: { generator: () => DataPoint[]; displayName: string } } = {
    spiral: { generator: generateSpiralData, displayName: 'Spiral' },
    circle: { generator: generateCircleData, displayName: 'Circle' },
    xor: { generator: generateXORData, displayName: 'XOR' },
    gaussians: { generator: generateTwoGaussiansData, displayName: 'Clusters' },
};

export function generateData(name: string): DataPoint[] {
    return DATASETS[name]?.generator() || generateSpiralData();
}
