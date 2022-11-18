import ID from './ID'

export enum TagType {
  'Objective' = 'Objective',
  'TargetSegment' = 'Target Segment',
  'JourneyPhase' = 'Journey Phase',
  'Custom' = 'Custom',
}

export interface TagCategory {
  id: number;
  label: string;
  name: string;
  categoryName: string;
  tags: Tag[];
}

export default class Tag {
  public editing = false
  public editingValues: any

  constructor(
    public id: ID = new ID(),
    public text: string = '',
    public planId: ID = new ID(),
    public isLead: boolean = false,
    public isNested: boolean = false,
    public orderIndex: number = 0,

    public abbreviatedPlanName: string = ''
  ) {
    this.editingValues = {
      name: this.title,
    }
  }

  public get type(): string {
    return this.text?.split(':')?.[0]
  }

  public get title(): string {
    return this.text.substring(this.text.indexOf(':') + 2)
  }

  public get isObjective(): boolean {
    return this.text.toLowerCase().indexOf('objective:') > -1 ? true : false
  }

  public get isTargetSegment(): boolean {
    return this.text.toLowerCase().indexOf('target segment:') > -1 ||
      this.text.toLowerCase().indexOf('target persona:') > -1
      ? true
      : false
  }

  public get isJourneyPhase(): boolean {
    return this.text.toLowerCase().indexOf('journey phase:') > -1 ? true : false
  }

  public static fromResponseObject(obj): Tag {
    if (!obj) return new Tag()

    return new Tag(
      ID.fromResponseObject(obj.id, 'tags'),
      obj.text,
      ID.fromResponseObject(obj.plan, 'plans'),
      obj.isLead,
      obj.isNested,
      obj.orderIndex
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      text: this.text,
      plan: this.planId.intID == 0 ? null : this.planId.apiID,
      orderIndex: this.orderIndex,
    }
  }
}
