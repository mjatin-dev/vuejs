import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'

import AccountDetail from '@/user-account/views/AccountDetail.vue'
import Budget from '@/plan/views/Budget.vue'
import Calendar from '@/plan/views/Calendar.vue'
import CalendarFlow from '@/plan/components/CalendarFlow.vue'
import CalendarGrid from '@/plan/components/CalendarGrid.vue'
import CalendarMasthead from '@/plan/components/CalendarMasthead.vue'
import PlanList from '@/plan/views/PlanList.vue'
import Search from '@/plan/views/Search.vue'
import UserDetail from '@/user-account/views/UserDetail.vue'
import TacticDetail from '@/app-shared/views/TacticDetail.vue'
import Table from '@/plan/views/Table.vue'
import LogIn from '@/core/views/LogIn.vue'
import PasswordForgot from '@/core/views/PasswordForgot.vue'
import PasswordChange from '@/core/views/PasswordChange.vue'
import PasswordSet from '@/core/views/PasswordSet.vue'
import TacticImport from '@/plan/views/TacticImport.vue'
import SetupIntro from '@/core/views/SetupIntro.vue'
import SetupRoot from '@/core/views/SetupRoot.vue'
import SetupDefaultChannels from '@/core/views/SetupDefaultChannels.vue'
import SetupCustomChannels from '@/core/views/SetupCustomChannels.vue'
import SetupCalendars from '@/core/views/SetupCalendars.vue'
import SetupBudget from '@/core/views/SetupBudget.vue'
import SetupDocuments from '@/core/views/SetupDocuments.vue'
import SetupInitiatives from '@/core/views/SetupInitiatives.vue'
import SetupTactics from '@/core/views/SetupTactics.vue'
import SetupTags from '@/core/views/SetupTags.vue'
import SetupTeam from '@/core/views/SetupTeam.vue'
import InactiveAccount from '@/core/views/InactiveAccount.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/account',
    name: 'AccountDetail',
    components: {
      main: AccountDetail,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },
  {
    path: '/account/user/:userId',
    name: 'UserDetail',
    components: {
      main: UserDetail,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },

  {
    path: '/',
    alias: '/plans',
    name: 'PlanList',
    components: {
      main: PlanList,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },
  {
    path: '/account/:accountId/plan/:planId/budget',
    name: 'Budget',
    components: {
      main: Budget,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
    //TODO: add date range param
  },
  {
    path: '/account/:accountId/plan/:planId/calendar',
    components: {
      main: Calendar,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
    children: [
      {
        path: '',
        name: 'CalendarDefault',
        components: {
          top: CalendarMasthead,
          bottom: CalendarGrid,
        },
        meta: {
          title: process.env.VUE_APP_TITLE,
        },
      },
      {
        path: 'day',
        name: 'CalendarDay',
        components: {
          top: CalendarMasthead,
          bottom: CalendarGrid,
        },
        meta: {
          title: process.env.VUE_APP_TITLE,
        },
      },
      {
        path: 'flow',
        name: 'CalendarFlow',
        components: {
          top: CalendarFlow,
        },
        meta: {
          title: process.env.VUE_APP_TITLE,
        },
      },
      {
        path: 'month',
        name: 'CalendarMonth',
        components: {
          top: CalendarMasthead,
          bottom: CalendarGrid,
        },
        meta: {
          title: process.env.VUE_APP_TITLE,
        },
      },
    ],
  },
  {
    path: '/account/:accountId/plan/:planId/search',
    name: 'Search',
    components: {
      main: Search,
    },
    props: {
      main: (route) => ({searchQuery: route.query.q}),
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },
  {
    path: '/account/:accountId/plan/:planId/tactic/:tacticId',
    name: 'TacticDetail',
    components: {
      main: TacticDetail,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },
  {
    path: '/account/:accountId/plan/:planId/initiative/:tacticId',
    name: 'InitiativeDetail',
    components: {
      main: TacticDetail,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },
  {
    path: '/account/:accountId/plan/:planId/settings/initiative/:tacticId',
    name: 'PlanInitiativeDetail',
    components: {
      main: TacticDetail,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },
  {
    path: '/account/:accountId/plan/:planId/initiative/:tacticId',
    name: 'AccountInitiativeDetail',
    components: {
      main: TacticDetail,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },
  {
    path: '/account/:accountId/plan/:planId/table',
    name: 'Table',
    components: {
      main: Table,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },

  // Onboarding flow
  {
    path: '/setup/:setupMode/:setupAccountId/:setupPlanId',
    redirect: '/setup/:setupMode/:setupAccountId/:setupPlanId/intro',
    name: 'SetupRoot',
    components: {
      main: SetupRoot,
    },
    children: [
      {
        path: 'intro',
        component: SetupIntro,
      },
      {
        path: 'default-channels',
        component: SetupDefaultChannels,
      },
      {
        path: 'custom-channels',
        component: SetupCustomChannels,
      },
      {
        path: 'calendars',
        component: SetupCalendars,
      },
      {
        path: 'budget',
        component: SetupBudget,
      },
      {
        path: 'tags',
        component: SetupTags,
      },
      {
        path: 'initiatives',
        component: SetupInitiatives,
      },
      {
        path: 'documents',
        component: SetupDocuments,
      },
      {
        path: 'team',
        component: SetupTeam,
      },
      {
        path: 'tactics',
        component: SetupTactics,
      },
    ],
  },

  // Logged out views
  {
    path: '/sign-in',
    name: 'SignIn',
    components: {
      loggedOut: LogIn,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
      isPublic: true,
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    components: {
      loggedOut: PasswordForgot,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
      isPublic: true,
    },
  },
  {
    path: '/change-password',
    name: 'PasswordChange',
    components: {
      loggedOut: PasswordChange,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
      isPublic: true,
    },
  },
  {
    path: '/set-password/:token',
    name: 'PasswordSet',
    components: {
      loggedOut: PasswordSet,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
      isPublic: true,
    },
  },
  {
    path: '/inactive-account',
    name: 'InactiveAccount',
    components: {
      loggedOut: InactiveAccount,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
      isPublic: true,
    },
  },

  // Import/Export
  {
    path: '/account/:accountId/plan/:planId/import',
    name: 'TacticImport',
    components: {
      main: TacticImport,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },

  {
    path: '/account/:accountId/plan/:planId/import/:importId/map',
    name: 'TacticImportMap',
    components: {
      main: TacticImport,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },

  {
    path: '/account/:accountId/plan/:planId/import/:importId/confirm',
    name: 'TacticImportConfirm',
    components: {
      main: TacticImport,
    },
    meta: {
      title: process.env.VUE_APP_TITLE,
    },
  },

  //TODO: use this approach to lazy-load views that a user may not have permissions to access
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ '@/app-shared/views/About.vue'),
  // },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
