import { useState, useEffect } from 'react';
import { Scale, BookOpen, ShieldAlert, FileText, Search, Key, AlertTriangle } from 'lucide-react';
import { generateLegalSearchQuery, analyzeRegulationsWithAI, type LegalCriteria, type LegalAnalysisResult } from '../../../application/services/legal-service';

export default function LegalResearchPage() {
    const [apiKey, setApiKey] = useState('');
    const [criteria, setCriteria] = useState<LegalCriteria>({
        productName: '',
        jurisdiction: 'EU',
        intendedUse: 'tea'
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [generatedQuery, setGeneratedQuery] = useState('');
    const [result, setResult] = useState<LegalAnalysisResult | null>(null);
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

    const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCriteria(prev => ({ ...prev, [name]: value }));
    };

    const generateQueries = () => {
        if (!criteria.productName) return;
        const query = generateLegalSearchQuery(criteria);
        setGeneratedQuery(query);
    };

    const handleManualSearch = () => {
        if (!generatedQuery) generateQueries();
        const query = generatedQuery || generateLegalSearchQuery(criteria);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    };

    const runAnalysis = async () => {
        if (!apiKey) {
            setError('Please provide an OpenAI API Key for AI analysis.');
            return;
        }
        setError('');
        setIsAnalyzing(true);
        setResult(null);

        try {
            const data = await analyzeRegulationsWithAI({ ...criteria, apiKey });
            setResult(data);
        } catch (err) {
            console.error(err);
            setError('Failed to run analysis. Please check your API key.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="font-headline text-3xl font-medium text-text-primary mb-2">AI Law Research Agent</h1>
                <p className="text-text-secondary">Analyze regulatory status and identify compliance workarounds for your products.</p>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex gap-3 text-sm text-yellow-800">
                    <AlertTriangle size={20} className="flex-shrink-0" />
                    <p>
                        <strong>Disclaimer:</strong> This tool provides research assistance and creative compliance ideas only.
                        It does <u>not</u> provide legal advice. Always consult with a qualified attorney before making business decisions.
                    </p>
                </div>
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
                                Stored locally. Required for "Analyze Regulations".
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border-light">
                        <h2 className="font-semibold text-text-primary mb-4">Product Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Product / Herb Name</label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={criteria.productName}
                                    onChange={handleCriteriaChange}
                                    placeholder="e.g. Blue Lotus, Damiana"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Target Jurisdiction</label>
                                <input
                                    type="text"
                                    name="jurisdiction"
                                    value={criteria.jurisdiction}
                                    onChange={handleCriteriaChange}
                                    placeholder="e.g. EU, USA, Spain, UK"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Intended Use</label>
                                <select
                                    name="intendedUse"
                                    value={criteria.intendedUse}
                                    onChange={handleCriteriaChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary bg-white"
                                >
                                    <option value="tea">Tea / Infusion</option>
                                    <option value="incense">Incense / Aromatic</option>
                                    <option value="smoking">Smoking Blend</option>
                                    <option value="cosmetic">Cosmetic / Topical</option>
                                    <option value="supplement">Food Supplement</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border-light space-y-3">
                            <button
                                onClick={generateQueries}
                                disabled={!criteria.productName}
                                className="w-full flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-text-primary font-medium py-2 rounded-md transition-colors disabled:opacity-50"
                            >
                                <Search size={18} />
                                Generate Search Query
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleManualSearch}
                                    disabled={!criteria.productName}
                                    className="flex justify-center items-center gap-2 border border-gray-300 hover:bg-gray-50 text-text-secondary py-2 rounded-md transition-colors disabled:opacity-50"
                                >
                                    <BookOpen size={18} />
                                    Research
                                </button>
                                <button
                                    onClick={runAnalysis}
                                    disabled={!criteria.productName || isAnalyzing}
                                    className="flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-hover text-white py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAnalyzing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Scale size={18} />}
                                    Analyze
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
                    </div>
                </div>

                {/* Right Column: Output */}
                <div className="lg:col-span-2 space-y-6">

                    {generatedQuery && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
                                <Search size={16} />
                                Regulatory Search Query
                            </h3>
                            <code className="block bg-white p-3 rounded border border-blue-100 text-sm text-gray-700 font-mono break-all">
                                {generatedQuery}
                            </code>
                        </div>
                    )}

                    {result && (
                        <div className="bg-white rounded-lg shadow-sm border border-border-light overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-border-light flex justify-between items-center">
                                <h2 className="font-semibold text-text-primary flex items-center gap-2">
                                    <Scale size={20} className="text-brand-primary" />
                                    Legal Analysis Result
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${result.status === 'Allowed' ? 'bg-green-100 text-green-800' :
                                        result.status === 'Restricted' ? 'bg-orange-100 text-orange-800' :
                                            result.status === 'Gray Area' ? 'bg-gray-200 text-gray-800' :
                                                'bg-red-100 text-red-800'
                                    }`}>
                                    {result.status}
                                </span>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Summary</h3>
                                    <p className="text-text-secondary leading-relaxed">{result.summary}</p>
                                </div>

                                <div className="bg-green-50 border border-green-100 p-4 rounded-md">
                                    <h3 className="text-sm font-bold text-green-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <ShieldAlert size={16} /> Compliance Strategy
                                    </h3>
                                    <p className="text-green-800 font-medium">{result.complianceStrategy}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <FileText size={16} /> Mandatory Labeling
                                    </h3>
                                    <ul className="list-disc pl-5 space-y-1 text-text-secondary">
                                        {result.labelingRequirements.map((req, i) => (
                                            <li key={i}>{req}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border-light text-xs text-text-muted">
                                    <span>Risk Level: <strong className={result.riskLevel === 'High' ? 'text-red-600' : 'text-gray-600'}>{result.riskLevel}</strong></span>
                                    <span>Sources: {result.sources.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isAnalyzing && !result && (
                        <div className="bg-gray-50 border border-border-light rounded-lg p-12 text-center text-text-secondary">
                            <Scale size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Research Regulations</p>
                            <p className="text-sm max-w-md mx-auto mt-2 text-text-muted">
                                Enter product details to find legal status, potential restrictions, and compliance strategies.
                            </p>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className="bg-white border border-border-light rounded-lg p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-lg font-medium text-text-primary">Scanning Regulations...</p>
                            <p className="text-sm text-text-muted mt-2">Checking Novel Food Catalogue and controlled substance lists.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
