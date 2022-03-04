import { createApp } from 'vue';
import App from './App.vue';
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import AmplifyVue from '@aws-amplify/ui-vue';

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.js"

import { applyPolyfills, defineCustomElements} from '@aws-amplify/ui-components/loader';

applyPolyfills().then(() => {
    defineCustomElements(window);
});

Amplify.configure(aws_exports);

const app = createApp(App);
app.use(AmplifyVue);
app.mount('#app');
