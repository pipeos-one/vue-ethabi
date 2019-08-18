<template>
  <v-layout row>
    <v-flex xs12
      v-for="(instance, i) in value"
      :key="`deployment_${i}`"
    >
      <v-text-field
        :ref="instance.funcName"
        outline
        persistent-hint
        height="60%"
        type="text"
        :value="instance.deployment"
        :placeholder="instance.deployment"
        :hint="`${instance.contractName}:  ${instance.funcName}`"
      ></v-text-field>
    </v-flex>
  </v-layout>
</template>

<script>
import {VFlex, VTextField} from 'vuetify/lib';

export default {
  props: ['value'],
  components: {
    VFlex,
    VTextField,
  },
  data() {
    return {};
  },
};
</script>
