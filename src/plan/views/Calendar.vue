<template>
  <div class="view-wrapper calendar-view">
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
          :badge="$store.getters.activeFiltersCount"
          badgeClass="p-badge-info"
        />
      </template>
      <template>
        <div class="p-d-flex">
          <div>
            <DateRangePicker
              :isRangeView="$route.name == 'CalendarFlow'"
              :isMonthView="$route.name == 'CalendarMonth'"
              :isDayView="$route.name == 'CalendarDay'"
            />
          </div>
          <div class="p-field p-ml-4" v-if="$route.name == 'CalendarFlow'">
            <label>Week Starts On:</label>
            <div class="p-d-flex">
              <div class="p-d-flex p-mr-3">
                <RadioButton
                  id="weekStart_sunday"
                  name="weekStart"
                  value="sunday"
                  v-model="plan.weekStartDay"
                  :disabled="!canUserEditPlanProperties"
                  class="p-mr-2"
                  @change="handleSavePlan"
                />
                <label for="weekStart_sunday">Sunday</label>
              </div>
              <div class="p-d-flex">
                <RadioButton
                  id="weekStart_monday"
                  name="weekStart"
                  value="monday"
                  v-model="plan.weekStartDay"
                  :disabled="!canUserEditPlanProperties"
                  class="p-mr-2"
                  @change="handleSavePlan"
                />
                <label for="weekStart_monday">Monday</label>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ViewHeader>
    <ViewMain>
      <transition name="view-fade-transition">
        <router-view name="top" class="calendar-top-view" />
      </transition>
      <transition name="view-fade-transition">
        <router-view name="bottom" class="calendar-bottom-view" />
      </transition>

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
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import TabMenu from 'primevue/tabmenu'
import TacticFilters from '@/plan/components/TacticFilters.vue'
import Calendar from 'primevue/calendar'
import RadioButton from 'primevue/radiobutton'
import DateRangePicker from '@/plan/components/DateRangePicker.vue'
import Role from '@/app-shared/models/Role'
import Plan from '@/app-shared/models/Plan'
import { AlertMessageSeverity } from '@/app-shared/models/AlertMessage'

Vue.component('Toolbar', Toolbar)
Vue.component('Button', Button)
Vue.component('Panel', Panel)
Vue.component('TabMenu', TabMenu)
Vue.component('Calendar', Calendar)
Vue.component('RadioButton', RadioButton)

export default Vue.extend({
  name: 'CalendarView',
  components: {
    ViewHeader,
    ViewMain,
    DateRangePicker,
    TacticFilters,
  },
  data: function () {
    return {
      showTacticFiltersView: false,
    }
  },
  computed: {
    canUserAddTactics(): boolean {
      return (
        this.$store.getters.currentAccountPermissionLevel <=
        Role.LEVEL_CONTRIBUTOR
      )
    },
    plan(): Plan {
      return this.$store.getters.currentPlan
    },
    canUserEditPlanProperties(): boolean {
      return this.$store.getters.getPermissionLevelForPlanId(this.plan.id) <=
        Role.LEVEL_PLAN_ADMIN
        ? true
        : false
    },
  },
  methods: {
    onAddTactic: function () {
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/tactic/0`
      })
    },
    handleSavePlan() {
      this.plan.accountId = this.$store.getters.currentAccount.id
      this.$store.getters.services.plans
        .update(this.plan)
        .then((plan) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.success,
            summary: 'Week start day updated.',
            life: 3000,
          })
          this.$store.dispatch('updateCurrentPlan', plan)
        })
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.calendar-top-view {
  margin-bottom: 1rem;
}
</style>
