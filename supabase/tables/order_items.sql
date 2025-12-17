CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,
    2) NOT NULL,
    product_name TEXT NOT NULL,
    product_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);