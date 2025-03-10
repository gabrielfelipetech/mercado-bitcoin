<template>
  <div id="app">
    <h1>Etapa <span class="step">{{ step }}</span> de {{ totalSteps }}</h1>
    <h2 v-if="currentStepLabel">{{ currentStepLabel }}</h2>

    <div v-if="!formData">
      Carregando...
    </div>

    <div v-else>
      <div v-if="step <= totalSteps">
        <form @submit.prevent="handleStepSubmit">
          <div v-for="field in currentStepFields"
               :key="field.name"
               class="form__field">
            <label :for="field.name"
                   v-if="field.label">
              {{ field.label }}:
            </label>

            <div v-if="field.type === 'radio'"
                 class="form__fields-radio">
              <div v-for="option in field.options"
                   :key="option.value">
                <label class="form__field-radio">
                  <input type="radio"
                         :name="field.name"
                         :value="option.value"
                         v-model="form[field.name]"
                         :required="field.required" />
                  {{ option.label }}
                </label>
              </div>
            </div>
            <input v-else
                   :type="field.type"
                   :id="field.name"
                   v-model="form[field.name]"
                   :required="field.required" />
          </div>

          <div class="form__actions">
            <button type="button"
                    v-if="step > 1"
                    @click="prevStep">
              Voltar
            </button>
            <button type="submit">
              {{ step < totalSteps
                ? 'Continuar'
                : 'Cadastrar'
                }}
                </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const step = ref(1);
const form = ref({
  email: '',
  type: '',
  name: '',
  cpf: '',
  dob: '',
  phone: '',
  companyName: '',
  cnpj: '',
  foundDate: '',
  password: ''
});

const formData = ref(null);

const totalSteps = computed(() =>
  formData.value ? formData.value.steps.length : 0
);

const currentStepLabel = computed(() => {
  if (!formData.value) return '';
  if (formData.value.steps[step.value - 1].step == 2) {
    return form.value.type === 'PF' ? 'Pessoa Fisica' : 'Pessoa Juridica';
  }
  return formData.value.steps[step.value - 1]?.labelStep || '';
});

onMounted(() => {
  getRegistrations();
});

const getRegistrations = async () => {
  try {
    const response = await fetch('http://localhost:3000/registration');
    if (!response.ok) {
      throw new Error('Erro ao buscar formData');
    }
    const data = await response.json();
    formData.value = data;
  } catch (e) {
    console.log(e);
  }
};

const currentStepFields = computed(() => {
  if (!formData.value) return [];
  const stepFields = formData.value.steps[step.value - 1].fields;

  if (form.value.type === 'PF') {
    return stepFields.filter(
      (field) =>
        field.selectedTypeRegistration === 'cpf' ||
        field.selectedTypeRegistration === 'any'
    );
  } else if (form.value.type === 'PJ') {
    return stepFields.filter(
      (field) =>
        field.selectedTypeRegistration === 'cnpj' ||
        field.selectedTypeRegistration === 'any'
    );
  } else {
    return stepFields;
  }
});

const nextStep = () => {
  step.value++;
}

const prevStep = () => {
  step.value--;
}

const handleStepSubmit = () => {
  if (step.value < totalSteps.value) {
    nextStep();
  } else {
    submitForm();
  }
}

const submitForm = () => {
  fetch('http://localhost:3000/registration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form.value)
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          throw data;
        });
      }
      return res.json();
    })
    .then((data) => {
      alert(data.message || 'Cadastro realizado com sucesso!');
      console.log('Resposta do servidor:', data);
    })
    .catch((err) => {
      console.error(err);
      alert(err.error || 'Erro ao cadastrar');
    });
}
</script>

<style scoped>
#app {
  max-width: 600px;
  margin: 0 auto;
  font-family: sans-serif;
}

label {
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 4px;
}

input[type="radio"] {
  margin-right: 4px;
}

.form__field {
  margin-bottom: 1rem;
}

.form__field-radio {
  display: flex;
  flex-direction: row;
  align-items: start;
}

.form__fields-radio {
  display: flex;
}

.form__actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
</style>
