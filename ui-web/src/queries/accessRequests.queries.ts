import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createAccessRequest,
	deleteAccessRequest,
	fetchMe,
	fetchAccessRequests,
	updateAccessRequest
} from "../api/accessRequestsApi";
import type {
	ApiMeResponse,
	AccessRequestFilters,
	CreateAccessRequestPayload,
	UpdateAccessRequestPayload
} from "../types/accessRequest.types";

const ACCESS_REQUESTS_QUERY_KEY = ["access-requests"] as const;
const API_ME_QUERY_KEY = ["api-me-debug"] as const;

export function useAccessRequests(filters: AccessRequestFilters, enabled: boolean) {
	return useQuery({
		queryKey: [...ACCESS_REQUESTS_QUERY_KEY, filters],
		queryFn: () => fetchAccessRequests(filters),
		enabled
	});
}

export function useApiMeDebug(enabled: boolean) {
	return useQuery<ApiMeResponse>({
		queryKey: API_ME_QUERY_KEY,
		queryFn: fetchMe,
		enabled
	});
}

export function useCreateAccessRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateAccessRequestPayload) => createAccessRequest(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ACCESS_REQUESTS_QUERY_KEY
			});
		}
	});
}

export function useUpdateAccessRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateAccessRequestPayload }) =>
			updateAccessRequest(id, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ACCESS_REQUESTS_QUERY_KEY
			});
		}
	});
}

export function useDeleteAccessRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteAccessRequest(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ACCESS_REQUESTS_QUERY_KEY
			});
		}
	});
}
