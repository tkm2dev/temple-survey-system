<template>
  <div class="survey-progress">
    <div class="progress-header mb-3">
      <h6 class="mb-1">ขั้นตอนการกรอกข้อมูล</h6>
      <div class="progress mb-2" style="height: 6px">
        <div
          class="progress-bar bg-primary"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <small class="text-muted"
        >{{ currentStep }}/{{ totalSteps }} - {{ progressText }}</small
      >
    </div>

    <div class="step-indicators">
      <div class="row">
        <div v-for="(step, index) in steps" :key="index" class="col">
          <div
            class="step-indicator text-center"
            :class="{
              completed: index < currentStepIndex,
              active: index === currentStepIndex,
              disabled: index > currentStepIndex,
            }"
          >
            <div class="step-circle">
              <i v-if="index < currentStepIndex" class="bi bi-check-lg"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <small class="step-label">{{ step.label }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  name: "SurveyFormProgress",
  props: {
    currentStep: {
      type: Number,
      default: 1,
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
    isTempleType: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const steps = computed(() => {
      const baseSteps = [
        { label: "ข้อมูลพื้นฐาน", key: "basic" },
        { label: "ที่อยู่", key: "location" },
      ];

      if (props.isTempleType) {
        baseSteps.push(
          { label: "ข้อมูลวัด", key: "temple" },
          { label: "บุคลากร", key: "personnel" },
          { label: "บัญชีธนาคาร", key: "banking" }
        );
      }

      baseSteps.push({ label: "ไฟล์แนบ", key: "attachments" });

      return baseSteps;
    });

    const totalSteps = computed(() => steps.value.length);

    const currentStepIndex = computed(() => props.currentStep - 1);

    const progressPercentage = computed(() => {
      return Math.round((props.currentStep / totalSteps.value) * 100);
    });

    const progressText = computed(() => {
      if (currentStepIndex.value < steps.value.length) {
        return steps.value[currentStepIndex.value].label;
      }
      return "เสร็จสิ้น";
    });

    return {
      steps,
      totalSteps,
      currentStepIndex,
      progressPercentage,
      progressText,
    };
  },
};
</script>

<style scoped>
.survey-progress {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-indicator {
  position: relative;
  padding: 0.5rem;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.5rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.step-indicator.disabled .step-circle {
  background: #e9ecef;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.step-indicator.active .step-circle {
  background: #0d6efd;
  color: white;
  border: 2px solid #0d6efd;
  transform: scale(1.1);
}

.step-indicator.completed .step-circle {
  background: #198754;
  color: white;
  border: 2px solid #198754;
}

.step-label {
  display: block;
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
}

.step-indicator.active .step-label {
  color: #0d6efd;
  font-weight: 600;
}

.step-indicator.completed .step-label {
  color: #198754;
  font-weight: 600;
}

@media (max-width: 768px) {
  .step-circle {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }

  .step-label {
    font-size: 0.7rem;
  }
}
</style>
