# The Vortex Wear — Modern Menswear & Security Architecture

The Vortex Wear is a premium modern clothing brand specializing in luxury structured **Pants and Shirts** in Pakistan.

- **Brand:** The Vortex Wear
- **Support & Concierge:** [support@vortexwear.pk](mailto:support@vortexwear.pk)
- **WhatsApp Concierge:** [+92 300 1046010](https://wa.me/923001046010)
- **Currency:** Pakistani Rupee (PKR - ₨)
- **Primary Payment:** Cash on Delivery (COD) across Pakistan

---

## Security Architecture & Admin Authorization Report

### 1. Two-Admin Enforcement Principle
Only two authorized people can ever access The Vortex Wear Admin Control Center:
1. **The Vortex Wear Primary Owner / Administrator** (`samiakram583@gmail.com`)
2. **Bilal Akram** (`bilalakram1048@gmail.com`)

### 2. Why Frontend Hiding Is Not Enough (Server & Database Guarding)
Admin protection is enforced at 3 independent architectural layers:
1. **Database Level (PostgreSQL RLS & Triggers):**
   - Table `public.authorized_admins` acts as the source of truth for administrative identity.
   - Function `public.is_admin()` checks `auth.uid()`, profile role, and cross-references active membership in `authorized_admins`.
   - PostgreSQL trigger `trg_prevent_unauthorized_admin` executes on `BEFORE INSERT OR UPDATE OF role ON public.profiles`. If a customer or API call tries to elevate `role = 'admin'`, the database aborts with an exception:
     `Privilege escalation rejected: <email> is not on the authorized administrator allowlist.`
2. **Server Level (Express API Gateway):**
   - Middleware `requireAdminAuth` intercepts every request to `/api/admin/*`.
   - Rejects unauthenticated calls with `401 Unauthorized`.
   - Rejects non-admin or forged customer tokens with `403 Forbidden`.
   - Enforces 30-minute sliding session timeouts.
3. **Application & Routing Level (React SPA):**
   - Protected routes (`/admin`, `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/inventory`, `/admin/categories`, `/admin/coupons`, `/admin/reviews`, `/admin/banners`, `/admin/settings`, `/admin/analytics`).
   - Unauthenticated visitors are redirected to `/admin/login`.
   - Storefront customers attempting direct navigation receive an HTTP 403 Forbidden Access Denied screen.

### 3. Multi-Factor Authentication (MFA / 2FA)
Admin accounts must complete a two-factor security step:
- **Factor 1:** Verified admin email + strong password handled securely by Supabase Auth / Server.
- **Factor 2:** 6-digit TOTP verification code from an authenticator app (e.g., Google Authenticator).
- Session tokens are only generated after both factors succeed.

### 4. Customer Privacy Enforcement
- Customers can **only** access their own orders, profile, wishlist, and addresses.
- Cross-customer order access (`GET /api/orders/:id`) verifies ownership and returns `403 Forbidden Customer Privacy` if mismatched.
- Row Level Security on `orders` and `order_items` enforces `auth.uid() = user_id`.

### 5. Admin Audit Trail
Every administrative action (logins, product creations, price changes, stock modifications, order status transitions, coupon creation) is recorded in `admin_audit_logs` with:
- Admin ID and verified email
- Action and resource affected
- Details (sensitive credentials and passwords are strictly excluded)
- Client IP address and UTC timestamp

---

## Setting Up the Two Admin Accounts in Supabase

### Step 1: Run Schema & RLS Scripts
In your Supabase project under **SQL Editor**:
1. Run `supabase/schema.sql`. This creates all tables, functions, the `authorized_admins` table, and the anti-escalation trigger.
2. Run `supabase/rls.sql`. This activates Row Level Security across all tables.
3. Run `supabase/seed.sql` to populate initial products, categories, coupons, and hero banners.

### Step 2: Create Admin Accounts in Supabase Auth
In your Supabase Dashboard:
1. Navigate to **Authentication** $\to$ **Users**.
2. Click **"Add user"** $\to$ **"Create user"**.
3. Create the two accounts:
   - **Account 1 (Owner):** Enter `samiakram583@gmail.com` and generate a strong password. Toggle "Auto Confirm User" to ON.
   - **Account 2 (Bilal Akram):** Enter `bilalakram1048@gmail.com` and generate a strong password. Toggle "Auto Confirm User" to ON.
4. Go to **Table Editor** $\to$ **profiles**. Update both rows:
   - Set `role` to `'admin'`. (The database trigger permits this because both emails exist in `authorized_admins`).

### Step 3: Enable MFA (Multi-Factor Authentication)
In Supabase Dashboard:
1. Navigate to **Authentication** $\to$ **MFA**.
2. Enable **App Authenticator (TOTP)**.
3. When signing into The Vortex Wear Admin Portal (`/admin/login`), prompt for the 6-digit code.

---

## Automated 12-Scenario Security Test Matrix

The Vortex Wear includes an integrated security testing engine at `/admin/security-test` and via `GET /api/admin/security-audit-test`:

| # | Security Scenario | Target / Layer | Enforcement | Status |
|---|-------------------|----------------|-------------|--------|
| 1 | Logged-out visitor $\to$ `/admin` | `POST /api/admin/products` | 401 Unauthorized | PASSED |
| 2 | Normal customer $\to$ `/admin` | `GET /api/admin/orders` | 401/403 Forbidden | PASSED |
| 3 | Normal customer direct API call | `POST /api/admin/test-sensitive-mutation` | 401 Unauthorized | PASSED |
| 4 | Customer attempts self-role change | `POST /api/user/change-role` | 403 Forbidden + DB Trigger | PASSED |
| 5 | Unknown user admin login | `POST /api/admin/auth/login` | 401 Invalid Credentials | PASSED |
| 6 | Authorized Admin #1 (Primary Owner) | `POST /api/admin/auth/login` | 200 OK + MFA Challenge | PASSED |
| 7 | Authorized Admin #2 (Bilal Akram) | `POST /api/admin/auth/login` | 200 OK + MFA Challenge | PASSED |
| 8 | Admin #1 product CRUD management | `POST /api/admin/products` | 200 OK Authorized | PASSED |
| 9 | Admin #2 order status management | `GET /api/admin/orders` | 200 OK Authorized | PASSED |
| 10 | Customer $\to$ another customer order | `GET /api/orders/:id` | 403 Customer Privacy | PASSED |
| 11 | Customer $\to$ admin API endpoint | `GET /api/admin/audit-logs` | 401/403 Guard Rejected | PASSED |
| 12 | Expired session (30-min timeout) | `GET /api/admin/auth/me` | 401 Session Expired | PASSED |
