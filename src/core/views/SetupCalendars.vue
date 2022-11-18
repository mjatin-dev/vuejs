<template>
  <div class="setup-content">
    <SetupTopView
      class="main_title onboarding-calendar-setup"
      :title="topViewContent.title"
      :infoText="topViewContent.infoText"
    />
    <div class="standard calendars-container p-mt-6">
      <SetupTopView class="title" :title="topViewContent2.title" />
      <ul class="setup-calendars-container">
        <li
          v-for="(calendar, i) in defaultCalendars"
          :key="i * Math.random()"
          class="calendars"
        >
          <div class="central-content">
            <Checkbox
              :id="`calendar-${i}`"
              v-model="calendar.selected"
              :binary="true"
              class="p-mr-2 checkbox"
            />
            <div
              class="calendar__trigger calendar-label"
              v-if="!calendar.opened"
            >
              {{ calendar.name }}
            </div>
            <div v-else class="calendar__opened">
              <div class="calendar-field">
                <div class="calendar-data-field">
                  <label for="calendar-26-name">Name</label>
                  <div class="standard-cal-text">{{ calendar.name }}</div>
                </div>
                <div class="calendar-data-field">
                  <label>Description</label>
                  <div class="standard-cal-text">
                      {{ calendar.description }}
                  </div>
                </div>
              </div>
            </div>
            <span
              :class="`calendar_arrow pi pi-chevron-${
                calendar.opened ? 'down' : 'right'
              }`"
              @click="() => (calendar.opened = !calendar.opened)"
            ></span>
          </div>
        </li>
      </ul>
      <div class="submit-suggestions" @click="sendCalendarSuggestions">
        <a href="javascript:void(0)" class="text-link"
          >Submit calendar suggestions</a
        >
      </div>
    </div>

    <div class="custom calendars-container">
      <SetupTopView
        class="title"
        :title="topViewContent3.title"
        :infoText="topViewContent3.infoText"
      />

      <div class="custom-calendars-text">
        Custom calendars are available to all Plans in the Account.
      </div>
      <ul class="setup-calendars-container">
        <li v-for="(calendar, i) in customCalendars" :key="i" class="calendars">
          <PlanSettingsSubscriptionDetail :calendar="calendar" :index="i" :isEditable="true" />
        </li>
        <li>
          <div class="input-bottom-container p-mt-4">
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
        </li>
      </ul>
    </div>

    <div class="actions-container p-mt-6">
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
import InputText from 'primevue/inputtext'
import TextArea from 'primevue/textarea'

import SetupTopView from '@/app-shared/components/SetupTopView.vue'
import Plan from '@/app-shared/models/Plan'
import Subscription from '@/app-shared/models/Subscription'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import AccountService from '@/app-shared/services/AccountsService'
import PlanSettingsSubscriptionDetail from '@/app-shared/views/PlanSettingsSubscriptionDetail.vue'

Vue.component('Button', Button)
Vue.component('InputText', InputText)
Vue.component('TextArea', TextArea)

export default Vue.extend({
  name: 'SetupCalendars',

  components: {
    SetupTopView,
    PlanSettingsSubscriptionDetail
  },

  data: () => ({
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
         Learn how to <a href='https://www.annumplanning.com/marketing-resources/guides/create-a-shared-calendar/' target='_blank'>create your own shared calendar.</a>`,
    },
    newCalendarUrl: '',
    currentAccountId: {},
  }),

  computed: {
    currentPlan(): Plan {
      return this.$store.getters.currentSetupPlan
    },
    defaultCalendars(): Subscription[] {
      return this.$store.getters.allSubscriptions.filter(
        (subscription) => subscription.accountId.intID === 0
      )
    },
    customCalendars(): Subscription[] {
      return this.$store.getters.allSubscriptions.filter(
        (subscription) => subscription.accountId.intID !== 0
      )
    }
  },

  created() {
    this.defaultCalendars.forEach((calendar)=>{
      if(this.currentPlan.subscriptions.find((planCalendar)=>planCalendar.id.intID === calendar.id.intID)){
        calendar.selected = true
      }
    })
    this.customCalendars.forEach((calendar)=>{
      if(this.currentPlan.subscriptions.find((planCalendar)=>planCalendar.id.intID === calendar.id.intID)){
        calendar.selected = true
      }
    })
  },

  methods: {
    handleCalendarOpen(calendar) {
      calendar.opened = !calendar.opened
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
    updateCalendars() {
      return new Promise((resolve, reject) => {
        Promise.allSettled([
          ...(this.defaultCalendars?.map((calendar) =>
            this.$store.getters.services.accounts.updateSubscription(calendar)
          ) ?? []),
          ...(this.customCalendars?.map((calendar) =>
            this.$store.getters.services.accounts.updateSubscription(calendar)
          ) ?? []),
        ]).then(() => {
          resolve('')
        }).catch(() => {
          reject('')
        })
      })
    },

    sendCalendarSuggestions() {
      const email = 'hello@annumplanning.com'
      const subject = 'Suggestion for default Calendars of Interest'
      document.location.href = 'mailto:' + email + '?subject=' + subject
    },

    handleClickContinue() {
      this.updateCalendars().then(() => {
        //Update current plan with new subscription list
        this.currentPlan.subscriptions = this.defaultCalendars
          .filter((calendar) => calendar.selected === true)
          .concat(
            this.customCalendars.filter(
              (calendar) => calendar.selected === true
            )
          )
        this.currentPlan.accountId = this.$store.getters.currentAccount.id
        this.$store.getters.services.plans
          .update(this.currentPlan)
          .then(() => {
            this.$emit('setup-step-complete')
          })
      })
    },
  },
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
    font-size: 16px !important;
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
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
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

.submit-suggestions {
  @include font-mulish-light;
  margin: 0 auto;
  width: fit-content;
  margin-bottom: 40px;
  font-size: 14px;
  color: #0074daff !important;
  border-bottom: solid 1px #0074daff !important;
  cursor: pointer;
}

.calendar-data-field {
  margin-bottom: 20px;
  @include font-mulish-light;
  h3 {
    @include font-mulish-light;
    margin: 0;
    margin-bottom: 3px;
  }
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
.standard-cal-text{
  font-family: "MulishLight", Helvetica, Arial, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    max-width: 700px;
    overflow-wrap: anywhere;
    margin-top: 0;
}
</style>
