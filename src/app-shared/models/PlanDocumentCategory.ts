import ID from './ID'
import PlanDocument from './PlanDocument'

export default class PlanDocumentCategory {
  public editing = false
  public newName: string
  constructor(
    public name: string = '',
    public id: ID = new ID(),
    public planDocuments: PlanDocument[] = [],
    public orderIndex: number = 0
  ) {
    this.newName = name
  }

  public static fromResponseObject(obj): PlanDocumentCategory {
    if (!obj) return new PlanDocumentCategory()
    return new PlanDocumentCategory(
      obj.name,
      obj?.id?.intID
        ? obj?.id
        : ID.fromResponseObject(obj?.id, 'plan_document_categories'),
      obj.planDocuments?.map((d) => PlanDocument.fromResponseObject(d)),
      obj.orderIndex
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      name: this.name,
      orderIndex: this.orderIndex,
      planDocuments: this.planDocuments.map((d) => d.id.apiID),
    }
  }
}
