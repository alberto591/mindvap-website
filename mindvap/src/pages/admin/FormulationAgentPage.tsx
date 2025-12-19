import { useState, useEffect } from 'react';
import { FlaskConical, Sparkles, ScrollText, Key, Leaf, Flame, Droplet, Coffee } from 'lucide-react';
import { generateFormulation, type FormulationCriteria, type FormulationResult } from '../../services/formulationService';

export default function FormulationAgentPage() {
    const [apiKey, setApiKey] = useState('');
    const [criteria, setCriteria] = useState<FormulationCriteria>({
        goal: 'relaxation',
        format: 'tea',
        constraints: []
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<FormulationResult | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const savedKey = localStorage.getItem('openai_api_key');
        if (savedKey) setApiKey(savedKey);
    }, []);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKey = e.target.value;
        setApiKey(newKey);
        localStorage.setItem('openai_api_key', newKey);
    };

    const handleCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCriteria(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            setError('Please provide an OpenAI API Key to use the Master Herbalist AI.');
            return;
        }
        setError('');
        setIsGenerating(true);
        setResult(null);

        try {
            const data = await generateFormulation({ ...criteria, apiKey });
            setResult(data);
        } catch (err) {
            console.error(err);
            setError('Failed to generate formulation. Please check your API key.');
        } finally {
            setIsGenerating(false);
        }
    };

    const FormatIcon = ({ format }: { format: string }) => {
        switch (format) {
            case 'tea': return <Coffee size={18} />;
            case 'smoking_blend': return <Flame size={18} />;
            case 'incense': return <Sparkles size={18} />;
            case 'tincture': return <Droplet size={18} />;
            default: return <Leaf size={18} />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="font-headline text-3xl font-medium text-text-primary mb-2">AI Formulation Agent</h1>
                <p className="text-text-secondary">Create custom herbal blends for mental health and wellness goals using AI.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Inputs */}
                <div className="lg:col-span-1 space-y-6">

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border-light">
                        <div className="flex items-center gap-2 mb-4">
                            <Key size={18} className="text-brand-primary" />
                            <h2 className="font-semibold text-text-primary">Configuration</h2>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">OpenAI API Key</label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={handleApiKeyChange}
                                placeholder="sk-..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-brand-primary"
                            />
                            <p className="text-xs text-text-tertiary mt-2">
                                Stored locally. Required to generate recipes.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border-light">
                        <h2 className="font-semibold text-text-primary mb-4">Blend Criteria</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Target Goal</label>
                                <select
                                    name="goal"
                                    value={criteria.goal}
                                    onChange={handleCriteriaChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary bg-white"
                                >
                                    <option value="calm">Calm & Serenity</option>
                                    <option value="relaxation">Deep Relaxation</option>
                                    <option value="sleep">Sleep Aid</option>
                                    <option value="mood_support">Mood Support (Uplifting)</option>
                                    <option value="focus">Focus & Concentration</option>
                                    <option value="mind_clarity">Mind Clarity</option>
                                    <option value="energy">Energy & Vitality</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Product Format</label>
                                <select
                                    name="format"
                                    value={criteria.format}
                                    onChange={handleCriteriaChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary bg-white"
                                >
                                    <option value="tea">Herbal Tea / Infusion</option>
                                    <option value="smoking_blend">Smoking Blend</option>
                                    <option value="incense">Incense / Potpourri</option>
                                    <option value="tincture">Tincture / Extract</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border-light">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-hover text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <FlaskConical size={20} />}
                                Generate Formulation
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
                    </div>
                </div>

                {/* Right Column: Output */}
                <div className="lg:col-span-2 space-y-6">

                    {result && (
                        <div className="bg-white rounded-lg shadow-sm border border-border-light overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 px-8 py-6 border-b border-border-light">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="font-headline font-bold text-2xl text-text-primary mb-1">{result.name}</h2>
                                        <p className="text-text-secondary">{result.description}</p>
                                    </div>
                                    <span className="bg-white p-2 rounded-full shadow-sm text-brand-primary">
                                        <FormatIcon format={criteria.format} />
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">

                                {/* Ingredients Table */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <Leaf size={16} /> Formula Composition
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 w-1/4">Ingredient</th>
                                                    <th className="px-4 py-3 w-1/6 text-center">Percentage</th>
                                                    <th className="px-4 py-3">Function</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {result.ingredients.map((ing, i) => (
                                                    <tr key={i} className="hover:bg-white transition-colors">
                                                        <td className="px-4 py-3 font-medium text-text-primary">{ing.name}</td>
                                                        <td className="px-4 py-3 text-center font-mono text-brand-primary">{ing.percentage}%</td>
                                                        <td className="px-4 py-3 text-text-muted italic">{ing.reason}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-yellow-50 border border-yellow-100 p-5 rounded-lg">
                                        <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <Sparkles size={16} /> Synergy & Flavor
                                        </h3>
                                        <div className="space-y-3 text-sm text-yellow-900">
                                            <p><strong>Flavor Profile:</strong> {result.flavorProfile}</p>
                                            <p><strong>Synergy Notes:</strong> {result.synergyNotes}</p>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg">
                                        <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <ScrollText size={16} /> Preparation
                                        </h3>
                                        <p className="text-sm text-blue-900 leading-relaxed">{result.instructions}</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {!isGenerating && !result && (
                        <div className="bg-gray-50 border border-border-light rounded-lg p-12 text-center text-text-secondary h-full flex flex-col items-center justify-center">
                            <FlaskConical size={64} className="text-gray-200 mb-6" />
                            <p className="text-xl font-medium text-gray-400">The Lab is Empty</p>
                            <p className="text-sm max-w-sm mx-auto mt-2 text-text-muted">
                                Select your mental health goal and preferred format, then click "Generate Formulation" to let the AI Herbalist work.
                            </p>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="bg-white border border-border-light rounded-lg p-16 text-center h-full flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary mb-6"></div>
                            <p className="text-xl font-medium text-text-primary">Formulating Recipe...</p>
                            <p className="text-sm text-text-muted mt-2">Checking synergy ratios and contraindications.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
