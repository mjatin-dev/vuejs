import ID from './ID'

export default class CustomView {
  constructor(
    public id: ID = new ID(),
    public name: string = '',
    public viewConfig: string = '',
    public userId: ID = new ID(),
  ) {}

  public static fromResponseObject(obj): CustomView {
    if (!obj) return new CustomView()
    return new CustomView(
      ID.fromResponseObject(obj.id, 'custom_views'),
      obj.name,
      obj.viewConfig,
      ID.fromResponseObject(obj.user, 'users')
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      name: this.name,
      viewConfig: this.viewConfig,
      user: this.userId.intID == 0 ? null : this.userId.apiID,
    }
  }
}
