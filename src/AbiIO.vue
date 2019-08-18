<template>
  <div>
    <v-layout row wrap>
      <v-flex xs12>
        <v-text-field
          v-if="!destructured"
          v-model="inputValue"
          full-width outline
          :type="getInputType(abi.type)"
          :label="`${abi.type} ${abi.name}`"
          :error="errorMessages.length > 0"
          :error-messages="errorMessages"
          :rules="rules"
          :append-outer-icon="abi.components ? 'fa-chevron-down' : ''"
          @click:append-outer="destructure"
          @input="inputValueChanged"
        ></v-text-field>
        <v-card v-else>
          <v-layout row wrap>
            <v-flex xs2 offset-xs10 class="text-xs-right">
              <v-btn flat icon @click="destructure">
                <v-icon>fa-chevron-up</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <AbiIO
            v-for="(component, i) in components"
            :key="'component_' + i"
            :abi="component"
            :validator="validator"
            v-on:input="internalInputChanged(...arguments, i)"
          />
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import {VContainer, VLayout, VFlex, VCard, VTextField, VBtn, VIcon} from 'vuetify/lib';
import {JsonArrayToString, getInputType} from './utils';

const rules = {
  address: value => value.length === 22,
};

export default {
  name: 'AbiIO',
  props: ['value', 'abi', 'validator'],
  components: {VContainer, VLayout, VFlex, VCard, VTextField, VBtn, VIcon},
  data() {
    return {
      errorMessages: [],
      rules: [],
      destructured: false,
      inputValue: '',
      components: [],
    };
  },
  created() {
    this.setIO();
  },
  watch: {
    abi() {
      this.setIO();
    },
  },
  methods: {
    setIO() {
      this.components = this.abi.components || [];
      this.setComponentsValuesFromAbi();
      if (this.value) {
        this.setComponentsFromObject(this.value);
      }
      this.setInputValue();
    },
    setComponentsValuesFromAbi() {
      const {components} = this.abi;
      if (!components || !this.abi.value) return;

      components.forEach((comp, i) => {
        components[i].value = this.abi.value[comp.name];
      });
      this.components = components;
    },
    setInputValue() {
      if (this.components.length) {
        this.inputValue = JsonArrayToString([
          this.getObjectFromComponents(this.components),
        ]);
      } else if (typeof this.abi.value === 'object') {
        this.inputValue = JsonArrayToString([this.abi.value]);
      } else if (typeof this.abi.value === 'string') {
        this.inputValue = `"${this.abi.value}"`;
      } else {
        this.inputValue = this.abi.value;
      }
    },
    getObjectFromComponents() {
      const obj = {};
      this.components.forEach((comp) => {
        obj[comp.name] = comp.value;
      });
      return obj;
    },
    setComponentsFromObject(obj) {
      this.components = this.components.map((comp) => {
        comp.value = obj[comp.name];
        return comp;
      });
    },
    destructure() {
      this.destructured = !this.destructured;
    },
    inputValueChanged(value) {
      try {
        value = JSON.parse(value);
      } catch (e) {};

      this.$emit('input', value);
    },
    internalInputChanged(value, index) {
      const {value: validated, errorMessages} = this.validator(
        value,
        this.components[index].type,
        this.components[index].name,
        this.components[index].components,
        this,
      );
      this.components[index].value = validated;
      this.errorMessages = this.errorMessages.concat(errorMessages);
      this.setInputValue();
      this.$emit('input', this.getObjectFromComponents());
    },
    getInputType(type) {
      return getInputType(type);
    }
  },
};
</script>
