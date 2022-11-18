import Channel from './Channel'
import ID from './ID'
import Role from './Role'
import User from './User'

export default class UserRole {
  public isEditing = false
  public editingValues: any
  public name = ''
  public currentChannels: Channel[] = []

  constructor(
    public id: ID = new ID(),
    public roleId: ID = new ID(),
    public role: Role = new Role(),
    public user: User = new User(),
    public canViewBudget: boolean = false,
    public channels: ID[] = [],

    public planId: ID = new ID(),
    public userId: ID = new ID(),
    public accountId: ID = new ID()
  ) {
    this.editingValues = {
      name: this.name,
      role: this.role,
      roleId: this.roleId,
      canViewBudget: this.canViewBudget,
      channels: [],
      plan: this.planId,
    }
  }

  public transformForEditing(): UserRole {
    this.roleId =
      this.editingValues?.role?.code || this.editingValues?.roleId?.code
    this.canViewBudget = this.editingValues.canViewBudget
    this.channels = [
      ...this.editingValues.channels.map((channel: any) =>
        channel.id ? channel.id : channel
      ),
    ]
    this.user = this.user.transformForEditing()
    return this
  }

  public static fromResponseObject(obj): UserRole {
    if (!obj) return new UserRole()

    const channels = [] as ID[]
    if (obj.channels) {
      obj.channels.forEach((channelInput: ID | string | object) => {
        if(typeof channelInput === 'string'){
          channels.push(ID.fromResponseObject(channelInput, 'channels'))
        }else if(typeof channelInput === 'object'){
          channels.push(ID.fromResponseObject(channelInput['id'], 'channels'))
        }else{
          channels.push(channelInput)
        }
      })
    }

    let userObj = null as User | null
    let userId = null as ID | null
    if (obj.user && obj.user.id) {
      userObj = User.fromResponseObject(obj.user)
      userId = userObj.id.clone()
    } else {
      userId = ID.fromResponseObject(obj.user, 'users')
      userObj = new User(userId)
    }

    return new UserRole(
      ID.fromResponseObject(obj.id, 'user_roles'),
      ID.fromResponseObject(obj.role, 'roles'),
      Role.fromResponseObject(obj.role),
      userObj,
      obj.canViewBudget,
      channels.map((id) => id.clone()),
      ID.fromResponseObject(obj.plan, 'plans'),
      userId,
      ID.fromResponseObject(obj.account, 'accounts')
    )
  }

  public forRequestObject(): any {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      role: this.roleId.intID == 0 ? null : this.roleId.apiID,
      user:
        this.userId.intID !== 0
          ? this.userId.apiID
          : this.user.id.intID == 0
          ? null
          : this.user.id.apiID,
      canViewBudget: this.canViewBudget,
      channels: this.channels.map((channelId: ID) => channelId.apiID),
      plan: this.planId.intID == 0 ? null : this.planId.apiID,
      account: this.accountId.intID == 0 ? null : this.accountId.apiID,
    }
  }
}
