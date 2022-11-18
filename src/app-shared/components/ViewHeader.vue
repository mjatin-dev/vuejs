<template>
  <div class="view-header" :class="{'full-viewport': isFullViewport}">
    <div class="top-container p-d-flex p-jc-between">
      <div class="title-container">
        <h1>
          <span v-if="titleLabel" class="title-label">{{ titleLabel }}</span
          >{{ title }}
        </h1>
      </div>
      <div class="view-actions-container">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="section-navigation-container" v-if="!isFullViewport">
      <div class="plans-nav p-d-flex p-jc-between" v-if="isInPlansSection">
        <div class="p-d-flex">
          <router-link
            :to="`/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/calendar/day`"
            ><Button class="p-button-text" label="Day" icon="pi pi-clock"
          /></router-link>
          <router-link
            :to="`/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/calendar/month`"
            ><Button class="p-button-text" label="Month" icon="pi pi-calendar"
          /></router-link>
          <router-link
            :to="`/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/calendar/flow`"
            ><Button class="p-button-text" label="Flow" icon="pi pi-chart-bar"
          /></router-link>
          <router-link
            v-if="this.$store.getters.currentPlan.isBudgetEnabled"
            :to="`/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/budget`"
            ><Button class="p-button-text" label="Budget" icon="pi pi-dollar"
          /></router-link>
          <router-link
            :to="`/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/table`"
            ><Button class="p-button-text" label="Table" icon="pi pi-table"
          /></router-link>
          <router-link
            :to="`/account/${this.$store.getters.currentAccount.id.intID}/plan/${this.$store.getters.currentPlan.id.intID}/search`"
            ><Button class="p-button-text" label="Search" icon="pi pi-search"
          /></router-link>
          <Button
            v-if="canUserAccessPlanSettingsView"
            class="p-button-text"
            label="Plan Settings"
            icon="pi pi-cog"
            @click="
              (event) => {
                this.$refs.planSettingsMenu.toggle(event)
              }
            "
          />
          <OverlayPanel
            class="plan-settings-menu"
            ref="planSettingsMenu"
            appendTo="body"
          >
            <div class="p-d-flex p-flex-column">
              <!-- <Button
                class="p-button-text"
                label="Name and Timing"
                @click="
                  () => {
                    this.currentSettingsModal = 'metadata'
                    this.shouldShowSettingsModal = true
                    this.$refs.planSettingsMenu.hide()
                  }
                "
              /> -->
              <Button
                class="p-button-text"
                label="Channels"
                @click="
                  () => {
                    this.currentSettingsModal = 'channels'
                    this.shouldShowSettingsModal = true
                    this.$refs.planSettingsMenu.hide()
                  }
                "
              />
              <Button
                v-if="canUserAccessCalendarPlanSettings"
                class="p-button-text"
                label="Calendars of Interest"
                @click="
                  () => {
                    this.currentSettingsModal = 'subscriptions'
                    this.shouldShowSettingsModal = true
                    this.$refs.planSettingsMenu.hide()
                  }
                "
              />
              <Button
                class="p-button-text"
                label="Strategic Priorities"
                @click="
                  () => {
                    this.currentSettingsModal = 'tags'
                    this.shouldShowSettingsModal = true
                    this.$refs.planSettingsMenu.hide()
                  }
                "
              />
              <Button
                class="p-button-text"
                label="Initiatives"
                @click="
                  () => {
                    this.currentSettingsModal = 'initiatives'
                    this.shouldShowSettingsModal = true
                    this.$refs.planSettingsMenu.hide()
                  }
                "
              />
              <Button
                class="p-button-text"
                label="Budget"
                @click="
                  () => {
                    this.currentSettingsModal = 'budget'
                    this.shouldShowSettingsModal = true
                    this.$refs.planSettingsMenu.hide()
                  }
                "
              />

              <Button
                class="p-button-text"
                label="Documents"
                @click="
                  () => {
                    this.currentSettingsModal = 'documents'
                    this.shouldShowSettingsModal = true
                    this.$refs.planSettingsMenu.hide()
                  }
                "
              />
              <Button
                class="p-button-text"
                label="Team"
                @click="
                  () => {
                    this.currentSettingsModal = 'users'
                    this.shouldShowSettingsModal = true
                    this.$refs.planSettingsMenu.hide()
                  }
                "
              />
            </div>
          </OverlayPanel>
          <Button
            class="p-button-text"
            :label="roleGuideText"
            icon="pi pi-info-circle"
            @click="clickRoleGuide"
          />
        </div>
      </div>
    </div>
    <div class="view-tools-container">
      <slot></slot>
    </div>

    <Dialog
      :class="{
        'plan-settings-modal': true,
        'plan-settings-budget':
          currentSettingsModal == 'budget' ||
          currentSettingsModal == 'metadata',
      }"
      :visible.sync="shouldShowSettingsModal"
      :modal="true"
      :showHeader="false"
    >
      <PlanSettingsBudget
        v-if="currentSettingsModal == 'budget'"
        @cancel="shouldShowSettingsModal = false"
        @complete="shouldShowSettingsModal = false"
      />
      <PlanSettingsTags
        v-if="currentSettingsModal == 'tags'"
        @complete="shouldShowSettingsModal = false"
      />
      <PlanSettingsInitiatives
        v-if="currentSettingsModal == 'initiatives'"
        @complete="shouldShowSettingsModal = false"
      />
      <PlanSettingsChannels
        v-if="currentSettingsModal == 'channels'"
        @complete="shouldShowSettingsModal = false"
        @ChannelChanged="refreshView"
      />
      <PlanSetingsSubscriptions
        v-if="currentSettingsModal == 'subscriptions'"
        @complete="shouldShowSettingsModal = false"
      />
      <PlanSettingsUsers
        v-if="currentSettingsModal == 'users'"
        @complete="shouldShowSettingsModal = false"
      />

      <PlanSettingsDocuments
        v-if="currentSettingsModal == 'documents'"
        @complete="shouldShowSettingsModal = false"
      />
    </Dialog>

    <Dialog
      class="plan-settings-tutorial"
      :modal="true"
      :visible="
        !shouldShowLoadingState &&
        (viewTutorialOverride || 
        (!isAccountOwner &&
        !hideRoleTutorial &&
        viewTutorial &&
        isInPlansSection &&
        !isRoleViewed))
      "
      :showHeader="false"
    >
      <Tutorial @updateViewTutorial="updateViewTutorial" :isViewTutorialOverride="viewTutorialOverride" />
    </Dialog>
    <div v-if="shouldShowLoadingState" class="loading-state-container">
      <div class="global-init-spinner-container p-d-flex p-ai-center">
        <ProgressSpinner strokeWidth="3" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Menu from 'primevue/menu'
import OverlayPanel from 'primevue/overlaypanel'
import Role from '@/app-shared/models/Role'
import PlanSettingsBudget from '@/app-shared/views/PlanSettingsBudget.vue'
import PlanSettingsTags from '@/app-shared/views/PlanSettingsTags.vue'
import PlanSettingsInitiatives from '@/app-shared/views/PlanSettingsInitiatives.vue'
import PlanSettingsChannels from '@/app-shared/views/PlanSettingsChannels.vue'
import PlanSetingsSubscriptions from '@/app-shared/views/PlanSettingsSubscriptions.vue'
import PlanSettingsUsers from '@/app-shared/views/PlanSettingsUsers.vue'
import Tutorial from '@/app-shared/views/Tutorial.vue'
import PlanSettingsDocuments from '@/app-shared/views/PlanSettingsDocument.vue'
import UserRole from '../models/UserRole'
import Plan from '../models/Plan'

Vue.component('Button', Button)
Vue.component('Dialog', Dialog)
Vue.component('Menu', Menu)
Vue.component('OverlayPanel', OverlayPanel)

export default Vue.extend({
  name: 'ViewHeader',
  components: {
    PlanSettingsBudget,
    PlanSettingsTags,
    PlanSettingsInitiatives,
    PlanSettingsChannels,
    PlanSetingsSubscriptions,
    PlanSettingsUsers,
    Tutorial,
    PlanSettingsDocuments,
  },
  props: {
    title: String,
    titleLabel: String,
    hideSectionHomeButton: Boolean,
    isFullViewport: Boolean,
    hideRoleTutorial: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
      shouldShowSettingsModal: false as boolean,
      currentSettingsModal: '' as string,
      viewTutorial: true as boolean,
      viewTutorialOverride: false as boolean,
      shouldShowLoadingState: true as boolean,
    }
  },
  watch: {
    currentPlan(){
      // Check if currentPlan has loaded and data is ready to display - especially relevant when refreshing page while in plans section
      if(this.$route.params.planId && this.currentPlan.id?.intID !== 0){
        this.shouldShowLoadingState = false
      }
    }
  },
  computed: {
    currentPlan(): Plan {
      return this.$store.getters.currentPlan
    },
    isInPlansSection(): boolean {
      return (
        this.$route.fullPath.includes('plan') &&
        !this.$route.fullPath.includes('plans') &&
        !this.$route.fullPath.includes('initiative')
      )
    },
    canUserAccessPlanSettingsView(): boolean {
      return this.$store.getters.getPermissionLevelForPlanId(
        this.$store.getters.currentPlan.id
      ) <= Role.LEVEL_CONTRIBUTOR
        ? true
        : false
    },
    canUserAccessCalendarPlanSettings(): boolean {
      return this.$store.getters.getPermissionLevelForPlanId(
        this.$store.getters.currentPlan.id
      ) <= Role.LEVEL_PLAN_ADMIN
        ? true
        : false
    },
    roleGuideText(): string {
      if (
        this.$store.getters.currentAccountPermissionLevel ===
        Role.LEVEL_ACCOUNT_OWNER
      ) {
        return 'Role: Account Owner'
      }
      switch (
        this.$store.getters.getPermissionLevelForPlanId(
          this.$store.getters.currentPlan.id
        )
      ) {
        case Role.LEVEL_ACCOUNT_ADMIN:
        case Role.LEVEL_MASTER_PLAN_ADMIN:
        case Role.LEVEL_PLAN_ADMIN:
          return 'Role: Plan Admin'
        case Role.LEVEL_CONTRIBUTOR:
          return 'Role: Contributor'
        case Role.LEVEL_VIEWER:
          return 'Role: Viewer'
      }
      return ''
    },
    isRoleViewed(): boolean {
      if (this.$store.getters.currentUser.rolesObserved?.length) {
        if (
          this.$store.getters.currentUser.rolesObserved.filter(
            (item) =>
              item.plan === `/api/plans/${this.$store.getters.currentPlanIntID}`
          ).length > 0
        ) {
          return true
        }
          return false
      }
      return false
    },
    isAccountOwner(): boolean {
      const currentRole = Role.USER_LEVELS.find(
        (item) =>
          item.level === this.$store.getters.currentAccountPermissionLevel
      )
      return currentRole?.name === 'Account Owner' ? true : false
    },
  },
  mounted(){
    // If not loading a plan directly, hide loading spinner
    if(!this.$route.params.planId || (this.$route.params.planId && this.currentPlan.id?.intID !== 0)){
      this.shouldShowLoadingState = false
    }
  },
  methods: {
    refreshView() {
      this.$emit('ChannelChanged')
    },
    clickRoleGuide() {
      this.viewTutorialOverride = true
    },
    updateViewTutorial() {
      this.viewTutorial = false
      this.viewTutorialOverride = false
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.global-nav-collapsed {
  .view-header {
    left: $navCollapseButtonWidth;
    width: calc(
      100% - 3.2rem
    ); //TODO: should use $navCollapseButtonWidth but having issues with calc()
    transition: left 0.3s, width 0.3s;
  }
}
.view-header {
  width: 85%;
  padding: 1.6rem 2.4rem 1rem 1.6rem;
  margin-bottom: 1rem;
  position: relative;
  left: $globalNavWidth;
  transition: left 0.3s, width 0.3s;
  background: #f9f9f9;
  z-index: 3;

  &.full-viewport {
    width: 100%;
    left: 0;
    z-index: 2;

    h1 {
      margin-left: 0.8rem;
    }
  }

  .title-container {
    display: flex;
    align-items: center;
    min-height: 3.2rem;
  }
  h1 {
    margin: 0 1rem;
    font-size: 1.6rem;
    line-height: 2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .title-label {
      display: block;
      color: $dim-gray;
      font-size: 1.1rem;
      font-weight: 600;
      line-height: 1.6rem;
    }
  }
  .view-actions-container {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    flex-grow: 1;
  }
  .section-navigation-container {
    margin-top: 0.5rem;
    margin-bottom: 1rem;

    a {
      &:not(.only-exact).router-link-active,
      &.only-exact.router-link-exact-active {
        border-bottom: 0.2rem solid $black;
      }
    }
  }
  .view-tools-container {
    .p-field {
      margin-bottom: 0;
    }
  }
  .plans-nav {
    .pi-chart-bar {
      transform: rotate(90deg);
    }
  }
  .loading-state-container {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.25);
    display: flex;
    justify-content: center;
    align-items: center;

    .global-init-spinner-container {
      background-color: transparent;
    }
  }
}
.plan-settings-menu {
  .p-button-label {
    text-align: left;
  }
}
.plan-settings-modal {
  .plan-settings-modal-header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.6rem 2.4rem 1rem 1.6rem;
    background-color: #f9f9f9;

    h2 {
      margin-bottom: 0;
      font-size: 20px !important;
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
    margin: 10px 0px !important;
  }
  &.plan-settings-budget {
    .p-dialog-content {
      overflow: visible;
    }
  }
}
</style>