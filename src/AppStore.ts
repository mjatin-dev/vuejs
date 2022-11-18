import Vue from 'vue'
import Vuex, {Store} from 'vuex'
import AppRouter from '@/AppRouter'
import UserSetup from './app-shared/models/UserSetup'
import AccessToken from './app-shared/models/AccessToken'
import AuthenticationService from './app-shared/services/AuthenticationService'
import InitialResponse from './app-shared/models/InitialResponse'
import Plan from './app-shared/models/Plan'
import Role from './app-shared/models/Role'
import User, {UserMostRecentView} from './app-shared/models/User'
import Account from './app-shared/models/Account'
import AccountsService from './app-shared/services/AccountsService'
import ChannelsService from './app-shared/services/ChannelsService'
import CommentsService from './app-shared/services/CommentsService'
import CustomViewsService from './app-shared/services/CustomViewsService'
import PlansService from './app-shared/services/PlansService'
import FeedbackService from './app-shared/services/FeedbackService'
import TacticsService from './app-shared/services/TacticsService'
import UsersService from './app-shared/services/UsersService'
import TagsService from './app-shared/services/TagsService'
import Subscription from './app-shared/models/Subscription'
import Channel from './app-shared/models/Channel'
import Tactic from './app-shared/models/Tactic'
import axios from 'axios'
import AlertMessage, {
  AlertMessageSeverity,
} from './app-shared/models/AlertMessage'
import Tag from './app-shared/models/Tag'
import ID from './app-shared/models/ID'
import TacticType from './app-shared/models/TacticType'
import TacticsImportMapping from './app-shared/models/TacticsImportMapping'
import DuplicateSubscriptionEventMapping from './app-shared/models/DuplicateSubscriptionEventMapping'
import UserRole from './app-shared/models/UserRole'
import {rrulestr} from 'rrule'
import {isSameDay, differenceInMinutes, addMinutes} from 'date-fns'
import TacticPlatform from './app-shared/models/TacticPlatform'
import BudgetsService from './app-shared/services/BudgetsService'
import DocumentsService from './app-shared/services/DocumentsService'
import PlanDocumentCategory from './app-shared/models/PlanDocumentCategory'
import PlanDocument from './app-shared/models/PlanDocument'

Vue.use(Vuex)
// Vuex.Store.prototype.$toast = Vue.prototype.$toast

export default new Vuex.Store({
  state: {
    services: {
      accounts: new AccountsService(),
      authentication: new AuthenticationService(),
      channels: new ChannelsService(),
      comments: new CommentsService(),
      customViews: new CustomViewsService(),
      feedback: new FeedbackService(),
      plans: new PlansService(),
      tactics: new TacticsService(),
      users: new UsersService(),
      tags: new TagsService(),
      budgets: new BudgetsService(),
      documents: new DocumentsService(),
    },

    isAppInitialized: false as boolean,
    isUserLoggedIn: false as boolean,
    accessToken: {} as AccessToken,
    refreshAccessTokenTimer: {},

    isGlobalNavCollapsed: false,

    currentUser: {} as User,
    channelList: [] as Channel[],
    currentAccount: {} as Account,
    currentAccountUserRoles: [] as UserRole[],
    currentAccountUsers: [] as User[],
    currentPlanIntID: 0 as number,
    currentTacticIntID: 0 as number,
    allUserAccounts: [] as Account[],

    allRoles: [] as Role[],
    allSubscriptions: [] as Subscription[],

    isLeadPlanVisible: false as boolean,
    visibleNestedPlansIntIds: [] as number[],
    selectedChannelsIntIds: [] as number[],
    selectedInitiativesIntIds: [] as number[],
    selectedTagsIntIds: [] as number[],
    selectedSubscriptionsIntIds: [] as number[],

    isNestedPlanFilterActive: false as boolean,
    isChannelFilterActive: false as boolean,
    isInitiativeFilterActive: false as boolean,
    isTagFilterActive: false as boolean,
    isSubscriptionFilterActive: false as boolean,

    currentDateRange: [] as Date[],
    initiativeTypeNamesDict: {
      campaign: 'campaign',
      promotion: 'promotion',
      keyDate: 'key date',
    } as {},
    socialTacticPlatformNamesDict: [
      'Twitter',
      'Facebook',
      'Instagram',
      'Pinterest',
      'LinkedIn',
      'Snapchat',
      'WhatsApp',
      'TikTok',
      'Tumblr',
      'Reddit',
    ] as string[],
    defaultChannelNamesSortOrder: [
      'Website',
      'Email',
      'Social Media',
      'Signage',
      'Collateral',
      'Direct Mail',
      'PR',
      'Advertising Assets',
      'Paid Search',
      'Social Advertising',
      'Display',
      'Print',
      'Out-of-Home',
      'Radio',
      'Cross Channel Video',
    ] as string[],
    annumTeamUserEmailAddressDict: [
      'annum@annumplanning.com',
      'jon@informedfunction.com',
      'shane@partandpixel.com',
    ] as string[],
    monthlyFocusTypeName: 'monthly focus',

    channelViewSelectedChannel: {} as Channel,
    channelViewSelectedType: {} as TacticType,
    channelViewSelectedPlatform: {} as TacticPlatform,
    currentTacticMapping: {} as TacticsImportMapping,
    currentImportedTacticRows: [] as object[],
    activeFiltersCount: '' as string, // badge expecting string
    isFeedbackModalOpen: false as boolean,
    currentSetupPlan: {} as Plan,
    shouldFlushedLocalstorage: 1645568701944,
    isAccountRequestInProgress: false as boolean,
    viewdRoles: [] as Array<ID>,
    routeAccountIntId: 0 as number,
  },

  getters: {
    isAppInitialized: (state) => state.isAppInitialized,
    isUserLoggedIn: (state) => state.isUserLoggedIn,
    accessToken: (state) => state.accessToken,
    currentAccountPermissionLevel: (state, getters) => {
      let lowestAccountPermissionLevel = 1000000
      getters.currentAccount?.users?.forEach((userRole) => {
        if (
          userRole.userId.intID == getters.currentUser.id.intID &&
          userRole.planId.intID == 0
        ) {
          const thisRole = getters.allRoles.find(
            (role) => role.id.intID == userRole.roleId.intID
          )
          lowestAccountPermissionLevel =
            thisRole?.level < lowestAccountPermissionLevel
              ? thisRole?.level
              : lowestAccountPermissionLevel
        }
      })
      if (lowestAccountPermissionLevel < 1000000) {
        return lowestAccountPermissionLevel
      }
      return Role.LEVEL_CONTRIBUTOR
    },
    getPermissionLevelForPlanId: (state, getters) => (planId: ID) => {
      if (!planId) {
        return getters.currentAccountPermissionLevel
      }
      const thisPlan = getters.allPlans.find(
        (plan) => plan.id.intID == planId.intID
      )
      if (thisPlan && thisPlan.users) {
        const thisUserRole = thisPlan.users.find(
          (userRole) => userRole.userId.intID == getters.currentUser.id.intID
        )
        if (
          thisUserRole &&
          thisUserRole.roleId &&
          thisUserRole.roleId.intID != 0
        ) {
          return getters.allRoles.find(
            (role) => role.id.intID == thisUserRole.roleId.intID
          ).level
        }
      }
      return getters.currentAccountPermissionLevel
    },

    isUserAnnumTeamMember: (state, getters) =>
      state.annumTeamUserEmailAddressDict.includes(
        getters.currentUser.emailAddress
      ),

    isGlobalNavCollapsed: (state) => state.isGlobalNavCollapsed,

    isCurrentPlanSet: (state, getters) =>
      getters.currentPlan.id && getters.currentPlan.id.intID != 0
        ? true
        : false,
    isCurrentUserSet: (state) =>
      state.currentUser.id && state.currentUser.id.intID != 0 ? true : false,

    services: (state) => state.services,

    currentUser: (state) => state.currentUser,
    currentAccount: (state) => state.currentAccount,
    currentAccountUserRoles: (state, getters) =>
      getters.currentAccount.users.filter(
        (userRole) => userRole.planId.intID === 0
      ),
    currentAccountUsers: (state) => state.currentAccountUsers,

    currentPlanIntID: (state) => state.currentPlanIntID,
    currentPlan: (state, getters) => {
      let returnValue: Plan = new Plan()
      if (getters.currentAccount && getters.currentAccount.plans) {
        returnValue = getters.currentAccount.plans.find(
          (plan) => plan.id.intID == getters.currentPlanIntID
        )
      }
      return returnValue ? returnValue : new Plan()
    },
    currentPlanUserRoles: (state, getters) =>
      getters.currentPlan.users.filter(
        (userRole) => userRole.planId.intID == getters.currentPlan.id.intID
      ),

    currentTacticIntID: (state) => state.currentTacticIntID,
    currentTactic: (state, getters) => {
      let returnValue: Tactic = new Tactic()
      if (getters.currentPlan && getters.currentPlan.tactics) {
        returnValue = getters.currentPlan.tactics.find(
          (tactic) => tactic.id.intID == getters.currentTacticIntID
        )
      }
      return returnValue ? returnValue : new Tactic()
    },

    mostRecentCoreView: (state) => state.currentUser.mostRecentView,

    currentChannels: (state, getters) => {
      const returnArray = [] as Channel[]
      if (getters.currentPlan.channels) {
        getters.currentPlan.channels.filter((channel) => {
          if (channel.name !== Channel.CHANNEL_NAME_INITIATIVES) {
            returnArray.push(channel)
          }
        })
      }
      //Sort channels by specific order - default channels according to defaultChannelNamesSortOrder first, then any user-generated channels
      const sortByObject = state.defaultChannelNamesSortOrder.reduce(
        (a, c, i) => {
          a[c] = i
          return a
        },
        {}
      )
      return returnArray.sort(
        (a, b) => sortByObject[a.name] - sortByObject[b.name]
      )
    },
    currentInitiatives: (state, getters) => {
      const returnArray = [] as Tactic[]

      if (getters.currentPlan.channels) {
        getters.currentPlan.channels.forEach((channel) => {
          channel.tacticTypes.forEach((type) => {
            if (channel.name == Channel.CHANNEL_NAME_INITIATIVES) {
              type.tactics.forEach((tactic) => {
                returnArray.push(tactic)
              })
            }
          })
        })
      }
      return returnArray
    },
    currentTags: (state, getters) => getters.currentPlan.tags,
    currentSubscriptions: (state, getters) => getters.currentPlan.subscriptions,
    allSubscriptions: (state) => state.allSubscriptions,

    allAccounts: (state) => {
      const usedIds = [] as number[] //API is retusning multiple instances of the same account, this is in place to filter out duplicates
      const returnArray = state.allUserAccounts.filter((account) => {
        if (!usedIds.includes(account.id.intID)) {
          usedIds.push(account.id.intID)
          return account
        }
      })
      return returnArray.sort((a, b) => {
        const textA = a.contactCompanyName.toLowerCase()
        const textB = b.contactCompanyName.toLowerCase()
        return textA < textB ? -1 : textA > textB ? 1 : 0
      })
    },
    allPlans: (state) => {
      if (state.currentAccount && state.currentAccount.plans) {
        const currentPlans = state.currentAccount.plans.filter(
          (plan) => !plan.parentId
        )
        // add nested plans back in array just behind their Lead Plan
        state.currentAccount.plans
          .filter((plan) => !!plan.parentId)
          .forEach((nestedPlan) => {
            // find the index of their Lead Plan
            const leadPlanIndex = currentPlans.findIndex(
              (leadPlan) => leadPlan.id.intID == nestedPlan.parentId.intID
            )
            // insert just after
            currentPlans.splice(leadPlanIndex + 1, 0, nestedPlan)
          })

        return currentPlans
      }
      return []
    },
    allRoles: (state) => state.allRoles,
    allUsersInCurrentAccount: (state, getters) =>
      getters.currentAccount.users.map((userRole) => userRole.user),

    isLeadPlanVisible: (state) => state.isLeadPlanVisible,
    visibleNestedPlansIntIds: (state) => state.visibleNestedPlansIntIds,

    selectedChannels: (state, getters) => {
      return getters.currentChannels.filter((channel) =>
        state.selectedChannelsIntIds.includes(channel.id.intID)
      )
    },
    selectedInitiatives: (state, getters) => {
      return getters.currentInitiatives.filter((tactic) => {
        if (
          state.selectedInitiativesIntIds.includes(tactic.id.intID) &&
          ((!tactic.isLead && !tactic.isNested) ||
            (tactic.isLead && getters.isLeadPlanVisible) ||
            (tactic.isNested &&
              getters.visibleNestedPlansIntIds?.find(
                (planIntId) => planIntId === tactic.planId.intID
              )))
        ) {
          return true
        }
        return false
      })
    },
    selectedTags: (state, getters) => {
      return getters.currentTags.filter((tag) =>
        state.selectedTagsIntIds.includes(tag.id.intID)
      )
    },
    selectedSubscriptions: (state, getters) => {
      return getters.currentSubscriptions.filter((subscription) =>
        state.selectedSubscriptionsIntIds.includes(subscription.id.intID)
      )
    },

    isChannelFilterActive: (state) => state.isChannelFilterActive,
    isInitiativeFilterActive: (state) => state.isInitiativeFilterActive,
    isTagFilterActive: (state) => state.isTagFilterActive,
    isSubscriptionFilterActive: (state) => state.isSubscriptionFilterActive,

    deselectedInitiatives: (state, getters) =>
      getters.currentInitiatives.filter(
        (tactic) =>
          !getters.selectedInitiatives.filter(
            (selectedTactic) => selectedTactic.id.intID == tactic.id.intID
          ).length
      ),
    deselectedTags: (state, getters) =>
      getters.currentTags.filter(
        (tag) =>
          !getters.selectedTags.filter(
            (selectedTag) => selectedTag.id.intID == tag.id.intID
          ).length
      ),

    currentDateRange: (state) => {
      return state.currentDateRange
    },
    paidChannelNames: (state, getters) => {
      return getters.currentChannels.map((channel) => {
        if (channel.isPaidMedia) {
          return channel.name.toLowerCase()
        }
      })
    },
    initiativeTypeNamesDict: (state) => state.initiativeTypeNamesDict,

    socialTacticPlatformNamesDict: (state) =>
      state.socialTacticPlatformNamesDict,

    datePickerYearRange: () => {
      const now = new Date()
      return (
        String(now.getFullYear() - 10) + ':' + String(now.getFullYear() + 10)
      )
    },

    currentDateStartQueryString: (state) => {
      if (!state.currentDateRange[0]) {
        return ''
      }
      return (
        state.currentDateRange[0].getMonth() +
        1 +
        '-' +
        state.currentDateRange[0].getDate() +
        '-' +
        state.currentDateRange[0].getFullYear()
      )
    },
    currentDateEndQueryString: (state) => {
      if (!state.currentDateRange[1]) {
        return ''
      }
      return (
        state.currentDateRange[1].getMonth() +
        1 +
        '-' +
        state.currentDateRange[1].getDate() +
        '-' +
        state.currentDateRange[1].getFullYear()
      )
    },
    visibleNestedPlansQueryString: (state, getters) => {
      let outputString = ''
      getters.visibleNestedPlansIntIds.forEach((element) => {
        outputString += element + ','
      })
      return outputString.slice(0, outputString.length - 1)
    },
    selectedChannelsQueryString: (state, getters) => {
      let outputString = ''
      getters.selectedChannels.forEach((element) => {
        outputString += element.id.intID + ','
      })
      return outputString.slice(0, outputString.length - 1)
    },
    selectedInitiativesQueryString: (state, getters) => {
      let outputString = ''
      getters.selectedInitiatives.forEach((element) => {
        outputString += element.id.intID + ','
      })
      return outputString.slice(0, outputString.length - 1)
    },
    selectedTagsQueryString: (state, getters) => {
      let outputString = ''
      getters.selectedTags.forEach((element) => {
        outputString += element.id.intID + ','
      })
      return outputString.slice(0, outputString.length - 1)
    },
    selectedSubscriptionsQueryString: (state, getters) => {
      let outputString = ''
      getters.selectedSubscriptions.forEach((element) => {
        outputString += element.id.intID + ','
      })
      return outputString.slice(0, outputString.length - 1)
    },

    monthlyFocusTypeName: (state) => state.monthlyFocusTypeName,

    channelViewSelectedChannel: (state) => state.channelViewSelectedChannel,
    channelViewSelectedType: (state) => state.channelViewSelectedType,
    channelViewSelectedPlatform: (state) => state.channelViewSelectedPlatform,
    currentTacticMapping: (state) => state.currentTacticMapping,
    currentImportedTacticRows: (state) => state.currentImportedTacticRows,
    activeFiltersCount: (state) => state.activeFiltersCount,
    isFeedbackModalOpen: (state) => state.isFeedbackModalOpen,

    currentSetupPlan: (state) => state.currentSetupPlan,

    // currentAccountUsers: (state) => state.currentAccount.users,

    isAccountRequestInProgress: (state) => state.isAccountRequestInProgress,
    routeAccountIntId: (state) => state.routeAccountIntId,
    channelList: (state) => state.channelList,
  },

  mutations: {
    updateIsUserLoggedIn: function (state, newValue: boolean) {
      Vue.set(state, 'isUserLoggedIn', newValue)
    },
    updateIsAppInitialized: function (state, newValue: boolean) {
      Vue.set(state, 'isAppInitialized', newValue)
    },
    updateIsGlobalNavCollapsed: function (state, newValue: boolean) {
      Vue.set(state, 'isGlobalNavCollapsed', newValue)
    },
    updateIsLeadPlanVisible: function (state, newValue: boolean) {
      Vue.set(state, 'isLeadPlanVisible', newValue)
    },
    updateVisibleNestedPlansIntIds: function (state, newPlanIds: number[]) {
      Vue.set(state, 'visibleNestedPlansIntIds', newPlanIds)
    },
    updateSelectedChannels: function (state, newChannels: Channel[]) {
      Vue.set(
        state,
        'selectedChannelsIntIds',
        newChannels.map((channel) => channel.id.intID)
      )
    },
    updateSelectedInitiatives: function (state, newInitiatives: Tactic[]) {
      Vue.set(
        state,
        'selectedInitiativesIntIds',
        newInitiatives.map((tactic) => tactic.id.intID)
      )
    },
    updateSelectedTags: function (state, newTags: Tag[]) {
      Vue.set(
        state,
        'selectedTagsIntIds',
        newTags.map((tag) => tag.id.intID)
      )
    },
    updateSelectedSubscriptions: function (
      state,
      newSubscriptions: Subscription[]
    ) {
      Vue.set(
        state,
        'selectedSubscriptionsIntIds',
        newSubscriptions.map((subscription) => subscription.id.intID)
      )
    },

    isNestedPlanFilterActive: function (state, newValue: boolean) {
      Vue.set(state, 'isNestedPlanFilterActive', newValue)
    },
    isChannelFilterActive: function (state, newValue: boolean) {
      Vue.set(state, 'isChannelFilterActive', newValue)
    },
    isInitiativeFilterActive: function (state, newValue: boolean) {
      Vue.set(state, 'isInitiativeFilterActive', newValue)
    },
    isTagFilterActive: function (state, newValue: boolean) {
      Vue.set(state, 'isTagFilterActive', newValue)
    },
    isSubscriptionFilterActive: function (state, newValue: boolean) {
      Vue.set(state, 'isSubscriptionFilterActive', newValue)
    },

    switchAccount: function (state, account: Account) {
      Vue.set(state, 'currentAccount', account)
    },
    updateCurrentPlan: function (state, newPlan: Plan) {
      Vue.set(state, 'currentPlanIntID', newPlan.id.intID)
    },
    updateCurrentPlanIntID: function (state, intID: number) {
      Vue.set(state, 'currentPlanIntID', intID)
    },
    updateCurrentAccount: function (state, newAccount: Account) {
      Vue.set(state, 'currentAccount', newAccount)
    },
    setCurrentTacticIntID: function (state, tacticIntID: number) {
      Vue.set(state, 'currentTacticIntID', tacticIntID)
    },

    updateChannelViewSelectedChannel: function (state, channel: Channel) {
      Vue.set(state, 'channelViewSelectedChannel', channel)
    },
    updateChannelViewSelectedType: function (state, type: TacticType) {
      Vue.set(state, 'channelViewSelectedType', type)
    },
    updateChannelViewSelectedPlatform: function (
      state,
      platform: TacticPlatform
    ) {
      Vue.set(state, 'channelViewSelectedPlatform', platform)
    },
    updateCurrentTacticMapping: function (
      state,
      mapping: TacticsImportMapping
    ) {
      Vue.set(state, 'currentTacticMapping', mapping)
    },
    updateCurrentImportedTacticRows: function (state, rows: object[]) {
      Vue.set(state, 'currentImportedTacticRows', rows)
    },
    updateIsFeedbackModalOpen: function (state, newValue: boolean) {
      Vue.set(state, 'isFeedbackModalOpen', newValue)
    },

    updateCurrentSetupPlan: function (state, newValue: Plan) {
      Vue.set(state, 'currentSetupPlan', newValue)
    },

    clearCurrentAccountUsers: function (state) {
      Vue.set(state, 'currentAccountUsers', [])
    },
    addUserToCurrentAccountUsers: function (state, user: User) {
      state.currentAccountUsers.push(user)
    },

    updateAllSubscriptions: function (state, newSubscriptions: Subscription[]) {
      Vue.set(state, 'allSubscriptions', newSubscriptions)
    },

    updatedViewRoles: function (state, userID) {
      state.viewdRoles.push(userID)
    },
    updateRouteAccountIntId: function (state, newIntId: number) {
      Vue.set(state, 'routeAccountIntId', newIntId)
    },
    updateChannelList: function (state, list) {
      Vue.set(state, 'channelList', list)
    },
  },

  actions: {
    //-----------------------------------------------//
    //Bootstrapping and authentication flow
    //-----------------------------------------------//
    initApp: function (context) {
      return new Promise<void>((resolve) => {
        //Set API comms defaults
        // axios.defaults.baseURL = LOCAL: Check the vue.config.js for parameters.
        // axios.defaults.baseURL = STANGA DEV: 'https://annum.sn77.net/api/' //Stanga QA - test creds: eugen@test.com / eugentest | jon+test01@informedfunction.com / pass
        // axios.defaults.baseURL = ANNUM STAGE: 'https://stagingapi.annumapp.com/api/' //Staging - test creds: shane@partandpixel.com / pass | jon@informedfunction.com / pass | annum@annumplanning.com / pass
        // axios.defaults.baseURL = ANNUM PROD: 'https://api.annumapp.com/api/' //Prod - test creds: ? / ?
        axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL
        axios.defaults.timeout = 100000
        axios.defaults.headers.common['Accept'] = 'application/json'
        axios.defaults.headers.common['Content-Type'] = 'application/json'

        // Flush localstorage if needed
        const lastFlushedLocalstorage =
          window.localStorage.getItem('last-flushed')
        if (lastFlushedLocalstorage) {
          const lastFlushedDate = new Date(Number(lastFlushedLocalstorage))
          const shouldFlushDate = new Date(
            context.state.shouldFlushedLocalstorage
          )
          if (shouldFlushDate > lastFlushedDate) {
            const cachedLgo = window.localStorage.getItem('lgo')
            const cachedAct = window.localStorage.getItem('act')
            window.localStorage.clear()
            window.localStorage.setItem('last-flushed', Date.now().toString())
            if (cachedLgo) {
              window.localStorage.setItem('lgo', cachedLgo)
            }
            if (cachedAct) {
              window.localStorage.setItem('act', cachedAct)
            }
          }
        } else {
          window.localStorage.setItem('last-flushed', Date.now().toString())
        }

        // Check for logged in/out state
        if (!window.localStorage.getItem('lgo')) {
          context.dispatch('refreshAccessToken').finally(() => {
            context.commit('updateIsAppInitialized', true)
            resolve()
          })
        } else {
          context.commit('updateIsAppInitialized', true)
          resolve()
        }
      })
    },
    refreshAccessToken: function (context) {
      return context.state.services.authentication.refreshAccessToken().then(
        (response) => {
          context.dispatch('parseInitialResponse', response)
          context.commit('updateIsUserLoggedIn', true)
          context.dispatch('startRefreshAccessTokenTimer')
        },
        () => {
          context.commit('updateIsUserLoggedIn', false)
        }
      )
    },
    startRefreshAccessTokenTimer: function (context) {
      context.state.refreshAccessTokenTimer = setTimeout(function () {
        context.dispatch('refreshAccessToken')
      }, 86400000)
    },
    checkLoggedInStatus: function (context) {
      const loggedInStatus = window.localStorage.getItem('lgo') ? false : true
      context.commit('updateIsUserLoggedIn', loggedInStatus)
      return loggedInStatus
    },
    login: function (context, userData: UserSetup) {
      return new Promise<void>((resolve, reject) => {
        context.state.services.authentication.login(userData).then(
          (initialResponseObj) => {
            context.dispatch('logInWithInitialResponse', initialResponseObj)
            resolve()
          },
          (error) => {
            Vue.prototype.$toast.add(
              new AlertMessage(AlertMessageSeverity.error, error)
            )
            reject(error)
          }
        )
      })
    },
    logInWithInitialResponse: function (context, initialResponseObj) {
      return new Promise<void>((resolve, reject) => {
        context.dispatch('parseInitialResponse', initialResponseObj)
        context.commit('updateIsUserLoggedIn', true)
        window.localStorage.removeItem('lgo')
        context.dispatch('startRefreshAccessTokenTimer')
        resolve()
      })
    },
    logout: function (context) {
      context.state.services.authentication.logout()
      context.commit('updateIsUserLoggedIn', false)
      window.localStorage.setItem('lgo', '1')
    },
    switchAccount: function (context, accountIntId) {
      return new Promise<void>((resolve, reject) => {
        // Request full account object
        context.state.isAccountRequestInProgress = true

        context.getters.services.accounts.get([accountIntId]).then(
          async (response) => {
            window.localStorage.setItem('act', response.id.intID.toString())

            const userPlan = response.plans.filter((plan) => {
              if (
                plan.users.filter(
                  (userRole) =>
                    userRole.user.id.intID ==
                    context.getters.currentUser.id.intID
                ).length
              ) {
                return true
              }
              return false
            })
            const result: Plan[] = await Promise.all(
              userPlan.map(async (item) => {
                let res = await context
                  .dispatch('getPlanFromID', [item.id.intID])
                  .catch((error) => {
                    console.warn(
                      'AppStore.switchAccount() - error fetching individual/lead plan with getPlanFromID',
                      error
                    )
                  })

                if (res) {
                  res.plans =
                    res.plans.length > 0
                      ? await Promise.all(
                          res.plans.map(async (item) => {
                            const planID = item.intID
                            const resPlans = await context
                              .dispatch('getPlanFromID', [planID])
                              .catch((error) => {
                                console.warn(
                                  'AppStore.switchAccount() - error fetching nested-plan with getPlanFromID',
                                  error
                                )
                              })
                            return resPlans
                          })
                        )
                      : []

                  res.plans = res.plans.filter((plan) => plan.id.intID !== 0) // Filter out nested-plans that failed to be fetched
                } else {
                  res = new Plan()
                }

                return res
              })
            )

            response.plans = result.filter((plan) => plan.id.intID !== 0) // Filter out plans that failed to be fetched
            window.localStorage.setItem('act', response.id.intID.toString())

            context.commit('switchAccount', response)
            context.commit('clearCurrentAccountUsers')
            context.dispatch('getUsersForCurrentAccount')
            context.state.isAccountRequestInProgress = false

            resolve()
          },
          (error) => {
            Vue.prototype.$toast.add(
              new AlertMessage(AlertMessageSeverity.error, error)
            )
            context.state.isAccountRequestInProgress = false
            reject()
          }
        )
      })
    },
    updateCurrentUser: function (context, user) {
      context.commit('currentUser', user)
    },
    parseInitialResponse: function (
      context,
      newInitialResponse: InitialResponse
    ) {
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${newInitialResponse.accessToken.token}`

      Vue.set(context.state, 'accessToken', newInitialResponse.accessToken)
      Vue.set(context.state, 'currentUser', newInitialResponse.user)
      Vue.set(context.state, 'allUserAccounts', newInitialResponse.accounts)
      Vue.set(context.state, 'allRoles', newInitialResponse.roles)

      //Set current date range
      context.dispatch('setDateRangeFromLocalStorage')

      // Determine which account to load
      if (context.getters.routeAccountIntId !== 0) {
        // Set account from ID in route
        const thisAccount = newInitialResponse.accounts.find(
          (account) => account.id.intID === context.getters.routeAccountIntId
        )
        if (thisAccount) {
          Vue.set(context.state, 'currentAccount', thisAccount)
        } else {
          Vue.set(
            context.state,
            'currentAccount',
            newInitialResponse.accounts[0]
          )
        }
      } else {
        // Restore previous plan selection from localstorage
        const localstorageAccountId = window.localStorage.getItem('act')
        let currentAccountIndex = 0
        if (localstorageAccountId && localstorageAccountId !== '') {
          newInitialResponse.accounts.find((account, index) => {
            if (account.id.intID == Number(localstorageAccountId)) {
              currentAccountIndex = index
            }
          })
        }
        Vue.set(
          context.state,
          'currentAccount',
          newInitialResponse.accounts[currentAccountIndex]
        )
        context.commit(
          'updateRouteAccountIntId',
          context.getters.currentAccount.id.intID
        )
      }

      // Request full account object
      context.dispatch('switchAccount', context.getters.routeAccountIntId)

      // Fetch all subscriptions from API
      context.state.services.accounts
        .getSubscriptions(context.getters.routeAccountIntId)
        .then(
          (response) => {
            Vue.set(
              context.state,
              'allSubscriptions',
              response as Subscription[]
            )
          },
          (error) => {
            Vue.prototype.$toast.add(
              new AlertMessage(AlertMessageSeverity.error, error)
            )
          }
        )
    },

    // Refresh subscription

    updateSubscription: function (context) {
      context.state.services.accounts
        .getSubscriptions(context.getters.routeAccountIntId)
        .then(
          (response) => {
            Vue.set(
              context.state,
              'allSubscriptions',
              response as Subscription[]
            )
          },
          (error) => {
            Vue.prototype.$toast.add(
              new AlertMessage(AlertMessageSeverity.error, error)
            )
          }
        )
    },
    //-----------------------------------------------//
    //Update and refresh plan data
    //-----------------------------------------------//
    updateCurrentPlan: function (context, newPlan: Plan) {
      return new Promise<void>((resolve, reject) => {
        //Update Plan object

        context.commit('updateCurrentPlan', newPlan)

        // Set up tactic references
        context.dispatch('addTacticRefsToTypes')

        //Update most recent plan on User
        Vue.set(context.state.currentUser, 'mostRecentPlanId', newPlan.id.intID)

        context.getters.services.users.update(context.getters.currentUser)

        //Reset filters for new plan
        context.dispatch('resetSelectedFilters')

        //Fetch Subscription events
        context.dispatch('fetchSubscriptionEvents').finally(() => {
          context
            .dispatch('mapDuplicateSubscriptionEvents')
            .finally(() => resolve())
        })
      })
    },
    updateCurrentPlanById: function (context, newPlanId: ID) {
      return new Promise<void>((resolve, reject) => {
        if (!context.getters.allPlans.length) {
          context
            .dispatch('switchAccount', context.getters.routeAccountIntId)
            .then(
              () => {
                context.commit('updateCurrentPlanIntID', newPlanId.intID)
                context.dispatch('refreshCurrentPlan').then((responsePlan) => {
                  if (
                    AppRouter.currentRoute.params.planId &&
                    AppRouter.currentRoute.params.planId !==
                      newPlanId.intID.toString()
                  ) {
                    AppRouter.replace({
                      params: {planId: newPlanId.intID.toString()},
                    })
                  }
                  resolve()
                })
              },
              (error) => {
                reject(
                  'AppStore.actions.updateCurrentPlanById: Could not find Plan for ID.'
                )
              }
            )
        } else {
          const newPlan = context.getters.allPlans.find(
            (plan) => plan.id.intID == newPlanId.intID
          ) as Plan

          if (newPlan) {
            context.commit('updateCurrentPlanIntID', newPlanId.intID)
            context.dispatch('refreshCurrentPlan').then((responsePlan) => {
              if (
                AppRouter.currentRoute.params.planId &&
                AppRouter.currentRoute.params.planId !==
                  newPlan.id.intID.toString()
              ) {
                AppRouter.replace({
                  params: {planId: newPlan.id.intID.toString()},
                })
              }
              resolve()
            })
          } else {
            reject(
              'AppStore.actions.updateCurrentPlanById: Could not find Plan for ID.'
            )
          }
        }
      })
    },
    updateInitiatives: function (state, newInitiatives: Tactic[]) {
      Vue.set(
        state,
        'selectedInitiativesIntIds',
        newInitiatives.map((tactic) => tactic.id.intID)
      )
    },
    resetSelectedFilters: function (context) {
      return new Promise<void>((resolve, reject) => {
        context.commit('updateIsLeadPlanVisible', true)
        if (context.getters.currentPlan.plans.length) {
          context.commit(
            'updateVisibleNestedPlansIntIds',
            context.getters.currentPlan.plans.map((planId) => planId.intID)
          )
        } else if (context.getters.currentPlan.parentId.intID !== 0) {
          context.commit('updateVisibleNestedPlansIntIds', [
            context.getters.currentPlan.id.intID,
          ])
        }
        context.commit('isNestedPlanFilterActive', false)

        context.commit(
          'updateSelectedChannels',
          context.getters.currentChannels
        )
        context.commit('isChannelFilterActive', false)
        context.commit('updateSelectedTags', context.getters.currentTags)
        context.commit('isTagFilterActive', false)
        context.commit('updateSelectedSubscriptions', [])
        context.commit('isSubscriptionFilterActive', false)
        context.commit(
          'updateSelectedInitiatives',
          context.getters.currentInitiatives
        )
        context.commit('isInitiativeFilterActive', false)
        context.dispatch('setSelectedPlanPropertiesFromLocalStorage')
        resolve()
      })
    },
    refreshCurrentPlan: function (context) {
      //TODO: This is in place because Plan is the only API that returns whole objects for Channels, Categories, Types, Fields and Tactics. Consider revising this system with API and/or UI changes to be more efficient in the future.
      return new Promise((resolve, reject) => {
        context.state.services.plans
          .get(context.getters.currentPlan.id.intID)
          .then(
            async (returnedPlan) => {
              const userDetails: Plan = (returnedPlan as Plan);
              
              userDetails.users  = await Promise.all(
                (returnedPlan as Plan).users.map(async (item) => {
                  const userDetail: UserRole[] =
                    await context.state.services.users.getRoles([item.id.intID])
                  if (userDetail) {
                    const values = item;
                    values.channels = userDetail ? userDetail[0]?.channels : []
                    return values
                  } else {
                    return new UserRole()
                  }
                })
              );
           
              const returnedPlanIndex =
                context.getters.currentAccount.plans.findIndex(
                  (plan) => plan.id.intID == (returnedPlan as Plan).id.intID
                )
              context.getters.currentAccount.plans.splice(
                returnedPlanIndex ? returnedPlanIndex : 0,
                1,
                returnedPlan
              )

              context
                .dispatch('updateCurrentPlan', returnedPlan)
                .finally(() => resolve(returnedPlan))
            },
            (error) => {
              Vue.prototype.$toast.add(
                new AlertMessage(AlertMessageSeverity.error, error)
              )
              reject(error)
            }
          )
      })
    },
    refreshCurrentAccount: function (context) {
      return new Promise((resolve, reject) => {
        context.state.services.accounts
          .get(context.getters.currentAccount.id.intID)
          .then(
            (returnedAccount) => {
              context.commit('updateCurrentAccount', returnedAccount)
              context.dispatch('getUsersForCurrentAccount')
              resolve(returnedAccount)
            },
            (error) => {
              Vue.prototype.$toast.add(
                new AlertMessage(AlertMessageSeverity.error, error)
              )
              reject(error)
            }
          )
      })
    },
    getUsersForCurrentAccount: function (context) {
      // Only fetch users that are not already fetched and only fetch a user once
      const userIntIdsToFetch = [
        ...new Set(
          context.getters.currentAccount.users
            .map((userRole) => userRole.userId.intID)
            .filter(
              (intId) =>
                !context.state.currentAccountUsers
                  .map((user) => user.id.intID)
                  .includes(intId)
            )
        ),
      ] as number[]
      userIntIdsToFetch.forEach((userIntId) => {
        context.state.services.users.get(userIntId).then(
          (user) => {
            context.commit('addUserToCurrentAccountUsers', user as User)
          },
          (error) => {
            Vue.prototype.$toast.add(
              new AlertMessage(AlertMessageSeverity.error, error)
            )
          }
        )
      })
    },
    getUsersForCurrentPlan: function (context) {
      // Only fetch users that are not already fetched and only fetch a user once
      const userIntIdsToFetch = [
        ...new Set(
          context.getters.currentPlan.users
            .map((userRole) => userRole.userId.intID)
            .filter(
              (intId) =>
                !context.state.currentAccountUsers
                  .map((user) => user.id.intID)
                  .includes(intId)
            )
        ),
      ] as number[]
      userIntIdsToFetch.forEach((userIntId) => {
        context.state.services.users.get(userIntId).then(
          (user) => {
            context.commit('addUserToCurrentAccountUsers', user as User)
          },
          (error) => {
            Vue.prototype.$toast.add(
              new AlertMessage(AlertMessageSeverity.error, error)
            )
          }
        )
      })
    },
    refreshCurrentTactic: function (context, updatedTactic?: Tactic) {
      return new Promise((resolve, reject) => {
        if (updatedTactic) {
          const indexOfCurrentTactic =
            context.getters.currentPlan.tactics.findIndex(
              (tactic) => tactic.id.intID == context.getters.currentTacticIntID
            )
          context.getters.currentPlan.tactics.splice(
            indexOfCurrentTactic,
            1,
            updatedTactic
          )
          context.dispatch('addTacticRefsToTypes')
          resolve(context.getters.currentPlan.tactics[indexOfCurrentTactic])
        } else {
          context.state.services.tactics
            .get([context.getters.currentTacticIntID])
            .then(
              (returnedTactic) => {
                const indexOfCurrentTactic =
                  context.getters.currentPlan.tactics.findIndex(
                    (tactic) =>
                      tactic.id.intID == context.getters.currentTacticIntID
                  )
                context.getters.currentPlan.tactics.splice(
                  indexOfCurrentTactic,
                  1,
                  returnedTactic
                )
                context.dispatch('addTacticRefsToTypes')
                resolve(
                  context.getters.currentPlan.tactics[indexOfCurrentTactic]
                )
              },
              (error) => {
                Vue.prototype.$toast.add(
                  new AlertMessage(AlertMessageSeverity.error, error)
                )
                reject(error)
              }
            )
        }
      })
    },
    addTacticToCurrentPlan: function (context, newTactic: Tactic) {
      return new Promise<void>((resolve, reject) => {
        context.getters.currentPlan.tactics.push(newTactic)
        context.dispatch('addTacticRefsToTypes')
        resolve()
      })
    },
    removeTacticFromCurrentPlanById: function (context, tacticId: ID) {
      return new Promise<void>((resolve, reject) => {
        const indexOfTactic = context.getters.currentPlan.tactics.findIndex(
          (tactic) => tactic.id.intID == tacticId.intID
        )
        if (indexOfTactic) {
          context.getters.currentPlan.tactics.splice(indexOfTactic, 1)
          context.dispatch('addTacticRefsToTypes')
          resolve()
        } else {
          reject('Could not find tactic for ID.')
        }
      })
    },
    addTacticRefsToTypes: function (context) {
      return new Promise<void>((resolve, reject) => {
        //Add Tactic instance references on Plan to TacticType instances
        context.getters.currentPlan.channels.forEach((channel) => {
          const planForThisChannel =
            context.getters.currentPlan.id.intID !== channel.planId.intID
              ? context.getters.allPlans.find(
                  (plan) => plan.id.intID == channel.planId.intID
                )
              : null
          const abbreviatedPlanNameFromChannel = planForThisChannel
            ? planForThisChannel.abbreviatedName
            : ''
          if (channel.isNested && abbreviatedPlanNameFromChannel !== '') {
            channel.abbreviatedPlanName = abbreviatedPlanNameFromChannel
          }
          channel.tacticTypes.forEach((type) => {
            if (channel.isNested && abbreviatedPlanNameFromChannel !== '') {
              type.abbreviatedPlanName = abbreviatedPlanNameFromChannel
            }

            //Set names on Type instances
            type.channelName = channel.name

            type.tactics = context.getters.currentPlan.tactics.filter(
              (tactic) => {
                if (tactic.tacticTypeId.intID == type.id.intID) {
                  //Set names on Tactic instances
                  tactic.channelName = channel.name

                  if (tactic.isNested) {
                    if (abbreviatedPlanNameFromChannel !== '') {
                      tactic.abbreviatedPlanName =
                        abbreviatedPlanNameFromChannel
                    } else {
                      tactic.abbreviatedPlanName =
                        context.getters.allPlans.find(
                          (plan) => plan.id.intID == tactic.planId.intID
                        )?.abbreviatedName
                    }
                  }

                  return tactic
                }
              }
            )
          })
        })
        // Add abbreviated plan names to tags
        context.getters.currentPlan.tags.forEach((tag) => {
          const planForThisTag =
            context.getters.currentPlan.id.intID !== tag.planId.intID
              ? context.getters.allPlans.find(
                  (plan) => plan.id.intID == tag.planId.intID
                )
              : null
          const abbreviatedPlanNameFromTag = planForThisTag
            ? planForThisTag.abbreviatedName
            : ''
          if (tag.isNested && abbreviatedPlanNameFromTag !== '') {
            tag.abbreviatedPlanName = abbreviatedPlanNameFromTag
          }
        })
        resolve()
      })
    },
    updateMostRecentCoreView: function (context, viewName: UserMostRecentView) {
      return new Promise<void>((resolve, reject) => {
        context.state.currentUser.mostRecentView = viewName
        //TODO: persist currentUser.mostRecentView change to API
        resolve()
      })
    },
    fetchSubscriptionEvents: function (context) {
      let processedSubscriptions = 0
      return new Promise<void>((resolve, reject) => {
        if (!context.getters.currentSubscriptions.length) {
          resolve()
        } else {
          context.getters.currentSubscriptions.forEach(
            async (subscription, subscriptionIndex) => {
              if (
                !subscription.events.length ||
                Date.now() - subscription.lastUpdate.getTime() > 86400000
              ) {
                await context.state.services.accounts
                  .getSubscriptionEvents(subscription)
                  .then(
                    (response) => {
                      subscription.lastUpdate = new Date()
                      subscription.events = response as Tactic[]

                      subscription.events.forEach(
                        (subscriptionEvent, eventIndex) => {
                          const thisIntId = Number(
                            subscriptionIndex.toString() + eventIndex.toString()
                          )
                          subscriptionEvent.id = new ID(
                            thisIntId,
                            '/' + subscription.name + '/' + thisIntId.toString()
                          )
                          subscriptionEvent.channelName = subscription.name
                          subscriptionEvent.isSubscriptionEvent = true
                          // Should event be allDay?
                          if (
                            subscriptionEvent.startDate &&
                            subscriptionEvent.endDate &&
                            subscriptionEvent.endDate -
                              subscriptionEvent.startDate >=
                              86400000 &&
                            subscriptionEvent.startDate.getUTCHours() == 0 &&
                            subscriptionEvent.endDate.getUTCHours() == 0
                          ) {
                            subscriptionEvent.isAllDay = true
                            subscriptionEvent.startDate.setDate(
                              subscriptionEvent.startDate.getDate() + 1
                            )
                          }
                        }
                      )

                      processedSubscriptions += 1
                      if (
                        processedSubscriptions ==
                        context.getters.currentSubscriptions.length
                      ) {
                        resolve()
                      }
                    },
                    (error) => {
                      Vue.prototype.$toast.add(
                        new AlertMessage(
                          AlertMessageSeverity.error,
                          'Error Fetching Subscription Events',
                          error
                        )
                      )
                      processedSubscriptions += 1
                      if (
                        processedSubscriptions ==
                        context.getters.currentSubscriptions.length
                      ) {
                        reject()
                      }
                    }
                  )
              } else {
                processedSubscriptions += 1
                if (
                  processedSubscriptions ==
                  context.getters.currentSubscriptions.length
                ) {
                  resolve()
                }
              }
            }
          )
        }
      })
    },
    mapDuplicateSubscriptionEvents: function (context) {
      return new Promise<void>((resolve, reject) => {
        if (!context.getters.currentSubscriptions.length) {
          resolve()
        } else {
          context.getters.currentSubscriptions.forEach(
            (subscription, subscriptionIndex) => {
              subscription.duplicateEventsMap = []
              subscription.events.forEach((event) => {
                context.getters.currentSubscriptions.forEach(
                  (testSubscription) => {
                    if (testSubscription.id.intID == subscription.id.intID) {
                      return
                    }
                    const duplicateEvents = testSubscription.events.filter(
                      (testEvent) => {
                        if (
                          event.title == testEvent.title &&
                          ((event.isAllDay && testEvent.isAllDay) ||
                            (event.startDate == testEvent.startDate &&
                              event.endDate == testEvent.endDate))
                        ) {
                          return true
                        }
                        return false
                      }
                    )
                    if (duplicateEvents.length) {
                      const formattedDuplicateEvents = duplicateEvents.map(
                        (duplicateEvent) => {
                          return new DuplicateSubscriptionEventMapping(
                            subscription.id.intID,
                            event.id.intID,
                            testSubscription.id.intID,
                            duplicateEvent.id.intID
                          )
                        }
                      )
                      subscription.duplicateEventsMap =
                        subscription.duplicateEventsMap.concat(
                          formattedDuplicateEvents
                        )
                    }
                  }
                )
              })

              if (
                subscriptionIndex + 1 ==
                context.getters.currentSubscriptions.length
              ) {
                resolve()
              }
            }
          )
        }
      })
    },

    setupDocumentToCategoriesForCurrentPlan: function ({
      state,
      commit,
      getters,
    }) {
      const plan = getters.currentPlan
      const documents: PlanDocument[] = getters.currentPlan.documents
      const planDocumentCategories = getters.currentPlan.planDocumentCategories

      if (
        planDocumentCategories[planDocumentCategories.length - 1]?.id?.intID !==
        0
      ) {
        planDocumentCategories.push(new PlanDocumentCategory('Uncategorized'))
      }

      plan.planDocumentCategories = planDocumentCategories.map((category) => {
        const isUncategorized = category.name === 'Uncategorized'

        category.planDocuments = documents
          .map((doc) => {
            const categoryIndex = doc.categories.find(
              (c) => c.id?.intID === category.id?.intID
            )

            if (categoryIndex) {
              return doc
            } else if (isUncategorized && categoryIndex === -1) {
              return doc
            } else {
              return new PlanDocument()
            }
          })
          .filter((doc) => doc.id.intID !== 0)

        return category
      }) as PlanDocumentCategory[]

      commit('refreshCurrentPlan', plan)
    },

    setupDocumentToCategories: function ({state, commit}) {
      const plan = state.currentSetupPlan
      const documents: PlanDocument[] = state.currentSetupPlan.documents
      const planDocumentCategories =
        state.currentSetupPlan.planDocumentCategories

      if (
        planDocumentCategories[planDocumentCategories.length - 1]?.id?.intID !==
        0
      ) {
        planDocumentCategories.push(new PlanDocumentCategory('Uncategorized'))
      }

      plan.planDocumentCategories = planDocumentCategories.map((category) => {
        const isUncategorized = category.name === 'Uncategorized'

        category.planDocuments = documents
          .map((doc) => {
            const categoryIndex = doc.categories.find(
              (c) => c.id?.intID === category.id?.intID
            )

            if (categoryIndex) {
              return doc
            } else if (isUncategorized && categoryIndex === -1) {
              return doc
            } else {
              return new PlanDocument()
            }
          })
          .filter((doc) => doc.id.intID !== 0)

        return category
      }) as PlanDocumentCategory[]

      commit('updateCurrentSetupPlan', plan)
    },

    refreshCurrentSetupPlan: function (context) {
      return new Promise((resolve, reject) => {
        context.state.services.plans
          .get(context.getters.currentSetupPlan.id.intID)
          .then(
            (returnedPlan) => {
              context.commit('updateCurrentSetupPlan', returnedPlan)
              resolve(returnedPlan)
            },
            (error) => {
              Vue.prototype.$toast.add(
                new AlertMessage(AlertMessageSeverity.error, error)
              )
              reject(error)
            }
          )
      })
    },
    //-----------------------------------------------//
    //Manage filters and localstorage
    //-----------------------------------------------//
    readQueryParams: function (context, queryParams) {
      return new Promise<void>((resolve, reject) => {
        //Test query string: ?ds-47=1-1-2021&de-47=12-31-2021&ch-47=12,13&in-47=21&tg-47=33,32&sb-47=44
        Object.keys(queryParams).forEach((param) => {
          if (queryParams[param]) {
            window.localStorage.setItem(param, queryParams[param])
          } else {
            window.localStorage.removeItem(param)
          }
        })
        resolve()
      })
    },
    setDateRangeFromLocalStorage: function (context) {
      return new Promise<void>((resolve, reject) => {
        const filters = {
          ds: window.localStorage.getItem(
            'ds-' + context.getters.currentPlanIntID.toString()
          ),
          de: window.localStorage.getItem(
            'de-' + context.getters.currentPlanIntID.toString()
          ),
        }

        //Start date
        const startDate = new Date()
        if (filters.ds !== null) {
          const startDateLocalData = filters.ds.split('-')
          startDate.setDate(Number(startDateLocalData[1]))
          startDate.setMonth(Number(startDateLocalData[0]) - 1)
          startDate.setFullYear(Number(startDateLocalData[2]))
        } else {
          startDate.setDate(1)
        }
        Vue.set(context.state.currentDateRange, 0, startDate)
        //End date
        const endDate = new Date()
        if (filters.de !== null) {
          const endDateLocalData = filters.de.split('-')
          endDate.setDate(Number(endDateLocalData[1]))
          endDate.setMonth(Number(endDateLocalData[0]) - 1)
          endDate.setFullYear(Number(endDateLocalData[2]))
        } else {
          endDate.setMonth(endDate.getMonth() + 1)
          endDate.setDate(0)
        }
        Vue.set(context.state.currentDateRange, 1, endDate)
        resolve()
      })
    },
    setSelectedPlanPropertiesFromLocalStorage: function (context) {
      return new Promise<void>((resolve, reject) => {
        const filters = {
          ch: window.localStorage.getItem(
            'ch-' + context.getters.currentPlanIntID.toString()
          ),
          in: window.localStorage.getItem(
            'in-' + context.getters.currentPlanIntID.toString()
          ),
          tg: window.localStorage.getItem(
            'tg-' + context.getters.currentPlanIntID.toString()
          ),
          sb: window.localStorage.getItem(
            'sb-' + context.getters.currentPlanIntID.toString()
          ),
        }

        context.dispatch(
          'setActiveFiltersCount',
          Object.values(filters).reduce((acc, currValue) => {
            if (currValue) {
              return acc + currValue?.split(',').length
            }
            return acc
          }, 0)
        )

        //Date range
        context.dispatch('setDateRangeFromLocalStorage')
        //Channels
        if (filters.ch !== null) {
          if (filters.ch.length > 0) {
            const filterIds = filters.ch.split(',')
            context.commit(
              'updateSelectedChannels',
              context.getters.currentChannels.filter(
                (channel) => filterIds.indexOf(channel.id.intID.toString()) > -1
              )
            )
            context.commit('isChannelFilterActive', true)
          } else {
            context.commit('updateSelectedChannels', [])
            context.commit('isChannelFilterActive', false)
          }
        } else {
          context.commit(
            'updateSelectedChannels',
            context.getters.currentChannels
          )
          context.commit('isChannelFilterActive', false)
        }
        //Initiatives
        if (filters.in !== null) {
          const filterIds = filters.in.split(',')
          if (filters.in.length > 0) {
            context.commit(
              'updateSelectedInitiatives',
              context.getters.currentInitiatives.filter(
                (initiative) =>
                  filterIds.indexOf(initiative.id.intID.toString()) > -1
              )
            )
            context.commit('isInitiativeFilterActive', true)
          } else {
            context.commit('updateSelectedInitiatives', [])
            context.commit('isInitiativeFilterActive', false)
          }
        } else {
          context.commit(
            'updateSelectedInitiatives',
            context.getters.currentInitiatives
          )
          context.commit('isInitiativeFilterActive', false)
        }
        //Tags
        if (filters.tg !== null) {
          if (filters.tg.length > 0) {
            const filterIds = filters.tg.split(',')
            context.commit(
              'updateSelectedTags',
              context.getters.currentTags.filter(
                (tag) => filterIds.indexOf(tag.id.intID.toString()) > -1
              )
            )
            context.commit('isTagFilterActive', true)
          } else {
            context.commit('updateSelectedTags', [])
            context.commit('isTagFilterActive', false)
          }
        } else {
          context.commit('updateSelectedTags', context.getters.currentTags)
          context.commit('isTagFilterActive', false)
        }
        //Subscriptions
        if (filters.sb !== null) {
          if (filters.sb.length > 0) {
            const filterIds = filters.sb.split(',')
            context.commit(
              'updateSelectedSubscriptions',
              context.getters.currentSubscriptions.filter(
                (subscription) =>
                  filterIds.indexOf(subscription.id.intID.toString()) > -1
              )
            )
            context.commit('isSubscriptionFilterActive', true)
          } else {
            context.commit('updateSelectedSubscriptions', [])
            context.commit('isSubscriptionFilterActive', false)
          }
        } else {
          context.commit('updateSelectedSubscriptions', [])
          context.commit('isSubscriptionFilterActive', false)
        }
        resolve()
      })
    },
    updateCurrentDateRange: function (context, newDateRange: Date[]) {
      Vue.set(context.state, 'currentDateRange', [...newDateRange])
      window.localStorage.setItem(
        'ds-' + context.getters.currentPlanIntID.toString(),
        context.getters.currentDateStartQueryString
      )
      window.localStorage.setItem(
        'de-' + context.getters.currentPlanIntID.toString(),
        context.getters.currentDateEndQueryString
      )
    },
    updateFeedbackModal: function (context, isOpen: boolean) {
      context.commit('updateIsFeedbackModalOpen', isOpen)
    },
    removeRecurringTacticClones: function (context) {
      context.getters.selectedChannels.forEach((channel) => {
        channel.tacticTypes.forEach((type) => {
          type.tactics = type.tactics.filter((tactic) => {
            return !tactic.isRecurringEventClone
          })
        })
      })
    },
    addRecurringTacticClones: function (context, type) {
      type.tactics.forEach((tactic) => {
        if (!tactic.rrule) {
          return
        }
        const diff = differenceInMinutes(
          type.tactics[0].startDate,
          type.tactics[0].endDate
        )
        const rules = rrulestr(tactic.rrule)
        const recurrenceDates = rules.between(
          context.state.currentDateRange[0],
          context.state.currentDateRange[1]
        )

        // filter out actual event
        const newRecurrenceDates = recurrenceDates.filter((event) => {
          return !isSameDay(event, tactic.startDate)
        })

        if (newRecurrenceDates.length) {
          let newRecurrences = newRecurrenceDates.map((recurrenceDate) => {
            return {
              ...tactic,
              startDate: recurrenceDate,
              endDate: addMinutes(recurrenceDate, diff),
              isRecurringEventClone: true,
            }
          })

          // need to filter out here because on refresh it tries to add them again
          newRecurrences = newRecurrences.filter((newRecurrence) => {
            const match = type.tactics.find((t) => {
              return (
                isSameDay(newRecurrence.startDate, t.startDate) &&
                tactic.id.apiID === t.id.apiID
              )
            })
            return !match
          })

          type.tactics = type.tactics.concat(newRecurrences)
        }
      })
    },
    setActiveFiltersCount(context, count) {
      Vue.set(
        context.state,
        'activeFiltersCount',
        count == '0' ? '' : count.toString()
      )
    },
    getViewRoles(context) {
      return new Promise((resolve, reject) => {
        context.state.services.plans
          .getViewedRoles()
          .then((response) => {
            resolve(true)
          })
          .catch((error) => reject(error))
      })
    },
    updateViewRoles(context, payload) {
      return new Promise((resolve, reject) => {
        context.state.services.plans
          .updateVisitedPlan(payload)
          .then((response) => {
            resolve(response)
          })
          .catch((error) => reject(error))
      })
    },

    getPlanFromID: (context, payload) => {
      return new Promise((resolve, reject) => {
        context.state.services.plans
          .get(payload)
          .then((response) => {
            resolve(response)
          })
          .catch((error) => reject(error))
      })
    },

    //-----------------------------------------------//
    //API communication pass-throughs
    //-----------------------------------------------//

    //Account Service
    // createAccount(context, newAccount: Account) {
    //   return context.state.services.accounts.create(newAccount).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // getAccount(context, ids: number[]) {
    //   return context.state.services.accounts.get(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // updateAccount(context, updatedAccount: Account) {
    //   return context.state.services.accounts.update(updatedAccount).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // deleteAccount(context, ids: number[]) {
    //   return context.state.services.accounts.delete(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // getAccountRoles(context) {
    //   return context.state.services.accounts.getRoles().then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // getAccountSubscriptions(context) {
    //   return context.state.services.accounts.getSubscriptions().then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    //Channel Service
    // createChannel(context, newChannel: Channel) {
    //   return context.state.services.channels.create(newChannel).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // getChannel(context, ids: number[]) {
    //   return context.state.services.channels.get(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // updateChannel(context, updatedChannel: Channel) {
    //   return context.state.services.channels.update(updatedChannel).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // deleteChannel(context, ids: number[]) {
    //   return context.state.services.channels.delete(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // createTacticCategory(context, newTacticCategory: TacticCategory) {
    //   return context.state.services.channels
    //     .createTacticCategory(newTacticCategory)
    //     .then(
    //       (response) => {
    //         return response
    //       },
    //       (error) => {
    //         Vue.prototype.$toast.add(
    //           new AlertMessage(AlertMessageSeverity.error, error)
    //         )
    //       }
    //     )
    // },

    // CommentService
    // createComment(context, newComment: Comment) {
    //   return context.state.services.comments.create(newComment).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // getComment(context, ids: number[]) {
    //   return context.state.services.comments.get(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // updateComment(context, updatedComment: Comment) {
    //   return context.state.services.comments.update(updatedComment).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // deleteComment(context, ids: number[]) {
    //   return context.state.services.comments.delete(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    //Tactics Service
    // createTactic(context, newTactic: Tactic) {
    //   return context.state.services.tactics.create(newTactic).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // getTactic(context, ids: number[]) {
    //   return context.state.services.tactics.get(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // updateTactic(context, updatedTactic: Tactic) {
    //   return context.state.services.tactics.update(updatedTactic).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // deleteTactic(context, ids: number[]) {
    //   return context.state.services.tactics.delete(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // importTactic(context, fileBinary: string) {
    //   return context.state.services.tactics.import(fileBinary).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // searchTactic(context, params) {
    //   return context.state.services.tactics
    //     .search(
    //       params.planId,
    //       params.keyword,
    //       params.startDate,
    //       params.endDate,
    //       params.userId,
    //       params.channelId,
    //       params.typeId
    //     )
    //     .then(
    //       (response) => {
    //         return response
    //       },
    //       (error) => {
    //         Vue.prototype.$toast.add(
    //           new AlertMessage(AlertMessageSeverity.error, error)
    //         )
    //       }
    //     )
    // },

    //User service
    // createUser(context, newUser: User) {
    //   return context.state.services.users.create(newUser).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // getUser(context, ids: number[]) {
    //   return context.state.services.users.get(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // updateUser(context, updatedUser: User) {
    //   return context.state.services.users.update(updatedUser).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // deleteUser(context, userToDelete: User) {
    //   return context.state.services.users.delete(userToDelete).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // inviteUser(context, newUserInvite: UserInvite) {
    //   return context.state.services.users.invite(newUserInvite).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // deleteUserInvite(context, ids: number[]) {
    //   return context.state.services.users.deleteUserInvite(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // forgotPassword(context, emailAddress: string) {
    //   return context.state.services.users.forgotPassword(emailAddress).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // mediaAsset(context, file) {
    //   return context.state.services.users.mediaAsset(file).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    //TagService
    // createTag(context, newTactic: Tag) {
    //   return context.state.services.tags.create(newTactic).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // getTag(context, ids: number[]) {
    //   return context.state.services.tags.get(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // updateTag(context, updatedTactic: Tag) {
    //   return context.state.services.tags.update(updatedTactic).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },

    // deleteTag(context, ids: number[]) {
    //   return context.state.services.tags.delete(ids).then(
    //     (response) => {
    //       return response
    //     },
    //     (error) => {
    //       Vue.prototype.$toast.add(
    //         new AlertMessage(AlertMessageSeverity.error, error)
    //       )
    //     }
    //   )
    // },
  },
  modules: {},
})
