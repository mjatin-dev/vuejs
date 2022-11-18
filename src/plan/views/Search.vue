<template>
  <div class="view-wrapper search-view">
    <ViewHeader :title="this.$store.getters.currentPlan.name">
      <template>
        <form @submit.prevent="submitSearchInput">
          <div class="p-field">
            <label for="search">Search Keyword</label>
            <span class="p-input-icon-right">
              <i class="pi pi-search" @click="submitSearchInput" />
              <InputText
                id="search"
                type="text"
                placeholder="Search"
                v-model="searchInput"
                autocomplete="off"
              />
            </span>
          </div>
        </form>
      </template>
    </ViewHeader>
    <ViewMain>
      <div class="p-field">
        <label>View</label>
        <div class="p-buttonset">
          <Button
            label="Upcoming"
            @click="() => (this.isShowingUpcomingResults = true)"
            :disabled="this.isShowingUpcomingResults"
          />
          <Button
            label="Past"
            @click="() => (this.isShowingUpcomingResults = false)"
            :disabled="!this.isShowingUpcomingResults"
          />
        </div>
      </div>
      <DataTable :value="filteredResults" v-if="filteredResults.length">
        <Column field="startDate" header="Start Date" sortable>
          <template #body="slotProps">{{
            slotProps.data.startDate.toLocaleDateString()
          }}</template>
        </Column>
        <Column field="endDate" header="End Date" sortable>
          <template #body="slotProps">{{
            slotProps.data.endDate.toLocaleDateString()
          }}</template>
        </Column>
        <Column field="channelName" header="Channel" sortable />
        <Column field="tacticTypeName" header="Type" sortable />
        <Column header="Platform" sortable>
          <template #body="slotProps">
            {{ getPlatformNameForTactic(slotProps.data) }}
          </template>
        </Column>
        <Column field="title" header="Topic" sortable>
          <template #body="slotProps">
            <span
              :class="{
                'is-nested': slotProps.data.isNested,
                'is-lead': slotProps.data.isLead,
              }"
            >
              {{ getTitleForTactic(slotProps.data) }}
            </span>
          </template>
        </Column>
        <Column>
          <template #body="slotProps">
            <div
              class="p-d-flex p-jc-end"
              v-if="
                !slotProps.data.isInitiative &&
                ((isLeadPlan && slotProps.data.isLead) ||
                (!isLeadPlan && !slotProps.data.isLead))
              "
            >
              <Button
                type="button"
                label="Open"
                icon="pi pi-arrow-circle-up"
                class="p-button-text"
                @click="showTactic(slotProps.data)"
              ></Button>
            </div>
          </template>
        </Column>
      </DataTable>
      <template v-else>
        <template v-if="this.isLoadingResults">
          <h2>Searching tactics...</h2>
        </template>
        <template v-else-if="this.searchQuery && this.searchQuery != ''">
          <h2>No results.</h2>
        </template>
        <template v-else>
          <h2>Please enter a keyword.</h2>
        </template>
      </template>
    </ViewMain>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ViewHeader from '@/app-shared/components/ViewHeader.vue'
import ViewMain from '@/app-shared/components/ViewMain.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tactic from '@/app-shared/models/Tactic'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Button from 'primevue/button'

Vue.component('DataTable', DataTable)
Vue.component('Column', Column)
Vue.component('Button', Button)

export default Vue.extend({
  name: 'Search',
  components: {
    ViewHeader,
    ViewMain,
  },
  props: {
    searchQuery: String,
  },
  data: () => {
    return {
      allSearchResultTactics: [] as Tactic[],
      isShowingUpcomingResults: true as boolean,
      isLoadingResults: false as boolean,
      nowDate: new Date(),
      searchInput: '' as string,
    }
  },
  computed: {
    allSearchResultTacticIntIds(): number[] {
      return this.allSearchResultTactics.map((tactic) => tactic.id.intID)
    },
    filteredResults(): Tactic[] {
      if (this.isShowingUpcomingResults) {
        return this.$store.getters.currentPlan.tactics.filter((tactic) => {
          if (
            this.allSearchResultTacticIntIds.indexOf(tactic.id.intID) > -1 &&
            tactic.endDate >= this.nowDate
          ) {
            return tactic
          }
        })
      } else {
        return this.$store.getters.currentPlan.tactics.filter((tactic) => {
          if (
            this.allSearchResultTacticIntIds.indexOf(tactic.id.intID) > -1 &&
            tactic.endDate <= this.nowDate
          ) {
            return tactic
          }
        })
      }
    },
    isLeadPlan(): boolean {
      return this.$store.getters.currentPlan.plans.length ? true : false
    },
    isNestedPlan(): boolean {
      return this.$store.getters.currentPlan.parentId.intID !== 0 ? true : false
    },
  },
  mounted: function () {
    //Set date range for search to one year on either side of current date
    const startDate = new Date()
    startDate.setFullYear(this.nowDate.getFullYear() - 1)
    const endDate = new Date()
    endDate.setFullYear(this.nowDate.getFullYear() + 1)

    //Get search results
    if (this.searchQuery && this.searchQuery != '') {
      this.isLoadingResults = true
      const isWidesearch = this.isLeadPlan || this.isNestedPlan ? true : false
      this.$store.getters.services.tactics
        .search(this.$route.params.planId, this.searchQuery, isWidesearch, startDate, endDate)
        .then(
          (tactics) => {
            this.allSearchResultTactics = tactics
            this.searchInput = this.searchQuery
            this.isLoadingResults = false
          },
          (error) => {
            this.isLoadingResults = false
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: error,
              life: 3000,
            })
          }
        )
    }
  },
  methods: {
    showTactic: function (data) {
      this.$router.push({path: 'tactic/' + data.id.intID})
    },
    submitSearchInput: function () {
      // TODO: refactor to make search API call here
      this.$router.push({
        path: `/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/search`,
        query: {q: this.searchInput},
      })
    },
    getPlatformNameForTactic(tactic: Tactic) {
      let returnString = ''
      if (tactic.tacticPlatforms && tactic.tacticPlatforms.length) {
        tactic.tacticPlatforms.forEach((platformOnTactic)=>{
          returnString += this.$store.getters.currentPlan.tacticPlatforms.find(
            (platform) => platform.id.intID === platformOnTactic.id.intID
          )?.name + ' '
        })
      }
      return returnString
    },
    getTitleForTactic(tactic: Tactic) {
      let returnString = tactic.title
      if (this.isLeadPlan && tactic.abbreviatedPlanName !== '') {
        if (returnString.length > 0) {
          returnString = tactic.abbreviatedPlanName + ' > ' + returnString
        } else {
          returnString = tactic.abbreviatedPlanName
        }
      }
      return returnString
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.search-view {
  .p-buttonset {
    .p-button {
      border-color: #efefef;
      background-color: #efefef;
      color: #333333;

      &:disabled {
        border-color: #000000;
        background-color: #000000;
        color: #ffffff;
        opacity: 1;
      }
    }
  }
  .p-datatable-wrapper span.is-lead {
    display: flex;
    column-gap: 1rem;

    &::before {
      content: '\e925'; // pi-home
      display: block;
      font-family: 'primeicons';
      font-size: 1.6rem;
      speak: none;
      font-style: normal;
      font-weight: normal;
      font-variant: normal;
      text-transform: none;
    }
  }
}
</style>