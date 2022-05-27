export class CurrentSelectionHelper<T> {
  current: T | null = null;

  constructor(private readonly callbacks: {
    onSelect: (item: T) => void;
    onDeselect: (item: T) => void;
  }) {}

  setCurrent(item: T | null) {
    if (this.current === item) return;

    if (this.current) this.callbacks.onDeselect(this.current);
   
    this.current = item;
   
    if (this.current) this.callbacks.onSelect(this.current);
  }
}
