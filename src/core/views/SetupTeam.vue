<template>
  <div class="setup-content setup-team-step">
    <div class="title-container">
      <h1>Team</h1>
      <h2>Add collaborators to your Plan and manage rights.</h2>
    </div>

    <div>
      <ul class="team-table">
        <div v-if="editingUser" class="team-table__edit-overlay">
          <div class="spinner">
            <ProgressSpinner strokeWidth="3" />
          </div>
        </div>
        <li class="team-table__head">
          <span id="firstName">First Name</span>
          <span id="lastName">Last Name</span>
          <span id="email">Email</span>
          <span id="role"
            >Role
            <span
              v-tooltip.top="roleTooltip"
              class="pi pi-question-circle p-ml-2"
            >
            </span>
          </span>
          <span id="budget" v-if="useBudgets">Budget</span>
          <span id="editRights"
            >Channel Edit Rights
            <span
              v-tooltip.top="channelEditRightsTooltip"
              class="pi pi-question-circle p-ml-2"
            ></span>
          </span>
        </li>

        <li
          class="team-table__item"
          v-for="(userRole, index) of userRoles"
          :key="userRole.id.intID"
        >
          <PlanSettingsUserDetail :key="index" :userRole="userRole" />
        </li>
        <li class="team-table__item add-user p-ai-end new-user-row">
          <div class="add-user__field" id="firstName">
            <label for="">First Name</label>
            <InputText
              class="p-inputtext"
              type="text"
              v-model="newUser.firstName"
              @change="removeUserId"
            />
          </div>
          <div class="add-user__field" id="lastName">
            <label for="">Last Name</label>
            <InputText
              class="p-inputtext"
              type="text"
              v-model="newUser.lastName"
              @change="removeUserId"
            />
          </div>
          <div class="add-user__field" id="email">
            <label for="">Email</label>
            <InputText
              class="p-inputtext"
              type="text"
              v-model="newUser.emailAddress"
              @change="removeUserId"
            />
          </div>
          <div class="add-user__field" id="role">
            <label for=""
              >Role
              <span
                v-tooltip.top="roleTooltip"
                class="pi pi-question-circle p-ml-2"
              >
              </span>
            </label>
            <Dropdown
              v-model="newUser.role"
              :options="roles"
              optionLabel="title"
              placeholder="Select"
              @change="onNewUserRoleChange"
            />
          </div>
          <div class="add-user__field col-budget" id="budget" v-if="useBudgets">
            <label for="">Budget</label>
            <Dropdown
              v-model="newUser.canViewBudget"
              :options="budgetOptions"
              optionLabel="name"
              optionValue="code"
            />
          </div>
          <div class="add-user__field col-edit-right" id="editRights">
            <label for=""
              >Channel Edit Rights
              <span
                v-tooltip.top="channelEditRightsTooltip"
                class="pi pi-question-circle p-ml-2"
              ></span>
            </label>
            <MultiSelect
              v-model="newUser.channels"
              :options="channels"
              dataKey="key"
              optionLabel="name"
              placeholder="Select"
              :disabled="newUser.role.code.intID === 6"
              :class="{
                'all-items-selected':
                  newUser.channels.length === channels.length,
              }"
            >
              <template #value="slotProps">
                <template v-if="slotProps.value.length === channels.length">
                  All
                </template>
              </template>
            </MultiSelect>
          </div>
          <div v-if="!shouldShowSelectAccountUserField">
            <Button class="p-button-text" icon="pi pi-check" @click="addUser" />
            <Button
              class="p-button-text"
              icon="pi pi-times"
              @click="cancelAddAccountUser"
            />
          </div>
          <Button
            v-else
            label="Add Team Member"
            class="p-button-text"
            icon="pi pi-plus-circle"
            @click="addUser"
          />
        </li>
        <li
          class="team-table__item p-d-flex p-flex-row p-ai-center"
          v-if="shouldShowSelectAccountUserField"
        >
          <Dropdown
            v-model="selectAccountUserId"
            :options="currentAccountUsers"
            :filter="true"
            dataKey="key"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Select From Account"
            filterPlaceholder="Search By Name"
            @change="selectAccount"
          />
          <Button
            v-if="shouldShowAddSelectedAccountUserButton"
            label="Add User"
            class="p-button-text p-ml-4 addUserBtn"
            icon="pi pi-plus-circle"
            @click="addSelectedAccountUser"
          />
        </li>
      </ul>
    </div>

    <div class="actions-container">
      <Button
        @click="handleClickContinue"
        class="onboarding-button-style"
        label="Continue"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Tooltip from 'primevue/tooltip'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Listbox from 'primevue/listbox'
import MultiSelect from 'primevue/multiselect'
import ProgressSpinner from 'primevue/progressspinner'
import InputText from 'primevue/inputtext'
import Plan from '@/app-shared/models/Plan'
import UserRole from '@/app-shared/models/UserRole'
import User from '@/app-shared/models/User'
import ID from '@/app-shared/models/ID'
import Role from '@/app-shared/models/Role'
import Channel from '@/app-shared/models/Channel'
import PlanSettingsUserDetail from '@/app-shared/views/PlanSettingsUserDetail.vue'
Vue.component('Button', Button)
Vue.component('Dropdown', Dropdown)
Vue.component('Listbox', Listbox)
Vue.component('MultiSelect', MultiSelect)
Vue.component('ProgressSpinner', ProgressSpinner)
Vue.component('InputText', InputText)
Vue.component('PlanSettingsUserDetail', PlanSettingsUserDetail)
export default Vue.extend({
  name: 'SetupTeam',
  directives: {
    tooltip: Tooltip,
  },
  data() {
    return {
      accountSearchText: '',
      localUsers: [],
      newUser: {
        firstName: '',
        lastName: '',
        emailAddress: '',
        role: {
          title: '',
          code: new ID(),
        },
        canViewBudget: true,
        channels: [] as Channel[],
        userId: new ID(),
      },
      selectAccountUserId: {} as ID,
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
      shouldShowSelectAccountUserField: true,
      shouldShowAddSelectedAccountUserButton: false,
      channelEditRightsTooltip: `Assign channel edit rights when you want to ensure team members only plan within their designated channels.<br>
        When you give a team member edit rights to a specific channel, they can add and edit tactics in that channel but can only view tactics in the other channels.`,
      roleTooltip: `Account Owner
        - Manages subscriptions and billing
        Plan Admin
        - Establishes marketing channels and tactic types
        - Enters strategic priorities
        - Manages team members
        - Sets budget
        - Adds custom calendars of interest
        Contributor
        - Adds and edits initiatives
        - Adds and edits tactics
        Viewer
        - Views and filters data`,
    }
  },
  computed: {
    userRoles(): {}[] {
      return this.$store.getters.currentSetupPlan.users.map((userRole) => {
        const role = this.roles.find(
          (role) => role['code'].intID === userRole.roleId.intID
        )
        userRole.role = role
        userRole.editingValues.role = role
        return userRole
      })
    },
    isAdmin(): boolean {
      return (
        this.$store.getters.currentAccountPermissionLevel ==
        Role.LEVEL_ACCOUNT_ADMIN
      )
    },
    currentPlan(): Plan {
      return this.$store.getters.currentSetupPlan
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
    channels(): Channel[] {
      return this.$store.getters.currentSetupPlan.channels.filter(
        (channel) => channel.name !== 'Initiatives'
      )
    },
    maxChannelsLength(): number {
      return this.$store.getters.currentSetupPlan.channels.length
    },
    currentAccountUsers(): User[] {
      return this.$store.getters.currentAccountUsers
    },
    selectedCurrentAccountUser(): User {
      const foundUser = this.currentAccountUsers.find(
        (user) => user.id.intID === this.selectAccountUserId.intID
      )
      return foundUser ? foundUser : new User()
    },
    useBudgets(): boolean {
      return this.$store.state.currentSetupPlan.useBudgets
    },
  },
  mounted() {
    // Populate editing values in UserRoles
    this.$store.getters.currentSetupPlan.users.forEach((userRole) => {
      userRole.editingValues.channels = [...userRole.channels]
    })
  },
  methods: {
    getChannelForId(id: ID) {
      return this.channels.find((channel) => channel.id.intID === id.intID)
    },
    removeUserId() {
      this.newUser.userId = new ID()
    },
    resetNewUser() {
      this.newUser = {
        firstName: '',
        lastName: '',
        emailAddress: '',
        role: {
          title: '',
          code: new ID(),
        },
        canViewBudget: false,
        channels: [],
        userId: new ID(),
      }
      this.selectAccountUserId = new ID()
    },
    addUser() {
      const isAddingAccountUser = this.newUser.userId.intID !== 0
      const role = this.$store.getters.allRoles.find(
        (el) => el.id.intID === this.newUser.role.code.intID
      )
      if (isAddingAccountUser) {
        const newUserRole = UserRole.fromResponseObject({
          canViewBudget: this.newUser.canViewBudget,
        })
        newUserRole.channels = this.newUser.channels.map(
          (channel) => channel.id
        )
        newUserRole.roleId = role.id
        newUserRole.userId = this.newUser.userId
        newUserRole.planId = this.currentPlan.id
        newUserRole.accountId = this.$store.getters.currentAccount.id
        this.$store.getters.services.users
          .createUserRole(newUserRole)
          .then((newDbUserRole) => {
            const newPlan = this.currentPlan
            newPlan.users.push(newDbUserRole)
            this.$store.commit('updateCurrentSetupPlan', newPlan)
            this.resetNewUser()
            this.shouldShowSelectAccountUserField = true
          })
      } else {
        const newUser = User.fromResponseObject({
          firstName: this.newUser.firstName,
          lastName: this.newUser.lastName,
          emailAddress: this.newUser.emailAddress,
          status: 'pending',
        })
        this.$store.getters.services.users
          .create(newUser)
          .then((newDbUser: User) => {
            const newUserRole = UserRole.fromResponseObject({
              canViewBudget: this.newUser.canViewBudget,
            })
            newUserRole.channels = this.newUser.channels.map(
              (channel) => channel.id
            )
            newUserRole.roleId = role.id
            newUserRole.userId = newDbUser.id
            newUserRole.planId = this.currentPlan.id
            newUserRole.accountId = this.$store.getters.currentAccount.id
            this.$store.getters.services.users
              .createUserRole(newUserRole)
              .then((newDbUserRole: UserRole) => {
                const newPlan = this.currentPlan
                newPlan.users.push(newDbUserRole)
                this.$store.commit('updateCurrentSetupPlan', newPlan)
                this.resetNewUser()
                this.shouldShowSelectAccountUserField = true
              })
          })
      }
    },
    selectAccount() {
      this.shouldShowAddSelectedAccountUserButton = true
    },
    addSelectedAccountUser() {
      this.shouldShowSelectAccountUserField = false
      this.shouldShowAddSelectedAccountUserButton = false
      this.newUser.firstName = this.selectedCurrentAccountUser.firstName
        ? this.selectedCurrentAccountUser.firstName
        : ''
      this.newUser.lastName = this.selectedCurrentAccountUser.lastName
        ? this.selectedCurrentAccountUser.lastName
        : ''
      this.newUser.emailAddress = this.selectedCurrentAccountUser.emailAddress
        ? this.selectedCurrentAccountUser.emailAddress
        : ''
      this.newUser.userId =
        this.selectedCurrentAccountUser.id.intID !== 0
          ? this.selectedCurrentAccountUser.id
          : new ID()
    },
    cancelAddAccountUser() {
      this.shouldShowSelectAccountUserField = true
      this.selectAccountUserId = new ID()
      this.resetNewUser()
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
    handleResendInvite(e, user: User) {
      e.stopPropagation()
      if (!user.resendInvite) {
        user.resendInvite = true
        this.$store.getters.services.users.resendInvite(user.id.intID)
      }
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
    handleClickContinue() {
      this.$emit('setup-step-complete')
    },
    onNewUserRoleChange(event) {
      switch (event?.value?.code?.intID) {
        case 4:
        case 5:
          // Plan Admin (4) or Contributor (5) role selected
          if (!this.newUser.channels.length) {
            this.newUser.channels = this.channels
          }
          break
        case 6:
          // Viewer role selected
          this.newUser.channels = []
          break
        default:
          // Do nothing
          break
      }
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';
.setup-team-step {
  .title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    h1 {
      @include font-mulish-light;
      font-size: 32px;
      margin-bottom: 10px;
    }
    h2 {
      @include font-mulish-light;
      font-size: 22px;
    }
  }
  .team-table {
    position: relative;
    @include font-mulish-light;
    &__edit-overlay {
      position: absolute;
      left: -10px;
      top: 0;
      bottom: 0;
      right: 0;
      background-color: rgba($color: lightgray, $alpha: 0.4);
      z-index: 9;
      .spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
    &__head {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 5px 10px;
      display: flex;
      flex-direction: row;
      font-weight: 400;
    }
    &__item {
      padding: 15px 20px 15px 10px;
      position: relative;
      display: flex;
      flex-direction: column;
      font-size: 14px;
      border-bottom: 2px solid gray;
      &:last-child {
        border-bottom: none;
      }
      .addUserBtn {
        padding: 10px !important;
      }
      .user-view {
        width: 100%;
        display: flex;
        flex-direction: row;
      }
      #avatar {
        position: absolute;
        left: -50px;
        top: 5px;
        height: 40px;
        aspect-ratio: 1;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
      .search-field {
        position: relative;
        width: 20%;
        .p-inputtext {
          width: 100%;
        }
        .pi {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
        }
        .p-listbox {
          width: 100% !important;
          position: absolute;
          z-index: 2;
        }
      }
      // &:last-child {
      //   .p-dropdown {
      //     width: 20%;
      //   }
      // }
    }
    #firstName {
      width: 10%;
    }
    #lastName {
      width: 15%;
    }
    #email {
      width: 22%;
    }
    #role {
      width: 15%;
    }
    #budget {
      width: 10%;
    }
    #editRights {
      width: 15%;
    }
    #toggleDropdown {
      position: absolute;
      right: 0;
      display: flex;
      justify-content: flex-end;
      gap: 5px;
      align-items: center;
      cursor: pointer;
      i {
        font-size: 1rem;
      }
    }
    .edit-user,
    .add-user {
      border-color: transparent;
      // padding: 10px 0 10px 10px;
      display: flex;
      flex-direction: row;
      label {
        margin-bottom: 8px;
        font-size: 11px;
        @include font-mulish-light;
      }
      .p-button-text {
        @include font-mulish-light;
        padding-left: 4px;
        padding-right: 5px;
        padding-bottom: 3px;
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        .pi-plus-circle {
          margin-right: 3px;
        }
      }
      &__field {
        padding-right: 15px;
        display: flex;
        flex-direction: column;
      }
      #addUser,
      #editUser {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        padding-bottom: 5px;
        gap: 5px;
        cursor: pointer;
        i {
          font-size: 12px;
        }
        span {
          width: max-content;
        }
      }
    }
  }
  .no-pic {
    width: 100%;
    height: 100%;
    background-color: lightgrey;
  }
  .team-info-text {
    @include font-mulish-light;
    padding-left: 42px;
    font-size: 11px;
    transform: translateY(-15px);
    font-weight: 300;
    margin-bottom: 20px;
  }
  .p-multiselect {
    &.all-items-selected {
      .p-multiselect-panel {
        .p-multiselect-header {
          background-color: #bfbfbf;
        }
      }
    }
  }
}
.actions-container {
  .continue-button {
    @include font-mulish-light;
    width: 145px !important;
    font-size: 16px !important;
    color: #ffffff !important;
  }
}
.col-email {
  margin-left: 3px;
}

.new-user-row {
  padding: 15px 10px 15px 10px !important;
}
</style>
