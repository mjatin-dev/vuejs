<template>
  <div>
    <div class="user-view">
      <div id="avatar">
        <img
          v-if="
            userRole.user && userRole.user.profileImage.fileLocation !== 'null'
          "
          :src="userRole.user.profileImage.fileLocation"
          alt=""
        />
        <div class="no-pic" v-else></div>
      </div>
      <div id="firstName" v-if="!userRole.isEditing">
        {{ userRole.user && userRole.user.firstName }}
      </div>
      <div id="lastName" v-if="!userRole.isEditing">
        {{ userRole.user && userRole.user.lastName }}
      </div>
      <div id="email" v-if="!userRole.isEditing">
        <div class="row-email">
          {{ userRole.user && userRole.user.emailAddress }}
        </div>
      </div>
      <div id="role" v-if="!userRole.isEditing">
        <span v-if="userRole.role" class="row-role">
          {{ getRoleForId(userRole.roleId.intID) }}
        </span>
      </div>
      <div id="budget" v-if="!userRole.isEditing && useBudgets">
        <div class="row-budget">
          <span v-if="userRole.canViewBudget">View</span>
          <span v-else>Hide</span>
        </div>
      </div>
      <div id="editRights " v-if="!userRole.isEditing">
        <div class="channel-edit-right">
          <div v-if="userRole.channels.length === 0">None</div>
          <div v-else-if="userRole.channels.length === maxChannelsLength">
            All
          </div>
          <div v-else>
            <span
              v-for="(channelId, channelIndex) in userRole.channels"
              :key="channelIndex"
              >{{
                getChannelForId(channelId) &&
                getChannelForId(channelId).name &&
                `${getChannelForId(channelId).name}${
                  channelIndex === userRole.channels.length - 1 ? '' : ', '
                }`
              }}
            </span>
          </div>
        </div>
      </div>

      <div
        id="toggleDropdown"
        @click="() => (userRole.isEditing = !userRole.isEditing)"
      >
        <i
          :class="`pi pi-chevron-${userRole.isEditing ? 'down' : 'right'}`"
        ></i>
      </div>
    </div>
    <div class="edit-user p-ai-center" v-if="userRole.isEditing">
      <div class="edit-user__field" id="firstName">
        <input
          class="p-inputtext"
          type="text"
          v-model="userRole.user.editingValues.firstName"
          disabled
        />
      </div>
      <div class="edit-user__field" id="lastName">
        <input
          class="p-inputtext"
          type="text"
          v-model="userRole.user.editingValues.lastName"
          disabled
        />
      </div>
      <div class="edit-user__field" id="email">
        <div class="row-email">
          <input
            class="p-inputtext"
            type="text"
            v-model="userRole.user.editingValues.emailAddress"
            disabled
          />
        </div>
      </div>
      <div class="edit-user__field" id="role">
        <div class="row-role">
          <Dropdown
            v-model="updateRole"
            :options="roles"
            optionLabel="title"
            placeholder="Select"
            :dataKey="roles"
          />
        </div>
      </div>
      <div class="edit-user__field" id="budget" v-if="useBudgets">
        <div class="row-budget">
          <Dropdown
            v-model="userRole.editingValues.canViewBudget"
            :options="budgetOptions"
            optionLabel="name"
            optionValue="code"
          
          />
        </div>
      </div>
      <div class="edit-user__field channel-right" id="editRights">
        <MultiSelect
          v-model="userRole.editingValues.channels"
          :options="channels"
          optionLabel="name"
          placeholder="Select"
          :dataKey="channels"
          class=""
        >
          <template #value="slotProps">
            <template v-if="slotProps.value.length === channels.length">
              All
            </template>
          </template>
        </MultiSelect>
      </div>
      <Button
        class="p-button-text"
        icon="pi pi-check"
        @click="() => handleEditUser(userRole)"
      />
      <Button
        v-if="isAdmin"
        class="p-button-text"
        icon="pi pi-trash"
        @click="(e) => handleDeleteUser(e, userRole)"
      />
      <Button
        v-if="userRole.user.status === 'pending'"
        :label="userRole.user.resendInvite ? 'Invite sent' : ' Resend Invite'"
        class="p-button-outlined invite-btn"
        @click="(e) => handleResendInvite(e, userRole.user)"
      />
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
  name: 'PlanSettingsUserDetail',
  props: {
    userRole: {
      type: Object,
      required: true,
    },
  },
  created() {
    this.updateRole = {
      code: this.userRole.roleId.apiID,
      title: this.$store.getters.allRoles.find(
        (role) => role.id.intID == this.userRole.roleId.intID
      ).title,
    }
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
      updateRole: {code: '', title: ''},
    }
  },
  computed: {
    currentPlan(): Plan {
      if (this.$route.path.indexOf('setup') > 0) {
        return this.$store.getters.currentSetupPlan
      } else {
        return this.$store.getters.currentPlan
      }
    },
    channels(): Channel[] {
      return this.currentPlan.channels.filter(
        (channel) => channel.name !== 'Initiatives'
      )
    },
    maxChannelsLength(): number {
      return this.currentPlan.channels.length
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
          code: role.id.apiID,
        }))
    },
    users(): UserRole[] {
      return this.currentPlan.users
    },
    useBudgets(): boolean {
      return this.currentPlan.useBudgets
    },
  },

  methods: {
    getRoleForId(roleId: ID) {
      return this.$store.getters.allRoles.find(
        (role) => role.id.intID == roleId
      ).title
    },
    getChannelForId(id) {
      const channel = id.apiID
        ? this.channels.find((channel) => channel.id.apiID === id.apiID)
        : this.channels.find((channel) => channel.id.apiID === id)

      return channel ? channel : false
    },
    handleEditUser(userRole: UserRole) {
      this.editingUser = true
      userRole.isEditing = false
      const editedUserRole = userRole.transformForEditing()

      editedUserRole.planId = this.$store.getters.currentPlan.id.intID
      editedUserRole.accountId = this.$store.getters.currentAccount.id
      editedUserRole.roleId = this.$store.getters.allRoles.find(
        (role) => role.id.apiID == this.updateRole.code
      ).id

      // this.$store.state.services.users
      //   .update(editedUserRole.user)
      //   .then(() => {
      this.$store.state.services.users
        .updateUserRole(editedUserRole)
        .then(() => {
          this.$store.dispatch('refreshCurrentPlan').then(() => {
            this.editingUser = false
          })
        })
        .catch((error) => console.warn(error))
      // })
      // .catch((error) => console.log(error))
    },
    handleDeleteUser(e, userRole: UserRole) {
      e.stopPropagation()
      const userRoleId = userRole.id.intID
      this.$store.state.services.users.deleteUserRole(userRoleId).then(() => {
        const newPlan: Plan = this.currentPlan
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