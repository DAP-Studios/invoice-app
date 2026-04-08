# Aurix Smart Invoice - Firebase Data Model

This project uses Firebase for API authentication and data storage.

## Collections

### businesses

- Document ID: userId
- Fields:
  - userId
  - business_name
  - gstin
  - address
  - phone
  - logo
  - created_at
  - updated_at

### products

- Document ID: auto ID
- Fields:
  - userId
  - name
  - price
  - category
  - hsn_code
  - image_url
  - created_at
  - updated_at

### invoices

- Document ID: auto ID
- Fields:
  - userId
  - invoice_number
  - date
  - customer_name
  - customer_phone
  - customer_email
  - customer_address
  - place_of_supply
  - is_inter_state
  - subtotal
  - cgst
  - sgst
  - igst
  - total_tax
  - total_amount
  - notes
  - invoice_items (array)
  - created_at
  - updated_at

### templates

- Document ID: auto ID
- Fields:
  - userId
  - name
  - layout
  - config (JSON)
  - is_active
  - created_at
  - updated_at

### analytics_events

- Document ID: auto ID
- Fields:
  - userId
  - event_type (invoice_view | product_click | reorder_click)
  - invoice_id
  - product_id
  - metadata
  - created_at

## Auth/API contract

The backend keeps the same REST shape:

- POST /auth/signup
- POST /auth/login
- GET/POST/PUT/DELETE /products
- GET/POST /invoices
- GET /invoices/:id
- GET/POST /templates
- PUT /templates/:id
- POST /analytics/events
- GET /analytics/summary

Firebase Auth ID token is returned as session.access_token and is required in Authorization header.
