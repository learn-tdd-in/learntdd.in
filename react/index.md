---
layout: tutorial
title: Learn TDD in React
logo: /images/react.svg
logo_alt: React logo
---

{% include tutorial-intro.md %}

To see how TDD works in React, let's walk through a simple real-world example of building a feature. We'll be using React 16.14 via [Create React App](https://github.com/facebook/create-react-app). We'll implement end-to-end tests with [Cypress][cypress] and component tests with [Jest][jest] and [React Testing Library][react-testing-library]. You can also follow along in the [Git repo](https://github.com/learn-tdd-in/react) that shows the process step-by-step. This tutorial assumes you have some [familiarity with React][react] and with [automated testing concepts](/concepts).

You can also watch a [conference talk](https://vimeo.com/298277470) version of this tutorial.

The feature we'll build is a simple list of messages.

## Setup

First, create a new React app:

```bash
$ npx create-react-app learn-tdd-in-react
```

Now, run your app and leave it open for the duration of the process:

```bash
$ cd learn-tdd-in-react
$ yarn start
```

Apps created with `create-react-app` come with Jest and React Testing Library preinstalled, so we already have all we need for component testing.

Next, we need to add Cypress:

```bash
$ yarn add --dev cypress
```

Add an NPM script for opening Cypress into your `package.json`:

```diff
 {
   ...
   "scripts": {
     ...
+    "cypress:open": "cypress open"
   },
   ...
 }
```

Now open Cypress and it will initialize Cypress within your app, creating some files:

```bash
$ yarn cypress:open
```

As our last setup step, let's clear out some of the default code to get a clean starting point. Delete all the following files and folders:

- `cypress/integration/examples/`
- `src/App.css`
- `src/App.test.js`
- `src/logo.svg`

Replace the contents of `src/App.js` with the following:

```jsx
import React from 'react';

const App = () => {
  return (
    <div>
    </div>
  );
};

export default App;
```

Note that for this tutorial we'll use function components and hooks. But the tests we'll write will work just the same if you write class components instead. That's one of the great things about tests that aren't coupled to implementation details.

## The Feature Test

When performing outside-in TDD, our first step is to **create an end-to-end test describing the feature we want users to be able to do.** For our simple messaging app, the first feature we want is to be able to enter a message, send it, and see it in the list.

Create a file `cypress/integration/creating_a_message.spec.js` and enter the following contents:

```javascript
describe('Creating a message', () => {
  it('Displays the message in the list', () => {
    cy.visit('http://localhost:3000');

    cy.get('[data-testid="messageText"]')
      .type('New message');

    cy.get('[data-testid="sendButton"]')
      .click();

    cy.get('[data-testid="messageText"]')
      .should('have.value', '');

    cy.contains('New message');
  });
});
```

The code describes the steps a user would take interacting with our app:

- Visiting the web site
- Entering the text "New message" into a message text field
- Clicking a send button
- Confirming that the message text field is cleared out
- Confirming that the "New message" we entered appears somewhere on screen

After we've created our test, the next step in TDD is to **run the test and watch it fail.**  This test will fail (be "red") at first because we haven't yet implemented the functionality.

If you've closed Cypress, reopen it with:

```bash
$ yarn cypress:open
```

Run the Cypress test by clicking `creating_a_message.spec.js` in the Cypress window. A Chrome window should open, you should see the test run, then in the left-hand test step column you should see the following error:

```bash
Expected to find element: '[data-testid='messageText']', but never found it.
```

## Write The Code You Wish You Had

The next step of TDD is to **write only enough production code to fix the current error or test failure.** In our case, all we need to do is add a message text field.

A common principle in TDD is to **write the code you wish you had.** We could just add an `<input type="text">` element to the `<App>` directly. But say we want to keep our `<App>` simple and wrap everything related to the input in a custom component. We might call that component `<NewMessageForm>`. We wish we had it, so let's go ahead and add it to `App.js`:

```diff
 import React, { Component } from 'react';
+import NewMessageForm from './NewMessageForm';

 const App = () => {
   return (
     <div>
+      <NewMessageForm />
     </div>
   );
 };
```

Next, let's create `NewMessageForm.js` with the following contents. It's tempting to fully build out this component. But we want to wait until the test guides us in what to build. Let's just make it an empty but functioning component:

```jsx
import React from 'react';

const NewMessageForm = () => {
  return (
    <div>
    </div>
  );
};

export default NewMessageForm;
```

Now rerun the tests in Cypress. We're still getting the same error, because we haven't actually added a text input. But we're a step closer because we've written the code we wish we had: a component to wrap it. Now we can add the input tag directly. We give it a `data-testid` attribute of "messageText": that's the attribute that our test uses to find the component.

```diff
 const NewMessageForm = () => {
   return (
     <div>
+      <input
+        type="text"
+        data-testid="messageText"
+      />
     </div>
   );
 };
```

Rerun the tests. The error has changed! The tests are now able to find the "messageText" element. The new error is:

```bash
Expected to find element: ‘[data-testid=’sendButton’]’, but never found it.
```

Now there's a different element we can't find: the element with attribute `data-testid=’sendButton’`.

We want the send button to be part of our `NewMessageForm`, so fixing this error is easy. We just add a `<button>` to our component:

```diff
 const NewMessageForm = () => {
   return (
     <div>
       <input
         type="text"
         data-testid="messageText"
       />
+      <button
+        data-testid="sendButton"
+      >
+        Send
+      </button>
     </div>
   );
 };
```

## Implementing Component Behavior

Rerun the tests. Now we get a new kind of test failure:

```bash
expected '<input />' to have value '', but the value was 'New message'
```

We've made it to our first assertion, which is that the message text box should be empty -- but it isn't. We haven't yet added the behavior to our app to clear out the message text box.

Instead of adding the behavior directly, let's **step down from the "outside" level of end-to-end tests to an "inside" component test.** This allows us to more precisely specify the behavior of each piece. Also, since end-to-end tests are slow, component tests prevent us from having to write an end-to-end test for every rare edge case.

Create a `src/__tests__` folder, then create a file `src/__tests__/NewMessageForm.spec.js` and add the following:

```javascript
import React from 'react';
import {
  render,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import NewMessageForm from '../NewMessageForm';

describe('<NewMessageForm />', () => {
  let getByTestId;

  afterEach(cleanup);

  describe('clicking the send button', () => {
    beforeEach(() => {
      ({ getByTestId } = render(<NewMessageForm />));

      fireEvent.change(
        getByTestId('messageText'),
        {
          target: {
            value: 'New message',
          },
        },
      );

      fireEvent.click(getByTestId('sendButton'));
    });

    it('clears the text field', () => {
      expect(getByTestId('messageText').value).toEqual('');
    });
  });
});
```

React Testing Library has a different API than Cypress, but a lot of the test seems the same as the end-to-end test: we still enter a new message and click the send button. But this is testing something very different. Instead of testing the whole app running together, we're testing just the NewMessageForm by itself.

Run `yarn test` to run the component test. We get the same error as we did with the end-to-end test:

```bash
expect(received).toEqual(expected) // deep equality

Expected: ""
Received: "New message"
```

Now, we can add the behavior to the component to get this test to pass. To accomplish this, we'll need to make the input a [controlled component][controlled-component], so its text is available in the parent component's state:

```diff
-import React from 'react';
+import React, { useState } from 'react';

 const NewMessageForm = () => {
+  const [inputText, setInputText] = useState('');
+
+  const handleTextChange = event => {
+    setInputText(event.target.value);
+  };
+
   return (
     <div>
       <input
         type="text"
         data-testid="messageText"
+        value={inputText}
+        onChange={handleTextChange}
       />
       <button
         data-testid="sendButton"
       >
         Send
       </button>
     </div>
   );
 };
```

Next, we want to clear out `inputText` when the send button is clicked:

```diff
   handleTextChange = event => {
     setInputText(event.target.value);
   }

+  handleSend = () => {
+    setInputText('');
+  }
+
   render() {
...
         <button
           data-testid="sendButton"
+          onClick={handleSend}
         >
           Send
         </button>
```

Rerun the component test and it passes. **Once a component test passes, step back up to the outer end-to-end test to see what the next error is.** Rerun `creating_a_message.spec.js`. Now our final assertion fails:

```bash
Expected to find content: 'New message' but never did.
```

Now, finally, the test will drive us to implement the real meat of our feature: storing the message entered and displaying it.

The NewMessageForm won't be responsible for displaying this message, though: we'll create a separate MessageList component that also exists in the parent App component. The way we can send data to the parent component is by taking in an event handler and calling it.

To add this event handler behavior to NewMessageForm, we want to step back down to the component test. In this case, the component test won't be asserting exactly the same thing as the end-to-end test. The end-to-end test is looking for the 'New message' content on the screen, but the component test will only be asserting the behavior that the NewMessageForm component is responsible for: that it calls the event handler.

Add another test case to `NewMessageForm.spec.js`:

```diff
   afterEach(cleanup);

   describe('clicking the send button', () => {
+    let sendHandler;
+
     beforeEach(() => {
+      sendHandler = jest.fn();
-      ({ getByTestId } = render(<NewMessageForm />));
+      ({ getByTestId } = render(<NewMessageForm onSend={sendHandler} />));

       fireEvent.change(
...
     it('clears the text field', () => {
       expect(getByTestId('messageText').value).toEqual('');
     });
+
+    it('calls the send handler', () => {
+      expect(sendHandler).toHaveBeenCalledWith('New message');
+    });
   });
 });
```

Notice that we **make one assertion per test in component tests.** Having separate test cases for each behavior of the component makes it easy to understand what it does, and easy to see what went wrong if one of the assertions fails. The `beforeEach` block will run through the same steps for each of the two test cases below.

You may recall that this isn't what we did in the end-to-end test, though. Generally you **make *multiple* assertions per test in end-to-end tests.** Why? End-to-end tests are slower, so the overhead of the repeating the steps would significantly slow down our suite as it grows. In fact, larger end-to-end tests tend to turn into "[feature tours][feature-tours]:" you perform some actions, do some assertions, perform some more actions, do more assertions, etc.

Run the component test again. You'll see the "clears the text field" test pass, and the new 'emits the "send" event' test fail with the error:

```bash
expect(jest.fn()).toHaveBeenCalledWith(...expected)

Expected: "New message"

Number of calls: 0
```

So the `sendHandler` isn't being called. Let's fix that:

```diff
-const NewMessageForm = () => {
+const NewMessageForm = ({ onSend }) => {
   const [inputText, setInputText] = useState('');
...
   const handleSend = () => {
+    onSend(inputText);
     setInputText('');
   };
```

Now the component test passes. That's great! Now we step back up again to run our feature test and we get:

```bash
Uncaught TypeError: onSend is not a function
```

We changed NewMessageForm to use an onSend event handler, but we haven't passed one to our NewMessageForm in our production code. Let's add an empty one to get past this error:

```diff
 const App = () => {
+  const handleSend = newMessage => {};
+
   render() {
     return (
       <div>
-        <NewMessageForm />
+        <NewMessageForm onSend={handleSend} />
       </div>
     );
   }
```

Rerun the e2e test and we get:

```bash
Expected to find content: ‘New message’ but never did.
```

We no longer get the `onSend` error--now we're back to the same assertion failure, because we're still not displaying the message. But we're a step closer!

## A List

Next, we need to save the message in state in the App component. Let's add it to an array:

```diff
-import React from 'react';
+import React, { useState } from 'react';
 import NewMessageForm from './NewMessageForm';

 const App = () => {
+  const [messages, setMessages] = useState([]);
   const handleSend = newMessage => {
+    setMessages([newMessage, ...messages]);
   };
```

Next, to display the messages, let's create another custom component to keep our App component nice and simple. We'll call it MessageList. We'll write the code we wish we had in `App.js`:

```diff
 import React, { Component } from 'react';
 import NewMessageForm from './NewMessageForm';
+import MessageList from './MessageList';

 const App = () => {
...
   return (
     <div>
       <NewMessageForm onSend={handleSend} />
+      <MessageList data={messages} />
     </div>
   );
```

Next, we'll create `MessageList.js` and add an empty implementation:

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
+    { data.map(message => <li key={message}>{message}</li>) }
+  </ul>
 );

 export default MessageList;
```

Rerun the tests and they pass. We've let the tests drive our first feature!

Let's load up the app in a regular browser: go to `http://localhost:3000`. Well, it works, but it's not the prettiest thing in the world. But now we can add styling.

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

* [Outside-In Frontend Development in React][outsideindev] - a free online book walking through this style of TDD.
* ["Test-Driven Development in React"](https://www.youtube.com/playlist?list=PLXXnezSEtvNMlfJFd1Z2wilxymcOaVl9Q) - a free nine-video series of live stream recordings
{% include tutorial-goos.md %}

{% include tutorial-contact.md %}

[controlled-component]: https://reactjs.org/docs/forms.html#controlled-components
[create-react-app]: https://github.com/facebook/create-react-app
[cypress]: https://www.cypress.io/
[feature-tours]: https://iamvery.com/2018/11/14/feature-tours.html
[jest]: https://jestjs.io/
[outsideindev]: https://outsidein.dev/
[react]: https://reactjs.org/docs/hello-world.html
[react-testing-library]: https://testing-library.com/docs/react-testing-library/intro
