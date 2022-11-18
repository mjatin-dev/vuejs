<template>
  <div class="view-wrapper">
    <ViewHeader title="Plans"></ViewHeader>
    <ViewMain>
      <DataTable
        :value="currentPlans"
        class="p-mb-4"
        :loading="arePlansLoading"
      >
        <Column columnKey="name" header="Name" sortable>
          <template #body="slotProps">
            <div
              class="p-d-flex p-jc-between"
              :class="!!slotProps.data.parentId.intID ? 'p-ml-5' : ''"
            >
              <div class="p-d-flex p-ai-center">{{ slotProps.data.name }}</div>
              <Button
                label="Launch Plan"
                @click="launchPlan(slotProps.data.id)"
              ></Button>
            </div>
          </template>
        </Column>
        <template #loading>
          <h3>Loading plans...</h3>
        </template>
        <template #empty>
          <h3>No plans available.</h3>
        </template>
      </DataTable>
    </ViewMain>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ViewHeader from '@/app-shared/components/ViewHeader.vue'
import ViewMain from '@/app-shared/components/ViewMain.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ID from '@/app-shared/models/ID'

import Dialog from 'primevue/dialog'

Vue.component('Column', Column)
Vue.component('DataTable', DataTable)
Vue.component('Dialog', Dialog)

export default Vue.extend({
  name: 'PlanList',
  components: {
    ViewHeader,
    ViewMain,
  },
  computed: {
    arePlansLoading() {
      return this.$store.getters.isAccountRequestInProgress
    },
    currentPlans() {
      return this.$store.getters.allPlans.filter((plan) => {
        if (
          plan.users.filter(
            (userRole) =>
              userRole.user.id.intID == this.$store.getters.currentUser.id.intID
          ).length
        ) {
          return true
        }
        return false
      })
    },
  },
  methods: {
    launchPlan(planId: ID) {
      this.$store.dispatch('updateCurrentPlanById', planId).then(() => {
        this.$router.push(
          `/account/${this.$store.getters.currentAccount.id.intID}/plan/${planId.intID}/calendar/month`
        )
      })
    },
  },
})
</script>

<style lang="scss">
.plan-settings-tutorial {
  border: 1px solid;
  .plan-settings-modal-header-tutorial {
    position: sticky;
    top: 0;
    z-index: 1;
    text-align: center;
    align-items: center;
    padding: 5.6rem 2.4rem 1rem 1.6rem;
    background-color: #f9f9f9;

    h2 {
      margin-bottom: 0;
    }
    .p-button-outlined {
      z-index: 1; //Fixing issue with other buttons overlapping outlined buttons on initial render
    }
  }
  .plan-settings-modal-content {
    padding: 1.6rem;
  }
  .p-dialog {
    // overflow-y: scroll;
    overflow-y: visible;
    max-height: 100vh;
    width: 80%;
  }
  & > .p-dialog-content {
    padding: 0;
  }
  &.plan-settings-budget {
    .p-dialog-content {
      overflow: visible;
    }
  }
}
</style>
