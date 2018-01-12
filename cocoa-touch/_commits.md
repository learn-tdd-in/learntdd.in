### Specify adding a message [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/2e43dd97dd12fd132a45a572538822cace543282)

#### LearnTDDInCocoaTouchTests/E2E/CreatingAMessageTest.swift

```diff
{% raw %}+import XCTest
+import EarlGrey
+
+class CreatingAMessageTest: XCTestCase {
+    
+    func testCreatingAMessage() {
+        EarlGrey.select(elementWithMatcher: grey_accessibilityID("messageTextField"))
+            .perform(grey_typeText("New message"))
+        EarlGrey.select(elementWithMatcher: grey_accessibilityID("saveButton"))
+            .perform(grey_tap())
+        
+        EarlGrey.select(elementWithMatcher: grey_accessibilityID("messageTextField"))
+            .assert(with: grey_text(""))
+        EarlGrey.select(elementWithMatcher: grey_accessibilityLabel("New message"))
+            .assert(with: grey_sufficientlyVisible())
+    }
+    
+}{% endraw %}
```

To start out, we write an acceptance test for the entire feature we want to build. This test specifies that the user will enter a message into a field, tap an Add button, and then see that message in the first cell of a table.

The first error we get is that there is no message field:

Red: NoMatchingElementException. ...accessibilityID('messageTextField')


### Add new message field [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/318ffc31eeaa8530efef746fdac806dcc8d23a42)

#### LearnTDDInCocoaTouch/MessagesViewController.swift

```diff
{% raw %}+import UIKit
+
+class MessagesViewController: UITableViewController {
+
+}{% endraw %}
```

As part of adding the message field, we go ahead and set up the table view controller we’ll be using. We set the accessibility identifier on the field to "messageTextField" so the acceptance test can find it.

![message text field](messageTextField.png)

The next error we get is similar: now we can’t find the Save button:

Red: NoMatchingElementException. accessibilityID('saveButton')


### Add save button [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/3414a1146d39570b00a26a8f73e9feca09012280)


We put a Save button into the view and give it an accessibility identifier of "saveButton" so the test can find it.

![save button](saveButton.png)

Next, the test sees that the new message field isn't correctly cleared out when the Save button is tapped:

Red: AssertionFailedException. Element Matcher: accessibilityID('messageTextField'), Assertion Criteria: hasText('')


### Clear text field upon save [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/9365e8cfd0e3f516288820a6bfda172f8dc2cf0d)

#### LearnTDDInCocoaTouch/MessagesViewController.swift

```diff
{% raw %} import UIKit
 
 class MessagesViewController: UITableViewController {
-
+    @IBOutlet var messageTextField: UITextField!
+    
+    @IBAction func save() {
+        messageTextField.text = ""
+    }
 }{% endraw %}
```

We hook up an action to the save button to clear out the text field when it's tapped.

Now our feature test makes it all the way to the final assertion. The test is looking for the new message to appear somewhere on screen, but it doesn't:

Red: NoMatchingElementException. accessibilityLabel('New message')


### Drive table view out of messages store [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/95a37d884e6d7f700445f546c93aa2a390e37d15)

#### LearnTDDInCocoaTouch/MessagesViewController.swift

```diff
{% raw %} import UIKit
 
 class MessagesViewController: UITableViewController {
+    private var store: MessageStore!
+    
     @IBOutlet var messageTextField: UITextField!
     
     @IBAction func save() {
+        guard let text = messageTextField.text else { return }
+        store.create(text)
         messageTextField.text = ""
+        tableView.reloadData()
+    }
+    
+    override func viewDidLoad() {
+        super.viewDidLoad()
+        
+        store = MessageStore()
+    }
+
+    override func numberOfSections(in tableView: UITableView) -> Int {
+        return 1
+    }
+
+    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
+        return store.count
+    }
+
+    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
+        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
+
+        let message = store.get(indexPath.row)
+        cell.textLabel?.text = message
+
+        return cell
     }
 }{% endraw %}
```

Rather than storing the messages in a simple array in the view controller, let's separate out responsibilities by creating a MessageStore class. First, let's write the code we wish we had in the view controller. We create a MessageStore, use it to provide the count and message for each table cell. When Save is tapped, we create a new message.

Because we haven't implemented this MessageStore, we get compiler errors. Let's take them one at a time:

Red: Use of undeclared type 'MessageStore'


### Add message store [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/2428a8189fd7548c2edac396f49854e8ce2f4d08)

#### LearnTDDInCocoaTouch/MessageStore.swift

```diff
{% raw %}+import Foundation
+
+class MessageStore {
+
+}{% endraw %}
```

Let's only write enough code to fix that compiler error. First, we create a MessageStore type.

Red: Value of type 'MessageStore' has no member 'count'


### Add count property [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/60c7935d231aac333ecca6f728e9997dc75bcda8)

#### LearnTDDInCocoaTouch/MessageStore.swift

```diff
{% raw %} 
 class MessageStore {
 
+    var count = 0
+    
 }{% endraw %}
```

Right now we just want to add the minimal code to get the app to compile. We don't want to add any behavior to the class yet; we'll wait until we have a unit test for it to do that. The simplest way to get a count property to compile is to just add a simple stored property. An initial value of zero seems reasonable.

Red: Value of type 'MessageStore' has no member 'create'


### Add create method [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/c0607d8e846d8cb5d306dbd58bf3a32692d9e819)

#### LearnTDDInCocoaTouch/MessageStore.swift

```diff
{% raw %} 
     var count = 0
     
+    func create(_ message: String) {
+        
+    }
+    
 }{% endraw %}
```

The create method has no return value, so it's easy to get it to compile: we just add a method with the correct signature and no body.

Red: Value of type 'MessageStore' has no member 'get'


### Add get method to store [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/37717c174c4c6826a30887a9e3202e41f65129e6)

#### LearnTDDInCocoaTouch/MessageStore.swift

```diff
{% raw %}         
     }
     
+    func get(_ index: Int) -> String {
+        return "fake message"
+    }
+    
 }{% endraw %}
```

We add a get() method. We just need it to return a String to compile. Rather than returning an empty string, we return an obviously-fake string. That way we can more easily tell what's going on if we get that string returned later when we don't expect it.

Now the MessageStore compiles, but our feature test is still failing with the same error: the message isn't appearing on screen. We need to actually get the MessageStore to _do_ something.

Red: NoMatchingElementException. accessibilityLabel('New message')


### Specify count should increase [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/b8fd525a574c0d4b90bf562811ce37e5b7287835)

#### LearnTDDInCocoaTouchTests/Unit/MessageStoreTests.swift

```diff
{% raw %}+import XCTest
+@testable import LearnTDDInCocoaTouch
+
+class MessageStoreTests: XCTestCase {
+    
+    var store: MessageStore!
+    
+    override func setUp() {
+        super.setUp()
+        store = MessageStore()
+    }
+    
+    func testCountShouldIncreaseWhenMessageCreated() {
+        store.create("Some message")
+        
+        let count = store.count
+        
+        XCTAssertEqual(count, 1, "Expected store.count to be 1 but was \(count)")
+    }
+    
+}{% endraw %}
```

The first problem we have is that the table view is never showing any rows. To get it to show a row, we need the count to increase when a message is added. We write a unit test for MessageStore to confirm this behavior. We add a custom error message to make our test failure easier to understand.

Inner Red: Expected store.count to be 1 but was 0


### Increase count upon create [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/4b71c8e91315d14b04f255aeb04696540bffb677)

#### LearnTDDInCocoaTouch/MessageStore.swift

```diff
{% raw %}     var count = 0
     
     func create(_ message: String) {
-        
+        count += 1
     }
     
     func get(_ index: Int) -> String {{% endraw %}
```

The unit test passes; the count is increased. We rerun our feature test and confirm that the message still isn't showing in that cell, though.

Outer Red:


### Specify returning the same message added [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/c491dee4cf8ddb5f8a18b773183a6facfef460d7)

#### LearnTDDInCocoaTouchTests/Unit/MessageStoreTests.swift

```diff
{% raw %}         XCTAssertEqual(count, 1, "Expected store.count to be 1 but was \(count)")
     }
     
+    func testGetShouldReturnMessageAdded() {
+        let createdText = "test message text"
+        
+        store.create(createdText)
+        
+        let retrievedText = store.get(0)
+        XCTAssertEqual(retrievedText, createdText)
+    }
+    
 }{% endraw %}
```

We add another unit test to confirm that the get() method returns the same message added via create().

Inner Red: ("fake message") is not equal to ("test message text")

Our unit test error confirms that we're currently returning a hard-coded message.


### Return the same message added [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/2186d5c05f394b79161a49e44981de6af66b1d3b)

#### LearnTDDInCocoaTouch/MessageStore.swift

```diff
{% raw %} 
 class MessageStore {
 
-    var count = 0
+    var messages: [String] = []
+    
+    var count: Int {
+        return messages.count
+    }
     
     func create(_ message: String) {
-        count += 1
+        messages.append(message)
     }
     
     func get(_ index: Int) -> String {
-        return "fake message"
+        return messages[index]
     }
     
 }{% endraw %}
```

We implement the behavior the unit test specifies: when create() is called we store the message in an array, and when get() is called we return the message at the appropriate index.

Inner Green

Outer Green

With that, both our unit test and feature test are passing. We've finished test-driving our feature! To make sure it works, run your app and see.

