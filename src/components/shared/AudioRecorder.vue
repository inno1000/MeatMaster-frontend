<template>
  <div class="audio-recorder">
    <div class="controls">
      <v-btn
          :color="recordingColor"
          @click="toggleRecording"
          :disabled="recordings.length >= maxRecordings"
          class="control-button elevation-4"
          size="x-large"
          :icon="recordingIcon">
      </v-btn>
      <v-btn color="error" @click="stopRecording" :disabled="!isRecording" class="control-button" icon="mdi-stop">
      </v-btn>
    </div>
    <div class="timer">
      Temps écoulé : <b>{{ formattedTime }}</b>
    </div>
    <v-divider v-if="recordings.length"></v-divider>
    <div v-for="(recording, index) in recordings" :key="index" class="recording">
      <audio :src="recording.url" controls></audio>
      <v-btn variant="text" color="error" @click="deleteRecording(index)" class="delete-button" icon="mdi-delete">
      </v-btn>
    </div>
  </div>
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
      if (!isRecording.value) {
        return 'success';
      }
      return isPaused.value ? "success" : "error";
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
  text-align: center;
}

.controls {
  margin-bottom: 10px;
}

.control-button {
  background-color: #f5f5f5;
  border: none;
  border-radius: 50%;
  padding: 10px;
  margin: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.control-button:disabled {
  cursor: not-allowed;
}

.control-button:hover:enabled {
  background-color: #e0e0e0;
}

.timer {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.recording {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-left: 10px;
}

.delete-button:hover {
  color: red;
}
</style>
