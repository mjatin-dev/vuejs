<template>
  <div class="global-nav-container">
    <Button
      :icon="collapseButtonIconString"
      @click="isGlobalNavCollapsed = !isGlobalNavCollapsed"
      class="btn-toggle-global-nav p-button-text"
    />
    <router-link to="/plans" class="logo-link">
      <img
        class="global-logo"
        alt="Annum logo"
        src="@/assets/logo-global.jpeg"
      />
    </router-link>
    <div class="nav-core">
      <router-link to="/plans" :class="{'router-link-active': isInPlansSection}"
        >Plans</router-link
      >
    </div>
    <div class="global-nav-legal">
      <div class="global-help-menu-container">
        <Button
          label="Help"
          class="p-button-text global-help-menu-button"
          @click="
            (event) => {
              this.$refs.globalHelpMenu.toggle(event)
            }
          "
        />
        <OverlayPanel
          ref="globalHelpMenu"
          appendTo="body"
          class="global-help-menu"
        >
          <ul>
            <li>
              <a
                class="menu-item"
                href="https://www.annumplanning.com/marketing-resources/guides/"
                target="_blank"
                >Guides</a
              >
            </li>
            <li>
              <a
                class="menu-item"
                @click="$store.dispatch('updateFeedbackModal', true)"
                >Submit Feedback</a
              >
            </li>
            <li>
              <a class="menu-item" href="mailto:hello@annumplanning.com"
                >Contact Us</a
              >
            </li>
          </ul>
        </OverlayPanel>
      </div>

      <div class="global-settings-menu-container">
        <Button
          :label="currentUserInitials"
          class="p-button-rounded global-settings-menu-button"
          @click="
            (event) => {
              this.$refs.globalSettingsMenu.toggle(event)
            }
          "
        />
        <OverlayPanel
          ref="globalSettingsMenu"
          appendTo="body"
          class="global-settings-menu"
        >
          <ul>
            <li>
              <template v-if="$store.getters.allAccounts.length > 1">
                <a
                  class="menu-item"
                  @click="
                    (event) => {
                      this.$refs.selectAccountOverlay.toggle(event)
                    }
                  "
                  >Current Account:
                  {{ $store.getters.currentAccount.contactCompanyName }}</a
                >
                <OverlayPanel ref="selectAccountOverlay" appendTo="body">
                  <div
                    v-for="account of $store.getters.allAccounts"
                    :key="account.id.intID"
                    class="p-d-flex p-ai-center p-jc-between p-mb-2"
                  >
                    <h4 style="margin-bottom: 0" class="p-mr-3">
                      {{
                        account.contactCompanyName == ''
                          ? 'Account ' + account.id.intID
                          : account.contactCompanyName
                      }}
                    </h4>
                    <Button
                      v-if="
                        account.id.intID !==
                        $store.getters.currentAccount.id.intID
                      "
                      icon="pi pi-arrow-right"
                      @click="clickSwitchAccount(account)"
                      :disabled="!account.isActive"
                    ></Button>
                  </div>
                </OverlayPanel>
              </template>
              <template v-else>
                <span class="menu-item"
                  >Current Account:
                  {{ $store.getters.currentAccount.contactCompanyName }}</span
                >
              </template>
            </li>
            <li v-if="isCurrentUserProductOwner">
              <a
                class="menu-item"
                @click="
                  (event) => {
                    shouldShowAddAccountModal = true
                    this.$refs.globalSettingsMenu.hide(event)
                  }
                "
                >Add Account</a
              >
            </li>
            <li>
              <a
                v-if="this.canUserAccessAccountAdminView"
                class="menu-item"
                @click="
                  (event) => {
                    $router.push('/account')
                    this.$refs.globalSettingsMenu.hide(event)
                  }
                "
                >Account Settings</a
              >
            </li>
            <li v-if="canUserAccessAccountAdminView">
              <a class="menu-item" @click="clickSubscriptionButton"
                >Subscriptions</a
              >
            </li>
            <li>
              <a
                class="menu-item"
                @click="
                  (event) => {
                    $router.push(
                      '/account/user/' + $store.getters.currentUser.id.intID
                    )
                    this.$refs.globalSettingsMenu.hide(event)
                  }
                "
                >Profile</a
              >
            </li>
            <li>
              <a class="menu-item" @click="clickLogOut">Log Out</a>
            </li>
          </ul>
        </OverlayPanel>
      </div>
    </div>

    <Dialog
      :visible.sync="shouldShowAddAccountModal"
      :modal="true"
      header="Add Account"
    >
      <AccountAdd @accountAdded="shouldShowAddAccountModal = false" />
    </Dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import AccountAdd from '@/app-shared/views/AccountAdd.vue'
import Role from '../models/Role'

Vue.component('Button', Button)
Vue.component('Dialog', Dialog)

export default Vue.extend({
  name: 'GlobalNavigation',
  components: {
    AccountAdd,
  },
  data: () => {
    return {
      isGlobalNavCollapsed: false,
      collapseButtonIconString: 'pi pi-chevron-left',
      shouldShowAddAccountModal: false as boolean,
      isChargebeeButtonMoved: false as boolean,
    }
  },
  computed: {
    isInPlansSection(): boolean {
      return this.$route.fullPath.includes('plan')
    },
    isCurrentUserProductOwner(): boolean {
      if (this.$store.getters.currentUser?.id?.intID === 3) {
        return true
      }
      return false
    },
    currentUserInitials(): string {
      if (this.$store.getters.currentUser) {
        return (
          this.$store.getters.currentUser?.firstName[0] +
          this.$store.getters.currentUser?.lastName[0]
        )
      }
      return 'AA'
    },
    canUserAccessAccountAdminView(): boolean {
      return (
        this.$store.getters.currentAccountPermissionLevel ==
          Role.LEVEL_ACCOUNT_ADMIN ||
        this.$store.getters.currentAccountPermissionLevel ==
          Role.LEVEL_ACCOUNT_OWNER
      )
    },
  },
  watch: {
    isGlobalNavCollapsed: function () {
      this.collapseButtonIconString = this.isGlobalNavCollapsed
        ? 'pi pi-chevron-right'
        : 'pi pi-chevron-left'
      this.$store.commit(
        'updateIsGlobalNavCollapsed',
        this.isGlobalNavCollapsed
      )
    },
  },
  methods: {
    clickSwitchAccount(account) {
      this.$store.dispatch('switchAccount', account.id.intID)
    },
    clickLogOut() {
      this.$store.dispatch('logout').then(() => {
        this.$router.push('/sign-in')
      })
    },
    clickSubscriptionButton() {
      const chargebeeButtonEl = window.document.getElementById(
        'chargebee_manage_subscription_button'
      ) as HTMLElement
      if (chargebeeButtonEl) {
        chargebeeButtonEl.click()
      }
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.global-nav-collapsed {
  .global-nav-container {
    left: calc(
      -15% + 3.2rem
    ); //TODO: should use $globalNavWidth and $navCollapseButtonWidth but having issues with calc()
    transition: left 0.3s;
  }
}
.global-nav-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  width: $globalNavWidth;
  height: 100vh;
  padding: 0 $navCollapseButtonWidth 1rem 0;
  transition: left 0.3s;

  .global-logo {
    max-width: 7vw;
  }

  .btn-toggle-global-nav.p-button:enabled {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: $navCollapseButtonWidth;
    z-index: 1;
    background: #fff;
    border-right: 0.1rem solid $black !important;
    border-left: 0.1rem solid $black !important;
    border-radius: 0;

    &:hover {
      background: #fff;
    }
    &:focus {
      box-shadow: none;
    }
  }

  a {
    display: block;
    position: relative;
    @include font-mulish;
    color: $black;
    text-decoration: none;
    padding: 1.2rem 2.4rem;
    font-size: 1.4rem;
    line-height: 1.6rem;

    &:not(.only-exact).router-link-active,
    &.only-exact.router-link-exact-active {
      color: #fff;
      background-color: $black;
    }
    &.router-link-active.logo-link {
      background-color: transparent;
    }
  }

  .nav-core {
    margin-top: 0;
  }

  .global-nav-legal {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    padding: 0.8rem 2.4rem;

    .global-help-menu-button {
      padding-right: 0;
      padding-left: 0;
      color: $dim-gray;

      &:enabled:hover {
        background-color: transparent;
        color: $dim-gray;
      }
    }
    .global-settings-menu-button {
      display: flex;
      justify-content: center;
      align-content: center;
      padding: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
  }
}
.global-help-menu,
.global-settings-menu {
  &.p-overlaypanel {
    .p-overlaypanel-content {
      padding: 1.4rem 2.4rem;
    }
  }
  ul {
    margin: 0;
    padding-left: 0;
  }
  .menu-item {
    display: block;
    padding: 1rem 0;
    font-size: 1.1rem;
    color: #000;
    cursor: pointer;
  }
}
</style>
