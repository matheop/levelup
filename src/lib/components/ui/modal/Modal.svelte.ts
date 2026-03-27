import type { Component } from 'svelte';

export interface ModalDefinition<TProps = Record<string, unknown>> {
  component: () => Promise<Component>;
  props?: TProps;
}

export type ModalRegistry<TModalIds extends string = string> = Record<
  TModalIds,
  () => Promise<{ default: Component<Record<string, unknown>> }>
>;

type ModalStackItem<TProps = Record<string, unknown>> = {
  id: string;
  props: TProps;
};

class Modal<TModalIds extends string = string> {
  #dictionary = $state<ModalRegistry<TModalIds> | undefined>(undefined);
  #stack = $state<ModalStackItem[]>([]);
  #openingElement = $state<HTMLElement>();

  activeModal = $derived(this.#stack[this.#stack.length - 1]);

  activeComponent = $derived.by(() =>
    this.#dictionary?.[this.activeModal?.id as TModalIds]?.(),
  );

  init(initialDictionnary: ModalRegistry<TModalIds>) {
    this.#dictionary = initialDictionnary;
  }

  push<TProps = Record<string, unknown>>(id: TModalIds, props?: TProps) {
    if (document.activeElement) {
      this.#openingElement = document.activeElement as HTMLElement;
    }

    this.#stack.push({ id, props: (props ?? {}) as Record<string, unknown> });
  }

  pop() {
    this.#stack.pop();

    if (this.#stack.length === 0) {
      this.clear();
    }
  }

  clear() {
    this.#stack = [];
    this.#openingElement?.focus();
    this.#openingElement = undefined;
  }
}

export const modal = new Modal();
