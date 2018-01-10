### Specify adding a message [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/162ba03c0aa13b543e8c3a46a08a8d7062ab9c85)

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


### Remove default view controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/a790831d24827bdc6139826efb6b86c88e7bd658)

#### LearnTDDInCocoaTouch/ViewController.swift

```diff
{% raw %}-//
-//  ViewController.swift
-//  LearnTDDInCocoaTouch
-//
-//  Created by Josh Justice on 1/1/18.
-//  Copyright © 2018 Learn TDD. All rights reserved.
-//
-
-import UIKit
-
-class ViewController: UIViewController {
-
-    override func viewDidLoad() {
-        super.viewDidLoad()
-        // Do any additional setup after loading the view, typically from a nib.
-    }
-
-    override func didReceiveMemoryWarning() {
-        super.didReceiveMemoryWarning()
-        // Dispose of any resources that can be recreated.
-    }
-
-
-}
-{% endraw %}
```



### Add table view controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/7edd84929fa47bbba59e8b63226604c2408caa60)

#### LearnTDDInCocoaTouch/MessagesViewController.swift

```diff
{% raw %}+import UIKit
+
+class MessagesViewController: UITableViewController {
+
+}{% endraw %}
```



### Add new message field [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/958dc1810bc37afd1e708bcdbb73c7b9bbcec7e8)


As part of adding the message field, we go ahead and set up the table view controller we’ll be using. We set the accessibility label on the field to “New Message Field” so the acceptance test can find it.

The next error we get is similar: now we can’t find the Save button:

Red: NoMatchingElementException. accessibilityID('saveButton')


### Place Save button [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/c7e96ff1034ef1ca545d6214c4a216a3b5415193)


We put a Save button into the view so the test can find it.

Next, the test sees that the new message field isn't correctly cleared out when the Save button is tapped:

Red: AssertionFailedException. Element Matcher: accessibilityID('messageTextField'), Assertion Criteria: hasText('')


### Clear text field upon save [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/b17820f30c4e4f48698f74a62a919f2c41382f20)

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


### Drive table view out of messages store [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/3d5ba6e57f509d36d6731b9186802fb97b7f6d62)

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


### Add message store [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/03f7990bed1afed9c5f7d9836c38f405b3508a0b)

#### LearnTDDInCocoaTouch/MessageStore.swift

```diff
{% raw %}+import Foundation
+
+class MessageStore {
+
+}{% endraw %}
```

Let's only write enough code to fix that compiler error. First, we create a MessageStore type.

Red: Value of type 'MessageStore' has no member 'create'


### Add count property [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/488726ac9322b2db148c94a7d62e81b50e6dba83)

#### LearnTDDInCocoaTouch/MessageStore.swift

```diff
{% raw %} 
 class MessageStore {
 
+    var count = 0
+    
 }{% endraw %}
```

Right now we just want to add the minimal code to get the app to compile. We don't want to add any behavior to the class yet; we'll wait until we have a unit test for it to do that. The simplest way to get a count property to compile is to just add a simple stored property. An initial value of zero seems reasonable.

Red: Value of type 'MessageStore' has no member 'get'


### Add create method [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/b3002bfb6e27899c02bc23bb02580dc48adbd28f)

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


### Add get method to store [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/fb0dc996e3d77cdf31da9c2e9b2c05aaf57e85ca)

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


### Specify count should increase [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/2fc45af945fe6c0f002e6959bc40a584571bffc8)

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


### Increase count upon create [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/252dc712641d497c27b95e746c5d0230e9c7a032)

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


### specify returning the same message [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/3aed0b6b3ba74bfa88d7b95e06f3e67bf550f0c2)

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


### Retrieve same message added [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/bf041ea1b0a746c79f3b2022b9994c709e32a1e0)

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

With that, both our unit test and feature test are passing. We've finished test-driving our feature!

