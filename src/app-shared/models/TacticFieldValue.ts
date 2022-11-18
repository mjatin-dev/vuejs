import ID from './ID'

export default class TacticFieldValue {
  constructor(
    public id: ID = new ID(),
    public tacticFieldId: ID = new ID(),
    public value: string | number = '',
  ) {}

  public static fromResponseObject(obj): TacticFieldValue {
    if (!obj) return new TacticFieldValue()

    return new TacticFieldValue(
      ID.fromResponseObject(obj.id, 'tactic_field_values'),
      ID.fromResponseObject(obj.tacticField, 'tactic_fields'),
      obj.value
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      tacticField: this.tacticFieldId.intID == 0 ? null : this.tacticFieldId.apiID,
      value: this.value
    }
  }
}
