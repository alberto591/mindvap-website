import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
);

describe('LanguageContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should provide default language (en)', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper });
        expect(result.current.language).toBe('en');
    });

    it('should change language correctly', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper });

        act(() => {
            result.current.setLanguage('es');
        });

        expect(result.current.language).toBe('es');
        expect(localStorage.getItem('mindvap-language')).toBe('es');
    });

    it('should translate keys correctly in English', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper });

        expect(result.current.t('home.hero.tagline')).toBe('Pure • Natural • Science-Backed');
        expect(result.current.t('common.learnMore')).toBe('Our Story');
    });

    it('should translate keys correctly in Spanish', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper });

        act(() => {
            result.current.setLanguage('es');
        });

        expect(result.current.t('home.hero.tagline')).toBe('Puro • Natural • Basado en Ciencia');
        expect(result.current.t('common.learnMore')).toBe('Nuestra Historia');
    });

    it('should translate keys correctly in Italian and include fixed apostrophes', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper });

        act(() => {
            result.current.setLanguage('it');
        });

        expect(result.current.t('home.hero.tagline')).toBe('Puro • Naturale • Basato sulla Scienza');
        // Verify an Italian correction I made (apostrophe)
        expect(result.current.t('home.categories.anxiety')).toBe("Sollievo dall'Ansia");
    });

    it('should return the key if translation is missing', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper });

        expect(result.current.t('non.existent.key')).toBe('non.existent.key');
    });

    it('should load language from localStorage on initialization', () => {
        localStorage.setItem('mindvap-language', 'it');
        const { result } = renderHook(() => useLanguage(), { wrapper });

        expect(result.current.language).toBe('it');
    });
});
