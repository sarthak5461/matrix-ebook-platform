async function request(url, options = {}) {
  const res = await fetch(url, {
    cache: "no-store",
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export function getCurrentUser() {
  return request("/api/auth/me");
}

export function logout() {
  return request("/api/auth/logout", {
    method: "POST",
  });
}

export function login(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(credentials),
  });
}

export function register(user) {
  return request("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(user),
  });
}

export function forgotPassword(email) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token, password) {
  return request("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      token,
      password,
    }),
  });
}
