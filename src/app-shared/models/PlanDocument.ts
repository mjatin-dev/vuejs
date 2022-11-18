import MediaAsset from './MediaAsset'
import ID from './ID'
import PlanDocumentCategory from './PlanDocumentCategory'

export default class PlanDocument {
  constructor(
    public id: ID = new ID(),
    public asset: MediaAsset = new MediaAsset(),
    public categories: PlanDocumentCategory[] = [],
    public orderIndex: number = 0,
    public tactics: ID[] = [],
    public plan: ID = new ID()
  ) {}

  public static fromResponseObject(obj): PlanDocument {
    if (!obj) return new PlanDocument()
    return new PlanDocument(
      ID.fromResponseObject(obj.id, 'plan_documents'),
      MediaAsset.fromResponseObject(obj.asset),
      obj.categories?.map((c) => PlanDocumentCategory.fromResponseObject(c)),
      obj.orderIndex,
      obj.tactics?.map((t) => ID.fromResponseObject(t, 'tactics')) ?? [],
      ID.fromResponseObject(obj.plan, 'plans')
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      asset: this.asset.id.intID == 0 ? null : this.asset.id.apiID,
      categories: this.categories.map((c) => c.id.apiID).filter((c) => !!c),
      orderIndex: this.orderIndex,
      tactics: this.tactics.map((t) => t.apiID),
      plan: this.plan.apiID,
    }
  }
}
