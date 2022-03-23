<template>
  <div>
    <amplify-authenticator>
      <router-view/>
      <div class="row justify-content-evenly">
        <div class="col-4">
          <amplify-sign-out></amplify-sign-out>
        </div>
      </div>
    </amplify-authenticator>
  </div>

</template>

<script>
export default {
  name: 'App',
}
</script>