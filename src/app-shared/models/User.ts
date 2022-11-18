import CustomView from './CustomView'
import MediaAsset from './MediaAsset'
import ID from './ID'
import Role from './Role'
import Channel from './Channel'

export enum UserMostRecentView {
  'dashboard' = 'dashboard',
  'calendar' = 'calendar',
  'budget' = 'budget',
  'view' = 'view',
}

export enum UserStatus {
  'pending' = 'pending',
  'accepted' = 'accepted',
}

export default class User {
  public editingValues: any
  public resendInvite = false

  constructor(
    public id: ID = new ID(),
    public emailAddress: string = '',
    public firstName: string = '',
    public lastName: string = '',
    public profileImage: any = '',
    public customViews: CustomView[] = [],
    public mostRecentView: UserMostRecentView = UserMostRecentView.dashboard,
    public mostRecentPlanId: ID = new ID(),
    public status: string = '',
    public rolesObserved = [],

    public role: Role = new Role(),
    public roleId: ID = new ID(),
    public password: string = '',
    public channels: Channel[] = []
  ) {
    this.editingValues = {
      firstName: this.firstName,
      lastName: this.lastName,
      emailAddress: this.emailAddress,
    }
  }

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  public isValidBySearchText(text: string) {
    if (
      this.firstName.toLowerCase().includes(text) ||
      this.lastName.toLowerCase().includes(text)
    ) {
      return true
    }
    return false
  }

  public transformForEditing(): User {
    this.firstName = this.editingValues.firstName
    this.lastName = this.editingValues.lastName
    this.emailAddress = this.editingValues.emailAddress
    return this
  }

  public static fromResponseObject(obj): User {
    if (!obj) return new User()

    const customViews = [] as CustomView[]
    obj.customViews &&
      obj.customViews.forEach((element) => {
        customViews.push(CustomView.fromResponseObject(element))
      })

    return new User(
      ID.fromResponseObject(obj.id, 'users'),
      obj.emailAddress,
      obj.firstName,
      obj.lastName,
      MediaAsset.fromResponseObject(obj.profileImage),
      customViews,
      obj.mostRecentView,
      ID.fromResponseObject(obj.mostRecentPlanId, 'plans'),
      obj.status,
      obj.rolesObserved,
      obj.role,
      obj.roleId,
      obj.password,
      obj.channels
    )
  }

  public forRequestObject() {
    const returnObj = {
      id: this.id.intID == 0 ? null : this.id.apiID,
      emailAddress: this.emailAddress,
      firstName: this.firstName,
      lastName: this.lastName,
      profileImage: this.profileImage ? this.profileImage : null,
      customViews: this.customViews.map((customView) => customView.id.apiID),
      mostRecentView: this.mostRecentView
        ? this.mostRecentView
        : UserMostRecentView.dashboard,
      mostRecentPlanId:
        this.mostRecentPlanId.intID == 0 ? 0 : this.mostRecentPlanId.intID,
      status: '',
      rolesObserved: this.rolesObserved ? this.rolesObserved : [],
    }
    if (this.password != '') {
      returnObj['password'] = this.password
    }
    return returnObj
  }
}
