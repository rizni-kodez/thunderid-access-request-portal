import { useState } from "react";
import { useThunderID } from "@thunderid/react";
import {
	getThunderIDUser,
	getUserDisplayName,
	getUserEmail,
	type ThunderIDHookState
} from "../auth/thunderid";
import ConfirmDialog from "./ConfirmDialog";

interface HeaderProps {
	onCreateRequest: () => void;
}

export default function Header({ onCreateRequest }: HeaderProps): JSX.Element {
	const auth = useThunderID() as ThunderIDHookState;
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);

	const user = getThunderIDUser(auth.user);
	const displayName = getUserDisplayName(user);
	const email = getUserEmail(user);

	async function handleConfirmSignOut(): Promise<void> {
		setIsSigningOut(true);
		try {
			await auth.signOut();
		} catch (error) {
			console.error("ThunderID sign out failed", error);
		} finally {
			setIsConfirmOpen(false);
			setIsSigningOut(false);
		}
	}

	return (
		<>
			<header className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
						Internal Access Management
					</p>
					<h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
						Access Request Portal
					</h1>
					<p className="mt-1 text-sm text-slate-600">
						Track, review, and maintain application access requests in one place.
					</p>
				</div>
				<div className="flex flex-col gap-3 sm:items-end">
					{auth.isSignedIn ? (
						<div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
							<p className="text-sm font-semibold text-slate-900">{displayName}</p>
							<p className="text-xs text-slate-600">{email ?? "Email unavailable"}</p>
						</div>
					) : null}

					<div className="flex gap-2">
						<button
							type="button"
							onClick={onCreateRequest}
							className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
						>
							New Request
						</button>
						{auth.isSignedIn ? (
							<button
								type="button"
								onClick={() => setIsConfirmOpen(true)}
								disabled={isSigningOut}
								className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
							>
								Sign out
							</button>
						) : null}
					</div>
				</div>
			</div>
			</header>
			<ConfirmDialog
				isOpen={isConfirmOpen}
				title="Sign out"
				message="Are you sure you want to sign out?"
				confirmLabel="Sign out"
				isConfirming={isSigningOut}
				onCancel={() => {
					if (!isSigningOut) {
						setIsConfirmOpen(false);
					}
				}}
				onConfirm={() => {
					void handleConfirmSignOut();
				}}
			/>
		</>
	);
}
