import UserRole from './UserRole'
import ID from './ID'
import Plan from './Plan'

export enum PlanRatingPointsType {
  'trp' = 'trp',
  'grp' = 'grp',
}

export default class Account {
  constructor(
    public id: ID = new ID(),
    public ownerId: ID = new ID(),
    public contactCompanyName: string = '',
    public contactFirstName: string = '',
    public contactLastName: string = '',
    public contactPhone: string = '',
    public contactEmail: string = '',
    public contactAddress1: string = '',
    public contactAddress2: string = '',
    public contactCity: string = '',
    public contactState: string = '',
    public contactZip: string = '',
    public billingAddress1: string = '',
    public billingCity: string = '',
    public billingState: string = '',
    public billingZip: string = '',
    public billingPaymentId: string = '',
    public plans: Plan[] = [],
    public users: UserRole[] = [],
    private expirationDate: Date | null = null
  ) {}

  public get userIds(): number[] {
    return this.users.map((user) => user.id.intID)
  }

  public get isActive(): boolean {
    return this.expirationDate
      ? this.expirationDate < new Date(Date.now())
      : true
  }

  public static fromResponseObject(obj): Account {
    if (!obj) return new Account()

    const plans = [] as Plan[]
    if (obj.plans && obj.plans.length) {
      obj.plans.forEach((element) => {
        plans.push(Plan.fromResponseObject(element))
      })
    }

    const users = [] as UserRole[]
    if (obj.users && obj.users.length) {
      obj.users.forEach((element) => {
        users.push(UserRole.fromResponseObject(element))
      })
    }

    return new Account(
      ID.fromResponseObject(obj.id, 'accounts'),
      ID.fromResponseObject(obj.owner, 'users'),
      obj.contactCompanyName,
      obj.contactFirstName,
      obj.contactLastName,
      obj.contactPhone,
      obj.contactEmail,
      obj.contactAddress1,
      obj.contactAddress2,
      obj.contactCity,
      obj.contactState,
      obj.contactZip,
      obj.billingAddress1,
      obj.billingCity,
      obj.billingState,
      obj.billingZip,
      obj.billingPaymentId,
      plans,
      users,
      obj.expirationDate
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      owner: this.ownerId.intID == 0 ? null : this.ownerId.apiID,
      contactCompanyName: this.contactCompanyName,
      contactFirstName: this.contactFirstName,
      contactLastName: this.contactLastName,
      contactPhone: this.contactPhone,
      contactEmail: this.contactEmail,
      contactAddress1: this.contactAddress1,
      contactAddress2: this.contactAddress2,
      contactCity: this.contactCity,
      contactState: this.contactState,
      contactZip: this.contactZip,
      billingAddress1: this.billingAddress1,
      billingCity: this.billingCity,
      billingState: this.contactState,
      billingZip: this.billingZip,
      billingPaymentId: this.billingPaymentId,
      plans: this.plans.map((plan) => plan.id.apiID),
      users: this.users.map((user) => user.id.apiID),
    }
  }
}
