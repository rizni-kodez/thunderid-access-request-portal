import { Navigate } from "react-router-dom";
import { SignInButton, useThunderID } from "@thunderid/react";
import {
	getThunderIDErrorMessage,
	getThunderIDLoading,
	type ThunderIDHookState
} from "../auth/thunderid";

export default function LandingPage(): JSX.Element {
	const auth = useThunderID() as ThunderIDHookState;
	const isLoading = getThunderIDLoading(auth);
	const errorMessage = auth.error ? getThunderIDErrorMessage(auth.error) : null;

	if (auth.isSignedIn) {
		return <Navigate to="/dashboard" replace />;
	}

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6">
			<div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
			<div className="pointer-events-none absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
			<section className="relative w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-center shadow-sm backdrop-blur">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
					Internal Access Management
				</p>
				<h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Access Request Portal</h1>
				<p className="mt-3 text-sm text-slate-600 sm:text-base">
					Manage application access requests securely using your ThunderID account.
				</p>

				{errorMessage ? (
					<div
						role="alert"
						className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left"
					>
						<p className="text-sm font-semibold text-rose-800">We could not sign you in.</p>
						<p className="mt-1 text-sm text-rose-700">{errorMessage}</p>
						<button
							type="button"
							onClick={() => {
								void auth.signIn();
							}}
							disabled={isLoading}
							className="mt-3 inline-flex rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
						>
							Try again
						</button>
					</div>
				) : null}

				<SignInButton
					disabled={isLoading}
					className="mt-7 inline-flex min-w-[14rem] items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isLoading ? "Redirecting..." : "Sign in with ThunderID"}
				</SignInButton>
			</section>
		</main>
	);
}
