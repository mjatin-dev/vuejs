<template>
  <div>
    <div class="plan-settings-modal-header">
      <h2 class="p-mr-4">Plan Settings: Calendars of Interest</h2>
      <div>
        <Button @click="onCloseClick" label="Save" class="p-button p-mr-2" />
        <Button
          @click="showCancelConfirmationPopUp"
          label="Close"
          class="p-button-outlined p-mr-2"
        />
      </div>
    </div>
    <div class="plan-settings-modal-content">
      <SetupTopView
        class="main_title onboarding-calendar-setup"
        :infoText="topViewContent.infoText"
        title=""
      />
      <div class="custom calendars-container">
        <SetupTopView class="title" :title="topViewContent2.title" />
        <ul class="setup-calendars-container calender-list">
          <li
            v-for="(calendar, i) in defaultCalendars"
            :key="i"
            class="calendars"
          >
            <PlanSettingsSubscriptionDetail
              :calendar="calendar"
              :index="i"
              :isEditable="false"
              @changesMade="changesMade"
            />
          </li>
          <li></li>
        </ul>
      </div>
      <div class="submit-suggestions-setting">
        <a
          class="text-link"
          href="mailto:hello@annumplanning.com?subject=Suggestion for default Calendars of Interest"
          target="_blank"
          >Submit calendar suggestions</a
        >
      </div>
      <div class="custom calendars-container">
        <SetupTopView
          class="title"
          :title="topViewContent3.title"
          :infoText="topViewContent3.infoText"
        />
        <p class="custom-calender">
          Custom Calenders are available to all Plans in the Account
        </p>
        <ul class="setup-calendars-container calender-list">
          <li
            v-for="(calendar, i) in customCalendars"
            :key="i"
            class="calendars"
          >
            <PlanSettingsSubscriptionDetail
              :calendar="calendar"
              :index="i"
              :isEditable="true"
              @deleteSubscription="deleteSubscription"
            />
          </li>
        </ul>
        <div class="input-bottom-container">
          <InputText
            type="text"
            v-model="newCalendarUrl"
            class="input-bottom"
            placeholder="URL for calendar"
          />
          <div class="add-calendar" @click="handleCalendarCreate">
            <i class="pi pi-plus-circle p-mr-2"></i>
            Custom Calendar
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Dialog from 'primevue/dialog'
import Plan from '@/app-shared/models/Plan'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Role from '@/app-shared/models/Role'
import Subscription from '../models/Subscription'
import AccountService from '@/app-shared/services/AccountsService'
import PlanSettingsSubscriptionDetail from './PlanSettingsSubscriptionDetail.vue'
import SetupTopView from '@/app-shared/components/SetupTopView.vue'

Vue.component('Dialog', Dialog)

export default Vue.extend({
  name: 'PlanSetingsSubscriptions',

  data: () => {
    return {
      selectedDefaultCalendars: [] as Subscription[],
      selectedCustomCalendars: [] as Subscription[],
      newCalendarUrl: '',
      topViewContent: {
        title: 'Calendars of Interest',
        infoText:
          'Add external calendars to your Plan to pull holidays, observances and other important events into your views.',
      },
      topViewContent2: {
        title: 'Standard Calendars',
      },
      topViewContent3: {
        title: 'Custom Calendars',
        infoText: `Add a publicly shared calendar using its iCal URL. <br>
         Learn how to <a href='https://www.annumplanning.com/resources/guides/create-a-shared-calendar/' target='_blank'>create your own shared calendar.</a>`,
      },
      isChange: false,
      customCalendars: [] as Subscription[],
    }
  },

  created() {
    this.customCalendars = this.$store.getters.allSubscriptions.filter(
      (subscription) => subscription.accountId.intID !== 0
    )
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
    defaultCalendars(): Subscription[] {
      return this.$store.getters.allSubscriptions.filter(
        (subscription) => subscription.accountId.intID === 0
      )
    },
  },

  mounted() {
    // Update selected calendars
    this.defaultCalendars.forEach((calendar) => {
      if (
        this.plan.subscriptions.find(
          (planCalendar) => planCalendar.id.intID === calendar.id.intID
        )
      ) {
        calendar.selected = true
      } else {
        calendar.selected = false
      }
    })
    this.customCalendars.forEach((calendar) => {
      if (
        this.plan.subscriptions.find(
          (planCalendar) => planCalendar.id.intID === calendar.id.intID
        )
      ) {
        calendar.selected = true
      } else {
        calendar.selected = false
      }
    })
  },
  beforeDestroy() {
    this.$store.getters.allSubscriptions.forEach((calendar) => {
      calendar.selected = false
    })
  },
  methods: {
    onCloseClick() {
      //Update current plan with new subscription list
      this.plan.subscriptions = this.$store.getters.allSubscriptions.filter(
        (calendar) => calendar.selected === true
      )
      this.plan.accountId = this.$store.getters.currentAccount.id
      this.$store.getters.services.plans.update(this.plan).then((plan) => {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.success,
          summary: 'Plan updated.',
          life: 3000,
        })
        this.$store.dispatch('updateCurrentPlan', plan)
        this.$emit('complete')
      })
    },
    handleCalendarCreate() {
      if (this.newCalendarUrl) {
        const newSubscription = Subscription.fromResponseObject({
          calendarPath: this.newCalendarUrl,
          name: 'New Calendar',
          account: this.$store.getters.currentAccount.id.intID,
        })
        this.$store.getters.services.accounts
          .createSubscription(newSubscription)
          .then(() => {
            const accounts = new AccountService()
            accounts
              .getSubscriptions(this.$store.getters.currentAccount.id.intID)
              .then((subscriptions) => {
                const data = subscriptions as Subscription[]
                const newData = data.filter(
                  (subscription) => subscription.accountId.intID !== 0
                )
                this.customCalendars = newData
                this.$store.dispatch('updateSubscription')
              })
            this.newCalendarUrl = ''
          })
      } else {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must add url for the calendar first',
        })
      }
    },
    showCancelConfirmationPopUp(event) {
      this.$emit('complete')
      this.$store.dispatch('refreshCurrentPlan')
    },
    sendCalendarSuggestions() {
      const email = 'hello@annumplanning.com'
      const subject = 'Suggestion for default Calendars of Interest'
      document.location.href = 'mailto:' + email + '?subject=' + subject
    },
    changesMade() {
      this.isChange = !this.isChange
    },
    deleteSubscription(calendarId) {
      this.customCalendars = this.customCalendars.filter(
        (subscription) => subscription.id.intID !== calendarId
      )
      this.$store.dispatch('updateSubscription')
    },
  },

  components: {PlanSettingsSubscriptionDetail, SetupTopView},
})
</script>


<style lang="scss">
@import '@/app-shared/styles/_imports.scss';
.main_title {
  font-size: 17px;
}
.calendars-container {
  max-width: 1020px;
  width: 100%;
  margin: 0 auto;
  li {
    padding: 10px;
    border-bottom: 1px solid black;
    min-height: 40px;
    &:first-child {
      border-top: 1px solid black;
    }
  }

  .custom-calendars-text {
    @include font-mulish-light;
    text-align: center;
    font-size: 14px !important;
  }

  .calendar_arrow {
    float: right;
  }

  .title {
    @include font-mulish-light;
    font-size: 21px !important;
    background-color: white;
  }

  .subtitle {
    display: none;
  }

  .infoText {
    font-size: 18px !important;
  }
}

.standard {
  position: relative;
  .checkbox {
    position: absolute;
    .p-checkbox-icon {
      transform: translate(8px, -2px);
    }
  }
  .calendar-label {
    @include font-mulish-light;
    padding-left: 30px;
    font-size: 16px;
  }
  .calendar-field {
    // padding: 10px;
    padding: 0px 10px 10px 10px;
  }
  .calendar__opened {
    padding-left: 25px;
    input {
      min-width: 800px;
    }
  }
  .central-content {
    position: relative;
  }
  span {
    position: absolute;
    top: 5px;
    right: 10px;
  }
}
.custom {
  position: relative;

  li:last-child {
    border: none;
  }

  .title {
    @include font-mulish-light;
    font-size: 21px !important;
    background-color: white;
    margin-bottom: 4px !important;
  }
  .infoText {
    font-size: 16px !important;
    margin-bottom: 20px !important;
    a {
      color: #0074daff !important;
      border-bottom: 1px solid #0074daff;
    }
  }

  &__checkbox {
    position: absolute;
  }
  .calendar-label {
    @include font-mulish-light;
    padding-left: 30px;
    font-size: 16px;
  }
  .calendar-field {
    // padding: 10px;
    padding: 0px 10px 10px 10px;
    @include font-mulish-light;
    label {
      @include font-mulish-light;
      font-size: 11px;
    }
  }

  .calendar-path {
    @include font-mulish-light;
    font-size: 16px;
    max-width: 700px;
    overflow-wrap: anywhere;
    margin-top: 0;
  }

  .save-icon,
  .trash-icon {
    margin-right: 15px;
    float: right;
    font-size: 20px;
    width: 27px;
    height: 27px;
    text-align: center;
    padding-top: 3px;
    border-radius: 3px;
    background-color: transparent;
  }
  .custom__opened {
    padding-left: 25px;
    input {
      min-width: 800px;
    }
  }
  .central-content {
    position: relative;
  }
  .calendar__arrow {
    position: absolute;
    top: 5px;
    right: 10px;
  }
}
.input-bottom-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px 30px 10px 30px;
  .input-bottom {
    width: 350px;
  }
}

.p-inputtextarea {
  width: 100%;
  max-width: 800px;
  min-height: 60px;
  resize: none;
}

.calendar-data-field {
  margin-bottom: 20px;
  @include font-mulish-light;
}

.add-calendar {
  @include font-mulish-light;
  font-size: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  .pi-plus-circle {
    font-size: 13px;
  }
}

.actions-container {
  .continue-button {
    color: #ffffff !important;
  }
}

.onboarding-calendar-setup {
  .title {
    @include font-mulish-light;
    // margin-bottom: 0px !important;
  }
  .subtitle {
    display: none !important;
  }
  .infoText {
    @include font-mulish-light;
    font-size: 21px !important;
  }
}
.standard-cal-text {
  font-family: 'MulishLight', Helvetica, Arial, sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  max-width: 700px;
  overflow-wrap: anywhere;
  margin-top: 0;
}

.custom-calender {
  @include font-mulish-light;
  font-size: 15px !important;
  margin-left: 30px;
  text-align: center;
}

.submit-suggestions-setting {
  @include font-mulish-light;
  margin: 0 auto;
  width: fit-content;
  margin-bottom: 20px;
  font-size: 14px;
  color: #0074daff !important;
  border-bottom: solid 1px #0074daff !important;

  cursor: pointer;
}

.submit-suggestions-calender {
  @include font-mulish-light;
  margin: 0 auto;
  width: fit-content;
  margin-bottom: 25px;
  font-size: 14px;
  color: #0074daff !important;
  border-bottom: solid 1px #0074daff !important;
  cursor: pointer;
  margin-top: -38px !important;
  display: flex;
}
.calender-list {
  padding: 10px !important;
}
</style>
