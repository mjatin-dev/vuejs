<template>
  <div class="setup-content">
    <SetupTopView
      class="main_title onboarding-budget-setup"
      :title="topViewContent.title"
      :infoText="topViewContent.infoText"
    />
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
              <div id="id-total">
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
                <InputText class="input" v-model="budget.editingFields.name" />
              </div>
              <div id="id-total">
                <InputCurrency :value.sync="budget.editingFields.value" />
              </div>
              <div id="id-startDate">
                <Calendar
                  v-model="budget.startDateEditFormated"
                  class="input"
                />
              </div>
              <div id="id-endDate">
                <Calendar v-model="budget.endDateEditFormated" class="input" />
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
          <InputCurrency :value.sync="newBudget.total" />
        </div>
        <div id="id-startDate">
          <Calendar v-model="newBudget.startDate" class="input" />
        </div>
        <div id="id-endDate">
          <Calendar v-model="newBudget.endDate" class="input" />
        </div>
        <div class="budget-plus-icon" @click="handleAddBudget">
          <span>
            <i class="pi pi-plus-circle"></i>
            Budget
          </span>
        </div>
      </div>
    </div>
    <div class="actions-container">
      <Button
        @click="handleClickContinue"
        class="continue-button onboarding-button-style"
        label="Continue"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'

import SetupTopView from '@/app-shared/components/SetupTopView.vue'

import Budget from '@/app-shared/models/Budget'
import Plan from '@/app-shared/models/Plan'

import InputCurrency from '@/app-shared/components/InputCurrency.vue'

Vue.component('Button', Button)
Vue.component('Checkbox', Checkbox)
Vue.component('Calendar', Calendar)
Vue.component('InputText', InputText)

export default Vue.extend({
  name: 'SetupBudget',
  components: {
    SetupTopView,
    InputCurrency,
  },
  data: () => ({
    topViewContent: {
      title: 'Budget',
      infoText:
        'Establish budget parameters and track expenses at the Tactic level.',
    },
    newBudget: {
      name: '',
      total: 0,
      startDate: '',
      endDate: '',
    },
    newPlan: {} as Plan,
  }),
  computed: {
    useBudgetsOn: {
      get(): boolean {
        return this.newPlan.useBudgets
      },
      set(newVal) {
        return newVal
      },
    },
    useBudgetsOff: {
      get(): boolean {
        return !this.newPlan.useBudgets
      },
      set(newVal) {
        return newVal
      },
    },
  },
  created() {
    this.newPlan = this.$store.getters.currentSetupPlan
  },
  methods: {
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
          const newSetupPlan = this.$store.getters.currentSetupPlan
          newSetupPlan.budgets = newSetupPlan.budgets.map((b) =>
            b.id.intID === budget.id.intID ? editedBudget : b
          )
          this.$store.commit('updateCurrentSetupPlan', newSetupPlan)
          budget.isEditing = false
          return ''
        })
    },
    handleDeleteBudget(budget) {
      this.$store.getters.services.budgets
        .delete([budget.id.intID])
        .then(() => {
          const newSetupPlan = this.$store.getters.currentSetupPlan
          newSetupPlan.budgets = newSetupPlan.budgets.filter(
            (b) => b.id.intID !== budget.id.intID
          )
          this.$store.commit('updateCurrentSetupPlan', newSetupPlan)

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
        channels: this.$store.getters.currentSetupPlan.channels.map(
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
    handleToggleUseBudgets(value) {
      this.newPlan.useBudgets = value

      this.newPlan.accountId = this.$store.getters.currentAccount.id

      this.$store.getters.services.plans
        .update(this.newPlan)
        .then((newPlan) => {
          this.$store.commit('updateCurrentSetupPlan', newPlan)
        })
    },
    handleClickContinue() {
      this.$emit('setup-step-complete')
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.setup-checkboxes {
  max-width: 440px;
  width: 100%;
  margin: 10px auto;
  display: flex;
  justify-content: space-around;
  .checkboxes-text-first {
    @include font-mulish-light;
    font-size: 15px;
  }
  .checkboxes-text-second {
    @include font-mulish-light;
    font-size: 12px;
    max-width: 170px;
  }
  .checkbox-container {
    padding-top: 12px;
    .p-highlight {
      border-color: #000000;
      background: #ffffff !important;
    }
  }
}

.budget-container {
  padding-bottom: 13px;
  margin-bottom: 30px;
  .budget-header {
    display: flex;
    padding: 3px;
    background-color: #dadada;
    div {
      // padding-right: 210px;
      p {
        margin: 0;
      }
    }
  }
  .saved-budgets {
    display: flex;
    position: relative;
    ul {
      width: 100%;
      padding: 0;
      margin: 0;
    }
    li {
      width: 100%;
      height: 50px;
    }
    .budget-icons {
      cursor: pointer;
      position: absolute;
      right: 10px;
      i {
        padding-top: 8px;
        padding-left: 10px;
      }
    }
  }
  .budget-inputs-container {
    display: flex;
    padding-top: 13px;
    .budget-plus-icon {
      padding-top: 7px;
      padding-left: 30px;
      cursor: pointer;
    }
  }
}
.setup-budget-view {
  display: flex;
  padding-bottom: 10px;
  max-height: 30px;
  padding-top: 10px;
}
.saved-budgets li:not(:last-child) {
  border-bottom: 1px solid black;
}
#id-name {
  width: 23%;
  .input {
    width: 80%;
    height: 22px;
  }
  .saved-p {
    font-size: 15px;
    margin-top: 5px;
  }
}
#id-total {
  width: 23%;
  .input {
    width: 80%;
    height: 22px;
  }
  .saved-p {
    font-size: 15px;
    margin-top: 5px;
  }
}
#id-startDate {
  width: 23%;
  .input {
    width: 80%;
    height: 22px;
  }
  .saved-p {
    font-size: 15px;
    margin-top: 5px;
  }
}
#id-endDate {
  width: 23%;
  .input {
    width: 80%;
    height: 22px;
  }
  .saved-p {
    font-size: 15px;
    margin-top: 5px;
  }
}

.actions-container {
  .continue-button {
    color: #ffffff !important;
  }
}

.onboarding-budget-setup {
  max-width: 370px !important;
  .title {
    @include font-mulish-light;
  }
  .subtitle {
    @include font-mulish-light;
    display: none !important;
  }
  .infoText {
    @include font-mulish-light;
    font-size: 21px !important;
  }
}
</style>
