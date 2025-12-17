import { useState } from 'react';
import { Calendar } from 'lucide-react';

interface AgeGateProps {
  onVerify: (verified: boolean) => void;
}

export default function AgeGate({ onVerify }: AgeGateProps) {
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!birthMonth || !birthDay || !birthYear) {
      setError('Please enter your complete date of birth');
      return;
    }

    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    const year = parseInt(birthYear);

    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > new Date().getFullYear()) {
      setError('Please enter a valid date of birth');
      return;
    }

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      if (age - 1 >= 21) {
        onVerify(true);
      } else {
        setError('You must be 21 years or older to access this site');
      }
    } else {
      if (age >= 21) {
        onVerify(true);
      } else {
        setError('You must be 21 years or older to access this site');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-background-surface rounded-lg shadow-modal p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl font-medium text-brand-primary mb-4">
            MindVap
          </h1>
          <div className="w-16 h-1 bg-brand-primary mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Age Verification Required
          </h2>
          <p className="text-text-secondary">
            You must be 21 years or older to access this website
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                placeholder="MM"
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                min="1"
                max="12"
                className="w-full px-4 py-3 rounded-sm border border-border-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <input
                type="number"
                placeholder="DD"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                min="1"
                max="31"
                className="w-full px-4 py-3 rounded-sm border border-border-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <input
                type="number"
                placeholder="YYYY"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 rounded-sm border border-border-medium focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {error && (
            <div className="bg-semantic-warning/10 border border-semantic-warning text-semantic-warning px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-cta-primary hover:bg-cta-hover text-cta-text font-semibold py-4 px-6 rounded-sm transition-all duration-standard hover:-translate-y-1 shadow-cta hover:shadow-card-hover uppercase tracking-wider"
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar size={20} />
              Verify Age
            </div>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-light">
          <p className="text-xs text-text-tertiary text-center leading-relaxed">
            This product has not been evaluated by the FDA and is not intended to diagnose, treat, cure, or prevent any disease. Not for use by minors. Avoid during pregnancy or nursing.
          </p>
        </div>
      </div>
    </div>
  );
}
