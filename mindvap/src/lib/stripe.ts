import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = 'pk_test_51SLK3DPhh5oeqH8eXjqV9G9NbYQNpZewfjAqEYfS8LjqWTiCjRWj4EDtwGcLiGYeQhmUUTGm2f7wu70IGSdPKuqT00aaqdw1Jh';

export const stripePromise = loadStripe(stripePublishableKey);
