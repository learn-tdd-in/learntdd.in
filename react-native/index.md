---
layout: tutorial
title: Learn TDD in React Native
logo: /images/react.svg
logo_alt: React Native logo
---

{% include tutorial-intro.md %}

To see how TDD works in React Native, let's walk through a simple real-world example of building a feature. We'll be using React Native 0.55 and [Detox][detox], an end-to-end test library targeted at React Native. You can also follow along in the [Git repo](https://github.com/learn-tdd-in/react-native) that shows the process step-by-step. This tutorial assumes you have some [familiarity with React Native][react-native] and with [automated testing concepts](/learn-tdd/concepts).

The feature we'll build is a simple list of messages.

## Setup

First, make sure you have React Native installed and running. Instead of `create-react-native-app`, we'll be using `react-native-cli`. If you haven't installed it before, go to the [React Native Getting Started][react-native] page and click "Building Projects with Native Code".

Next, let's install the global Detox CLI tool:

```
# brew tap wix/brew
# brew install --HEAD applesimutils
# npm install -g detox-cli
```

Now we create a new React Native app with `react-native-cli`:

```
# react-native init ReactNativeTDD
```

Let's run it to confirm it works:

```
# cd ReactNativeTDD
# react-native run-ios
```

After a few minutes you should see the welcome screen of the app in the iOS Simulator.

Next, we need to add Detox as a dependency to our project. We'll also install [Mocha][mocha], the recommended test runner for Detox:

```
# npm install detox mocha --save-dev
```

After this, we need to add some config for Detox to our `package.json`. If you have a different app name than `ReactNativeTDD`, be sure to substitute the correct app name below:

```json
{
  ...
  "detox": {
    "configurations": {
      "ios.sim.debug": {
        "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/ReactNativeTDD.app",
        "build": "xcodebuild -project ios/ReactNativeTDD.xcodeproj -scheme ReactNativeTDD -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
        "type": "ios.simulator",
        "name": "iPhone 8"
      }
    }
  }
}
```

Next, initialize Detox in your app to get some config files set up:

```
# detox init
```

Now, let's run it and see that the initial test fails:

```
# detox build
# detox test
```

If you run into trouble, check the [Detox Getting Started Guide][detox-getting-started] for help.

As our last setup step, let's clear out some of the default code to get a clean starting point. Delete `e2e/example.spec.js`, and replace the contents of `App.js` with an empty `View`:

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

When performing TDD, our first step is to **create an end-to-end test describing the feature we want users to be able to do.** For our simple messaging app, the first feature we want is to be able to enter a message, save it, and see it in the list.

Create a file `e2e/creatingAMessage.spec.js` and enter the following contents:

```js
describe('Creating a message', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should add the message to the list', async () => {
    await element(by.id('messageText')).typeText('New message');
    await element(by.id('saveButton')).tap();

    await expect(element(by.id('messageText'))).toHaveText('');
    await expect(element(by.label('New message'))).toBeVisible();
  });
});
```

The code describes the steps a user would take interacting with our app:

- Entering the text "New message" into a message text field
- Tapping a save button
- Confirming that the message text field is cleared out
- Confirming that the "New message" we entered appears somewhere on screen

After we've created our test, the next step in TDD is to **run the test and watch it fail.**  This test will fail (be "red") at first because we haven't yet implemented the functionality.

Run `detox test` and you should see the following error:

```
  Creating a message
    1) should add the message to the list


  0 passing (8s)
  1 failing

  1) Creating a message
       should add the message to the list:
     Error: Error: Cannot find UI element.
Exception with Action: {
  "Action Name" : "Type 'New message'",
  "Element Matcher" : "(((respondsToSelector(accessibilityIdentifier) && accessibilityID('messageText')) && !(kindOfClass('RCTScrollView'))) || (kindOfClass('UIScrollView') && ((kindOfClass('UIView') || respondsToSelector(accessibilityContainer)) && ancestorThatMatches(((respondsToSelector(accessibilityIdentifier) && accessibilityID('messageText')) && kindOfClass('RCTScrollView'))))))",
  "Recovery Suggestion" : "Check if the element exists in the UI hierarchy printed below. If it exists, adjust the matcher so that it accurately matches element."
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

Rerun the tests. The error has changed! The tests are now able to find the "messageText" element. The new error is:

```
     Error: Error: Cannot find UI element.
Exception with Action: {
  "Action Name" : "Tap",
  "Element Matcher" : "(((respondsToSelector(accessibilityIdentifier) && accessibilityID('saveButton')) && !(kindOfClass('RCTScrollView'))) || (kindOfClass('UIScrollView') && ((kindOfClass('UIView') || respondsToSelector(accessibilityContainer)) && ancestorThatMatches(((respondsToSelector(accessibilityIdentifier) && accessibilityID('saveButton')) && kindOfClass('RCTScrollView'))))))",
  "Recovery Suggestion" : "Check if the element exists in the UI hierarchy printed below. If it exists, adjust the matcher so that it accurately matches element."
}
```

Now there's a different element we can't find: the element with `accessibilityID('saveButton')`.

We want the save button to be part of our `NewMessageForm`, so fixing this error is easy. We just add a Button to our component:

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
+          title="Save"
+          testID="saveButton"
+        />
       </View>
     );
   }
```

## Implementing Component Behavior

Rerun the tests. Now we get a new kind of test failure:

```
     Error: Error: An assertion failed.
Exception with Assertion: {
  "Assertion Criteria" : "assertWithMatcher:(((kindOfClass('UILabel') || kindOfClass('UITextField') || kindOfClass('UITextView')) && hasText('')) || (kindOfClass('RCTText') && an object with accessibilityLabel ""))",
  "Element Matcher" : "(((respondsToSelector(accessibilityIdentifier) && accessibilityID('messageText')) && !(kindOfClass('RCTScrollView'))) || (kindOfClass('UIScrollView') && ((kindOfClass('UIView') || respondsToSelector(accessibilityContainer)) && ancestorThatMatches(((respondsToSelector(accessibilityIdentifier) && accessibilityID('messageText')) && kindOfClass('RCTScrollView'))))))"
}
```

The important parts are:

- `"Assertion Criteria" : "…hasText('')…"` - The element should not have any text in it.
- `"Element Matcher" : "…accessibilityID('messageText')…"` - The element that should be empty is the message text box.

We've made it to our first assertion, which is that the message text box should be empty -- but it isn't. We haven't yet added the behavior to our app to clear out the message text box.

This is the point where in TDD we would usually consider stepping down to a lower-level test, like a component test. Testing the NewMessageForm directly would allow us to specify this behavior precisely. This works great in React for the web using the Enzyme component testing framework. It's more difficult for React Native, because RN components are implemented in native code. A library called `react-native-mock` addresses this, but unfortunately it [doesn't currently work][react-native-mock-bug] with React 16. So instead of stepping down to a component test, we'll just continue to let the end-to-end test drive our functionality.

As before, we might run into the temptation to implement all the functionality of NewMessageForm, but let's just implement enough to get the test to pass. We want tapping the Save button to clear out the text input. To accomplish this, we'll need to make the TextInput a [controlled component][controlled-component], so its text is available in the parent component's state:

```diff
 export default class NewMessageForm extends Component {
+  state = { inputText: '' }
+
+  handleChangeText(text) {
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
+          onChangeText={text => this.handleChangeText(text)}
         />
```

Next, we want to clear out `inputText` when the Save button is tapped:

```diff
 export default class NewMessageForm extends Component {
   state = { inputText: '' }

   handleChangeText = (text) => {
     this.setState({ inputText: text });
   }

+  handleSave() {
+    this.setState({ inputText: '' });
+  }
+
   render() {
...
         <Button
           title="Save"
           testID="saveButton"
+          onPress={() => this.handleSave()}
         />
```

Rerun the test. This gets us past the assertion failure.

## The Meat

Now our final assertion fails: it can't find a UI element that `hasText('New message')`. Now, finally, the test will drive us to implement the real meat of our feature: storing the message entered and displaying it.

The NewMessageForm won't be responsible for displaying this message, though: we'll create a separate MessageList component that also exists in the parent App component.

The way we can send data to the parent component is by taking in an event handler and calling it. Add the following to `NewMessageForm.js`:

```diff
   handleSave() {
+    const { inputText } = this.state;
+    const { onSave } = this.props;
+
+    onSave(inputText);
+
     this.setState({ inputText: '' });
   }
```

Before overwriting the `inputText` state with an empty string, it retrieves an `onSave` function passed in as a prop, and passes the previous value of `inputText` to it.

Rerun the tests. We get the same assertion failure, but if you look in the simulator, you'll see that we actually get a runtime error!

```
onSave is not a function. (In 'onSave(inputText)', 'onSave' is undefined
```

Our NewMessageForm is calling `onSave`, but we haven't yet passed a valid function into our component in our production code. Let's do so now. Again, we don't want to fully implement that event handler, only add only enough code to get past the current error. Add the following to `App.js`:

```diff
 export default class App extends Component {
+  handleSave(newMessage) {
+  }
+
   render() {
     return (
       <View>
-        <NewMessageForm />
+        <NewMessageForm onSave={newMessage => this.handleSave(newMessage)} />
       </View>
     );
   }
```

Rerun the tests. We no longer get the `onSave` error--now we're back to the same assertion failure, because we're still not displaying the message. But we're a step closer!

Next, we need to save the message in state in the App component. Let's add it to an array:

```diff
 export default class App extends Component {
+  state = { messages: [] };
+
   handleSave(newMessage) {
+    const { messages } = this.state;
+    this.setState({ messages: [newMessage, ...messages] });
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
         <NewMessageForm onSave={this.handleSave} />
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

Let's take a look in the simulator. Run the app with `react-native run-ios`. Well, it works, but it's not the prettiest thing in the world. But now we can add styling.

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

* ["Testing & React Native: Lessons from the Battlefield"](https://www.youtube.com/watch?v=cUSUJXAvt6k&feature=share) meetup talk (video)
{% include tutorial-goos.md %}

{% include tutorial-contact.md %}

[controlled-component]: https://facebook.github.io/react-native/docs/handling-text-input.html
[detox]: https://github.com/wix/detox/blob/master/docs/README.md#detox-documentation
[detox-getting-started]: https://github.com/wix/detox/blob/master/docs/Introduction.GettingStarted.md
[mocha]: https://mochajs.org/
[react-native]: https://facebook.github.io/react-native/docs/getting-started.html
[react-native-mock-bug]: https://github.com/RealOrangeOne/react-native-mock/issues/129
