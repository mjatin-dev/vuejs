<template>
  <div class="view-wrapper tactic-import-view">
    <ViewHeader
      title="Import Tactics"
      :hideSectionHomeButton="true"
      :isFullViewport="true"
    >
      <template #actions>
        <Button
          label="Cancel"
          class="p-button-outlined"
          @click="showCancelConfirmation($event)"
        />
      </template>
    </ViewHeader>
    <ViewMain :isFullViewport="true">
      <Steps :model="flowSteps" />
      <div class="upload-step-container step-one" v-if="currentStep == 1">
        <div class="p-d-flex p-mb-3">
          <template>
            <div class="p-mr-3">
              <Dropdown
                v-model="selectedChannel"
                :options="channelOptions"
                dataKey="key"
                optionLabel="name"
                placeholder="Select channel"
              />
            </div>
            <div class="p-mr-3">
              <Dropdown
                v-model="selectedType"
                :options="typeOptions"
                :disabled="!selectedChannel.id"
                dataKey="key"
                optionLabel="name"
                placeholder="Select Type"
              />
            </div>
            <div class="p-mr-3">
              <Dropdown
                v-if="
                  selectedChannel.id &&
                  selectedType.id &&
                  platformOptions.length
                "
                v-model="selectedPlatform"
                :options="platformOptions"
                dataKey="key"
                optionLabel="name"
                placeholder="Select Platform"
              />
            </div>
          </template>
          <div>
            <FileUpload
              mode="basic"
              name="tacticImportFile"
              :customUpload="true"
              @uploader="uploadTacticFile"
              accept="text/csv"
              :maxFileSize="1000000"
              :auto="true"
              :disabled="!selectedType.id"
              chooseLabel="Choose File"
            >
              <template #empty>
                <p>Drag and drop files to here to upload.</p>
              </template>
            </FileUpload>
          </div>
        </div>
      </div>
      <div class="map-step-container step-two" v-if="currentStep == 2">
        <div class="map-table">
          <div class="map-row header">
            <div class="input-column"><h3>Column in CSV</h3></div>
            <div class="arrow-column">
              <span class="pi pi-arrow-right"></span>
            </div>
            <div class="output-column"><h3>Tactic Field in Annum</h3></div>
          </div>
          <div
            class="map-row"
            v-for="(column, index) in tacticMapping.inputFileColumns"
            :key="`${index}-${column.name}`"
          >
            <div class="input-column">
              <h4>
                {{ column.name }}
                <span class="input-format">{{
                  `(${getDisplayNameForDataFormat(column.format)})`
                }}</span>
              </h4>
            </div>
            <div class="arrow-column">
              <span class="pi pi-arrow-right"></span>
            </div>
            <div class="output-column">
              <Dropdown
                v-model="localMappings[`${index}-${column.name}`]"
                :inputId="`${index}-${column.name}`"
                :options="
                  column.format === 'string'
                    ? outputStringFieldOptions
                    : column.format === 'number'
                    ? outputNumericFieldOptions
                    : column.format === 'date'
                    ? outputDateFieldOptions
                    : column.format === 'url'
                    ? outputUrlFieldOptions
                    : outputFieldOptions
                "
                placeholder="Tactic Field"
                optionLabel="label"
                optionValue="value"
                optionDisabled="disabled"
              />
            </div>
          </div>
        </div>
        <div class="p-d-flex p-mt-3">
          <Button @click="reuploadFile" class="p-mr-3">Re-Upload File</Button>
          <Button @click="continueWithFieldMappings($event)">Continue</Button>
        </div>
      </div>
      <div class="confirm-step-container step-three" v-if="currentStep == 3">
        <h3>Select tactics to import.</h3>
        <DataTable
          :value="importedTacticRows"
          :autoLayout="true"
          editMode="row"
        >
          <Column>
            <template #body="slotProps">
              <div>
                <template v-if="slotProps.data.isInvalid">
                  <span
                    class="pi pi-exclamation-circle"
                    style="color: red"
                  ></span>
                </template>
                <template v-else>
                  <Checkbox
                    class="column-checkbox"
                    :value="slotProps.data"
                    :name="slotProps.title"
                    v-model="checkedRows"
                  />
                </template>
              </div>
            </template>
          </Column>
          <Column header="Topic" columnKey="title" field="title">
            <template #body="slotProps">
              <template
                v-if="slotProps.data.title && slotProps.data.title !== ''"
              >
                {{ slotProps.data.title }}
              </template>
              <template v-else
                ><span style="color: red">No topic found</span></template
              >
            </template>
          </Column>
          <Column header="Start Date" columnKey="startDate" field="startDate">
            <template #body="slotProps">
              <template v-if="slotProps.data.startDate">
                {{ new Date(slotProps.data.startDate).toLocaleDateString() }}
              </template>
            </template>
          </Column>
          <Column header="End Date" columnKey="endDate" field="endDate">
            <template #body="slotProps">
              <template v-if="slotProps.data.endDate">
                {{ new Date(slotProps.data.endDate).toLocaleDateString() }}
              </template>
            </template>
          </Column>
          <Column
            header="Estimated Cost"
            columnKey="estimatedCost"
            field="estimatedCost"
          ></Column>
          <Column
            header="Actual Cost"
            columnKey="actualCost"
            field="actualCost"
          ></Column>
          <template v-for="field in tacticFieldsOfSelectedType">
            <Column :header="field.name" :key="field.key">
              <template #body="slotProps">
                {{ getFieldValueForTactic(field.name, slotProps.data) }}
              </template>
            </Column>
          </template>
          <Column header="Errors" columnKey="columnErrors" field="columnErrors">
            <template #body="slotProps">
              <template v-if="slotProps.data.columnErrors">
                <span style="color: red">{{
                  slotProps.data.columnErrors
                }}</span>
              </template>
              <template v-else> No Errors </template>
            </template>
          </Column>
          <template #empty>No columns found.</template>
        </DataTable>
        <div class="p-d-flex p-mt-3">
          <Button @click="reuploadFile" class="p-mr-3">Re-Upload File</Button>
          <Button @click="confirmImport" class="p-mr-3">Confirm</Button>
          <Button @click="cancelImport">Cancel</Button>
        </div>
      </div>
    </ViewMain>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ViewHeader from '@/app-shared/components/ViewHeader.vue'
import ViewMain from '@/app-shared/components/ViewMain.vue'
import Plan from '@/app-shared/models/Plan'
import Channel from '@/app-shared/models/Channel'
import TacticType from '@/app-shared/models/TacticType'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Dropdown from 'primevue/dropdown'
import FileUpload from 'primevue/fileupload'
import TacticField from '@/app-shared/models/TacticField'
import Steps from 'primevue/steps'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import TacticsImportMapping from '@/app-shared/models/TacticsImportMapping'
import ID from '@/app-shared/models/ID'
import Tactic from '@/app-shared/models/Tactic'
import TacticPlatform from '@/app-shared/models/TacticPlatform'

Vue.component('Column', Column)
Vue.component('ColumnGroup', ColumnGroup)
Vue.component('Button', Button)
Vue.component('DataTable', DataTable)
Vue.component('Dropdown', Dropdown)
Vue.component('FileUpload', FileUpload)
Vue.component('Steps', Steps)

export default Vue.extend({
  name: 'TacticImport',
  components: {
    ViewHeader,
    ViewMain,
  },
  data: () => {
    return {
      localMappings: {} as object,
      validImportRows: [] as object[],
      invalidImportRows: [] as object[],
      importErrors: [] as object[],
      checkedRows: [] as object[],
      baseOutputFieldOptions: [
        {
          label: 'New Field',
          value: 'new',
        },
        {
          label: 'Topic',
          value: 'title',
        },
        {
          label: 'Start Date',
          value: 'startDate',
        },
        {
          label: 'End Date',
          value: 'endDate',
        },
        {
          label: 'Estimated Cost',
          value: 'estimatedCost',
        },
        {
          label: 'Actual Cost',
          value: 'actualCost',
        },
        // Media fields removed for MVP
        // {
        //   label: 'Impressions',
        //   value: 'impressions',
        // },
        // {
        //   label: 'Rating Points',
        //   value: 'ratingPoints',
        // },
      ] as object[],
      stringFieldOptions: [
        {
          label: 'New Field',
          value: 'new',
        },
        {
          label: 'Topic',
          value: 'title',
        },
      ] as object[],
      URLFieldOptions: [
        {
          label: 'New Field',
          value: 'new',
        },
      ] as object[],
      numberFieldOptions: [
        {
          label: 'New Field',
          value: 'new',
        },
        {
          label: 'Estimated Cost',
          value: 'estimatedCost',
        },
        {
          label: 'Actual Cost',
          value: 'actualCost',
        },
        // Media fields removed for MVP
        // {
        //   label: 'Impressions',
        //   value: 'impressions',
        // },
        // {
        //   label: 'Rating Points',
        //   value: 'ratingPoints',
        // },
      ] as object[],
      dateFieldOptions: [
        {
          label: 'Start Date',
          value: 'startDate',
        },
        {
          label: 'End Date',
          value: 'endDate',
        },
      ] as object[],
    }
  },
  computed: {
    currentStep(): number {
      switch (this.$route.name) {
        case 'TacticImport':
          return 1
        case 'TacticImportMap':
          return 2
        case 'TacticImportConfirm':
          return 3
        default:
          return 1
      }
    },
    flowSteps(): {}[] {
      return [
        {
          label: 'Upload File',
          to: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$route.params.planId}/import`,
        },
        {
          label: 'Map Data',
          to: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$route.params.planId}/import/${this.$route.params.importId}/map`,
        },
        {
          label: 'Review and Confirm',
          to: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$route.params.planId}/import/${this.$route.params.importId}/confirm`,
        },
      ]
    },
    tacticMapping: {
      get(): TacticsImportMapping {
        return this.$store.getters.currentTacticMapping
      },
      set(newValue: TacticsImportMapping) {
        this.$store.commit('updateCurrentTacticMapping', newValue)
      },
    },
    currentPlan(): Plan {
      return this.$store.getters.currentPlan
    },
    channelOptions(): Channel[] {
      return this.$store.getters.currentChannels
    },
    platformOptions(): TacticPlatform[] {
      if (!this.selectedChannel.id || !this.selectedType.id) {
        return []
      }
      return this.selectedType.tacticPlatforms
    },
    typeOptions(): TacticType[] {
      if (!this.selectedChannel.id) {
        return []
      }
      const returnArray = [] as TacticType[]
      this.selectedChannel.tacticTypes.forEach((tacticType) => {
        if (
          returnArray.filter((returnType) => returnType.name == tacticType.name)
            .length == 0
        ) {
          returnArray.push(tacticType)
        }
      })
      return returnArray
    },
    selectedChannel: {
      get(): Channel {
        return this.$store.getters.channelViewSelectedChannel
      },
      set(newValue: Channel) {
        this.$store.commit('updateChannelViewSelectedChannel', newValue)
      },
    },
    selectedType: {
      get(): TacticType {
        return this.$store.getters.channelViewSelectedType
      },
      set(newValue: TacticType) {
        this.$store.commit('updateChannelViewSelectedType', newValue)
      },
    },
    selectedPlatform: {
      get(): TacticPlatform {
        return this.$store.getters.channelViewSelectedPlatform
      },
      set(newValue: TacticPlatform) {
        this.$store.commit('updateChannelViewSelectedPlatform', newValue)
      },
    },
    tacticFieldsOfSelectedType(): TacticField[] {
      return this.selectedType.tacticFields
    },
    outputFieldOptions(): object[] {
      let returnArray = this.baseOutputFieldOptions.map((field) => {
        return {
          label: field['label'],
          value: field['value'],
          disabled: Object.keys(this.localMappings)
            .map((key) =>
              this.localMappings[key].replaceAll(' ', '').toLowerCase()
            )
            .includes(String(field['label']).replaceAll(' ', '').toLowerCase()),
        }
      })

      if (this.tacticFieldsOfSelectedType) {
        returnArray = returnArray.concat(
          this.tacticFieldsOfSelectedType.map((field) => {
            return {
              label: field.name,
              value: field.id.intID.toString(),
              disabled: Object.keys(this.localMappings)
                .map((key) => this.localMappings[key])
                .includes(field.id.intID.toString()),
            }
          })
        )
      }

      return returnArray
    },
    outputNumericFieldOptions(): object[] {
      let returnArray = this.numberFieldOptions.map((field) => {
        return {
          label: field['label'],
          value: field['value'],
          disabled: Object.keys(this.localMappings)
            .map((key) =>
              this.localMappings[key].replaceAll(' ', '').toLowerCase()
            )
            .includes(String(field['label']).replaceAll(' ', '').toLowerCase()),
        }
      })

      if (this.tacticFieldsOfSelectedType) {
        returnArray = returnArray.concat(
          this.tacticFieldsOfSelectedType
            .filter((field) => field.type == 'number')
            .map((field) => {
              return {
                label: field.name,
                value: field.id.intID.toString(),
                disabled: Object.keys(this.localMappings)
                  .map((key) => this.localMappings[key])
                  .includes(field.id.intID.toString()),
              }
            })
        )
      }

      return returnArray
    },
    outputDateFieldOptions(): object[] {
      const returnArray = this.dateFieldOptions.map((field) => {
        return {
          label: field['label'],
          value: field['value'],
          disabled: Object.keys(this.localMappings)
            .map((key) =>
              this.localMappings[key].replaceAll(' ', '').toLowerCase()
            )
            .includes(String(field['label']).replaceAll(' ', '').toLowerCase()),
        }
      })

      // Return TacticFields from selected TacticType when dates are supported in TacticFields
      // if (this.tacticFieldsOfSelectedType) {
      //   return this.dateFieldOptions.concat(
      //     this.tacticFieldsOfSelectedType.map((field) => {
      //       return {
      //         label: field.name,
      //         value: field.id.intID.toString(),
      //       }
      //     })
      //   )
      // }

      // return this.dateFieldOptions
      return returnArray
    },
    outputUrlFieldOptions(): object[] {
      let returnArray = this.URLFieldOptions.map((field) => {
        return {
          label: field['label'],
          value: field['value'],
          disabled: Object.keys(this.localMappings)
            .map((key) =>
              this.localMappings[key].replaceAll(' ', '').toLowerCase()
            )
            .includes(String(field['label']).replaceAll(' ', '').toLowerCase()),
        }
      })

      if (this.tacticFieldsOfSelectedType) {
        returnArray = returnArray.concat(
          this.tacticFieldsOfSelectedType
            .filter((field) => field.type == 'string')
            .map((field) => {
              return {
                label: field.name,
                value: field.id.intID.toString(),
                disabled: Object.keys(this.localMappings)
                  .map((key) => this.localMappings[key])
                  .includes(field.id.intID.toString()),
              }
            })
        )
      }

      return returnArray
    },
    outputStringFieldOptions(): object[] {
      let returnArray = this.stringFieldOptions.map((field) => {
        return {
          label: field['label'],
          value: field['value'],
          disabled: Object.keys(this.localMappings)
            .map((key) =>
              this.localMappings[key].replaceAll(' ', '').toLowerCase()
            )
            .includes(String(field['label']).replaceAll(' ', '').toLowerCase()),
        }
      })

      if (this.tacticFieldsOfSelectedType) {
        returnArray = returnArray.concat(
          this.tacticFieldsOfSelectedType
            .filter((field) => field.type == 'string')
            .map((field) => {
              return {
                label: field.name,
                value: field.id.intID.toString(),
                disabled: Object.keys(this.localMappings)
                  .map((key) => this.localMappings[key])
                  .includes(field.id.intID.toString()),
              }
            })
        )
      }

      return returnArray
    },
    importedTacticRows: {
      get(): object[] {
        return this.$store.getters.currentImportedTacticRows
      },
      set(newValue: object[]) {
        this.$store.commit('updateCurrentImportedTacticRows', newValue)
      },
    },
  },
  mounted: function () {
    if (this.$route.params.importId && !this.tacticMapping.id) {
      //Load existing import mapping
      this.mapFields()
    }
  },
  methods: {
    showCancelConfirmation(event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: 'Are you sure you want to cancel? Your changes will be lost.',
        accept: () => {
          this.$router.back()
        },
        reject: () => {
          // Cancel rejected
        },
      })
    },
    uploadTacticFile(fileData) {
      const file = new FormData()
      file.append('file', fileData.files[0])

      this.$store.getters.services.tactics
        .importTacticsFile(this.selectedType.id.intID, file)
        .then((responseMapping) => {
          this.tacticMapping = responseMapping
          this.$router.replace({
            path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.currentPlan.id.intID}/import/${this.tacticMapping.id}/map`
          })
        })
    },
    reuploadFile() {
      this.$router.replace({path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.currentPlan.id.intID}/import/`})
    },
    continueWithFieldMappings(event) {
      // If any dropdowns in .tactic-type-column do not have values > show a warning that data from the import file will be lost
      if (
        Object.keys(this.localMappings).length ===
        this.tacticMapping.inputFileColumns.length
      ) {
        this.mapFields()
      } else {
        this.$confirm.require({
          target: event.target,
          acceptLabel: 'YES',
          rejectLabel: 'NO',
          message:
            'Are you sure you want to continue? Unmapped columns data could be lost.',
          accept: () => {
            //Apply selected local field mappings to central tacticMapping object
            Object.keys(this.localMappings).forEach((key) => {
              const thisInputFileColumnName = key.substr(key.indexOf('-') + 1)
              const thisMappingValue = this.localMappings[key]
              const thisField = this.tacticMapping.tacticTypeFields.find(
                (field) => field['id'] == thisMappingValue
              )

              if (thisField) {
                //Map to TacticField
                this.tacticMapping.addTacticFieldMapping(
                  thisInputFileColumnName,
                  thisField['name'],
                  Number(thisMappingValue)
                )
              } else if (
                this.tacticMapping.tacticTypeProperties.find(
                  (property) => property['name'] == thisMappingValue
                ) ||
                // TODO: below is a temporary fix until estimatedCost and actualCost are added to neededColumns proerty in response to /tactics/import/{id}
                thisMappingValue == 'estimatedCost' ||
                thisMappingValue == 'actualCost'
              ) {
                //Map to TacticType property
                this.tacticMapping.addTacticPropertyMapping(
                  thisMappingValue,
                  thisInputFileColumnName,
                  'Default Value'
                )
              } else if (thisMappingValue == 'new') {
                //Map to new TacticField
                this.tacticMapping.addTacticFieldMapping(
                  thisInputFileColumnName,
                  thisInputFileColumnName
                )
              }
            })

            //Make mappings API call
            this.mapFields()
          },
          reject: () => {
            // Stay on the same page
          },
        })
      }
    },
    mapFields() {
      if (!this.tacticMapping.id || this.tacticMapping.id == '') {
        this.tacticMapping = new TacticsImportMapping(
          this.$route.params.importId
        )
      }

      // Send mappings to API
      this.$store.getters.services.tactics
        .mapTacticsImport(this.tacticMapping)
        .then((response) => {
          this.validImportRows = response['validRows']
          this.invalidImportRows = response['invalidRows']
          this.importErrors = response['errors']

          //Parse returned tactic rows
          let tempRows = this.validImportRows.map((rowObject) => {
            const thisRowIndex = Object.keys(rowObject)[0]
            if (rowObject[thisRowIndex].typeValues) {
              // Add newly created fields to selectedType
              rowObject[thisRowIndex].typeValues.forEach((typeValue) => {
                if (
                  !this.selectedType.tacticFields.find(
                    (field) => field.name === typeValue.tacticField.name
                  )
                ) {
                  this.selectedType.tacticFields.push(
                    typeValue.tacticField as TacticField
                  )
                }
              })
            }
            return {...rowObject[thisRowIndex], rowIndex: thisRowIndex}
          })
          tempRows = tempRows.concat(
            this.invalidImportRows.map((rowObject) => {
              const thisRowIndex = Object.keys(rowObject)[0]
              return {
                ...rowObject[thisRowIndex],
                rowIndex: thisRowIndex,
                isInvalid: true,
              }
            })
          )
          tempRows.sort((a, b) => {
            if (a['rowIndex'] < b['rowIndex']) return -1
            if (a['rowIndex'] > b['rowIndex']) return 1
            return 0
          })
          Object.keys(this.importErrors).forEach((rowKey) => {
            const thisErrantRow = tempRows.find(
              (rowObject) => rowObject.rowIndex == rowKey
            )
            if (thisErrantRow) {
              thisErrantRow['columnErrors'] = ''
              Object.keys(this.importErrors[rowKey]).forEach((fieldKey) => {
                const thieErrorCode = String(
                  this.importErrors[rowKey][fieldKey]
                ).substr(0, 1)
                thisErrantRow[
                  'columnErrors'
                ] += `${this.getDisplayNameForPropertyName(
                  fieldKey
                )}: ${this.getErrorMessageForErrorCode(thieErrorCode)} `
              })
            }
          })
          this.importedTacticRows = tempRows

          //Show warning if no valid rows
          if (this.validImportRows.length == 0) {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.warn,
              summary: 'No valid data to import.',
              life: 3000,
            })
          }

          //Update route if not loading import object directly
          const newRoute = `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.currentPlan.id.intID}/import/${this.tacticMapping.id}/confirm`
          if (this.$route.path != newRoute) {
            this.$router.replace({
              path: newRoute,
            })
          }
        })
        .catch((error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error mapping fields.',
            detail: error,
          })
        })
    },
    confirmImport() {
      // Confirm import, go to correct route, display success or error message
      this.$store.getters.services.tactics
        .confirmTacticsImport(
          this.tacticMapping,
          this.currentPlan.id,
          this.checkedRows.map((rowObject) => Number(rowObject['rowIndex']))
        )
        .then((response) => {
          this.$store.dispatch('refreshCurrentPlan').finally(() => {
            this.$router.push({
              path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.currentPlan.id.intID}/table/`,
            })
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: 'Tactics imported successfully.',
              life: 3000,
            })
          })
        })
        .catch((error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error confirming field mapping.',
          })
        })
    },
    cancelImport() {
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.currentPlan.id.intID}/table/`,
      })
    },
    getFieldValueForTactic(fieldName: string, tactic: Tactic): string {
      let returnString = ''
      if (tactic.typeValues.length) {
        const fieldValue = tactic.typeValues.find((value) => {
          if (value['tacticField']) {
            return value['tacticField']['name'] == fieldName
          }
          return false
        })
        if (fieldValue) {
          returnString = fieldValue.value.toString()
        }
      }
      return returnString
    },
    getDisplayNameForDataFormat(format: string): string {
      switch (format) {
        case 'string':
          return 'Text'
        case 'number':
          return 'Number'
        case 'date':
          return 'Date'
        case 'url':
          return 'URL'
        default:
          return ''
      }
    },
    getDisplayNameForPropertyName(propertyName: string): string {
      switch (propertyName) {
        case 'title':
          return 'Topic'
        case 'startDate':
          return 'Start Date'
        case 'endDate':
          return 'End Date'
        case 'estimatedCost':
          return 'Estimated Cost'
        case 'actualCost':
          return 'Actual Cost'
        default:
          return propertyName
      }
    },
    getErrorMessageForErrorCode(errorCode: string): string {
      switch (errorCode) {
        case '1':
          return 'Data should be a number.'
        case '2':
          return 'Data should be a date.'
        case '3':
          return 'Data should be a URL.'
        default:
          return ''
      }
    },
  },
})
</script>

<style lang="scss">
.tactic-import-view {
  .upload-step-container,
  .map-step-container,
  .confirm-step-container {
    width: fit-content;
    margin: 2rem auto 4rem;
  }

  .column-checkbox {
    display: block;
    float: left;
    margin: 0rem 1rem 0rem 1rem;
  }

  .map-table {
    .map-row {
      display: flex;
      padding: 1rem 0;

      & > div {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40%;

        &.arrow-column {
          width: 20%;
        }

        h3 {
          margin-bottom: 0;
        }
      }
      h4 {
        margin-bottom: 0.5rem;
      }
    }
  }

  .input-format {
    display: block;
    font-size: 0.75em;
  }
}
</style>