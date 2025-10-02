
import type { DataPoint } from '../types';

/**
 * Calculates the Euclidean distance between two points.
 */
function euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

export class KNN {
    private k: number;
    private data: DataPoint[] = [];

    constructor(k: number) {
        this.k = Math.max(1, k); // Ensure k is at least 1
    }

    /**
     * "Trains" the model by storing the dataset.
     */
    fit(data: DataPoint[]): void {
        this.data = data;
    }

    /**
     * Predicts the label for a given set of inputs.
     */
    predict(inputs: number[]): number {
        if (this.data.length === 0) {
            return 0; // Default prediction
        }

        // Calculate distances to all points in the dataset
        const distances = this.data.map(point => ({
            dist: euclideanDistance(inputs, point.inputs),
            label: point.label,
        }));

        // Sort by distance and take the k-nearest
        distances.sort((a, b) => a.dist - b.dist);
        const kNearest = distances.slice(0, this.k);

        // Count votes for each label among the nearest neighbors
        const votes = kNearest.reduce((acc, neighbor) => {
            acc[neighbor.label] = (acc[neighbor.label] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        // Find the label with the most votes
        const sortedVotes = Object.entries(votes).sort((a, b) => b[1] - a[1]);
        
        // Return the most frequent label
        return Number(sortedVotes[0][0]);
    }

    /**
     * Calculates the accuracy of the model on a given dataset.
     */
    getAccuracy(testData: DataPoint[]): number {
        if (testData.length === 0) {
            return 0;
        }
        let correct = 0;
        for (const point of testData) {
            if (this.predict(point.inputs) === point.label) {
                correct++;
            }
        }
        return correct / testData.length;
    }
}
