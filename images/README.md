# Smart Cafe Management System

A full-stack café ordering & management system.
- **Frontend**: HTML5, CSS3, vanilla JavaScript (talks to the backend via the REST API)
- **Backend**: Django + Django REST Framework + JWT auth
- **Database**: SQLite3

## Project Structure

```
Smart cafe/
├── index.html, menu.html, cart.html, orders.html,
│   profile.html, login.html, register.html,
│   dashboard.html, about.html      <- frontend pages
├── css/                            <- stylesheets
├── js/                             <- frontend logic (config.js holds the API_BASE URL)
├── images/
└── backend/                        <- Django project
    ├── manage.py
    ├── smartcafe/                  <- settings & root urls
    ├── accounts/                   <- users, auth (JWT), customers/employees
    ├── products/                   <- categories & products
    ├── orders/                     <- orders & order items
    ├── inventory/                  <- stock logs
    ├── payments/                   <- payments
    └── reports/                    <- dashboard stats & sales reports
```

## 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python3 manage.py migrate
python3 manage.py seed_data     # creates admin user + sample categories/products
python3 manage.py runserver
```

This starts the API at `http://127.0.0.1:8000/`.

**Seeded admin login:** `admin` / `Admin@123`
(Django admin panel is available at `http://127.0.0.1:8000/admin/`)

## 2. Frontend Setup

The frontend is plain static HTML/CSS/JS — no build step needed.
Just open `index.html` in a browser, or serve the folder with a simple local server, e.g.:

```bash
# from the "Smart cafe" folder (not backend/)
python3 -m http.server 5500
```
Then visit `http://127.0.0.1:5500`.

> `js/config.js` points to `http://127.0.0.1:8000/api` by default — update `API_BASE`
> there if your backend runs on a different host/port.

## 3. Key Flows

- **Customer**: Register/Login (`register.html`/`login.html`) → browse `menu.html` →
  add items to cart → `cart.html` to checkout → `orders.html` to track/cancel orders →
  `profile.html` to edit account details.
- **Admin/Cashier/Staff**: Login redirects automatically to `dashboard.html`, which has
  tabs for Products (CRUD), Orders (status updates), Customers, and Reports
  (daily/weekly/monthly sales + best sellers).

## 4. API Overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/register/` | Customer sign-up |
| `POST /api/auth/login/` | Login, returns JWT access + refresh tokens |
| `GET/PATCH /api/auth/me/` | Current user's profile |
| `POST /api/auth/change-password/` | Change password |
| `GET/POST /api/auth/customers/`, `/employees/` | Admin-only user management |
| `GET/POST /api/products/`, `/products/categories/` | Product & category CRUD |
| `GET/POST /api/orders/`, `PATCH /api/orders/{id}/status/`, `PATCH /api/orders/{id}/cancel/` | Orders |
| `GET/POST /api/payments/` | Payments |
| `GET/POST /api/inventory/` | Stock logs (adjusts product stock automatically) |
| `GET /api/reports/dashboard/` | Summary stats for admin dashboard |
| `GET /api/reports/sales/?period=daily\|weekly\|monthly` | Sales report + best sellers |

## 5. Roles

- `admin` — full access
- `cashier` — manage products & orders
- `staff` — view/update orders
- `customer` — place orders, default role on public registration

## Notes / Known Limitations

- SQLite3 is fine for small/medium cafés; move to PostgreSQL for higher traffic.
- Payment integration (eSewa/Khalti) is modeled in the `payments` app but not
  connected to a real payment gateway yet — see "Future Enhancements" in the proposal.
- Product images can be uploaded via the Django admin panel (`/admin/`) for now;
  an image upload UI in the dashboard can be added later.
