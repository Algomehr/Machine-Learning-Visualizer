import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { NetworkVisualizer } from './components/NetworkVisualizer';
import { DataVisualizer } from './components/DataVisualizer';
import { PerformanceCharts } from './components/Chart';
import { AiAnalystPanel } from './components/AiAnalystPanel';
import { NeuralNetwork } from './services/neuralNetwork';
import { KNN } from './services/knn';
import { SVM } from './services/svm';
import { generateData, DATASETS } from './services/datasetGenerator';
import { getAiResponse, generateDatasetWithAi } from './services/gemini';
import type { DataPoint, LayerDefinition, TrainingHistory, NetworkState, ActivationFunction, Algorithm, ChatMessage } from './types';
import { DEFAULT_LEARNING_RATE, MAX_LAYERS, MAX_NEURONS, MIN_NEURONS } from './constants';
import { GithubIcon, SparklesIcon } from './components/icons';

type Model = NeuralNetwork | KNN | SVM;

const App: React.FC = () => {
    const [algorithm, setAlgorithm] = useState<Algorithm>('neuralNetwork');
    
    // Neural Network state
    const [layers, setLayers] = useState<LayerDefinition[]>([
        { neurons: 4, activation: 'relu' },
        { neurons: 2, activation: 'relu' }
    ]);
    const [learningRate, setLearningRate] = useState<number>(DEFAULT_LEARNING_RATE);
    const [networkState, setNetworkState] = useState<NetworkState | null>(null);

    // KNN state
    const [k, setK] = useState<number>(3);
    const [knnAccuracy, setKnnAccuracy] = useState<number | null>(null);

    // SVM state
    const [svmC, setSvmC] = useState<number>(1);
    const [svmLearningRate, setSvmLearningRate] = useState<number>(0.001);

    // Common state
    const [datasetName, setDatasetName] = useState<string>(Object.keys(DATASETS)[0]);
    const [data, setData] = useState<DataPoint[]>(generateData(Object.keys(DATASETS)[0]));
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const [epoch, setEpoch] = useState<number>(0);
    const [history, setHistory] = useState<TrainingHistory>({ loss: [], accuracy: [] });
    
    const modelRef = useRef<Model | null>(null);
    const trainingFrameRef = useRef<number | null>(null);

    // AI Analyst State
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "Hello! I'm your AI Analyst. Ask me about these algorithms, your results, or ask me to create a new dataset for you!" }
    ]);
    const [isAiLoading, setIsAiLoading] = useState(false);


    const initializeModel = useCallback(() => {
        if (trainingFrameRef.current !== null) {
            cancelAnimationFrame(trainingFrameRef.current);
        }
        setIsTraining(false);
        setEpoch(0);
        setHistory({ loss: [], accuracy: [] });
        
        if (algorithm === 'neuralNetwork') {
            const inputSize = data[0]?.inputs.length || 2;
            const finalLayers: LayerDefinition[] = [...layers, { neurons: 1, activation: 'sigmoid' }];
            const nn = new NeuralNetwork(inputSize, finalLayers, learningRate);
            modelRef.current = nn;
            setNetworkState(nn.getState());
        } else if (algorithm === 'knn') {
            const knn = new KNN(k);
            knn.fit(data);
            modelRef.current = knn;
            setKnnAccuracy(knn.getAccuracy(data));
            setNetworkState(null); 
        } else if (algorithm === 'svm') {
            const svm = new SVM(svmLearningRate, svmC);
            modelRef.current = svm;
            setNetworkState(null);
        }
    }, [algorithm, layers, learningRate, k, data, svmC, svmLearningRate]);

    useEffect(() => {
        initializeModel();
    }, [initializeModel]);

    const handleDatasetChange = (name: string) => {
        setDatasetName(name);
        setData(generateData(name));
    };
    
    const trainStep = useCallback(() => {
        if (!modelRef.current) return;

        let performance: { averageLoss: number, accuracy: number } | null = null;

        if (modelRef.current instanceof NeuralNetwork) {
            performance = modelRef.current.trainEpoch(data);
            setNetworkState(modelRef.current.getState());
        } else if (modelRef.current instanceof SVM) {
            performance = modelRef.current.trainEpoch(data);
        }

        if (performance) {
            setEpoch(prev => prev + 1);
            setHistory(prev => ({
                loss: [...prev.loss, { epoch: epoch + 1, value: performance!.averageLoss }],
                accuracy: [...prev.accuracy, { epoch: epoch + 1, value: performance!.accuracy }],
            }));
        }

        trainingFrameRef.current = requestAnimationFrame(trainStep);
    }, [data, epoch]);

    const handleToggleTraining = () => {
        if (algorithm === 'knn') return;
        if (isTraining) {
            setIsTraining(false);
            if (trainingFrameRef.current !== null) {
                cancelAnimationFrame(trainingFrameRef.current);
            }
        } else {
            setIsTraining(true);
            trainingFrameRef.current = requestAnimationFrame(trainStep);
        }
    };
    
    const handleReset = () => {
        initializeModel();
    };

    const handleAddLayer = () => {
        if (layers.length < MAX_LAYERS) {
            setLayers([...layers, { neurons: 4, activation: 'relu' }]);
        }
    };

    const handleRemoveLayer = (index: number) => {
        if (layers.length > 1) {
            setLayers(layers.filter((_, i) => i !== index));
        }
    };

    const handleLayerChange = (index: number, key: 'neurons' | 'activation', value: number | string) => {
        const newLayers = [...layers];
        if(key === 'neurons') {
            const numValue = Math.max(MIN_NEURONS, Math.min(MAX_NEURONS, Number(value)));
            newLayers[index] = { ...newLayers[index], neurons: numValue };
        } else {
            newLayers[index] = { ...newLayers[index], activation: value as ActivationFunction };
        }
        setLayers(newLayers);
    };
    
    const handleAiPrompt = async (prompt: string) => {
        setAiMessages(prev => [...prev, { role: 'user', content: prompt }]);
        setIsAiLoading(true);

        try {
            const currentAccuracy = history.accuracy.length > 0 ? history.accuracy[history.accuracy.length - 1].value : (knnAccuracy || 0);
            
            const context = {
                algorithm,
                datasetName,
                epoch,
                currentAccuracy,
                history,
                // Add hyperparameters for the current model
                ...(algorithm === 'neuralNetwork' && { layers, learningRate }),
                ...(algorithm === 'knn' && { k }),
                ...(algorithm === 'svm' && { svmC, svmLearningRate }),
            };

            const response = await getAiResponse(prompt, context, aiMessages);

            if (response.functionCalls) {
                for (const fc of response.functionCalls) {
                    if (fc.name === 'generate_new_dataset') {
                        setAiMessages(prev => [...prev, { role: 'model', content: "Sure, I can do that! Generating the new dataset for you..." }]);
                        const newDataset = await generateDatasetWithAi(fc.args.description);
                        if(newDataset){
                            setData(newDataset);
                            setDatasetName(fc.args.description.substring(0,20));
                            setAiMessages(prev => [...prev, { role: 'model', content: "Here is the new dataset you requested!" }]);
                        } else {
                             setAiMessages(prev => [...prev, { role: 'model', content: "Sorry, I had trouble generating that dataset. Could you describe it differently?" }]);
                        }
                    }
                }
            } else {
                 setAiMessages(prev => [...prev, { role: 'model', content: response.text }]);
            }

        } catch (error) {
            console.error("AI Error:", error);
            setAiMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm p-3 shadow-lg flex justify-between items-center z-20 border-b border-gray-700">
                <h1 className="text-xl md:text-2xl font-bold text-cyan-400 tracking-wider">
                    ML Visualizer
                </h1>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsAiPanelOpen(!isAiPanelOpen)} className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors font-semibold px-3 py-2 rounded-lg hover:bg-gray-700/50">
                        <SparklesIcon className="w-6 h-6" />
                        <span className="hidden sm:inline">AI Analyst</span>
                    </button>
                    <a href="https://github.com/google/genai-api" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <GithubIcon className="w-7 h-7" />
                    </a>
                </div>
            </header>

            <main className="flex-grow flex flex-col lg:flex-row p-4 gap-4 relative">
                <aside className="w-full lg:w-80 xl:w-96 bg-gray-800 rounded-lg shadow-2xl p-4 overflow-y-auto flex-shrink-0 z-10">
                    <ControlPanel
                        algorithm={algorithm}
                        setAlgorithm={setAlgorithm}
                        layers={layers}
                        learningRate={learningRate}
                        setLearningRate={setLearningRate}
                        datasetName={datasetName}
                        handleDatasetChange={handleDatasetChange}
                        isTraining={isTraining}
                        handleToggleTraining={handleToggleTraining}
                        handleReset={handleReset}
                        handleAddLayer={handleAddLayer}
                        handleRemoveLayer={handleRemoveLayer}
                        handleLayerChange={handleLayerChange}
                        epoch={epoch}
                        k={k}
                        setK={setK}
                        knnAccuracy={knnAccuracy}
                        svmC={svmC}
                        setSvmC={setSvmC}
                        svmLearningRate={svmLearningRate}
                        setSvmLearningRate={setSvmLearningRate}
                    />
                </aside>
                
                <section className={`flex-grow grid grid-cols-1 ${algorithm === 'neuralNetwork' ? 'xl:grid-cols-2' : 'xl:grid-cols-1'} gap-4`}>
                    <div className="flex flex-col gap-4">
                        <div className="bg-gray-800 p-4 rounded-lg shadow-2xl flex-grow">
                            <h2 className="text-lg font-semibold mb-2 text-cyan-400">Output & Decision Boundary</h2>
                            <DataVisualizer data={data} predict={modelRef.current?.predict.bind(modelRef.current)} />
                        </div>
                        {(algorithm === 'neuralNetwork' || algorithm === 'svm') && (
                            <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
                                <h2 className="text-lg font-semibold mb-2 text-cyan-400">Training Performance</h2>
                                <PerformanceCharts history={history} />
                            </div>
                        )}
                    </div>
                    {algorithm === 'neuralNetwork' && networkState && (
                        <div className="bg-gray-800 p-4 rounded-lg shadow-2xl flex flex-col">
                            <h2 className="text-lg font-semibold mb-2 text-cyan-400">Network Architecture</h2>
                            <div className="flex-grow flex items-center justify-center">
                                <NetworkVisualizer networkState={networkState} />
                            </div>
                        </div>
                    )}
                </section>
                <AiAnalystPanel
                    isOpen={isAiPanelOpen}
                    onClose={() => setIsAiPanelOpen(false)}
                    messages={aiMessages}
                    onSend={handleAiPrompt}
                    isLoading={isAiLoading}
                />
            </main>
        </div>
    );
};

export default App;
