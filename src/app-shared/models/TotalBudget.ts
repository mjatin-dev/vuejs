export default class TotalBudget {
    constructor(
      public index: number = 0,
      public budget: number = 0,
      public estimate: number = 0,
      public actual: number = 0,
    ) {}
  
    public get remaining(): number {
      return this.budget - this.actual
    }
  }
  