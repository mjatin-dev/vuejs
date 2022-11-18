export enum CommentRecordType {
  'budget' = 'budget',
  'tactic' = 'tactic',
}
import ID from './ID'

export default class Comment {
  constructor(
    public id: ID = new ID(),
    public creatorId: ID = new ID(),
    public assigneeId: ID = new ID(),
    public taggedUsers: ID[] = [],
    public recordId: ID = new ID(),
    public recordType: CommentRecordType = CommentRecordType.budget,
    public text: string = ''
  ) {}

  public static fromResponseObject(obj): Comment {
    if (!obj) return new Comment()

    const taggedUsers = [] as ID[]
    obj.taggedUsers.forEach((element) => {
      taggedUsers.push(ID.fromResponseObject(element, 'users'))
    })

    return new Comment(
      ID.fromResponseObject(obj.id, 'comments'),
      ID.fromResponseObject(obj.creator, 'users'),
      ID.fromResponseObject(obj.assignee, 'users'),
      taggedUsers,
      ID.fromResponseObject(obj.record, 'users'),
      obj.recordType,
      obj.text
    )
  }

  public forRequestObject(){
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      creator: this.creatorId.intID == 0 ? null : this.creatorId.apiID,
      assignee: this.assigneeId.intID == 0 ? null : this.assigneeId.apiID,
      taggedUsers: this.taggedUsers.map((userId)=>userId.apiID),
      record: this.recordId.intID == 0 ? null : this.recordId.apiID,
      recordType: this.recordType,
      text: this.text
    }
  }
}
