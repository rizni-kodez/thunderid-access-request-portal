export type AccessTokenGetter = () => Promise<string | null | undefined>;

const SESSION_EXPIRED_MESSAGE = "Your session has expired, please sign in again";
const SESSION_EXPIRED_STORAGE_KEY = "access-portal:session-expired-message";

let getAccessTokenImpl: AccessTokenGetter | null = null;
let hasTriggeredSessionExpiredRedirect = false;

export function setAccessTokenGetter(fn: AccessTokenGetter | null): void {
	getAccessTokenImpl = fn;
}

export async function getAccessToken(): Promise<string | null> {
	if (!getAccessTokenImpl) {
		return null;
	}

	try {
		const token = await getAccessTokenImpl();
		if (!token) {
			return null;
		}

		const trimmedToken = token.trim();
		return trimmedToken.length > 0 ? trimmedToken : null;
	} catch {
		return null;
	}
}

export function redirectToSessionExpiredLanding(): void {
	if (typeof window === "undefined" || hasTriggeredSessionExpiredRedirect) {
		return;
	}

	hasTriggeredSessionExpiredRedirect = true;
	window.sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, SESSION_EXPIRED_MESSAGE);
	window.location.assign("/");
}

export function consumeSessionExpiredMessage(): string | null {
	if (typeof window === "undefined") {
		return null;
	}

	const message = window.sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY);
	if (!message) {
		return null;
	}

	window.sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY);
	return message;
}