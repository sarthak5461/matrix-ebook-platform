async function request(url, options = {}) {
  const res = await fetch(url, options);

  let data = {};

  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export function getStats() {
  return request("/api/admin/stats");
}

export function getUsers() {
  return request("/api/admin/users");
}

export function getPurchases() {
  return request("/api/admin/purchases");
}

export function uploadPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  return request("/api/admin/upload-pdf", {
    method: "POST",
    body: formData,
  });
}
