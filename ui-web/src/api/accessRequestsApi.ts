import { apiClient } from "./apiClient";
import type {
	AccessRequest,
	AccessRequestFilters,
	ApiMeResponse,
	CreateAccessRequestPayload,
	UpdateAccessRequestPayload
} from "../types/accessRequest.types";

const ACCESS_REQUESTS_PATH = "/api/access-requests";
const ME_PATH = "/api/me";

export async function fetchAccessRequests(
	filters: AccessRequestFilters
): Promise<AccessRequest[]> {
	const { data } = await apiClient.get<AccessRequest[]>(ACCESS_REQUESTS_PATH, {
		params: filters
	});
	return data;
}

export async function createAccessRequest(
	payload: CreateAccessRequestPayload
): Promise<AccessRequest> {
	const { data } = await apiClient.post<AccessRequest>(ACCESS_REQUESTS_PATH, payload);
	return data;
}

export async function updateAccessRequest(
	id: string,
	payload: UpdateAccessRequestPayload
): Promise<AccessRequest> {
	const { data } = await apiClient.patch<AccessRequest>(`${ACCESS_REQUESTS_PATH}/${id}`, payload);
	return data;
}

export async function deleteAccessRequest(id: string): Promise<{ message: string }> {
	const { data } = await apiClient.delete<{ message: string }>(`${ACCESS_REQUESTS_PATH}/${id}`);
	return data;
}

export async function fetchMe(): Promise<ApiMeResponse> {
	const { data } = await apiClient.get<ApiMeResponse>(ME_PATH);
	return data;
}
