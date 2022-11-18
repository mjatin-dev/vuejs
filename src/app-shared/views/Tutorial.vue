<template>
  <div class="role-tutorial-container">
    <div class="close-container">
      <i class="pi pi-times" @click="viewTutorial('close')"></i>
    </div>
    <div class="plan-settings-modal-header-tutorial">
      <template v-if="roleInCurrentPlanForCurrentUser.title === 'Plan Admin'">
        <h2>Let's Get Planning</h2>
        <div class="tutorial-content">
          <p>As a Plan Admin you can configure Channels, add Calendars of Interest, turn on Budget features, enter Strategic Priorities, and add and remove Team Members.</p>
          <p>You can also add and edit Initiatives and Tactics. Click below to open our tutorial in a new tab so you can follow along while you begin planning.</p>
        </div>
      </template>
      <template v-else-if="roleInCurrentPlanForCurrentUser.title === 'Contributor'">
        <h2>Let's Get Planning</h2>
        <div class="tutorial-content">
          <p>As a Contributor you can add Initiatives and Tactics to the Plan.</p>
          <p>Click below to open our tutorial in a new tab so you can follow along<br/><br/>while you begin planning.</p>
        </div>
      </template>
      <template v-else>
        <h2>Get a Good Look</h2>
        <div class="tutorial-content">
          <p>As a Viewer you can see all Initiatives and Tactics, customize your view, and filter the data.</p>
          <p>Click below to open our tutorial in a new tab so you can follow along while you review the Plan.</p>
        </div>
      </template>

      <Button @click="viewTutorial('view')" class="view-tutorial-button"
        >View tutorial</Button
      >

      <div class="access-control">
        <p>You can access this tutorial at any time by visiting Guides under Help
          in the bottom left corner of the application or when in a Plan by
          clicking on {{roleButtonText}} in the middle top of the application.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Role from '../models/Role'

export default Vue.extend({
  name: 'Tutorial',
  props: {
    isViewTutorialOverride: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {isClicked: false}
  },
  computed: {
    roleInCurrentPlanForCurrentUser(): Role {
      const thisUserRole = this.$store.getters.currentPlan.users.find(
        (userRole) =>
          userRole.userId.intID == this.$store.getters.currentUser.id.intID
      )
      if (
        thisUserRole &&
        thisUserRole.roleId &&
        thisUserRole.roleId.intID != 0
      ) {
        return this.$store.getters.allRoles.find(
          (role) => role.id.intID == thisUserRole.roleId.intID
        )
      }
      return new Role()
    },
    roleButtonText(): string {
      switch(this.roleInCurrentPlanForCurrentUser.title){
        case 'Plan Admin':
          return 'Role: Plan Admin'
        case 'Contributor':
          return 'Role: Contributor'
        default:
          return 'Role: Viewer'
      }
    },
    tutorialUrl(): string {
      switch(this.roleInCurrentPlanForCurrentUser.title){
        case 'Plan Admin':
          return 'https://www.annumplanning.com/resources/guides/plan-admin-tutorial/'
        case 'Contributor':
          return 'https://www.annumplanning.com/resources/guides/contributor-tutorial/'
        default:
          return 'https://www.annumplanning.com/resources/guides/viewer-tutorial/'
      }
    },
  },
  methods: {
    async viewTutorial(type) {
      if(this.isViewTutorialOverride){
        if(type === 'view'){
          window.open(this.tutorialUrl, '_blank')
        }else{
          this.$emit('updateViewTutorial')
        }
        return
      }

      const payload = {
        plan: `/api/plans/${this.$store.getters.currentPlanIntID}`,
        role: `${this.roleInCurrentPlanForCurrentUser.id.apiID}`,
      }
      const response = await this.$store.state.services.plans.updateVisitedPlan(
        payload
      )
      if (response.status === 200) {
        const user = this.$store.getters.currentUser
        user.rolesObserved = response.data.rolesObserved
        this.$store.dispatch('updateCurrentUser', user)
        this.$emit('updateViewTutorial')
        type === 'view' && window.open(this.tutorialUrl, '_blank')
      }
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.role-tutorial-container {
  h2 {
    font-size: 4rem;
    font-weight: bold;
  }
  button {
    @include font-mulish-light;
    font-weight: bold;
    margin: 0 0 2rem;
  }
  .tutorial-content {
    max-width: 65rem;
    margin: 1.5rem auto 0;

    p {
      @include font-mulish-light;
      font-size: 2rem;
      font-weight: 600;
    }
  }
  .access-control {
    max-width: 40rem;
    margin: 2rem auto 6rem;

    @include font-mulish-light;
    font-size: 1.2rem;
    font-weight: 600 !important;
  }
  .close-container {
    background-color: #f9f9f9;
    text-align: right;
    padding-right: 1rem;
    padding-top: 1rem;
  }
}

.view-tutorial-button {
  margin-top: 40px;
  font-size: 15px;
}
</style>
