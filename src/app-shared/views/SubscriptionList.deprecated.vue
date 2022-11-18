<template>
  <div class="subscription-list-container">
    <DataTable
      :value="$store.getters.allSubscriptions"
      :selection.sync="localSelectedSubscriptions"
      :autoLayout="true"
      dataKey="key"
    >
      <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
      <Column field="name" header="Name" />     
    </DataTable>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Subscription from '@/app-shared/models/Subscription'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'

Vue.component('DataTable', DataTable)
Vue.component('Column', Column)

export default Vue.extend({
  name: 'SubscriptionList',
  data: () => {
    return {
      localSelectedSubscriptions: [] as Subscription[]
    }
  },
  mounted: function () {
    this.localSelectedSubscriptions = this.$store.getters.currentPlan.subscriptions

    // set up this watch after the values have been set
    // so it doesn't fire off an update on load
    this.$watch('localSelectedSubscriptions', this.onSelection);
  },
  methods: {
    onSelection() {
      //Update current plan with new subscription list
      this.$store.getters.currentPlan.subscriptions = this.localSelectedSubscriptions
      this.$store.getters.currentPlan.accountId = this.$store.getters.currentAccount.id
      this.$store.getters.services.plans
        .update(this.$store.getters.currentPlan)
        .then((plan) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.success,
            summary: 'Plan updated.',
            life: 3000,
          })
          this.$store.dispatch('updateCurrentPlan', plan)
        })
    },
  },
})
</script>

<style lang="scss">
</style>