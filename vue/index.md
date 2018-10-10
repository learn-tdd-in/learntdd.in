---
layout: tutorial
title: Learn TDD in Vue
logo: /images/vue.svg
logo_alt: Vue logo
---

{% include tutorial-intro.md %}

To see how TDD works in Vue, let's walk through a simple real-world example of building a feature. We'll be using Vue 2.5 with Vue CLI 3, which built-in support to use [Cypress][cypress] for end-to-end tests. We'll also add Cypress component testing functionality. You can also follow along in the [Git repo](https://github.com/learn-tdd-in/vue) that shows the process step-by-step. This tutorial assumes you have some [familiarity with Vue][vue] and with [automated testing concepts](/learn-tdd/concepts).

You can also watch a [meetup presentation video](https://youtu.be/CMN8boToKWI) of this tutorial using Vue CLI 2, which requires some extra steps to set up Cypress.

The feature we'll build is a simple list of messages.

## Setup

First, ensure you have [`@vue/cli`][Vue CLI] version 3 installed:

```bash
$ yarn global add @vue/cli
$ vue --version

3.0.1
```

Create a new Vue app with the Vue CLI:

```bash
$ vue create learn-tdd-in-vue
```

Choose the following options from the prompts:

- Please pick a preset: Manually select features
- Check the features needed for your project: add E2E Testing
- Pick a E2E testing solution: Cypress (Chrome only)
- Where do you prefer placing config for Babel, PostCSS, ESLint, etc.? In dedicated config files
- Pick the package manager to use when installing dependencies: pick what you like; this tutorial will use Yarn

Cypress is now set up for end-to-end testing, but we need to add some extra packages for component testing:

```bash
$ cd learn-tdd-in-vue
$ yarn add --dev cypress-vue-unit-test \
                 @cypress/webpack-preprocessor \
                 vue-loader
```

Next, set up Cypress to be able to load `.vue` components for testing by replacing the contents of `tests/e2e/plugins/index.js` with the following:

```javascript
const webpack = require('@cypress/webpack-preprocessor');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const webpackOptions = {
  resolve: {
    extensions: ['.js', '.vue'],
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
};

const options = {
  // send in the options from your webpack.config.js, so it works the same
  // as your app's code
  webpackOptions,
  watchOptions: {},
};

module.exports = (on, config) => {
  on('file:preprocessor', webpack(options));
  return Object.assign({}, config, {
    fixturesFolder: 'tests/e2e/fixtures',
    integrationFolder: 'tests/e2e/specs',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.js',
  });
};
```

As our last setup step, let's clear out some of the default code to get a clean starting point. Delete the following files:

- `src/components/HelloWorld.vue`
- `tests/e2e/specs/test.js`

Replace the contents of `src/App.vue` with the following:

```html
<template>
  <div>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>
```

## The Feature Test

When performing outside-in TDD, our first step is to **create an end-to-end test describing the feature we want users to be able to do.** For our simple messaging app, the first feature we want is to be able to enter a message, save it, and see it in the list.

Create a file `tests/e2e/specs/creating_a_message.js` and enter the following contents:

```javascript
describe('Creating a message', () => {
  it('Displays the message in the list', () => {
    cy.visit('http://localhost:8080');

    cy.get('[data-test="messageText"]')
      .type('New message');

    cy.get('[data-test="saveButton"]')
      .click();

    cy.get('[data-test="messageText"]')
      .should('have.value', '');

    cy.contains('New message');
  });
});
```

The code describes the steps a user would take interacting with our app:

- Visit the web site
- Entering the text "New message" into a message text field
- Clicking a save button
- Confirming that the message text field is cleared out
- Confirming that the "New message" we entered appears somewhere on screen

After we've created our test, the next step in TDD is to **run the test and watch it fail.**  This test will fail (be "red") at first because we haven't yet implemented the functionality.

Open Cypress with:

```bash
$ yarn test:e2e
```

Run the Cypress test by clicking `creating_a_message.js` in the Cypress window. A Chrome window should open, you should see the test run, then in the left-hand test step column you should see the following error:

```bash
Expected to find element: '[data-test='messageText']', but never found it.
```

## Write The Code You Wish You Had

The next step of TDD is to **write only enough production code to fix the current error or test failure.** In our case, all we need to do is add a message text field.

A common principle in TDD is to **write the code you wish you had.** We could just add an `<input type="text">` element to the `App` component directly. But say we want to keep our `App` simple and wrap everything related to the input in a custom component. We might call that component `<new-message-form>`. We wish we had it, so let's go ahead and add it to `App.vue`:

```diff
 <template>
   <div>
+    <new-message-form />
   </div>
 </template>

 <script>
+import NewMessageForm from './components/NewMessageForm';
+
 export default {
   name: 'app',
+  components: {
+    NewMessageForm,
+  },
 };
 </script>
```

Next, let's create `src/components/NewMessageForm.vue` with the following contents. It's tempting to fully build out this component. But we want to wait until the test guides us in what to build. Let's just make it an empty but functioning component:

```html
<template>
  <div>
  </div>
</template>

<script>
export default {
  name: 'NewMessageForm',
};
</script>
```

Now rerun the tests in Cypress. We're still getting the same error, because we haven't actually added a text input. But we're a step closer because we've written the code we wish we had: a component to wrap it. Now we can add the input tag directly. We give it a `data-test` attribute of "messageText": that's the attribute that our test uses to find the component.

```diff
 <template>
   <div>
+    <input
+      type="text"
+      data-test="messageText"
+    />
   </div>
 </template>
```

Rerun the tests. The error has changed! The tests are now able to find the "messageText" element. The new error is:

```bash
Expected to find element: ‘[data-test=’saveButton’]’, but never found it.
```

Now there's a different element we can't find: the element with attribute `data-test=’saveButton’`.

We want the save button to be part of our `NewMessageForm`, so fixing this error is easy. We just add a `<button>` to our component:

```diff
 <template>
   <div>
     <input
       type="text"
       data-test="messageText"
     />
+    <button
+      data-test="saveButton"
+    >
+      Save
+    </button>
   </div>
 </template>
```

## Implementing Component Behavior

Rerun the tests. Now we get a new kind of test failure:

```bash
expected '<input />' to have value '', but the value was 'New message'
```

We've made it to our first assertion, which is that the message text box should be empty -- but it isn't. We haven't yet added the behavior to our app to clear out the message text box.

Instead of adding the behavior directly, let's **step down from the "outside" level of end-to-end tests to an "inside" component test.** This allows us to more precisely specify the behavior of each piece. Also, since end-to-end tests are slow, component tests prevent us from having to write an end-to-end test for every rare edge case.

Create a new file `tests/e2e/specs/NewMessageForm.js` and add the following:

```javascript
import mountVue from 'cypress-vue-unit-test';
import NewMessageForm from '../../../src/components/NewMessageForm';

describe('NewMessageForm', () => {
  beforeEach(mountVue(NewMessageForm));

  describe('clicking the save button', () => {
    beforeEach(() => {
      cy.get('[data-test="messageText"]')
        .type('New message');

      cy.get('[data-test="saveButton"]')
        .click();
    });

    it('clears the text field', () => {
      cy.get('[data-test="messageText"]')
        .should('have.value', '');
    });
  });
});
```

A lot of the test seems the same as the end-to-end test: we still enter a new message and click the save button. But this is testing something very different. Instead of testing the whole app running together, we're testing just the NewMessageForm by itself.

Run `NewMessageForm.spec.js` with Cypress. We get the same error as we did with the end-to-end test:

```bash
expected '<input />' to have value '', but the value was 'New message'
```

Now, we can add the behavior to the component to get this test to pass. First, we add an `inputText` data property and bind it to the input with `v-model`:

```diff
 <template>
   <div>
     <input
       type="text"
       data-test="messageText"
+      v-model="inputText"
     />
     <button
       data-test="saveButton"
     >
       Save
     </button>
   </div>
 </template>

 <script>
 export default {
   name: 'NewMessageForm',
+  data() {
+    return {
+      inputText: '',
+    };
+  },
 };
 </script>
```

Next, we add a `save()` method that sets the `inputText` data property to the empty string. We might be tempted to fully implement `save()` right now, but let's wait until the tests drive us to that behavior. All we need to do to get the current component test to pass is clear the `inputText` data property:

```diff
 <template>
   <div>
     <input
       type="text"
       data-test="messageText"
       v-model="inputText"
     />
     <button
       data-test="saveButton"
+      @click="save"
     >
       Save
     </button>
   </div>
 </template>

 <script>
 export default {
   name: 'NewMessageForm',
   data() {
     return {
       inputText: '',
     };
   },
+  methods: {
+    save() {
+      this.inputText = '';
+    },
+  },
 };
 </script>
```

Rerun the component test and it passes. **Once a component test passes, step back up to the outer end-to-end test to see what the next error is.** Rerun `creating_a_message.js`. Now our final assertion fails:

```bash
Expected to find content: 'New message' but never did.
```

Now, finally, the test will drive us to implement the real meat of our feature: storing the message entered and displaying it.

The NewMessageForm won't be responsible for displaying this message, though: we'll create a separate MessageList component that also exists in the parent App component. The way we can send data to the parent component is by taking in an event handler and calling it.

To add this event handler behavior to NewMessageForm, we want to step back down to the component test. In this case, the component test won't be asserting exactly the same thing as the end-to-end test. The end-to-end test is looking for the 'New message' content on the screen, but the component test will only be asserting the behavior that the NewMessageForm component is responsible for: that it calls the event handler.

Add another test case to `NewMessageForm.js`:

```diff
   beforeEach(mountVue(NewMessageForm));

   describe('clicking the save button', () => {
+    let spy;
+
     beforeEach(() => {
+      spy = cy.spy();
+      Cypress.vue.$on('save', spy);
+
       cy.get("[data-test='messageText']")
         .type('New message');

       cy.get("[data-test='saveButton']")
         .click();
     });

     it('clears the text field', () => {
       cy.get("[data-test='messageText']")
         .should('have.value', '');
     });
+
+    it('emits the "save" event', () => {
+      expect(spy).to.have.been.calledWith('New message');
+    });
   });
 });
```

Notice that we **make one assertion per test in component tests.** Having separate test cases for each behavior of the component makes it easy to understand what it does, and easy to see what went wrong if one of the assertions fails. The `beforeEach` block will run through the same steps for each of the two test cases below.

You may recall that this isn't what we did in the end-to-end test, though. Generally you **make *multiple* assertions per test in end-to-end tests.** Why? End-to-end tests are slower, so the overhead of the repeating the steps would significantly slow down our suite as it grows. In fact, larger end-to-end tests tend to turn into "feature tours:" you perform some actions, do some assertions, perform some more actions, do more assertions, etc.

Run the component test again. You'll see the "clears the text field" test pass, and the new 'emits the "save" event' test fail with the error:

```bash
Expected spy to have been called with arguments "New message", but it was never called.
```

Let's emit that event in the `save()` method:

```diff
   },
   methods: {
     save() {
+      this.$emit('save', this.inputText);
       this.inputText = '';
     },
   },
```

Now the component test passes. That's great! Now we step back up again to run our feature test and we get:

```bash
Expected to find content: ‘New message’ but never did.
```

We still have the same assertion failure, because we're still not displaying the message. But we're a step closer!

## A List

Next, we need to save the message as a data property in the App component. First, we add an event listener to call an `addMessage()` function when the `new-message-form` emits the `save` event:

```diff
 <template>
   <div>
-    <new-message-form />
+    <new-message-form @save="addMessage" />
   </div>
 </template>
```

Next, we add the messages data property, and add the message to it when `addMessage()` is called:

```diff
   components: {
     NewMessageForm,
   },
+  data() {
+    return {
+      messages: [],
+    };
+  },
+  methods: {
+    addMessage(text) {
+      this.messages.unshift(text);
+    },
+  },
 };
 </script>
```

Next, to display the messages, let's create another custom component to keep our App component nice and simple. We'll call it MessageList. We'll write the code we wish we had in `App.vue`:

```diff
 <template>
   <div>
     <new-message-form @save="addMessage" />
+    <message-list :messages="messages" />
   </div>
 </template>

 <script>
 import NewMessageForm from './components/NewMessageForm';
+import MessageList from './components/MessageList';

 export default {
   name: 'app',
   components: {
     NewMessageForm,
+    MessageList,
   },
```

Next, we'll create `MessageList.vue` and add an empty implementation:

```html
<template>
  <div></div>
</template>

<script>
export default {
  name: 'MessageList',
  props: ['messages'],
};
</script>
```

Rerun the tests, and, as we expect, we still aren't displaying the message. But now that we have a MessageList component, we're ready to finally implement that and make the test pass:

```diff
{% raw %}  <template>
-  <div></div>
+  <ul>
+    <li v-for="message in messages" :key="message">
+      {{ message }}
+    </li>
+  </ul>
 </template>{% endraw %}
```

Rerun the tests and they pass. We've let the tests drive our first feature!

# Why TDD?

What have we gained by using outside-in Test-Driven Development?

- *Confidence it works.* Unit or component tests are great to specify the functionality of functions or classes, but the app can still crash or do the wrong thing when they’re connected together. An end-to-end test confirms that all the pieces connect in the right way.
- *Input on our design.* Our component test confirms that the way we interact with NewMessageForm is simple. If it was complex, our component test would have been harder to write.
- *100% test coverage.* By only writing the minimal code necessary to pass each error, this ensures we don’t have any code that *isn’t* covered by a test. This avoids the situation where a change we make breaks untested code.
- *Minimal code.* We’ve built the minimal features that pass our test. This has helped us avoid to speculate on features the code *might* need in the future, that increase our maintenance cost without adding any benefit.
- *Ability to refactor.* Because we have 100% test coverage, we can make changes to our code to improve its design to handle future requirements. Our code doesn't develop cruft that makes it complex to work within.
- *Ability to ship quickly.* We aren't spending time building code our users don't need. When some old code is slowing us down, we can refactor it to make it quicker to work with. And our tests reduce the amount of manual testing we need to do before a release.

End-to-end testing has had major payoffs for server-rendered apps, and with Cypress you can see the same benefits in client-side frameworks like Vue.

## More Resources

To learn more about TDD, I recommend:

{% include tutorial-goos.md %}
* ["JavaScript Jabber 224: Cypress.js"](https://devchat.tv/js-jabber/224-jsj-cypress-js-with-brian-mann) podcast episode
* ["Unit Testing Vue Components"](https://www.youtube.com/watch?v=LxXsGNXsMo8) (video) - a talk by Edd Yerburgh that provides a detailed perspective on writing valuable Vue component tests
* [_Testing Vue.js Applications_](https://www.manning.com/books/testing-vuejs-applications) - an early-access book by Edd that goes into more detail on the above

{% include tutorial-contact.md %}

[cypress]: https://www.cypress.io/
[vue]: https://vuejs.org/v2/guide/index.html
[vue-cli]: https://github.com/vuejs/vue-cli
