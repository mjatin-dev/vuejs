<template>
  <div class="view-wrapper budget-view">
    <ViewHeader :title="this.$store.getters.currentPlan.name">
      <template #actions>
        <Button
          label="Add Tactic"
          icon="pi pi-plus-circle"
          class="p-mr-2"
          @click="onAddTactic"
          v-if="canUserAddTactics"
        />
        <Button
          label="Filters"
          icon="pi pi-sliders-h"
          class="p-button-outlined"
          @click="showTacticFiltersView = true"
        />
      </template>
      <template>
        <DateRangePicker class="p-mr-3" :isRangeView="true" />
      </template>
    </ViewHeader>
    <ViewMain>
      <TreeTable
        :value="channelsTreeData"
        :autoLayout="true"
        :expandedKeys.sync="expandedKeys"
        class="budget-treetable"
      >
        <!-- Column: Row Headers -->
        <Column
          :expander="true"
          :key="0"
          bodyClass="name-column"
          headerClass="name-header"
          footerClass="name-footer"
        >
          <template #body="slotProps">
            <div
              :class="{
                'channel-row': slotProps.node.leaf == false,
                'type-row': slotProps.node.leaf == true,
                'name-container': true,
              }"
              :title="slotProps.node.data.name + (slotProps.node.leaf == true &&
                  slotProps.node.platform ? ' • ' + slotProps.node.platform : '')"
            >
              {{ slotProps.node.data.name
              }}<template
                v-if="
                  slotProps.node.leaf == true &&
                  slotProps.node.platform
                "
              >
                &nbsp;&bull;&nbsp;{{ slotProps.node.platform }}</template
              >
            </div>
          </template>
          <template #footer>
            <div>
              <h4>Monthly Totals</h4>
              <div class="sub-column-headings">
                <div>
                  <h5>Estimate</h5>
                </div>
                <div>
                  <h5>Actual</h5>
                </div>
                <div>
                  <h5>Variant</h5>
                </div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Column(s): Monthly Expenses -->
        <Column
          v-for="month in expenseMonthColumns"
          :key="month.index"
          headerClass="month-header"
          bodyClass="month-body"
          footerClass="month-footer"
        >
          <template #header>
            <!-- Referencing getExpenseMonthColumnForIndex() because properties of month object do not update with reactivity -->
            <h4>{{ getExpenseMonthColumnForIndex(month.index).header }}</h4>
            <div class="sub-column-headings">
              <div>
                <h5>Est</h5>
              </div>
              <div>
                <h5>Act</h5>
              </div>
              <div>
                <h5>Var</h5>
              </div>
            </div>
          </template>
          <template #body="slotProps">
            <template v-if="slotProps.node.data.tactics">
              <template
                v-for="expenses in getMonthlyExpensesForType(
                  slotProps.node.data,
                  month.startDate,
                  month.index
                )"
              >
                <div
                  class="sub-column-values"
                  :key="'type-expenses-' + expenses.index"
                >
                  <div
                    :style="{
                      'min-width': getMinWidthForSubColumn(
                        monthlyEstimatesHighestWidths[month.index]
                      ),
                    }"
                  >
                    {{ expenses.estimate | currency }}
                  </div>
                  <div
                    :style="{
                      'min-width': getMinWidthForSubColumn(
                        monthlyActualsHighestWidths[month.index]
                      ),
                    }"
                  >
                    {{ expenses.actual | currency }}
                  </div>
                  <div
                    :style="{
                      'min-width': getMinWidthForSubColumn(
                        monthlyVariantsHighestWidths[month.index]
                      ),
                    }"
                  >
                    {{ expenses.variant | currency }}
                  </div>
                </div>
              </template>
            </template>
            <template v-else>
              <div class="channel-row"></div>
            </template>
          </template>
          <template #footer>
            <h4>
              <span class="invisible-text">Totals</span>
            </h4>
            <!-- Referencing getExpenseMonthColumnForIndex() because properties of month object do not update with reactivity -->
            <div class="sub-column-headings">
              <div>
                <div class="monthly-total">
                  {{
                    getExpenseMonthColumnForIndex(month.index).totalExpense
                      .estimate | currency
                  }}
                </div>
              </div>
              <div>
                <div class="monthly-total">
                  {{
                    getExpenseMonthColumnForIndex(month.index).totalExpense
                      .actual | currency
                  }}
                </div>
              </div>
              <div>
                <div class="monthly-total">
                  {{
                    getExpenseMonthColumnForIndex(month.index).totalExpense
                      .variant | currency
                  }}
                </div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Column: Totals -->
        <Column
          :key="expenseMonthColumns + 1"
          bodyClass="total-column"
          headerClass="total-header"
          footerClass="total-footer"
        >
          <template #header>
            <h4>Total Expenses</h4>
            <div class="sub-column-headings">
              <div>
                <h5>Est</h5>
              </div>
              <div>
                <h5>Act</h5>
              </div>
              <div>
                <h5>Var</h5>
              </div>
            </div>
          </template>
          <template #body="slotProps">
            <template v-if="slotProps.node.data.tactics">
              <template
                v-for="expenses in getTotalExpensesForType(slotProps.node.data)"
              >
                <div
                  class="sub-column-values"
                  :key="'total-expenses-type-' + expenses.index"
                >
                  <div>{{ expenses.estimate | currency }}</div>
                  <div>{{ expenses.actual | currency }}</div>
                  <div>{{ expenses.variant | currency }}</div>
                </div>
              </template>
            </template>
          </template>
          <template #footer>
            <template v-for="expenses in getTotalExpensesForPlan()">
              <h4 :key="'total-expenses-plan-heading-' + expenses.index">
                Monthly Totals
              </h4>
              <div
                class="sub-column-headings"
                :key="'total-expenses-plan-body-' + expenses.index"
              >
                <div>
                  <h5>Total Estimate</h5>
                  <div class="monthly-total">
                    {{ expenses.estimate | currency }}
                  </div>
                </div>
                <div>
                  <h5>Total Actual</h5>
                  <div class="monthly-total">
                    {{ expenses.actual | currency }}
                  </div>
                </div>
                <div>
                  <h5>Total Variant</h5>
                  <div class="monthly-total">
                    {{ expenses.variant | currency }}
                  </div>
                </div>
              </div>
            </template>
            <div v-if="shouldShowBudgetVsActual">
              <h4>Budget vs Actual</h4>
              <div class="sub-column-headings">
                <div>
                  <h5>Total Budget</h5>
                  <div class="monthly-total">
                    {{ $store.getters.currentPlan.totalBudget | currency }}
                  </div>
                </div>
                <!-- Estimated totals hidden for MVP -->
                <!-- <div>
                  <h5>Total Estimated:</h5>
                  <div class="monthly-total">{{ totalBudgetEstimated | currency }}</div>
                </div> -->
                <div>
                  <h5>Total Actual</h5>
                  <div class="monthly-total">
                    {{ totalBudgetActuals | currency }}
                  </div>
                </div>
                <div>
                  <h5>Total Remaining</h5>
                  <div class="monthly-total">
                    {{ totalBudgetRemaining | currency }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Column: Budgets - Hidden for MVP -->
        <!-- <Column
          v-if="shouldShowBudgetVsActual"
          bodyClass="budget-column"
          headerClass="budget-header"
          footerClass="budget-footer"
        >
          <template #header>
            <h3>Budget</h3>
          </template>
          <template #body="slotProps">
            <template v-if="slotProps.node.data.budgets">
              <div
                class="budget-total-container"
                :ref="'budget_total_container_' + slotProps.node.data.id.intID"
                :data-rowspan="slotProps.node.data.tacticCategories.length + 1"
              >
                <h5>{{ slotProps.node.data.name }} Budget</h5>
                Comment: For alpha there will only be one budget in this loop, refactor for monthly budgets in the future
                <template v-for="budget in slotProps.node.data.budgets">
                  <div :key="budget.id.intID">
                    <h6>
                      <label
                        class="p-sr-only"
                        :for="
                          slotProps.node.data.id.intID.toString() +
                          '_channel_budget'
                        "
                        >{{ slotProps.node.data.name }} Channel Budget</label
                      >
                      <InputNumber
                        :id="
                          slotProps.node.data.id.intID.toString() +
                          '_channel_budget'
                        "
                        v-model="budget.value"
                        mode="currency"
                        currency="USD"
                        locale="en-US"
                        autocomplete="off"
                      />
                    </h6>
                    <h6>
                      Portion of Plan Budget:
                      {{
                        getPortionOfPlanBudgetForChannelBudget(budget.value)
                      }}%
                    </h6>
                    <h6>
                      Actual:
                      {{
                        getActualsTotalForChannel(slotProps.node.data)
                          | currency
                      }}
                    </h6>
                    <h6>
                      Remaining:
                      {{
                        (budget.value -
                          getActualsTotalForChannel(slotProps.node.data))
                          | currency
                      }}
                    </h6>
                  </div>
                </template>
              </div>
            </template>
            <template v-else>
              <div
                :ref="'budget_empty_cell_' + slotProps.node.data.id.intID"
              ></div>
            </template>
          </template>
          <template #footer>
            <h6>
              <label
                :for="
                  $store.getters.currentPlan.id.intID.toString() +
                  '_plan_budget'
                "
                >Plan Budget</label
              >
              <InputNumber
                :id="
                  $store.getters.currentPlan.id.intID.toString() +
                  '_plan_budget'
                "
                v-model="$store.getters.currentPlan.totalBudget"
                mode="currency"
                currency="USD"
                locale="en-US"
                autocomplete="off"
              />
            </h6>
            <h6>
              Estimated: {{ totalBudgetEstimated | currency }} ({{
                totalBudgetAssigned
              }}% assigned)
            </h6>
            <h6>Actual: {{ totalBudgetActuals | currency }}</h6>
            <h6>Remaining: {{ totalBudgetRemaining | currency }}</h6>
          </template>
        </Column> -->
      </TreeTable>

      <TacticFilters
        :showHide="showTacticFiltersView"
        @shouldHide="showTacticFiltersView = false"
      />
    </ViewMain>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ViewHeader from '@/app-shared/components/ViewHeader.vue'
import ViewMain from '@/app-shared/components/ViewMain.vue'
import {UserMostRecentView} from '@/app-shared/models/User'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import TacticFilters from '@/plan/components/TacticFilters.vue'
import DateRangePicker from '@/plan/components/DateRangePicker.vue'
import TotalExpense from '@/app-shared/models/TotalExpense'
import BudgetDisplayMonth from '@/app-shared/models/BudgetDisplayMonth'
import Channel from '@/app-shared/models/Channel'
import InputNumber from 'primevue/inputnumber'
import Plan from '@/app-shared/models/Plan'
import TacticType from '@/app-shared/models/TacticType'
import Tactic from '@/app-shared/models/Tactic'
import Role from '@/app-shared/models/Role'

Vue.component('TreeTable', TreeTable)
Vue.component('Column', Column)
Vue.component('Toolbar', Toolbar)
Vue.component('Button', Button)
Vue.component('Panel', Panel)
Vue.component('InputNumber', InputNumber)

export default Vue.extend({
  name: 'Budget',
  components: {
    ViewHeader,
    ViewMain,
    DateRangePicker,
    TacticFilters,
  },
  data: () => {
    return {
      showTacticFiltersView: false,
      expandedKeys: {},
      monthlyEstimatesHighestWidths: {},
      monthlyActualsHighestWidths: {},
      monthlyVariantsHighestWidths: {},
    }
  },
  computed: {
    dateRange(): Date[] {
      return this.$store.getters.currentDateRange
    },
    currentPlan(): Plan {
      return this.$store.getters.currentPlan
    },
    isLeadPlan(): boolean {
      return this.currentPlan.plans.length ? true : false
    },
    channelsTreeData(): Channel[] {
      const returnChannels = [] as any[]
      this.$store.getters.selectedChannels.filter((channel) => {
        let channelHasTactics = false
        const returnTypes = [] as any[]
        channel.tacticTypes.filter((type) => {
          if (
            type.name.toLowerCase() == this.$store.getters.monthlyFocusTypeName
          ) {
            return false
          }

          let typeHasTactics = false
          type.tactics.filter((tactic) => {
            if (
              tactic.endDate >= this.dateRange[0] &&
              tactic.startDate <= this.dateRange[1] &&
              !this.isTacticRelatedToDeselectedTag(tactic) &&
              !this.isTacticRelatedToDeselectedInitiative(tactic) &&
              ((this.isLeadPlan && tactic.isLead) ||
              (!this.isLeadPlan && !tactic.isLead))
            ) {
              channelHasTactics = true
              typeHasTactics = true
            }
          })

          if (typeHasTactics) {
            if (type.tacticPlatforms.length) {
              // Create a "type" for tactics without a platform
              const noPlatformType = {
                key: type.id.intID,
                data: {...type},
                leaf: true,
                platform: 'No Platform',
              }
              noPlatformType.data.tactics = type.tactics.filter((tactic) => {
                return tactic.tacticPlatforms.length == 0
              })
              returnTypes.push(noPlatformType)

              // Create new "types" for each platform that has tactics within a type
              type.tacticPlatforms.forEach((platform) => {
                const thisPlatformType = {
                  key: `${type.id.intID}-${platform.name}`,
                  data: {...type},
                  leaf: true,
                  platform: platform.name,
                }
                thisPlatformType.data.tactics = type.tactics.filter(
                  (tactic) => {
                    return tactic.tacticPlatforms.find((platformOnTactic)=>platform.id.intID === platformOnTactic.id.intID)
                  }
                )
                returnTypes.push(thisPlatformType)
              })
            } else {
              returnTypes.push({
                key: type.id.intID,
                data: type,
                leaf: true,
              })
            }
          }
        })
        if (channelHasTactics) {
          returnChannels.push({
            key: channel.id.intID,
            data: channel,
            children: returnTypes,
            leaf: false,
          })
        }
      })
      return returnChannels
    },
    shouldShowBudgetVsActual(): boolean {
      return (
        this.dateRange[0] <= this.$store.getters.currentPlan.startDate &&
        this.dateRange[1] >= this.$store.getters.currentPlan.endDate
      )
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
        if((this.isLeadPlan && channel.isLead) || (!this.isLeadPlan && !channel.isLead)){
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

    expenseMonthColumns(): BudgetDisplayMonth[] {
      const returnArray = [] as BudgetDisplayMonth[]
      if (!this.dateRange[0] || !this.dateRange[1]) return returnArray

      const tempDate = new Date(this.dateRange[0].toString())
      tempDate.setDate(1)
      let tempHeader = ''
      let numMonths =
        (this.dateRange[1].getFullYear() - this.dateRange[0].getFullYear()) * 12
      numMonths -= this.dateRange[0].getMonth()
      numMonths += this.dateRange[1].getMonth()

      for (let i = 0; i <= numMonths; i += 1) {
        if (i > 0) {
          tempDate.setMonth(tempDate.getMonth() + 1)
          tempHeader = tempDate.toLocaleString('default', {
            month: 'short',
          })
          if (tempDate.getMonth() == 0) {
            tempHeader = tempDate.toLocaleString('default', {
              month: 'short',
              year: 'numeric',
            })
          }
        } else {
          tempHeader = tempDate.toLocaleString('default', {
            month: 'short',
            year: 'numeric',
          })
        }

        // Calculate total expenses for month
        let returnEstimate = 0
        let returnActual = 0
        this.$store.getters.currentChannels.forEach((channel) => {
          channel.tacticTypes.forEach((type) => {
            type.tactics.forEach((tactic) => {
              if (
                  tactic.endDate.getMonth() == tempDate.getMonth() && 
                  ((this.isLeadPlan && tactic.isLead) ||
                  (!this.isLeadPlan && !tactic.isLead))
                ) {
                returnEstimate += tactic.estimatedCost
                returnActual += tactic.actualCost
              }
            })
          })
        })

        returnArray.push(
          new BudgetDisplayMonth(
            i + 1,
            tempHeader,
            new Date(tempDate.toUTCString()),
            new TotalExpense(0, returnEstimate, returnActual)
          )
        )
      }

      return returnArray
    },
    canUserAddTactics(): boolean {
      return (
        this.$store.getters.currentAccountPermissionLevel <=
        Role.LEVEL_CONTRIBUTOR
      )
    },
  },
  watch: {
    channelsTreeData() {
      this.expandAllTreeTableNodes()
    },
  },
  mounted: function () {
    this.$store.dispatch('updateMostRecentCoreView', UserMostRecentView.budget)

    //Start with all tree table nodes expanded
    this.expandAllTreeTableNodes()
  },
  methods: {
    getMinWidthForSubColumn(highestValue: number): string {
      if (String(highestValue).length * 1.05 > 4) {
        return String(highestValue).length * 1.05 + 'rem'
      }
      return '4rem'
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
    expandAllTreeTableNodes: function () {
      for (const node of this.channelsTreeData) {
        this.expandTreeTableNode(node)
      }
      this.expandedKeys = {...this.expandedKeys}
    },
    expandTreeTableNode: function (node) {
      if (node.children && node.children.length) {
        this.expandedKeys[node.key] = true

        for (const child of node.children) {
          this.expandTreeTableNode(child)
        }
      }
    },
    getExpenseMonthColumnForIndex: function (
      index: number
    ): BudgetDisplayMonth {
      return (
        this.expenseMonthColumns.find(
          (budgetDisplayMonth) => budgetDisplayMonth.index == index
        ) || new BudgetDisplayMonth()
      )
    },
    getMonthlyExpensesForType: function (
      type: TacticType,
      startDate: Date,
      monthIndex: number
    ): TotalExpense[] {
      let returnEstimate = 0
      let returnActual = 0
      type.tactics.forEach((tactic) => {
        if (
          tactic.endDate.getMonth() == startDate.getMonth() &&
          ((this.isLeadPlan && tactic.isLead) || (!this.isLeadPlan && !tactic.isLead))
          ) {
          returnEstimate += tactic.estimatedCost
          returnActual += tactic.actualCost
        }
      })
      const returnTotalExpense = new TotalExpense(
        0,
        returnEstimate,
        returnActual
      )
      if (
        !this.monthlyEstimatesHighestWidths[monthIndex] ||
        returnEstimate > this.monthlyEstimatesHighestWidths[monthIndex]
      ) {
        this.monthlyEstimatesHighestWidths[monthIndex] = returnEstimate
      }
      if (
        !this.monthlyActualsHighestWidths[monthIndex] ||
        returnActual > this.monthlyActualsHighestWidths[monthIndex]
      ) {
        this.monthlyActualsHighestWidths[monthIndex] = returnActual
      }
      if (
        !this.monthlyVariantsHighestWidths[monthIndex] ||
        returnTotalExpense.variant >
          this.monthlyVariantsHighestWidths[monthIndex]
      ) {
        this.monthlyVariantsHighestWidths[monthIndex] =
          returnTotalExpense.variant
      }
      return [returnTotalExpense]
    },
    getTotalExpensesForPlan: function () {
      if (!this.dateRange[0] || !this.dateRange[1]) return

      let returnEstimate = 0
      let returnActual = 0
      this.$store.getters.currentChannels.forEach((channel) => {
        channel.tacticTypes.forEach((type) => {
          type.tactics.forEach((tactic) => {
            if (
              tactic.endDate.getMonth() >= this.dateRange[0].getMonth() &&
              tactic.endDate.getMonth() <= this.dateRange[1].getMonth() &&
              ((this.isLeadPlan && tactic.isLead) || (!this.isLeadPlan && !tactic.isLead))
            ) {
              returnEstimate += tactic.estimatedCost
              returnActual += tactic.actualCost
            }
          })
        })
      })
      return [new TotalExpense(0, returnEstimate, returnActual)]
    },
    getTotalExpensesForType: function (type: TacticType) {
      let returnEstimate = 0
      let returnActual = 0
      type.tactics.forEach((tactic) => {
        if (
          tactic.endDate.getMonth() >= this.dateRange[0].getMonth() &&
          tactic.endDate.getMonth() <= this.dateRange[1].getMonth() &&
          ((this.isLeadPlan && tactic.isLead) || (!this.isLeadPlan && !tactic.isLead))
        ) {
          returnEstimate += tactic.estimatedCost
          returnActual += tactic.actualCost
        }
      })
      return [new TotalExpense(0, returnEstimate, returnActual)]
    },
    // getPortionOfPlanBudgetForChannelBudget(channelTotal: number) {
    //   if (this.$store.getters.currentPlan.totalBudget == 0 || channelTotal == 0)
    //     return 0
    //   return Math.round(
    //     (channelTotal / this.$store.getters.currentPlan.totalBudget) * 100
    //   )
    // },
    getActualsTotalForChannel(channel: Channel) {
      let returnActual = 0
      channel.tacticTypes.forEach((type) => {
        type.tactics.forEach((tactic) => {
          if (
            tactic.endDate.getMonth() >= this.dateRange[0].getMonth() &&
            tactic.endDate.getMonth() <= this.dateRange[1].getMonth() &&
            ((this.isLeadPlan && tactic.isLead) || (!this.isLeadPlan && !tactic.isLead))
          ) {
            returnActual += tactic.actualCost
          }
        })
      })
      return returnActual
    },
    // updateBudgetColumnRowspans: function () {
    //   Object.keys(this.$refs).forEach((key) => {
    //     if (this.$refs[key]) {
    //       this.$refs[key]['parentNode'].classList.remove('budget-empty-cell')

    //       if (this.expandedKeys[key.replace('budget_total_container_', '')]) {
    //         this.$refs[key]['parentNode'].rowSpan = this.$refs[key]['dataset'][
    //           'rowspan'
    //         ]
    //       } else {
    //         this.$refs[key]['parentNode'].rowSpan = 1
    //         if (key.indexOf('budget_empty_cell_') > -1) {
    //           this.$refs[key]['parentNode'].classList.add('budget-empty-cell')
    //         }
    //       }
    //     }
    //   })
    // },
    onAddTactic: function () {
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/tactic/0`
      })
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.global-nav-collapsed {
  .budget-view {
    &:before {
      left: $navCollapseButtonWidth;
    }
  }
}
.budget-view {
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
}

.budget-treetable {
  position: static;
}
.budget-treetable {
  .p-treetable-wrapper {
    overflow-x: initial;

    & > table {
      width: 100%;
    }

    //TODO: Border on name column not respecting sticky positioning
    // .p-treetable-thead > tr > th,
    // .p-treetable-tbody > tr > td,
    // .p-treetable-tfoot > tr > td {
    //   &.name-column {
    //     position: relative;
    //     border-right: 0;

    //     &:after {
    //       content: "";
    //       display: block;
    //       position: absolute;
    //       top: 0;
    //       right: 0;
    //       bottom: 0;
    //       width: 0.1rem;
    //       background-color: #999999;
    //     }
    //   }
    // }
    .p-treetable-thead > tr > th,
    .p-treetable-tfoot > tr > td {
      position: sticky;
      z-index: 1;
      padding: 0.4rem;
    }

    /* 
      Safari only code - sticky doesn't work with the tfoot > tr > td above
      for some reason, and sticky doesn't work with the .p-treetable-tfoot 
      in chrome etc, so only apply to safari
    */
    @media not all and (min-resolution: 0.001dpcm) {
      @supports (-webkit-appearance: none) {
        .p-treetable-tfoot {
          position: sticky;
          z-index: 1;
          bottom: -1.6rem;
          left: 0;
        }
      }
    }

    .p-treetable-thead > tr > th,
    .p-treetable-tbody > tr > td {
      border: 0;
      border-right: 0.1rem solid #999999;

      &:last-child {
        border-right-width: 0;
      }
    }
    .p-treetable-thead > tr > th {
      top: 0;

      &.name-header {
        left: 0;
        z-index: 2;
      }
      // &.total-header {
      //   position: sticky;
      //   right: 0;
      //   z-index: 2;
      // }

      h4,
      h5 {
        margin: 0;
        font-size: 1rem;
        line-height: 1.2rem;
      }
      h4 {
        color: #707070;
        margin-bottom: 0.2rem;
      }
      h5 {
        color: #333333;
      }
    }
    .p-treetable-tbody > tr > td {
      padding: 0;
      background-color: #f6f6f6;

      &.name-column {
        min-width: 21rem;
        position: sticky;
        z-index: 0;
        left: 0;
        background-color: #f6f6f6;

        .p-treetable-toggler {
          position: absolute;
          top: 0.2rem;
          margin-left: 0 !important;
        }
      }
      &.total-column {
        // position: sticky;
        // z-index: 0;
        // right: 0;
        // background-color: #fff;

        .sub-column-values {
          & > div {
            min-width: 8rem;
          }
        }
      }

      .name-container {
        display: inline-block;
        vertical-align: middle;
        max-width: 20rem; //TODO: temp fix for row heading wrapping to second line when expander button is invisible. Max width should be 100% of parent minus width of expander button.
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        padding: 0.4rem 0.4rem 0.4rem 2.5rem;

        &.type-row {
          display: flex;
          align-items: center;
          min-width: 100%;
          height: 3rem;
          background: #ffffff;
        }
      }
      .sub-column-values {
        background-color: #ffffff;

        & > div {
          width: 33%;
          padding: 0.8rem 0.6rem;
          border-right: 0.1rem solid #efefef;

          &:last-child {
            border-right: 0;
          }
        }
      }
    }
    .p-treetable-tfoot > tr > td {
      bottom: -1.6rem;

      &.name-footer {
        left: 0;
        z-index: 2;
      }
      // &.total-footer {
      //   right: 0;
      //   z-index: 2;
      // }
    }

    .sub-column-headings,
    .sub-column-values {
      display: flex;
      justify-content: stretch;

      & > div {
        padding: 0.2rem;
        flex-grow: 1;
      }
    }
    .name-footer,
    .month-footer,
    .total-footer {
      vertical-align: top;

      h4 {
        margin: 0.5rem 0;
      }
      .sub-column-headings {
        flex-direction: column;

        & > div {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          margin: 0;
        }

        h5,
        .monthly-total {
          font-size: 1rem;
          line-height: 1.2rem;
        }
        h5 {
          margin: 0 0.5rem 0 0;
          color: #707070;
        }
      }
    }
    .name-footer,
    .total-footer {
      .sub-column-headings {
        & > div {
          justify-content: space-between;
        }
      }
    }
    .month-footer,
    .total-footer {
      border-left: 0.1rem solid #999999;
    }
    .name-footer {
      & > div {
        padding-left: 2rem;
      }
    }
    .total-column {
      @include font-bold;
    }
  }
}
.budget-totals-accordion.p-accordion {
  position: sticky;
  left: 0;

  .p-accordion-header,
  .p-accordion-header.p-highlight {
    .p-accordion-header-link {
      background-color: #000000 !important;

      .p-accordion-toggle-icon,
      .p-accordion-header-text {
        color: #ffffff;
      }
      .p-accordion-header-text {
        font-size: 1.4rem;
        line-height: 1.6rem;
      }
    }
  }
  .p-accordion-content {
    border: none;

    h6 {
      margin-bottom: 0.5rem;
    }
  }
}
</style>
