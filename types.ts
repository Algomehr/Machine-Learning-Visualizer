export type ActivationFunction = 'relu' | 'sigmoid' | 'tanh';

export type Algorithm = 'neuralNetwork' | 'knn' | 'svm';

export interface DataPoint {
    inputs: number[];
    label: number;
}

export interface LayerDefinition {
    neurons: number;
    activation: ActivationFunction;
}

export interface TrainingHistory {
    loss: { epoch: number; value: number }[];
    accuracy: { epoch: number; value: number }[];
}

export interface NeuronState {
    activation: number;
}

export interface LayerState {
    neurons: NeuronState[];
    weights: number[][];
    biases: number[];
}

export interface NetworkState {
    layers: LayerState[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}
