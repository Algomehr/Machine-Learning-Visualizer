
import React from 'react';
import type { NetworkState } from '../types';
import { VIS_NODE_RADIUS, VIS_LAYER_GAP, VIS_NODE_GAP } from '../constants';

interface NetworkVisualizerProps {
    networkState: NetworkState;
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ networkState }) => {
    const { layers } = networkState;
    if (!layers || layers.length === 0) return null;

    const allLayers = [{ neurons: Array(2).fill({ activation: 0 }) }, ...layers];
    
    const maxNeurons = Math.max(...allLayers.map(l => l.neurons.length));
    const totalHeight = maxNeurons * (2 * VIS_NODE_RADIUS + VIS_NODE_GAP) - VIS_NODE_GAP;
    const totalWidth = allLayers.length * VIS_LAYER_GAP + (allLayers.length - 1) * VIS_NODE_RADIUS * 2;
    
    return (
        <div className="w-full h-full overflow-auto">
            <svg
                viewBox={`-20 -20 ${totalWidth + 40} ${totalHeight + 40}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
            >
                <g>
                    {allLayers.map((layer, layerIndex) => {
                        const layerHeight = layer.neurons.length * (2 * VIS_NODE_RADIUS + VIS_NODE_GAP) - VIS_NODE_GAP;
                        const yOffset = (totalHeight - layerHeight) / 2;
                        const x = layerIndex * (VIS_LAYER_GAP + VIS_NODE_RADIUS * 2);

                        // Render weights (connections) first so nodes are on top
                        if (layerIndex > 0) {
                            const prevLayer = allLayers[layerIndex - 1];
                            const prevLayerHeight = prevLayer.neurons.length * (2 * VIS_NODE_RADIUS + VIS_NODE_GAP) - VIS_NODE_GAP;
                            const prevYOffset = (totalHeight - prevLayerHeight) / 2;
                            const prevX = (layerIndex - 1) * (VIS_LAYER_GAP + VIS_NODE_RADIUS * 2);

                            return layer.neurons.map((_, neuronIndex) => {
                                const y = yOffset + neuronIndex * (2 * VIS_NODE_RADIUS + VIS_NODE_GAP);
                                const weights = layers[layerIndex - 1].weights[neuronIndex];
                                
                                return prevLayer.neurons.map((_, prevNeuronIndex) => {
                                    const prevY = prevYOffset + prevNeuronIndex * (2 * VIS_NODE_RADIUS + VIS_NODE_GAP);
                                    const weight = weights[prevNeuronIndex];
                                    const opacity = Math.min(1, Math.abs(weight));
                                    const strokeColor = weight > 0 ? 'rgba(56, 189, 248, 1)' : 'rgba(251, 113, 133, 1)'; // sky-400 or rose-400
                                    
                                    return (
                                        <line
                                            key={`${layerIndex}-${neuronIndex}-${prevNeuronIndex}`}
                                            x1={prevX + VIS_NODE_RADIUS}
                                            y1={prevY + VIS_NODE_RADIUS}
                                            x2={x + VIS_NODE_RADIUS}
                                            y2={y + VIS_NODE_RADIUS}
                                            stroke={strokeColor}
                                            strokeWidth={1 + opacity * 4}
                                            strokeOpacity={0.2 + opacity * 0.8}
                                        />
                                    );
                                });
                            });
                        }
                        return null;
                    })}
                    
                    {/* Render nodes */}
                    {allLayers.map((layer, layerIndex) => {
                        const layerHeight = layer.neurons.length * (2 * VIS_NODE_RADIUS + VIS_NODE_GAP) - VIS_NODE_GAP;
                        const yOffset = (totalHeight - layerHeight) / 2;
                        const x = layerIndex * (VIS_LAYER_GAP + VIS_NODE_RADIUS * 2);

                        return layer.neurons.map((neuron, neuronIndex) => {
                            const y = yOffset + neuronIndex * (2 * VIS_NODE_RADIUS + VIS_NODE_GAP);
                            const activation = neuron.activation;
                            
                            const isInput = layerIndex === 0;
                            const fill = `rgba(59, 130, 246, ${isInput ? 0.3 : Math.max(0.1, activation)})`; // blue-500
                            const stroke = isInput ? 'rgba(156, 163, 175, 0.5)' : `rgba(96, 165, 250, ${Math.max(0.3, activation)})`; // gray-400 or blue-400
                            
                            return (
                                <g key={`${layerIndex}-${neuronIndex}`} transform={`translate(${x}, ${y})`}>
                                    <circle
                                        cx={VIS_NODE_RADIUS}
                                        cy={VIS_NODE_RADIUS}
                                        r={VIS_NODE_RADIUS}
                                        fill={fill}
                                        stroke={stroke}
                                        strokeWidth="2"
                                    />
                                </g>
                            );
                        });
                    })}
                </g>
            </svg>
        </div>
    );
};
