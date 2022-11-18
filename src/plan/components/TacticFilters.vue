<template>
  <Sidebar
    :visible.sync="localShowHide"
    :baseZIndex="100"
    position="right"
    class="p-sidebar-md tactic-filters-wrapper"
  >
    <div class="tactic-filters-header p-d-flex p-jc-between p-ai-center p-mr-6">
      <h2>Filters</h2>
      <Button
        v-if="$store.getters.activeFiltersCount"
        label="Clear Filters"
        @click="onClearFiltersClick"
        :badge="$store.getters.activeFiltersCount"
      />
    </div>
    <Accordion
      :multiple="true"
      class="widgets-accordion"
      :activeIndex="accordionActiveIndicies"
      @tab-open="onAccordionTabOpen"
      @tab-close="onAccordionTabClose"
    >
      <AccordionTab header="Nested Plans" v-if="currentPlan.plans.length">
        <template #default>
          <div
            v-for="(plan, index) of currentNestedPlans"
            :key="'nested_plan_' + index"
            class="p-field-checkbox p-d-flex p-jc-between"
          >
            <label :for="'nested_plan_' + index">{{ plan.name }}</label>
            <InputSwitch
              :id="'nested_plan_' + index"
              v-model="visibleNestedPlansObject[plan.id.intID]"
              @input="onInputSwitchInput($event, plan.id.intID)"
            />
          </div>
        </template>
      </AccordionTab>
      <AccordionTab header="Lead Plan" v-if="currentPlan.parentId.intID !== 0">
        <template #default>
          <div class="p-field-checkbox p-d-flex p-jc-between">
            <label for="lead_plan_hidden">{{ currentLeadPlan.name }}</label>
            <InputSwitch id="lead_plan_hidden" v-model="isLeadPlanVisible" />
          </div>
        </template>
      </AccordionTab>
      <AccordionTab header="Channels" :disabled="!currentChannelsSorted.length">
        <template #default>
          <div
            v-for="(channel, index) of currentChannelsSorted"
            :key="'channel_' + index"
            class="p-field-checkbox"
          >
            <Checkbox
              :id="'channel_' + index"
              :value="channel"
              :name="channel.name"
              v-model="selectedChannels"
              @change="onCheckboxChange"
            />
            <label
              :for="'channel_' + index"
              :class="{
                'is-lead': channel.isLead,
                'is-nested': channel.isNested,
              }"
            >
              <template v-if="isLeadPlan && channel.isNested">
                {{ channel.abbreviatedPlanName }} > {{ channel.name }}
              </template>
              <template v-else>
                {{ channel.name }}
              </template>
            </label>
          </div>
        </template>
      </AccordionTab>
      <AccordionTab
        header="Initiatives"
        :disabled="!Object.keys(categorizedInitiatives).length"
      >
        <template #default>
          <div
            v-for="(categoryName, i) in Object.keys(categorizedInitiatives)"
            :key="'category_' + i"
          >
            <div :class="{'p-mt-5': i != 0}" class="p-mb-3">
              {{ categoryName }}
            </div>
            <div
              v-for="(initiative, index) of categorizedInitiatives[
                categoryName
              ]"
              :key="'initiative_' + index"
              class="p-field-checkbox"
            >
              <Checkbox
                :id="'initiative_' + index"
                :value="initiative"
                :name="initiative.title"
                v-model="selectedInitiatives"
                @change="onCheckboxChange"
              />
              <label
                :for="'initiative_' + index"
                :class="{
                  'is-nested': initiative.isNested,
                  'is-lead': initiative.isLead,
                }"
              >
                <template v-if="isLeadPlan && initiative.isNested">
                  {{ initiative.abbreviatedPlanName }} > {{ initiative.title }}
                </template>
                <template v-else>
                  {{ initiative.title }}
                </template>
              </label>
            </div>
          </div>
        </template>
      </AccordionTab>
      <AccordionTab
        header="Strategic Priorities"
        :disabled="!Object.keys(categorizedTags).length"
      >
        <template #default>
          <div
            v-for="(categoryName, i) in Object.keys(categorizedTags)"
            :key="'tag_category_' + i"
          >
            <div :class="{'p-mt-5': i != 0}" class="p-mb-3">
              {{ categoryName }}
            </div>
            <template v-for="(tag, index) of categorizedTags[categoryName]">
              <div
                v-if="!isLeadPlan || (isLeadPlan && !tag.isNested)"
                :key="'tag_' + index"
                class="p-field-checkbox"
              >
                <Checkbox
                  :id="'tag_' + index"
                  :value="tag"
                  :name="tag.title"
                  v-model="selectedTags"
                  @change="onCheckboxChange"
                />
                <label :for="'tag_' + index">{{ tag.title }}</label>
              </div>
            </template>
          </div>
        </template>
      </AccordionTab>
      <AccordionTab
        header="Calendars of Interest"
        :disabled="!$store.getters.currentSubscriptions.length"
      >
        <template #default>
          <div
            v-for="(sub, index) of $store.getters.currentSubscriptions"
            :key="'subscription_' + index"
            class="p-field-checkbox"
          >
            <Checkbox
              :id="'subscription_' + index"
              :value="sub"
              :name="sub.name"
              v-model="selectedSubscriptions"
            />
            <label :for="'subscription_' + index">{{ sub.name }}</label>
          </div>
        </template>
      </AccordionTab>
    </Accordion>
    <!-- Saved Views feature hidden for MVP -->
    <!--
      <div class="saved-views-container">
        <h2>Saved Views</h2>
        <div
          class="saved-views-list p-mb-3"
          v-if="$store.getters.currentUser.customViews.length"
        >
          <template
            v-for="(customView, index) in $store.getters.currentUser
              .customViews"
          >
            <template v-if="isCustomViewForCurrentPlan(customView)">
              <div :key="'custom_view_' + index" class="saved-view-item p-mb-2">
                <span class="saved-view-title p-mr-2">{{
                  customView.name
                }}</span>
                <Button
                  icon="pi pi-arrow-right"
                  class="p-button-success p-mr-2"
                  @click="onClickLoadSavedView(customView)"
                />
                <Button
                  icon="pi pi-times"
                  class="p-button-danger"
                  @click="onClickDeleteSavedView(customView)"
                />
              </div>
            </template>
          </template>
        </div>
        <div v-else class="p-mb-3">
          <p>No views saved</p>
        </div>
        <div class="add-saved-view-container">
          <Inplace :active.sync="isSaveViewActive">
            <template #display>
              <Button label="Save This View" />
            </template>
            <template #content>
              <InputText v-model="saveViewName" autofocus class="p-mr-2" autocomplete="off" />
              <Button
                icon="pi pi-check"
                class="p-button-success p-mr-2"
                @click="onSaveViewConfirm"
              />
              <Button
                icon="pi pi-times"
                class="p-button-danger"
                @click="onSaveViewClose"
              />
            </template>
          </Inplace>
        </div>
      </div>
      -->
  </Sidebar>
</template>

<script lang="ts">
import Vue from 'vue'
import Checkbox from 'primevue/checkbox'
import Sidebar from 'primevue/sidebar'
import Inplace from 'primevue/inplace'
import InputText from 'primevue/inputtext'
import InputSwitch from 'primevue/inputswitch'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import CustomView from '@/app-shared/models/CustomView'
import Channel from '@/app-shared/models/Channel'
import Tactic from '@/app-shared/models/Tactic'
import Tag from '@/app-shared/models/Tag'
import Subscription from '@/app-shared/models/Subscription'
import Panel from 'primevue/panel'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Plan from '@/app-shared/models/Plan'
import ID from '@/app-shared/models/ID'

Vue.component('Checkbox', Checkbox)
Vue.component('Sidebar', Sidebar)
Vue.component('Inplace', Inplace)
Vue.component('InputText', InputText)
Vue.component('InputSwitch', InputSwitch)
Vue.component('Button', Button)
Vue.component('Panel', Panel)
Vue.component('Accordion', Accordion)
Vue.component('AccordionTab', AccordionTab)
Vue.component('Badge', Badge)

export default Vue.extend({
  name: 'TacticFilters',
  props: {
    showHide: Boolean,
  },
  data: () => {
    return {
      localSelectedChannels: [] as Channel[],
      localSelectedInitiatives: [] as Tactic[],
      localSelectedTags: [] as Tag[],
      localSelectedSubscriptions: [] as Subscription[],
      // isSaveViewActive: false as boolean,
      // saveViewName: '' as string,
    }
  },
  computed: {
    currentPlan(): Plan {
      return this.$store.getters.currentPlan
    },
    currentLeadPlan(): Plan {
      if (this.currentPlan.parentId.intID !== 0) {
        return this.$store.getters.allPlans.find(
          (plan) => plan.id.intID == this.currentPlan.parentId.intID
        )
      }
      return {} as Plan
    },
    currentNestedPlans(): Plan[] {
      return this.$store.getters.allPlans.filter((plan) =>
        this.currentPlan.plans.find((planId) => planId.intID == plan.id.intID)
          ? true
          : false
      )
    },
    isLeadPlan(): boolean {
      return this.$store.getters.currentPlan.plans.length ? true : false
    },
    currentNestedPlansFilterKey(): string {
      return 'npl-' + this.$store.getters.currentPlanIntID.toString()
    },
    currentChannelsFilterKey(): string {
      return 'ch-' + this.$store.getters.currentPlanIntID.toString()
    },
    currentInitiativesFilterKey(): string {
      return 'in-' + this.$store.getters.currentPlanIntID.toString()
    },
    currentTagsFilterKey(): string {
      return 'tg-' + this.$store.getters.currentPlanIntID.toString()
    },
    currentSubscriptionsFilterKey(): string {
      return 'sb-' + this.$store.getters.currentPlanIntID.toString()
    },
    localShowHide: {
      get(): boolean {
        return this.showHide
      },
      set(value: boolean) {
        if (!value) {
          this.$emit('shouldHide')
        }
      },
    },
    currentTagsSorted(): Tag[] {
      const localCurrentTags = [...this.$store.getters.currentTags]
      return localCurrentTags.sort((a, b) => {
        const nameA = a.text.toUpperCase()
        const nameB = b.text.toUpperCase()
        if (nameA < nameB) {
          return -1
        }
        if (nameA > nameB) {
          return 1
        }
        return 0
      })
    },
    currentChannelsSorted(): Channel[] {
      const localCurrentChannels = [...this.$store.getters.currentChannels]
      return localCurrentChannels.sort((a, b) => {
        if (a.isLead && !b.isLead) {
          return -1
        }
        if (!a.isLead && b.isLead) {
          return 1
        }
        return 0
      })
    },
    isLeadPlanVisible: {
      get(): boolean {
        return this.$store.getters.isLeadPlanVisible
      },
      set(newValue: boolean) {
        this.$store.commit('updateIsLeadPlanVisible', newValue)
      },
    },
    visibleNestedPlanIntIds: {
      get(): number[] {
        return this.$store.getters.visibleNestedPlansIntIds
      },
      set(newValue: number[]) {
        if (newValue.length == 0) {
          this.$store.commit('updateVisibleNestedPlansIntIds', [])
          window.localStorage.removeItem(this.currentNestedPlansFilterKey)
          this.$store.commit('isNestedPlanFilterActive', false)
        } else {
          this.$store.commit('updateVisibleNestedPlansIntIds', newValue)
          window.localStorage.setItem(
            this.currentNestedPlansFilterKey,
            this.$store.getters.visibleNestedPlansQueryString
          )
          this.$store.commit('isNestedPlanFilterActive', true)
        }
      },
    },
    visibleNestedPlansObject(): {} {
      const returnObj = {}
      this.currentNestedPlans.forEach((plan) => {
        returnObj[plan.id.intID] = this.visibleNestedPlanIntIds?.includes(
          plan.id.intID
        )
      })
      return returnObj
    },

    selectedChannels: {
      get(): Channel[] {
        if (this.localSelectedChannels.length) {
          return this.$store.getters.selectedChannels
        }
        return []
      },
      set(newValue: Channel[]) {
        this.localSelectedChannels = newValue
        if (newValue.length == 0) {
          this.$store.commit(
            'updateSelectedChannels',
            this.$store.getters.currentChannels
          )
          window.localStorage.removeItem(this.currentChannelsFilterKey)
          this.$store.commit('isChannelFilterActive', false)
        } else {
          this.$store.commit('updateSelectedChannels', newValue)
          window.localStorage.setItem(
            this.currentChannelsFilterKey,
            this.$store.getters.selectedChannelsQueryString
          )
          this.$store.commit('isChannelFilterActive', true)
        }
        this.manageSubscriptionFilters()
      },
    },
    selectedInitiatives: {
      get(): Tactic[] {
        if (this.localSelectedInitiatives.length) {
          return this.$store.getters.selectedInitiatives
        }
        return []
      },
      set(newValue: Tactic[]) {
        this.localSelectedInitiatives = newValue
        if (newValue.length == 0) {
          this.$store.commit(
            'updateSelectedInitiatives',
            this.$store.getters.currentInitiatives
          )
          window.localStorage.removeItem(this.currentInitiativesFilterKey)
          this.$store.commit('isInitiativeFilterActive', false)
        } else {
          this.$store.commit('updateSelectedInitiatives', newValue)
          window.localStorage.setItem(
            this.currentInitiativesFilterKey,
            this.$store.getters.selectedInitiativesQueryString
          )
          this.$store.commit('isInitiativeFilterActive', true)
        }
        this.manageSubscriptionFilters()
      },
    },
    categorizedInitiatives() {
      const initiativesByCategory = {}

      this.$store.getters.currentInitiatives.forEach((initiative: Tactic) => {
        if (initiativesByCategory[initiative.tacticTypeName]) {
          initiativesByCategory[initiative.tacticTypeName].push(initiative)
        } else {
          initiativesByCategory[initiative.tacticTypeName] = [initiative]
        }
      })

      return initiativesByCategory
    },
    categorizedTags() {
      const tagsByCategory = {}

      this.$store.getters.currentTags.forEach((tag) => {
        if (tagsByCategory[tag.type]) {
          tagsByCategory[tag.type].push(tag)
        } else {
          tagsByCategory[tag.type] = [tag]
        }
      })
      
      return tagsByCategory
    },
    selectedTags: {
      get(): Tag[] {
        if (this.localSelectedTags.length) {
          return this.$store.getters.selectedTags
        }
        return []
      },
      set(newValue: Tag[]) {
        this.localSelectedTags = newValue
        if (newValue.length == 0) {
          this.$store.commit(
            'updateSelectedTags',
            this.$store.getters.currentTags
          )
          window.localStorage.removeItem(this.currentTagsFilterKey)
          this.$store.commit('isTagFilterActive', false)
        } else {
          this.$store.commit('updateSelectedTags', newValue)
          window.localStorage.setItem(
            this.currentTagsFilterKey,
            this.$store.getters.selectedTagsQueryString
          )
          this.$store.commit('isTagFilterActive', true)
        }
        this.manageSubscriptionFilters()
      },
    },
    selectedSubscriptions: {
      get(): Subscription[] {
        if (this.localSelectedSubscriptions.length) {
          return this.$store.getters.selectedSubscriptions
        }
        return []
      },
      set(newValue: Subscription[]) {
        this.localSelectedSubscriptions = newValue
        this.manageSubscriptionFilters()
      },
    },

    accordionActiveIndicies(): number[] {
      const returnArray = [] as number[]
      this.$store.getters.currentDateRange //Hack to force computed property update when date range changes
      if (
        window.localStorage.getItem(
          'tf-channels-' + this.$store.getters.currentPlanIntID.toString()
        ) != 'false' &&
        this.$store.getters.currentChannels.length
      ) {
        returnArray.push(0)
      }
      if (
        window.localStorage.getItem(
          'tf-initiatives-' + this.$store.getters.currentPlanIntID.toString()
        ) != 'false' &&
        Object.keys(this.categorizedInitiatives).length
      ) {
        returnArray.push(1)
      }
      if (
        window.localStorage.getItem(
          'tf-strategy-' + this.$store.getters.currentPlanIntID.toString()
        ) != 'false' &&
        this.$store.getters.currentTags.length
      ) {
        returnArray.push(2)
      }
      if (
        window.localStorage.getItem(
          'tf-subscriptions-' + this.$store.getters.currentPlanIntID.toString()
        ) != 'false' &&
        this.$store.getters.currentSubscriptions.length
      ) {
        returnArray.push(3)
      }
      return returnArray
    },
    localActiveFiltersCount() {
      return (
        this.localSelectedChannels.length +
        this.localSelectedInitiatives.length +
        this.localSelectedTags.length +
        this.localSelectedSubscriptions.length
      )
    },
  },
  watch: {
    localShowHide() {
      this.updateFiltersFromGlobalStore()
    },
    localActiveFiltersCount() {
      this.$store.dispatch(
        'setActiveFiltersCount',
        this.localActiveFiltersCount.toString()
      )
    },
  },
  methods: {
    onInputSwitchInput(value, planIntId) {
      if (value) {
        this.visibleNestedPlanIntIds = [
          ...this.visibleNestedPlanIntIds,
          planIntId,
        ]
      } else {
        this.visibleNestedPlanIntIds = this.visibleNestedPlanIntIds.filter(
          (existingPlanIntId) => existingPlanIntId !== planIntId
        )
      }
      this.$forceUpdate()
    },
    onCheckboxChange() {
      // this.$forceUpdate()
    },
    isCustomViewForCurrentPlan(customView: CustomView) {
      return customView.viewConfig
        .slice(0, customView.viewConfig.indexOf('?'))
        .indexOf(this.$store.getters.currentPlanIntID.toString()) > -1
        ? true
        : false
    },
    updateFiltersFromGlobalStore() {
      if (this.$store.getters.isChannelFilterActive) {
        this.localSelectedChannels = this.$store.getters.selectedChannels
      }
      if (this.$store.getters.isInitiativeFilterActive) {
        this.localSelectedInitiatives = this.$store.getters.selectedInitiatives
      }
      if (this.$store.getters.isTagFilterActive) {
        this.localSelectedTags = this.$store.getters.selectedTags
      }
      if (this.$store.getters.isSubscriptionFilterActive) {
        this.localSelectedSubscriptions =
          this.$store.getters.selectedSubscriptions
      }
    },
    onClearFiltersClick() {
      this.isLeadPlanVisible = true
      this.visibleNestedPlanIntIds = this.currentNestedPlans.map(
        (plan) => plan.id.intID
      )
      this.selectedChannels = []
      this.selectedInitiatives = []
      this.selectedTags = []
      this.selectedSubscriptions = []
    },
    manageSubscriptionFilters() {
      if (
        this.$store.getters.isChannelFilterActive == true ||
        this.$store.getters.isInitiativeFilterActive == true ||
        this.$store.getters.isTagFilterActive == true
      ) {
        //Non-subscription filters are active
        if (this.$store.getters.isSubscriptionFilterActive == true) {
          this.setSubscriptionFilters(this.localSelectedSubscriptions)
        } else {
          this.setSubscriptionFilters([])
        }
      } else {
        //Non-subscription filters are NOT active
        if (this.$store.getters.isSubscriptionFilterActive == true) {
          if (this.localSelectedSubscriptions.length == 0) {
            this.clearSubscriptionFilters()
          } else {
            this.setSubscriptionFilters(this.localSelectedSubscriptions)
          }
        } else {
          this.setSubscriptionFilters(this.localSelectedSubscriptions)
        }
      }
    },
    clearSubscriptionFilters() {
      this.$store.commit(
        'updateSelectedSubscriptions',
        []
      )
      window.localStorage.removeItem(this.currentSubscriptionsFilterKey)
      this.$store.commit('isSubscriptionFilterActive', false)
    },
    setSubscriptionFilters(newValue: Subscription[]) {
      this.$store.commit('updateSelectedSubscriptions', newValue)
      window.localStorage.setItem(
        this.currentSubscriptionsFilterKey,
        this.$store.getters.selectedSubscriptionsQueryString
      )
      this.$store.commit('isSubscriptionFilterActive', true)
    },
    getAccordionTabNameForIndex(index: number): string {
      // TODO: update indicies if lead or nested plan
      switch (index) {
        case 0:
          return 'channels'
        case 1:
          return 'initiatives'
        case 2:
          return 'strategy'
        case 3:
          return 'subscriptions'
        default:
          return ''
      }
    },
    onAccordionTabOpen(event) {
      window.localStorage.setItem(
        'tf-' +
          this.getAccordionTabNameForIndex(event.index) +
          '-' +
          this.$store.getters.currentPlanIntID.toString(),
        'true'
      )
    },
    onAccordionTabClose(event) {
      window.localStorage.setItem(
        'tf-' +
          this.getAccordionTabNameForIndex(event.index) +
          '-' +
          this.$store.getters.currentPlanIntID.toString(),
        'false'
      )
    },
    // Saved Views feature hidden for MVP
    // onSaveViewConfirm: function () {
    //   const newCustomView = new CustomView(new ID(), this.saveViewName)
    //   newCustomView.userId = this.$store.getters.currentUser.id

    //   //Parse query string for custom view
    //   newCustomView.viewConfig = this.$route.path + '?'
    //   if (this.$store.getters.currentDateRange.length) {
    //     newCustomView.viewConfig +=
    //       'ds=' + this.$store.getters.currentDateStartQueryString
    //     newCustomView.viewConfig +=
    //       '&de=' + this.$store.getters.currentDateEndQueryString
    //   }
    //   if (
    //     this.$store.getters.isChannelFilterActive &&
    //     this.$store.getters.selectedChannels.length
    //   ) {
    //     newCustomView.viewConfig +=
    //       '&ch=' + this.$store.getters.selectedChannelsQueryString
    //   }
    //   if (
    //     this.$store.getters.isInitiativeFilterActive &&
    //     this.$store.getters.selectedInitiatives.length
    //   ) {
    //     newCustomView.viewConfig +=
    //       '&in=' + this.$store.getters.selectedInitiativesQueryString
    //   }
    //   if (
    //     this.$store.getters.isTagFilterActive &&
    //     this.$store.getters.selectedTags.length
    //   ) {
    //     newCustomView.viewConfig +=
    //       '&tg=' + this.$store.getters.selectedTagsQueryString
    //   }
    //   if (
    //     this.$store.getters.isSubscriptionFilterActive &&
    //     this.$store.getters.selectedSubscriptions.length
    //   ) {
    //     newCustomView.viewConfig +=
    //       '&sb=' + this.$store.getters.selectedSubscriptionsQueryString
    //   }

    //   this.$store.getters.services.customViews.create(newCustomView).then(
    //     (response) => {
    //       this.$store.getters.currentUser.customViews.push(response)
    //       this.onSaveViewClose()
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },
    // onSaveViewClose: function () {
    //   this.saveViewName = ''
    //   this.isSaveViewActive = false
    // },
    // onClickLoadSavedView: function (customView: CustomView) {
    //   const queryObj = {}
    //   customView.viewConfig
    //     .slice(customView.viewConfig.indexOf('?') + 1)
    //     .split('&')
    //     .forEach((varString) => {
    //       //Parse viewConfig in to object of query params (without date values)
    //       const varArray = varString.split('=')
    //       if (varArray[0] != 'ds' && varArray[0] != 'de') {
    //         queryObj[varArray[0]] = varArray[1]
    //       }
    //     })
    //   //Set filter values in local storage and then apply them
    //   this.$store.dispatch('readQueryParams', queryObj).then(() => {
    //     this.$store
    //       .dispatch('setSelectedPlanPropertiesFromLocalStorage')
    //       .then(() => {
    //         this.updateFiltersFromGlobalStore()
    //       })
    //   })
    // },
    // onClickDeleteSavedView: function (customView: CustomView) {
    //   this.$store.state.services.customViews.delete([customView.id.intID]).then(
    //     (response) => {
    //       this.$store.getters.currentUser.customViews = this.$store.getters.currentUser.customViews.filter(
    //         (item) => item.id.intID != customView.id.intID
    //       )
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.tactic-filters-wrapper {
  max-width: 28rem;

  .tactic-filters-header {
    padding: 1.6rem 1.6rem 1.6rem 1rem;
  }

  .p-panel {
    border-top: 0.2rem solid $white-smoke;

    .p-panel-header,
    .p-panel-content {
      border: 0;
      background-color: transparent;
    }
    .p-panel-header {
      padding: 1.2rem 1rem;
    }
    .p-panel-title {
      font-size: 1.4rem;
      line-height: 1.6rem;
    }
  }
  label.is-lead {
    display: flex;

    &::before {
      content: '\e925'; // pi-home
      display: inline-block;
      padding-right: 0.6rem;
      font-family: 'primeicons';
      font-size: 1.2rem;
      line-height: 1.8rem;
      speak: none;
      font-style: normal;
      font-weight: normal;
      font-variant: normal;
      text-transform: none;
    }
  }
}
.p-sidebar.p-sidebar-active {
  overflow-y: scroll;
}
.saved-views-list {
  .saved-view-title {
    font-size: 1.2rem;
    line-height: 2rem;
  }
}
.add-saved-view-container {
  .p-inplace .p-inplace-display {
    padding: 0;
  }
}

.tactic-filters-wrapper {
  .p-accordion-header {
    .p-accordion-header-link {
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      padding: 0.8rem 1.6rem 0.8rem 0.8rem;
      border-color: #f9f9f9 !important;
      background-color: #f9f9f9 !important;
    }
    .p-accordion-header-link,
    .p-accordion-header-text {
      font-size: 1.4rem;
      line-height: 1.75rem;
    }
  }
  .p-accordion-content {
    border-color: white;
  }
  .p-inputswitch {
    transform: scale(0.75);

    &.p-inputswitch-checked {
      .p-inputswitch-slider {
        background-color: $tacticColorPR;
      }
    }
    &:not(.p-disabled):hover {
      .p-inputswitch-slider {
        background-color: $tacticColorPRBkg;
      }
    }
  }
}
</style>