
import type { ActivationFunction, DataPoint, LayerDefinition, NetworkState } from '../types';

// Activation Functions and their derivatives
const activations = {
    sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
    relu: (x: number) => Math.max(0, x),
    tanh: (x: number) => Math.tanh(x),
};

const derivatives = {
    sigmoid: (y: number) => y * (1 - y),
    relu: (y: number) => (y > 0 ? 1 : 0),
    tanh: (y: number) => 1 - y * y,
};

class Layer {
    weights: number[][];
    biases: number[];
    activationFn: (x: number) => number;
    derivativeFn: (y: number) => number;
    // For visualization and backpropagation
    inputs: number[] = []; 
    outputs: number[] = [];

    constructor(inputSize: number, outputSize: number, activation: ActivationFunction) {
        this.weights = Array(outputSize).fill(0).map(() => 
            Array(inputSize).fill(0).map(() => Math.random() * 2 - 1) // Initialize weights between -1 and 1
        );
        this.biases = Array(outputSize).fill(0).map(() => Math.random() * 2 - 1);
        this.activationFn = activations[activation];
        this.derivativeFn = derivatives[activation];
    }

    forward(inputs: number[]): number[] {
        this.inputs = inputs;
        this.outputs = this.weights.map((neuronWeights, i) => {
            const sum = neuronWeights.reduce((acc, weight, j) => acc + weight * inputs[j], 0) + this.biases[i];
            return this.activationFn(sum);
        });
        return this.outputs;
    }
}

export class NeuralNetwork {
    layers: Layer[];
    learningRate: number;

    constructor(inputSize: number, layerDefs: LayerDefinition[], learningRate: number) {
        this.layers = [];
        this.learningRate = learningRate;
        let currentInputSize = inputSize;

        for (const def of layerDefs) {
            const layer = new Layer(currentInputSize, def.neurons, def.activation);
            this.layers.push(layer);
            currentInputSize = def.neurons;
        }
    }

    predict(inputs: number[]): number {
        let currentOutputs = inputs;
        for (const layer of this.layers) {
            currentOutputs = layer.forward(currentOutputs);
        }
        return currentOutputs[0]; // Assuming final layer has one output
    }

    trainEpoch(data: DataPoint[]): { averageLoss: number; accuracy: number } {
        let totalLoss = 0;
        let correctPredictions = 0;
        
        // Shuffle data for stochastic gradient descent
        const shuffledData = [...data].sort(() => Math.random() - 0.5);

        for (const { inputs, label } of shuffledData) {
            // Forward pass
            let currentOutputs = inputs;
            for (const layer of this.layers) {
                currentOutputs = layer.forward(currentOutputs);
            }
            const finalOutput = currentOutputs[0];

            // Calculate loss (Mean Squared Error) and accuracy
            const error = label - finalOutput;
            totalLoss += error * error;
            if (Math.round(finalOutput) === label) {
                correctPredictions++;
            }

            // Backward pass
            let errors = [error];
            for (let i = this.layers.length - 1; i >= 0; i--) {
                const layer = this.layers[i];
                const gradients = layer.outputs.map((output, j) => errors[j] * layer.derivativeFn(output));
                
                const nextErrors = Array(layer.inputs.length).fill(0);
                for (let j = 0; j < gradients.length; j++) { // for each neuron in current layer
                    for (let k = 0; k < layer.inputs.length; k++) { // for each input to that neuron
                        // Calculate error for the previous layer
                        nextErrors[k] += layer.weights[j][k] * gradients[j];
                        // Update weight
                        layer.weights[j][k] += this.learningRate * gradients[j] * layer.inputs[k];
                    }
                    // Update bias
                    layer.biases[j] += this.learningRate * gradients[j];
                }
                errors = nextErrors;
            }
        }
        return {
            averageLoss: totalLoss / data.length,
            accuracy: correctPredictions / data.length,
        };
    }
    
    getState(): NetworkState {
        return {
            layers: this.layers.map(layer => ({
                neurons: layer.outputs.map(activation => ({ activation })),
                weights: layer.weights,
                biases: layer.biases,
            }))
        };
    }
}
