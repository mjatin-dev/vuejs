export enum TacticsImportDataFormat {
  'string' = 'Text',
  'integer' = 'Number',
  'date' = 'Date',
  'url' = 'URL',
}

export default class TacticsImportMapping {
  constructor(
    public id: string = '',
    public inputFileColumns: object[] = [],
    public tacticTypeProperties: object[] = [],
    public tacticTypeFields: object[] = [],
    public tacticTypePropertyMappings: object = {},
    public tacticTypePropertyDefaults: object = {},
    public tacticTypeFieldMappings: object[] = []
  ) {}

  public addTacticPropertyMapping(tacticPropertyName: string, csvColumnName: string, defaultValue?: string){
    // TODO: update existing property in this.tacticTypePropertyMappings if it exists
    this.tacticTypePropertyMappings[tacticPropertyName] = csvColumnName
    if(defaultValue) {
        this.tacticTypePropertyDefaults[tacticPropertyName] = defaultValue
    }
  }

  public addTacticFieldMapping(csvColumnName: string, newTacticFieldName: string, existingTacticFieldIntId: number|null=null) {
    // TODO: update existing field in this.tacticTypeFieldMappings if it exists
      this.tacticTypeFieldMappings.push({
        id: existingTacticFieldIntId,
        columnName: csvColumnName,
        newFieldName: newTacticFieldName
      })
  }

  public static fromResponseObject(obj) {
    if (!obj) return new TacticsImportMapping()

    // guessedColumns --> this.inputFileColumns
    const inputFileColumns = [] as object[]
    if (obj['guessedColumns']) {
      for (const property in obj['guessedColumns']) {
        inputFileColumns.push({
          name: property,
          format: obj['guessedColumns'][property]
        })
      }
    }

    // neededColumns --> this.tacticTypeProperties
    const tacticTypeProperties = [] as object[]
    if (obj['neededColumns']) {
      for (const property in obj['neededColumns']) {
        tacticTypeProperties.push({
          name: property,
          format: obj['neededColumns'][property]
        })
      }
    }

    // existingTacticFields --> this.tacticTypeFields
    const tacticTypeFields = [] as object[]
    if (obj['existingTacticFields']) {
      for (const property in obj['existingTacticFields']) {
        tacticTypeFields.push({
          id: Number(property),
          name: obj['existingTacticFields'][property]
        })
      }
    }

    return new TacticsImportMapping(
      obj.importId,
      inputFileColumns,
      tacticTypeProperties,
      tacticTypeFields
    )
  }

  public forRequestObject() {
    return {
      id: this.id,
      mapping: this.tacticTypePropertyMappings,
      defaults: this.tacticTypePropertyDefaults,
      tacticFields: this.tacticTypeFieldMappings
    }
  }
}