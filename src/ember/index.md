# Learn TDD in Ember

<img src="../images/ember.svg" alt="Ember logo" class="page-logo" />

Test-Driven Development (TDD) is an approach to automated software testing that involves writing a failing test before writing the production code to make it pass. TDD helps you develop a robust test suite to catch bugs, as well as guiding you to more modular, flexible code.

To see how TDD works in Ember, let's walk through a simple real-world example of building a feature.
We'll be using Ember 3.15 and its built-in testing tools, along with [ember-sinon-qunit](https://github.com/elwayman02/ember-sinon-qunit) for mocking functions and [Mirage](http://www.ember-cli-mirage.com/) for mocking web service requests.
This tutorial assumes you have some [familiarity with Ember](https://guides.emberjs.com/release/) and with [automated testing concepts](/concepts).

The feature we'll build is a simple list of messages.

## Creating the Project

Create a new Ember app:

```sh
$ ember new ember-tdd --no-welcome
```

Next, install Mirage and ember-sinon-qunit:

```sh
$ ember install ember-cli-mirage
$ ember install ember-sinon-qunit
```

To hook up ember-sinon-qunit, we need to call a setup function in our `tests/test-helper.js` file:

```diff
 import { start } from 'ember-qunit';
+import setupSinon from 'ember-sinon-qunit';

 setApplication(Application.create(config.APP));

 setup(QUnit.assert);
+
+setupSinon();

 start();
```

## The Feature Test

When performing outside-in TDD, our first step is to **create an acceptance test describing the feature we want users to be able to do.** For our simple messaging app, the first feature we want is to be able to enter a message, send it, and see it in the list.

Generate an acceptance test:

```sh
$ ember g acceptance-test sending-a-message
```

This will create a file `tests/acceptance/sending-a-message-test.js`. Open it and you should see the following scaffold:

```js
import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | sending a message', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /sending-a-message', async function (assert) {
    await visit('/sending-a-message');

    assert.equal(currentURL(), '/sending-a-message');
  });
});
```

Set up Mirage to mock out the back end:

```diff
 import { setupApplicationTest } from 'ember-qunit';
+import { setupMirage } from 'ember-cli-mirage/test-support';

 module('Acceptance | sending a message', function (hooks) {
   setupApplicationTest(hooks);
+  setupMirage(hooks);

   test('visiting /sending-a-message', async function (assert) {
```

Now, replace the `test` with the following test:

```js
test('it shows the message in the list', async function (assert) {
  const message = 'Hello World';
  await visit('/');

  await fillIn('[data-test-message-text]', message);
  await click('[data-test-send-message-button]');

  assert.dom('[data-test-message-text]').hasValue('');
  assert.dom('[data-test-message-list]').hasText(message);
});
```

The code describes the steps a user would take interacting with our app:

- Visiting the web site
- Entering the text "Hello World" into a message text field
- Clicking a send button
- Confirming that the message text field is cleared out
- Confirming that the "Hello World" message we entered appears in the message list

You'll need to change the following imports:

```diff
-import { visit, currentURL } from '@ember/test-helpers';
+import { visit, fillIn, click } from '@ember/test-helpers';
```

After we've created our test, the next step in TDD is to **run the test and watch it fail.**  This test will fail (be "red") at first because we haven't yet implemented the functionality.

Start the Ember test runner:

```sh
$ ember test -s
```

A Chrome window should open, you should see the test run, then in Chrome and in the terminal the first error you should see is:

```sh
Acceptance | sending a message: it shows the message in the list
    ✘ Promise rejected during "it shows the message in the list":
    Element not found when calling `fillIn('[data-test-message-text]')`.
        Error: Element not found when calling
        `fillIn('[data-test-message-text]')`.
```

There are a few other errors as well, but let's take one at a time.

Keep the tests running for the duration of this tutorial. They'll automatically rerun each time you change a test or production code.

## Write The Code You Wish You Had

The next step of TDD is to **write only enough production code to fix the current error or test failure.** In our case, all we need to do is add a message text field.

A common principle in TDD is to **write the code you wish you had.** We could just add an `<input type="text">` element to our application's template directly, but there are two things we would usually do differently in an Ember app:

- Typically we would wrap everything related to the new message input in a custom component.
- Assuming we will want multiple routes, we should put this component in a route template, instead of the application template.

We wish we had these things, so let's go ahead and create them. Generate an index route:

```sh
$ ember g route index
```

One of the files this creates is the template for this route at `app/templates/index.hbs`. Replace the contents of this file with an invocation of the new message component that we wish we had:

```diff
-{{outlet}}
+<NewMessageForm />
```

Next, generate the `NewMessageForm` component:

```sh
$ ember g component NewMessageForm
```

This will create the following files:

- `app/components/new-message-form.js`
- `app/components/new-message-form.hbs`
- `tests/integration/components/new-message-form-test.js`

Delete `tests/integration/components/new-message-form-test.js` for now--we won't be using it yet, and its test failures will clutter up our output.

Now enter the following contents in `app/components/new-message-form.hbs`.

```handlebars
<input
  type="text"
  data-test-message-text
/>
```

It's tempting to fully build out this component. But we want to wait until the test guides us in what to build. Let's just add the input tag. We give it a `data-test-message-text` attribute: that's the attribute that our test uses to find the component.

If we check our tests, the error has changed! The tests are now able to find the `[data-test-message-text]` element. The new error is:

```sh
Acceptance | sending a message: it shows the message in the list
    ✘ Promise rejected during "it shows the message in the list":
    Element not found when calling
    `click('[data-test-send-message-button]')`.
        Error: Element not found when calling
        `click('[data-test-send-message-button]')`.
```

Now there's a different element we can't find: the element with attribute `data-test-send-message-button`.

We want the send button to be part of our `NewMessageForm`, so fixing this error is easy. We just add a `<button>` to our component:

```diff
 <input
   type="text"
   data-test-message-text
 />
+<button
+  data-test-send-message-button
+>
+  Send
+</button>
```

# Implementiong Component Behavior

Rerun the tests. Now we get a new kind of test failure:

```sh
✘ Element [data-test-message-text] has value ""
        at DOMAssertions.hasValue (http://localhost:7357/assets/test-support.js:41409:20)
        at Object.<anonymous> (http://localhost:7357/assets/tests.js:14:46)
     actual Hello World
```

We've made it to our first assertion, which is that the message text box should be empty -- but it isn't. We haven't yet added the behavior to our app to clear out the message text box.

Instead of adding the behavior directly, let's **step down from the "outside" level of acceptance tests to an "inside" component test.** This allows us to more precisely specify the behavior of each piece. Also, since acceptance tests are slow, component tests prevent us from having to write an acceptance test for every rare edge case.

To implement this behavior, we'll create a component test. Create the file `tests/integration/components/new-message-form-test.js` and add the following contents:

```js
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | new-message-form', function (hooks) {
  setupRenderingTest(hooks);

  test('it clears the message', async function (assert) {
    const message = 'Hello World';

    await render(hbs`<NewMessageForm />`);

    await fillIn('[data-test-message-text]', message);
    await click('[data-test-send-message-button]');

    assert.dom('[data-test-message-text]').hasValue('');
  });
});
```

A lot of the test seems the same as the acceptance test: we still enter a new message and click the send button. But this is testing something very different. Instead of testing the whole app running together, we're testing just the `NewMessageForm` by itself.

Note that since both Ember's acceptance and component tests use the same rendering functionality, we use the same `fillIn` and `click` helpers and the same assertions. Nice!

When you save the file, the test runs, and we get the same error as we did with the acceptance test:

```sh
Integration | Component | new-message-form: it clears the message
    ✘ Element [data-test-message-text] has value ""
            at DOMAssertions.hasValue (http://localhost:7357/assets/test-support.js:41409:20)
            at Object.<anonymous> (http://localhost:7357/assets/tests.js:37:46)
         actual Hello World
```

Now, we can add the behavior to the component to get this test to pass.

Change the `<input>` tag to an `<Input>` component (note the capital letter "I") and have it bind its value to a `message` property of the component:

```diff
-<input
+<Input
   type="text"
+  @value={{this.message}}
   data-test-message-text
 />
```

Then wrap the input and button in a `<form>` tag that calls a `handleSend` action, and change the button into a submit button:

```diff
+<form onSubmit={{this.handleSend}}>
   <Input
     type="text"
     @value={{this.message}}
     data-test-message-text
   />
   <button
+    type="submit"
     data-test-send-message-button
   >
     Send
   </button>
+</form>
```

Now, to provide this `message` property and `handleSend` action, we'll need a class for the `NewMessageForm` component. Generate one:

```sh
$ ember g component-class NewMessageForm
```

Add the following to `app/components/new-message-form.js`:

```diff
 import Component from '@glimmer/component';
+import { tracked } from '@glimmer/tracking';
+import { action } from '@ember/object';

 export default class NewMessageFormComponent extends Component {
+  @tracked message = '';
+
+  @action
+  handleSend(e) {
+    e.preventDefault();
+    this.message = '';
+  }
 }
```

This provides a `message` property that the `Input` will read its value from and write its value back to. It also provides a `handleSend` action that will prevent the browser from reloading the page on form submission, and clear out the message property.

With this, our component test passes. **Once a component test passes, step back up to the outer acceptance test to see what the next error is.** Now, our final assertion fails:

```sh
Acceptance | sending a message: it shows the message in the list
    ✘ Element [data-test-message-list] should exist
```

Now, finally, the test will drive us to implement the real meat of our feature: storing the message entered and displaying it.

The `NewMessageForm` won't be responsible for displaying this message, though: we'll create a separate `MessageList` component that also exists in the route.

Following the principle of writing the code we wish we had, we wish we had a `MessageList` component to display the messages, so let's write that code in `app/templates/index.hbs`:

```diff
 <NewMessageForm />
+<MessageList />
```

Now let's generate that component:

```sh
$ ember g component MessageList
```

Open `app/components/message-list.hbs` and add the following:

```handlebars
<ul data-test-message-list>
</ul>
```

Now our acceptance test can find the message list. Now we get the error:

```sh
Acceptance | sending a message: it shows the message in the list
    ✘ Element [data-test-message-list] has text "Hello World"
```

The test expected to find the text of our message, "Hello World", somewhere in the message list, but it didn't.

How will we send our message between the `NewMessageForm` and `MessageList`? Well, messages are the core data item of our application. We want to use Ember Data to store our data. So, when we submit the form, we want to create a new message record in Ember Data. And we want our index route to load all messages from Ember Data and pass them to `MessageList` to display.

What part does `NewMessageForm` play in all this? For the sake of creating nice decoupled components, let's say that we don't want our form to know about Ember Data directly. Instead, we just want it to call a passed-in function with the results of the form.

To add this event handler behavior to `NewMessageForm`, we want to step back down to the component test. In this case, the component test won't be asserting exactly the same thing as the acceptance test. The acceptance test is looking for the 'New message' content on the screen, but the component test will only be asserting the behavior that the `NewMessageForm` component is responsible for: that it calls the event handler.

Add another test case to `new-message-form-test.js`:

```diff
 import { hbs } from 'ember-cli-htmlbars';
+import sinon from 'sinon';

 module('Integration | Component | new-message-form', function (hooks) {
...
     assert.dom('[data-test-message-text]').hasValue('');
   });
+
+  test('it calls the onSend argument with the message', async function (assert) {
+    const message = 'Hello World';
+
+    const handleSend = sinon.spy();
+    this.set('handleSend', handleSend);
+
+    await render(hbs`<NewMessageForm @onSend={{handleSend}} />`);
+
+    await fillIn('[data-test-message-text]', message);
+    await click('[data-test-send-message-button]');
+
+    assert.ok(handleSend.calledWith(message));
+  });
 });
```

Notice that we **make one assertion per test in component tests.** Having separate test cases for each behavior of the component makes it easy to understand what it does, and easy to see what went wrong if one of the assertions fails.

You may recall that this isn't what we did in the acceptance test, though. Generally you **make *multiple* assertions per test in acceptance tests.** Why? acceptance tests are slower, so the overhead of the repeating the steps would significantly slow down our suite as it grows. In fact, larger acceptance tests tend to turn into "[feature tours][feature-tours]:" you perform some actions, do some assertions, perform some more actions, do more assertions, etc.

Our tests run, and our new test fails with the error:

```sh
Integration | Component | new-message-form: it calls the onSend argument
with the message
    ✘ failed, expected argument to be truthy, was: false
```

So the `onSend` argument isn't being called. Let's fix that:

```diff
   @action
   handleSend(e) {
     e.preventDefault();
+    if(this.args.onSend) {
+      this.args.onSend(this.message);
+    }
     this.message = '';
   }
```

Now the component test passes. That's great! But we're still getting the same acceptance test error:

```sh
Acceptance | sending a message: it shows the message in the list
    ✘ Element [data-test-message-list] has text "Hello World"
```

We're still not displaying the message. But we're a step closer!

## Ember Data

To get the message to display, we need to wire up saving and loading our messages in Ember Data.

First, let's create an Ember Data model for our messages:

```sh
$ ember g model message
```

This creates the file `app/models/messages.js`. Open it and add an attribute for the message text:

```diff
-import Model from '@ember-data/model';
+import Model, {attr} from '@ember-data/model';

 export default class MessageModel extends Model {
+  @attr text;
 }
```

Since our `NewMessageForm` is embedded directly into a route, the place we can make an action to pass to it is a controller for that route. Generate an index controller:

```sh
$ ember g controller index
```

Then add a `handleSend` action to it:

```diff
 import Controller from '@ember/controller';
+import { action } from '@ember/object';

 export default class IndexController extends Controller {
+  @action
+  handleSend(text) {
+    const message = this.store.createRecord('message', { text });
+    message.save();
+  }
 }
```

We access the Ember Data `store` that's made available to controllers automatically and use it to create a new message record, passing it the provided text. Then we save that record.

Next, let's pass that action to the `NewMessageForm`:

```diff
-<NewMessageForm />
+<NewMessageForm @onSend={{this.handleSend}} />
 <MessageList />
```

Now that we should have message records created, let's update our route to load them. Add the following to `app/routes/index.js`:

```diff
 import Route from '@ember/routing/route';

 export default class IndexRoute extends Route {
+  model() {
+    return this.store.findAll('message');
+  }
 }
```

Next, pass the loaded model into the `MessageList`:

```diff
{%raw %} <NewMessageForm @onSend={{this.handleSend}} />
-<MessageList />
+<MessageList @messages={{@model}} />
```

Finally, let's update the `MessageList` template to display these messages:

```diff
 <ul data-test-message-list>
+  {{#each @messages as |message|}}
+    <li>{{message.text}}</li>
+  {{/each}}
 </ul>
```

Now when our acceptance test runs, Mirage gives us an error:

```sh
Error while processing route: index Mirage: Your app tried to GET
'/messages', but there was no route defined to handle this request.
Define a route for this endpoint in your routes() config.
```

Our route is attempting to load the messages from a backend server, which we've mocked out with Mirage, but we haven't told Mirage that `GET /messages` is a valid endpoint. Let's add that to `mirage/config.js`:

```diff
 export default function() {
+  this.get('/messages');

   // These comments are here to help you get started. Feel free to delete them.
```

After this, when our tests run again, we get a similar error:

```sh
Mirage: Error: Your app tried to POST '/messages', but there was no
route defined to handle this request.
```

This occurs when our controller attempts to save a record to the server. Let's add this as a valid route as well:

```diff
 export default function() {
   this.get('/messages');
+  this.post('/messages');

   // These comments are here to help you get started. Feel free to delete them.
```

Rerun the tests and they pass. We've let the tests drive our first feature!

Let's load up the app in a regular browser: go to `http://localhost:4200`. Well, it works, but it's not the prettiest thing in the world. But now we can add styling.

# Why TDD?

What have we gained by using outside-in Test-Driven Development?

- *Confidence it works.* Unit or component tests are great to specify the functionality of functions or classes, but the app can still crash or do the wrong thing when they’re connected together. An acceptance test confirms that all the pieces connect in the right way.
- *Input on our design.* Our component test confirms that the way we interact with NewMessageForm is simple. If it was complex, our component test would have been harder to write.
- *100% test coverage.* By only writing the minimal code necessary to pass each error, this ensures we don’t have any code that *isn’t* covered by a test. This avoids the situation where a change we make breaks untested code.
- *Minimal code.* We’ve built the minimal features that pass our test. This has helped us avoid to speculate on features the code *might* need in the future, that increase our maintenance cost without adding any benefit.
- *Ability to refactor.* Because we have 100% test coverage, we can make changes to our code to improve its design to handle future requirements. Our code doesn't develop cruft that makes it complex to work within.
- *Ability to ship quickly.* We aren't spending time building code our users don't need. When some old code is slowing us down, we can refactor it to make it quicker to work with. And our tests reduce the amount of manual testing we need to do before a release.

Acceptance testing has had major payoffs for server-rendered apps, and with Ember's built-in acceptance testing you can see the same benefits in your client-side apps.

## More Resources

To learn more about TDD, I recommend:

* ["Outside In TDD"](https://vimeo.com/146953048) meetup talk (video)
* <a href="https://click.linksynergy.com/link?id=JlUaUff9Alw&offerid=145238.681793&type=2&murl=https%3A%2F%2Fwww.informit.com%2Ftitle%2F9780321503626"><em>Growing Object-Oriented Software, Guided by Tests</em></a><IMG border=0 width=1 height=1 src="https://ad.linksynergy.com/fs-bin/show?id=JlUaUff9Alw&bids=145238.681793&type=2&subid=0" /> - The original work on the style of TDD we describe here, mockist TDD. It has a lot of great detail, not just about testing, but also how it influences design and project methodology.

If you have any questions or suggestions, reach out to [@CodingItWrong](https://twitter.com/CodingItWrong) on Twitter or <tdd@codingitwrong.com> and we'll be glad to help!

[feature-tours]: https://iamvery.com/2018/11/14/feature-tours.html
