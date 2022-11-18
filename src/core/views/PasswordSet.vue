<template>
  <div
    class="
      set-password-container
      logged-out-container
      p-d-flex p-flex-column p-jc-center p-ai-center
    "
  >
    <div class="logged-out-form">
      <!-- TODO: replace with SVG of text or import serif font -->
      <h1>Welcome to Annum</h1>
      <h2>Please set your password.</h2>
      <div class="form-container">
        <div class="p-field">
          <label for="new_password">New Password</label>
          <Password
            id="new_password"
            :feedback="true"
            v-model="newPassword"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            autocomplete="off"
          />
        </div>
        <Button @click="onSubmitClick" label="Log In" />
      </div>
      <p class="marketing-note">
        Annum's master marketing calendar is beautiful, intuitive, and provides
        universal visibility of all channels so you can see everything that's in
        market, identify opportunities and gaps, and create stronger integrated
        campaigns.
      </p>
      <img
        class="annum-logo"
        alt="Annum logo"
        src="@/assets/logo-global.jpeg"
      />
    </div>
  </div>
</template>

<script lang="ts">
// Route for testing: /set-password/1234567890/?accountId=123&planId=456&route=plan

import Vue from 'vue'
import Password from 'primevue/password'
import Button from 'primevue/button'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'

Vue.component('Password', Password)
Vue.component('Button', Button)

export default Vue.extend({
  name: 'PasswordSet',
  data: () => {
    return {
      newPassword: '' as string,
      isOnboardingFlow: false as boolean,
      isPlanFlow: false as boolean,
      accountId: null as string | null,
      planId: null as string | null,
      redirectRoute: null as string | null,
    }
  },
  computed: {
    isFormValid: function () {
      if (this.newPassword != '') {
        return true
      }
      return false
    },
  },
  created: function () {
    if (!this.$route.params.token) {
      this.$router.push('/sign-in')
    }else if(this.$route.query.accountId && this.$route.query.planId && this.$route.query.route){
      this.isOnboardingFlow = this.$route.query.route === 'onboarding' ? true : false
      this.isPlanFlow = this.$route.query.route === 'plan' ? true : false
      this.accountId = this.$route.query.accountId as string
      this.planId = this.$route.query.planId as string
    }
  },
  methods: {
    onSubmitClick: function () {
      if (!this.isFormValid) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.error,
          summary: 'Please complete all fields.',
          life: 3000,
        })
        return
      }

      this.$store.getters.services.users
        .setPassword(this.$route.params.token, this.newPassword)
        .then(
          (initialResponseObj) => {
            this.$store
              .dispatch('logInWithInitialResponse', initialResponseObj)
              .finally(() => {
                if(this.isOnboardingFlow){
                  this.$router.push(`/setup/full/${this.accountId}/${this.planId}/`)
                }else if(this.isPlanFlow){
                  this.$router.push(`/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.planId}/calendar/month`)
                }else{
                  this.$router.push('/') 
                }
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'Password saved.',
                  life: 3000,
                })
              })
          },
          (error) => {
            this.$store.getters.services.authentication.logout()
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary:
                'Error saving password. Please visit the link you received via email again.',
              life: 3000,
            })
          }
        )
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.set-password-container {
  .logged-out-form {
    max-width: 50rem;
  }
  h1 {
    @include font-playfair-bold;
    font-size: 5rem;
    margin-bottom: 5rem;
  }
  h2 {
    font-size: 2.4rem;
    margin-bottom: 4rem;
  }
  .p-password {
    padding-bottom: 4rem;
  }
  .p-button {
    margin-bottom: 3rem;
  }
  .marketing-note {
    margin-bottom: 5rem;
  }
  .annum-logo {
    max-width: 15rem;
  }
}
</style>