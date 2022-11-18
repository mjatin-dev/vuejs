<template>
  <div>
    <div class="plan-settings-modal-header">
      <h2 class="p-mr-4">Plan Settings: Strategic Priorities</h2>

      <div>
        <Button
          @click="$emit('complete')"
          label="Close"
          class="p-button-outlined p-ml-2"
        />
      </div>
    </div>
    <div class="content">
      <div v-if="loading">
        <p style="margin-left:20px">Loading...</p>
      </div>
      <div v-else>
        <div class="p-field">
          <div class="p-d-flex top-items">
            <p class="channel-title">
              Enter key elements of your Strategy to tag and filter Tactics in
              the calendar views.
            </p>
          </div>
        </div>
        <div
          v-for="category in tagCategories"
          :key="category.id"
          class="category plan-category"
        >
          <div class="category__title">
            <h3>{{ category.label }}</h3>
          </div>
          <Container
            class="category__tags"
            @drop="(dropResults) => onTagDrop(dropResults, category)"
            drag-handle-selector=".tag__drag-icon"
          >
            <Draggable
              v-for="tag in category.tags"
              :key="tag.id.intID"
              class="tag"
            >
              <p class="tag__drag-icon">☰</p>
              <p class="tag__title" v-if="!tag.editing">
                {{ tag.title }}
              </p>
              <input
                type="text"
                v-else
                v-model="tag.editingValues.name"
                class="tag__edit-title"
              />
              <div class="tag__icons">
                <span v-if="!tag.editing">
                  <i
                    class="pi pi-pencil"
                    @click="
                      () => {
                        tag.editing = true
                      }
                    "
                  />
                  <i
                    class="pi pi-trash"
                    @click="() => handleDeleteTag(tag.id.intID)"
                  />
                </span>
                <span v-else>
                  <i
                    class="pi pi-check"
                    @click="() => handleTagEdit(category.name, tag)"
                  />
                  <i
                    class="pi pi-times"
                    @click="
                      () => {
                        tag.editing = false
                      }
                    "
                  />
                  <i
                    class="pi pi-trash"
                    @click="() => handleDeleteTag(tag.id.intID)"
                  />
                </span>
              </div>
            </Draggable>
          </Container>
        </div>
        <div class="new-tag p-d-flex p-jc-center">
          <div class="new-tag__category">
            <div class="p-mb-1">
              <label for="newTagCategory">Category</label>
            </div>
            <Dropdown
              v-model="newTag.category"
              :options="categories"
              optionLabel="label"
              OrderBY="id"
              optionValue="name"
              @change="handleTagSelect"
              name="newTagCategory"
            />
          </div>

          <div
            class="new-tag__name"
            v-if="newTag.category === '[ New Category ]'"
          >
            <div class="p-mb-1">
              <label for="newTagName">New Category Name</label>
            </div>
            <InputText
              type="text"
              v-model="newTag.categoryName"
              name="newTagName"
            />
          </div>
          <div class="new-tag__name">
            <div class="p-mb-1"><label for="newTagName">Tag Name</label></div>
            <InputText type="text" v-model="newTag.name" name="newTagName" />
          </div>
          <div class="new-tag__add" @click="handleAddTag">
            <i class="pi pi-plus-circle p-mr-1" /> Strategic Priority
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'

import Tag, {TagCategory} from '@/app-shared/models/Tag'
import Plan from '@/app-shared/models/Plan'
import {AlertMessageSeverity} from '@/app-shared/models/AlertMessage'
import {Container, Draggable} from 'vue-smooth-dnd'
import {applyDrag} from '@/app-shared/utils/applyDrag'

Vue.component('Button', Button)
Vue.component('Dropdown', Dropdown)

export default Vue.extend({
  name: 'PlanSettingsTags',
  components: {
    Container,
    Draggable,
  },
  data: () => ({
    loading:true,
    topViewContent: {
      title: 'Strategic Priorities',
      infoText:
        'Enter key elements of your Strategy to tag and filter Tactics in the calendar views.',
    },
    newTag: {
      name: null,
      category: null,
      categoryName: null,
    },
    plan: {} as Plan,
    tagCategories: [] as any[],
    categories: [] as any[],
    defaultCat: [
      {
        id: 1,
        label: 'Objective',
        name: 'Objective',
        categoryName: 'Objective',
        tags: [],
      },
      {
        id: 2,
        label: 'Target Segment',
        name: 'Target Segment',
        categoryName: 'Target Segment',
        tags: [],
      },
      {
        id: 3,
        label: 'Journey Phase',
        name: 'Journey Phase',
        categoryName: 'Journey Phase',
        tags: [],
      },
      {
        id: 4,
        label: '[ New Category ]',
        name: '[ New Category ]',
        categoryName: '',
        tags: [],
      },
    ],
  }),
  watch: {
    plan: {
      deep: true,
      handler(newPlan) {
        const categories: any = []
        newPlan.tags.forEach((tag) => {
          const [category, name] = tag.text.split(':')
          if (name) {
            const categoryIndex = categories.findIndex(
              (cat) => cat.label === category
            )
            const newTag = Tag.fromResponseObject({
              id: tag.id.intID,
              text: `${category}: ${name}`,
              orderIndex: tag.orderIndex,
            })
            if (categoryIndex === -1) {
              categories.push({
                id: categories.length,
                label: category,
                name: category,
                tags: [newTag],
              })
            } else {
              categories[categoryIndex].tags.push(newTag)
            }
          }
        })
        this.tagCategories = categories.map((c) => ({
          ...c,
          tags: c.tags.sort((a, b) => a.orderIndex - b.orderIndex),
        }));

        this.loading = false

        const newCat = Array.from(new Set(newPlan.tags.map((el) => el.type)))
        if (newCat.length > 0) {
          newCat.forEach((cat) => {
            const index = this.categories.findIndex((c) => c.label === cat)
            if (index === -1) {
              this.categories.unshift({
                id: 1,
                label: cat,
                name: cat,
                categoryName: cat,
                tags: [],
              })
            }
          })
        }
        //this.categories = this.cotegoriesSort(this.categories)
      },
    },
  },
  async created() {
    await this.$store.dispatch('refreshCurrentPlan')
    this.plan = this.$store.getters.currentPlan
    this.defaultCat.forEach((cat) => {
      this.categories.push(cat)
    })
  },
  methods: {
    cotegoriesSort(arr: string[]): string[] {
      const getCategories = [] as string[]
      arr.map((item) => {
        switch (item) {
          case 'Objective':
            getCategories.splice(0, 0, 'Objective')
            break
          case 'Target Secment':
            getCategories.splice(1, 0, 'Target Secment')
            break
          case 'Journey Phase':
            getCategories.splice(2, 0, 'Journey Phase')
            break
          default:
            getCategories.splice(item.length, 0, item)
            break
        }
      })
      return getCategories
    },
    handleTagSelect() {
      //console.log("handleTagSelect->newTag",  JSON.stringify(this.newTag))
      if (this.newTag.category !== '[ New Category ]') {
        this.newTag.categoryName = this.newTag.category
      } else {
        this.newTag.categoryName = null
      }
    },
    handleAddTag() {
      const {name, category, categoryName} = this.newTag

      if (!category) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must select category first',
        })
        return
      }

      if (!name) {
        Vue.prototype.$toast.add({
          severity: AlertMessageSeverity.warn,
          summary: 'You must add tag name first',
        })
        return
      }

      const newTag = Tag.fromResponseObject({
        text: `${categoryName ? categoryName : category}:${name}`,
        plan: this.plan.id.intID,
      })

      if (!categoryName) {
        const categoryIndex = this.tagCategories.findIndex(
          (cat) => cat.label === category
        )
        newTag.orderIndex = this.tagCategories[categoryIndex].tags.length
      }

      this.$store.getters.services.tags.create(newTag).then((newDBTag) => {
        this.plan.tags.push(newDBTag)
        this.newTag = {
          name: null,
          category: null,
          categoryName: null,
        }
        //console.log("newDBTag ", JSON.stringify(newDBTag))
        //console.log("plan.tags",  JSON.stringify(this.plan.tags))
        //console.log("categories",  JSON.stringify(this.categories))
      })
    },

    onTagDrop(result, category) {
      const sortedTags = applyDrag(category.tags, result)
      category.tags = sortedTags
      JSON.parse(JSON.stringify(sortedTags)).map((el, i) => {
        const tag = Tag.fromResponseObject(el)
        tag.id = el.id
        tag.orderIndex = i
        tag.planId = this.plan.id
        return (this as any).handleTagEdit(category.name, tag, false)
      })
    },

    handleTagEdit(category: string, tag: Tag, updatePlan = true) {
      const newTag: Tag = tag
      newTag.text = `${category}:${tag.editingValues.name}`

      return this.$store.getters.services.tags
        .update(newTag)
        .then((updatedTag) => {
          if (updatePlan) {
            const newTags = this.plan.tags.map((tag) =>
              tag.id.intID === updatedTag.id.intID ? updatedTag : tag
            )
            this.plan.tags = newTags
          }
          return updatedTag
        })
    },

    handleDeleteTag(tagId: number) {
      this.$store.getters.services.tags.delete([tagId]).then(() => {
        const newTags = this.plan.tags.filter((t) => t.id.intID !== tagId)
        this.plan.tags = newTags
      })
    },

    handleClickContinue() {
      // TODO: call API to update this.$store.getters.currentPlan object
      this.$emit('setup-step-complete')
    },
  },
})
</script>

<style lang="scss">
@import '@/app-shared/styles/_imports.scss';

.content {
  .category {
    border: none;
  }
}
.category {
  @include font-mulish-light;
  &__title {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 5px 5px 5px 10px;
    font-size: 16px;
    font-weight: 300;
    h3 {
      @include font-mulish-light;
      font-size: 18px;
      margin: 0;
    }
  }

  &__tags {
    margin-top: 0;
    padding-left: 0;
    .edit-input {
      margin: 10px 0;
    }
    .tag {
      @include font-mulish-light;
      border-bottom: 1px solid #c7c7c7;
      display: flex !important;
      flex-direction: row;
      position: relative;
      height: 35px;
      align-items: center;
      &__edit-title {
        @include font-mulish-light;
        margin: 5px 0px 5px 0px;
        &:focus {
          border: none;
        }
      }
      &__drag-icon {
        padding: 3px 10px;
        color: #c7c7c7;
        cursor: pointer;
        font-size: 16px;
        margin: 0;
      }
      &__title {
        font-size: 15px;
        margin: 3px 0;
      }
      &__icons {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        i {
          cursor: pointer;
          padding-left: 15px;
        }
      }
    }
  }
}
.new-tag {
  display: flex;
  gap: 20px;
  padding-bottom: 40px;
  &__category {
    @include font-mulish-light;
    width: 18%;
    .p-dropdown {
      border-color: #c7c7c7;
      border-radius: 3px;
      width: 100%;
    }
  }
  &__name {
    @include font-mulish-light;
    width: 20%;
    .p-inputtext {
      border-color: #c7c7c7;
      border-radius: 3px;
      width: 100%;
    }
  }
  &__add {
    @include font-mulish-light;
    padding-top: 21px;
    cursor: pointer;
  }
}
.onboarding-tags-tab {
  .top-view-container {
    max-width: 450px !important;
  }
}
.actions-container {
  .continue-button {
    color: #ffffff !important;
  }
}

.channel-title {
  @include font-mulish-light;
  font-size: 18px;
}
.plan-category {
  padding: 0px 20px !important;
}
</style>
