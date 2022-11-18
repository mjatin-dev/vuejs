<template>
  <div class="view-wrapper channels-view">
    <ViewHeader :title="this.$store.getters.currentPlan.name" @ChannelChanged="clearTypes">
      <template #actions>
        <Button
          label="Add Tactic"
          icon="pi pi-plus-circle"
          @click="onAddTactic"
          v-if="canUserAddTactics"
        />
      </template>
      <template>
        <div class="p-d-flex p-ai-end">
          <DateRangePicker :isRangeView="true" />
          <div class="p-field p-ml-2">
            <label for="channels">Channel</label>
            <Dropdown
              id="channels"
              v-model="selectedChannel"
              :options="currentChannels"
              optionLabel="name"
              dataKey="key"
              placeholder="Choose Channel"
              class="channel-dropdown p-mr-2"
            />
          </div>
          <div class="type-field-container p-field" v-if="currentTypes.length">
            <label>Type</label>
            <Dropdown
              id="channel-types"
              v-model="selectedType"
              :options="currentTypes"
              optionLabel="name"
              dataKey="key"
              placeholder="Choose Type"
              class="channel-dropdown p-mr-2"
            />
          </div>
          <div
            class="platform-field-container p-field"
            v-if="currentPlatforms.length"
          >
            <label>Platform</label>
            <Dropdown
              id="channel-platforms"
              v-model="selectedPlatform"
              :options="currentPlatforms"
              optionLabel="name"
              dataKey="key"
              placeholder="Choose Platform"
              class="channel-dropdown p-mr-2"
              :show-clear="selectedPlatform && selectedPlatform.id != null"
            />
          </div>
          <div class="p-ml-auto p-mt-3">
            <!-- BEGIN: CSV buttons hidden for beta - JV 04.29.22 -->
            <!-- <Button
              v-if="selectedType.id"
              label="Import Tactics"
              icon="pi pi-upload"
              class="import-export-tactics-button p-mr-3"
              @click="onClickImportTactics()"
            /> -->
            <!-- <Button
              v-if="selectedType.id && canUserExportTactics"
              label="Export Tactics"
              icon="pi pi-download"
              class="import-export-tactics-button"
              @click="onClickExportTactics()"
            /> -->
            <!-- END: CSV buttons hidden for beta - JV 04.29.22 -->
          </div>
        </div>
      </template>
    </ViewHeader>
    <ViewMain>
      <DataTable
        v-if="currentTactics.length"
        v-model="currentTactics"
        :autoLayout="true"
      >
        <Column
          field="title"
          header="Topic"
          headerClass="title-column"
          bodyClass="title-column"
        >
          <template #body="slotProps">
            <span
              :class="{
                'is-nested': slotProps.data.isNested,
                'is-lead': slotProps.data.isLead,
              }"
            >
              {{ getTitleForTactic(slotProps.data) }}
            </span>
          </template>
        </Column>
        <Column field="startDate" header="Start Date">
          <template #body="slotProps">
            {{ slotProps.data.startDate.toLocaleDateString() }}
          </template>
        </Column>
        <Column field="endDate" header="End Date">
          <template #body="slotProps">
            {{ slotProps.data.endDate.toLocaleDateString() }}
          </template>
        </Column>

        <Column header="Objective" v-if="doesPlanHaveObjectives">
          <template #body="slotProps">
            <template v-if="getObjectivesForTactic(slotProps.data).length">
              <template
                v-for="(tag, index) in getObjectivesForTactic(slotProps.data)"
              >
                <span class="tag-title" :key="index">{{ tag.title }}</span>
              </template>
            </template>
            <template v-else>None</template>
          </template>
        </Column>
        <Column header="Target Segment" v-if="doesPlanHaveTargetSegments">
          <template #body="slotProps">
            <template v-if="getTargetSegmentsForTactic(slotProps.data).length">
              <template
                v-for="(tag, index) in getTargetSegmentsForTactic(
                  slotProps.data
                )"
              >
                <span class="tag-title" :key="index">{{ tag.title }}</span>
              </template>
            </template>
            <template v-else>None</template>
          </template>
        </Column>
        <Column header="Journey Phase" v-if="doesPlanHaveJourneyPhases">
          <template #body="slotProps">
            <template v-if="getJourneyPhasesForTactic(slotProps.data).length">
              <template
                v-for="(tag, index) in getJourneyPhasesForTactic(
                  slotProps.data
                )"
              >
                <span class="tag-title" :key="index">{{ tag.title }}</span>
              </template>
            </template>
            <template v-else>None</template>
          </template>
        </Column>

        <Column
          columnKey="campaignId"
          header="Campaign"
          v-if="doesPlanHaveCampaigns"
        >
          <template #body="slotProps">
            <template
              v-if="
                slotProps.data.campaignId &&
                slotProps.data.campaignId.intID !== 0
              "
            >
              {{ getNameForInitiativeID(slotProps.data.campaignId) }}
            </template>
            <template v-else>None</template>
          </template>
        </Column>
        <Column
          columnKey="promotionId"
          header="Promotion"
          v-if="doesPlanHavePromotions"
        >
          <template #body="slotProps">
            <template
              v-if="
                slotProps.data.promotionId &&
                slotProps.data.promotionId.intID !== 0
              "
            >
              {{ getNameForInitiativeID(slotProps.data.promotionId) }}
            </template>
            <template v-else>None</template>
          </template>
        </Column>
        <Column
          columnKey="keyDateId"
          header="Key Date"
          v-if="doesPlanHaveKeyDates"
        >
          <template #body="slotProps">
            <template
              v-if="
                slotProps.data.keyDateId && slotProps.data.keyDateId.intID !== 0
              "
            >
              {{ getNameForInitiativeID(slotProps.data.keyDateId) }}
            </template>
            <template v-else>None</template>
          </template>
        </Column>

        <template v-if="$store.getters.currentPlan.isBudgetEnabled">
          <Column field="estimatedCost" header="Estimated Cost"></Column>
          <Column field="actualCost" header="Actual Cost"></Column>
        </template>

        <!-- Media section hidden for MVP -->
        <!-- <Column field="impressions" header="Impressions"></Column>
        <Column field="ratingPoints" header="Rating Points"></Column> -->

        <template v-for="field in currentTypeFields">
          <Column :key="field.key" :header="field.name">
            <template #body="slotProps">
              <button
                v-if="
                  field.type == 'image' &&
                  getFieldValueForTactic(field.id, slotProps.data)
                "
                class="custom-field-image-budgets-view"
                @click="
                  () => {
                    showCustomFieldImageDialog = true
                    customFieldDialogImage = getCustomImageFieldUrl(
                      slotProps.data.id,
                      field.id
                    )
                  }
                "
              >
                <img
                  :src="getCustomImageFieldUrl(slotProps.data.id, field.id)"
                />
              </button>
              <span v-else-if="field.type === 'url'">
                <a
                  :href="getFieldValueForTactic(field.id, slotProps.data)"
                  target="_blank"
                  >{{ getFieldValueForTactic(field.id, slotProps.data) }}</a
                >
              </span>
              <span v-else>
                {{ getFieldValueForTactic(field.id, slotProps.data) }}
              </span>
            </template>
          </Column>
        </template>

        <Column>
          <template #body="slotProps">
            <div
              class="p-d-flex p-jc-end"
              v-if="
                (isLeadPlan && slotProps.data.isLead) ||
                (!isLeadPlan && !slotProps.data.isLead)
              "
            >
              <Button
                label="Open"
                icon="pi pi-arrow-circle-up"
                class="p-button-text"
                @click="showTacticById(slotProps.data.id)"
              ></Button>
            </div>
          </template>
        </Column>
      </DataTable>
      <template v-if="selectedChannel.id && !currentTactics.length">
        <div class="p-d-flex p-jc-center p-ai-center empty-message">
          <h2>No tactics available for selected type</h2>
        </div>
      </template>
      <template v-if="!selectedChannel.id">
        <div class="p-d-flex p-jc-center p-ai-center empty-message">
          <h2>Please select a channel.</h2>
        </div>
      </template>
      <Dialog
        :dismissableMask="true"
        header=""
        :visible.sync="showCustomFieldImageDialog"
        :modal="true"
        @hide="() => (customFieldDialogImage = '')"
      >
        <div class="custom-image-dialog">
          <Button
            label="Download"
            class="p-button-lg p-button-outlined"
            icon="pi pi-download"
            @click="openInNewWindow(customFieldDialogImage)"
          />
          <img :src="customFieldDialogImage" />
        </div>
      </Dialog>
    </ViewMain>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ViewHeader from '@/app-shared/components/ViewHeader.vue'
import ViewMain from '@/app-shared/components/ViewMain.vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dropdown from 'primevue/dropdown'
import ID from '@/app-shared/models/ID'
import DateRangePicker from '@/plan/components/DateRangePicker.vue'
import Channel from '@/app-shared/models/Channel'
import TacticType from '@/app-shared/models/TacticType'
import TacticPlatform from '@/app-shared/models/TacticPlatform'
import Tactic from '@/app-shared/models/Tactic'
import TacticField from '@/app-shared/models/TacticField'
import TacticFieldValue from '@/app-shared/models/TacticFieldValue'
import Tag from '@/app-shared/models/Tag'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Role from '@/app-shared/models/Role'
import { mapState } from 'vuex';

Vue.component('Button', Button)
Vue.component('Column', Column)
Vue.component('DataTable', DataTable)
Vue.component('Dropdown', Dropdown)

export default Vue.extend({
  name: 'Table',
  
  components: {
    ViewHeader,
    ViewMain,
    DateRangePicker,
  },
  data: () => {
    return {
      showCustomFieldImageDialog: false as boolean,
      customFieldDialogImage: '' as string,
      customImageFieldUrlsMap: [] as {
        tacticId: number | string;
        fieldId: number | string;
        url: string;
      }[],
    }
  },
  beforeDestroy() {
    this.$store.dispatch('removeRecurringTacticClones')
  },

  computed: {
    
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
    currentChannels(): Channel[] {
      const localCurrentChannels = [...this.$store.getters.currentChannels]
      return localCurrentChannels.sort((a,b)=>{
        if(a.isLead && !b.isLead){
          return -1
        }
        if(!a.isLead && b.isLead){
          return 1
        }
        return 0
      })
    },
    currentTypes(): TacticType[] {
      const returnArray = [] as TacticType[];
      let tacticType = this.selectedChannel.tacticTypes;
      if (this.selectedChannel.id) {

          const {currentMonthlyFocus} = this.selectedChannel;
          if(!currentMonthlyFocus){
           tacticType =  this.selectedChannel.tacticTypes.filter(item => item.name !== "Monthly Focus");
          }
        
        tacticType.forEach((type) => {
          // add extra items for recurring events
          this.$store.dispatch('addRecurringTacticClones', type)

          returnArray.push(type)
        })
      }
      return returnArray
    },
    currentPlatforms(): TacticPlatform[] {
      return (
        this.selectedType.tacticPlatforms?.filter(
          (platform) => platform.name !== ''
        ) || []
      )
    },
    currentTactics(): Tactic[] {
      if (this.selectedType.id) {
        return this.selectedType.tactics.filter((tactic) => {
          if (
            tactic.startDate <= this.dateRange[1] &&
            tactic.endDate >= this.dateRange[0] &&
            !this.isTacticInFilteredOutPlan(tactic)
          ) {
            if (
              tactic.tacticPlatforms?.length &&
              this.selectedPlatform?.id &&
              tactic.tacticPlatforms.filter((platformOnTactic)=>platformOnTactic.id.intID === this.selectedPlatform?.id?.intID).length == 0
            ) {
              return false
            } else {
              return true
            }
          } else {
            return false
          }
        })
      }
      return []
    },
    currentTypeFields(): TacticField[] {
      if (this.selectedType.id) {
        return this.selectedType.tacticFields
      }
      return []
    },
    dateRange(): Date[] {
      const adjustedDateRangeStart = new Date(
        this.$store.getters.currentDateRange[0]
      )
      adjustedDateRangeStart.setUTCHours(0, 0, 0, 0)
      const adjustedDateRangeEnd = new Date(
        this.$store.getters.currentDateRange[1]
      )
      adjustedDateRangeEnd.setUTCHours(23, 59, 59, 999)
      return [adjustedDateRangeStart, adjustedDateRangeEnd]
    },
    doesPlanHaveCampaigns(): boolean {
      return this.$store.getters.currentInitiatives.filter(
        (tactic) =>
          tactic.tacticTypeName.toLowerCase() ==
          this.$store.getters.initiativeTypeNamesDict.campaign
      ).length
        ? true
        : false
    },
    doesPlanHavePromotions(): boolean {
      return this.$store.getters.currentInitiatives.filter(
        (tactic) =>
          tactic.tacticTypeName.toLowerCase() ==
          this.$store.getters.initiativeTypeNamesDict.promotion
      ).length
        ? true
        : false
    },
    doesPlanHaveKeyDates(): boolean {
      return this.$store.getters.currentInitiatives.filter(
        (tactic) =>
          tactic.tacticTypeName.toLowerCase() ==
          this.$store.getters.initiativeTypeNamesDict.keyDate
      ).length
        ? true
        : false
    },
    doesPlanHaveObjectives(): boolean {
      return this.$store.getters.currentTags.filter((tag) => tag.isObjective)
        .length
        ? true
        : false
    },
    doesPlanHaveTargetSegments(): boolean {
      return this.$store.getters.currentTags.filter(
        (tag) => tag.isTargetSegment
      ).length
        ? true
        : false
    },
    doesPlanHaveJourneyPhases(): boolean {
      return this.$store.getters.currentTags.filter((tag) => tag.isJourneyPhase)
        .length
        ? true
        : false
    },
    canUserAddTactics(): boolean {
      return (
        this.$store.getters.currentAccountPermissionLevel <=
        Role.LEVEL_CONTRIBUTOR
      )
    },
    canUserExportTactics(): boolean {
      return (
        this.$store.getters.currentAccountPermissionLevel <=
        Role.LEVEL_CONTRIBUTOR
      )
    },
    isLeadPlan(): boolean {
      return this.$store.getters.currentPlan.plans.length ? true : false
    },
    
  },
  watch: {
    selectedChannel() {
      if (this.currentTypes.length) {
        this.selectedType = this.currentTypes[0]
      }
    },
    selectedType() {
      if (!this.currentPlatforms.length) {
        this.selectedPlatform = {} as TacticPlatform
      }
      this.mapImageFieldUrls()
    },
    
  },
  mounted: function () {
    //If selectedChannel is not found in current plan, clear channel and type selections
    if (
      this.selectedChannel.id &&
      this.$store.getters.currentChannels.filter(
        (currentChannel) =>
          currentChannel.id.intID == this.selectedChannel.id.intID
      ).length == 0
    ) {
      this.selectedChannel = {} as Channel
      this.selectedType = {} as TacticType
      this.selectedPlatform = {} as TacticPlatform
    }
    
    // Re-map image field URLs
    this.mapImageFieldUrls()
  },
  methods: {

    clearTypes(){ 
   
      this.selectedChannel = {} as Channel
      this.selectedType = {} as TacticType
      this.selectedPlatform = {} as TacticPlatform
    },

    isTacticInFilteredOutPlan(tactic: Tactic): boolean {
      if(tactic.isLead && !this.$store.getters.isLeadPlanVisible){
        return true
      }
      if(tactic.isNested && !this.$store.getters.visibleNestedPlansIntIds?.find((planIntId)=> planIntId === tactic.planId.intID)){
        return true
      }
      return false
    },
    selectType(type) {
      this.selectedType = type
    },
    onClickImportTactics() {
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/import`
      })
    },
    onClickExportTactics() {
      this.$store.getters.services.channels
        .exportChannel(this.selectedChannel.id, [this.selectedType.id], 'csv')
        .then(
          (response) => {
            const link = document.createElement('a')
            link.download = `AnnumExport-${this.selectedType.name
              .toLowerCase()
              .replaceAll(' ', '-')}.zip`
            link.href = response.url
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error exporting tactics.',
              detail: error,
            })
          }
        )
    },
    openInNewWindow(url) {
      if (url.substr(0, 10).indexOf('://') == -1) {
        url = `http://${url}`
      }
      window.open(url, '_blank')
    },
    getObjectivesForTactic: function (tactic: Tactic): Tag[] {
      return tactic.tags.filter((tag) => tag.isObjective)
    },
    getTargetSegmentsForTactic: function (tactic: Tactic): Tag[] {
      return tactic.tags.filter((tag) => tag.isTargetSegment)
    },
    getJourneyPhasesForTactic: function (tactic: Tactic): Tag[] {
      return tactic.tags.filter((tag) => tag.isJourneyPhase)
    },
    getNameForInitiativeID: function (initiativeID: ID): string {
      let returnString = ''
      this.$store.getters.currentInitiatives.filter((tactic) => {
        if (tactic.id.intID == initiativeID.intID) {
          returnString = tactic.title
        }
      })
      return returnString
    },
    getFieldValueForTactic: function (fieldId: ID, tactic: Tactic): string {
      let returnString = ''
      if (tactic.typeValues.length) {
        const fieldValue = tactic.typeValues.find(
          (value) => value.tacticFieldId.intID == fieldId.intID
        )
        if (fieldValue) {
          returnString = fieldValue.value.toString()
        }
      }
      return returnString
    },
    showTacticById: function (id: ID) {
      this.$router.push({path: 'tactic/' + id.intID})
    },
    onAddTactic: function () {
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/tactic/0`
      })
    },
    mapImageFieldUrls() {
      if (this.selectedType.id) {
        this.currentTactics.forEach((tactic) => {
          tactic.typeValues.forEach((typeValue) => {
            const typeField = this.currentTypeFields.find(
              (typeField) => typeField.id.intID == typeValue.tacticFieldId.intID
            )
            if (typeField?.type == 'image') {
              this.$store.getters.services.tactics
                .getMediaAsset(typeValue.value)
                .then((response) => {
                  this.customImageFieldUrlsMap =
                    this.customImageFieldUrlsMap.concat([
                      {
                        tacticId: tactic.id.intID,
                        fieldId: typeValue.tacticFieldId.intID,
                        url: response.fileLocation,
                      },
                    ])
                })
            }
          })
        })
      }
    },
    getCustomImageFieldUrl(tacticId, fieldId) {
      const val = this.customImageFieldUrlsMap.find((imageField) => {
        if (
          imageField.fieldId == fieldId.intID &&
          imageField.tacticId == tacticId.intID
        ) {
          return true
        }
        return false
      })
      return val ? val.url : ''
    },
    getTitleForTactic(tactic: Tactic) {
      let returnString = tactic.title
      if (this.isLeadPlan && tactic.abbreviatedPlanName !== '') {
        if (returnString.length > 0) {
          returnString = tactic.abbreviatedPlanName + ' > ' + returnString
        } else {
          returnString = tactic.abbreviatedPlanName
        }
      }
      return returnString
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.channels-view {
  .tag-title {
    display: block;
  }
  .empty-message {
    height: 100%;
  }
  .p-datatable-thead > tr > th,
  .p-datatable-tbody > tr > td {
    max-width: 30rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .p-buttonset {
    .p-button {
      border-color: #efefef;
      background-color: #efefef;
      color: #333333;
      white-space: nowrap;

      &:disabled {
        border-color: #000000;
        background-color: #000000;
        color: #ffffff;
        opacity: 1;
      }
    }
  }
  .type-field-container {
    // max-width: calc(100% - 15rem);
  }
  .platform-field-container {
    max-width: calc(100% - 15rem);
  }
  .import-export-tactics-button {
    min-width: 12rem;
  }
  .custom-field-image-budgets-view {
    border: 0;
    padding: 0;
    cursor: pointer;
    img {
      height: 50px;
    }
  }
  .p-datatable-wrapper span.is-lead {
    display: flex;
    column-gap: 1rem;

    &::before {
      content: '\e925'; // pi-home
      display: block;
      font-family: 'primeicons';
      font-size: 1.6rem;
      speak: none;
      font-style: normal;
      font-weight: normal;
      font-variant: normal;
      text-transform: none;
    }
  }
}
</style>
