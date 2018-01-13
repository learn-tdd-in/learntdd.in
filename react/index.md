---
title: Learn TDD in React
---

{% include tutorial-intro.md %}

To see how TDD works in React, let's walk through a simple real-world example of building a feature. We'll be using React 16.2.0 and a few different testing tools: [Cypress][cypress] for end-to-end tests and [Enzyme][enzyme] for component tests. You can also follow along in the [Git repo](https://github.com/learn-tdd-in/react) that shows the process step-by-step. This tutorial assumes you have some [familiarity with React][react] and with [automated testing concepts](/learn-tdd/concepts).

The feature we'll build is a simple list of messages.

## Setup

First, create a new React app with [`create-react-app`][create-react-app]:

```
# npx create-react-app ReactTDD
```

Now, run your app and leave it open for the duration of the process:

```
# cd ReactTDD
# npm start
```

Next, we need to add Cypress and Enzyme as dependencies of our project:

```
# npm install --save-dev cypress enzyme enzyme-adapter-react-16
```

Add an NPM script for opening Cypress into your `package.json`:

```diff
 {
   ...
   "scripts": {
     ...
+    "cypress:open": "cypress open"
   }
   ...
 }
```

Now open Cypress and it will initialize your app:

```
# npm run cypress:open
```

Now, to set up Enzyme to work within `create-react-app`, create a `src/setupTests.js` file and add the following:

```javascript
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
```

As our last setup step, let's clear out some of the default code to get a clean starting point. Delete all the following files:

- `cypress/integration/example_spec.js`
- `src/App.css`
- `src/App.test.js`
- `src/logo.svg`

Replace the contents of `src/App.js` with the following:

```jsx
import React, { Component } from 'react';

class App extends Component {
  render() {
    return (
      <div>
      </div>
    );
  }
}

export default App;
```

## The Feature Test

When performing outside-in TDD, our first step is to **create an end-to-end test describing the feature we want users to be able to do.** For our simple messaging app, the first feature we want is to be able to enter a message, save it, and see it in the list.

Create a file `cypress/integration/creating_a_message_spec.js` and enter the following contents:

```javascript
describe('Creating a message', () => {
  it('Displays the message in the list', () => {
    cy.visit('http://localhost:3000');

    cy.get("[data-test='messageText']")
      .type('New message');

    cy.get("[data-test='saveButton']")
      .click();

    cy.get("[data-test='messageText']")
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

If you've closed Cypress, reopen it with:

```
# npm run cypress:open
```

Run the Cypress test by clicking `creating_a_message_spec.js` in the Cypress window. A Chrome window should open, you should see the test run, then in the left-hand test step column you should see the following error:

```
Expected to find element: '[data-test='messageText']', but never found it.
```

## Write The Code You Wish You Had

The next step of TDD is to **write only enough production code to fix the current error or test failure.** In our case, all we need to do is add a message text field.

A common principle in TDD is to **write the code you wish you had.** We could just add an `<input type="text">` element to the `<App>` directly. But say we want to keep our `<App>` simple and wrap everything related to the input in a custom component. We might call that component `<NewMessageForm>`. We wish we had it, so let's go ahead and add it to `App.js`:

```diff
 import React, { Component } from 'react';
+import NewMessageForm from './NewMessageForm';

 class App extends Component {
   render() {
     return (
       <div>
+        <NewMessageForm />
       </div>
     );
   }
 }
```

Next, let's create `NewMessageForm.js` with the following contents. It's tempting to fully build out this component. But we want to wait until the test guides us in what to build. Let's just make it an empty but functioning component:

```jsx
import React, { Component } from 'react';

export default class NewMessageForm extends Component {
  render() {
    return (
      <div>
      </div>
    );
  }
}
```

Now rerun the tests in Cypress. We're still getting the same error, because we haven't actually added a text input. But we're a step closer because we've written the code we wish we had: a component to wrap it. Now we can add the input tag directly. We give it a `data-test` attribute of "messageText": that's the attribute that our test uses to find the component.

```diff
 export default class NewMessageForm extends Component {
   render() {
     return (
       <div>
+        <input
+          type="text"
+          data-test="messageText"
+        />
       </div>
     );
   }
 }
```

Rerun the tests. The error has changed! The tests are now able to find the "messageText" element. The new error is:

```
Expected to find element: ‘[data-test=’saveButton’]’, but never found it.
```

Now there's a different element we can't find: the element with attribute `data-test=’saveButton’`.

We want the save button to be part of our `NewMessageForm`, so fixing this error is easy. We just add a `<button>` to our component:

```diff
           type="text"
           data-test="messageText"
         />
+        <button
+          data-test="saveButton"
+        >
+          Save
+        </button>
       </div>
     );
   }
```

## Implementing Component Behavior

Rerun the tests. Now we get a new kind of test failure:

```
expected '<input />' to have value '', but the value was 'New message'
```

We've made it to our first assertion, which is that the message text box should be empty -- but it isn't. We haven't yet added the behavior to our app to clear out the message text box.

Typically we’d create a component test for NewMessageForm to specify the behavior that the text input should be cleared out upon clicking Save. However, asserting against HTML properties isn’t typical in Enzyme.

Instead, let's add the behavior directly. To accomplish this, we'll need to make the input a [controlled component][controlled-component], so its text is available in the parent component's state:

```diff
 export default class NewMessageForm extends Component {
+  state = { inputText: '' }
+ 
+  handleTextChange = (event) => {
+    this.setState({ inputText: event.target.value });
+  }
+ 
   render() {
+    const { inputText } = this.state;
     return (
       <div>
         <input
           type="text"
           data-test="messageText"
+          value={inputText}
+          onChange={this.handleTextChange}
         />
         <button
           data-test="saveButton"
         >
```

Next, we want to clear out `inputText` when the Save button is clicked:

```diff
   handleTextChange = (event) => {
     this.setState({ inputText: event.target.value });
   }
 
+  handleSave = () => {
+    this.setState({ inputText: '' });
+  }
+ 
   render() {
...
         <button
           data-test="saveButton"
+          onClick={this.handleSave}
         >
           Save
         </button>
```

Rerun the test. This gets us past the assertion failure.

Now our final assertion fails:

```
Expected to find content: 'New message' but never did.
```

Now, finally, the test will drive us to implement the real meat of our feature: storing the message entered and displaying it.

The NewMessageForm won't be responsible for displaying this message, though: we'll create a separate MessageList component that also exists in the parent App component. The way we can send data to the parent component is by taking in an event handler and calling it.

Getting the component to take in an event handler and call it is a great use of Enzyme-based component testing. We can now **step down from the "outside" level of end-to-end tests to an "inside" component test.** This allows us to more precisely specify the behavior of each piece. Also, since end-to-end tests are slow, component tests prevent us from having to write an end-to-end test for every rare edge case.

Let's write an Enzyme component test specifying that clicking the Save button should call the passed-in event handler. Create the file `src/__tests__/NewMessageForm.test.js` and enter the following contents:

```jsx
import React from 'react';
import { mount } from 'enzyme';
import NewMessageForm from '../NewMessageForm';

describe('<NewMessageForm />', () => {
  it('calls onSave with the entered message', () => {
    const saveCallback = jest.fn();
    const wrapper = mount(<NewMessageForm onSave={saveCallback} />);

    wrapper
      .find("[data-test='messageText']")
      .simulate('change', { target: { value: 'New message' } });
    wrapper
      .find("[data-test='saveButton']")
      .simulate('click');

    expect(saveCallback).toHaveBeenCalledTimes(1);
    expect(saveCallback).toHaveBeenCalledWith('New message');
  });
});
```

Enzyme isn't a test runner; it's used within the context of other tests. Here we've written a test with Jest, the default test runner in `create-react-app`. You can run the test with `npm test`. You should see this result:

```
Expected mock function to have been called one time, but it was called zero times.
```

So the `saveCallback` isn't being called. Let's fix that:

```diff
   handleSave = () => {
+    const { onSave } = this.props;
+ 
+    onSave();
+ 
     this.setState({ inputText: '' });
   }
```

Rerun and now the error is:

```
Expected mock function to have been called with:
      ["New message"]
    But it was called with:
      Array []
```

So we aren't yet passing the message text to the `saveCallback`. That's also an easy fix:

```diff
   handleSave = () => {
+    const { inputText } = this.state;
     const { onSave } = this.props;
 
-    onSave();
+    onSave(inputText);

     this.setState({ inputText: '' });
   }
```

Now the component test passes. That's great! **When an inner test passes, step back up to the outer test to see what error you need to fix next.**

```
Uncaught TypeError: onSave is not a function
```

We changed NewMessageForm to use an onSave event handler, but we haven't passed one to our NewMessageForm in our production code. Let's add an empty one to get past this error:

```diff
 class App extends Component {
+  handleSave = (newMessage) => {
+  }
+ 
   render() {
     return (
       <div>
-        <NewMessageForm />
+        <NewMessageForm onSave={this.handleSave} />
       </div>
     );
   }
```

Rerun the e2e test and we get:

```
Expected to find content: ‘New message’ but never did.
```

We no longer get the `onSave` error--now we're back to the same assertion failure, because we're still not displaying the message. But we're a step closer!

## A List

Next, we need to save the message in state in the App component. Let's add it to an array:

```diff
 import NewMessageForm from './NewMessageForm';
 
 class App extends Component {
+  state = { messages: [] };
+ 
   handleSave = (newMessage) => {
+    const { messages } = this.state;
+    this.setState({ messages: [newMessage, ...messages] });
   }
 
   render() {
```

Next, to display the messages, let's create another custom component to keep our App component nice and simple. We'll call it MessageList. We'll write the code we wish we had in `App.js`:

```diff
 import React, { Component } from 'react';
 import NewMessageForm from './NewMessageForm';
+import MessageList from './MessageList';
 
 class App extends Component {
...
 
   render() {
+    const { messages } = this.state;
     return (
       <div>
         <NewMessageForm onSave={this.handleSave} />
+        <MessageList data={messages} />
       </div>
     );
   }
```

Next, we'll create `MessageList.js` and add an empty implementation. Since this component won't have any state, it can be a functional component instead of a class component:

```jsx
import React from 'react';

const MessageList = ({ data }) => (
  <div />
);

export default MessageList;
```

Rerun the tests, and, as we expect, we still aren't displaying the message. But now that we have a MessageList component, we're ready to finally implement that and make the test pass:

```diff
 import React from 'react';
 
 const MessageList = ({ data }) => (
-  <div />
+  <ul>
+    { data.map(message => <li>{message}</li>) }
+  </ul>
 );
 
 export default MessageList;
```

Rerun the tests and they pass. We've let the tests drive our first feature!

Let's take a look in the simulator. Run the app with `yarn start`. Well, it works, but it's not the prettiest thing in the world. But now we can add styling.

# Why TDD?

What have we gained by using outside-in Test-Driven Development?

- *Confidence it works.* Unit or component tests are great to specify the functionality of functions or classes, but the app can still crash or do the wrong thing when they’re connected together. An end-to-end test confirms that all the pieces connect in the right way.
- *Input on our design.* Our component test confirms that the way we interact with NewMessageForm is simple. If it was complex, our component test would have been harder to write.
- *100% test coverage.* By only writing the minimal code necessary to pass each error, this ensures we don’t have any code that *isn’t* covered by a test. This avoids the situation where a change we make breaks untested code.
- *Minimal code.* We’ve built the minimal features that pass our test. This has helped us avoid to speculate on features the code *might* need in the future, that increase our maintenance cost without adding any benefit.
- *Ability to refactor.* Because we have 100% test coverage, we can make changes to our code to improve its design to handle future requirements. Our code doesn't develop cruft that makes it complex to work within.
- *Ability to ship quickly.* We aren't spending time building code our users don't need. When some old code is slowing us down, we can refactor it to make it quicker to work with. And our tests reduce the amount of manual testing we need to do before a release.

End-to-end testing has had major payoffs for server-rendered apps, and with Cypress you can see the same benefits in client-side frameworks like React.

## More Resources

To learn more about TDD, I recommend:

{% include tutorial-goos.md %}
* ["JavaScript Jabber 224: Cypress.js"](https://devchat.tv/js-jabber/224-jsj-cypress-js-with-brian-mann) podcast episode

{% include tutorial-contact.md %}

[controlled-component]: https://reactjs.org/docs/forms.html#controlled-components
[create-react-app]: https://github.com/facebookincubator/create-react-app#create-react-app-
[cypress]: https://www.cypress.io/
[enzyme]: http://airbnb.io/enzyme/
[react]: https://reactjs.org/docs/hello-world.html
