export default class FlowDisplayWeek {
  constructor(
    public index: number = 0,
    public firstDay: number = 0,
    public lastDay: number = 0,
    public startsMidWeek: boolean = false,
  ) {}

  public get numDays(): number {
    return this.lastDay - this.firstDay + 1
  }
}
