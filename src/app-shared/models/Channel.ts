import ID from './ID'
import TacticType from './TacticType'

export default class Channel {
  public opened: boolean
  public editing: boolean
  public newTacticName: string
  public editedChannelName: string

  constructor(
    public id: ID = new ID(),
    public creatorId: ID = new ID(),
    public planId: ID = new ID(),
    public name: string = '',
    public description: string = '',
    public isShared: boolean = false,
    public tacticTypes: TacticType[] = [],
    public enableTacticFlagging: boolean = false,
    public currentMonthlyFocus: string | boolean = '',
    public isPaidMedia: boolean = false,
    public isNested: boolean = false,
    public isLead: boolean = false,
    public isVisibleCustomChannel: boolean = false,
    public uiColor: string = '#EF482A',
    public orderIndex: number = 0,

    public abbreviatedPlanName: string = '' //Populated on front-end
  ) {
    this.opened = false
    this.editing = false
    this.editedChannelName = name
    this.newTacticName = ''
  }

  public static CHANNEL_NAME_INITIATIVES = 'Initiatives'
  public static CHANNEL_NAME_SOCIAL = 'Social Media'

  public get key() {
    return 'channel-' + this.id.intID.toString()
  }

  public get useMonthlyFocusType(): boolean {
    return this.currentMonthlyFocus === true
      ? true
      : this.currentMonthlyFocus === 'show'
  }

  public set useMonthlyFocusType(newValue: boolean) {
    newValue
      ? (this.currentMonthlyFocus = 'show')
      : (this.currentMonthlyFocus = '')
  }

  public get hasTactics(): boolean {
    let returnValue = false
    if (this.tacticTypes.length) {
      this.tacticTypes.forEach((type) => {
        if (type.hasTactics) {
          returnValue = true
        }
      })
    }
    return returnValue
  }

  public static fromResponseObject(obj): Channel {
    if (!obj) return new Channel()

    const tacticTypes = [] as TacticType[]
    obj?.tacticTypes?.forEach((element) => {
      tacticTypes.push(TacticType.fromResponseObject(element))
    })

    const planId = obj.plan
      ? obj.plan.id
        ? ID.fromResponseObject(obj.plan.id, 'plans')
        : new ID()
      : obj.planId

    let adjustedColor = obj.uiColor
    if(obj.uiColor == null){
      switch(String(obj.name).toLowerCase().replaceAll(' ', '-')){
        case 'website':
          adjustedColor = '#FFD967'
          break;
        case 'email':
          adjustedColor = '#FF9767'
          break;
        case 'social-media':
          adjustedColor = '#F3739F'
          break;
        case 'collateral':
          adjustedColor = '#DD79EB'
          break;
        case 'direct-mail':
          adjustedColor = '#BE779C'
          break;
        case 'pr':
          adjustedColor = '#C38D6D'
          break;
        case 'advertising-assets':
          adjustedColor = '#E3ED79'
          break;
        case 'paid-media':
          adjustedColor = '#91D395'
          break;
        case 'signage':
          adjustedColor = '#7CE4DA'
          break;
        default:
          adjustedColor = '#E3ED79'
      }
    }

    return new Channel(
      ID.fromResponseObject(obj.id, 'channels'),
      ID.fromResponseObject(obj.creator, 'users'),
      planId,
      obj.name,
      obj.description,
      obj.isShared,
      tacticTypes,
      obj.enableTacticFlagging,
      obj.currentMonthlyFocus === 'show' ? true : false,
      obj.isPaidMedia ? obj.isPaidMedia : false,
      obj.isNested ? obj.isNested : false,
      obj.isLead ? obj.isLead : false,
      obj.isVisibleCustomChannel,
      adjustedColor,
      obj.orderIndex
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      creator: this.creatorId.intID == 0 ? null : this.creatorId.apiID,
      plan: this.planId.intID == 0 ? null : this.planId.apiID,
      name: this.name,
      description: this.description,
      isShared: this.isShared,
      tacticTypes: this.tacticTypes.map((type) => {
        return type.id.apiID
      }),
      enableTacticFlagging: this.enableTacticFlagging,
      currentMonthlyFocus: this.currentMonthlyFocus ? 'show' : '',
      isPaidMedia: this.isPaidMedia,
      isVisibleCustomChannel: this.isVisibleCustomChannel,
      uiColor: this.uiColor,
      orderIndex: this.orderIndex,
    }
  }
}
