import { BACKEND_URL, apiRequest } from './common';
import { ModelsResponse, ServicesResponse, TestServiceResponse } from '@/types';

export async function fetchServices(): Promise<ServicesResponse> {
  return apiRequest<ServicesResponse>(`${BACKEND_URL}/api/services`);
}

export async function fetchModels(): Promise<ModelsResponse> {
  return apiRequest<ModelsResponse>(`${BACKEND_URL}/api/models`);
}

export async function removeService(serviceId: string): Promise<void> {
  return apiRequest<void>(`${BACKEND_URL}/api/services/${serviceId}`, {
    method: "DELETE",
  });
}

export async function setDefaultModel(modelId: string): Promise<void> {
  return apiRequest<void>(`${BACKEND_URL}/api/models/default`, {
    method: "POST",
    body: JSON.stringify({ model: modelId }),
  });
}

export async function refreshModels(): Promise<void> {
  return apiRequest<void>(`${BACKEND_URL}/api/models/refresh`, {
    method: "POST",
  });
}

export async function testService(serviceType: string, config: Record<string, string | boolean | string[]>, signal?: AbortSignal): Promise<TestServiceResponse> {
  return apiRequest<TestServiceResponse>(`${BACKEND_URL}/api/services/test`, {
    method: "POST",
    body: JSON.stringify({
      service_type: serviceType,
      config: config,
    }),
    signal,
  });
}

export async function addService(serviceId: string, serviceType: string, config: Record<string, string | boolean | string[]>): Promise<void> {
  return apiRequest<void>(`${BACKEND_URL}/api/services/add`, {
    method: "POST",
    body: JSON.stringify({
      service_id: serviceId,
      service_type: serviceType,
      config: config,
    }),
  });
}

export async function updateService(serviceId: string, serviceType: string, config: Record<string, string | boolean | string[]>): Promise<void> {
  return apiRequest<void>(`${BACKEND_URL}/api/services/${serviceId}`, {
    method: "PUT",
    body: JSON.stringify({
      service_type: serviceType,
      config: config,
    }),
  });
}
