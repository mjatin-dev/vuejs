export default class TotalExpense {
  constructor(
    public index: number = 0,
    public estimate: number = 0,
    public actual: number = 0,
  ) {}

  public get variant(): number {
    return this.estimate - this.actual
  }
}
