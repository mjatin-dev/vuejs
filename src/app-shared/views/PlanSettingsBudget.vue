<template>
  <div>
    <div class="plan-settings-modal-header">
      <h2 class="p-mr-4">Plan Settings: Budget</h2>
      <div>
        <Button
          v-if="
            canUserEditPlanProperties ||
            canUserManagePlanUsersChannelsSubscriptions
          "
          @click="handleSavePlan"
          label="Save"
        />
        <Button
          @click="$emit('complete')"
          label="Close"
          class="p-button-outlined p-ml-2"
        />
      </div>
    </div>
    <div class="plan-settings-modal-content">
      <div class="p-field">
        <div class="p-d-flex top-items">
          <p class="channel-title">
            Establish budget parameters and track expenses at the Tactic level.
          </p>
        </div>
      </div>

      <div class="setup-checkboxes">
        <p class="checkboxes-text-first">Budget Features:</p>
        <div class="checkbox-container">
          <Checkbox
            :id="`budgetOn`"
            :binary="true"
            v-model="useBudgetsOn"
            class="p-mr-2 checkbox"
            @change="() => handleToggleUseBudgets(true)"
          />
          <label for="budgetOn">On</label>
        </div>
        <div class="checkbox-container">
          <Checkbox
            :id="`budgetOff`"
            :binary="true"
            v-model="useBudgetsOff"
            class="p-mr-2 checkbox"
            @change="() => handleToggleUseBudgets(false)"
          />
          <label for="budgetOff">Off</label>
        </div>
        <p class="checkboxes-text-second">
          Active budgets archived and all budget features hidden
        </p>
      </div>

      <div class="budget-container" v-if="useBudgetsOn">
        <div class="budget-header">
          <div id="id-name"><p>Name</p></div>
          <div id="id-total"><p>Total</p></div>
          <div id="id-startDate"><p>Start date</p></div>
          <div id="id-endDate"><p>End date</p></div>
        </div>
        <div class="saved-budgets">
          <ul>
            <li v-for="budget in newPlan.budgets" :key="budget.id.intID">
              <div class="setup-budget-view" v-if="!budget.isEditing">
                <div id="id-name">
                  <p class="saved-p">{{ budget.name }}</p>
                </div>
                <div id="id-total" class="currency-input">
                  <p class="saved-p">$ {{ budget.getFormatedValue }}</p>
                </div>
                <div id="id-startDate">
                  <p class="saved-p">{{ budget.startDateFormated }}</p>
                </div>
                <div id="id-endDate">
                  <p class="saved-p">{{ budget.endDateFormated }}</p>
                </div>
                <div class="budget-icons">
                  <span>
                    <i
                      class="pi pi-pencil"
                      @click="
                        () => {
                          budget.isEditing = true
                        }
                      "
                    ></i>
                    <i
                      class="pi pi-trash"
                      @click="() => handleDeleteBudget(budget)"
                    ></i>
                  </span>
                </div>
              </div>
              <div class="setup-budget-view" v-else>
                <div id="id-name">
                  <InputText
                    class="input"
                    v-model="budget.editingFields.name"
                  />
                </div>
                <div id="id-total" class="currency-input">
                  <InputCurrency :value.sync="budget.editingFields.value" />
                </div>
                <div id="id-startDate">
                  <Calendar
                    v-model="budget.startDateEditFormated"
                    class="input"
                  />
                </div>
                <div id="id-endDate">
                  <Calendar
                    v-model="budget.endDateEditFormated"
                    class="input"
                  />
                </div>
                <div class="budget-icons">
                  <span>
                    <i
                      class="pi pi-check"
                      @click="
                        () => {
                          handleEditBudget(budget)
                        }
                      "
                    ></i>
                    <i
                      class="pi pi-times"
                      @click="
                        () => {
                          budget.isEditing = false
                        }
                      "
                    ></i>
                    <i
                      class="pi pi-trash"
                      @click="() => handleDeleteBudget(budget)"
                    ></i>
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div class="budget-inputs-container" v-if="newPlan.budgets.length < 1">
          <div id="id-name">
            <InputText
              type="text"
              class="p-inputtext input"
              v-model="newBudget.name"
            />
          </div>

          <div id="id-total">
            <div>
              <InputCurrency
                :value.sync="newBudget.total"
                class="input-currency"
              />
            </div>
          </div>
          <div id="id-startDate">
            <Calendar v-model="newBudget.startDate" class="input" />
          </div>
          <div id="id-endDate">
            <Calendar v-model="newBudget.endDate" class="input" />
          </div>
          <div class="budget-plus-icons" @click="handleAddBudget">
            <span>
              <i class="pi pi-plus-circle"></i>
              Budget
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import InputSwitch from 'primevue/inputswitch'
import Plan from '@/app-shared/models/Plan'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Dialog from 'primevue/dialog'
import Role from '../models/Role'
import InputCurrency from '@/app-shared/components/InputCurrency.vue'
import Budget from '../models/Budget'
import ID from '../models/ID'

Vue.component('Dialog', Dialog)
Vue.component('InputSwitch', InputSwitch)

export default Vue.extend({
  name: 'PlanSettingsBudget',
  components: {
    InputCurrency,
  },
  props: {
    shouldShow: Boolean,
  },
  data: () => {
    return {
      initialNumber: null as number | null,
      initialUseBudgets: false as boolean,
      saveButtonDisabled: true as boolean,
      invalidFields: [] as string[],
      localTotalBudget: 0 as number,
      initialStartDate: '' as string,
      initialEndDate: '' as string,
      isEdit: false as boolean,
      newBudget: {
        name: '',
        total: 0,
        startDate: '',
        endDate: '',
      },
      newPlan: {} as Plan,
    }
  },
  computed: {
    plan(): Plan {
      return this.$store.getters.currentPlan
    },
    canUserManagePlanUsersChannelsSubscriptions(): boolean {
      return this.$store.getters.getPermissionLevelForPlanId(this.plan.id) <=
        Role.LEVEL_PLAN_ADMIN
        ? true
        : false
    },
    canUserEditPlanProperties(): boolean {
      return this.$store.getters.getPermissionLevelForPlanId(this.plan.id) <=
        Role.LEVEL_PLAN_ADMIN
        ? true
        : false
    },
    masterPlan(): Plan | null {
      if (this.plan.parentId && this.plan.parentId.intID != 0) {
        return this.$store.getters.currentAccount.plans.find(
          (plan) => plan.id.intID == this.plan.parentId.intID
        )
      }
      return null
    },

    currentPlanTotalBudget: {
      get: function (): number {
        return this.plan.totalBudget
      },
      set: function (newValue: number) {
        this.localTotalBudget = newValue
      },
    },
    useBudgetsOn: {
      get: function (): boolean {
        return this.newPlan.useBudgets
      },
      set: function (newValue: boolean) {
        return newValue
      },
    },
    useBudgetsOff: {
      get: function (): boolean {
        return !this.newPlan.useBudgets
      },
      set: function (newValue: boolean) {
        return newValue
      },
    },
  },
  mounted: function () {
    this.setInitialValues()
    this.compareValues()
  },
  created() {
    this.newPlan = this.$store.getters.currentPlan
  },
  methods: {
    setInitialValues() {
      this.initialNumber = this.plan.totalBudget
      this.initialUseBudgets = this.plan.useBudgets
      this.localTotalBudget = this.plan.totalBudget
      this.initialStartDate = JSON.stringify(this.plan.startDate)
      this.initialEndDate = JSON.stringify(this.plan.endDate)
    },
    compareValues() {
      if (
        this.initialNumber === this.localTotalBudget &&
        this.initialUseBudgets === !this.isEdit &&
        this.initialStartDate === JSON.stringify(this.plan.startDate) &&
        this.initialEndDate === JSON.stringify(this.plan.endDate)
      ) {
        this.saveButtonDisabled = true
      } else {
        this.saveButtonDisabled = false
      }

      //TODO: currently using forceUpdate because some input components were not truggering DOM render, this is likely because their models are properties of currentPlan and not reactive, resolve this issue by ensuring that these models are reactive
      this.$forceUpdate()
    },
    showCancelConfirmationPopUp(event) {
      if (this.saveButtonDisabled) {
        this.$emit('cancel')
      } else {
        this.$confirm.require({
          acceptLabel: 'YES',
          rejectLabel: 'NO',
          target: event.currentTarget,
          message:
            'Are you sure you want to cancel? Your changes will be lost.',
          accept: () => {
            this.$emit('cancel')
          },
          reject: () => {
            // Cancel rejected
          },
        })
      }
    },
    areFieldsValid() {
      const isFormValid = true
      this.invalidFields = []
      // TODO: add form validation here
      return isFormValid
    },
    handleSavePlan() {
      // Validate fields
      if (!this.areFieldsValid()) {
        return false
      }
      this.plan.accountId = this.$store.getters.currentAccount.id
      this.$store.getters.services.plans
        .update(this.newPlan)
        .then((plan) => {
          this.$emit('complete')
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.success,
            summary: 'Plan updated.',
            life: 3000,
          })
          this.$store.dispatch('updateCurrentPlan', plan)
          this.isEdit = !this.isEdit
        })
        .then(() => {
          this.setInitialValues()
          this.saveButtonDisabled = true
        })

      if (this.initialNumber !== this.localTotalBudget) {
        const currentBudget = this.plan.budgets[0]
        if (currentBudget) {
          currentBudget.value = this.localTotalBudget
          this.$store.getters.services.budgets
            .update(currentBudget)
            .then((returnedBudget) => {
              this.plan.budgets[0].value = returnedBudget.value
            })
        } else {
          this.$store.getters.services.budgets
            .create(
              new Budget(
                new ID(),
                this.$store.getters.currentUser,
                this.plan.id,
                new ID(),
                this.plan.startDate,
                this.plan.endDate,
                this.plan.name + ' Budget',
                this.localTotalBudget,
                true,
                true
              )
            )
            .then((returnedBudget) => {
              this.plan.budgets.push(returnedBudget)
            })
        }
      }
    },
    handleCancel() {
      this.$emit('cancel')
    },
    onCalendarDateSelect() {
      if (this.plan.endDate < this.plan.startDate) {
        this.plan.endDate = this.plan.startDate
      }
    },
    handleToggleUseBudgets(value) {
      this.newPlan.useBudgets = value
    },
    handleEdit() {
      this.isEdit = !this.isEdit
    },
    handleEditBudget(budget) {
      const newBudget = budget
      newBudget.name = newBudget.editingFields.name
      newBudget.value = newBudget.editingFields.value
      newBudget.startDate = newBudget.editingFields.startDate
      newBudget.endDate = newBudget.editingFields.endDate

      delete newBudget.editingFields

      this.$store.getters.services.budgets
        .update(budget)
        .then((editedBudget) => {
          const newSetupPlan = this.$store.getters.currentPlan
          newSetupPlan.budgets = newSetupPlan.budgets.map((b) =>
            b.id.intID === budget.id.intID ? editedBudget : b
          )
          this.$store.commit('updatecurrentPlan', newSetupPlan)
          budget.isEditing = false
          return ''
        })
    },
    handleDeleteBudget(budget) {
      this.$store.getters.services.budgets
        .delete([budget.id.intID])
        .then(() => {
          const newSetupPlan = this.$store.getters.currentPlan
          newSetupPlan.budgets = newSetupPlan.budgets.filter(
            (b) => b.id.intID !== budget.id.intID
          )
          this.$store.commit('updatecurrentPlan', newSetupPlan)

          return ''
        })
    },
    handleAddBudget() {
      const {name, total, startDate, endDate} = this.newBudget
      const creator = this.$store.getters.currentUser.id.intID
      const plan = this.newPlan.id.intID
      const newBudget = Budget.fromResponseObject({
        value: total,
        startDate: new Date(startDate ? startDate : Date.now()),
        endDate: new Date(endDate ? endDate : Date.now()),
        creator,
        plan,
        active: true,
        name,
        channels: this.$store.getters.currentPlan.channels.map(
          (c) => c.id.apiID
        ),
      })

      this.$store.getters.services.budgets
        .create(newBudget)
        .then((newDbBudget) => {
          this.newPlan.budgets.push(newDbBudget)
          this.newBudget = {
            name: '',
            total: 0,
            startDate: '',
            endDate: '',
          }
        })
    },
  },
})
</script>

<style lang="scss">
.currency-input input {
  height: 23px !important;
}
.budget-plus-icons {
  padding-top: 7px;
  cursor: pointer;
}
.input-currency .p-inputtext {
  height: 22px !important;
}
</style>