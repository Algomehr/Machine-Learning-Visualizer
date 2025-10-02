import type { ActivationFunction } from './types';

export const DEFAULT_LEARNING_RATE: number = 0.03;
export const MIN_LEARNING_RATE: number = 0.0001;
export const MAX_LEARNING_RATE: number = 1.0;
export const LEARNING_RATE_STEP: number = 0.001;


export const ACTIVATION_FUNCTIONS: ActivationFunction[] = ['relu', 'sigmoid', 'tanh'];

export const MAX_LAYERS: number = 5;
export const MIN_NEURONS: number = 1;
export const MAX_NEURONS: number = 10;

export const VIS_NODE_RADIUS: number = 12;
export const VIS_LAYER_GAP: number = 100;
export const VIS_NODE_GAP: number = 40;
