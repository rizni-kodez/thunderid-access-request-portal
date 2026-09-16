import { useThunderID } from "@thunderid/react";

export interface ThunderIDUser {
	displayName?: string | null;
	username?: string | null;
	preferred_username?: string | null;
	email?: string | null;
	[key: string]: unknown;
}

export type ThunderIDHookState = ReturnType<typeof useThunderID> & {
	loading?: boolean;
	error?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | null {
	const value = record[key];
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function getThunderIDUser(user: unknown): ThunderIDUser | null {
	if (!isRecord(user)) {
		return null;
	}

	return user as ThunderIDUser;
}

export function getThunderIDLoading(state: ThunderIDHookState): boolean {
	return Boolean(state.loading ?? state.isLoading);
}

export function getThunderIDErrorMessage(error: unknown): string {
	if (!error) {
		return "Authentication failed. Please try again.";
	}

	if (typeof error === "string") {
		return error;
	}

	if (isRecord(error)) {
		const message = readString(error, "message") ?? readString(error, "error_description");
		if (message) {
			return message;
		}
	}

	return "Authentication failed. Please try again.";
}

export function getUserDisplayName(user: ThunderIDUser | null): string {
	if (!user) {
		return "Signed-in user";
	}

	const record = user as Record<string, unknown>;
	return (
		readString(record, "displayName") ??
		readString(record, "username") ??
		readString(record, "preferred_username") ??
		readString(record, "email") ??
		"Signed-in user"
	);
}

export function getUserEmail(user: ThunderIDUser | null): string | null {
	if (!user) {
		return null;
	}

	const record = user as Record<string, unknown>;
	return readString(record, "email");
}
