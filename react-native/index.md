---
layout: tutorial
title: Learn TDD in React Native
logo: /images/react.svg
logo_alt: React Native logo
---

{% include tutorial-intro.md %}

To see how TDD works in React Native, let's walk through a simple real-world example of building a feature. We'll be using [Expo][expo] 31, but the steps below are almost exactly the same if you're using React Native CLI -- just follow the [Getting Started instructions on Detox's web site][detox-getting-started] instead of the Detox instructions below.

We'll be testing with the [Jest][jest] test runner and two testing libraries: [react-native-testing-library][react-native-testing-library] for component tests and [Detox][detox] for end-to-end tests.

This tutorial assumes you have some [familiarity with React Native][react-native] and with [automated testing concepts](/learn-tdd/concepts).

You can also follow along in the [Git repo](https://github.com/learn-tdd-in/react-native) that shows the process step-by-step. You can also watch a [live stream recording](https://www.youtube.com/watch?v=iyfsE2f1Q4Y&list=PLXXnezSEtvNPZroRdvjhEVzOhURl572Lf&index=3&t=0s) of this tutorial with slightly different tooling.

The feature we'll build is a simple list of messages.

## Setup

It takes a little work to get our testing setup in place, but it'll be worth it!

First, if you don't have the Expo CLI installed, install it:

```bash
$ npm install -g expo-cli
```

Create a new Expo app:

```bash
$ expo init --template blank react-native-tdd
```

Let's run it to confirm it works:

```bash
$ cd react-native-tdd
$ yarn ios
```

After a few minutes you should see the welcome screen of the app in the iOS Simulator.

Next, let's install Jest. Since we're using Expo, there is an Expo-specific Jest package we can use:

```bash
$ yarn add --dev jest-expo
```

Add the following to `package.json`:

```diff
     "android": "expo start --android",
     "ios": "expo start --ios",
+    "test": "node_modules/.bin/jest test/**/*.spec.js",
     "eject": "expo eject"
   },
...
     "jest-expo": "^31.0.0"
   },
+  "jest": {
+    "preset": "jest-expo"
+  },
   "private": true
```

Now we'll add react-native-testing-library to enable component testing:

```bash
$ yarn add --dev react-native-testing-library \
                 react-test-renderer
```

Next, to get Detox working, let's first install the global Detox CLI tool:

```bash
$ brew tap wix/brew
$ brew install --HEAD applesimutils
$ yarn global add detox-cli
```

Next, we need to add Detox and a few Expo integration packages to our project:

```bash
$ yarn add --dev detox \
                 detox-expo-helpers \
                 expo-detox-hook
```

Then initialize Detox in the project, specifying Jest as the test runner:

```bash
$ detox init -r jest
```

One of the files this command generates is a sample test file, `e2e/firstTest.spec.js`. We need to make one tweak to this file for it to work with Expo:

```diff
+const { reloadApp } = require('detox-expo-helpers');
+
 describe('Example', () => {
   beforeEach(async () => {
-    await device.reloadReactNative();
+    await reloadApp();
   });
```

Next, we need to download a built version of Expo that Detox can use to hook into. Go to [the Expo Tools page](https://expo.io/tools#client) and click the "Download IPA" link. Expand the downloaded archive, then change the name of the folder to "Exponent.app". Create a `bin` folder in your project and move "Exponent.app" into it.

After this, we need to add some config for Detox to our `package.json`:

```diff
 {
   ...
   "detox": {
-    "test-runner": "jest"
+    "test-runner": "jest",
+    "configurations": {
+      "ios.sim": {
+        "binaryPath": "bin/Exponent.app",
+        "type": "ios.simulator",
+        "name": "iPhone 8"
+      }
+    }
   }
 }
```

Now, let's run it and see that the initial test fails. If Expo and the iOS Simulator are not still running, start them:

```bash
$ yarn ios
```

Then, in another terminal, run Detox:

```bash
$ detox test
```

You should see the Expo app launched in a simulator a few times in a row, then you should see output including something like the following:

```bash
Test Suites: 1 failed, 1 total
Tests:       3 failed, 3 total
Snapshots:   0 total
Time:        107.741s
Ran all test suites matching /e2e/i with tests matching "^((?!:android:).)*$".
child_process.js:650
    throw err;
```

As our last setup step, let's clear out some of the default code to get a clean starting point. Delete `e2e/firstTest.spec.js`, and replace the contents of `App.js` with an empty `View`:

```jsx
import React, { Component } from 'react';
import {
  View,
} from 'react-native';

export default class App extends Component {
  render() {
    return (
      <View>
      </View>
    );
  }
}
```

## The Feature Test

When performing TDD, our first step is to **create an end-to-end test describing the feature we want users to be able to do.** For our simple messaging app, the first feature we want is to be able to enter a message, send it, and see it in the list.

Create a file `e2e/creating_a_message.spec.js` and enter the following contents:

```js
const { reloadApp } = require('detox-expo-helpers');

describe('Creating a message', () => {
  beforeEach(async () => {
    await reloadApp();
  });

  it('should add the message to the list', async () => {
    await element(by.id('messageText')).tap();
    await element(by.id('messageText')).typeText('New message');
    await element(by.id('sendButton')).tap();

    await expect(element(by.id('messageText'))).toHaveText('');
    await expect(element(by.label('New message'))).toBeVisible();
  });
});
```

The code describes the steps a user would take interacting with our app:

- Tapping on a message text field to bring up a keyboard
- Entering the text "New message" into the text field
- Tapping a send button
- Confirming that the message text field is cleared out
- Confirming that the "New message" we entered appears somewhere on screen

After we've created our test, the next step in TDD is to **run the test and watch it fail.**  This test will fail (be "red") at first because we haven't yet implemented the functionality.

Run `detox test` and you should see the following error:

```bash
Creating a message
  ✕ should add the message to the list (12841ms)

● Creating a message › should add the message to the list


  Failed: Error: Error: Cannot find UI element.
  Exception with Action: {
    "Action Name":  "Tap",
    "Element Matcher":  "((!(kindOfClass('RCTScrollView')) && (respondsToSelector(accessibilityIde
ntifier) && accessibilityID('messageText'))) || (((kindOfClass('UIView') || respondsToSelector(acces
sibilityContainer)) && parentThatMatches(kindOfClass('RCTScrollView'))) && ((kindOfClass('UIView') |
| respondsToSelector(accessibilityContainer)) && parentThatMatches((respondsToSelector(accessibility
Identifier) && accessibilityID('messageText'))))))",
    "Recovery Suggestion":  "Check if the element exists in the UI hierarchy printed below. If it
exists, adjust the matcher so that it accurately matches element."
  }
```

The output is a bit verbose, but the important parts are:

- `"Error: Cannot find UI element"`: the test tried to find something in the UI but couldn't.
- `"Element Matcher: …accessibilityID('messageText')"`: it was trying to find an element by accessibility ID "messageText".

## Write The Code You Wish You Had

The next step of TDD is to **write only enough production code to fix the current error or test failure.** In our case, all we need to do is add a message text field.

A common principle in TDD is to **write the code you wish you had.** We could just add a `<TextInput>` element to the `<App>` directly. But say we want to keep our `<App>` simple and wrap everything related to the input in a custom component. We might call that component `<NewMessageForm>`. We wish we had it, so let's go ahead and add it to `App.js`:

```diff
 import {
   View,
 } from 'react-native';
+import NewMessageForm from './NewMessageForm';

 export default class App extends Component {
   render() {
     return (
       <View>
+        <NewMessageForm />
       </View>
     );
   }
 }
```

Next, let's create `NewMessageForm.js` with the following contents. It's tempting to fully build out this component. But we want to wait until the test guides us in what to build. Let's just make it an empty but functioning component:

```jsx
import React, { Component } from 'react';
import {
  View,
} from 'react-native';

export default class NewMessageForm extends Component {
  render() {
    return (
      <View>
      </View>
    );
  }
}
```

Now rerun the tests with `detox test`. We're still getting the same error, because we haven't actually added a text input. But we're a step closer because we've written the code we wish we had: a component to wrap it. Now we can add the TextInput directly. We give it a `testID` of "messageText": that's the ID that the Detox test uses to find the component.

```diff
 import React, { Component } from 'react';
 import {
+  TextInput,
   View,
 } from 'react-native';

 export default class NewMessageForm extends Component {
   render() {
     return (
       <View>
+        <TextInput
+          testID="messageText"
+        />
       </View>
     );
   }
 }
```

Rerun the tests. The error has changed! The tests are now able to find and type text into the "messageText" element. The new error is:

```bash
Failed: Error: Error: Cannot find UI element.
Exception with Action: {
  "Action Name":  "Tap",
  "Element Matcher":  "((!(kindOfClass('RCTScrollView')) && (respondsToSelector(accessibilityIdentifier) && accessibilityID('sendButton'))) || (((kindOfClass('UIView') || respondsToSelector(accessibilityContainer)) && parentThatMatches(kindOfClass('RCTScrollView'))) && ((kindOfClass('UIView') || respondsToSelector(accessibilityContainer)) && parentThatMatches((respondsToSelector(accessibilityIdentifier) && accessibilityID('sendButton'))))))",
  "Recovery Suggestion":  "Check if the element exists in the UI hierarchy printed below. If it exists, adjust the matcher so that it accurately matches element."
}
```

Now there's a different element we can't find: the element with `accessibilityID('sendButton')`.

We want the send button to be part of our `NewMessageForm`, so fixing this error is easy. We just add a Button to our component:

```diff
 import React, { Component } from 'react';
 import {
+  Button,
   TextInput,
   View,
 } from 'react-native';
...
         <TextInput
           testID="messageText"
         />
+        <Button
+          title="Send"
+          testID="sendButton"
+        />
       </View>
     );
   }
```

## Implementing Component Behavior

Rerun the tests. Now we get a new kind of test failure:

```bash
Failed: Error: Error: An assertion failed.
Exception with Assertion: {
  "Assertion Criteria":  "assertWithMatcher:(((kindOfClass('UILabel') || kindOfClass('UITextField') || kindOfClass('UITextView')) && hasText('')) || (kindOfClass('RCTTextView') && an object with accessibilityLabel ""))",
  "Element Matcher":  "((!(kindOfClass('RCTScrollView')) && (respondsToSelector(accessibilityIdentifier) && accessibilityID('messageText'))) || (((kindOfClass('UIView') || respondsToSelector(accessibilityContainer)) && parentThatMatches(kindOfClass('RCTScrollView'))) && ((kindOfClass('UIView') || respondsToSelector(accessibilityContainer)) && parentThatMatches((respondsToSelector(accessibilityIdentifier) && accessibilityID('messageText'))))))"
}
```

The important parts are:

- `"Assertion Criteria" : "…hasText('')…"` - The element should not have any text in it.
- `"Element Matcher" : "…accessibilityID('messageText')…"` - The element that should be empty is the message text box.

We've made it to our first assertion, which is that the message text box should be empty -- but it isn't. We haven't yet added the behavior to our app to clear out the message text box.

Instead of adding the behavior directly, let's **step down from the "outside" level of end-to-end tests to an "inside" component test.** This allows us to more precisely specify the behavior of each piece. Also, since end-to-end tests are slow, component tests prevent us from having to write an end-to-end test for every rare edge case.

Create a `test/components` folder, then create a `NewMessageForm.spec.js` file inside it. Add the following contents:

```javascript
import React from 'react';
import { render, fireEvent } from 'react-native-testing-library';
import NewMessageForm from '../../NewMessageForm';

describe('NewMessageForm', () => {
  describe('clicking send', () => {
    const messageText = 'Hello world';

    let getByTestId;

    beforeEach(() => {
      ({ getByTestId } = render(<NewMessageForm />));

      fireEvent.changeText(getByTestId('messageText'), messageText);
      fireEvent.press(getByTestId('sendButton'));
    });

    it('clears the message field', () => {
      expect(getByTestId('messageText').props.value).toEqual('');
    });
  });
});
```

This component test uses `react-native-testing-library`. it has a different API from Detox's, but we're doing something very similar to what the end-to-end test is doing. We've taken the scenario that caused the end-to-end error and reproduced it at the component level: when a user enters text and taps the send button, the text field should be cleared. Note that we have only specified enough of a component test to reproduce the current end-to-end error.

Run `yarn test` to see the component test fail:

```bash
● NewMessageForm › clicking send › clears the message field

  expect(received).toEqual(expected)

  Expected value to equal:
    ""
  Received:
    undefined
```

Enzyme is finding the `value` prop of the TextInput to be `undefined`; this is because we aren't passing in a value at all. To fix this, let's make the TextInput a [controlled component][controlled-component], so its text is available in the parent component's state:

```diff
 export default class NewMessageForm extends Component {
+  state = { inputText: '' }
+
+  handleChangeText = (text) => {
+    this.setState({ inputText: text });
+  }
+
   render() {
+    const { inputText } = this.state;
     return (
       <View>
         <TextInput
+          value={inputText}
           testID="messageText"
+          onChangeText={this.handleChangeText}
         />
```

Now when we rerun `yarn test` we get a different error:

```bash
  Expected value to equal:
    ""
  Received:
    "Hello world"
```

Now the field is successfully taking in the typed value; it just isn't clearing it out when Send is tapped. Let's fix that:

```diff
 export default class NewMessageForm extends Component {
   state = { inputText: '' }

   handleChangeText = (text) => {
     this.setState({ inputText: text });
   }

+  handleSend = () => {
+    this.setState({ inputText: '' });
+  }
+
   render() {
...
         <Button
           title="Send"
           testID="sendButton"
+          onPress={this.handleSend}
         />
```

Rerun the component test. This gets us past the assertion failure.

**Once a component test passes, step back up to the outer end-to-end test to see what the next error is.** Rerun `detox test`. Now our final assertion fails: it can't find a UI element that `hasText('New message')`.

Now, finally, the test will drive us to implement the real meat of our feature: storing the message entered and displaying it.

The NewMessageForm won't be responsible for displaying this message, though: we'll create a separate MessageList component that also exists in the parent App component. The way we can send data to the parent component is by taking in an event handler and calling it.

To add this event handler behavior to NewMessageForm, we want to step back down to the component test. In this case, the component test won't be asserting exactly the same thing as the end-to-end test. The end-to-end test is looking for the 'New message' content on the screen, but the component test will only be asserting the behavior that the NewMessageForm component is responsible for: that it calls the event handler.

```diff
   describe('clicking send', () => {
     const messageText = 'Hello world';

+    let sendHandler;
     let getByTestId;

     beforeEach(() => {
+      sendHandler = jest.fn();

-      ({ getByTestId } = render(<NewMessageForm />));
+      ({ getByTestId } = render(<NewMessageForm onSend={sendHandler} />));

       fireEvent.changeText(getByTestId('messageText'), messageText);
       fireEvent.press(getByTestId('sendButton'));
...
     it('clears the message field', () => {
       expect(getByTestId('messageText').props.value).toEqual('');
     });
+
+    it('calls the send handler', () => {
+      expect(sendHandler).toHaveBeenCalledWith(messageText);
+    });
   });
 });
```

Notice that we **make one assertion per test in component tests.** Having separate test cases for each behavior of the component makes it easy to understand what it does, and easy to see what went wrong if one of the assertions fails. The `beforeEach` block will run through the same steps for each of the two test cases below.

You may recall that this isn't what we did in the end-to-end test, though. Generally you **make *multiple* assertions per test in end-to-end tests.** Why? End-to-end tests are slower, so the overhead of the repeating the steps would significantly slow down our suite as it grows. In fact, larger end-to-end tests tend to turn into "feature tours:" you perform some actions, do some assertions, perform some more actions, do more assertions, etc.

Run the component test again. You'll see the "clears the text field" test pass, and the new 'emits the "send" event' test fail with the error:

```bash
● NewMessageForm › clicking send › calls the send handler

  expect(jest.fn()).toHaveBeenCalledWith(expected)

  Expected mock function to have been called with:
    ["Hello world"]
  But it was not called.
```

So the `sendHandler` isn't being called correctly. Let's fix that:

```diff
   handleSend = () => {
+    const { inputText } = this.state;
+    const { onSend } = this.props;
+
+    onSend(inputText);
+
     this.setState({ inputText: '' });
   }
```

Before overwriting the `inputText` state with an empty string, it retrieves an `onSend` function passed in as a prop, and passes the previous value of `inputText` to it.

Rerun the component tests and they will pass. Next, rerun the end-to-end tests. We get the same assertion failure, but if you look in the simulator, you'll see that we actually get a runtime error!

```bash
onSend is not a function. (In 'onSend(inputText)', 'onSend' is undefined…)
```

Our NewMessageForm is calling `onSend`, but we haven't yet passed a valid function into our component in our production code. Let's do so now. Again, we don't want to fully implement that event handler, only add only enough code to get past the current error. Add the following to `App.js`:

```diff
 export default class App extends Component {
+  handleSend = (newMessage) => {
+  }
+
   render() {
     return (
       <View>
-        <NewMessageForm />
+        <NewMessageForm onSend={this.handleSend} />
       </View>
     );
   }
```

Rerun the end-to-end tests. We no longer get the `onSend` error--now we're back to the same assertion failure, because we're still not displaying the message. But we're a step closer!

Next, we need to save the message in state in the App component. Let's add it to an array:

```diff
 export default class App extends Component {
+  state = { messages: [] };
+
   handleSend = (newMessage) => {
+    this.setState(state => ({ messages: [newMessage, ...state.messages] }));
   }
```

Next, to display the messages, let's create another custom component to keep our App component nice and simple. We'll call it MessageList. We'll write the code we wish we had in `App.js`:

```diff
 import NewMessageForm from './NewMessageForm';
+import MessageList from './MessageList';

...
   render() {
+    const { messages } = this.state;
     return (
       <View>
         <NewMessageForm onSend={this.handleSend} />
+        <MessageList data={messages} />
       </View>
     );
   }
```

Next, we'll create `MessageList.js` and add an empty implementation. Since this component won't have any state, it can be a functional component instead of a class component:

```jsx
import React from 'react';
import {
  View,
} from 'react-native';

const MessageList = ({ data }) => (
  <View />
);

export default MessageList;
```

Rerun the tests, and, as we expect, we still aren't displaying the message. But now that we have a MessageList component, we're ready to finally implement that and make the test pass:

```diff
 import React from 'react';
 import {
-  View,
+  FlatList,
+  Text,
 } from 'react-native';

 const MessageList = ({ data }) => (
-  <View />
+  <FlatList
+    data={data}
+    keyExtractor={item => item}
+    renderItem={({ item }) => <Message text={item} />}
+  />
 );

+const Message = ({ text }) => <Text>{text}</Text>;
+
 export default MessageList;
```

Rerun the tests and they pass. We've let the tests drive our first feature!

Let's take a look in the simulator. Run the app by opening the browser tab that is running Expo, and clicking "Run on iOS Simulator". Well, it works, but it's not the prettiest thing in the world. But now we can add styling.

# Why TDD?

What have we gained by using Test-Driven Development?

- **Confidence it works.** Unit or component tests are great to specify the functionality of functions or classes, but the app can still crash or do the wrong thing when they’re connected together. An end-to-end test confirms that all the pieces connect in the right way.
- **100% test coverage.** By only writing the minimal code necessary to pass each error, this ensures we don’t have any code that *isn’t* covered by a test. This avoids the situation where a change we make breaks untested code.
- **Minimal code.** We’ve built the minimal features that pass our test. This has helped us avoid to speculate on features the code *might* need in the future, that increase our maintenance cost without adding any benefit.
- **Ability to refactor.** Because we have 100% test coverage, we can make changes to our code to improve its design to handle future requirements. Our code doesn't develop cruft that makes it complex to work within.
- **Ability to ship quickly.** We aren't spending time building code our users don't need. When some old code is slowing us down, we can refactor it to make it quicker to work with. And our tests reduce the amount of manual testing we need to do before a release.

One of React Native's biggest offerings is a quicker development cycle, between instant reload in the simulator and over-the-air app updates. But if your code is hard to understand and breaks easily, you won't be able to get the benefit of this speed. This is why TDD with end-to-end tests is a great fit for React Native: it allows you to realize the promise of faster development.

## More Resources

To learn more about TDD, I recommend:

* ["Test-Driven Development in React Native"](https://www.youtube.com/playlist?list=PLXXnezSEtvNPZroRdvjhEVzOhURl572Lf) - a free eight-video series of live stream recordings
* ["Testing & React Native: Lessons from the Battlefield"](https://www.youtube.com/watch?v=cUSUJXAvt6k&feature=share) meetup talk (video)
{% include tutorial-goos.md %}

{% include tutorial-contact.md %}

[controlled-component]: https://facebook.github.io/react-native/docs/handling-text-input.html
[detox]: https://github.com/wix/detox/blob/master/docs/README.md#detox-documentation
[detox-getting-started]: https://github.com/wix/detox/blob/master/docs/Introduction.GettingStarted.md
[expo]: https://expo.io
[jest]: https://jestjs.io/
[react-native]: https://facebook.github.io/react-native/docs/getting-started.html
[react-native-testing-library]: https://github.com/callstack/react-native-testing-library
