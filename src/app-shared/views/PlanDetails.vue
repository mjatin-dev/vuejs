<template>
  <div>
    <div>
      <span id="firstName" v-if="plan.isEditing">{{ plan.name }}</span>
      <span v-else>-</span>
    </div>
    <div>
      <span id="role">-</span>
    </div>
    <div id="budget">
      <div v-if="plan.user[0].canViewBudget">
        <span v-if="plan.useBudgets">View</span>
        <span v-else>Hide</span>
      </div>
      <div v-else>
        <span>-</span>
      </div>
    </div>
    <div>
      <span id="editRights">{{ plan.name }}</span>
    </div>
    <div>
      <span id="editRights">
        <i
          class="pi pi-pencil p-mr-2"
          @click="() => (plan.isEditing = !plan.isEditing)" />
        <i class="pi pi-trash delete-icon"
      /></span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ID from '@/app-shared/models/ID'
import Role from '@/app-shared/models/Role'
import Channel from '@/app-shared/models/Channel'
import Plan from '@/app-shared/models/Plan'
import UserRole from '@/app-shared/models/UserRole'
import User from '@/app-shared/models/User'

export default Vue.extend({
  name: 'PlanDetails',
  props: {
    plan: Plan,
  },
  data() {
    return {
      budgetOptions: [
        {
          name: 'Hide',
          code: false,
        },
        {
          name: 'View',
          code: true,
        },
      ],
      editingUser: false,
    }
  },
  computed: {
    currentPlan(): Plan {
      return this.$store.getters.currentSetupPlan
    },
    channels(): Channel[] {
      return this.$store.getters.currentSetupPlan.channels.filter(
        (channel) => channel.name !== 'Initiatives'
      )
    },
    maxChannelsLength(): number {
      return this.$store.getters.currentSetupPlan.channels.length
    },
    isAdmin(): boolean {
      return (
        this.$store.getters.currentAccountPermissionLevel ==
          Role.LEVEL_ACCOUNT_ADMIN ||
        this.$store.getters.currentAccountPermissionLevel ==
          Role.LEVEL_ACCOUNT_OWNER
      )
    },
    roles(): {}[] {
      return this.$store.getters.allRoles
        .filter((role) => role.level >= 250)
        .map((role) => ({
          title: role.title,
          code: role.id,
        }))
    },
    users(): UserRole[] {
      return this.$store.getters.currentSetupPlan.users
    },
    useBudgets(): boolean {
      return this.$store.state.currentSetupPlan.useBudgets
    },
  },

  methods: {
    getChannelForId(id: ID) {
      return this.channels.find((channel) => channel.id.intID === id.intID)
    },
    handleEditUser(userRole: UserRole) {
      this.editingUser = true
      userRole.isEditing = false
      const editedUserRole = userRole.transformForEditing()
      editedUserRole.planId = this.currentPlan.id
      editedUserRole.accountId = this.$store.getters.currentAccount.id
      this.$store.state.services.users.update(editedUserRole.user).then(() => {
        this.$store.state.services.users
          .updateUserRole(editedUserRole)
          .then(() => {
            this.editingUser = false
          })
      })
    },
    handleDeleteUser(e, userRole: UserRole) {
      e.stopPropagation()
      const userRoleId = userRole.id.intID
      this.$store.state.services.users.deleteUserRole(userRoleId).then(() => {
        const newPlan: Plan = this.$store.getters.currentSetupPlan
        newPlan.users = this.users.filter((el) => el.id.intID !== userRoleId)
        this.$store.dispatch('updateCurrentPlan', newPlan)
      })
    },
    handleResendInvite(e, user: User) {
      e.stopPropagation()
      if (!user.resendInvite) {
        user.resendInvite = true
        this.$store.getters.services.users.resendInvite(user.id.intID)
      }
    },
    getRoleForId(roleId: ID) {
      return this.$store.getters.allRoles.find(
        (role) => role.id.intID == roleId
      ).title
    },
  },
})
</script>

<style lang="scss">
.row-email {
  padding-left: 4px;

  max-width: 180px;
  position: relative;
  word-break: break-word;
}
.row-role {
  padding-left: 4px;
}
.row-budget {
  padding-left: 7px;
}
.row-edit-right {
  padding-left: 7px;
}
.channel-edit-right {
  padding-left: 7px !important;
  max-width: 210px;
}
.channel-right {
  padding-left: 7px;
}

//Buttons
.p-button {
  border-radius: 0.4rem;

  &.p-button-text,
  &.p-button-outlined {
    // padding: 0.8rem 0.2rem;
  }

  .p-button-icon-left {
    margin-right: 0.8rem;
    margin-left: -0.4rem;
  }
  .p-button-icon-right {
    margin-right: -0.4rem;
    margin-left: 0.8rem;
  }
}
.invite-btn {
  padding: 0.8rem 0.2rem !important;
}
</style>