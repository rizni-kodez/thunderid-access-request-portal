import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useThunderID } from "@thunderid/react";
import { getThunderIDLoading, type ThunderIDHookState } from "./thunderid";

interface ProtectedRouteProps {
	children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
	const auth = useThunderID() as ThunderIDHookState;
	const isLoading = getThunderIDLoading(auth);

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
