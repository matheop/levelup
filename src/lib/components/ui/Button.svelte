<script lang="ts">
	import type { Snippet } from 'svelte';

	type IconName = 'trash';
	type Variant = 'filled' | 'outline' | 'transparent' | 'link';
	type Tone = 'default' | 'danger' | 'inverse' | 'success' | 'onDark';
	type Size = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

	import Icon from './Icon.svelte';

	const {
		type = 'button',
		variant = 'filled',
		tone = 'default',
		size = 'md',
		leadingIcon,
		trailingIcon,
		iconClass = '',
		label,
		className = '',
		disabled = false,
		onClick,
		children,
		ariaLabel,
		ariaExpanded,
		title: titleAttr
	} = $props<{
		type?: 'button' | 'submit' | 'reset';
		variant?: Variant;
		tone?: Tone;
		size?: Size;
		leadingIcon?: IconName;
		trailingIcon?: IconName;
		iconClass?: string;
		label?: string;
		className?: string;
		disabled?: boolean;
		onClick?: (event: MouseEvent) => void;
		children?: Snippet;
		ariaLabel?: string;
		ariaExpanded?: boolean;
		title?: string;
	}>();

	const base =
		'inline-flex items-center justify-center gap-1.5 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fa-primary-fixed/90 focus-visible:ring-offset-2 focus-visible:ring-offset-fa-surface disabled:pointer-events-none disabled:opacity-50';

	const sizeClasses: Record<Size, string> = {
		sm: 'min-h-8 px-2 py-1 text-xs rounded-lg',
		md: 'min-h-9 px-3 py-1.5 text-sm rounded-xl',
		lg: 'min-h-11 px-6 py-3 text-sm font-bold rounded-xl shadow-sm',
		xl: 'min-h-14 px-6 py-4 text-base font-bold rounded-xl !shadow-[0_8px_20px_-4px_rgba(10,29,55,0.2)]',
		icon: 'size-10 min-h-10 min-w-10 shrink-0 gap-0 rounded-xl p-0'
	};

	const linkSizeClasses: Partial<Record<Size, string>> = {
		sm: 'min-h-0 px-0 py-0 text-xs rounded-none',
		md: 'min-h-0 px-0 py-0 text-sm rounded-none',
		lg: 'min-h-0 px-0 py-0 text-base font-bold rounded-none',
		xl: 'min-h-0 px-0 py-0 text-lg font-bold rounded-none',
		icon: 'min-h-0 p-0 rounded-none'
	};

	const resolvedSizeClass = $derived(
		variant === 'link'
			? (linkSizeClasses[size as Size] ?? linkSizeClasses.md!)
			: sizeClasses[size as Size]
	);

	const iconSize: Record<Size, number> = {
		sm: 14,
		md: 16,
		lg: 18,
		xl: 20,
		icon: 20
	};

	const variantToneClasses: Record<Variant, Record<Tone, string>> = {
		filled: {
			default:
				'border border-fa-primary-container/90 bg-fa-primary-container text-white shadow-sm hover:opacity-95 active:scale-[0.98]',
			inverse:
				'border border-white/90 bg-white text-fa-primary-container shadow-md hover:bg-fa-surface-high',
			danger:
				'border border-fa-error/90 bg-fa-error text-white shadow-sm hover:opacity-95 active:scale-[0.98]',
			success:
				'border border-fa-secondary/90 bg-fa-secondary text-white shadow-lg hover:opacity-95 active:scale-[0.98]',
			onDark:
				'border border-white/25 bg-white/15 text-white shadow-sm hover:bg-white/25 focus-visible:ring-white/70 focus-visible:ring-offset-0'
		},
		outline: {
			default:
				'border border-fa-outline-variant bg-transparent text-fa-primary-container shadow-sm hover:bg-fa-surface-high',
			inverse:
				'border border-white/45 bg-transparent text-white shadow-sm hover:bg-white/10 focus-visible:ring-white/70 focus-visible:ring-offset-0',
			danger:
				'border border-fa-error/55 bg-transparent text-fa-error shadow-sm hover:bg-fa-error/10',
			success:
				'border border-fa-secondary/60 bg-transparent text-fa-secondary shadow-sm hover:bg-fa-secondary/10',
			onDark:
				'border border-white/30 bg-transparent text-[#dce9ff] shadow-none hover:bg-white/10 focus-visible:ring-white/70 focus-visible:ring-offset-0'
		},
		transparent: {
			default:
				'border-0 bg-transparent text-fa-primary-container shadow-none hover:bg-fa-surface-high/90',
			inverse: 'border-0 bg-transparent text-white shadow-none hover:bg-white/10 focus-visible:ring-white/70 focus-visible:ring-offset-0',
			danger: 'border-0 bg-transparent text-fa-error shadow-none hover:bg-fa-error/10',
			success: 'border-0 bg-transparent text-fa-secondary shadow-none hover:bg-fa-secondary/10',
			onDark:
				'border-0 bg-transparent text-[#dce9ff] shadow-none hover:bg-white/10 focus-visible:ring-white/70 focus-visible:ring-offset-0'
		},
		link: {
			default:
				'border-0 bg-transparent p-0 shadow-none text-fa-secondary underline underline-offset-2 hover:text-fa-on-secondary-container',
			danger:
				'border-0 bg-transparent p-0 shadow-none text-fa-error underline underline-offset-2 hover:text-fa-error',
			inverse:
				'border-0 bg-transparent p-0 shadow-none text-white underline underline-offset-2 hover:text-white/90 focus-visible:ring-white/70 focus-visible:ring-offset-0',
			success:
				'border-0 bg-transparent p-0 shadow-none text-fa-secondary underline underline-offset-2 hover:text-fa-on-secondary-container',
			onDark:
				'border-0 bg-transparent p-0 shadow-none text-[#dce9ff] underline underline-offset-2 hover:text-white focus-visible:ring-white/70 focus-visible:ring-offset-0'
		}
	};

	const variantClasses = $derived(
		variantToneClasses[variant as Variant][tone as Tone]
	);
</script>

<button
	type={type}
	class="Button-{variant}-{tone} {base} {resolvedSizeClass} {variantClasses} {className} cursor-pointer"
	{disabled}
	title={titleAttr}
	aria-label={ariaLabel}
	aria-expanded={ariaExpanded}
	onclick={onClick}
>
	{#if children}
		{@render children()}
	{:else}
		{#if leadingIcon}
			<Icon
				name={leadingIcon}
				size={iconSize[size as Size]}
				className="shrink-0 text-current {iconClass}"
			/>
		{/if}

		{#if label}
			<span>{label}</span>
		{/if}

		{#if trailingIcon}
			<Icon
				name={trailingIcon}
				size={iconSize[size as Size]}
				className="shrink-0 text-current {iconClass}"
			/>
		{/if}
	{/if}
</button>
