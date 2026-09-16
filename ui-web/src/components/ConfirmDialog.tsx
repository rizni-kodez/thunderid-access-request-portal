interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	isConfirming?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function ConfirmDialog({
	isOpen,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	isConfirming = false,
	onConfirm,
	onCancel
}: ConfirmDialogProps): JSX.Element | null {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="confirm-dialog-title"
				className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
			>
				<h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900">
					{title}
				</h2>
				<p className="mt-2 text-sm text-slate-600">{message}</p>

				<div className="mt-5 flex justify-end gap-2">
					<button
						type="button"
						onClick={onCancel}
						disabled={isConfirming}
						className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isConfirming}
						className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isConfirming ? "Signing out..." : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}