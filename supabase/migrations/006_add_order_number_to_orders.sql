-- Add order_number column to orders table for guest order tracking
ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;

-- Create index for efficient guest order lookup
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- Create function to generate order number if not exists
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    timestamp_part TEXT;
    random_part TEXT;
    order_num TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        timestamp_part := EXTRACT(EPOCH FROM NOW())::TEXT;
        random_part := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));
        order_num := 'MV-' || SUBSTR(timestamp_part, -6) || random_part;
        
        -- Check if this order number already exists
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = order_num) THEN
            RETURN order_num;
        END IF;
        
        counter := counter + 1;
        IF counter > 10 THEN
            RAISE EXCEPTION 'Failed to generate unique order number after % attempts', counter;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;