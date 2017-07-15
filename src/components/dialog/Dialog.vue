<template>
  <transition name="comp-dialog">
    <div class="comp-dialog comp-dialog__wrapper" v-show="show" @click="clickOut">
      <div class="comp-dialog__content">
        <section>
          <slot name="head">
            header
          </slot>
        </section>
        <section>
          <slot name="body">
            body
          </slot>
        </section>
        <section>
          <slot name="foot">
            foot
          </slot>
        </section>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: 'comp-dialog',
    props: {
      show: {
        type: Boolean
      }
    },
    data () {
      return {
      }
    },
    computed: {
    },
    methods: {
      clickOut () {
        this.$emit('update:show', false)
      },
      clickIn (e) {
        e.stopPropagation()
      }
    }
  }
</script>

<style lang="postcss">
  .comp-dialog__wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, .5);
    transition: opacity .3s ease;
  }
  .comp-dialog__content {
    transition: top .3s ease;
    position: absolute;
    background-color: white;
    width: 20rem;
    height: 10rem;
    top: 20%;
    left: 50%;
    transform: translateX(-50%)
  }
  .comp-dialog-enter, .comp-dialog-leave {
    opacity: 0;
  }
  .comp-dialog-enter .comp-dialog__content,
  .comp-dialog-leave-active .comp-dialog__content {
    top: 5%;
  }
</style>
