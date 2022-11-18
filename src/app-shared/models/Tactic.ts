import {rrulestr} from 'rrule'
import Tag from './Tag'
import TacticFieldValue from './TacticFieldValue'
import TacticType from './TacticType'
import TacticPlatform from './TacticPlatform'
import ID from './ID'
import PlanDocument from './PlanDocument'
import isValidDate from '../utils/isValidDate'
import Channel from './Channel'

export default class Tactic {
  public editing = false
  public opened = false
  public newTitle: string
  public newStartDate: Date
  public newEndDate: Date
  public newFile: any
  public newFileName: string

  constructor(
    public id: ID = new ID(),
    public aliasId: ID = new ID(), // Tactic alias system no longer used - JV 05.24.22
    public creatorId: ID = new ID(),
    public title: string = '',
    public startDate: Date = new Date(Date.now()),
    public endDate: Date = new Date(Date.now()),
    public tacticTypeId: ID = new ID(),
    public estimatedCost: number = 0,
    public actualCost: number = 0,
    public impressions: number = 0,
    public ratingPoints: number = 0,
    public tags: Tag[] = [],
    public typeValues: TacticFieldValue[] = [],
    public campaignId: ID = new ID(),
    public promotionId: ID = new ID(),
    public keyDateId: ID = new ID(),
    public isFlagged: boolean = false,
    public planId: ID = new ID(),
    public isAllDay: boolean = false,
    public repeats: boolean = false,
    public recurrenceEndDate: Date | null = null,
    public isCustomRecurrence: boolean = false,
    public recurrenceText: string = '',
    public rrule?: string | null, // optional so we can delete it before inserting in calendar if null
    public tacticType: TacticType | null = null,
    public tacticPlatforms: TacticPlatform[] | null = null,
    public isNested: boolean = false,
    public isLead: boolean = false,
    public documents: PlanDocument[] = [],
    public localIsInitiative: boolean = false,

    // public socialAliasNames: string[] = [], //Populated on front-end // Tactic alias system no longer used - JV 05.24.22
    public channelName: string = '', //Populated on front-end
    public isSubscriptionEvent: boolean = false, //Populated on front-end
    public abbreviatedPlanName: string = '' //Populated on front-end
  ) {
    this.newTitle = title
    this.newStartDate = startDate
    this.newEndDate = endDate
    this.newFile = null
    this.newFileName = ''
    this.newFileName = ''
  }

  public get tagCategories() {
    const categories: any = [
      {
        id: 1,
        label: 'Objective',
        name: 'Objective',
        tags: [],
      },
      {
        id: 2,
        label: 'Target Segment',
        name: 'Target Segment',
        tags: [],
      },
      {
        id: 3,
        label: 'Journey Phase',
        name: 'Journey Phase',
        tags: [],
      },
      {
        id: 4,
        label: 'Custom',
        name: 'Custom',
        tags: [],
      },
    ]

    this.tags.forEach((tag) => {
      const [category, name] = tag.text.split(':')
      const categoryIndex = categories.findIndex(
        (cat) => cat.label === category
      )

      const newTag = {
        id: tag.id.intID,
        label: name ? name : category,
        editing: false,
        newName: name ? name : category,
      }

      if (categoryIndex === -1) {
        categories[3].label = category
        categories[3].newName = category
      }
      categories[categoryIndex === -1 ? 3 : categoryIndex].tags.push(newTag)
    })

    return categories
  }

  public get startDateString(): string {
    return this.startDate.toLocaleDateString()
  }

  public get endDateString(): string {
    return this.endDate.toLocaleDateString()
  }

  public get start(): Date {
    return this.startDate
  }

  public get end(): Date {
    if (this.isAllDay) {
      // Add one day to end date of all day events to resolve confusing issue (https://github.com/fullcalendar/fullcalendar/issues/2909)
      const modifiedDate = new Date(this.endDate.getTime())
      modifiedDate.setDate(modifiedDate.getDate() + 1)
      return modifiedDate
    }
    return this.endDate
  }

  public get allDay(): boolean {
    return this.isAllDay
  }

  public get tacticTypeName(): string {
    return this.tacticType ? this.tacticType.name : ''
  }

  public get tacticPlatformName(): string {
    let returnString = ''
    if (this.tacticPlatforms && this.tacticPlatforms.length) {
      this.tacticPlatforms.forEach((platform)=>{
        returnString += platform.name + ' '
      })
    }
    return returnString
  }

  public get isInitiative(): boolean {
    if(this.localIsInitiative == true){
      return true
    }
    if(this.channelName !== '' && this.channelName === Channel.CHANNEL_NAME_INITIATIVES){
      return true
    }
    return false
  }

  public set isInitiative(value: boolean) {
    this.localIsInitiative = value
  }

  public static fromResponseObject(obj): Tactic {
    if (!obj) return new Tactic()

    const tags = [] as Tag[]
    if (obj.tags) {
      obj.tags.forEach((element) => {
        tags.push(Tag.fromResponseObject(element))
      })
    }

    const typeValues = [] as TacticFieldValue[]
    if (obj.typeValues) {
      obj.typeValues.forEach((element) => {
        typeValues.push(TacticFieldValue.fromResponseObject(element))
      })
    }

    let startDateString = obj.startDate
    if (obj.startDate && obj.startDate.date) {
      startDateString = obj.startDate.date
    }

    let endDateString = obj.endDate
    if (obj.endDate && obj.endDate.date) {
      endDateString = obj.endDate.date
    }

    let recurrenceText = ''
    if (
      obj.isCustomRecurrence &&
      obj.recurrence &&
      obj.recurrence !== '' &&
      obj.recurrence !== 'custom'
    ) {
      const rule = rrulestr(obj.recurrence)
      recurrenceText = rule.toText()
    }

    // TODO: REMOVE LATER
    // if the recurrence is accidentally set to 'custom', remove all
    // recurrence properties
    if (obj.recurrence && obj.recurrence === 'custom') {
      obj.recurrence = null
      obj.isCustomRecurrence = false
      recurrenceText = ''
      obj.repeats = false
      obj.recurrenceEndDate = null
    }

    const tacticType = obj.tacticType
      ? TacticType.fromResponseObject(obj.tacticType)
      : null

    let tacticPlatforms = null as TacticPlatform[] | null
    if(obj.tacticPlatforms && obj.tacticPlatforms.length){
      tacticPlatforms = obj.tacticPlatforms.map((platform)=>{
        if (typeof platform == 'string') {
          return new TacticPlatform(
            ID.fromResponseObject(platform, 'tactic_platforms')
          )
        }
        return TacticPlatform.fromResponseObject(platform)
      })
    }

    const documents = [] as PlanDocument[]
    if (obj.documents) {
      obj.documents.forEach((element) => {
        documents.push(PlanDocument.fromResponseObject(element))
      })
    }

    return new Tactic(
      ID.fromResponseObject(obj.id, 'tactics'),
      ID.fromResponseObject(obj.aliasId, 'tactics'), // Tactic alias system no longer used - JV 05.24.22
      ID.fromResponseObject(obj.creator, 'users'),
      obj.title,
      new Date(startDateString),
      new Date(endDateString),
      tacticType
        ? ID.fromResponseObject(tacticType.id.intID, 'tactic_types')
        : new ID(),
      obj.estimatedCost,
      obj.actualCost,
      obj.impressions,
      obj.ratingPoints,
      tags,
      typeValues,
      ID.fromResponseObject(obj.campaignId, 'tactics'),
      ID.fromResponseObject(obj.promotionId, 'tactics'),
      ID.fromResponseObject(obj.keyDateId, 'tactics'),
      obj.isFlagged,
      ID.fromResponseObject(obj.plan, 'plans'),
      obj.isAllDay,
      !!obj.recurrence,
      obj.recurrenceEndDate ? new Date(obj.recurrenceEndDate) : null,
      obj.isCustomRecurrence,
      recurrenceText,
      obj.recurrence || null,
      tacticType,
      tacticPlatforms,
      obj.isNested ? obj.isNested : false,
      obj.isLead ? obj.isLead : false,
      documents,
      obj.isInitiative
    )
  }

  public forRequestObject() {
    return {
      id: this.id.intID == 0 ? null : this.id.apiID,
      aliasId: this.aliasId.intID == 0 ? null : this.aliasId.intID, // Tactic alias system no longer used - JV 05.24.22
      creator: this.creatorId.intID == 0 ? null : this.creatorId.apiID,
      title: this.title,
      startDate: isValidDate(this.startDate)
        ? this.startDate
        : new Date(Date.now()),
      endDate: isValidDate(this.endDate) ? this.endDate : new Date(Date.now()),
      tacticType: this.tacticTypeId.intID == 0 ? null : this.tacticTypeId.apiID,
      estimatedCost: this.estimatedCost,
      actualCost: this.actualCost,
      impressions: this.impressions,
      ratingPoints: this.ratingPoints,
      tags: this.tags.map((tag) => {
        return tag.id.apiID
      }),
      typeValues: this.typeValues.map((value) => {
        return value.id.apiID
      }),
      campaignId: this.campaignId.intID == 0 ? null : this.campaignId.intID,
      promotionId: this.promotionId.intID == 0 ? null : this.promotionId.intID,
      keyDateId: this.keyDateId.intID == 0 ? null : this.keyDateId.intID,
      isFlagged: this.isFlagged,
      plan: this.planId.intID == 0 ? null : this.planId.apiID,
      isAllDay: this.isAllDay,
      recurrence: this.rrule,
      recurrenceEndDate: this.recurrenceEndDate,
      isCustomRecurrence: this.isCustomRecurrence,
      tacticPlatforms: this.tacticPlatforms?.map((platform)=>platform.id.apiID),
      documents: this.documents.map((document) => {
        return document.id.apiID
      }),
      isInitiative: this.isInitiative,
    }
  }
}
