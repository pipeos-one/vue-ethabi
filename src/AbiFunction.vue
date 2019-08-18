<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs2 v-if="!destructured">
        <!-- <v-btn
          block depressed large
          :color="funcColor"
          @click="runFunction"
          class="text-none"
          style="text-transform:none!important;"
        >
          {{abi.name}}<v-icon large style="padding-left:10px">fa-play-circle</v-icon>
        </v-btn> -->
        <v-btn
          icon
          @click="runFunction"
        >
          <v-icon x-large>fa-play-circle</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs9 offset-xs1>
        <v-text-field
          v-if="!destructured && abi.inputs.length"
          v-model="functionArgs"
          outline
          height="60%"
          type="text"
          :label="inputsStr(abi.inputs)"
          :error="errorMessages.length > 0"
          :error-messages="errorMessages"
          :rules="rules"
          :append-outer-icon="abi.inputs.length > 1 || abi.inputs[0].type == 'tuple' ? 'fa-chevron-down' : ''"
          @click:append-outer="destructure"
          @input="argsValueChanged"
          class="abifunc"
        ></v-text-field>
      </v-flex>
    </v-layout>
    <div v-if="destructured">
      <v-layout row wrap>
        <!-- <v-flex xs4>
          <v-btn
            block depressed large
            :color="funcColor"
            @click="runFunction"
          >
            {{abi.name}}
          </v-btn>
        </v-flex> -->
        <v-flex xs4>
          <v-btn
            block depressed large
            :color="funcColor"
            @click="runFunction"
            style="text-transform:none!important;"
          >
            {{abi.name}}<v-icon style="padding-left:10px">fa-play-circle</v-icon>
          </v-btn>
        </v-flex>
        <v-flex xs2 offset-xs6 class="text-xs-right">
          <v-btn flat icon @click="destructure">
            <v-icon>fa-chevron-up</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
      <AbiIO
        v-for="(input, i) in inputs"
        :key="`input_${i}`"
        :abi="input"
        :validator="validateArg"
        v-on:input="internalInputChanged(...arguments, i)"
      />
    </div>
    <v-layout row wrap>
      <v-flex xs12
        align-start
        class="text-xs-left abiFunctionOutput"
        :id="'output_' + abi.name"
      >
      </v-flex>
    </v-layout>
    <v-divider></v-divider>
  </v-container>
</template>

<script>
import {VContainer, VLayout, VFlex, VDivider, VBtn, VIcon, VTextField} from 'vuetify/lib';
import AbiIO from './AbiIO';
import {pfunctionColorClass, JsonArrayToString, validateArg} from './utils';

const colors = {payable: '#CDE0F2', nonconstant: '#E9DEDE'};

export default {
  props: ['abi'],
  components: {
    AbiIO,
    VContainer,
    VLayout,
    VFlex,
    VDivider,
    VBtn,
    VIcon,
    VTextField,
  },
  data() {
    return {
      errorMessages: [],
      rules: [],
      destructured: false,
      functionArgs: '',
      inputs: [],
      outputs: [],
      funcColor: '',
      outputValues: null,
    }
  },
  created() {
    this.setData();
  },
  watch: {
    abi() {
      this.setData();
    },
    functionArgs() {
      const args = this.prepareValue();
      this.$emit('input', args);
    },
  },
  methods: {
    setData() {
      this.inputs = this.abi.inputs;
      this.outputs = this.abi.outputs;
      this.funcColor = colors[pfunctionColorClass(this.abi)];
      this.errorMessages = [];
    },
    destructure() {
      this.destructured = !this.destructured;
    },
    inputsStr(inputs) {
      return inputs.map(input => `${input.type} ${input.name}`).join(', ');
    },
    validateArg(value, type, name, components=[], self) {
      const {value: validated, errorMessages} = validateArg(value, type, name, components);

      this.errorMessages = this.errorMessages.concat(errorMessages);
      if (self) {
        self.errorMessages = this.errorMessages;
      }

      return validated;
    },
    stringToObjectArray() {
      let args = [];
      const lastIndex = this.functionArgs.length - 1;
      this.errorMessages = [];
      if (this.functionArgs[lastIndex] === ',') {
        this.functionArgs = this.functionArgs.slice(0, lastIndex);
      }

      try {
        args = JSON.parse(`[${this.functionArgs}]`);
      } catch (e) {
        this.errorMessages.push('Use quotes around strings and addresses, make sure object keys have quotes');
      }
      return args;
    },
    setInputsFromString() {
      const args = this.stringToObjectArray();
      const inputs = this.inputs;

      if (args.length !== inputs.length) {
        this.errorMessages.push(`Number of comma separated values should be ${inputs.length}`);
      }
      inputs.forEach((input, i) => {
        inputs[i].value = this.validateArg(args[i], input.type, input.name, input.components);
      });
      this.inputs = inputs;
    },
    argsValueChanged(value) {
      this.setInputsFromString();
    },
    inputsToString() {
      this.errorMessages = [];
      this.functionArgs = JsonArrayToString(this.inputs.map((arg) => {
        return this.validateArg(arg.value, arg.type, arg.name, arg.components);
      }));
    },
    internalInputChanged(value, index) {
      let inputs = this.inputs;
      inputs[index].value = value;
      this.inputs = inputs;

      this.inputsToString();
    },
    runFunction() {
      this.setInputsFromString();
      if (this.errorMessages.length === 0) {
        const args = this.prepareValue();
        this.$emit('change', args);
      }
    },
    prepareValue() {
      const args = [];
      this.inputs.forEach((input) => {
        if (typeof input.value === 'object') {
          input.value = JsonArrayToString([input.value]);
        }
        if (typeof input.value === 'string' && input.type !== 'tuple') {
          input.value = `${input.value}`;
        }
        args.push(input);
      });
      return args;
    },
  },
};
</script>
