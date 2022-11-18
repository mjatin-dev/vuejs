<template>
  <div class="view-wrapper">
    <ViewHeader title="Profile" :isFullViewport="true" :isClose="true">
      <template #actions>
        <Button class="p-button-outlined p-mr-3" @click="navigationTo"
          >close</Button
        >
      </template>
    </ViewHeader>
    <ViewMain :isFullViewport="true">
      <div class="user-detail-container p-mt-4">
        <div class="profile-photo-container p-mb-4" style="padding-left: 20%">
          <div class="profile-photo">
            <img alt="User profile photo" :src="image.fileLocation" />
          </div>
          <div>
            <div class="upload-image" @click="fileUpload">
              <i class="pi pi-plus" />
              <label>Choose Image </label>
            </div>
            <input
              type="file"
              id="new-document"
              style="display: none"
              ref="uploadInput"
              @change="onFileUpload"
            />
          </div>
        </div>

        <div style="padding-left: 10%">
          <div class="p-field p-inputtext-lg">
            <label for="firstName">First Name</label>
            <InputText
              id="firstName"
              type="text"
              v-model="user.firstName"
              autocomplete="off"
            />
          </div>
          <div class="p-field p-inputtext-lg">
            <label for="lastName">Last name</label>
            <InputText
              id="lastName"
              type="text"
              v-model="user.lastName"
              autocomplete="off"
            />
          </div>
          <div class="p-field p-inputtext-lg">
            <label for="email">Email address</label>
            <InputText
              id="email"
              type="email"
              v-model="user.emailAddress"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              autocomplete="off"
            />
          </div>
        </div>

        <div
          class="p-mt-4"
          style="padding-left: 5%; margin-top: 3.5rem !important"
        >
          <label for="newPassword">Change Password</label>
          <div class="p-field p-inputtext-lg p-mt-4"></div>
          <div class="p-field p-inputtext-lg p-mt-4">
            <label for="newPassword">New Password</label>
            <Password
              id="newPassword"
              :feedback="true"
              v-model="newPassword"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              autocomplete="off"
            />
          </div>
          <div class="p-field p-inputtext-lg">
            <label for="newPassword">Confirm New Password</label>
            <Password
              id="newPassword"
              :feedback="true"
              v-model="confirmPassword"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              autocomplete="off"
            />
          </div>
          <div class="p-d-flex p-jc-end" style="margin-top: 40px">
            <Button @click="updateUser">Save</Button>
          </div>
        </div>
      </div>

      <div class="account-user-detail p-mt-4" v-if="!isAccountOwner">
        <DataTable
          :autoLayout="true"
          :sortOrder="1"
          :value="currentUserInArray"
          sortField="user.firstName"
        >
          <Column header="Account">
            <template #body="">
              {{ $store.getters.currentAccount.contactCompanyName }}
            </template>
          </Column>
          <Column>
            <template #body="slotProps">
              <i
                class="pi pi-trash delete-icon"
                @click="deleteUser($event, slotProps.data.id)"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <div class="account-user-detail-role" v-if="isAccountOwner">
        <DataTable
          :autoLayout="true"
          :sortOrder="1"
          :value="usersInAccount"
          sortField="user.firstName"
        >
          <Column header="Account" bodyStyle="width:40%">
            <template #body="">
              {{ $store.getters.currentAccount.contactCompanyName }}
            </template>
          </Column>
          <Column header="Account Role">
            <template #body="">
              {{ getRole() }}
            </template>
          </Column>
          <Column bodyStyle="text-align:right">
            <template #body="">
              <p>
                To transfer account ownership contact
                <a class="contact-email" href="mailto:hello@adminplanning.com"
                  >hello@adminplanning.com</a
                >
              </p>
            </template>
          </Column>
        </DataTable>
      </div>

      <ul class="team-plan">
        <li class="team-plan__head">
          <span id="firstName">Plan</span>
          <span id="role">Role </span>
          <span id="budget">Budget</span>
          <span id="editRights">Channel Edit Rights </span>
        </li>
        <li v-if="userRoleFromCurrentPlans.length === 0">Loading...</li>
        <li
          v-for="(user, i) of userRoleFromCurrentPlans"
          :key="i"
          :class="[
            user.parentId.intID !== 0
              ? 'team-plan__subitem'
              : 'team-plan__item',
          ]"
        >
          <div class="p-d-flex" :key="i + 1">
            <span
              id="firstName"
              :style="[
                user.parentId.intID !== 0 ? {'padding-left': '20px'} : '',
              ]"
            >
              <div v-if="user.isEditing">
                <input class="p-inputtext" type="text" v-model="user.name" />
              </div>
              <div v-else>
                <span>{{ user.name }}</span>
              </div></span
            >
            <span id="role">
              <div class="edit" v-if="user.isEditing">
                <Dropdown
                  :options="roles"
                  optionLabel="title"
                  optionValue="code"
                  placeholder="Select"
                  v-model="user.editingValues.role"
                />
              </div>

              <div v-else>
                <span>
                  {{ getRoleForId(user.roleId.intID) }}
                </span>
              </div>
            </span>
            <div id="budget">
              <div class="edit" v-if="user.isEditing">
                <Dropdown
                  :options="budgetOptions"
                  optionLabel="name"
                  optionValue="code"
                  v-model="user.canViewBudget"
                />
              </div>

              <div v-else style="padding-left: 6px">
                <span v-if="user.canViewBudget">View</span>
                <span v-else>Hide</span>
              </div>
            </div>

            <span id="editRights">
              <div class="edit" v-if="user.isEditing">
                <MultiSelect
                  v-model="user.editingValues.channels"
                  :options="getChannelFromPlanId(user.planId)"
                  optionLabel="name"
                  placeholder="Select"
                  class="mutliselect"
                  dataKey="name"
                >
                  <template #value="slotProps">
                    <template
                      v-if="
                        slotProps.value.length ===
                        getChannelFromPlanId(user.planId).length
                      "
                    >
                      All
                    </template>
                    <template
                      v-else-if="
                        !slotProps.value || slotProps.value.length === 0
                      "
                    >
                      Select Channel
                    </template>
                    <template v-else>
                      <div>
                        <span>{{
                          slotProps.value.map((item) => item.name).toString()
                        }}</span>
                      </div>
                    </template>
                  </template>
                </MultiSelect>
              </div>
              <div class="channel-edit-right" v-else>
                <div v-if="user.channels.length === 0">None</div>
                <div v-else>
                  <span
                    v-for="(channelId, channelIndex) in user.channels"
                    :key="channelId.intID + Math.random()"
                    >{{ getChannelForId(user.channels, channelId).name
                    }}{{
                      channelIndex === user.channels.length - 1 ? '' : ', '
                    }}
                  </span>
                </div>
              </div>
            </span>

            <span>
              <i
                class="pi pi-pencil p-mr-2"
                v-if="!user.isEditing"
                @click="
                  () => {
                    user.isEditing = !user.isEditing
                  }
                " />
              <i v-else class="pi pi-check p-mr-2" @click="handleEdit(user)" />
              <i
                class="pi pi-trash delete-icon"
                @click="deleteUserRole($event, user)"
            /></span>
          </div>
        </li>
      </ul>
    </ViewMain>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import ViewHeader from '@/app-shared/components/ViewHeader.vue'
import ViewMain from '@/app-shared/components/ViewMain.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import User, {UserMostRecentView} from '@/app-shared/models/User'
import FileUpload from 'primevue/fileupload'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import Role from '@/app-shared/models/Role'
import ID from '@/app-shared/models/ID'
import UserRole from '@/app-shared/models/UserRole'
import Plan from '@/app-shared/models/Plan'
import Channel from '@/app-shared/models/Channel'
import _ from 'lodash'

Vue.component('Button', Button)
Vue.component('InputText', InputText)
Vue.component('FileUpload', FileUpload)

export default Vue.extend({
  name: 'UserDetail',
  components: {
    ViewHeader,
    ViewMain,
  },
  data: () => {
    return {
      newPassword: '',
      fileTypes: '.jpg,.jpeg,.png,.gif,.webp' as string,
      confirmPassword: '',
      editPlan: false as boolean,
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
      image: {},
      isImageUpload: false as boolean,
      isLoading: true as boolean,
      channelList: [] as Channel[],

      planList: [] as Plan[],
    }
  },
  async created() {
    const list = await this.$store.getters.services.channels.getChannels()
    const newList = _.uniqBy(list, 'name')
    const addedKey = newList.map((item, i) => {
      return {
        ...item,
        key: i,
      }
    })

    this.channelList = addedKey
  },
  mounted() {
    this.image = this.$store.getters.currentUser.profileImage
  },
  computed: {
    userRoleFromCurrentPlans(): UserRole[] {
      const plans = this.$store.getters.allPlans.filter((plan) => {
        if (
          plan.users.filter(
            (userRole) =>
              userRole.user.id.intID == this.$store.getters.currentUser.id.intID
          ).length
        ) {
          return true
        }
        return false
      })

      const updatedPlan = plans.map((item) => {
        const user = item.users.find(
          (user) =>
            user.userId.intID == this.$store.getters.currentUser.id.intID
        )

        user['parentId'] = item.parentId
        user['name'] = item.name
        user['planId'] = item.id

        return user
      })

      return updatedPlan
    },
    currentUserInArray(): User[] {
      return [this.$store.getters.currentUser]
    },
    plan(): Plan {
      return this.$store.getters.currentPlan
    },
    user(): User {
      if (this.$route.params.userId) {
        if (
          this.$store.getters.currentUser &&
          this.$route.params.userId == this.$store.getters.currentUser.id.intID
        ) {
          return this.$store.getters.currentUser
        } else {
          return this.$store.getters.allUsersInCurrentAccount.find(
            (user) => user.id.intID == Number(this.$route.params.userId)
          )
        }
      }
      return new User()
    },
    usersInPlan(): UserRole[] {
      const plans = this.$store.getters.allPlans.map((item) => {
        return {...item, user: item.users}
      })
      return plans.filter((userRole) => userRole.planId?.intID !== 0)
    },
    roles(): {}[] {
      return this.$store.getters.allRoles
        .filter((role) => role.level >= 250)
        .map((role) => ({
          title: role.title,
          code: role.id,
        }))
    },

    maxChannelsLength(): number {
      return this.$store.getters.channelList.length
    },
    isAccountOwner(): boolean {
      const currentRole = Role.USER_LEVELS.find(
        (item) =>
          item.level === this.$store.getters.currentAccountPermissionLevel
      )
      return currentRole?.name === 'Account Owner' ? true : false
    },
  },
  methods: {
    getChannelFromPlanId(planID): Channel[] {
      const plans = this.$store.getters.allPlans.find(
        (item) => item.id.intID === planID.intID
      )
      const channels = plans.channels.filter(
        (channel) => channel.name !== 'Initiatives'
      )

      return channels
    },
    fileUpload() {
      const rowRef = this.$refs.uploadInput as HTMLDivElement
      rowRef.click()
    },
    channels(channel): Channel[] {
      return channel.filter((channel) => channel.name !== 'Initiatives')
    },
    deleteUser(event) {
      event.stopPropagation()
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        message: 'Are you sure you want to delete user?',
        target: event.currentTarget,
        accept: () => {
          //callback to execute when user confirms the action

          const plans = this.$store.getters.allPlans.filter((plan) => {
            if (
              plan.users.filter(
                (userRole) =>
                  userRole.user.id.intID ==
                  this.$store.getters.currentUser.id.intID
              ).length
            ) {
              return true
            }
            return false
          })
          const userRoles = plans.map((item) => {
            const user = item.users.find(
              (user) =>
                user.userId.intID == this.$store.getters.currentUser.id.intID
            )
            return user
          })

          userRoles.map((item) => {
            this.$store.state.services.users.deleteUserRole(item.id.intID)
          })

          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.success,
            summary: 'User has been deleted',
            life: 3000,
          })


        },
        reject: () => {
          //callback to execute when user rejects the action
        },
      })
    },
    deleteUserRole(event, user) {
      this.$confirm.require({
        acceptLabel: 'YES',
        rejectLabel: 'NO',
        message: 'Are you sure you want to delete user role from this plan?',
        target: event.currentTarget,
        accept: () => {
          //callback to execute when user confirms the action
          this.$store.state.services.users
            .deleteUserRole(user.id.intID)
            .then(() => {
              Vue.prototype.$toast.add({
                severity: AlertMessageSeverity.success,
                summary: 'User Role has been deleted',
                life: 3000,
              })

              user.roleId = ''
            })
            .catch((error) =>
              Vue.prototype.$toast.add({
                severity: AlertMessageSeverity.error,
                summary: 'Something went wrong',
                life: 3000,
              })
            )
        },

        reject: () => {
          //callback to execute when user rejects the action
        },
      })
    },
    navigationTo() {
      this.$router.back()
    },
    cancelUpdate() {
      // TODO: router back?
    },
    updateUser() {
      if (!this.user.mostRecentView) {
        this.user.mostRecentView = UserMostRecentView.dashboard
      } else {
        if (!this.isImageUpload) {
          if (this.confirmPassword !== this.newPassword) {
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.error,
              summary: 'confirm password must match',
              life: 3000,
            })
          } else {
            this.user.profileImage = `/api/media_assets/${this.user.profileImage.id.intID}`
            this.$store.getters.services.users
              .update(this.user)
              .then((user) => {
                this.user.profileImage = user.profileImage
                this.user.profileImage.id = {intID: user.profileImage.id}
                this.isImageUpload = false
                Vue.prototype.$toast.add({
                  severity: AlertMessageSeverity.success,
                  summary: 'User updated',
                  life: 3000,
                })
              })
          }
        }
        if (this.isImageUpload) {
          this.user.profileImage = `/api/media_assets/${this.user.profileImage.id}`
          this.$store.getters.services.users.update(this.user).then((user) => {
            this.user.profileImage = user.profileImage
            this.user.profileImage.id = {intID: user.profileImage.id}
            this.isImageUpload = false
            Vue.prototype.$toast.add({
              severity: AlertMessageSeverity.success,
              summary: 'User updated',
              life: 3000,
            })
            //location.reload();
          })
        }
      }
    },
    onFileUpload(event) {
      const fileData = event.target.files
      this.isImageUpload = true
      const file = new FormData()
      file.append('file', fileData[0])
      this.$store.getters.services.users.mediaAsset(file).then(
        (mediaAsset) => {
          this.image = mediaAsset
          this.user.profileImage = mediaAsset
          this.updateUser()
        },
        (error) => {
          Vue.prototype.$toast.add({
            severity: AlertMessageSeverity.error,
            summary: 'Error uploading file. Please try again.',
            life: 3000,
          })
        }
      )
    },
    getAccountUserName() {
      return (
        this.$store.getters.currentUser?.firstName +
        this.$store.getters.currentUser?.lastName
      )
    },
    getRole() {
      const currentRole = Role.USER_LEVELS.find(
        (item) =>
          item.level === this.$store.getters.currentAccountPermissionLevel
      )

      return currentRole?.name
    },
    getRoleForId(roleId: ID) {
      const role = this.$store.getters.allRoles.find(
        (role) => role.id.intID == roleId
      )
      return role ? role.title : '-'
    },
    userCanViewBudget(users) {
      const user = users.filter(
        (user) => user.userId.intID == this.$store.getters.currentUser.id.intID
      )
      return user[0].canViewBudget ? true : false
    },
    getChannelForId(channels, channelID) {
      return channels.find((channel) => channel.id.intID === channelID.id.intID)
    },
    handleEdit(user) {
      const rolePayload = new UserRole()

      rolePayload.id = user.id
      rolePayload.userId = user.userId
      rolePayload.planId = user.planId
      rolePayload.roleId = user.editingValues.role
      rolePayload.accountId = this.$store.getters.currentAccount.id
      rolePayload.canViewBudget = user.canViewBudget

      if (user.editingValues.channels.length > 0) {
        rolePayload.channels = user.editingValues.channels.map(
          (item) => item.id
        )
      }

      this.handleEditUserRole(rolePayload)
        .then(() => {
          user.roleId = user.editingValues.role
          user.channels = user.editingValues.channels
          user.isEditing = !user.isEditing
        })
        .catch((error) => console.warn(error))
    },
    handleEditUserRole(userRole: UserRole) {
      return new Promise((resolve, reject) => {
        this.$store.getters.services.users
          .updateUserRole(userRole)
          .then((response) => {
            resolve(response)
          })
          .catch((error) => reject(error))
      })
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.upload-image {
  @include font-mulish;
  background: black;
  padding: 10px 10px;
  color: white;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 5px;
  width: 128px;
  label {
    margin-left: 6px;
    cursor: pointer;
  }
  i {
    border: 2px solid #888686;
    border-radius: 50%;
    padding: 2px;
    cursor: pointer;
  }
}
.user-detail-container {
  display: flex;
  input {
    width: 300px;
  }
  label {
    font-size: 12px;
  }
}
.profile-photo {
  border-radius: 50%;
  align-items: center;
  text-align: center;
  img {
    width: 10rem;
    height: 10rem;
    object-fit: cover;
  }
}

.account-user-detail {
  width: 45%;
}

.account-user-detail-role {
  width: 65%;
  margin-top: 50px;
}
.delete-icon {
  color: red;
}

.plan-setting {
  display: flex;
  justify-content: space-between;
  background: #efefef;
  padding: 0px 10px;
}

.plan-container {
  margin-top: 50px;
}

.plan-setting-detail {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #ebebeb;
  padding: 0px 10px;
}

.team-plan {
  margin-top: 50px;
  padding: 0px !important;
}

.contact-email {
  @include font-mulish-light;
  text-decoration: underline;
  cursor: pointer;
  color: #000;
}

.team-plan {
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
    background-color: rgb(239 239 239);
    padding: 5px 10px;
    display: flex;
    flex-direction: row;
    font-weight: 400;
  }
  &__item {
    padding: 15px 20px 15px 10px;
    flex-direction: row;
    font-size: 14px;
    border-bottom: 1px solid #b0abab;

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
  &__subitem {
    padding: 15px 20px 15px 10px;
    flex-direction: row;
    font-size: 14px;
    border-top: 1px solid #e9e8e8;
    border-bottom: 1px solid #b0abab;

    &:last-child {
      border-bottom: 1px solid #b0abab;
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
    width: 20%;
  }
  #lastName {
    width: 20%;
  }

  #role {
    width: 20%;
    .edit {
      padding-left: 1px;
    }
  }
  #budget {
    width: 20%;
    .edit {
      padding-left: 1px;
    }
  }
  #editRights {
    width: 20%;
    .edit {
      padding-left: 6px;
    }
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
      font-size: 15px;
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

.team-subPlan {
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
    background-color: rgb(239 239 239);
    padding: 5px 10px;
    display: flex;
    flex-direction: row;
    font-weight: 400;
  }

  &__subitem {
    padding: 15px 20px 15px 10px;
    flex-direction: row;
    font-size: 14px;
    border-top: 1px solid #b0abab;
    margin-top: 5px;

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
    width: 20%;
  }
  #lastName {
    width: 20%;
  }

  #role {
    width: 20%;
    .edit {
      padding-left: 1px;
    }
  }
  #budget {
    width: 20%;
    .edit {
      padding-left: 1px;
    }
  }
  #editRights {
    width: 20%;
    .edit {
      padding-left: 6px;
    }
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
      font-size: 15px;
      @include font-mulish-light;
    }
    .p-button-text {
      @include font-mulish-light;
      padding-left: 5px;
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
.mutliselect {
  width: 200px;
}
</style>
