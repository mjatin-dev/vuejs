import UserRole from './UserRole'
import ID from './ID'
import Tactic from './Tactic'
import TacticPlatform from './TacticPlatform'
import Channel from './Channel'
import Tag from './Tag'
import Subscription from './Subscription'
import User from './User'
import Budget from './Budget'
import PlanDocumentCategory from './PlanDocumentCategory'
import PlanDocument from './PlanDocument'
import Role from './Role'

export enum PlanRatingPointsType {
  'TRP' = 'trp',
  'GRP' = 'grp',
}

export enum PlanType {
  'Individual' = 'Individual',
  'Master' = 'Master',
  'Sub' = 'Sub',
}

export enum PlanWeekStartDay {
  'Sunday' = 'sunday',
  'Monday' = 'monday',
}

export default class Plan {
  public isEditing = false
  public editingValues: any
  public role: Role = new Role()
  public canViewBudget = false
  public roleId: ID = new ID()
  public subPlans: Plan[] = []
  public account: ID = new ID()
  constructor(
    public id: ID = new ID(),
    public creator: User = new User(),
    public name: string = '',
    public type: PlanType = PlanType.Individual,
    public startDate: Date = new Date(),
    public endDate: Date = new Date(),
    public weekStartDay: PlanWeekStartDay = PlanWeekStartDay.Sunday,

    public channels: Channel[] = [],
    public users: UserRole[] = [],
    public tactics: Tactic[] = [],
    public budgets: Budget[] = [],
    public tags: Tag[] = [],
    public subscriptions: Subscription[] = [],
    public ratingPointsType: PlanRatingPointsType = PlanRatingPointsType.GRP,
    public tacticPlatforms: TacticPlatform[] = [],

    public plans: ID[] = [], //IDs for sub-plans if PlanType is Master
    public parentId: ID = new ID(), //ID for parent Master plan if PlanType is Sub
    public accountId: ID = new ID(),

    public isTemplate: boolean = false,
    public useBudgets: boolean = false,

    public defaultChannels: Channel[] = [],

    public planDocumentCategories: PlanDocumentCategory[] = [],
    public documents: PlanDocument[] = [],

    public initiativeChannel: Channel = new Channel() // Populated on FE
  ) {
    this.editingValues = {
      name: this.name,
      role: this.role,
      roleId: this.roleId,
      canViewBudget: this.canViewBudget,
      channels: [],
    }
  }

  public static SUPER_PLAN_ID = process.env.VUE_APP_SUPER_PLAN_ID //STANGA DEV: 27 / ANNUM STAGE: 15 / ANNUM PROD: 15

  public get isBudgetEnabled(): boolean {
    return this.useBudgets
  }

  public get abbreviatedName(): string {
    const splitName = this.name.split(' ')
    if (splitName.length > 1) {
      return String(splitName[0][0] + splitName[1][0]).toUpperCase()
    } else {
      return this.name.substr(0, 2).toUpperCase()
    }
  }

  public get userIds(): number[] {
    return this.users.map((user) => {
      return user.id.intID
    })
  }

  public get totalBudget(): number {
    let returnValue = 0
    this.budgets.forEach((budget) => {
      returnValue += budget.value
    })
    return returnValue
  }

  public static fromResponseObject(obj): Plan {
    if (!obj) return new Plan()

    const channels = [] as Channel[]
    let initiativeChannel = new Channel()
    if (obj.channels) {
      obj.channels.forEach((element) => {
        if (element.name === 'Initiatives') {
          initiativeChannel = Channel.fromResponseObject(element)
        }
        channels.push(Channel.fromResponseObject(element))
      })
    }

    const defaultChannels = [] as Channel[]
    if (obj.defaultChannels) {
      obj.defaultChannels.forEach((element) => {
        defaultChannels.push(Channel.fromResponseObject(element))
      })
    }

    const users = [] as UserRole[]
    if (obj.users) {
      obj.users.forEach((element) => {
        users.push(UserRole.fromResponseObject(element))
      })
    }

    const tactics = [] as Tactic[]
    if (obj.tactics) {
      obj.tactics.forEach((element) => {
        tactics.push(Tactic.fromResponseObject(element))
      })
    }

    const tags = [] as Tag[]
    if (obj.tags) {
      obj.tags.forEach((element) => {
        tags.push(Tag.fromResponseObject(element))
      })
    }

    const subscriptions = [] as Subscription[]
    if (obj.subscriptions) {
      obj.subscriptions.forEach((element) => {
        subscriptions.push(Subscription.fromResponseObject(element))
      })
    }

    const tacticPlatforms = [] as TacticPlatform[]
    if (obj.tacticPlatforms) {
      obj.tacticPlatforms.forEach((element) => {
        tacticPlatforms.push(TacticPlatform.fromResponseObject(element))
      })
    }

    const plans = [] as ID[]
    if (obj.plans) {
      obj.plans.forEach((element) => {
        plans.push(ID.fromResponseObject(element, 'plans'))
      })
    }

    const budgets = [] as Budget[]
    obj?.budgets?.forEach((element) => {
      budgets.push(Budget.fromResponseObject(element))
    })

    return new Plan(
      ID.fromResponseObject(obj.id, 'plans'),
      User.fromResponseObject(obj.creator),
      obj.name,
      obj.type,
      new Date(obj.startDate),
      new Date(obj.endDate),
      obj.weekStartDay,
      channels,
      users,
      tactics,
      budgets,
      tags,
      subscriptions,
      obj.ratingPointsType,
      tacticPlatforms,
      plans,
      obj.parent ? ID.fromResponseObject(obj.parent, 'plans') : new ID(),
      obj.account && obj.account.id
        ? ID.fromResponseObject(obj.account.id, 'accounts')
        : new ID(),
      obj.isTemplate,
      obj.useBudgets,
      defaultChannels,
      obj.planDocumentCategories?.map((category) =>
        PlanDocumentCategory.fromResponseObject(category)
      ),
      obj.documents?.map((document) =>
        PlanDocument.fromResponseObject(document)
      ),
      initiativeChannel
    )
  }

  public forRequestObject() {
    const returnObj = {
      id: this.id.intID == 0 ? null : this.id.apiID,
      account: this.account.apiID,
      creator: this.creator.id.intID == 0 ? null : this.creator.id.apiID,
      name: this.name,
      type: this.type,
      startDate: this.startDate,
      endDate: this.endDate,
      weekStartDay: this.weekStartDay,
      channels: this.channels
        .filter(
          (channel) =>
            (this.plans.length && channel.isLead) ||
            (!this.plans.length && !channel.isLead)
        )
        .map((channel) => {
          return channel.id.apiID
        }),
      defaultChannels: this.defaultChannels.map((channel) => {
        return {
          channel: channel.id.apiID,
          tacticTypes: channel.tacticTypes.map((type) => type.id.apiID),
        }
      }),
      users: this.users.map((user) => {
        return user.id.apiID
      }),
      tactics: this.tactics
        .filter(
          (tactic) =>
            (this.plans.length && tactic.isLead) ||
            (!this.plans.length && !tactic.isLead)
        )
        .map((tactic) => {
          return tactic.id.apiID
        }),
      tags: this.tags
        .filter(
          (tag) =>
            (this.plans.length && tag.isLead) ||
            (!this.plans.length && !tag.isLead)
        )
        .map((tag) => {
          return tag.id.apiID
        }),
      subscriptions: this.subscriptions.map((subscription) => {
        return subscription.id.apiID
      }),
      ratingPointsType: this.ratingPointsType,
      tacticPlatforms: this.tacticPlatforms
        .filter(
          (platform) =>
            (this.plans.length && platform.isLead) ||
            (!this.plans.length && !platform.isLead)
        )
        .map((platform) => {
          return platform.id.apiID
        }),
      plans: this.plans.map((planId) => {
        return planId.apiID
      }),
      budgets: this.budgets.map((budget) => {
        return budget.id.apiID
      }),
      parent: this.parentId.intID == 0 ? null : this.parentId.apiID,
      isTemplate: this.isTemplate,
      useBudgets: this.useBudgets,
      planDocumentCategories: this.planDocumentCategories
        .map((category) => category.id.apiID)
        .filter((el) => !!el),
      documents: this.documents.map((document) => document.id.apiID),
    } as any

    if (this.accountId.intID !== 0) {
      returnObj.account = this.accountId.apiID
    }

    return returnObj
  }
}
