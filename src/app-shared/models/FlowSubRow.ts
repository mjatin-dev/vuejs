import ID from './ID'

export default class FlowSubRow {
  constructor(
    public index: number = 0,
    public tactics: {id: ID; startDate: Date; endDate: Date}[] = []
  ) {}
}
