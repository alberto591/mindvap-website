import { useState } from 'react';
import { ShoppingBag, Scale, FlaskConical, Search, ArrowRight, BookOpen, Lightbulb, CheckCircle2 } from 'lucide-react';

type TutorialTab = 'sourcing' | 'legal' | 'formulation';

export default function AdminTutorialsPage() {
    const [activeTab, setActiveTab] = useState<TutorialTab>('sourcing');

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="font-headline text-3xl font-medium text-text-primary mb-2">Agent Tutorials</h1>
                <p className="text-text-secondary">Master your AI-powered tools for sourcing, compliance, and formulation.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-border-light overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-border-light">
                    <button
                        onClick={() => setActiveTab('sourcing')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'sourcing'
                                ? 'bg-brand-primary text-white'
                                : 'text-text-secondary hover:bg-gray-50'
                            }`}
                    >
                        <ShoppingBag size={18} />
                        Sourcing Agent
                    </button>
                    <button
                        onClick={() => setActiveTab('legal')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'legal'
                                ? 'bg-brand-primary text-white'
                                : 'text-text-secondary hover:bg-gray-50'
                            }`}
                    >
                        <Scale size={18} />
                        Legal Research
                    </button>
                    <button
                        onClick={() => setActiveTab('formulation')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'formulation'
                                ? 'bg-brand-primary text-white'
                                : 'text-text-secondary hover:bg-gray-50'
                            }`}
                    >
                        <FlaskConical size={18} />
                        Formulation Agent
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">

                    {/* Sourcing Tutorial */}
                    {activeTab === 'sourcing' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <BookOpen className="text-blue-600 mt-1 flex-shrink-0" size={24} />
                                <div>
                                    <h3 className="font-bold text-blue-900 mb-1">Purpose</h3>
                                    <p className="text-blue-800 text-sm">
                                        Find high-quality herb providers hidden from standard searches. It uses advanced boolean logic to locate suppliers who don't invest heavily in SEO but have supreme product quality.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-headline text-xl font-medium text-text-primary">How to Use</h3>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h4 className="font-bold text-text-primary mb-1">Define Criteria</h4>
                                        <p className="text-text-secondary text-sm">Enter the <strong>Herb Name</strong> (e.g., "Lavender"), specific <strong>Region</strong> (e.g., "Provence"), and required <strong>Certifications</strong> (e.g., "Organic").</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h4 className="font-bold text-text-primary mb-1">Generate Search Plan</h4>
                                        <p className="text-text-secondary text-sm">Click "Generate Search Plan". The agent constructs a complex Google search string designed to bypass retail shops and find wholesalers/farmers.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h4 className="font-bold text-text-primary mb-1">Execute or Analyze</h4>
                                        <div className="flex flex-col gap-2 mt-2">
                                            <span className="flex items-center gap-2 text-sm text-text-secondary">
                                                <ArrowRight size={14} />
                                                <strong>Google It:</strong> Opens a new tab with the professional search query.
                                            </span>
                                            <span className="flex items-center gap-2 text-sm text-text-secondary">
                                                <ArrowRight size={14} />
                                                <strong>Run AI Agent:</strong> (Requires API Key) Scans results to provide a "Verified List" with relevance scores.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legal Tutorial */}
                    {activeTab === 'legal' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                                <Lightbulb className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
                                <div>
                                    <h3 className="font-bold text-yellow-900 mb-1">Strategic Compliance</h3>
                                    <p className="text-yellow-800 text-sm">
                                        Navigate complex regulations by identifying the correct "Intended Use" category. Many herbs are restricted as "Food" but perfectly legal as "Incense" or "Cosmetic".
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-headline text-xl font-medium text-text-primary">Workflow</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="border border-border-light p-4 rounded-lg bg-gray-50">
                                        <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                                            <Search size={16} /> Input
                                        </h4>
                                        <p className="text-xs text-text-secondary">
                                            Select <strong>Product</strong> and <strong>Jurisdiction</strong>. Crucially, toggle the <strong>Intended Use</strong> (e.g., Tea vs. Incense) to see how regulations shift.
                                        </p>
                                    </div>

                                    <div className="border border-border-light p-4 rounded-lg bg-gray-50">
                                        <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                                            <CheckCircle2 size={16} /> Analyze
                                        </h4>
                                        <p className="text-xs text-text-secondary">
                                            The AI checks Novel Food Catalogues and Narcotic Acts (mock/simulated) to return a <strong>Regulatory Status</strong> (Allowed, Restricted, Gray Area).
                                        </p>
                                    </div>

                                    <div className="border border-border-light p-4 rounded-lg bg-gray-50">
                                        <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                                            <Lightbulb size={16} /> Strategy
                                        </h4>
                                        <p className="text-xs text-text-secondary">
                                            Review the <strong>Compliance Strategy</strong> and <strong>Labeling Requirements</strong> (e.g., "Warning: Not for human consumption") to sell legally.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Formulation Tutorial */}
                    {activeTab === 'formulation' && (
                        <div className="space-y-8 animate-fadeIn">
                            <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-100 rounded-lg">
                                <FlaskConical className="text-green-600 mt-1 flex-shrink-0" size={24} />
                                <div>
                                    <h3 className="font-bold text-green-900 mb-1">AI Master Herbalist</h3>
                                    <p className="text-green-800 text-sm">
                                        Create proprietary blends for specific mental health goals. The AI understands phytochemical synergy—how herbs potentiate each other when combined.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-headline text-xl font-medium text-text-primary">Creating a Blend</h3>

                                <div className="relative border-l-2 border-brand-primary pl-6 space-y-6">
                                    <div>
                                        <h4 className="font-bold text-text-primary text-sm">Step 1: Select Goal</h4>
                                        <p className="text-text-secondary text-sm">Choose the desired effect (e.g., "Deep Sleep" or "Hyper Focus").</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary text-sm">Step 2: Choose Format</h4>
                                        <p className="text-text-secondary text-sm">Formats change the recipe. A <strong>Tea</strong> needs water-soluble compounds; a <strong>Smoking Blend</strong> needs smooth combustion herbs (e.g., Mullein base).</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary text-sm">Step 3: Generate</h4>
                                        <p className="text-text-secondary text-sm">The AI outputs a full recipe with:</p>
                                        <ul className="list-disc pl-4 mt-1 text-xs text-text-muted">
                                            <li><strong>Exact Percentages</strong> (e.g., 40% Base, 30% Active, 10% Flavor)</li>
                                            <li><strong>Synergy Notes</strong> (Why these ingredients match)</li>
                                            <li><strong>Flavor Profile</strong> (For marketing descriptions)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
