import ID from './ID'

export default class Budget {
  public isEditing: boolean
  public editingFields

  constructor(
    public id: ID = new ID(),
    public creatorId: ID = new ID(),
    public planId: ID = new ID(),
    public channelsId: ID = new ID(),

    public startDate: Date = new Date(),
    public endDate: Date = new Date(),

    public name: string = '',
    public value: number = 0,

    public active: boolean = false,
    public isPrimary: boolean = false,

    public initiatives: string[] = [],
    public tags: string[] = [],
    public channels: string[] = []
  ) {
    this.isEditing = false
    this.editingFields = {
      name: this.name,
      value: this.value,
      startDate: this.startDate,
      endDate: this.endDate,
    }
  }

  public get getFormatedValue() {
    return this.value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  public get startDateFormated(): string {
    return this.startDate.toLocaleDateString()
  }
  public set startDateFormated(newStartDate) {
    this.editingFields.startDate = new Date(newStartDate)
  }
  public get endDateFormated(): string {
    return this.endDate.toLocaleDateString()
  }
  public set endDateFormated(newEndDate) {
    this.editingFields.endDate = new Date(newEndDate)
  }

  public get startDateEditFormated(): string {
    return this.editingFields.startDate.toLocaleDateString()
  }
  public set startDateEditFormated(newStartDate) {
    this.editingFields.startDate = new Date(newStartDate)
  }

  public get endDateEditFormated(): string {
    return this.editingFields.endDate.toLocaleDateString()
  }
  public set endDateEditFormated(newEndDate) {
    this.editingFields.endDate = new Date(newEndDate)
  }

  public get isHighLevel(): boolean {
    return !!(
      this.initiatives.length === 0 &&
      this.tags.length === 0 &&
      this.channels.length === 0
    )
  }

  public static fromResponseObject(obj): Budget {
    if (!obj) return new Budget()

    return new Budget(
      ID.fromResponseObject(obj.id, 'budgets'),
      ID.fromResponseObject(obj.creator, 'users'),
      ID.fromResponseObject(obj.plan, 'plans'),
      ID.fromResponseObject(obj.channelsId, 'channels'),
      new Date(obj.startDate),
      new Date(obj.endDate),
      obj.name,
      obj.value,
      obj.active,
      obj.isPrimary,
      obj.initiatives,
      obj.tags,
      obj.channels
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      creator: this.creatorId.intID == 0 ? null : this.creatorId.apiID,
      plan: this.planId.intID == 0 ? null : this.planId.apiID,
      startDate: this.startDate,
      endDate: this.endDate,
      name: this.name,
      value: Number(this.value),
      active: this.active,
      isPrimary: this.isPrimary,
      initiatives: this.initiatives,
      tags: this.tags,
      channels: this.channelsId.intID == 0 ? [] : [this.channelsId.apiID],
    }
  }
}
