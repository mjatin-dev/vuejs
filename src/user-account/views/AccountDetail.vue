<template>
  <div class="view-wrapper account-detail-view">
    <ViewHeader title="Account Settings" :isFullViewport="true">
      <template #actions>
          <Button
            label="Close"
            class="p-button-outlined"
            @click="handleCloseAccountDetailView"
          />
        </template>
    </ViewHeader>
    <ViewMain :isFullViewport="true">
      <div class="p-mb-6">
        <p class="account-label">Account</p>
        <h3>{{ currentAccount.contactCompanyName }}</h3>
      </div>

      <div class="p-mb-6">
        <div class="p-d-flex p-jc-between p-ai-start p-mb-4">
          <h3>Account Management</h3>
        </div>
        <DataTable :value="generalInfo">
          <Column field="firstName" header="First Name" />
          <Column field="lastName" header="Last Name" />
          <Column field="email" header="Email" />
          <Column header="Role">
            <template #body> Account Owner </template>
          </Column>
        </DataTable>
        <div class="p-d-flex p-jc-center p-ai-start p-mt-4">
          <p>
            To transfer account ownership contact
            <a href="mailto:hello@annumplanning.com" class="email-link"
              >hello@annumplanning.com</a
            >.
          </p>
        </div>
      </div>

      <div class="p-mb-6">
        <div class="p-d-flex p-jc-between p-ai-start p-mb-4">
          <h3>Plans</h3>
          <!-- BEGIN: Feature flagged for beta -->
          <div
            v-if="
              canUserManagePlansAndUsers && $store.getters.isUserAnnumTeamMember
            "
            class="p-d-flex"
          >
            <Button
              label="Add Individual Plan"
              icon="pi pi-plus-circle"
              @click="() => handleCreatePlan('Individual')"
              class="p-button-outlined"
            ></Button>
            <Button
              label="Add Lead Plan"
              icon="pi pi-plus-circle"
              @click="() => handleCreatePlan('Master')"
              class="p-ml-3"
            ></Button>
          </div>
          <!-- END: Feature flagged for beta -->
        </div>
        <DataTable
          :value="currentPlans"
          class="p-mb-4"
          editMode="row"
          dataKey="id.intID"
          :editingRows.sync="planEditingRows"
          @row-edit-init="onPlanRowEditInit"
          @row-edit-save="onPlanRowEditSave"
        >
          <Column columnKey="name" header="Name">
            <template #body="slotProps">
              <div
                class="p-d-flex p-jc-between"
                :class="!!slotProps.data.parentId.intID ? 'p-ml-5' : ''"
              >
                {{ slotProps.data.name }}
              </div>
            </template>
            <template #editor="slotProps">
              <InputText v-model="slotProps.data.name" />
            </template>
          </Column>
          <Column columnKey="id" header="ID" headerStyle="text-align: center;" bodyStyle="text-align: center;">
            <template #body="slotProps">
              {{ slotProps.data.id.intID }}
            </template>
            <template #editor="slotProps">
              {{ slotProps.data.id.intID }}
            </template>
          </Column>
          <!-- BEGIN: Feature flagged for beta -->
          <Column
            v-if="
              canUserManagePlansAndUsers &&
              $store.getters.isUserAnnumTeamMember
            "
          >
            <template #body="slotProps">
              <div class="p-d-flex p-jc-end">
                <Button
                  v-if="!slotProps.data.parentId.intID"
                  label="Add Nested Plan"
                  icon="pi pi-plus-circle"
                  @click="() => handleCreatePlan('Sub', slotProps.data.id)"
                ></Button>
              </div>
            </template>
          </Column>
          <!-- END: Feature flagged for beta -->
          <Column
            :rowEditor="true"
            style="width: 10%; min-width: 8rem"
            bodyStyle="text-align: right;"
          ></Column>
        </DataTable>
      </div>

      <div class="p-mb-6">
        <div class="p-d-flex p-jc-between p-ai-center p-mb-4">
          <h3>Team</h3>
        </div>
        <DataTable
          :value="$store.getters.currentAccountUserRoles"
          class="p-mb-4"
        >
          <Column field="firstName" header="First Name">
            <template #body="slotProps">
              <div class="p-d-flex p-ai-center">
                {{ getAccountUserForId(slotProps.data.userId).firstName }}
              </div>
            </template>
          </Column>
          <Column field="lastName" header="Last Name">
            <template #body="slotProps">
              <div class="p-d-flex p-ai-center">
                {{ getAccountUserForId(slotProps.data.userId).lastName }}
              </div>
            </template>
          </Column>
          <Column field="emailAddress" header="Email">
            <template #body="slotProps">
              <div class="p-d-flex p-ai-center">
                {{ getAccountUserForId(slotProps.data.userId).emailAddress }}
              </div>
            </template>
          </Column>
          <Column>
            <template #body="slotProps">
              <div class="p-d-flex p-jc-end">
                <Button
                  icon="pi pi-pencil"
                  label="Edit"
                  class="p-button-text"
                  @click="onEditUserClick(slotProps.data.user.id)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <div>
        <div class="p-mb-6 p-mt-6">
          <h3>Delete Account</h3>
          <p>
            Contact
            <a href="mailto:hello@annumplanning.com" class="email-link"
              >hello@annumplanning.com</a
            >.
          </p>
        </div>
      </div>
    </ViewMain>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ViewHeader from '@/app-shared/components/ViewHeader.vue'
import ViewMain from '@/app-shared/components/ViewMain.vue'
import Plan, {PlanType} from '@/app-shared/models/Plan'
import Account from '@/app-shared/models/Account'
import Role from '@/app-shared/models/Role'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import ID from '@/app-shared/models/ID'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import UserRole from '@/app-shared/models/UserRole'
import User from '@/app-shared/models/User'
import OverlayPanel from 'primevue/overlaypanel'

Vue.component('DataTable', DataTable)
Vue.component('Column', Column)
Vue.component('OverlayPanel', OverlayPanel)

export default Vue.extend({
  name: 'AccountDetail',
  components: {
    ViewHeader,
    ViewMain,
  },
  data: () => {
    return {
      currentEditingPlan: {} as Plan,
      planEditingRows: [],
    }
  },
  computed: {
    generalInfo(): {} {
      return [
        {
          firstName: this.currentAccount.contactFirstName,
          lastName: this.currentAccount.contactLastName,
          email: this.currentAccount.contactEmail,
        },
      ]
    },
    currentAccount(): Account {
      return this.$store.state.currentAccount
    },
    canUserEditAccountProperties(): boolean {
      return this.$store.getters.currentAccountPermissionLevel <=
        Role.LEVEL_ACCOUNT_OWNER
        ? true
        : false
    },
    canUserManagePlansAndUsers(): boolean {
      return this.$store.getters.currentAccountPermissionLevel <=
        Role.LEVEL_ACCOUNT_ADMIN
        ? true
        : false
    },
    currentPlans(): Plan[] {
      return this.$store.getters.allPlans
    },
  },
  mounted: function () {
    // Populate users from account for display in this view
    this.$store.dispatch('getUsersForCurrentAccount')
  },
  methods: {
    handleCloseAccountDetailView(){
      if(window.history.length > 2){
        this.$router.back()
      }else{
        this.$router.replace('/')
      }
    },
    handleCreatePlan(planType: PlanType, parentId: ID) {
      const newPlan = new Plan()
      newPlan.name = 'New Plan'
      newPlan.type = planType
      newPlan.accountId = this.$store.getters.currentAccount.id
      if (parentId) {
        newPlan.parentId = parentId
      }
      newPlan.creator = this.$store.getters.currentUser

      this.$store.getters.services.plans
        .create(newPlan, newPlan.type == PlanType.Sub ? false : true)
        .then(
          (responsePlan) => {
            this.$store.dispatch('updateCurrentPlan', responsePlan)
            this.$store.getters.currentAccount.plans.push(responsePlan)

            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: 'Plan created.',
              life: 3000,
            })

            const planAdminRole = this.$store.getters.allRoles.find(
              (role) => role.name === 'Plan Admin'
            )

            const newUserRole = new UserRole()
            newUserRole.roleId = planAdminRole
              ? planAdminRole.id
              : ID.fromResponseObject(4, 'roles')
            newUserRole.userId = this.$store.getters.currentUser.id
            newUserRole.accountId = this.$store.getters.currentAccount.id
            newUserRole.planId = responsePlan.id
            newUserRole.canViewBudget = true
            newUserRole.channels = responsePlan.channels.map(
              (channel) => channel.id
            )

            this.$store.getters.services.users.createUserRole(newUserRole).then(
              (userRoleResponse) => {
                this.$store.getters.currentPlan.users.push(userRoleResponse)
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'User added to new plan.',
                  life: 3000,
                })
              },
              (error) => {
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.error,
                  summary: 'Error adding user to new plan.',
                })
              }
            )
          },
          (error) => {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'Error creating plan.',
            })
          }
        )
    },
    getAccountUserForId(userId: ID): User {
      const thisUser = this.$store.getters.currentAccountUsers.find(
        (user) => user.id?.intID == userId.intID
      )
      return thisUser ? thisUser : new User()
    },
    onEditUserClick(userId: ID) {
      this.$router.push({
        path: `/account/user/${userId.intID}`,
      })
    },
    onPlanRowEditInit(event) {
      this.currentEditingPlan.name = event.data.name
    },
    onPlanRowEditSave(event) {
      if (this.currentEditingPlan.name === event.data.name) {
        return
      }

      const thisPlan = event.data as Plan
      thisPlan.accountId = this.$store.getters.currentAccount.id

      this.$store.getters.services.plans.update(thisPlan).then(
        (plan) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.success,
            summary: 'Plan updated.',
            life: 3000,
          })
        },
        (error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error updating plan.',
          })
        }
      )
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.account-detail-view {
  .view-main {
    h3 {
      margin-bottom: 0;
      @include font-mulish-light;
      font-size: 2rem;
    }
    p {
      &.account-label {
        margin-bottom: 0;
        color: #333333;
      }
    }
    a {
      &.email-link {
        color: #333333;
        text-decoration: underline;
      }
    }
  }
}
</style>
