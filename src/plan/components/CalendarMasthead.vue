<template>
  <div class="masthead-container">
    <Accordion
      :multiple="true"
      :activeIndex="accordionActiveIndicies"
      class="widgets-accordion"
      @tab-open="onAccordionTabOpen"
      @tab-close="onAccordionTabClose"
    >
      <AccordionTab
        header="Calendars of Interest"
        :disabled="!filteredSubscriptionEvents.length"
      >
        <template #default v-if="filteredSubscriptionEvents.length">
          <DataTable :value="filteredSubscriptionEvents" :autoLayout="true">
            <Column
              field="channelName"
              header="Calendar"
              key="channelName"
            ></Column>
            <Column field="title" header="Topic" key="title"></Column>
          </DataTable>
        </template>
      </AccordionTab>
      <AccordionTab
        header="Initiatives"
        :disabled="!filteredInitiatives.length"
      >
        <template #default v-if="filteredInitiatives.length">
          <DataTable :value="filteredInitiatives" :autoLayout="true">
            <Column
              field="tacticTypeName"
              header="Category"
              key="tacticTypeName"
            ></Column>
            <Column field="title" header="Topic" key="title">
              <template #body="slotProps">
                <span
                  :class="{
                    'is-nested': slotProps.data.isNested,
                    'is-lead': slotProps.data.isLead,
                  }"
                >
                  <template v-if="isLeadPlan && slotProps.data.isNested">
                    {{ slotProps.data.abbreviatedPlanName }} > {{ slotProps.data.title }}
                  </template>
                  <template v-else>
                    {{ slotProps.data.title }}
                  </template>
                </span>
              </template>
            </Column>
            <Column field="startDate" header="Start Date" key="startDate">
              <template #body="slotProps">{{
                slotProps.data.startDate.toLocaleDateString()
              }}</template>
            </Column>
            <Column field="endDate" header="End Date" key="endDate">
              <template #body="slotProps">{{
                slotProps.data.endDate.toLocaleDateString()
              }}</template>
            </Column>
          </DataTable>
        </template>
      </AccordionTab>
      <AccordionTab
        header="Monthly Focus"
        :disabled="!monthlyFocusTactics.length"
      >
        <template #default v-if="monthlyFocusTactics.length">
          <DataTable :value="monthlyFocusTactics" :autoLayout="true">
            <Column
              field="channelName"
              header="Channel"
              key="channelName"
            ></Column>
            <Column field="title" header="Topic" key="title">
              <template #body="slotProps">
                <span
                  :class="{
                    'is-nested': slotProps.data.isNested,
                    'is-lead': slotProps.data.isLead,
                  }"
                >
                  <template v-if="isLeadPlan && slotProps.data.isNested">
                    {{ slotProps.data.abbreviatedPlanName }} > {{ slotProps.data.title }}
                  </template>
                  <template v-else>
                    {{ slotProps.data.title }}
                  </template>
                </span>
              </template>
            </Column>
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
        </template>
      </AccordionTab>
      <AccordionTab
        header="In Market Media"
        :disabled="!filteredPaidChannelTactics.length"
      >
        <template #default v-if="filteredPaidChannelTactics.length">
          <DataTable :value="filteredPaidChannelTactics" :autoLayout="true">
            <Column
              field="channelName"
              header="Channel"
              key="channelName"
            ></Column>
            <Column
              field="tacticTypeName"
              header="Type"
              key="tacticTypeName"
            ></Column>
            <Column
              field="tacticPlatform.name"
              header="Platform"
              key="tacticPlatform.name"
            ></Column>
            <Column field="title" header="Topic" key="title">
              <template #body="slotProps">
                <span
                  :class="{
                    'is-nested': slotProps.data.isNested,
                    'is-lead': slotProps.data.isLead,
                  }"
                >
                  <template v-if="isLeadPlan && slotProps.data.isNested">
                    {{ slotProps.data.abbreviatedPlanName }} > {{ slotProps.data.title }}
                  </template>
                  <template v-else>
                    {{ slotProps.data.title }}
                  </template>
                </span>
              </template>
            </Column>
            <Column field="startDate" header="Start Date" key="startDate">
              <template #body="slotProps">{{
                slotProps.data.startDate.toLocaleDateString()
              }}</template>
            </Column>
            <Column field="endDate" header="End Date" key="endDate">
              <template #body="slotProps">{{
                slotProps.data.endDate.toLocaleDateString()
              }}</template>
            </Column>
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
        </template>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Button from 'primevue/button'
import Channel from '@/app-shared/models/Channel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tactic from '@/app-shared/models/Tactic'
import ID from '@/app-shared/models/ID'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Subscription from '@/app-shared/models/Subscription'

Vue.component('Button', Button)
Vue.component('Accordion', Accordion)
Vue.component('AccordionTab', AccordionTab)
Vue.component('DataTable', DataTable)
Vue.component('Column', Column)

export default Vue.extend({
  name: 'CalendarMasthead',
  // data: () => {
  //   return {
  //     isSubscriptionTabActive:
  //       window.localStorage.getItem('mh-subscriptions') == 'false'
  //         ? false
  //         : (true as boolean),
  //     isMonthlyFocusTabActive:
  //       window.localStorage.getItem('mh-monthlyfocus') == 'false'
  //         ? false
  //         : (true as boolean),
  //     isInitiativesTabActive:
  //       window.localStorage.getItem('mh-initiatives') == 'false'
  //         ? false
  //         : (true as boolean),
  //     isInMarketMediaTabActive:
  //       window.localStorage.getItem('mh-inmarketmedia') == 'false'
  //         ? false
  //         : (true as boolean),
  //   }
  // },
  computed: {
    dateRange(): Date[] {
      return this.$store.getters.currentDateRange
    },
    isLeadPlan(): boolean {
      return this.$store.getters.currentPlan.plans.length ? true : false
    },
    monthlyFocusTactics(): Tactic[] {
      const returnArray = [] as Tactic[]
      this.$store.getters.selectedChannels.forEach((channel) => {
        if (channel.useMonthlyFocusType == true) {
          channel.tacticTypes.forEach((type) => {
            if (
              type.name.toLowerCase() ==
              this.$store.getters.monthlyFocusTypeName
            ) {
              type.tactics.forEach((tactic) => {
                if (this.isTacticExactMonth(tactic)) {
                  returnArray.push(tactic)
                }
              })
            }
          })
        }
      })
      return returnArray
    },
    filteredSubscriptionEvents(): Tactic[] {
      const returnArray = [] as Tactic[]
      this.$store.getters.selectedSubscriptions.forEach((subscription) => {
        subscription.events.forEach((tactic) => {
          // TODO: filter events and don't add event if a duplicate exists with this.isEventDuplicate
          if (
            this.isTacticTouchingMonth(tactic) &&
            this.isTacticLongerThanThreshold(tactic, 21) &&
            !this.isEventDuplicate(tactic, subscription)
          ) {
            returnArray.push(tactic)
          }
        })
      })
      return returnArray
    },
    filteredInitiatives(): Tactic[] {
      const returnArray = [] as Tactic[]
      this.$store.getters.selectedInitiatives.forEach((tactic) => {
        if (this.isTacticTouchingMonth(tactic)) {
          returnArray.push(tactic)
        }
      })
      returnArray.sort((a: Tactic, b: Tactic) => {
        if (a.isLead && !b.isLead) {
          return -1
        }
        if (b.isLead && !a.isLead) {
          return 1
        }
        return 0
      })
      return returnArray
    },
    filteredPaidChannelTactics(): Tactic[] {
      const returnArray = [] as Tactic[]
      this.$store.getters.selectedChannels.forEach((channel) => {
        channel.tacticTypes.forEach((type) => {
          type.tactics.forEach((tactic) => {
            if (
              !this.isTacticRelatedToDeselectedTag(tactic) &&
              !this.isTacticRelatedToDeselectedInitiative(tactic) &&
              this.isTacticLongerThanThreshold(tactic, 21) &&
              this.isTacticInPaidChannel(tactic) &&
              this.isTacticTouchingMonth(tactic)
            ) {
              returnArray.push(tactic)
            }
          })
        })
      })
      return returnArray
    },
    accordionActiveIndicies(): number[] {
      const returnArray = [] as number[]
      this.$store.getters.currentDateRange //Hack to force computed property update when date range changes
      if (
        window.localStorage.getItem('mh-subscriptions') != 'false' &&
        this.filteredSubscriptionEvents.length
      ) {
        returnArray.push(0)
      }
      if (
        window.localStorage.getItem('mh-initiatives') != 'false' &&
        this.filteredInitiatives.length
      ) {
        returnArray.push(1)
      }
      if (
        window.localStorage.getItem('mh-monthlyfocus') != 'false' &&
        this.monthlyFocusTactics.length
      ) {
        returnArray.push(2)
      }
      if (
        window.localStorage.getItem('mh-inmarketmedia') != 'false' &&
        this.filteredPaidChannelTactics.length
      ) {
        returnArray.push(3)
      }
      return returnArray
    },
  },
  methods: {
    isTacticTouchingMonth(tactic: Tactic): boolean {
      if (
        tactic.endDate < this.dateRange[0] ||
        tactic.startDate > this.dateRange[1]
      ) {
        return false
      }
      return true
    },
    isTacticMultiMonth(tactic: Tactic): boolean {
      return (
        (this.dateRange[0] > tactic.startDate &&
          this.dateRange[0] < tactic.endDate) ||
        (this.dateRange[1] > tactic.startDate &&
          this.dateRange[1] < tactic.endDate)
      )
    },
    isTacticEntireMonth(tactic: Tactic): boolean {
      return (
        this.dateRange[0] <= tactic.startDate &&
        this.dateRange[1] >= tactic.endDate
      )
    },
    isTacticExactMonth(tactic: Tactic): boolean {
      return (
        this.dateRange[0].getFullYear() == tactic.startDate.getFullYear() &&
        this.dateRange[0].getMonth() == tactic.startDate.getMonth() &&
        this.dateRange[0].getDate() == tactic.startDate.getDate() &&
        this.dateRange[1].getFullYear() == tactic.endDate.getFullYear() &&
        this.dateRange[1].getMonth() == tactic.endDate.getMonth() &&
        this.dateRange[1].getDate() == tactic.endDate.getDate()
      )
    },
    isTacticLongerThanThreshold(
      tactic: Tactic,
      thresholdInDays: number
    ): boolean {
      return (
        Math.floor(
          (Date.UTC(
            tactic.endDate.getFullYear(),
            tactic.endDate.getMonth(),
            tactic.endDate.getDate()
          ) -
            Date.UTC(
              tactic.startDate.getFullYear(),
              tactic.startDate.getMonth(),
              tactic.startDate.getDate()
            )) /
            (1000 * 60 * 60 * 24)
        ) > thresholdInDays
      )
    },
    isTacticInPaidChannel(tactic: Tactic): boolean {
      return (
        this.$store.getters.paidChannelNames.indexOf(
          tactic.channelName.toLowerCase()
        ) > -1
      )
    },
    isTacticRelatedToDeselectedTag(tactic: Tactic): boolean {
      if (this.$store.getters.isTagFilterActive && tactic.tags.length == 0) {
        //Tag filters are selected and tactic has no tags assigned
        return true
      }
      if (
        this.$store.getters.isTagFilterActive &&
        this.$store.getters.selectedTags.length == 1
      ) {
        //Only one tag has been selected, show any tactics that have selected tag
        return tactic.tags.filter(
          (tag) =>
            this.$store.getters.selectedTags.filter(
              (selectedTag) => selectedTag.id.intID == tag.id.intID
            ).length > 0
        ).length
          ? false
          : true
      }
      //Multiple tags are selected, show tactics that have all of the selected tags
      return tactic.tags.filter(
        (tag) =>
          this.$store.getters.deselectedTags.filter(
            (deselectedTag) => deselectedTag.id.intID == tag.id.intID
          ).length > 0
      ).length
        ? true
        : false
    },
    isTacticRelatedToDeselectedInitiative(tactic: Tactic): boolean {
      if (
        this.$store.getters.isInitiativeFilterActive &&
        tactic.campaignId.intID == 0 &&
        tactic.promotionId.intID == 0 &&
        tactic.keyDateId.intID == 0
      ) {
        //Initiative filters are selected and tactic has no initiatives assigned
        return true
      }
      const relatedInitiatives = [
        tactic.campaignId.intID,
        tactic.promotionId.intID,
        tactic.keyDateId.intID,
      ]
      if (
        this.$store.getters.isInitiativeFilterActive &&
        this.$store.getters.selectedInitiatives.length == 1
      ) {
        //Only one initiative has been selected, show any tactics that have selected initiative
        return relatedInitiatives.filter(
          (intID) =>
            this.$store.getters.selectedInitiatives.filter(
              (selectedInitiative) => selectedInitiative.id.intID == intID
            ).length > 0
        ).length
          ? false
          : true
      }
      //Multiple initiatives are selected, show tactics that have all of the selected initiatives
      return relatedInitiatives.filter(
        (intID) =>
          this.$store.getters.deselectedInitiatives.filter(
            (deselectedInitiative) => deselectedInitiative.id.intID == intID
          ).length > 0
      ).length
        ? true
        : false
    },
    isEventDuplicate(event: Tactic, subscription: Subscription): boolean {
      let returnValue = false
      const duplicateMappingsForTactic = subscription.duplicateEventsMap.filter(
        (duplicateMapping) => duplicateMapping.eventId == event.id.intID
      )
      // Only check for duplicates if there is a duplicate for the provided event
      if (duplicateMappingsForTactic.length) {
        duplicateMappingsForTactic.forEach((duplicateMapping) => {
          // Check if subscription with duplicate is visible
          const selectedSubscriptionWithDuplicate =
            this.$store.getters.selectedSubscriptions.find(
              (selectedSubscription) =>
                selectedSubscription.id.intID ==
                duplicateMapping.duplicateSubscriptionId
            )
          if (selectedSubscriptionWithDuplicate) {
            // Check if subscription with duplicate has a lower ID value than the provided subscription - event with lowest subscription ID will be shown
            if (
              duplicateMapping.duplicateSubscriptionId <
              duplicateMapping.subscriptionId
            ) {
              returnValue = true
            }
          }
        })
      }
      return returnValue
    },
    showTacticById(id: ID) {
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$route.params.planId}/tactic/${id.intID}`
      })
    },
    showInitiativeById(id: ID) {
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$route.params.planId}/initiative/${id.intID}`
      })
    },
    getAccordionTabNameForIndex(index: number): string {
      switch (index) {
        case 0:
          return 'subscriptions'
        case 1:
          return 'initiatives'
        case 2:
          return 'monthlyfocus'
        case 3:
          return 'inmarketmedia'
        default:
          return ''
      }
    },
    onAccordionTabOpen(event) {
      window.localStorage.setItem(
        'mh-' + this.getAccordionTabNameForIndex(event.index),
        'true'
      )
    },
    onAccordionTabClose(event) {
      window.localStorage.setItem(
        'mh-' + this.getAccordionTabNameForIndex(event.index),
        'false'
      )
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.masthead-container {
  .p-accordion-header {
    &.p-disabled {
      display: none;
    }
    .p-accordion-header-link {
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      padding: 0.8rem 1.6rem;
      border-color: #f9f9f9 !important;
      background-color: #f9f9f9 !important;
    }
    .p-accordion-header-link,
    .p-accordion-header-text {
      font-size: 1.4rem;
      line-height: 1.75rem;
    }
  }
  .p-accordion-content {
    background-color: #f9f9f9;
    border-color: #f9f9f9;
    padding: 0;
    .p-datatable {
      padding: 1rem;
    }
  }
  .p-accordion-content span.is-lead {
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