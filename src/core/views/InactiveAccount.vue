<template>
  <div
    class="logged-out-container p-d-flex p-flex-column p-jc-center p-ai-center"
  >
    <h1>Inactive Account</h1>
    <p>
      The subscription for the
      {{ $store.getters.currentAccount.contactCompanyName }} account has
      expired. Please contact
      <a href="mailto:hello@annumplanning.com" class="email-link"
        >hello@annumplanning.com</a
      >
      to reinstate the account.
    </p>
    <div class="accounts-container">
      <h2>Or, switch to one of the following accounts:</h2>
      <div
        v-for="account of $store.getters.allAccounts"
        :key="account.id.intID"
        class="p-d-flex p-ai-center p-jc-between p-mb-2"
      >
        <h4 style="margin-bottom: 0" class="p-mr-3">
          {{
            account.contactCompanyName == ''
              ? 'Account ' + account.id.intID
              : account.contactCompanyName
          }}
        </h4>
        <Button
          v-if="account.id.intID !== $store.getters.currentAccount.id.intID"
          icon="pi pi-arrow-right"
          @click="clickSwitchAccount(account)"
          :disabled="!account.isActive"
        ></Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'InactiveAccount',
  methods: {
    clickSwitchAccount(account) {
      this.$store.dispatch('switchAccount', account.id.intID).then(() => {
        this.$router.replace('/plans')
      })
    },
  },
})
</script>

<style lang="scss">
.logged-out-container {
  margin-top: 2rem;

  .accounts-container {
    margin-top: 4rem;
  }
}
</style>