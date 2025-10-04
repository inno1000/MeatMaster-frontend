<template>
  <v-card class="audio-recorder modern-card" variant="outlined" rounded="lg">
    <v-card-text class="pa-6">
      <!-- En-tête -->
      <div class="d-flex align-center mb-4">
        <div class="icon-container me-3">
          <v-icon color="primary" class="modern-icon">mdi-microphone</v-icon>
        </div>
        <div>
          <h4 class="text-h6 font-weight-bold mb-1">Enregistrement Vocal</h4>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ recordings.length }}/{{ maxRecordings }} enregistrements
          </p>
        </div>
      </div>

      <!-- Contrôles -->
      <div class="controls d-flex justify-center align-center mb-4">
        <v-btn
          :color="recordingColor"
          @click="toggleRecording"
          :disabled="recordings.length >= maxRecordings"
          class="control-button modern-btn"
          :icon="recordingIcon"
          variant="elevated"
          size="large">
        </v-btn>
        <v-btn 
          color="error" 
          @click="stopRecording" 
          :disabled="!isRecording" 
          class="control-button modern-btn ms-3" 
          icon="mdi-stop"
          variant="elevated"
          size="large">
        </v-btn>
      </div>

      <!-- Timer -->
      <v-card 
        v-if="isRecording || elapsedSeconds > 0"
        variant="tonal"
        :color="isRecording ? 'success' : 'info'"
        class="timer-card modern-alert mb-4"
        rounded="md"
      >
        <v-card-text class="text-center pa-3">
          <div class="d-flex align-center justify-center">
            <v-icon 
              :icon="isRecording ? 'mdi-record' : 'mdi-pause'"
              :color="isRecording ? 'success' : 'info'"
              class="me-2"
            ></v-icon>
            <span class="text-h6 font-weight-bold">
              {{ isRecording ? 'Enregistrement en cours' : 'En pause' }} : {{ formattedTime }}
            </span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Liste des enregistrements -->
      <div v-if="recordings.length" class="recordings-list">
        <v-divider class="mb-4"></v-divider>
        <h5 class="text-subtitle-1 font-weight-bold mb-3">Enregistrements</h5>
        <v-card
          v-for="(recording, index) in recordings"
          :key="index"
          variant="outlined"
          class="recording-item modern-card mb-3"
          rounded="md"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-icon color="primary" class="me-3">mdi-play-circle</v-icon>
              <div class="flex-grow-1">
                <audio :src="recording.url" controls class="w-100"></audio>
              </div>
              <v-btn 
                color="error" 
                @click="deleteRecording(index)" 
                class="delete-button modern-btn" 
                icon="mdi-delete"
                variant="text"
                size="small">
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Message d'information -->
      <v-alert
        v-if="recordings.length === 0 && !isRecording"
        type="info"
        variant="tonal"
        class="modern-alert"
        prepend-icon="mdi-information"
      >
        Cliquez sur le bouton d'enregistrement pour commencer
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, reactive, computed } from 'vue';

export default {
  name: 'AudioRecorder',
  setup() {
    const isRecording = ref(false);
    const isPaused = ref(false);
    const maxRecordings = 3;
    const recordings = reactive([]);
    const elapsedSeconds = ref(0);
    let mediaRecorder;
    let audioChunks = [];
    let timer;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const url = URL.createObjectURL(audioBlob);
          recordings.push({ url, blob: audioBlob });
          audioChunks = [];
        };
        mediaRecorder.start();
        startTimer();
        isRecording.value = true;
        isPaused.value = false;
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };

    const pauseRecording = () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        stopTimer();
        isPaused.value = true;
      }
    };

    const resumeRecording = () => {
      if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        startTimer();
        isPaused.value = false;
      }
    };

    const stopRecording = () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
        stopTimer();
        isRecording.value = false;
        isPaused.value = false;
        elapsedSeconds.value = 0;
      }
    };

    const toggleRecording = () => {
      if (!isRecording.value) {
        startRecording();
      } else if (isPaused.value) {
        resumeRecording();
      } else {
        pauseRecording();
      }
    };

    const deleteRecording = (index) => {
      recordings.splice(index, 1);
    };

    const maxRecordingTime = 60; // 1 minutes in seconds

    const startTimer = () => {
      timer = setInterval(() => {
        elapsedSeconds.value++;
        if (elapsedSeconds.value >= maxRecordingTime) {
          stopRecording();
        }
      }, 1000);
    };

    const formattedTime = computed(() => {
      const minutes = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0');
      const seconds = (elapsedSeconds.value % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    });

    const stopTimer = () => {
      clearInterval(timer);
    };

    const recordingIcon = computed(() => {
      if (!isRecording.value) {
        return 'mdi-record';
      }
      return isPaused.value ? "mdi-play" : "mdi-pause";
    });

    const recordingColor = computed(() => {
      return 'success'; // Toujours vert pour le bouton d'enregistrement
    });

    return {
      isRecording,
      isPaused,
      elapsedSeconds,
      recordings,
      maxRecordings,
      startRecording,
      pauseRecording,
      resumeRecording,
      stopRecording,
      toggleRecording,
      deleteRecording,
      recordingIcon,
      recordingColor,
      formattedTime,
    };
  },
};
</script>

<style scoped>
.audio-recorder {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-button {
  width: 72px !important;
  height: 72px !important;
  min-width: 72px !important;
  min-height: 72px !important;
  border-radius: 50% !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.timer-card {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.02);
    opacity: 0.9;
  }
}

.recording-item {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
}

.delete-button {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  min-height: 36px !important;
  border-radius: 50% !important;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    background-color: rgba(var(--v-theme-error), 0.1);
  }
}

.recordings-list {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Amélioration du player audio */
audio {
  border-radius: 8px;
  outline: none;
  
  &::-webkit-media-controls-panel {
    background-color: rgba(var(--v-theme-surface), 0.8);
    border-radius: 8px;
  }
}
</style>
