import type { ComponentProps } from 'svelte';
import Snackbar, { type SnackbarProps } from './Snackbar.svelte';

export const DEFAULT_AUTO_DISMISS_MS = 4000;
export type SnackbarQueueItem = SnackbarProps & { autoDismissMs: number | null };

export class SnackbarQueue {
	#openingElement = $state<HTMLElement>();
	#snackbarQueue: Array<SnackbarQueueItem> = $state([]);
	#autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

	get current() {
		return this.#snackbarQueue[0];
	}

	#clearAutoDismissTimer() {
		if (this.#autoDismissTimer != null) {
			clearTimeout(this.#autoDismissTimer);
			this.#autoDismissTimer = null;
		}
	}

	#scheduleAutoDismissForCurrent() {
		this.#clearAutoDismissTimer();
		if (!this.current || this.current.autoDismissMs === null) return;
		this.#autoDismissTimer = setTimeout(() => {
			this.#autoDismissTimer = null;
			this.close();
		}, this.current.autoDismissMs);
	}

	add(snackbarProps: ComponentProps<typeof Snackbar> & { autoDismissMs?: number | null }) {
		if (!this.#openingElement) {
			this.#openingElement = document.activeElement as HTMLElement;
		}
		this.#snackbarQueue.push({
			...snackbarProps,
			autoDismissMs:
				snackbarProps.autoDismissMs === undefined
					? DEFAULT_AUTO_DISMISS_MS
					: snackbarProps.autoDismissMs
		});
		if (this.#snackbarQueue.length === 1) {
			this.#scheduleAutoDismissForCurrent();
		}
	}

	close() {
		this.#clearAutoDismissTimer();
		this.current?.handleClose?.();
		this.#snackbarQueue.splice(0, 1);

		if (this.#snackbarQueue.length === 0) {
			this.#openingElement?.focus();
			this.#openingElement = undefined;
		} else {
			this.#scheduleAutoDismissForCurrent();
		}
	}
}
