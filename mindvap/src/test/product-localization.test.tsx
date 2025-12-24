import React from 'react';
import { screen } from '@testing-library/react';
import { render, mockProduct } from './utils';
import ProductCard from '../presentation/components/ui/product-card';

describe('Product Localization', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should render product name and category in English by default', () => {
        render(<ProductCard product={mockProduct} />);

        expect(screen.getByText('Test Herbal Blend')).toBeInTheDocument();
        expect(screen.getByText('Relaxation')).toBeInTheDocument();
        expect(screen.getByText('Test short description')).toBeInTheDocument();
    });

    it('should render product name and category in Spanish', () => {
        localStorage.setItem('mindvap-language', 'es');
        render(<ProductCard product={mockProduct} />);

        expect(screen.getByText('Mezcla Herbal de Prueba')).toBeInTheDocument();
        expect(screen.getByText('Relajación')).toBeInTheDocument();
        expect(screen.getByText('Descripción corta de prueba')).toBeInTheDocument();
    });

    it('should render product name and category in Italian', () => {
        localStorage.setItem('mindvap-language', 'it');
        render(<ProductCard product={mockProduct} />);

        expect(screen.getByText('Miscela Erboristica di Prova')).toBeInTheDocument();
        expect(screen.getByText('Rilassamento')).toBeInTheDocument();
        expect(screen.getByText('Breve descrizione di prova')).toBeInTheDocument();
    });
});
