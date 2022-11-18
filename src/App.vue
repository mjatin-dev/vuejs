<template>
  <div
    id="app"
    class="p-d-flex"
    :class="{'global-nav-collapsed': this.$store.getters.isGlobalNavCollapsed}"
    :data-app-version="versionNumber"
  >
    <UserFeedback v-if="this.$store.getters.isUserLoggedIn" />
    <ConfirmPopup class="global-p-confirm-popup" />
    <Toast :baseZIndex="9999" position="bottom-right" />
    <template v-if="this.$store.getters.isAppInitialized">
      <template v-if="this.$store.getters.isUserLoggedIn">
        <router-view name="main" :key="$route.fullPath" />
        <GlobalNavigation />
      </template>
      <template v-else>
        <router-view name="loggedOut" />
      </template>
    </template>
    <template v-else>
      <img
        class="global-init-logo"
        alt="Annum logo"
        src="@/assets/logo-global.jpeg"
      />
      <div class="global-init-spinner-container p-d-flex p-ai-center">
        <ProgressSpinner strokeWidth="3" />
      </div>
    </template>
    <template
      v-if="this.allowApiLoadingSpinnerDisplay && this.isApiRequestInProgress"
    >
      <div class="global-api-spinner-container p-d-flex p-ai-center">
        <ProgressSpinner strokeWidth="3" />
      </div>
    </template>
    <div class="small-viewport-blocker">
      <img 
        alt="Annum logo"
        src="@/assets/logo-global.jpeg"
      />
      <h2>Application is not supported on this device. It was designed for omnichannel planning which is best executed on a laptop.</h2>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import GlobalNavigation from '@/app-shared/components/GlobalNavigation.vue'
import UserFeedback from '@/app-shared/components/UserFeedback.vue'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'
import PrimeVue from 'primevue/config'
import ConfirmPopup from 'primevue/confirmpopup'

import 'primevue/resources/themes/nova/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import ID from './app-shared/models/ID'

Vue.component('ConfirmPopup', ConfirmPopup)
Vue.component('Toast', Toast)
Vue.component('ProgressSpinner', ProgressSpinner)
Vue.component('UserFeedback', UserFeedback)

Vue.use(PrimeVue, {
  locale: {
    firstDayOfWeek: 0,
    dayNames: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    monthNames: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    monthNamesShort: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    today: 'Today',
    clear: 'Clear',
    dateFormat: 'mm/dd/yy',
    weekHeader: 'Wk',
  },
})

export default Vue.extend({
  name: 'AnnumApp',
  components: {
    GlobalNavigation,
  },
  data: () => {
    return {
      allowApiLoadingSpinnerDisplay: false as boolean,
      allowApiLoadingSpinnerDisplayTimeout: {},
      allowApiLoadingSpinnerDisplayTimeoutDuration: 500 as number,
      isApiRequestInProgress: false as boolean,
      apiRequestProgressTimeout: {},
      apiRequestProgressTimeoutDuration: 500 as number,
    }
  },
  computed: {
    versionNumber() {
      return process.env.VUE_APP_VERSION || '0'
    },
  },
  watch: {
    $route(to, from) {
      //Update page title
      if (to.meta.title) {
        document.title = to.meta.title
      }

      // Store account ID from route in AppStore
      if (this.$route.params.accountId) {
        this.$store.commit(
          'updateRouteAccountIntId',
          Number(this.$route.params.accountId)
        )
      }

      //Check for valid refresh token on all route changes to force logout on all tabs of the same browser
      this.$store.dispatch('checkLoggedInStatus')

      //Apply filters from query params after initialization
      if (this.$route.query) {
        this.$store.dispatch('readQueryParams', this.$route.query)
      }
    },
  },
  created: function () {
    //Update page title
    document.title = (this.$route as any).meta.title
      ? (this.$route as any).meta.title
      : 'Annum'

    //Initialize app
    this.$store.dispatch('initApp').then(
      () => {
        //Re-route to LogIn view if not logged in and not accessing a publicly-accessible route
        if (this.$store.getters.isUserLoggedIn) {
          if (!this.$store.getters.currentAccount.isActive) {
            this.$router.replace('/inactive-account')
          } else if (this.$route.params.planId) {
            this.$store.dispatch(
              'updateCurrentPlanById',
              new ID(Number(this.$route.params.planId))
            )
          }
        } else {
          if (this.$route.meta && !this.$route.meta.isPublic) {
            this.$router.replace('/sign-in')
          }
        }
      },
      (error) => {
        console.warn('initApp error', error)
      }
    )

    //Set values in AppStore based on query params
    if (
      Object.keys(this.$route.query).length &&
      this.$router.currentRoute.path !== '/change-password' &&
      this.$router.currentRoute.path.indexOf('/set-password') < 0 &&
      this.$router.currentRoute.path.indexOf('search') < 0
    ) {
      this.$store.dispatch('readQueryParams', this.$route.query)
      this.$router.replace({
        path: this.$router.currentRoute.path,
        query: undefined,
      })
    }

    // Set up interceptor for all API requests to show loading spinner

    axios.interceptors.request.use(
      (config) => {
        this.isApiRequestInProgress = true

        this.allowApiLoadingSpinnerDisplayTimeout = window.setTimeout(() => {
          if (this.isApiRequestInProgress) {
            this.allowApiLoadingSpinnerDisplay = true
          } else {
            this.allowApiLoadingSpinnerDisplay = false
          }
        }, this.allowApiLoadingSpinnerDisplayTimeoutDuration)

        return {
          ...config,
          onUploadProgress: this.onApiProgress, // Upload progress
          onDownloadProgress: this.onApiProgress, // Download progress
        }
      },
      (error) => {
        this.onApiError()
        return Promise.reject(error)
      }
    )
  },
  methods: {
    onApiProgress(progressEvent) {
      if (progressEvent.lengthComputable) {
        // Update isApiRequestInProgress based on request progress
        this.isApiRequestInProgress =
          Math.floor(progressEvent.loaded / progressEvent.total) >= 1
        this.allowApiLoadingSpinnerDisplay = this.isApiRequestInProgress
      } else {
        // Set timeout to change isApiRequestInProgress to false until next progress event comes in
        // TODO: consider adding response header with actual size in order to calculate total (https://github.com/axios/axios/issues/1591)
        this.apiRequestProgressTimeout = window.setTimeout(() => {
          this.isApiRequestInProgress = false
          this.allowApiLoadingSpinnerDisplay = false
        }, this.apiRequestProgressTimeoutDuration)
      }
    },
    onApiError() {
      this.isApiRequestInProgress = false
      this.allowApiLoadingSpinnerDisplay = false
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/App.scss';

.global-p-confirm-popup {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.global-init-logo {
  position: fixed;
  top: calc(50% - 2rem);
  left: calc(50% - 3.5vw);
  max-width: 7vw;
}

.global-init-spinner-container,
.global-api-spinner-container {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  padding: 0.5rem;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 0.4rem;

  p {
    margin: 0 2rem 0 0;
  }
  .p-progress-spinner {
    width: 4rem;
    height: 4rem;
  }
}
.global-init-spinner-container {
  right: 50%;
  bottom: calc(50% - 10rem);
  transform: translateX(calc(50% + 0.25rem));
}

@keyframes p-progress-spinner-color {
  100%,
  0% {
    stroke: $tacticColorCollateral;
  }
  40% {
    stroke: $tacticColorSocialMedia;
  }
  66% {
    stroke: $tacticColorDirectMail;
  }
  80%,
  90% {
    stroke: $tacticColorPR;
  }
}

// Move toast container out of the way of global API spinner
#app .p-toast-bottom-right {
  bottom: 6rem;
}

.global-view-container {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 0;
}

.view-wrapper {
  //.view-wrapper div located in individual view components
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.tooltip-color {
  color: gray;
}

// .view-fade-transition-enter-active {
//   transition: opacity 0.3s 0.2s;
//   transition-timing-function: easeInOutSine;
// }
// .view-fade-transition-leave-active {
//   transition: opacity 0.2s;
//   transition-timing-function: easeOutQuint;
// }
// .view-fade-transition-enter,
// .view-fade-transition-leave-to {
//   opacity: 0;
// }
</style>
