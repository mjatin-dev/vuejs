import ID from './ID'

export enum TacticFieldType {
  'string' = 'string',
  'number' = 'number',
  'url' = 'url',
  'image' = 'image',
  // 'dropdown' = 'dropdown',
}
export default class TacticField {
  public editing: boolean
  public editedTacticFieldFields

  constructor(
    public id: ID = new ID(),
    public creatorId: ID = new ID(),
    public name: string = '',
    public type: TacticFieldType = TacticFieldType.string,
    public description: string = '',
    public helpText: string = '',
    public options: string[] = [],
    public orderIndex: number = 0
  ) {
    this.editing = false
    this.editedTacticFieldFields = {
      name: name,
      type: type,
      description: description,
      helpText: helpText,
    }
  }

  public get key() {
    return 'field-' + this.id.intID.toString()
  }

  public static fromResponseObject(obj): TacticField {
    if (!obj) return new TacticField()

    const options = [] as string[]
    if (obj.options) {
      obj.options.forEach((element) => {
        options.push(element)
      })
    }

    return new TacticField(
      ID.fromResponseObject(obj.id, 'tactic_fields'),
      ID.fromResponseObject(obj.creator, 'users'),
      obj.name,
      obj.type,
      obj.description,
      obj.helpText,
      options,
      obj.orderIndex
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      creator: this.creatorId.intID == 0 ? null : this.creatorId.apiID,
      name: this.name,
      type: this.type,
      description: this.description,
      helpText: this.helpText,
      options: this.options,
      orderIndex: this.orderIndex,
    }
  }
}
