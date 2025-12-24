import { useState, useEffect } from 'react';
import { Search, Globe, ShieldCheck, Tag, Zap, ExternalLink, Key } from 'lucide-react';
import { generateSearchQuery, analyzeProvidersWithAI, type SourcingCriteria, type ProviderResult } from '../../../application/services/sourcing-service';

export default function SourcingAgentPage() {
    const [apiKey, setApiKey] = useState('');
    const [criteria, setCriteria] = useState<SourcingCriteria>({
        herbName: '',
        region: 'Europe',
        certifications: [],
        minQuantity: '',
        notes: ''
    });
    const [isSearching, setIsSearching] = useState(false);
    const [generatedQuery, setGeneratedQuery] = useState('');
    const [results, setResults] = useState<ProviderResult[]>([]);
    const [error, setError] = useState('');

    // Load API key from local storage on mount
    useEffect(() => {
        const savedKey = localStorage.getItem('openai_api_key');
        if (savedKey) setApiKey(savedKey);
    }, []);

    // Save API key when it changes
    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKey = e.target.value;
        setApiKey(newKey);
        localStorage.setItem('openai_api_key', newKey);
    };

    const handleCriteriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCriteria(prev => ({ ...prev, [name]: value }));
    };

    const handleCertificationToggle = (cert: string) => {
        setCriteria(prev => {
            if (prev.certifications.includes(cert)) {
                return { ...prev, certifications: prev.certifications.filter(c => c !== cert) };
            } else {
                return { ...prev, certifications: [...prev.certifications, cert] };
            }
        });
    };

    const generatePlan = () => {
        if (!criteria.herbName) return;
        const query = generateSearchQuery(criteria);
        setGeneratedQuery(query);
    };

    const handleManualSearch = () => {
        if (!generatedQuery) generatePlan();
        const query = generatedQuery || generateSearchQuery(criteria);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    };

    const runAiAgent = async () => {
        if (!apiKey) {
            setError('Please provide an OpenAI API Key to run the AI Agent analysis.');
            return;
        }
        setError('');
        setIsSearching(true);
        setResults([]);

        try {
            // In a real app, this would call the API
            // For now, we use the service which returns mock data
            const data = await analyzeProvidersWithAI({ ...criteria, apiKey });
            setResults(data);
        } catch (err) {
            console.error(err);
            setError('Failed to run analysis. Please check your API key and try again.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="font-headline text-3xl font-medium text-text-primary mb-2">AI Sourcing Agent</h1>
                <p className="text-text-secondary">Find quality herb providers using advanced search logic and AI analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Inputs */}
                <div className="lg:col-span-1 space-y-6">

                    {/* API Key Section */}
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                            />
                            <p className="text-xs text-text-tertiary mt-2">
                                Stored locally in your browser. Required for "Run AI Agent".
                            </p>
                        </div>
                    </div>

                    {/* Search Criteria */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-border-light">
                        <h2 className="font-semibold text-text-primary mb-4">Sourcing Criteria</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Herb Name</label>
                                <input
                                    type="text"
                                    name="herbName"
                                    value={criteria.herbName}
                                    onChange={handleCriteriaChange}
                                    placeholder="e.g. Lavender, Chamomile"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Target Region</label>
                                <input
                                    type="text"
                                    name="region"
                                    value={criteria.region}
                                    onChange={handleCriteriaChange}
                                    placeholder="e.g. Spain, Europe, Global"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Certifications</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Organic', 'GMP', 'ISO', 'Fair Trade'].map(cert => (
                                        <button
                                            key={cert}
                                            type="button"
                                            onClick={() => handleCertificationToggle(cert)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${criteria.certifications.includes(cert)
                                                    ? 'bg-brand-primary text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {cert}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Min Quantity</label>
                                <input
                                    type="text"
                                    name="minQuantity"
                                    value={criteria.minQuantity}
                                    onChange={handleCriteriaChange}
                                    placeholder="e.g. 1kg, 100kg"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-brand-primary"
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border-light space-y-3">
                            <button
                                onClick={generatePlan}
                                disabled={!criteria.herbName}
                                className="w-full flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-text-primary font-medium py-2 rounded-md transition-colors disabled:opacity-50"
                            >
                                <Zap size={18} />
                                Generate Search Plan
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleManualSearch}
                                    disabled={!criteria.herbName}
                                    className="flex justify-center items-center gap-2 border border-gray-300 hover:bg-gray-50 text-text-secondary py-2 rounded-md transition-colors disabled:opacity-50"
                                >
                                    <Search size={18} />
                                    Google It
                                </button>
                                <button
                                    onClick={runAiAgent}
                                    disabled={!criteria.herbName || isSearching}
                                    className="flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-hover text-white py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSearching ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <ShieldCheck size={18} />}
                                    Run AI Agent
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
                    </div>
                </div>

                {/* Right Column: Output */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Smart Plan Section */}
                    {generatedQuery && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
                                <Search size={16} />
                                Smart Search Query
                            </h3>
                            <code className="block bg-white p-3 rounded border border-blue-100 text-sm text-gray-700 font-mono break-all">
                                {generatedQuery}
                            </code>
                            <p className="text-xs text-blue-600 mt-2">
                                You can copy this query into Google manually or use the "Run AI Agent" button to have us analyze the results for you.
                            </p>
                        </div>
                    )}

                    {/* AI Results */}
                    {results.length > 0 && (
                        <div>
                            <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                                <Globe size={20} className="text-brand-primary" />
                                Found Providers ({results.length})
                            </h2>
                            <div className="space-y-4">
                                {results.map((provider, i) => (
                                    <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-border-light hover:border-brand-primary transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg text-text-primary">{provider.name}</h3>
                                                <p className="text-sm text-text-muted flex items-center gap-1">
                                                    <Globe size={14} /> {provider.location}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {provider.relevanceScore}% Match
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-text-secondary text-sm my-3 leading-relaxed">
                                            {provider.notes}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {provider.tags.map(tag => (
                                                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-600">
                                                    <Tag size={12} /> {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <a
                                            href={provider.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:text-brand-hover"
                                        >
                                            Visit Website <ExternalLink size={14} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isSearching && results.length === 0 && (
                        <div className="bg-gray-50 border border-border-light rounded-lg p-12 text-center text-text-secondary">
                            <Globe size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Ready to source</p>
                            <p className="text-sm max-w-md mx-auto mt-2 text-text-muted">
                                Enter your criteria on the left and click "Generate Search Plan" or "Run AI Agent" to find provider matches.
                            </p>
                        </div>
                    )}

                    {isSearching && (
                        <div className="bg-white border border-border-light rounded-lg p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                            <p className="text-lg font-medium text-text-primary">Analyzing Suppliers...</p>
                            <p className="text-sm text-text-muted mt-2">Scanning reasoning models and validating certifications.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
