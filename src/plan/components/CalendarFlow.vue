<template>
  <div
    class="flow-container"
    :class="{
      'show-budget': shouldShowBudget,
      'is-lead-plan': isLeadPlan,
    }"
  >
    <div class="flow-dates-row p-d-flex" :style="{width: containerWidth + '%'}">
      <div class="title"></div>
      <div
        v-for="(month, index) in currentFlowDisplayMonths"
        :key="month.index"
        class="cell"
        :style="{width: (month.numDays * dayWidth).toString() + '%'}"
      >
        <div class="month-year">
          <span class="month">{{ month.name }}</span>
          <span class="year" v-if="index == 0 || month.month == 0">{{
            month.year
          }}</span>
        </div>
        <div class="dates p-d-flex">
          <div
            v-for="week in month.weeks"
            :key="week.index"
            class="date"
            :class="{'starts-mid-week': week.startsMidWeek}"
            :style="{
              width:
                Number((week.numDays / month.numDays) * 100).toString() + '%',
            }"
          >
            {{ week.firstDay }}
          </div>
        </div>
      </div>
      <div class="channel-meta-header-container">
        <!-- Media section hidden for MVP -->
        <!-- <div class="media-column">
          <h3>Media</h3>
          <div class="media-sub-column">Imp.</div>
          <div class="media-sub-column">
            {{ $store.getters.currentPlan.ratingPointsType }}
          </div>
        </div> -->
        <div class="expenses-column" v-if="shouldShowBudget">
          <h3>Expenses</h3>
          <div class="expenses-sub-column">Est</div>
          <div class="expenses-sub-column">Act</div>
          <div class="expenses-sub-column">Var</div>
        </div>
      </div>
    </div>
    <!-- Separate accordion for subscriptions so it is always above rows with tactic data  -->
    <Accordion
      :multiple="true"
      :activeIndex="subscriptionAccordionActiveIndicies"
      class="flow-accordion"
      :style="{width: containerWidth + '%'}"
      @tab-open="onRowOpen($event, 'subscriptions')"
      @tab-close="onRowClose($event, 'subscriptions')"
    >
      <AccordionTab v-if="selectedSubscriptionsWithEvents.length">
        <template #header>
          <h2>Calendars of Interest</h2>
        </template>
        <template #default>
          <template v-for="subscription in selectedSubscriptionsWithEvents">
            <div class="flow-events-row p-d-flex" :key="subscription.id.intID">
              <div class="title">
                <h3>{{ subscription.name }}</h3>
              </div>
              <div class="events-container">
                <CalendarFlowRow
                  :tactics="getFilteredEventsForSubscription(subscription)"
                  :dayWidth="dayWidth"
                  :millisecondsPerDay="millisecondsPerDay"
                  :dateRange="dateRange"
                  :isSubscription="true"
                  @showTactic="showTactic"
                />
              </div>
            </div>
          </template>
        </template>
      </AccordionTab>
    </Accordion>
    <Accordion
      :multiple="true"
      :activeIndex="activeAccordionIndicies"
      class="flow-accordion"
      :style="{width: containerWidth + '%'}"
      @tab-open="onRowOpen($event, 'channels')"
      @tab-close="onRowClose($event, 'channels')"
    >
      <AccordionTab v-show="$store.getters.selectedInitiatives.length">
        <template #header>
          <h2>Initiatives</h2>
        </template>
        <template #default>
          <div class="flow-events-row p-d-flex" v-if="selectedCampaigns.length">
            <div class="title">
              <h3>Campaigns</h3>
            </div>
            <div class="events-container">
              <CalendarFlowRow
                :tactics="selectedCampaigns"
                :dayWidth="dayWidth"
                :millisecondsPerDay="millisecondsPerDay"
                :dateRange="dateRange"
                @showTactic="showInitiative"
                @showContextMenu="showContextMenu"
              />
            </div>
          </div>
          <div
            class="flow-events-row p-d-flex"
            v-if="selectedPromotions.length"
          >
            <div class="title">
              <h3>Promotions</h3>
            </div>
            <div class="events-container">
              <CalendarFlowRow
                :tactics="selectedPromotions"
                :dayWidth="dayWidth"
                :millisecondsPerDay="millisecondsPerDay"
                :dateRange="dateRange"
                @showTactic="showInitiative"
                @showContextMenu="showContextMenu"
              />
            </div>
          </div>
          <div class="flow-events-row p-d-flex" v-if="selectedKeyDates.length">
            <div class="title">
              <h3>Key Dates</h3>
            </div>
            <div class="events-container">
              <CalendarFlowRow
                :tactics="selectedKeyDates"
                :dayWidth="dayWidth"
                :millisecondsPerDay="millisecondsPerDay"
                :dateRange="dateRange"
                @showTactic="showInitiative"
                @showContextMenu="showContextMenu"
              />
            </div>
          </div>
        </template>
      </AccordionTab>
      <template v-for="channelData in filteredChannels">
        <AccordionTab
          :key="channelData.channel.id.intID"
          :disabled="channelData.tactics.length == 0"
        >
          <template #header>
            <h2 :title="channelData.channel.name">
              <template v-if="isLeadPlan && channelData.channel.isNested">
                <span
                  class="name channel-name"
                  :class="{
                    'is-nested': channelData.channel.isNested,
                    'is-lead': channelData.channel.isLead,
                  }"
                  >{{
                    channelData.channel.abbreviatedPlanName +
                    ' > ' +
                    channelData.channel.name
                  }}</span
                >
              </template>
              <template v-else>
                <span
                  class="name channel-name"
                  :class="{
                    'is-nested': channelData.channel.isNested,
                    'is-lead': channelData.channel.isLead,
                  }"
                  >{{ channelData.channel.name }}</span
                >
              </template>
            </h2>
            <div class="channel-meta-header-container">
              <!-- Media section hidden for MVP -->
              <!-- <div class="media-column"></div> -->
              <div class="expenses-column" v-if="shouldShowBudget"></div>
            </div>
          </template>
          <template #default>
            <div class="type-rows-container">
              <template v-for="type in channelData.types">
                <div class="flow-events-row p-d-flex" :key="type.id.intID">
                  <div class="title" :title="type.name">
                    <h3>
                      {{ type.name }}
                    </h3>
                  </div>
                  <div class="events-container">
                    <CalendarFlowRow
                      :tactics="
                        channelData.tactics.filter(
                          (tactic) => tactic.tacticTypeName == type.name
                        )
                      "
                      :dayWidth="dayWidth"
                      :millisecondsPerDay="millisecondsPerDay"
                      :dateRange="dateRange"
                      :isHiddenFromNestedPlans="
                        type.shouldHideTacticsFromNestedPlans
                      "
                      :tacticBackgroundColor="channelData.channel.uiColor"
                      @showTactic="showTactic"
                      @showContextMenu="showContextMenu"
                    />
                  </div>
                  <div class="type-meta-body-container">
                    <!-- Media section hidden for MVP -->
                    <!-- <div class="media-column">
                    <template v-for="media in getMediaForType(type)">
                      <div
                        :key="media.index + '-estimate'"
                        class="media-sub-column"
                      >
                        {{ media.impressions.toLocaleString() }}
                      </div>
                      <div
                        :key="media.index + '-actual'"
                        class="media-sub-column"
                      >
                        {{ media.ratingPoints.toLocaleString() | currency }}
                      </div>
                    </template>
                  </div> -->
                    <div class="expenses-column" v-if="shouldShowBudget">
                      <template v-for="expense in getExpensesForType(type)">
                        <div
                          :key="expense.index + '-estimate'"
                          class="expenses-sub-column"
                        >
                          {{ expense.estimate | currency }}
                        </div>
                        <div
                          :key="expense.index + '-actual'"
                          class="expenses-sub-column"
                        >
                          {{ expense.actual | currency }}
                        </div>
                        <div
                          :key="expense.index + '-variant'"
                          class="expenses-sub-column"
                        >
                          {{ expense.variant | currency }}
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
              <!-- </template> -->
            </div>
            <div class="channel-meta-body-container">
              <!-- Media section hidden for MVP -->
              <!-- <div class="media-column"></div> -->
              <div class="expenses-column" v-if="shouldShowBudget">
                <!-- Placeholder for type expenses content -->
              </div>
            </div>
          </template>
        </AccordionTab>
      </template>
      <!-- Media section hidden for MVP -->
      <!-- <AccordionTab :active="true" class="media-accordion-tab">
        <template #header>
          <h2>Media</h2>
        </template>
        <div class="flow-events-row p-d-flex">
          <div class="title">
            <h3>Impressions</h3>
          </div>
          <div class="events-container">
            <div
              v-for="month in currentFlowDisplayMonths"
              :key="month.index"
              :style="{width: (month.numDays * dayWidth).toString() + '%'}"
              class="total-row-value"
            >
              <template
                v-for="monthlyMedia in getMonthlyMediaForPlan(month.firstDate)"
              >
                {{ monthlyMedia.impressions.toLocaleString() }}
              </template>
            </div>
          </div>
        </div>
        <div class="flow-events-row p-d-flex">
          <div class="title">
            <h3>{{ $store.getters.currentPlan.ratingPointsType }}</h3>
          </div>
          <div class="events-container">
            <div
              v-for="month in currentFlowDisplayMonths"
              :key="month.index"
              :style="{width: (month.numDays * dayWidth).toString() + '%'}"
              class="total-row-value"
            >
              <template
                v-for="monthlyMedia in getMonthlyMediaForPlan(month.firstDate)"
              >
                {{ monthlyMedia.ratingPoints.toLocaleString() }}
              </template>
            </div>
          </div>
        </div>
      </AccordionTab> -->
    </Accordion>

    <div
      class="expenses-budget-row"
      :style="{width: containerWidth + '%'}"
      v-if="shouldShowBudget"
    >
      <div class="expense-rows-container">
        <div class="flow-events-row p-d-flex">
          <div class="title">
            <h2>Monthly Totals</h2>
          </div>
          <div class="events-container">
            <div
              v-for="month in currentFlowDisplayMonths"
              :key="month.index"
              :style="{width: (month.numDays * dayWidth).toString() + '%'}"
              class="total-row-value"
            ></div>
          </div>
        </div>
        <div class="flow-events-row p-d-flex">
          <div class="title">
            <h3>Estimate</h3>
          </div>
          <div class="events-container">
            <div
              v-for="month in currentFlowDisplayMonths"
              :key="month.index"
              :style="{width: (month.numDays * dayWidth).toString() + '%'}"
              class="total-row-value"
            >
              <template
                v-for="monthlyExpense in getMonthlyExpensesForPlan(
                  month.firstDate
                )"
              >
                {{ monthlyExpense.estimate | currency }}
              </template>
            </div>
          </div>
        </div>
        <div class="flow-events-row p-d-flex">
          <div class="title">
            <h3>Actual</h3>
          </div>
          <div class="events-container">
            <div
              v-for="month in currentFlowDisplayMonths"
              :key="month.index"
              :style="{width: (month.numDays * dayWidth).toString() + '%'}"
              class="total-row-value"
            >
              <template
                v-for="monthlyExpense in getMonthlyExpensesForPlan(
                  month.firstDate
                )"
              >
                {{ monthlyExpense.actual | currency }}
              </template>
            </div>
          </div>
        </div>
        <div class="flow-events-row p-d-flex">
          <div class="title">
            <h3>Variant</h3>
          </div>
          <div class="events-container">
            <div
              v-for="month in currentFlowDisplayMonths"
              :key="month.index"
              :style="{width: (month.numDays * dayWidth).toString() + '%'}"
              class="total-row-value"
            >
              <template
                v-for="monthlyExpense in getMonthlyExpensesForPlan(
                  month.firstDate
                )"
              >
                {{ monthlyExpense.variant | currency }}
              </template>
            </div>
          </div>
        </div>
        <div class="flow-events-row p-d-flex budget-flow-row">
          <div class="title">
            <h2><span class="invisible-text">Budget vs Actual</span></h2>
          </div>
          <div class="events-container">
            <div
              v-for="month in currentFlowDisplayMonths"
              :key="month.index"
              :style="{width: (month.numDays * dayWidth).toString() + '%'}"
              class="total-row-value"
            ></div>
          </div>
        </div>
        <div class="flow-events-row p-d-flex budget-flow-row">
          <div class="title">
            <h3><span class="invisible-text">Budget</span></h3>
          </div>
          <div class="events-container">
            <div
              v-for="month in currentFlowDisplayMonths"
              :key="month.index"
              :style="{width: (month.numDays * dayWidth).toString() + '%'}"
              class="total-row-value"
            ></div>
          </div>
        </div>
        <div class="flow-events-row p-d-flex budget-flow-row">
          <div class="title">
            <h3><span class="invisible-text">Actual</span></h3>
          </div>
          <div class="events-container">
            <div
              v-for="month in currentFlowDisplayMonths"
              :key="month.index"
              :style="{width: (month.numDays * dayWidth).toString() + '%'}"
              class="total-row-value"
            ></div>
          </div>
        </div>
        <div class="flow-events-row p-d-flex budget-flow-row">
          <div class="title">
            <h3><span class="invisible-text">Remaining</span></h3>
          </div>
          <div class="events-container">
            <div
              v-for="month in currentFlowDisplayMonths"
              :key="month.index"
              :style="{width: (month.numDays * dayWidth).toString() + '%'}"
              class="total-row-value"
            ></div>
          </div>
        </div>
      </div>
      <div class="expenses-column" v-if="shouldShowBudget">
        <div class="expenses-section">
          <h2>Total Expenses</h2>
          <template v-for="expenses in getTotalExpensesForPlan()">
            <div :key="expenses.index">
              <h3>
                Total Estimate
                <span>{{ expenses.estimate | currency }}</span>
              </h3>
              <h3>
                Total Actual <span>{{ expenses.actual | currency }}</span>
              </h3>
              <h3>
                Total Variant <span>{{ expenses.variant | currency }}</span>
              </h3>
            </div>
          </template>
        </div>
        <div class="budget-section" v-if="shouldShowBudgetVsActual">
          <h2>Budget vs Actual</h2>
          <div>
            <h3>
              Total Budget
              <span>{{
                $store.getters.currentPlan.totalBudget | currency
              }}</span>
            </h3>
            <!-- Estimated totals hidden for MVP -->
            <!-- <h3>
                  Estimated: <span>{{ totalBudgetEstimated | currency }} ({{
                    totalBudgetAssigned
                  }}% assigned)</span>
                </h3> -->
            <h3>
              Total Actual <span>{{ totalBudgetActuals | currency }}</span>
            </h3>
            <h3>
              Total Remaining
              <span>{{ totalBudgetRemaining | currency }}</span>
            </h3>
          </div>
        </div>
      </div>
    </div>
    <ContextMenu ref="menu" :model="contextMenuItems" appendTo="body" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {UserMostRecentView} from '@/app-shared/models/User'
import Button from 'primevue/button'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Tactic from '@/app-shared/models/Tactic'
import FlowDisplayMonth from '@/app-shared/models/FlowDisplayMonth'
import Channel from '@/app-shared/models/Channel'
import TacticType from '@/app-shared/models/TacticType'
import CalendarFlowRow from '@/plan/components/CalendarFlowRow.vue'
import TotalExpense from '@/app-shared/models/TotalExpense'
import TotalMedia from '@/app-shared/models/TotalMedia'
import Subscription from '@/app-shared/models/Subscription'
import {rrulestr} from 'rrule'
import {
  isSameDay,
  differenceInHours,
  differenceInMinutes,
  addMinutes,
} from 'date-fns'
import ID from '@/app-shared/models/ID'
import ContextMenuItem from '@/app-shared/models/ContextMenuItem'
import ContextMenu from 'primevue/contextmenu'
import {PlanType} from '@/app-shared/models/Plan'

Vue.component('Button', Button)
Vue.component('ContextMenu', ContextMenu)
Vue.component('Button', Button)
Vue.component('Accordion', Accordion)
Vue.component('AccordionTab', AccordionTab)

export default Vue.extend({
  name: 'CalendarFlow',
  components: {
    CalendarFlowRow,
  },
  data: () => {
    return {
      millisecondsPerDay: (1000 * 60 * 60 * 24) as number,
      dayWidthTargetPx: 30 as number, //TODO: express this in rems
      subscriptionsUpdateItterator: 0 as number,
      tacticsUpdateIterator: 0 as number,
      rightClickedTacticId: {} as ID,
    }
  },
  beforeDestroy() {
    this.$store.dispatch('removeRecurringTacticClones')
  },
  computed: {
    isLeadPlan(): boolean {
      return this.$store.getters.currentPlan.plans.length ? true : false
    },
    isNestedPlan(): boolean {
      return this.$store.getters.currentPlan.parentId.intID !== 0 ? true : false
    },
    // dateRange(): Date[] {
    //   return this.$store.getters.currentDateRange
    // },
    dateRange(): Date[] {
      const adjustedDateRangeStart = new Date(
        this.$store.getters.currentDateRange[0]
      )
      adjustedDateRangeStart.setHours(0, 0, 0, 0)
      const adjustedDateRangeEnd = new Date(
        this.$store.getters.currentDateRange[1]
      )
      adjustedDateRangeEnd.setHours(23, 59, 59, 999)
      return [adjustedDateRangeStart, adjustedDateRangeEnd]
    },
    dayWidth(): number {
      if (!this.dateRange[1] || this.dateRange[0] == this.dateRange[1]) {
        return 100
      }
      const utc1 = Date.UTC(
        this.dateRange[0].getFullYear(),
        this.dateRange[0].getMonth(),
        this.dateRange[0].getDate()
      )
      const utc2 = Date.UTC(
        this.dateRange[1].getFullYear(),
        this.dateRange[1].getMonth(),
        this.dateRange[1].getDate()
      )
      return 100 / ((utc2 - utc1) / this.millisecondsPerDay)
    },
    containerWidth(): number {
      const computedContainerWidth =
        (((this.dayWidthTargetPx / this.dayWidth) * 100) / window.innerWidth) *
        100
      return Math.max(computedContainerWidth, 100)
    },
    currentFlowDisplayMonths(): FlowDisplayMonth[] {
      const returnArray = [] as FlowDisplayMonth[]
      if (!this.dateRange[0] || !this.dateRange[1]) return returnArray

      const tempDate = new Date(this.dateRange[0].toString())
      let numMonths =
        (this.dateRange[1].getFullYear() - this.dateRange[0].getFullYear()) * 12
      numMonths -= this.dateRange[0].getMonth()
      numMonths += this.dateRange[1].getMonth()

      for (let i = 0; i <= numMonths; i += 1) {
        if (i > 0) {
          tempDate.setMonth(tempDate.getMonth() + 1)
        }
        returnArray.push(
          new FlowDisplayMonth(
            i,
            tempDate.toLocaleString('default', {
              month: 'short',
            }),
            i == 0 ? this.dateRange[0].getDate() : 1,
            i == numMonths
              ? this.dateRange[1].getDate()
              : new Date(
                  tempDate.getFullYear(),
                  tempDate.getMonth() + 1,
                  0
                ).getDate(),
            tempDate.getMonth(),
            tempDate.getFullYear(),
            this.$store.getters.currentPlan.weekStartDay
          )
        )
      }
      return returnArray
    },
    selectedCampaigns(): Tactic[] {
      return this.$store.getters.selectedInitiatives.filter(
        (tactic) =>
          tactic.tacticTypeName.toLowerCase() ==
          this.$store.getters.initiativeTypeNamesDict.campaign
      )
    },
    selectedPromotions(): Tactic[] {
      return this.$store.getters.selectedInitiatives.filter(
        (tactic) =>
          tactic.tacticTypeName.toLowerCase() ==
          this.$store.getters.initiativeTypeNamesDict.promotion
      )
    },
    selectedKeyDates(): Tactic[] {
      return this.$store.getters.selectedInitiatives.filter(
        (tactic) =>
          tactic.tacticTypeName.toLowerCase() ==
          this.$store.getters.initiativeTypeNamesDict.keyDate
      )
    },
    filteredChannels(): any[] {
      const returnChannels = [] as any[]
      this.$store.getters.selectedChannels.forEach((channel) => {
        let channelHasTactics = false
        const returnTypes = [] as TacticType[]
        const returnTactics = [] as Tactic[]
        channel.tacticTypes.forEach((type) => {
          let typeHasTactics = false

          // add extra items for recurring events
          this.$store.dispatch('addRecurringTacticClones', type)

          type.tactics.forEach((tactic) => {
            const tempTactic = tactic

            //Check date and lead/nested plan filters
            if (
              tempTactic.startDate <= this.dateRange[1] &&
              tempTactic.endDate >= this.dateRange[0] &&
              !this.isTacticInFilteredOutPlan(tempTactic)
            ) {
              //Check for Monthly Focus independant of tactic flagging
              if (
                channel.useMonthlyFocusType == true &&
                type.name.toLowerCase() ==
                  this.$store.getters.monthlyFocusTypeName
              ) {
                //Hide Monthly Focus Tactics linked to deselected tags and initiatives
                if (
                  !this.isTacticRelatedToDeselectedInitiative(tempTactic) &&
                  !this.isTacticRelatedToDeselectedTag(tempTactic)
                ) {
                  channelHasTactics = true
                  typeHasTactics = true
                  returnTactics.push(tempTactic)
                }
              } else if (channel.enableTacticFlagging == true) {
                //Check for Tactic flag
                if (tempTactic.isFlagged) {
                  channelHasTactics = true
                  typeHasTactics = true
                  returnTactics.push(tempTactic)
                }
              } else {
                //Hide Tactics linked to deselected tags and initiatives
                if (
                  !this.isTacticRelatedToDeselectedInitiative(tempTactic) &&
                  !this.isTacticRelatedToDeselectedTag(tempTactic)
                ) {
                  channelHasTactics = true
                  typeHasTactics = true
                  returnTactics.push(tempTactic)
                }
              }
            }
          })
          //Only add type if it has valid tactics and a type of the same name (but a different platform) doesn't already exist in returnTypes array
          if (
            typeHasTactics &&
            !returnTypes.find((checkType) => checkType.name == type.name)
          ) {
            returnTypes.push(type)
          }
        })
        if (channelHasTactics) {
          returnChannels.push({
            channel: channel,
            types: returnTypes,
            tactics: returnTactics,
          })
        }
        // else if (
        //   channel.useMonthlyFocusType == true
        // ) {
        //   returnChannels.push({
        //     channel: channel,
        //     types: returnTypes.filter(
        //       (type) =>
        //         type.name.toLowerCase() ==
        //         this.$store.getters.monthlyFocusTypeName
        //     ),
        //     tactics: returnTactics.filter(
        //       (tactic) =>
        //         tactic.tacticTypeName.toLowerCase() ==
        //         this.$store.getters.monthlyFocusTypeName
        //     ),
        //   })
        // }
      })

      this.tacticsUpdateIterator
      return returnChannels
    },
    // totalBudgetEstimated(): number {
    //   let totalEstimated = 0
    //   this.$store.getters.currentChannels.forEach((channel) => {
    //     channel.budgets?.forEach((budget) => {
    //       totalEstimated += budget.value
    //     })
    //   })
    //   return totalEstimated
    // },
    // totalBudgetAssigned(): number {
    //   return Math.round(
    //     (this.totalBudgetEstimated /
    //       this.$store.getters.currentPlan.totalBudget) *
    //       100
    //   )
    // },
    totalBudgetActuals(): number {
      let totalActual = 0
      this.$store.getters.currentChannels.forEach((channel) => {
        if (
          (this.isLeadPlan && channel.isLead) ||
          (!this.isLeadPlan && !channel.isLead)
        ) {
          totalActual += this.getActualsTotalForChannel(channel)
        }
      })
      return totalActual
    },
    totalBudgetRemaining(): number {
      return (
        this.$store.getters.currentPlan.totalBudget - this.totalBudgetActuals
      )
    },
    activeAccordionIndicies(): number[] {
      const inactiveRowsArray = this.getInactiveRowsLocalStorageArray()
      const returnArray = [] as number[]
      //Initiatives row
      if (
        (this.selectedCampaigns.length ||
          this.selectedPromotions.length ||
          this.selectedKeyDates.length) &&
        (!inactiveRowsArray || !inactiveRowsArray?.includes('initiatives'))
      ) {
        returnArray.push(0)
      }
      //Channel rows
      const activeChannelIndicies = [] as number[]
      this.filteredChannels.forEach((channel, index) => {
        if (
          !inactiveRowsArray ||
          !inactiveRowsArray?.includes(channel.channel.id.intID.toString())
        ) {
          activeChannelIndicies.push(index + 1)
        }
      })

      return returnArray.concat(activeChannelIndicies)
    },
    subscriptionAccordionActiveIndicies(): number[] {
      return this.getInactiveRowsLocalStorageArray()?.includes('subscriptions')
        ? []
        : [0]
    },
    selectedSubscriptions(): Subscription[] {
      return this.$store.getters.selectedSubscriptions
    },
    selectedSubscriptionsWithEvents(): Subscription[] {
      this.subscriptionsUpdateItterator
      const subscriptionsReturnArray = [] as Subscription[]
      this.$store.getters.selectedSubscriptions.forEach((subscription) => {
        let eventsReturnArray = [...subscription.events] as Tactic[]

        // add recurring items
        subscription.events.forEach((event) => {
          const thisEvent = {
            ...event,
          }
          if (thisEvent.rrule) {
            if (thisEvent.rrule.indexOf('DTSTART=') < 0) {
              const year = thisEvent.startDate.getFullYear()
              const month =
                thisEvent.startDate.getMonth() > 8
                  ? thisEvent.startDate.getMonth() + 1
                  : '0' + (thisEvent.startDate.getMonth() + 1)
              const date =
                thisEvent.startDate.getDate() > 9
                  ? thisEvent.startDate.getDate()
                  : '0' + thisEvent.startDate.getDate()
              const hours =
                thisEvent.startDate.getHours() > 9
                  ? thisEvent.startDate.getHours()
                  : '0' + thisEvent.startDate.getHours()
              const minutes =
                thisEvent.startDate.getMinutes() > 9
                  ? thisEvent.startDate.getMinutes()
                  : '0' + thisEvent.startDate.getMinutes()
              const seconds =
                thisEvent.startDate.getSeconds() > 9
                  ? thisEvent.startDate.getSeconds()
                  : '0' + thisEvent.startDate.getSeconds()

              thisEvent.rrule = `DTSTART=${year}${month}${date}T${hours}${minutes}${seconds}\n${thisEvent.rrule}`
            }

            const diff = differenceInMinutes(
              thisEvent.startDate,
              thisEvent.endDate
            )
            const rules = rrulestr(thisEvent.rrule)
            const recurrenceDates = rules.between(
              this.$store.getters.currentDateRange[0],
              this.$store.getters.currentDateRange[1]
            )

            // filter out actual event
            // TODO: fix recurrence for dates that exactly match the current date
            const newRecurrenceDates = recurrenceDates.filter(
              (recurrenceDate) => {
                return !isSameDay(recurrenceDate, thisEvent.startDate)
              }
            )

            if (newRecurrenceDates.length) {
              const newRecurrences = newRecurrenceDates.map(
                (recurrenceDate) => {
                  return {
                    ...thisEvent,
                    startDate: recurrenceDate,
                    endDate: addMinutes(recurrenceDate, diff),
                    isClone: true,
                  }
                }
              )

              if (newRecurrences.length) {
                eventsReturnArray = eventsReturnArray.concat(newRecurrences)
              }
            }
          }
        })

        subscriptionsReturnArray.push({
          ...subscription,
          events: eventsReturnArray,
        })
      })

      return subscriptionsReturnArray
    },
    shouldShowBudgetVsActual(): boolean {
      return (
        this.dateRange[0] <= this.$store.getters.currentPlan.startDate &&
        this.dateRange[1] >= this.$store.getters.currentPlan.endDate
      )
    },
    contextMenuItems(): ContextMenuItem[] {
      return [
        {
          label: 'Copy Tactic',
          icon: 'pi pi-fw pi-copy',
          command: this.openTacticDetailWithCopyId,
        },
      ]
    },
    flowInactiveRowsLocalStorageKey(): string {
      return (
        'flow-inactive-rows-' +
        this.$store.getters.currentPlan.id.intID.toString()
      )
    },
    shouldShowBudget(): boolean {
      return (
        this.$store.getters.currentPlan.isBudgetEnabled &&
        ((!this.isLeadPlan && !this.isNestedPlan) ||
          (this.isNestedPlan && !this.$store.getters.isLeadPlanVisible) ||
          (this.isLeadPlan &&
            !this.$store.getters.visibleNestedPlansIntIds?.length))
      )
    },
  },
  mounted: function () {
    this.$store.dispatch(
      'updateMostRecentCoreView',
      UserMostRecentView.calendar
    )
  },
  watch: {
    '$store.getters.selectedSubscriptions': {
      deep: true,
      handler() {
        // Force update of selectedSubscriptionsWithEvents when subscriptions events have loaded
        this.subscriptionsUpdateItterator += 1
        // Trigger date update with exact same date to trigger render in CalendarFlowRows
        setTimeout(() => {
          this.$store.dispatch('updateCurrentDateRange', [
            this.$store.getters.currentDateRange[0],
            this.$store.getters.currentDateRange[1],
          ])
        }, 100)
      },
    },
    '$store.getters.currentDateRange': {
      deep: true,
      handler() {
        // TODO: forces an update so that additional recurring items show up in the newly exapanded flow view
        setTimeout(() => (this.tacticsUpdateIterator += 1), 100)
      },
    },
  },
  methods: {
    isTacticInFilteredOutPlan(tactic: Tactic): boolean {
      if (tactic.isLead && !this.$store.getters.isLeadPlanVisible) {
        return true
      }
      if (
        tactic.isNested &&
        !this.$store.getters.visibleNestedPlansIntIds?.find(
          (planIntId) => planIntId === tactic.planId.intID
        )
      ) {
        return true
      }
      return false
    },
    isTacticMultiMonth(tactic: Tactic): boolean {
      return (
        (this.$store.getters.currentDateRange[0] > tactic.startDate &&
          this.$store.getters.currentDateRange[0] < tactic.endDate) ||
        (this.$store.getters.currentDateRange[1] > tactic.startDate &&
          this.$store.getters.currentDateRange[1] < tactic.endDate)
      )
    },
    isTacticEntireMonth(tactic: Tactic): boolean {
      return (
        this.$store.getters.currentDateRange[0] <= tactic.startDate &&
        this.$store.getters.currentDateRange[1] >= tactic.endDate
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
    getFilteredEventsForSubscription(subscription: Subscription): Tactic[] {
      return subscription.events.filter((event) => {
        return !this.isEventDuplicate(event, subscription)
      })
    },
    showTactic(tactic: Tactic) {
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$route.params.planId}/tactic/${tactic.id.intID}`,
      })
    },
    showInitiative(initiative: Tactic) {
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$route.params.planId}/initiative/${initiative.id.intID}`,
      })
    },
    showContextMenu({e, tactic}) {
      this.rightClickedTacticId = tactic.id
      ;(this.$refs.menu as Vue & {show: (e) => boolean}).show(e)
    },
    getMediaForType(type: TacticType): TotalMedia[] {
      let returnImpressions = 0
      let returnRaitingPoints = 0
      type.tactics.forEach((tactic) => {
        if (
          tactic.endDate >= this.dateRange[0] &&
          tactic.endDate <= this.dateRange[1] &&
          ((this.isLeadPlan && tactic.isLead) ||
            (!this.isLeadPlan && !tactic.isLead))
        ) {
          returnImpressions += tactic.impressions
          returnRaitingPoints += tactic.ratingPoints
        }
      })
      return [new TotalMedia(0, returnImpressions, returnRaitingPoints)]
    },
    getExpensesForType(type: TacticType): TotalExpense[] {
      let returnEstimate = 0
      let returnActual = 0
      type.tactics.forEach((tactic) => {
        if (
          tactic.endDate >= this.dateRange[0] &&
          tactic.endDate <= this.dateRange[1] &&
          ((this.isLeadPlan && tactic.isLead) ||
            (!this.isLeadPlan && !tactic.isLead))
        ) {
          returnEstimate += tactic.estimatedCost
          returnActual += tactic.actualCost
        }
      })
      return [new TotalExpense(0, returnEstimate, returnActual)]
    },
    getPortionOfPlanBudgetForChannelBudget(channelTotal: number) {
      if (this.$store.getters.currentPlan.totalBudget == 0 || channelTotal == 0)
        return 0
      return Math.round(
        (channelTotal / this.$store.getters.currentPlan.totalBudget) * 100
      )
    },
    getActualsTotalForChannel(channel: Channel) {
      let returnActual = 0
      channel.tacticTypes.forEach((type) => {
        type.tactics.forEach((tactic) => {
          if (
            tactic.endDate > this.dateRange[0] &&
            tactic.endDate < this.dateRange[1] &&
            ((this.isLeadPlan && tactic.isLead) ||
              (!this.isLeadPlan && !tactic.isLead))
          ) {
            returnActual += tactic.actualCost
          }
        })
      })
      return returnActual
    },
    getMonthlyMediaForPlan(startDate: Date) {
      let returnImpressions = 0
      let returnRatingPoints = 0
      this.$store.getters.currentChannels.forEach((channel) => {
        channel.tacticTypes.forEach((type) => {
          type.tactics.forEach((tactic) => {
            if (
              tactic.endDate.getMonth() == startDate.getMonth() &&
              ((this.isLeadPlan && tactic.isLead) ||
                (!this.isLeadPlan && !tactic.isLead))
            ) {
              returnImpressions += tactic.impressions
              returnRatingPoints += tactic.ratingPoints
            }
          })
        })
      })
      return [new TotalMedia(0, returnImpressions, returnRatingPoints)]
    },
    getMonthlyExpensesForPlan(startDate: Date) {
      let returnEstimate = 0
      let returnActual = 0
      this.$store.getters.currentChannels.forEach((channel) => {
        channel.tacticTypes.forEach((type) => {
          type.tactics.forEach((tactic) => {
            if (
              tactic.endDate.getMonth() == startDate.getMonth() &&
              ((this.isLeadPlan && tactic.isLead) ||
                (!this.isLeadPlan && !tactic.isLead))
            ) {
              returnEstimate += tactic.estimatedCost
              returnActual += tactic.actualCost
            }
          })
        })
      })
      return [new TotalExpense(0, returnEstimate, returnActual)]
    },
    getTotalMediaForPlan() {
      let returnImpressions = 0
      let returnRatingPoints = 0
      this.$store.getters.currentChannels.forEach((channel) => {
        channel.tacticTypes.forEach((type) => {
          type.tactics.forEach((tactic) => {
            if (
              this.dateRange[0] &&
              this.dateRange[1] &&
              tactic.endDate.getMonth() >= this.dateRange[0].getMonth() &&
              tactic.endDate.getMonth() <= this.dateRange[1].getMonth() &&
              ((this.isLeadPlan && tactic.isLead) ||
                (!this.isLeadPlan && !tactic.isLead))
            ) {
              returnImpressions += tactic.impressions
              returnRatingPoints += tactic.ratingPoints
            }
          })
        })
      })
      return [new TotalMedia(0, returnImpressions, returnRatingPoints)]
    },
    getTotalExpensesForPlan() {
      let returnEstimate = 0
      let returnActual = 0
      this.$store.getters.currentChannels.forEach((channel) => {
        channel.tacticTypes.forEach((type) => {
          type.tactics.forEach((tactic) => {
            if (
              this.dateRange[0] &&
              this.dateRange[1] &&
              tactic.endDate.getMonth() >= this.dateRange[0].getMonth() &&
              tactic.endDate.getMonth() <= this.dateRange[1].getMonth() &&
              ((this.isLeadPlan && tactic.isLead) ||
                (!this.isLeadPlan && !tactic.isLead))
            ) {
              returnEstimate += tactic.estimatedCost
              returnActual += tactic.actualCost
            }
          })
        })
      })
      return [new TotalExpense(0, returnEstimate, returnActual)]
    },
    openTacticDetailWithCopyId() {
      this.$router.push({
        path:
          `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$route.params.planId}/tactic/0?copyof=${this.rightClickedTacticId.intID}`
      })
    },
    onRowOpen(event, accordionName: string) {
      let rowId
      if (accordionName == 'subscriptions') {
        rowId = 'subscriptions'
      } else if (event.index == 0) {
        rowId = 'initiatives'
      } else {
        rowId =
          this.filteredChannels[event.index - 1].channel.id.intID.toString()
      }

      const inactiveRowsArray = this.getInactiveRowsLocalStorageArray()
      if (inactiveRowsArray) {
        const rowIdIndex = inactiveRowsArray.indexOf(rowId)
        if (rowIdIndex > -1) {
          inactiveRowsArray.splice(rowIdIndex, 1)
          window.localStorage.setItem(
            this.flowInactiveRowsLocalStorageKey,
            inactiveRowsArray.toString()
          )
        }
      } else {
        this.createFlowInactiveRowsLocalStorageObject('')
      }
    },
    onRowClose(event, accordionName: string) {
      let rowId
      if (accordionName == 'subscriptions') {
        rowId = 'subscriptions'
      } else if (event.index == 0) {
        rowId = 'initiatives'
      } else {
        rowId =
          this.filteredChannels[event.index - 1].channel.id.intID.toString()
      }

      const inactiveRowsArray = this.getInactiveRowsLocalStorageArray()
      if (inactiveRowsArray) {
        inactiveRowsArray.push(rowId)
        window.localStorage.setItem(
          this.flowInactiveRowsLocalStorageKey,
          inactiveRowsArray.toString()
        )
      } else {
        this.createFlowInactiveRowsLocalStorageObject(rowId)
      }
    },
    createFlowInactiveRowsLocalStorageObject(value: string) {
      window.localStorage.setItem(this.flowInactiveRowsLocalStorageKey, value)
    },
    getInactiveRowsLocalStorageArray(): string[] | null {
      const localStorageObject = window.localStorage.getItem(
        this.flowInactiveRowsLocalStorageKey
      )
      return localStorageObject ? localStorageObject.split(',') : null
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

$media-column-width: 20rem;
$expenses-column-width: 20rem;
// Media section hidden for MVP
// $channel-meta-columns-width: #{$media-column-width + $expenses-column-width};
$channel-meta-columns-width: #{$expenses-column-width};

.global-nav-collapsed {
  .flow-container {
    &:before {
      left: $navCollapseButtonWidth;
    }
  }
}

.flow-container {
  //Cover for padding in ViewMain - allows sticky positioning in Flow view without revealing content while scrolling
  &:before {
    content: '';
    position: fixed;
    display: block;
    top: 0;
    left: $globalNavWidth;
    bottom: 0;
    width: 1.6rem;
    background-color: #fff;
    z-index: 2;
    transition: left 0.3s;
  }

  &.show-budget {
    .flow-accordion {
      .p-accordion-header {
        width: calc(100% + #{$channel-meta-columns-width});
      }
      .p-toggleable-content {
        clip-path: polygon(
          0% 0%,
          calc(100% + #{$channel-meta-columns-width}) 0%,
          calc(100% + #{$channel-meta-columns-width}) 100%,
          0% 100%
        );
      }
    }
  }
}

//Accordion overrides
.flow-accordion {
  position: relative;

  .p-accordion-tab {
    margin-bottom: 0;
  }
  .p-accordion-header {
    width: 100%;

    &.p-disabled {
      opacity: 1;

      .p-accordion-header-link {
        .p-accordion-toggle-icon {
          display: none;
        }
        h2 {
          left: 0.8rem;
        }
      }
    }
    .p-accordion-header-link,
    &:not(.p-highlight):not(.p-disabled):hover .p-accordion-header-link,
    &:not(.p-disabled).p-highlight .p-accordion-header-link {
      background: #f6f6f6;
      border: none;
      color: $black;
      z-index: 2;
      position: static;
      padding: 0 0 0 0.5rem;
      height: 3rem;

      &:hover {
        background: #f6f6f6;
        border: none;
        color: $black;
      }
    }
    h2,
    .p-accordion-header-text,
    .p-accordion-toggle-icon {
      position: sticky;
    }
    h2 {
      margin: 0;
      font-size: 1.1rem;
      color: #333333;
      @include font-normal;

      .name {
        display: inline-block;
        margin-top: 0.8rem;
      }
    }
    .p-accordion-header-text {
      left: 2.5rem;
    }
    .p-accordion-toggle-icon {
      left: 0.8rem;
    }
  }
  .p-accordion-content {
    padding: 0;
    border: none;
  }
  .p-toggleable-content {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
  //AccordionTab no longer supports adding classes after updating to primevue 2.3.0+
  // .channel-accordion-tab {
  //   .monthly-focus {
  //     display: inline-block;
  //     margin-left: 1rem;
  //     font-size: 1rem;
  //   }
  // }
  .type-rows-container {
    border-right: 0.1rem solid #999999;
  }
}

//Flow rows
.flow-dates-row,
.flow-events-row {
  & > .title {
    min-width: 18rem;
    min-height: 2rem;
    margin-right: 1rem;
  }
}
.flow-dates-row {
  position: sticky !important;
  top: 0;
  background-color: #efefef;
  z-index: 1;

  .title {
    // TODO: implement sticky positioning top and left to cover dates row on horizontal scroll
    // position: sticky;
    // left: 0;
    // z-index: 3;
  }
  .cell {
    position: relative;

    .month,
    .year,
    .date {
      font-size: 1rem;
      line-height: 1.2rem;
      color: #707070;
      text-transform: uppercase;
    }
    .month-year {
      position: absolute;
      top: 0.2rem;
      left: 0.4rem;
    }
    .year {
      padding-left: 0.25rem;
    }
    .dates {
      display: block;
    }
    .date {
      padding: 1.6rem 0.4rem 0.4rem;
      border-left: 0.1rem solid #999999;
      color: #333333;

      &.starts-mid-week {
        opacity: 0.5;
        border-left-color: #707070;
        border-left-style: dashed;
      }
    }
  }
}
.flow-events-row {
  min-height: 2.8rem;

  & > .title {
    position: sticky;
    left: 0;
    z-index: 2;

    h2,
    h3 {
      position: absolute;
      height: 100%;
      min-width: inherit;
      max-width: 12rem;
      z-index: 1;
      margin: 0;
      padding: 0.5rem 0 0.5rem 2.5rem;
      border-right: 0.1rem solid #999999;
      background: #fff;
      @include font-normal;
      font-size: 1.1rem;
      color: #333333;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      cursor: default;
      pointer-events: none;
    }
  }
  .events-container {
    position: relative;
    width: 100%;
    overflow: hidden;
  }
}

//Columns for media/expenses
.flow-container {
  .p-accordion-content,
  .flow-events-row,
  .flow-dates-row {
    position: relative;
  }
  .p-accordion-content .channel-meta-body-container,
  .flow-events-row .type-meta-body-container,
  .flow-dates-row .channel-meta-header-container {
    position: absolute;
    top: 0;
    left: 100%;
    display: flex;
  }
  .flow-dates-row .channel-meta-header-container {
    background-color: #efefef;
    color: #707070;

    h3,
    .expenses-sub-column {
      font-size: 1rem;
      line-height: 1.2rem;
    }
    h3 {
      width: 100%;
      margin-bottom: 0;
      color: #707070;
    }
    .expenses-column {
      border-left: 0.1rem solid #999999;
    }
    .expenses-sub-column {
      color: #333333;
    }
  }
  .media-column,
  .expenses-column {
    display: flex;
    flex-wrap: wrap;
  }
  .media-column {
    width: $media-column-width;

    .media-sub-column {
      width: 50%;
    }
  }
  .expenses-column {
    width: $expenses-column-width;
    padding: 0.4rem;

    .expenses-sub-column {
      width: 33%;
    }
  }
}

//Expenses and Budget rows
.expenses-budget-row {
  position: relative;
  background-color: #efefef;

  .expense-rows-container {
    display: block;
  }
  .flow-events-row {
    min-height: auto;

    &:first-child {
      .title {
        h2 {
          padding-top: 0.5rem;
        }
      }
    }
    &:last-child {
      .title h3,
      .total-row-value {
        padding-bottom: 1.6rem;
      }
    }
    &.budget-flow-row {
      // border-right: 0.1rem solid #999999;

      h2,
      h3 {
        // opacity: 0;
      }
    }
    & > .title {
      min-height: auto;

      h2,
      h3 {
        position: relative;
        font-size: 1rem;
        line-height: 2rem;
        background-color: #efefef;
        padding: 0 0.4rem 0 2.5rem;
      }
      h2 {
        @include font-bold;
        font-size: 1.1rem;
        color: #333333;
      }
      h3 {
        color: #707070;
      }
    }

    .events-container {
      display: flex;
    }
    .total-row-value {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
      padding: 0 0.4rem;
      font-size: 1rem;
      line-height: 2rem;
      border-right: 0.1rem solid #999999;
      color: #333333;
    }
  }
  .expenses-column {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 100%;
    width: $expenses-column-width;
    padding: 0;
    background-color: #efefef;

    .expenses-section,
    .budget-section {
      width: 100%;

      & > div {
        width: 100%;
      }
    }
    .expenses-section {
      h2 {
        padding-top: 0.5rem;
      }
    }
    .budget-section {
      padding-bottom: 1.6rem;
    }
    h2,
    h3 {
      padding: 0 0.4rem;
      margin: 0;
      font-size: 1rem;
      line-height: 2rem;
    }
    h2 {
      font-size: 1.1rem;
      @include font-bold;
      color: #333333;
    }
    h3 {
      display: flex;
      justify-content: space-between;
      color: #707070;
    }
  }
}
</style>
