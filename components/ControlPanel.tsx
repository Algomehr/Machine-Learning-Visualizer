import React from 'react';
import type { LayerDefinition, Algorithm } from '../types';
import { ACTIVATION_FUNCTIONS, LEARNING_RATE_STEP, MAX_LEARNING_RATE, MIN_LEARNING_RATE, MAX_LAYERS } from '../constants';
import { DATASETS } from '../services/datasetGenerator';
import { PlayIcon, PauseIcon, ResetIcon, PlusIcon, TrashIcon } from './icons';

interface ControlPanelProps {
    algorithm: Algorithm;
    setAlgorithm: (algo: Algorithm) => void;
    layers: LayerDefinition[];
    learningRate: number;
    setLearningRate: (rate: number) => void;
    datasetName: string;
    handleDatasetChange: (name: string) => void;
    isTraining: boolean;
    handleToggleTraining: () => void;
    handleReset: () => void;
    handleAddLayer: () => void;
    handleRemoveLayer: (index: number) => void;
    handleLayerChange: (index: number, key: 'neurons' | 'activation', value: number | string) => void;
    epoch: number;
    k: number;
    setK: (k: number) => void;
    knnAccuracy: number | null;
    svmC: number;
    setSvmC: (c: number) => void;
    svmLearningRate: number;
    setSvmLearningRate: (rate: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    algorithm,
    setAlgorithm,
    layers,
    learningRate,
    setLearningRate,
    datasetName,
    handleDatasetChange,
    isTraining,
    handleToggleTraining,
    handleReset,
    handleAddLayer,
    handleRemoveLayer,
    handleLayerChange,
    epoch,
    k,
    setK,
    knnAccuracy,
    svmC,
    setSvmC,
    svmLearningRate,
    setSvmLearningRate,
}) => {
    const ALGORITHMS: { id: Algorithm; name: string }[] = [
        { id: 'neuralNetwork', name: 'Neural Network' },
        { id: 'knn', name: 'KNN' },
        { id: 'svm', name: 'SVM' },
    ];

    const isTrainable = algorithm === 'neuralNetwork' || algorithm === 'svm';

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div>
                 <h2 className="text-xl font-bold text-gray-100">Controls</h2>
            </div>

            <div className="space-y-2">
                <label htmlFor="algorithm-select" className="block text-sm font-medium text-gray-400">Algorithm</label>
                <select
                    id="algorithm-select"
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                    className="w-full bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm p-2"
                >
                    {ALGORITHMS.map(algo => (
                        <option key={algo.id} value={algo.id}>
                            {algo.name}
                        </option>
                    ))}
                </select>
            </div>

            {isTrainable && (
                <div className="flex items-center justify-between">
                    <div className="text-sm font-mono bg-gray-900 px-3 py-1 rounded-md text-cyan-400">
                        Epoch: {epoch.toString().padStart(5, '0')}
                    </div>
                </div>
            )}

            <div className="flex space-x-2">
                {isTrainable && (
                    <button
                        onClick={handleToggleTraining}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                        {isTraining ? <PauseIcon className="w-5 h-5 mr-2"/> : <PlayIcon className="w-5 h-5 mr-2" />}
                        {isTraining ? 'Pause' : 'Train'}
                    </button>
                )}
                <button
                    onClick={handleReset}
                    className={`${!isTrainable ? 'flex-1' : ''} px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center justify-center`}
                >
                    <ResetIcon className="w-5 h-5" />
                    <span className="ml-2">Reset</span>
                </button>
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-400">Dataset</label>
                <div className="grid grid-cols-2 gap-2">
                    {Object.keys(DATASETS).map(name => (
                        <button
                            key={name}
                            onClick={() => handleDatasetChange(name)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                                datasetName === name ? 'bg-cyan-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                        >
                            {DATASETS[name].displayName}
                        </button>
                    ))}
                </div>
            </div>
            
            {algorithm === 'knn' && (
                 <div className="space-y-3">
                    <label htmlFor="kValue" className="block text-sm font-medium text-gray-400">Neighbors (K): {k}</label>
                    <input
                        id="kValue"
                        type="range"
                        min={1}
                        max={15}
                        step={1}
                        value={k}
                        onChange={(e) => setK(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    {knnAccuracy !== null && (
                         <div className="text-sm font-mono bg-gray-900 px-3 py-1 rounded-md text-cyan-400 text-center">
                            Accuracy: {(knnAccuracy * 100).toFixed(1)}%
                         </div>
                    )}
                </div>
            )}
            
            {algorithm === 'svm' && (
                <div className="space-y-3">
                     <div>
                        <label htmlFor="svmC" className="block text-sm font-medium text-gray-400">Regularization (C): {svmC}</label>
                        <input
                            id="svmC"
                            type="range"
                            min={0.1}
                            max={10}
                            step={0.1}
                            value={svmC}
                            onChange={(e) => setSvmC(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="svmLearningRate" className="block text-sm font-medium text-gray-400">Learning Rate: {svmLearningRate.toFixed(4)}</label>
                        <input
                            id="svmLearningRate"
                            type="range"
                            min={0.0001}
                            max={0.1}
                            step={0.0001}
                            value={svmLearningRate}
                            onChange={(e) => setSvmLearningRate(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>
                </div>
            )}

            {algorithm === 'neuralNetwork' && (
                <>
                <div className="space-y-3">
                    <label htmlFor="learningRate" className="block text-sm font-medium text-gray-400">Learning Rate: {learningRate.toFixed(4)}</label>
                    <input
                        id="learningRate"
                        type="range"
                        min={MIN_LEARNING_RATE}
                        max={MAX_LEARNING_RATE}
                        step={LEARNING_RATE_STEP}
                        value={learningRate}
                        onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
                <div className="space-y-4 flex-grow overflow-y-auto pr-2 -mr-2">
                    <h3 className="text-lg font-semibold text-gray-100">Hidden Layers</h3>
                    {layers.map((layer, index) => (
                        <div key={index} className="bg-gray-700/50 p-3 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold">Layer {index + 1}</h4>
                                <button
                                    onClick={() => handleRemoveLayer(index)}
                                    disabled={layers.length <= 1}
                                    className="text-gray-400 hover:text-red-500 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="text-sm text-gray-400 flex-1">Neurons</label>
                                <input
                                    type="number"
                                    value={layer.neurons}
                                    onChange={(e) => handleLayerChange(index, 'neurons', parseInt(e.target.value))}
                                    className="w-20 bg-gray-900 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                             <div className="flex items-center space-x-4">
                                <label className="text-sm text-gray-400 flex-1">Activation</label>
                                <select
                                    value={layer.activation}
                                    onChange={(e) => handleLayerChange(index, 'activation', e.target.value)}
                                    className="w-20 bg-gray-900 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm p-1"
                                >
                                    {ACTIVATION_FUNCTIONS.map(fn => (
                                        <option key={fn} value={fn}>{fn}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={handleAddLayer}
                        disabled={layers.length >= MAX_LAYERS}
                        className="w-full flex items-center justify-center mt-2 px-4 py-2 border-2 border-dashed border-gray-600 hover:border-cyan-500 hover:text-cyan-500 text-gray-400 font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Layer
                    </button>
                </div>
                </>
            )}
        </div>
    );
};