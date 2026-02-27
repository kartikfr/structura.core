-- Prevent transaction hash reuse across payment requests

CREATE UNIQUE INDEX IF NOT EXISTS unique_payment_requests_transaction_hash
ON public.payment_requests (transaction_hash)
WHERE transaction_hash IS NOT NULL;