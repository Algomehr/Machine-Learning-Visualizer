import type { DataPoint } from '../types';

export class SVM {
    private learningRate: number;
    private C: number; // Regularization parameter
    private weights: number[];
    private bias: number;

    constructor(learningRate: number, C: number) {
        this.learningRate = learningRate;
        this.C = C;
        this.weights = [];
        this.bias = 0;
    }

    private initializeWeights(inputSize: number): void {
        if (this.weights.length === 0) {
            this.weights = Array(inputSize).fill(0).map(() => Math.random() * 0.01);
        }
    }

    /**
     * Predicts the label for a given set of inputs.
     * Returns 0 or 1.
     */
    predict(inputs: number[]): number {
        this.initializeWeights(inputs.length);
        const decision = inputs.reduce((sum, input, i) => sum + input * this.weights[i], 0) + this.bias;
        return decision >= 0 ? 1 : 0;
    }

    /**
     * Performs one epoch of training using Stochastic Gradient Descent.
     */
    trainEpoch(data: DataPoint[]): { averageLoss: number, accuracy: number } {
        if (data.length === 0) return { averageLoss: 0, accuracy: 0 };
        this.initializeWeights(data[0].inputs.length);

        let totalLoss = 0;
        let correctPredictions = 0;
        
        const shuffledData = [...data].sort(() => Math.random() - 0.5);

        for (const { inputs, label } of shuffledData) {
            // SVM works with labels -1 and 1
            const trueLabel = label === 1 ? 1 : -1;
            
            const decision = inputs.reduce((sum, input, i) => sum + input * this.weights[i], 0) + this.bias;

            if (Math.sign(decision) === Math.sign(trueLabel)) {
                 correctPredictions++;
            }
            
            // Hinge Loss and Gradient Calculation
            const loss = Math.max(0, 1 - trueLabel * decision);
            totalLoss += loss;
            
            if (loss > 0) {
                // Misclassified or on the margin: update weights and bias
                for (let i = 0; i < this.weights.length; i++) {
                    this.weights[i] += this.learningRate * (this.C * trueLabel * inputs[i] - this.weights[i] / data.length);
                }
                this.bias += this.learningRate * this.C * trueLabel;
            } else {
                // Correctly classified: only apply regularization
                 for (let i = 0; i < this.weights.length; i++) {
                    this.weights[i] += this.learningRate * (-this.weights[i] / data.length);
                }
            }
        }
        
        return {
            averageLoss: totalLoss / data.length,
            accuracy: this.getAccuracy(data), // Recalculate accuracy on the whole set for a stable measure
        };
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