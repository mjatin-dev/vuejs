<template>
  <div>
    <div class="plan-settings-modal-header">
      <h2 class="p-mr-4">Plan Settings: Team</h2>
      <div>
        <!-- <Button
          v-if="canUserManagePlanUsersChannelsSubscriptions"
          label="Add Team Member"
          icon="pi pi-plus-circle"
          @click="shouldShowInviteUser = true"
        /> -->
        <Button
          @click="$emit('complete')"
          label="Close"
          class="p-button-outlined p-ml-2"
        />
      </div>
    </div>
    <div class="plan-settings-modal-content">
      <div class="users-container">
        <div class="team-title">
          <p>Add collaborators to your Plan and manage rights.</p>
        </div>

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
                class="pi pi-question-circle p-ml-2 tooltip-color"
              >
              </span>
            </span>
            <span id="budget" v-if="useBudgets">Budget</span>
            <span id="editRights"
              >Channel Edit Rights
              <span
                v-tooltip.top="channelEditRightsTooltip"
                class="pi pi-question-circle p-ml-2 tooltip-color"
              ></span>
            </span>
          </li>

          <li
            class="team-table__item"
            v-for="(userRole, index) of usersInPlan"
            :key="userRole.id.intID"
          >
            <PlanCurrentSettingsUser
              :key="index"
              :userRole="userRole"
              type="current"
            />
          </li>

          <li class="team-table__item add-user p-ai-end new-user-row">
            <div class="add-user__field" id="firstName">
              <label for="">First Name</label>
              <InputText
                class="p-inputtext"
                type="text"
                v-model="newUser.firstName"
                @change="removeUserId"
                readonly
              />
            </div>
            <div class="add-user__field" id="lastName">
              <label for="">Last Name</label>
              <InputText
                class="p-inputtext"
                type="text"
                v-model="newUser.lastName"
                @change="removeUserId"
                readonly
              />
            </div>
            <div class="add-user__field" id="email">
              <label for="">Email</label>
              <InputText
                class="p-inputtext"
                type="text"
                v-model="newUser.emailAddress"
                @change="removeUserId"
                readonly
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
            <div
              class="add-user__field col-budget"
              id="budget"
              v-if="useBudgets"
            >
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
              <Button
                class="p-button-text"
                icon="pi pi-check"
                @click="addUser"
              />
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
    </div>

    <!-- TODO: replace UserAdd.vue modal with UI for adding/inviting users from SetupTeam.vue, rename UserAdd.vue to UserAdd.deprecated.vue -->
    <Dialog
      header="Add Member"
      :visible.sync="shouldShowInviteUser"
      :modal="true"
    >
      <UserAdd
        :shouldShowAddFromAccount="true"
        @shouldHide="shouldShowInviteUser = false"
      />
    </Dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Tooltip from 'primevue/tooltip'
import Dialog from 'primevue/dialog'
import UserAdd from '@/app-shared/views/UserAdd.vue'
import Plan, {PlanType} from '@/app-shared/models/Plan'
import ID from '@/app-shared/models/ID'
import AlertMessage, {
  AlertMessageSeverity,
} from '@/app-shared/models/AlertMessage'
import Role from '@/app-shared/models/Role'
import UserRole from '@/app-shared/models/UserRole'
import User from '../models/User'
import Channel from '@/app-shared/models/Channel'
import PlanCurrentSettingsUser from '@/app-shared/views/PlanSettingsUserDetail.vue'
import ProgressSpinner from 'primevue/progressspinner'
import {fi} from 'date-fns/locale'

Vue.component('Dialog', Dialog)
Vue.component('PlanCurrentSettingsUser', PlanCurrentSettingsUser)
Vue.component('ProgressSpinner', ProgressSpinner)

export default Vue.extend({
  name: 'PlanSettingsUsers',
  directives: {
    tooltip: Tooltip,
  },
  components: {
    UserAdd,
  },
  data: () => {
    return {
      shouldShowSelectAccountUserField: true,
      shouldShowAddSelectedAccountUserButton: false,
      selectAccountUserId: {} as ID,
      shouldShowInviteUser: false,
      editingUser: false,
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
      channelList:[]
    }
  },
  computed: {
    plan(): Plan {
      return this.$store.getters.currentPlan
    },
    canUserEditPlanProperties(): boolean {
      return this.$store.getters.getPermissionLevelForPlanId(this.plan.id) <=
        Role.LEVEL_PLAN_ADMIN
        ? true
        : false
    },
    canUserManagePlanUsersChannelsSubscriptions(): boolean {
      return this.$store.getters.getPermissionLevelForPlanId(this.plan.id) <=
        Role.LEVEL_PLAN_ADMIN
        ? true
        : false
    }, 
    usersInPlan(): UserRole[] {
  

  const currentChannels = this.currentPlan.channels.filter(
        (channel) => channel.name !== 'Initiatives'
      );


      const users = this.plan.users.filter((userRole) => {
        if (userRole.planId?.intID !== 0) {
          return {
            ...userRole,
            user: this.$store.getters.currentAccountUsers.find(
              (value) => value.id.intID === userRole.userId.intID
            ),
          }
        } else {
          return false
        }
      })

      
      const newUser = users.map((item: UserRole) => {
        const items = item
        const userChannels = item.channels.map(id => id.toString());
        
        items.user = this.$store.getters.currentAccountUsers.find(
          (value) => value.id.intID === item.userId.intID
        )
        item.editingValues.channels = currentChannels.filter(channel => {
          if(userChannels.includes(channel.id.apiID)){
            return channel
          }
        });

        return items
      });
      
      return newUser
    },
    useBudgets(): boolean {
      return this.$store.getters.currentPlan.useBudgets
    },
    channels(): Channel[] {
      return this.$store.getters.currentPlan.channels.filter(
        (channel) => channel.name !== 'Initiatives'
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
    currentAccountUsers(): User[] {
      return this.$store.getters.currentAccountUsers
    },
    selectedCurrentAccountUser(): User {
      const foundUser = this.currentAccountUsers.find(
        (user) => user.id.intID === this.selectAccountUserId.intID
      )
      return foundUser ? foundUser : new User()
    },
    currentPlan(): Plan {
      return this.$store.getters.currentPlan
    },
  },
  mounted: function () {
    // Populate users from account for display in this view
    this.$store.dispatch('getUsersForCurrentAccount')
  },
  methods: {
    removeUserId() {
      this.newUser.userId = new ID()
    },
    getRoleForId(roleId: ID) {
      return this.$store.getters.allRoles.find(
        (role) => role.id.intID == roleId.intID
      )
    },
    getAccountUserForId(userId: ID): User {
      const thisUser = this.$store.getters.currentAccountUsers.find(
        (user) => user.id.intID == userId.intID
      )
      return thisUser ? thisUser : new User()
    },
    handleRemoveUserFromPlan(userRole: UserRole, event) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        target: event.currentTarget,
        message: 'Are you sure?',
        accept: () => {
          this.$store.getters.services.users.deleteUserRole(userRole.id).then(
            () => {
              this.$store.dispatch('refreshCurrentPlan')
            },
            (error) => {
              Vue.prototype.$toast.add({
                severity: AlertMessageSeverity.error,
                summary: 'Error removing user from plan.',
                detail: error,
                life: 3000,
              })
            }
          )
        },
        reject: () => {
          // Remove user rejected
        },
      })
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
            this.$store.commit('updateCurrentPlan', newPlan)
            //  this.$store.dispatch('refreshCurrentPlan')
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
                this.$store.commit('updateCurrentPlan', newPlan)
                // this.$store.dispatch('refreshCurrentPlan')
                this.resetNewUser()
                this.shouldShowSelectAccountUserField = true
              })
          })
      }
    },
    cancelAddAccountUser() {
      this.shouldShowSelectAccountUserField = true
      this.selectAccountUserId = new ID()
      this.resetNewUser()
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

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

.team-title {
  @include font-mulish-light;
  font-size: 18px;
  text-align: center;
}
</style>
