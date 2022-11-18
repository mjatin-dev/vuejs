import TacticField from './TacticField'
import Tactic from './Tactic'
import TacticPlatform from './TacticPlatform'
import ID from './ID'

export default class TacticType {
  public opened: boolean
  public editing: boolean
  public newPlatform: string
  public newPlatforms: TacticPlatform[]
  public editedTacticTypeName: string
  public newTacticField

  constructor(
    public id: ID = new ID(),
    public creatorId: ID = new ID(),
    public name: string = '',
    public description: string = '',
    public linkedTypeIds: ID[] = [], // Linked types system no longer used - JV 05.24.22
    public tacticFields: TacticField[] = [],
    public tacticPlatforms: TacticPlatform[] = [],
    public channelId: ID = new ID(),
    public shouldHideTacticsFromNestedPlans: boolean = false,
    public isVisibleCustomTacticType: boolean = false,
    public orderIndex: number = 0,
    public shouldTacticsAllowMultiplePlatforms: boolean = false,

    public tactics: Tactic[] = [], //Populated on front-end
    public channelName: string = '', //Populated on front-end
    public abbreviatedPlanName: string = '' //Populated on front-end
  ) {
    this.opened = false
    this.editing = false
    this.newPlatform = ''
    this.newPlatforms = []
    this.editedTacticTypeName = name
    this.newTacticField = {
      name: '',
      type: '',
      description: '',
      helpText: '',
    }
  }

  public get key(): string {
    return this.id.apiID
  }

  public get hasTactics(): boolean {
    if (this.tactics.length) {
      return true
    }
    return false
  }

  public static fromResponseObject(obj): TacticType {
    if (!obj) return new TacticType()

    const linkedTypeIds = [] as ID[]
    if (obj.linkedTypes) {
      obj.linkedTypes.forEach((element) => {
        linkedTypeIds.push(ID.fromResponseObject(element, 'tactic_types'))
      })
    }

    const tacticFields = [] as TacticField[]
    obj.tacticFields.forEach((element) => {
      if (typeof element == 'string') {
        tacticFields.push(
          new TacticField(ID.fromResponseObject(element, 'tactic_fields'))
        )
      } else {
        tacticFields.push(TacticField.fromResponseObject(element))
      }
    })

    const tacticPlatforms = [] as TacticPlatform[]
    obj.tacticPlatforms.forEach((element) => {
      if (typeof element == 'string') {
        tacticPlatforms.push(
          new TacticPlatform(ID.fromResponseObject(element, 'tactic_platforms'))
        )
      } else {
        tacticPlatforms.push(TacticPlatform.fromResponseObject(element))
      }
    })

    return new TacticType(
      ID.fromResponseObject(obj.id, 'tactic_types'),
      ID.fromResponseObject(obj.creator, 'users'),
      obj.name,
      obj.description,
      linkedTypeIds,
      tacticFields,
      tacticPlatforms,
      ID.fromResponseObject(obj.channel, 'channels'),
      obj.shouldHideTacticsFromNestedPlans,
      obj.isVisibleCustomTacticType,
      obj.orderIndex,
      obj.shouldTacticsAllowMultiplePlatforms
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      creator: this.creatorId.intID == 0 ? null : this.creatorId.apiID,
      name: this.name,
      description: this.description,
      linkedTypes: this.linkedTypeIds.map((id) => { // Linked types system no longer used - JV 05.24.22
        return id.apiID
      }),
      tacticFields: this.tacticFields.map((field) => {
        return field.id.apiID
      }),
      tacticPlatforms: this.tacticPlatforms.map((platform) => {
        return platform.id.apiID
      }),
      channel: this.channelId.intID == 0 ? null : this.channelId.apiID,
      shouldHideTacticsFromNestedPlans: this.shouldHideTacticsFromNestedPlans,
      isVisibleCustomTacticType: this.isVisibleCustomTacticType,
      orderIndex: this.orderIndex,
      shouldTacticsAllowMultiplePlatforms: this.shouldTacticsAllowMultiplePlatforms
    }
  }
}
