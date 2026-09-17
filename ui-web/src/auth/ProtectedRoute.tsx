import { type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useThunderID } from "@thunderid/react";
import {
	getOAuthCallbackError,
	getThunderIDLoading,
	type ThunderIDHookState
} from "./thunderid";

interface ProtectedRouteProps {
	children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
	const auth = useThunderID() as ThunderIDHookState;
	const location = useLocation();
	const navigate = useNavigate();
	const oauthError = getOAuthCallbackError(location.search);
	const isLoading = getThunderIDLoading(auth);

	if (oauthError) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
				<section className="w-full max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-8 text-left shadow-sm">
					<p className="text-sm font-semibold text-rose-800">Authentication callback error</p>
					<p className="mt-2 text-sm text-rose-700">{oauthError.errorDescription}</p>
					<button
						type="button"
						onClick={() => {
							navigate("/", { replace: true });
						}}
						className="mt-4 inline-flex rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
					>
						Back to sign in
					</button>
				</section>
			</main>
		);
	}

	if (isLoading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
				<section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
					<div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
					<p className="mt-4 text-sm text-slate-600">Checking your ThunderID session...</p>
				</section>
			</main>
		);
	}

	if (auth.isSignedIn) {
		return <>{children}</>;
	}

	return <Navigate to="/" replace />;
}
