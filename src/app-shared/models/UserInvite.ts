import ID from './ID'

export default class UserInvite {
  constructor(
    public accountId: ID = new ID(),
    public emailAddress: string = '',
    public firstName: string = '',
    public lastName: string = '',
    public planId: ID = new ID(),
    public roleId: ID = new ID(),
  ) {}

  public static fromResponseObject(obj): UserInvite {
    if (!obj) return new UserInvite()

    return new UserInvite(
      ID.fromResponseObject(obj.id, 'user_invites'),
      obj.emailAddress,
      obj.firstName,
      obj.lastName,
      ID.fromResponseObject(obj.plan, 'plans'),
      ID.fromResponseObject(obj.role, 'roles')
    )
  }

  public forRequestObject() {
    return {
      account: this.accountId.intID == 0 ? null : this.accountId.apiID,
      plan: this.planId.intID == 0 ? null : this.planId.apiID,
      emailAddress: this.emailAddress,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.roleId.intID == 0 ? null : this.roleId.apiID
    }
  }
}
