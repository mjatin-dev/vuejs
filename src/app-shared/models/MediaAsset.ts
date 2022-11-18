import ID from './ID'

export default class MediaAsset {
  constructor(
    public id: ID = new ID(),
    public type: string = 'null',
    public name: string = 'null',
    public fileLocation: string = 'null'
  ) {}

  public static fromResponseObject(obj): MediaAsset {
    if (!obj) return new MediaAsset()

    return new MediaAsset(
      ID.fromResponseObject(obj.id, 'media_assets'),
      obj.type,
      obj.name,
      obj.fileLocation
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      type: this.type,
      name: this.name,
      fileLocation: this.fileLocation,
    }
  }
}
