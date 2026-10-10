// Sampil - Supabase BaaS Client for Website

const SUPABASE_CONFIG = {
  url: "https://npcnofyfmxkykufkezgk.supabase.co",
  anonKey: "sb_publishable_55YRWo-cU3FYB4WYkyJa6w_22ouabYU"
};

const SupabaseClient = {
  getHeaders(authToken = null) {
    const headers = {
      "apikey": SUPABASE_CONFIG.anonKey,
      "Content-Type": "application/json"
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    } else {
      headers["Authorization"] = `Bearer ${SUPABASE_CONFIG.anonKey}`;
    }
    return headers;
  },

  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || "Authentication failed");
    return data;
  },

  async signUp(email, password, fullName = "") {
    const res = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/signup`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        email,
        password,
        data: { full_name: fullName }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || "Registration failed");
    return data;
  },

  async getUser(authToken) {
    const res = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/user`, {
      headers: this.getHeaders(authToken)
    });
    if (!res.ok) return null;
    return await res.json();
  },

  async getUserProfile(userId, authToken) {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/each_user?user_id=eq.${userId}&select=*`, {
      headers: this.getHeaders(authToken)
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    return null;
  },

  async incrementUsage(userId, authToken, currentCount = 0) {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/each_user?user_id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        ...this.getHeaders(authToken),
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        rewrites_count: currentCount + 1,
        updated_at: new Date().toISOString()
      })
    });
    return res.ok;
  },

  async isDomainBlocked(userId, domain, authToken) {
    if (!userId) return false;
    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/blocked_websites?user_id=eq.${userId}&domain=eq.${cleanDomain}&select=id`, {
      headers: this.getHeaders(authToken)
    });
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  },

  async getBlockedWebsites(userId, authToken) {
    if (!userId) return [];
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/blocked_websites?user_id=eq.${userId}&select=*`, {
      headers: this.getHeaders(authToken)
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async addBlockedWebsite(userId, domain, authToken) {
    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/blocked_websites`, {
      method: "POST",
      headers: {
        ...this.getHeaders(authToken),
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        user_id: userId,
        domain: cleanDomain
      })
    });
    return await res.json();
  },

  async removeBlockedWebsite(id, authToken) {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/blocked_websites?id=eq.${id}`, {
      method: "DELETE",
      headers: this.getHeaders(authToken)
    });
    return res.ok;
  }
};
