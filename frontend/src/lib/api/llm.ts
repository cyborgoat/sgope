const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function fetchServices() {
  const response = await fetch(`${BACKEND_URL}/api/services`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

export async function fetchModels() {
  const response = await fetch(`${BACKEND_URL}/api/models`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}

export async function removeService(serviceId: string) {
  const response = await fetch(`${BACKEND_URL}/api/services/${serviceId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to remove service");
  }
  return response.json();
}

export async function setDefaultModel(modelId: string) {
  const response = await fetch(`${BACKEND_URL}/api/models/default`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: modelId }),
  });
  if (!response.ok) {
    throw new Error("Failed to set default model");
  }
  return response.json();
}
