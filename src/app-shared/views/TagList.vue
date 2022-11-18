<template>
  <div class="tag-list-container">
    <template v-if="allowList">
      <div class="p-d-flex p-jc-between">
        <div class="p-mr-6"  v-for="(tagCat, i) in tagCategories" :key="i">
          <h3>{{tagCat.label}}</h3>
          <div
            class="p-d-flex p-ai-center p-mb-2"
            v-for="(tag, index) of tagCat.tags"
            :key="'tag_objective_' + index"
          >
            <Checkbox
              v-if="allowSelect"
              :id="'tag_objective_' + index"
              :value="tag.id.intID"
              v-model="localSelectedTagIntIds"
              class="p-mr-3"
            />
            <label
              :for="'tag_objective_' + index"
              :class="{
                'is-nested': tag.isNested,
                'is-lead': tag.isLead,
              }"
            >
              <!-- <template v-if="isLeadPlan && tag.isNested">
                {{ tag.abbreviatedPlanName }} > {{ tag.title }}
              </template> -->
              <template>
                {{ tag.label }}
              </template>
            </label>
          </div>
        </div>
      </div>

      <!-- Keeping this commented becauase the editing markup could be useful -->
      <!-- <div
        class="p-d-flex p-ai-center p-mb-2"
        v-for="(tag, index) of currentPlanTags"
        :key="'tag_' + index"
      >
        <Checkbox
          v-if="allowSelect"
          :id="'tag_' + index"
          name="selectedTags"
          :value="tag.id.intID"
          v-model="localSelectedTagIntIds"
          class="p-mr-3"
        />
        <label v-if="!isEditingTag(tag)" :for="'tag_' + index">{{
          tag.text
        }}</label>
        <InputText
          v-if="isEditingTag(tag)"
          v-model="tag.text"
          placeholder="Plan Element Name"
        />
        <div v-if="allowEdit" class="p-d-flex">
          <Button
            v-if="!isEditingTag(tag)"
            @click="deleteTag(tag)"
            class="p-mr-3 p-button-danger"
            icon="pi pi-trash"
            label="Delete"
          />
          <Button
            v-if="isEditingTag(tag)"
            @click="cancelEditTag(tag)"
            class="p-mr-3 p-button-danger"
            icon="pi pi-times"
            label="Cancel"
          />
          <Button
            @click="editTag(tag)"
            :icon="isEditingTag(tag) ? '' : 'pi pi-pencil'"
            :label="isEditingTag(tag) ? 'Save' : 'Edit'"
          />
        </div>
      </div> -->
    </template>
    <div v-if="allowCreate">
      <h3 v-if="allowList">Create New Strategic Tag</h3>
      <div class="p-field">
        <label for="newTagType">Type</label>
        <SelectButton
          id="newTagType"
          v-model="selectedTypeOption"
          :options="typeOptions"
          :multiple="false"
          class="p-mb-4"
        />
      </div>
      <div class="p-d-flex p-jc-between p-ai-center">
        <div class="p-field p-mr-4">
          <label for="newTag">Name</label>
          <InputText
            id="newTag"
            type="text"
            v-model="newTag.text"
            autocomplete="off"
          />
        </div>
        <Button @click="createTag">Add Tag</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Tag, {TagType} from '@/app-shared/models/Tag'
import ID from '@/app-shared/models/ID'
import { isThisHour } from 'date-fns'

Vue.component('Checkbox', Checkbox)
Vue.component('InputText', InputText)
Vue.component('Button', Button)
Vue.component('SelectButton', SelectButton)

export default Vue.extend({
  name: 'TagList',
  props: {
    isSetup: {
      type: Boolean,
      default: false,
    },
    allowSelect: Boolean,
    allowEdit: Boolean,
    allowCreate: Boolean,
    allowList: Boolean,
    selectedTags: Array as () => Tag[],
    skipRefetch: Boolean,
  },
  data: () => {
    return {
      newTag: {} as Tag,
      currentEditingTags: [] as Tag[],
      localSelectedTagIntIds: [] as number[],
      typeOptions: [
        TagType.Objective,
        TagType.TargetSegment,
        TagType.JourneyPhase,
        TagType.Custom,
      ] as string[],
      selectedTypeOption: TagType.Objective as string,
    }
  },
  computed: {
    isLeadPlan(): boolean {
      return this.$store.getters.currentPlan.plans.length ? true : false
    },
    tags() {
      return this.isSetup
        ? this.$store.getters.currentSetupPlan.tags
        : this.$store.getters.currentPlan.tags
    },
    currentPlanTags() {
      //Sort alphabetically by type
      return [...(this as any).tags].sort((tagA, tagB) => {
        if (tagA.type > tagB.type) {
          return 1
        }
        if (tagA.type < tagB.type) {
          return -1
        }
        return 0
      })
    },
    currentObjectiveTags(): Tag[] {
      return this.$store.getters.currentPlan.tags.filter(
        (tag) => tag.type == TagType.Objective && (!this.isLeadPlan || (this.isLeadPlan && !tag.isNested))
      )
    },
    currentTargetSegmentTags(): Tag[] {
      return this.$store.getters.currentPlan.tags.filter(
        (tag) =>
          tag.type == TagType.TargetSegment &&
          (!this.isLeadPlan || (this.isLeadPlan && !tag.isNested))
      )
    },
    currentJourneyPhaseTags(): Tag[] {
      return this.$store.getters.currentPlan.tags.filter(
        (tag) =>
          tag.type == TagType.JourneyPhase &&
          (!this.isLeadPlan || (this.isLeadPlan && !tag.isNested))
      )
    },
    currentCustomTags(): Tag[] {
      return this.$store.getters.currentPlan.tags.filter(
        (tag) =>
          tag.type == TagType.Custom &&
          (!this.isLeadPlan || (this.isLeadPlan && !tag.isNested))
      )
    },
    tagCategories() {
      const categories: any = []
      // array push unique  objects in categories
      this.tags.forEach((tag) => {
        const [category, name] = tag.text.split(':')
        const categoryIndex = categories.findIndex((cat)=> cat.label === category)
        if (categoryIndex === -1) {
          categories.push({
            id: categories.length + 1,
            label: category,
            name: category,
            tags: [],
          })
        }
      })
      // add tags to categories
      this.tags.forEach((tag) => {
        const [category, name] = tag.text.split(':')
        const categoryIndex = categories.findIndex((cat) => cat.label === category)
        const newTag = {
          id: tag.id,
          label: name ? name : category,
          editing: false,
          newName: name ? name : category,
          planId: tag.planId,
          isLead: tag.isLead,
          isNested: tag.isLead,
          type: tag.Objective && (!this.isLeadPlan || (this.isLeadPlan && !tag.isNested))
        }
        categories[categoryIndex === -1 ? 3 : categoryIndex].tags.push(newTag)
      })

      return categories
    },
  },
  watch: {
    localSelectedTagIntIds() {
      this.$emit('updateSelection', [
        ...this.currentPlanTags.filter(
          (tag) => this.localSelectedTagIntIds.indexOf(tag.id.intID) > -1
        ),
      ])
    },
  },
  mounted: function () {
    if (this.allowCreate) {
      this.newTag = new Tag()
    }
    if (this.allowSelect) {
      this.localSelectedTagIntIds = [
        ...this.selectedTags.map((tag) => tag.id.intID),
      ]
    }
 
  },
  methods: {
    isEditingTag(tag: Tag): boolean {
      return this.currentEditingTags.find(
        (checkTag) => checkTag.id.intID == tag.id.intID
      )
        ? true
        : false
    },
    editTag(tag: Tag) {
      if (this.isEditingTag(tag)) {
        this.updateTag(tag)
      } else {
        this.currentEditingTags.push(tag)
      }
    },
    cancelEditTag(tag: Tag) {
      this.currentEditingTags.splice(this.currentEditingTags.indexOf(tag), 1)
    },
    createTag() {
      
      if (this.selectedTypeOption && this.selectedTypeOption !== 'Custom') {
        this.newTag.text = this.selectedTypeOption + ': ' + this.newTag.text
      }
      this.newTag.planId = new ID(
        this.$store.getters.currentPlan.id.intID,
        this.$store.getters.currentPlan.id.apiID
      )
      this.$store.getters.services.tags
        .create(this.newTag)
        .then((returnedTag) => {
          this.newTag = new Tag()

          if (this.skipRefetch) {
            this.$emit('addTag', returnedTag)
          } else {
            this.$store.dispatch('refreshCurrentPlan')
          }
        })
    },
    updateTag(tag: Tag) {
      this.$store.getters.services.tags.update(tag).then((returnedTag) => {
        this.cancelEditTag(tag)
      })
    },
    deleteTag(tag: Tag) {
      this.$store.getters.services.tags.delete([tag.id.intID]).then(() => {
        this.$store.dispatch('refreshCurrentPlan')
      })
    },
  },
})
</script>

<style lang="scss">
.tag-list-container {
  label.is-lead {
    display: flex;
    column-gap: 1rem;

    &::before {
      content: '\e925'; // pi-home
      display: block;
      font-family: 'primeicons';
      font-size: 1.6rem;
      speak: none;
      font-style: normal;
      font-weight: normal;
      font-variant: normal;
      text-transform: none;
    }
  }
}
</style>
