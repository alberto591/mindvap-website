import { useState } from 'react';
import { BookOpen, AlertTriangle, Thermometer, Info } from 'lucide-react';

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<'benefits' | 'safety' | 'usage'>('benefits');

  const herbs = [
    {
      name: 'Ashwagandha',
      benefits: 'Reduces stress and anxiety with large effect sizes (SMD -1.75 for stress, -1.55 for anxiety) in meta-analyses of RCTs. Supports HPA axis regulation.',
      safety: 'Use with caution in thyroid disease. Avoid during pregnancy. May interact with thyroid medications.',
      usage: '160-204°C (320-400°F) for optimal extraction.',
    },
    {
      name: 'Chamomile',
      benefits: 'Provides anxiolytic effects through GABA pathway modulation. Effective for generalized anxiety disorder and sleep support.',
      safety: 'Generally safe. Caution with allergies to Asteraceae family. May interact with sedatives.',
      usage: '150-204°C (302-400°F). Lower temperatures preserve floral aromatics.',
    },
    {
      name: 'Lavender',
      benefits: 'Inhalation significantly reduces anxiety across eleven trials. Modulates limbic system activity for stress reduction.',
      safety: 'Generally safe. May cause mild sedation. Safe for aromatherapy use.',
      usage: '150-204°C (302-400°F). Lower heat emphasizes floral notes.',
    },
    {
      name: 'Valerian',
      benefits: 'Shows strong signals for sleep quality improvement in fixed combinations. Supports natural sleep onset.',
      safety: 'Monitor sedation levels. May interact with CNS depressants. Avoid with alcohol.',
      usage: '150-204°C (302-400°F). Extended sessions (10-20 min) work well.',
    },
    {
      name: 'Passionflower',
      benefits: 'In fixed combinations shows signals for anxiety and sleep improvement. May reduce benzodiazepine co-prescription.',
      safety: 'Monitor sedation. May interact with CNS depressants. Generally well-tolerated.',
      usage: '150-204°C (302-400°F). Low heat for evening wind-down.',
    },
    {
      name: 'Rosemary',
      benefits: 'Aroma correlates with cognitive performance. 1,8-cineole levels linked to improved attention and memory.',
      safety: 'Safe in aromatherapy amounts. Avoid during pregnancy. Well-tolerated at vaporization temperatures.',
      usage: '125-176°C (257-350°F). Moderate heat for optimal volatile release.',
    },
    {
      name: 'Peppermint',
      benefits: 'Essential oil shows promise for alertness and processing speed. Provides cooling sensory effects.',
      safety: 'Generally safe. May interact with certain medications. Well-tolerated.',
      usage: '125-176°C (257-350°F). Lower temperatures accentuate freshness.',
    },
    {
      name: 'Ginger',
      benefits: 'Improves attention and memory in RCT evidence. Supports cognitive processing.',
      safety: 'Well-tolerated. Caution with blood thinners. Safe at vaporization temperatures.',
      usage: '130-176°C (266-350°F). Lower heat preserves subtle spice notes.',
    },
    {
      name: 'Lemon Balm',
      benefits: 'Shows anxiolytic effects in clinical studies. Particularly effective for stress-related symptoms.',
      safety: 'Generally safe. May cause mild drowsiness. No major contraindications.',
      usage: '160-204°C (320-400°F). Medium temperatures for citrus-herbal profile.',
    },
    {
      name: 'Hops',
      benefits: 'Contributes to sedative effects and sleep quality enhancement. Works well in combination blends.',
      safety: 'Generally safe. Sedative effects. May interact with sleep medications.',
      usage: '150-204°C (302-400°F). Part of evening relaxation blends.',
    },
    {
      name: 'Tulsi (Holy Basil)',
      benefits: 'Reduces stress and stress biomarkers in 8-week RCT at 125mg twice daily. Supports stress resilience.',
      safety: 'Well-tolerated. May aid sleep. Safe for daytime use.',
      usage: '130-176°C (266-350°F). Moderate heat for optimal extraction.',
    },
    {
      name: 'Mullein',
      benefits: 'Provides smooth, neutral base for comfortable vapor production. Well-tolerated respiratory herb.',
      safety: 'Generally safe. Long history of traditional use. No significant contraindications.',
      usage: '150-232°C (302-450°F). Wide temperature tolerance.',
    },
  ];

  return (
    <div className="bg-background-primary">
      {/* Hero Section */}
      <section className="bg-brand text-white py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-black" />
          <h1 className="font-serif text-5xl md:text-6xl mb-6 text-black">
            Education Hub
          </h1>
          <p className="text-xl text-black leading-relaxed">
            Evidence-based information about herbal benefits, safety guidelines, and proper usage practices.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-12 border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === 'benefits'
                  ? 'bg-white text-text-primary hover:bg-brand-light'
                  : 'bg-white text-text-primary hover:bg-brand-light'
              }`}
            >
              Herb Benefits
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === 'safety'
                  ? 'bg-brand text-white'
                  : 'bg-white text-text-primary hover:bg-brand-light'
              }`}
            >
              Safety Guidelines
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                activeTab === 'usage'
                  ? 'bg-brand text-white'
                  : 'bg-white text-text-primary hover:bg-brand-light'
              }`}
            >
              Usage Tips
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Herb Benefits Tab */}
          {activeTab === 'benefits' && (
            <div>
              <h2 className="font-serif text-4xl text-center mb-12 text-text-primary">
                Herb Benefits Guide
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {herbs.map((herb) => (
                  <div key={herb.name} className="bg-white rounded-lg p-8 shadow-sm">
                    <h3 className="font-serif text-2xl mb-4 text-brand">
                      {herb.name}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {herb.benefits}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-12 p-6 bg-background-accent rounded-lg">
                <p className="text-sm text-text-secondary text-center">
                  All benefits are based on peer-reviewed clinical studies, meta-analyses, and randomized controlled trials (RCTs). Individual results may vary.
                </p>
              </div>
            </div>
          )}

          {/* Safety Guidelines Tab */}
          {activeTab === 'safety' && (
            <div>
              <h2 className="font-serif text-4xl text-center mb-12 text-text-primary">
                Safety Guidelines
              </h2>
              
              {/* General Safety Warning */}
              <div className="bg-amber-50 border-l-4 border-cta p-6 mb-12">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-cta flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-text-primary mb-2">Important Safety Information</h3>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>For adults 21 years of age or older only</li>
                      <li>Not for use during pregnancy or nursing</li>
                      <li>Consult a healthcare provider before use if you have medical conditions or take medications</li>
                      <li>Start with low temperatures and short sessions to assess tolerance</li>
                      <li>Do not operate vehicles or machinery after use</li>
                      <li>Keep out of reach of children and pets</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Herb-Specific Safety */}
              <div className="grid md:grid-cols-2 gap-8">
                {herbs.map((herb) => (
                  <div key={herb.name} className="bg-white rounded-lg p-8 shadow-sm">
                    <h3 className="font-serif text-2xl mb-4 text-text-primary">
                      {herb.name}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {herb.safety}
                    </p>
                  </div>
                ))}
              </div>

              {/* Device Safety */}
              <div className="mt-12 bg-white rounded-lg p-10 shadow-sm">
                <h3 className="font-serif text-2xl mb-6 text-text-primary">Device Safety</h3>
                <div className="space-y-4 text-text-secondary leading-relaxed">
                  <p>
                    Use only with properly functioning, temperature-controlled vaporizers designed for dry herbs. Avoid combustion (smoking) which produces harmful byproducts.
                  </p>
                  <p>
                    Maintain your device according to manufacturer instructions. Clean regularly to prevent residue buildup and ensure optimal performance.
                  </p>
                  <p>
                    Never exceed recommended maximum temperatures for each herb. High temperatures can degrade beneficial compounds and create harsh vapor.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Tips Tab */}
          {activeTab === 'usage' && (
            <div>
              <h2 className="font-serif text-4xl text-center mb-12 text-text-primary">
                Usage Tips & Best Practices
              </h2>

              {/* Temperature Guide */}
              <div className="bg-white rounded-lg p-10 shadow-sm mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Thermometer className="w-8 h-8 text-brand" />
                  <h3 className="font-serif text-2xl text-text-primary">Temperature Zones</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Low Temperature (125-160°C / 257-320°F)</h4>
                    <p className="text-text-secondary">
                      Best for: Flavor preservation, gentle effects, aromatherapy benefits. Ideal for peppermint, rosemary, and delicate herbs. Produces lighter vapor with maximum terpene retention.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Medium Temperature (160-190°C / 320-374°F)</h4>
                    <p className="text-text-secondary">
                      Best for: Balanced extraction, most herbs, everyday use. Sweet spot for chamomile, lavender, lemon balm. Good vapor production with pleasant flavor.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">High Temperature (190-204°C / 374-400°F)</h4>
                    <p className="text-text-secondary">
                      Best for: Fuller extraction, sedative herbs, evening use. Optimal for valerian, hops, stronger effects. Denser vapor but may reduce flavor subtlety.
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-sm text-text-secondary">
                      <strong>Avoid:</strong> Temperatures above 221°C (430°F) which can cause combustion and produce harmful byproducts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Practices */}
              <div className="bg-white rounded-lg p-10 shadow-sm mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="w-8 h-8 text-brand" />
                  <h3 className="font-serif text-2xl text-text-primary">Session Best Practices</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Start Low, Go Slow</h4>
                    <p className="text-text-secondary">
                      Begin with lower temperatures and shorter sessions (5-10 minutes) to assess your tolerance and find your optimal settings.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Temperature Stepping</h4>
                    <p className="text-text-secondary">
                      Start at the low end of the recommended range and gradually increase temperature during your session. This extends flavor and provides a more complete extraction.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Timing Matters</h4>
                    <p className="text-text-secondary">
                      Anxiety relief blends: Use as needed during stressful moments. Sleep support: 30-60 minutes before bedtime. Focus blends: Morning or early afternoon for best results.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Stay Hydrated</h4>
                    <p className="text-text-secondary">
                      Vaporization can cause mild dehydration. Keep water nearby and stay well-hydrated before and after sessions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Herb Temperature Guide */}
              <div className="bg-white rounded-lg p-10 shadow-sm">
                <h3 className="font-serif text-2xl mb-6 text-text-primary">Herb-Specific Temperature Guide</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-brand-light">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Herb</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Temperature Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {herbs.map((herb) => (
                        <tr key={herb.name} className="hover:bg-background-accent transition-colors">
                          <td className="px-4 py-3 text-text-primary">{herb.name}</td>
                          <td className="px-4 py-3 text-text-secondary text-sm">{herb.usage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-background-accent">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-sm text-text-secondary">
            These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease. For adults 21+ only.
          </p>
        </div>
      </section>
    </div>
  );
}
