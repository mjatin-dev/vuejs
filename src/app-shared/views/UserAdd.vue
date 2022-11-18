<template>
  <div class="user-add-container">
    <TabView v-if="shouldShowAddFromAccount">
      <TabPanel>
        <template #header>
          <Button
            class="p-button-text"
            label="Add Team Member"
            icon="pi pi-users"
          />
        </template>
        <template #default>
          <DataTable
            :value="usersInAccount"
            :autoLayout="true"
            sortField="user.firstName"
            :sortOrder="1"
          >
            <Column field="user.firstName" header="Name">
              <template #body="slotProps">
                {{ getAccountUserForId(slotProps.data.user.id).firstName }}
                {{ getAccountUserForId(slotProps.data.user.id).lastName }}
              </template>
            </Column>
            <Column field="user.emailAddress" header="Email">
              <template #body="slotProps">
                {{ getAccountUserForId(slotProps.data.user.id).emailAddress }}
              </template>
            </Column>
            <Column header="Role">
              <template #body="slotProps">
                <Dropdown
                  v-model="accountUserSelectedRoles[slotProps.data.id.intID]"
                  :options="roleOptions"
                  optionLabel="label"
                  optionValue="value"
                  dataKey="key"
                  placeholder="Select Role"
                  id="role"
                  :class="{
                    'has-error': accountUserErrantRows.includes(
                      slotProps.data.id.intID
                    ),
                  }"
                />
              </template>
            </Column>
            <!-- <Column header="View Budget">
              <template #body="slotProps">
                <InputSwitch 
                  id="canViewBudget"
                  v-model="canViewBudgetSelection"
                />
              </template>
            </Column> -->
            <!-- <Column header="Channel Edit Rights">
              <template #body="slotProps">

              </template>
            </Column> -->

            <Column>
              <template #body="slotProps">
                <div class="p-d-flex p-jc-end">
                  <Button
                    label="Add"
                    icon="pi pi-plus"
                    class="p-button-text"
                    @click="() => handleAddAccountUserToPlan(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
            <template #empty>
              <div class="empty-table">
                <h3>No Team Members to Add</h3>
              </div>
            </template>
          </DataTable>
        </template>
      </TabPanel>
      <TabPanel>
        <template #header>
          <Button
            class="p-button-text"
            label="Invite New Team Member"
            icon="pi pi-user-plus"
          />
        </template>
        <template #default>
          <div class="p-d-flex p-my-4">
            <div class="p-field p-mr-4">
              <label for="firstName">First Name</label>
              <InputText
                id="firstName"
                type="text"
                v-model="localFirstName"
                autocomplete="off"
                tabindex="1"
              />
            </div>
            <div class="p-field">
              <label for="lastName">Last name</label>
              <InputText
                id="lastName"
                type="text"
                v-model="localLastName"
                autocomplete="off"
                tabindex="2"
              />
            </div>
          </div>
          <div class="p-d-flex p-mb-4">
            <div class="p-field">
              <label for="email">Email address</label>
              <InputText
                id="email"
                type="email"
                v-model="localEmail"
                autocapitalize="none"
                autocorrect="off"
                spellcheck="false"
                autocomplete="off"
                tabindex="3"
              />
            </div>
          </div>
          <div class="p-d-flex p-mb-4">
            <div class="p-field p-mr-4">
              <label for="role">Role</label>
              <Dropdown
                v-model="selectedRole"
                :options="roleOptions"
                optionLabel="label"
                optionValue="value"
                dataKey="key"
                placeholder="Select Role"
                id="role"
                tabindex="4"
              />
            </div>
            <div class="p-field p-mr-4">
              <label for="canViewBudget">View Budget</label>
              <InputSwitch
                id="canViewBudget"
                v-model="canViewBudgetSelection"
                tabindex="5"
              />
            </div>
            <div class="p-field">
              <label for="channels">Channel Edit Rights</label>
              <MultiSelect
                v-model="selectedChannels"
                :options="channelOptions"
                optionLabel="name"
                placeholder="Select Channels"
                id="channels"
                tabindex="6"
              />
            </div>
          </div>
          <div class="p-d-flex">
            <Button @click="handleInviteUser" tabindex="7">Send invite</Button>
          </div>
        </template>
      </TabPanel>
    </TabView>

    <div v-if="!shouldShowAddFromAccount" class="invite-only-container">
      <div class="p-d-flex p-my-4">
        <div class="p-field p-mr-4">
          <label for="firstName_inviteOnly">First Name</label>
          <InputText
            id="firstName_inviteOnly"
            type="text"
            v-model="localFirstName"
            autocomplete="off"
          />
        </div>
        <div class="p-field">
          <label for="lastName_inviteOnly">Last name</label>
          <InputText
            id="lastName_inviteOnly"
            type="text"
            v-model="localLastName"
            autocomplete="off"
          />
        </div>
      </div>
      <div class="p-d-flex p-mb-4">
        <div class="p-field">
          <label for="email_inviteOnly">Email address</label>
          <InputText
            id="email_inviteOnly"
            type="email"
            v-model="localEmail"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            autocomplete="off"
          />
        </div>
      </div>
      <div class="p-d-flex p-mb-4">
        <div class="p-field">
          <label for="role_inviteOnly">Role</label>
          <Dropdown
            v-model="selectedRole"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            dataKey="key"
            placeholder="Select Role"
            id="role_inviteOnly"
          />
        </div>
      </div>
      <div class="p-d-flex">
        <Button @click="handleInviteUser">Send invite</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import ID from '@/app-shared/models/ID'
import Role from '@/app-shared/models/Role'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import UserRole from '@/app-shared/models/UserRole'
import Dropdown from 'primevue/dropdown'
import User, {UserStatus} from '../models/User'
import Channel from '../models/Channel'
import MultiSelect from 'primevue/multiselect'
import InputSwitch from 'primevue/inputswitch'

Vue.component('TabView', TabView)
Vue.component('TabPanel', TabPanel)
Vue.component('DataTable', DataTable)
Vue.component('Column', Column)
Vue.component('Dropdown', Dropdown)
Vue.component('MultiSelect', MultiSelect)
Vue.component('InputSwitch', InputSwitch)

export default Vue.extend({
  name: 'UserAdd',
  components: {},
  props: {
    shouldShowAddFromAccount: Boolean,
  },
  data: () => {
    return {
      localFirstName: '' as string,
      localLastName: '' as string,
      localEmail: '' as string,
      emailPattern: new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
      selectedRole: {} as Role,
      accountUserSelectedRoles: {},
      accountUserErrantRows: [] as number[],
      canViewBudgetSelection: false as boolean,
      selectedChannels: [] as Channel[],
    }
  },
  computed: {
    usersInAccount(): UserRole[] {
      return this.$store.getters.currentAccountUserRoles
    },
    isAccountPage: function () {
      return !this.$router.currentRoute.path.includes('plan')
    },
    roleOptions: function () {
      const userPermissionLevel = this.isAccountPage
        ? this.$store.getters.currentAccountPermissionLevel
        : this.$store.getters.getPermissionLevelForPlanId(
            this.$store.getters.currentPlan.id
          )
      const excludedRoleIntIds = this.$store.getters.allRoles
        .filter((roleOption) => roleOption.level < userPermissionLevel)
        .map((role) => role.id.intID)
      excludedRoleIntIds.push(3) //Hiding master plan admin role (intID: 3) for MVP
      if (!this.isAccountPage) {
        //Hiding "account" roles when not on account detail view
        excludedRoleIntIds.push(1) //Account owner
        excludedRoleIntIds.push(2) //Account admin
      }
      return this.$store.getters.allRoles
        .filter((role) => !excludedRoleIntIds.includes(role.id.intID))
        .map((role) => {
          return {
            key: role.id.intID,
            label: role.title,
            value: role,
          }
        })
    },
    channelOptions() {
      return this.$store.getters.currentPlan.channels.filter(
        (channel) => channel.name !== Channel.CHANNEL_NAME_INITIATIVES
      )
    },
  },
  mounted: function(){
    // Populate users from account for display in this view
    this.$store.dispatch('getUsersForCurrentAccount')
  },
  methods: {
    handleAddAccountUserToPlan(userRole: UserRole) {
      if (this.accountUserSelectedRoles[userRole.id.intID]) {
        const newUserRole = new UserRole()
        newUserRole.roleId = this.accountUserSelectedRoles[userRole.id.intID].id
        newUserRole.userId = userRole.user.id
        newUserRole.accountId = this.$store.getters.currentAccount.id
        newUserRole.planId = this.$store.getters.currentPlan.id

        this.$store.getters.services.users.createUserRole(newUserRole).then(
          (newUserRole) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: 'User added.',
              life: 3000,
            })
            if (this.isAccountPage) {
              this.$emit('shouldHide')
            } else {
              this.$store.dispatch('refreshCurrentPlan').then(() => {
                this.$emit('shouldHide')
              })
            }
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error adding user to plan.',
              detail: error,
              life: 3000,
            })
          }
        )
      } else {
        this.accountUserErrantRows = [userRole.id.intID]
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.error,
          summary: 'Please select a role for the user.',
          life: 3000,
        })
      }
    },
    handleInviteUser() {
      if (this.localFirstName === '' || this.localLastName === '' || !this.emailPattern.test(this.localEmail) || !this.selectedRole.id) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.error,
          summary: 'Please complete all fields.',
          life: 3000,
        })
        return
      }

      // Create User
      const newUser = new User()
      newUser.emailAddress = this.localEmail
      newUser.firstName = this.localFirstName
      newUser.lastName = this.localLastName
      newUser.status = UserStatus.pending

      this.$store.getters.services.users.create(newUser).then(
        (userResponse) => {
          const newUserRole = new UserRole()
          newUserRole.roleId = this.selectedRole.id
          newUserRole.userId = userResponse.id
          newUserRole.accountId = this.$store.getters.currentAccount.id
          newUserRole.planId = this.isAccountPage
            ? new ID()
            : this.$store.getters.currentPlan.id
          newUserRole.canViewBudget = this.canViewBudgetSelection
          newUserRole.channels = this.selectedChannels.map((channel)=>channel.id)

          // Add new user to current account
          this.$store.commit('addUserToCurrentAccountUsers', userResponse)

          this.$store.getters.services.users.createUserRole(newUserRole).then(
            (userRoleResponse) => {
              Vue.prototype.$toast.add({
                severity: AlertMessageSeverity.success,
                summary: 'User invited.',
                life: 3000,
              })
              if (this.isAccountPage) {
                this.$store.getters.currentAccount.users.push(userRoleResponse)
                this.$emit('shouldHide')
              } else {
                this.$store.dispatch('refreshCurrentPlan').then(() => {
                  this.$emit('shouldHide')
                })
              }
            },
            (error) => {
              Vue.prototype.$toast.add({
                severity: AlertMessageSeverity.error,
                summary: `Error adding user to ${
                  this.isAccountPage ? 'account' : 'plan'
                }.`,
                life: 3000,
              })
            }
          )
        },
        (error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error inviting user.',
            life: 3000,
          })
          if (this.isAccountPage) {
            this.$emit('shouldHide')
          } else {
            this.$store.dispatch('refreshCurrentPlan').then(() => {
              this.$store.dispatch('getUsersForCurrentPlan').then(() => {
                this.$emit('shouldHide')
              })
            })
          }
        }
      )
    },
    getAccountUserForId(userId: ID): User {
      const thisUser = this.$store.getters.currentAccountUsers.find(
        (user) => user.id.intID == userId.intID
      )
      return thisUser ? thisUser : new User()
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.user-add-container {
  min-width: 50rem;

  .p-dropdown {
    // Role dropdown options list should be above input because it is nead bottom of modal
    .p-dropdown-panel {
      transform-origin: center bottom !important;
      top: auto !important;
      bottom: 3.4rem !important;
      left: -0.1rem !important;
    }

    &.has-error:not(.p-inputwrapper-filled) {
      border-color: $errorColor;
    }
  }

  .p-datatable-auto-layout > .p-datatable-wrapper {
    overflow: visible;
  }
}
</style>

function InputSwitch(arg0: string, InputSwitch: any) {
  throw new Error('Function not implemented.')
}

function InputSwitch(arg0: string, InputSwitch: any) {
  throw new Error('Function not implemented.')
}
