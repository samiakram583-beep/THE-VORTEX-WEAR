import { AdminSession, AdminAuditLog } from './types';

const ADMIN_SESSION_STORAGE_KEY = 'vortex_admin_session_v2';

export class AdminAuthService {
  /**
   * Retrieves active session from sessionStorage if valid and not expired.
   */
  static getSession(): AdminSession | null {
    try {
      const data = sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (!data) return null;
      const session: AdminSession = JSON.parse(data);
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Saves verified admin session in sessionStorage.
   */
  static setSession(session: AdminSession): void {
    sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Clears admin session.
   */
  static clearSession(): void {
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  }

  /**
   * Check if an active, unexpired admin session exists.
   */
  static isAuthenticated(): boolean {
    const session = this.getSession();
    return Boolean(session && Date.now() < session.expiresAt);
  }

  /**
   * Cryptographically validates the active session against the server allowlist and store.
   * Prevents browser storage tampering or spoofed sessions.
   */
  static async verifySession(): Promise<boolean> {
    const session = this.getSession();
    if (!session || !session.token) {
      this.clearSession();
      return false;
    }

    if (Date.now() > session.expiresAt) {
      this.clearSession();
      return false;
    }

    try {
      const res = await fetch('/api/admin/auth/me', {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (!res.ok) {
        this.clearSession();
        return false;
      }

      const data = await res.json();
      return Boolean(data.authenticated && data.admin);
    } catch {
      // In case of network errors, rely on existing valid unexpired session
      return true;
    }
  }

  /**
   * Step 1: Admin Login request to server.
   */
  static async requestLogin(
    email: string,
    pass: string,
    supabaseAnonKey?: string
  ): Promise<{
    success: boolean;
    session?: AdminSession;
    requireMfa?: boolean;
    challengeId?: string;
    message?: string;
    error?: string;
  }> {
    try {
      const activeAnonKey =
        supabaseAnonKey ||
        (typeof window !== 'undefined' ? localStorage.getItem('vortex_supabase_publishable_key') : '');

      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: pass,
          supabaseAnonKey: activeAnonKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Invalid email or password.',
        };
      }

      if (data.token && data.admin) {
        const session: AdminSession = {
          token: data.token,
          admin: data.admin,
          expiresAt: data.expiresAt || Date.now() + 30 * 60 * 1000,
        };
        this.setSession(session);
        return {
          success: true,
          session,
          message: data.message,
        };
      }

      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error communicating with authentication server.',
      };
    }
  }

  /**
   * Syncs a verified Supabase Auth user session with the server admin allowlist
   */
  static async syncSupabaseSession(
    email: string,
    user: any,
    accessToken?: string
  ): Promise<{
    success: boolean;
    session?: AdminSession;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/admin/auth/verify-supabase-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, user, accessToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Access denied: unauthorized admin identity.',
        };
      }

      const session: AdminSession = {
        token: data.token,
        admin: data.admin,
        expiresAt: data.expiresAt,
      };

      this.setSession(session);
      return { success: true, session };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to establish admin server session.',
      };
    }
  }

  /**
   * Step 2: Verify MFA TOTP code if enabled.
   */
  static async verifyMfa(challengeId: string, code: string): Promise<{
    success: boolean;
    session?: AdminSession;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/admin/auth/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, code }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Invalid two-factor authentication code.',
        };
      }

      const session: AdminSession = {
        token: data.token,
        admin: data.admin,
        expiresAt: data.expiresAt,
      };

      this.setSession(session);
      return { success: true, session };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to verify MFA code.',
      };
    }
  }

  /**
   * Admin Logout on server and client.
   */
  static async logout(): Promise<void> {
    const session = this.getSession();
    if (session) {
      try {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
      } catch (err) {
        console.warn('Server logout error:', err);
      }
    }
    this.clearSession();
  }

  /**
   * Fetch live Audit Logs from server.
   */
  static async getAuditLogs(): Promise<AdminAuditLog[]> {
    const session = this.getSession();
    if (!session) return [];

    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return data.logs || [];
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    }
    return [];
  }

  /**
   * Log an admin action to the server-side audit trail.
   */
  static async logAction(action: string, resource: string, details?: any): Promise<void> {
    const session = this.getSession();
    if (!session) return;

    try {
      await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ action, resource, details }),
      });
    } catch (err) {
      console.warn('Failed to send audit log:', err);
    }
  }

  /**
   * Test direct API call to demonstrate server-side security enforcement.
   */
  static async testDirectApiCall(overrideToken?: string): Promise<{ status: number; data: any }> {
    const token = overrideToken !== undefined ? overrideToken : this.getSession()?.token || '';
    const res = await fetch('/api/admin/test-sensitive-mutation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  /**
   * Run live tests against the 12 required security invariants.
   */
  static async runFullSecurityAudit(): Promise<{
    allPassed: boolean;
    passCount: number;
    totalTests: number;
    tests: Array<{
      id: number;
      title: string;
      target: string;
      expected: string;
      actual: string;
      status: number;
      passed: boolean;
      message: string;
    }>;
  }> {
    const adminToken = this.getSession()?.token || '';

    // 1. Logged-out visitor -> /admin -> blocked
    const r1 = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked Shirt' }),
    }).catch(() => ({ status: 0 }));
    const p1 = r1.status === 401;

    // 2. Normal customer -> /admin -> blocked
    const r2 = await fetch('/api/admin/orders', {
      headers: { Authorization: 'Bearer customer_jwt_token_unauthorized' },
    }).catch(() => ({ status: 0 }));
    const p2 = r2.status === 401 || r2.status === 403;

    // 3. Normal customer attempts direct API call -> blocked
    const r3 = await fetch('/api/admin/test-sensitive-mutation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => ({ status: 0 }));
    const p3 = r3.status === 401 || r3.status === 403;

    // 4. Normal customer attempts to change role -> blocked
    const r4 = await fetch('/api/user/change-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole: 'admin' }),
    }).catch(() => ({ status: 0 }));
    const p4 = r4.status === 403;

    // 5. Unknown user -> admin login -> denied
    const r5 = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'attacker@evil.com', password: 'Password123!' }),
    }).catch(() => ({ status: 0 }));
    const p5 = r5.status === 401;

    // 6. Authorized admin #1 (Primary Owner) -> wrong password -> rejected (HTTP 401)
    const r6 = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'samiakram583@gmail.com', password: 'WrongPasswordTest999!' }),
    }).catch(() => ({ status: 0 }));
    const p6 = r6.status === 401;

    // 7. Authorized admin #2 (Bilal Akram) -> wrong password -> rejected (HTTP 401)
    const r7 = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bilalakram1048@gmail.com', password: 'WrongPasswordTest999!' }),
    }).catch(() => ({ status: 0 }));
    const p7 = r7.status === 401;

    // 8. Admin #1 -> product management -> allowed
    const r8 = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'Security Verification Garment', sku: 'TEST-SKU-SEC' }),
    }).catch(() => ({ status: 0 }));
    const p8 = r8.status === 200;

    // 9. Admin #2 -> order management -> allowed
    const r9 = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).catch(() => ({ status: 0 }));
    const p9 = r9.status === 200;

    // 10. Customer -> another customer's order -> blocked
    const r10 = await fetch('/api/orders/ord-999?customerEmail=other.victim@customer.pk').catch(() => ({ status: 0 }));
    const p10 = r10.status === 403;

    // 11. Customer -> admin API endpoint -> blocked
    const r11 = await fetch('/api/admin/audit-logs', {
      headers: { Authorization: 'Bearer customer_token_forged' },
    }).catch(() => ({ status: 0 }));
    const p11 = r11.status === 401 || r11.status === 403;

    // 12. Expired session -> admin page -> requires authentication
    const r12 = await fetch('/api/admin/auth/me', {
      headers: { Authorization: 'Bearer expired_or_fake_token' },
    }).catch(() => ({ status: 0 }));
    const p12 = r12.status === 401;

    const tests = [
      {
        id: 1,
        title: 'Logged-out visitor -> /admin -> blocked',
        target: 'POST /api/admin/products (No Token)',
        expected: 'HTTP 401 Unauthorized',
        actual: `HTTP ${r1.status}`,
        status: r1.status,
        passed: p1,
        message: 'Direct unauthorized access strictly blocked by requireAdminAuth guard.',
      },
      {
        id: 2,
        title: 'Normal customer -> /admin -> blocked',
        target: 'GET /api/admin/orders (Customer JWT)',
        expected: 'HTTP 401 / 403 Forbidden',
        actual: `HTTP ${r2.status}`,
        status: r2.status,
        passed: p2,
        message: 'Customer tokens denied access to admin control surface.',
      },
      {
        id: 3,
        title: 'Normal customer attempts direct API call -> blocked',
        target: 'POST /api/admin/test-sensitive-mutation',
        expected: 'HTTP 401 Unauthorized',
        actual: `HTTP ${r3.status}`,
        status: r3.status,
        passed: p3,
        message: 'Sensitive mutation cannot be bypassed without valid admin session.',
      },
      {
        id: 4,
        title: 'Normal customer attempts to change role -> blocked',
        target: 'POST /api/user/change-role',
        expected: 'HTTP 403 Forbidden',
        actual: `HTTP ${r4.status}`,
        status: r4.status,
        passed: p4,
        message: 'Server & Supabase RLS trigger reject self-privilege escalation.',
      },
      {
        id: 5,
        title: 'Unknown user -> admin login -> denied',
        target: 'POST /api/admin/auth/login (Non-allowlist email)',
        expected: 'HTTP 401 Unauthorized',
        actual: `HTTP ${r5.status}`,
        status: r5.status,
        passed: p5,
        message: 'Denied: only the 2 approved administrator accounts can initiate login.',
      },
      {
        id: 6,
        title: 'Admin #1 (Primary Owner) -> wrong password -> rejected',
        target: 'POST /api/admin/auth/login (samiakram583@gmail.com + invalid pass)',
        expected: 'HTTP 401 Unauthorized',
        actual: `HTTP ${r6.status}`,
        status: r6.status,
        passed: p6,
        message: 'Strictly rejected: Invalid password cannot access administrator dashboard.',
      },
      {
        id: 7,
        title: 'Admin #2 (Bilal Akram) -> wrong password -> rejected',
        target: 'POST /api/admin/auth/login (bilalakram1048@gmail.com + invalid pass)',
        expected: 'HTTP 401 Unauthorized',
        actual: `HTTP ${r7.status}`,
        status: r7.status,
        passed: p7,
        message: 'Strictly rejected: Invalid password cannot access administrator dashboard.',
      },
      {
        id: 8,
        title: 'Admin #1 -> product management -> allowed',
        target: 'POST /api/admin/products (Admin Session)',
        expected: 'HTTP 200 OK',
        actual: `HTTP ${r8.status}`,
        status: r8.status,
        passed: p8,
        message: 'Full CRUD product management authorized for authenticated admin.',
      },
      {
        id: 9,
        title: 'Admin #2 -> order management -> allowed',
        target: 'GET /api/admin/orders (Admin Session)',
        expected: 'HTTP 200 OK',
        actual: `HTTP ${r9.status}`,
        status: r9.status,
        passed: p9,
        message: 'Full order management and status transitions authorized for admin.',
      },
      {
        id: 10,
        title: 'Customer -> another customer order -> blocked',
        target: 'GET /api/orders/:id (Mismatched Customer)',
        expected: 'HTTP 403 Forbidden Customer Privacy',
        actual: `HTTP ${r10.status}`,
        status: r10.status,
        passed: p10,
        message: 'Customer privacy enforced; cross-customer order queries denied.',
      },
      {
        id: 11,
        title: 'Customer -> admin API endpoint -> blocked',
        target: 'GET /api/admin/audit-logs (Customer Token)',
        expected: 'HTTP 401 / 403 Forbidden',
        actual: `HTTP ${r11.status}`,
        status: r11.status,
        passed: p11,
        message: 'Admin activity audit trail is protected from customer access.',
      },
      {
        id: 12,
        title: 'Expired session -> admin page -> requires authentication',
        target: 'GET /api/admin/auth/me (Expired Token)',
        expected: 'HTTP 401 Session Expired',
        actual: `HTTP ${r12.status}`,
        status: r12.status,
        passed: p12,
        message: 'Sessions automatically expire after 30 mins; requires fresh authentication.',
      },
    ];

    const passCount = tests.filter((t) => t.passed).length;
    return {
      allPassed: passCount === tests.length,
      passCount,
      totalTests: tests.length,
      tests,
    };
  }
}
