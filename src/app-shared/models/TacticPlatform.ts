import ID from './ID'

export default class TacticPlatform {
  constructor(
    public id: ID = new ID(),
    public creatorId: ID = new ID(),
    public name: string = '',
    public plans: ID[] = [],
    public channel: ID = new ID(),
    public isLead: boolean = false,
    public isNested: boolean = false,

  ) {}

  public get key(): string {
    return this.id.apiID
  }
  public static DEFAULT_PLATFORM_NAME = 'No Platform'

  public static fromResponseObject(obj): TacticPlatform {
    if (!obj) return new TacticPlatform()

    let plans = [] as ID[]

    if (obj.plans && obj.plans.length) {
      plans = obj.plans.map((planApiId) =>
        ID.fromResponseObject(planApiId, 'plans')
      )
    }


    return new TacticPlatform(
      ID.fromResponseObject(obj.id, 'tactic_platforms'),
      ID.fromResponseObject(obj.creator, 'users'),
      obj.name,
      plans,
      obj.channel,
      obj.isLead,
      obj.isNested,
     
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      creator: this.creatorId.intID == 0 ? null : this.creatorId.apiID,
      name: this.name,
      plans: this.plans.map((planId) => planId.apiID),
      channel: this.channel.apiID
    }
  }
}
