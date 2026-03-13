<script lang="ts">
  type IconName = 'trash';
  type Variant = 'ghost' | 'solid';
  type Tone = 'default' | 'danger';
  type Size = 'sm' | 'md';

  import Icon from './Icon.svelte';

  const {
    type = 'button',
    variant = 'ghost',
    tone = 'default',
    size = 'sm',
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
    'inline-flex items-center gap-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-400 transition';

  const sizeClasses: Record<Size, string> = {
    sm: 'px-1.5 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm'
  };

  const toneClasses: Record<Tone, string> = {
    default: 'text-slate-600 hover:text-slate-800',
    danger: 'text-red-600 hover:text-red-700'
  };

  const variantClasses: Record<Variant, string> = {
    ghost: 'bg-transparent hover:bg-slate-100',
    solid: 'bg-slate-800 text-white hover:bg-slate-900'
  };

  const iconSize: Record<Size, number> = {
    sm: 14,
    md: 16
  };
</script>

<button
  type={type}
  class={`${base} ${sizeClasses[size as Size]} ${toneClasses[tone as Tone]} ${variantClasses[variant as Variant]} ${className}`}
  {disabled}
  onclick={onClick}
>
  {#if leadingIcon}
    <Icon
      name={leadingIcon}
      size={iconSize[size as Size]}
      className={`shrink-0 ${tone === 'danger' ? 'text-red-600' : 'text-slate-500'} ${iconClass}`}
    />
  {/if}

  {#if label}
    <span>{label}</span>
  {/if}

  {#if trailingIcon}
    <Icon
      name={trailingIcon}
      size={iconSize[size as Size]}
      className={`shrink-0 ${tone === 'danger' ? 'text-red-600' : 'text-slate-500'} ${iconClass}`}
    />
  {/if}
</button>

