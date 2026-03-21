<script lang="ts">
  type IconName = 'trash';
  type Variant = 'filled' | 'outline' | 'transparent';
  type Tone = 'default' | 'danger' | 'inverse' | 'success';
  type Size = 'sm' | 'md';

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
    onClick
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
  }>();

  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 transition';

  const sizeClasses: Record<Size, string> = {
    sm: 'px-1.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  const iconSize: Record<Size, number> = {
    sm: 14,
    md: 16
  };

  const variantToneClasses: Record<Variant, Record<Tone, string>> = {
    filled: {
      default:
        'border border-slate-600/80 bg-slate-700 text-white shadow-sm hover:bg-slate-900 hover:text-white',
      inverse:
        'border border-slate-100/80 bg-white text-slate-900 shadow-sm hover:bg-slate-200 hover:text-slate-900',
      danger:
        'border border-red-500/80 bg-red-600/50 text-red-200 shadow-sm hover:bg-red-600/70 hover:text-white',
      success:
        'border border-emerald-600/90 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:text-white'
    },
    outline: {
      default:
        'border border-slate-600 bg-transparent text-slate-600 hover:bg-slate-200',
      inverse:
        'border border-slate-100/80 bg-transparent text-white shadow-sm hover:bg-slate-200 hover:text-slate-900',
      danger:
        'border border-red-500/80 bg-transparent text-red-400 hover:bg-red-500/20',
      success:
        'border border-emerald-600/80 bg-transparent text-emerald-700 hover:bg-emerald-500/15'
    },
    transparent: {
      default: 'bg-transparent text-slate-200 hover:bg-slate-600/20',
      inverse: 'bg-transparent text-slate-900 hover:bg-slate-200 hover:text-slate-900',
      danger: 'bg-transparent text-red-300 hover:bg-red-500/20',
      success: 'bg-transparent text-emerald-400 hover:bg-emerald-500/20'
    }
  };

  const variantClasses = $derived(
    variantToneClasses[variant as Variant][tone as Tone]
  );
  const iconToneClass = $derived(
    tone === 'danger' ? 'text-red-400' : tone === 'success' ? 'text-emerald-200' : 'text-current'
  );
</script>

<button
  type={type}
  class="Button-{variant}-{tone} {base} {sizeClasses[size as Size]} {variantClasses} {className}"
  {disabled}
  onclick={onClick}
>
  {#if leadingIcon}
    <Icon
      name={leadingIcon}
      size={iconSize[size as Size]}
      className="shrink-0 {iconToneClass} {iconClass}"
    />
  {/if}

  {#if label}
    <span>{label}</span>
  {/if}

  {#if trailingIcon}
    <Icon
      name={trailingIcon}
      size={iconSize[size as Size]}
      className="shrink-0 {iconToneClass} {iconClass}"
    />
  {/if}
</button>

