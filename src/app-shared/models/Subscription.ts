import DuplicateSubscriptionEventMapping from './DuplicateSubscriptionEventMapping'
import ID from './ID'
import Tactic from './Tactic'

export default class Subscription {
  public opened = false
  public selected = false
  public editValues: any

  constructor(
    public id: ID = new ID(),
    public name: string = '',
    public calendarPath: string = '',

    public description: string = '',
    public organization: string = '',
    public accountId: ID = new ID(),

    public events: Tactic[] = [], //Populated on front-end
    public lastUpdate: Date = new Date(), //Populated on front-end
    public duplicateEventsMap: DuplicateSubscriptionEventMapping[] = [] //Populated on front-end
  ) {
    this.editValues = {
      name: this.name,
      description: this.description,
      organization: this.organization,
    }
  }

  public get key(): string {
    return 'subscription-' + this.id.intID.toString()
  }

  public static fromResponseObject(obj): Subscription {
    if (!obj) return new Subscription()

    return new Subscription(
      ID.fromResponseObject(obj.id, 'subscriptions'),
      obj.name,
      obj.calendarPath,
      obj.description,
      obj.organization,
      ID.fromResponseObject(obj.account, 'accounts')
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      name: this.name,
      description: this.description,
      calendarPath: this.calendarPath,
      account: this.accountId.intID == 0 ? null : this.accountId.apiID,
    }
  }
}
