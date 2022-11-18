<template>
  <div
    class="logged-out-container p-d-flex p-flex-column p-jc-center p-ai-center"
  >
    <form class="logged-out-form" @submit.prevent="onFormSubmit()">
      <h1>Sign In</h1>
      <div>
        <div class="p-field">
          <label for="log_in_email">Email Address</label>
          <InputText
            id="log_in_email"
            type="email"
            v-model="emailAddress"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            autocomplete="off"
          />
        </div>
        <div class="p-field">
          <label for="log_in_password">Password</label>
          <Password
            id="log_in_password"
            :feedback="false"
            v-model="password"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            autocomplete="off"
          />
        </div>
      </div>
      <Button type="submit" class="p-mb-4" label="Sign In" />
      <div class="forgot-password-container">
        <router-link to="/forgot-password">Forgot Password?</router-link>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import UserSetup from '@/app-shared/models/UserSetup'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'

Vue.component('InputText', InputText)
Vue.component('Password', Password)
Vue.component('Button', Button)

export default Vue.extend({
  name: 'LogIn',
  data: () => {
    return {
      emailAddress: '' as string,
      password: '' as string,
      emailPattern: new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,20}$/),
    }
  },
  computed: {
    isFormValid: function () {
      if (this.emailPattern.test(this.emailAddress) && this.password !== '') {
        return true
      }
      return false
    },
  },
  methods: {
    onFormSubmit: function () {
      if (!this.isFormValid) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.error,
          summary: 'Please complete all fields.',
          life: 3000,
        })
        return
      }

      this.$store
        .dispatch('login', new UserSetup(this.emailAddress, this.password))
        .then(() => {
          //Re-route to most recent view with most recent plan if available, else route to dashboard
          if (
            this.$store.getters.isCurrentPlanSet &&
            this.$store.getters.mostRecentCoreView
          ) {
            //TODO: may need to remove this as refreshing page produces potentially unexpected routing
            this.$router.replace(
              `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/${this.$store.getters.mostRecentCoreView}`
            )
          } else {
            this.$router.push('/')
          }
        })
    },
  },
})
</script>

<style lang="scss">
.logged-out-container {
  margin-top: 2rem;

  .p-field,
  .p-field > label {
    text-align: left;
  }
  .p-field .p-component {
    width: 100%;
  }
}
</style>