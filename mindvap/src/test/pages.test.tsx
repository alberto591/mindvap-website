import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HomePage from '../pages/HomePage';
import ShopPage from '../pages/ShopPage';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../contexts/LanguageContext';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    ArrowRight: () => <span data-testid="arrow-right" />,
    Award: () => <span data-testid="icon-award" />,
    Truck: () => <span data-testid="icon-truck" />,
    Shield: () => <span data-testid="icon-shield" />,
    FileText: () => <span data-testid="icon-file" />,
    Leaf: () => <span data-testid="icon-leaf" />,
    Moon: () => <span data-testid="icon-moon" />,
    Brain: () => <span data-testid="icon-brain" />,
    Filter: () => <span data-testid="icon-filter" />,
    X: () => <span data-testid="icon-x" />,
    Search: () => <span data-testid="icon-search" />,
}));

// Mock ProductCard
jest.mock('../components/ui/ProductCard', () => ({
    default: ({ product }: any) => <div data-testid="product-card">{product.name.en}</div>
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockProducts = [
    {
        id: '1',
        name: { en: 'Product 1' },
        category: { en: 'Relaxation' },
        price: 30,
        rating: 5,
        herbs: ['Lavender'],
        shortDescription: { en: 'Desc 1' }
    },
    {
        id: '2',
        name: { en: 'Product 2' },
        category: { en: 'Focus' },
        price: 40,
        rating: 4,
        herbs: ['Mint'],
        shortDescription: { en: 'Desc 2' }
    }
];

describe('Page Tests', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        mockFetch.mockResolvedValue({
            json: async () => mockProducts
        });
    });

    const renderWithProviders = (component: React.ReactNode) => {
        return render(
            <MemoryRouter>
                <LanguageProvider>
                    {component}
                </LanguageProvider>
            </MemoryRouter>
        );
    };

    describe('HomePage', () => {
        it('should render and fetch featured products', async () => {
            renderWithProviders(<HomePage />);

            expect(screen.getByText(/Natural Wellness/i)).toBeInTheDocument(); // Tagline part

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/data/products.json');
                expect(screen.getAllByTestId('product-card').length).toBeGreaterThan(0);
            });
        });

        it('should render trust signals', () => {
            renderWithProviders(<HomePage />);
            expect(screen.getAllByText('Lab Tested')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Verified Purity')[0]).toBeInTheDocument();
        });
    });

    describe('ShopPage', () => {
        it('should render products and filters', async () => {
            renderWithProviders(<ShopPage />);

            await waitFor(() => {
                expect(screen.getAllByTestId('product-card')).toHaveLength(2);
            });

            expect(screen.getByText('Category')).toBeInTheDocument();
        });
    });
});
