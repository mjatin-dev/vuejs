<template>
  <div class="setup-container">
    <div v-show="isSetupPlanLoaded">
      <div v-show="currentStepsItemPosition > 0">
        <div class="p-d-flex p-jc-between p-ai-start p-mb-6">
          <div>
            <h2>{{ this.$store.getters.currentSetupPlan.name }}</h2>
          </div>
          <Button
            class="skip-btn onboarding-button-style"
            v-if="nextStepItem"
            @click="handleClickSkip"
            label="Skip"
          />
        </div>
        <Steps
          id="onboarding_steps"
          :model="staticStepsItems"
          :readonly="true"
          :exact="false"
          class="p-mb-6"
          :class="stepsClass"
        />
      </div>
      <div v-if="planFetched" class="onboarding-container">
        <router-view v-on:setup-step-complete="onSetupStepComplete" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import ID from '@/app-shared/models/ID'
import Button from 'primevue/button'
import Steps from 'primevue/steps'
import RadioButton from 'primevue/radiobutton'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Plan from '@/app-shared/models/Plan'

Vue.component('Button', Button)
Vue.component('Steps', Steps)
Vue.component('RadioButton', RadioButton)

export default Vue.extend({
  name: 'SetupRoot',
  data: () => {
    return {
      setupMode: '' as string,
      setupAccountId: {} as ID,
      setupPlanId: {} as ID,
      currentStepsItem: {} as object | undefined,
      currentStepsItemIndex: 0 as number,
      planFetched: false,
    }
  },
  computed: {
    staticStepsItems(): {}[] {
      if (this.setupMode == 'quick') {
        return [
          {
            label: 'Set Up Channels',
            position: 1,
          },
          {
            label: 'Add Calendars of Interest',
            position: 2,
          },
          {
            label: 'Add Team Members',
            position: 3,
          },
          {
            label: 'Enter Tactics',
            position: 4,
          },
        ]
      } else {
        return [
          {
            label: 'Set Up Channels',
            position: 1,
          },
          {
            label: 'Add Calendars of Interest',
            position: 2,
          },
          {
            label: 'Establish Your Budget',
            position: 3,
          },
          {
            label: 'Tie In Strategy',
            position: 4,
          },
          {
            label: 'Add Team Members',
            position: 5,
          },
          {
            label: 'Enter Tactics',
            position: 6,
          },
        ]
      }
    },
    stepsClass(): {} {
      if (this.setupMode == 'quick') {
        return {
          'current-step-0': this.currentStepsItemPosition == 0 ? true : false,
          'current-step-1':
            this.currentStepsItemPosition == 1 ||
            this.currentStepsItemPosition == 2
              ? true
              : false,
          'current-step-2': this.currentStepsItemPosition == 3 ? true : false,
          'current-step-3': this.currentStepsItemPosition == 4 ? true : false,
          'current-step-4': this.currentStepsItemPosition == 5 ? true : false,
        }
      } else {
        return {
          'current-step-0': this.currentStepsItemPosition == 0 ? true : false,
          'current-step-1':
            this.currentStepsItemPosition == 1 ||
            this.currentStepsItemPosition == 2
              ? true
              : false,
          'current-step-2': this.currentStepsItemPosition == 3 ? true : false,
          'current-step-3': this.currentStepsItemPosition == 4 ? true : false,
          'current-step-4':
            this.currentStepsItemPosition == 5 ||
            this.currentStepsItemPosition == 6 ||
            this.currentStepsItemPosition == 7
              ? true
              : false,
          'current-step-5': this.currentStepsItemPosition == 8 ? true : false,
          'current-step-6': this.currentStepsItemPosition == 9 ? true : false,
        }
      }
    },
    currentStepsItems(): {}[] {
      if (this.setupMode == 'quick') {
        return [
          {
            to: `/setup/quick/${this.setupAccountId.intID}/${this.setupPlanId.intID}/default-channels`,
            position: 1,
          },
          {
            to: `/setup/quick/${this.setupAccountId.intID}/${this.setupPlanId.intID}/custom-channels`,
            position: 2,
          },
          {
            to: `/setup/quick/${this.setupAccountId.intID}/${this.setupPlanId.intID}/calendars`,
            position: 3,
          },
          {
            to: `/setup/quick/${this.setupAccountId.intID}/${this.setupPlanId.intID}/team`,
            position: 4,
          },
          {
            to: `/setup/quick/${this.setupAccountId.intID}/${this.setupPlanId.intID}/tactics`,
            position: 5,
          },
        ]
      } else {
        return [
          {
            to: `/setup/full/${this.setupAccountId.intID}/${this.setupPlanId.intID}/default-channels`,
            position: 1,
          },
          {
            to: `/setup/full/${this.setupAccountId.intID}/${this.setupPlanId.intID}/custom-channels`,
            position: 2,
          },
          {
            to: `/setup/full/${this.setupAccountId.intID}/${this.setupPlanId.intID}/calendars`,
            position: 3,
          },
          {
            to: `/setup/full/${this.setupAccountId.intID}/${this.setupPlanId.intID}/budget`,
            position: 4,
          },
          {
            to: `/setup/full/${this.setupAccountId.intID}/${this.setupPlanId.intID}/tags`,
            position: 5,
          },
          {
            to: `/setup/full/${this.setupAccountId.intID}/${this.setupPlanId.intID}/initiatives`,
            position: 6,
          },
          {
            to: `/setup/full/${this.setupAccountId.intID}/${this.setupPlanId.intID}/documents`,
            position: 7,
          },
          {
            to: `/setup/full/${this.setupAccountId.intID}/${this.setupPlanId.intID}/team`,
            position: 8,
          },
          {
            to: `/setup/full/${this.setupAccountId.intID}/${this.setupPlanId.intID}/tactics`,
            position: 9,
          },
        ]
      }
    },
    currentStepItem(): {} | undefined {
      return this.currentStepsItems.find((item) => {
        return item['to'] == this.$route.path
      })
    },
    nextStepItem(): {} | null {
      if (this.currentStepsItemPosition) {
        return this.currentStepsItems[this.currentStepsItemPosition]
      }
      return null
    },
    currentStepsItemPosition(): number {
      if (this.currentStepItem) {
        return Number(this.currentStepItem['position'])
      }
      return 0
    },
    currentSetupPlan(): Plan {
      return this.$store.getters.currentSetupPlan
    },
    isSetupPlanLoaded(): boolean {
      return this.currentSetupPlan.id ? true : false
    },
  },
  created: function () {
    // User will be coming from marketing site where an account, a user, and a plan were created
    // Plan will initially have all default channels from Super Plan (ID: 15)
    // Test using this path: /setup/quick/1/47/
    // Assume user has a valid refreshToken cookie
    // Each sub-view will update a plan object stored in this view
    // Before advancing to the next step this view will make an API call to update the plan object

    // Quick Start steps:
    // - Default Channels
    // - Customize Channels
    // - Calendars of Interest
    // - Team
    // - Enter Tactics (instructional image or animation)

    // Full Setup steps:
    // - Default Channels
    // - Customize Channels
    // - Calendars of Interest
    // - Budget
    // - Strategic Priorities
    // - Initiatives
    // - Plan Documents
    // - Team
    // - Enter Tactics (instructional image or animation)

    // Set document title
    document.title = 'Annum | Setup'

    // Store route params locally
    this.setupMode = this.$route.params.setupMode
    this.setupAccountId = new ID(Number(this.$route.params.setupAccountId))
    this.setupPlanId = new ID(Number(this.$route.params.setupPlanId))

    // Set setup plan if it is already loaded
    const checkSetupPlan = this.$store.getters.allPlans.find((plan)=>plan.id.intID === this.setupPlanId.intID)
    if(checkSetupPlan){
      this.$store.commit('updateCurrentSetupPlan', checkSetupPlan)
    }

    // Load new plan
    if (!this.isSetupPlanLoaded) {
      this.$store.getters.services.plans.get([this.setupPlanId.intID]).then(
        (plan) => {
          this.$store.commit('updateCurrentSetupPlan', plan)
          this.planFetched = true
        },
        (error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error accessing new plan. ' + error,
          })
          this.$router.push('/')
        }
      )
    } else {
      this.planFetched = true
    }
  },
  methods: {
    handleClickSkip() {
      this.loadNextStep()
    },
    onSetupStepComplete() {
      this.loadNextStep()
    },
    loadNextStep() {
      if (this.nextStepItem) {
        this.$router.push(this.nextStepItem['to'])
      } else {
        this.$router.push('/')
      }
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.skip-btn {
  color: #ffffff !important;
}
.onboarding-container {
  max-width: 1200px;
  margin: 0 auto;
}

.setup-container {
  position: fixed;
  overflow-y: auto;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  padding: 2.4rem;
  background-color: #fff;

  .p-steps {
    .p-steps-item {
      &::before {
        top: 2.5rem;
        border-top-color: #d8dae2;
      }
      .p-steps-number,
      .p-steps-title {
        font-size: 1.5rem;
      }
      .p-steps-number {
        min-width: 3rem;
        height: 3rem;
      }
      .p-steps-title {
        max-width: 11rem;
        
        text-align: center;
        white-space: unset;
      }
      &:nth-child(4),&:nth-child(6)  {
        .p-steps-title {
          padding: 0 12px;
        }
      }
    }
    .p-steps-item:first-child {
      &::before {
        width: 50%;
        left: 50%;
      }
    }
    .p-steps-item:last-child {
      &::before {
        width: 50%;
      }
    }

    &.current-step-1 {
      .p-steps-item:nth-child(1) {
        opacity: 1;
        .p-steps-number {
          background-color: #94cdff;
        }
        .p-steps-title {
          color: #333;
        }
      }
    }
    &.current-step-2 {
      .p-steps-item:nth-child(2) {
        opacity: 1;
        .p-steps-number {
          background-color: #94cdff;
        }
        .p-steps-title {
          color: #333;
        }
      }
    }
    &.current-step-3 {
      .p-steps-item:nth-child(3) {
        opacity: 1;
        .p-steps-number {
          background-color: #94cdff;
        }
        .p-steps-title {
          color: #333;
        }
      }
    }
    &.current-step-4 {
      .p-steps-item:nth-child(4) {
        opacity: 1;
        .p-steps-number {
          background-color: #94cdff;
        }
        .p-steps-title {
          color: #333;
        }
      }
    }
    &.current-step-5 {
      .p-steps-item:nth-child(5) {
        opacity: 1;
        .p-steps-number {
          background-color: #94cdff;
        }
        .p-steps-title {
          color: #333;
        }
      }
    }
    &.current-step-6 {
      .p-steps-item:nth-child(6) {
        opacity: 1;
        .p-steps-number {
          background-color: #94cdff;
        }
        .p-steps-title {
          color: #333;
        }
      }
    }
  }

  .title-container,
  .actions-container {
    display: flex;
    justify-content: center;
  }
}
</style>
