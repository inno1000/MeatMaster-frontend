<template>
  <v-container style="max-width: 500px">
    <v-text-field
        v-model="newTask"
        label="What are you working on?"
        variant="solo"
        @keydown.enter="create"
    >
      <template v-slot:append-inner>
        <v-fade-transition>
          <v-btn
              v-show="newTask"
              icon="mdi-plus-circle"
              variant="text"
              @click="create"
          ></v-btn>
        </v-fade-transition>
      </template>
    </v-text-field>

    <v-divider class="mb-4"></v-divider>

    <v-card v-if="tasks.length > 0">
      <v-slide-y-transition
          class="py-0"
          tag="v-list"
          group
      >
        <template v-for="(task, i) in tasks" :key="`${i}-${task.text}`">
          <v-divider
              v-if="i !== 0"
              :key="`${i}-divider`"
          ></v-divider>

          <v-list-item @click="task.done = !task.done">
            <template v-slot:prepend>
              <v-checkbox-btn v-model="task.done" color="grey"></v-checkbox-btn>
            </template>

            <v-list-item-title>
              <span :class="task.done ? 'text-grey' : 'text-primary'">{{ task.text }}</span>
            </v-list-item-title>

            <template v-slot:append>
              <v-expand-x-transition>
                <v-icon v-if="task.done" color="success">
                  mdi-check
                </v-icon>
              </v-expand-x-transition>
            </template>
          </v-list-item>
        </template>
      </v-slide-y-transition>
    </v-card>
  </v-container>
</template>
<script>
export default {
  data: () => ({
    tasks: [
      {
        done: false,
        text: 'Foobar',
      },
      {
        done: false,
        text: 'Fizzbuzz',
      },
    ],
    newTask: null,
  }),

  computed: {
    completedTasks () {
      return this.tasks.filter(task => task.done).length
    },
    progress () {
      return this.completedTasks / this.tasks.length * 100
    },
    remainingTasks () {
      return this.tasks.length - this.completedTasks
    },
  },

  methods: {
    create () {
      this.tasks.push({
                        done: false,
                        text: this.newTask,
                      })

      this.newTask = null
    },
  },
}
</script>
