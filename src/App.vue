<template>
  <div>
    <amplify-authenticator>
      <Todo />
      <div class="row justify-content-evenly">
        <div class="col-4">
          <amplify-sign-out></amplify-sign-out>
        </div>
      </div>
    </amplify-authenticator>
  </div>

</template>

<script>
import Auth from 'aws-amplify'
import Todo from './components/Todo.vue'

export default {
  name: 'App',
  components: {
    Todo
  },
}
</script>