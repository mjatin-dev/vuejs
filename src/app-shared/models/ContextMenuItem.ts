export default class ContextMenuItem {
  constructor(
    public label: string = '',
    public icon?: string,
    public command?: Function
  ) {}
}