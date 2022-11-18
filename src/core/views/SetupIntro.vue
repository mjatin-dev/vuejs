<template>
  <div class="setup-content intro">
    <p class="title">Let's Get Planning</p>
    <p class="subtitle">
      We will walk you through setting up the foundational elements of your Plan
      so that you can begin entering tactics into the calendar.
      Each element can be addressed later under Plan Settings.
      <span
        v-tooltip.bottom="introCopyHelpText"
        class="pi pi-question-circle tooltip"
      ></span>
    </p>

    <div class="steps-container">
      <Steps
        id="onboarding_intro_steps"
        :model="staticStepsItems"
        :readonly="true"
      />
    </div>

    <div class="inputs-container">
      <label for="plan_name"
        >Plan Name
        <span
          v-tooltip.bottom="planNameHelpText"
          class="pi pi-question-circle"
        ></span
      ></label>
      <InputText
        id="plan_name"
        type="text"
        class="p-inputtext input"
        v-model="localPlanName"
      />
    </div>

    <div class="actions-container">
      <Button
        @click="handleClickBegin"
        class="continue-button onboarding-button-style"
        label="Begin"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import InputText from 'primevue/inputtext'
import Plan from '@/app-shared/models/Plan'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Tooltip from 'primevue/tooltip'

Vue.component('InputText', InputText)

export default Vue.extend({
  name: 'SetupIntro',
  data: () => ({
    setupMode: 'full',
    localPlanName: '' as string,
    introCopyHelpText: 'Plan Settings is found in the top center of the application.',
    planNameHelpText: 'Name the Plan after the business or brand you will be building the marketing calendar for.',
  }),
  directives: {
    tooltip: Tooltip,
  },
  computed: {
    plan(): Plan {
      return this.$store.getters.currentSetupPlan
    },
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
  },
  methods: {
    handleClickBegin() {
      if (this.localPlanName === '') {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.error,
          summary: 'Please enter a plan name.',
        })
        return
      }
      this.plan.name = this.localPlanName
      this.plan.accountId = this.$store.getters.currentAccount.id
      this.$store.getters.services.plans.update(this.plan).then(
        () => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.success,
            summary: 'Plan name updated.',
            life: 3000,
          })
          this.$router.push(
            `/setup/full/${this.$route.params.setupAccountId}/${this.$route.params.setupPlanId}/default-channels`
          )
        },
        (error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error changing plan name.',
            detail: error,
          })
        }
      )
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.setup-content.intro {
  @include font-mulish-light;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 4.8rem);
  text-align: center;
  .title{
    font-size: 45px;
    font-weight: 500;
  }

  .subtitle{
    @include font-mulish-light;
    margin-bottom: 26px;
    font-size: 21px;
    font-weight: 300;
    font-variation-settings: 'wght' 300;
  }
  .tooltip{
    margin-top: 10px;
     font-size: 15px;
  }

  .steps-container {
    width: 100%;
    margin: 6rem auto;

    .p-steps-item.p-disabled {
      opacity: 1;
    }

    p{
      @include font-mulish-light;
      margin-bottom: 26px;
      font-weight: 300;
      font-variation-settings: 'wght' 300;
    }
  }
  .inputs-container {
    width: 30%;
    margin-bottom: 4rem;
    display: flex;
    justify-content: space-evenly;

    label {
      line-height: 2.5rem;
      font-size: 14px;
    }
  }
}
</style>
