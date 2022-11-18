import TotalExpense from "./TotalExpense";

export default class BudgetDisplayMonth {
  constructor(
    public index: number = 0,
    public header: string = '',
    public startDate: Date = new Date(),
    public totalExpense: TotalExpense = new TotalExpense(),
  ) {}
}
