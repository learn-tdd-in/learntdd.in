### Specify adding a message [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/15bcc4596c4ee2697b03d68de7d03716f767c234)

#### Acceptance Tests/CreatingAMessageTests.m

```diff
{% raw %}+#import <KIF/KIF.h>
+
+@interface CreatingAMessageTests : KIFTestCase
+
+@end
+
+@implementation CreatingAMessageTests
+
+- (void)setUp
+{
+    [KIFUITestActor setDefaultTimeout:2.0];
+}
+
+- (void)testItCanCreateAMessage
+{
+    NSString *testMessage = @"Hello, test!";
+    
+    [tester enterText:testMessage intoViewWithAccessibilityLabel:@"New Message Field"];
+    [tester tapViewWithAccessibilityLabel:@"Add Message"];
+    
+    UITableViewCell *cell = [tester waitForCellAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0]
+                        inTableViewWithAccessibilityIdentifier:@"Messages Table"];
+    
+    XCTAssertTrue([cell.textLabel.text isEqualToString:testMessage],
+                  @"Expected cell label to be '%@', was '%@'", testMessage, cell.textLabel.text);
+}
+
+@end{% endraw %}
```

To start out, we write an acceptance test for the entire feature we want to build. This test specifies that the user will enter a message into a field, tap an Add button, and then see that message in the first cell of a table.

The first error we get is that there is no message field:

Red: Failed to find accessibility element with the label "New Message Field"


### Add new message field [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/c45418a881370b448814bbd73f0cd149d6914a63)


![Message Field](message-field.png)

As part of adding the message field, we go ahead and set up the table view controller we'll be using. We set the accessibility label on the field to "New Message Field" so the acceptance test can find it.

The next error we get is similar: now we can't find the Add Message button:

Red: Failed to find accessibility element with the label "Add Message"


### Add Add Message button [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/207c49c7c333352a0bcea0137af80ce06021d0de)


![Add Button](add-button.png)

We simply set the accessibility label on the button to "Add Message" so the test can find it.

Next, the test can't find the table to look in:

Red: Could not find element with accessibilityIdentifier == "Messages Table"


### Set table accessibility identifier [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/037bc7792ab8b48f72270f670dd70d21c4086621)

#### Learn TDD in Cocoa Touch/MessagesViewController.swift

```diff
{% raw %}+import UIKit
+
+class MessagesViewController: UITableViewController {
+    
+    override func viewDidLoad() {
+        tableView.accessibilityIdentifier = "Messages Table"
+    }
+
+}{% endraw %}
```

Interface Builder doesn't provide a way to set the accessibility identifier on the table, so we need to set it in our code instead. We create a MessagesViewController class that subclasses UITableViewController, then we set the table's accessibility identifier in the `viewDidLoad` method.

Next, the acceptance test can find the table, but it expects there to be a row added to the table, and there isn't one:

Red: Row 0 is not found in section 0 of table view


### Display contents of message store in table view [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/483db89e6aff11bff1285bfaa42aa0321591726c)

#### Learn TDD in Cocoa Touch/MessagesViewController.swift

```diff
{% raw %} 
 class MessagesViewController: UITableViewController {
     
+    var store: MessageStore!
+    
     override func viewDidLoad() {
         tableView.accessibilityIdentifier = "Messages Table"
+        store = MessageStore()
     }
 
+    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
+        return store.count
+    }
+    
+    
+    @IBAction func addMessage(sender: AnyObject) {
+        store.create()
+        tableView.reloadData()
+    }
+    
 }{% endraw %}
```

We create a `MessageStore` to hold the messages that we want to display in the table. We set the Add button to call a `create()` method on the MessageStore, and we set the table to check the `MessageStore`'s `count` property when determining the number of rows to display. Because the acceptance error we're trying to correct is the missing row, that's all the `MessageStore` functionality that we need at this point.

Red: Use of undeclared identifier ‘MessageStore’

We get an error that the `MessageStore` we've referred to doesn't exist.


### Add message store class [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/d98093cbb7b0174daf6917522a66077c674dfd10)

#### Learn TDD in Cocoa Touch/MessageStore.swift

```diff
{% raw %}+class MessageStore {
+
+}{% endraw %}
```

To make sure we don't implement more than the tests are driving us to, we do the minimum necessary to get past the current "undeclared identifier": we declare a `MessageStore` class. After this, we get several errors preventing the code from compiling. Let's take them one at a time:

First Red: Value of type ‘MessageStore’ has no member ‘count’


### Add count property [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/e599028baae4c884fff23ac5e2e9157348c41a7f)

#### Learn TDD in Cocoa Touch/MessageStore.swift

```diff
{% raw %} class MessageStore {
 
+    var count: Int {
+        get {
+            return 0
+        }
+    }
+
 }{% endraw %}
```

We declare a `count` property to fix the error that one is missing. Because we know its value will ultimately be dynamically determined from the number of posts in the store, we make it a calculated property. But for now, we just return a hard-coded zero value to get the code to compile.

First Red: Value of type `PostStore` has no member `create`

With that, the compiler is satisfied with our `count` property, and the next error is that `PostStore` also needs a `create()` method.


### Add create function [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/cf0f496ca3d31e1be9de20577a9a60ff14400372)

#### Learn TDD in Cocoa Touch/MessageStore.swift

```diff
{% raw %}         }
     }
 
+    func create() {
+        
+    }
+    
 }{% endraw %}
```

We add a `create()` function that the compiler is asking for. With this, the compiler is happy with our `create()` function, because it doesn't take any parameters or return a value.

With this, we're past the compilation errors, and back to a failing acceptance test assertion:

Red: Row 0 is not found in section 0 of table view

This is the same failed assertion we saw before. We've made the number of rows in the table driven off of the `MessageStore`, but because the `MessageStore` always returns a count of 0, the row we need never appears. We need the `MessageStore`'s `count` to return 1 after `create()` is called.


### Specify count should be 1 after creating [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/f0bae2fca39ec2ea82aecac490e4c67eeadc5e34)

#### Unit Tests/MessageStoreTests.swift

```diff
{% raw %}+import XCTest
+@testable import Learn_TDD_in_Cocoa_Touch
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
+    override func tearDown() {
+        super.tearDown()
+    }
+    
+    func testItReturnsACountOfOneAfterCreating() {
+        store.create()
+        
+        let count = store.count
+        
+        XCTAssertEqual(count, 1, "Expected store.count() to be 1 but was \(count)")
+    }
+}{% endraw %}
```

This is a behavioral need, so instead of implementing the code to fix this directly, we step down from the acceptance test level and write a unit test for the `MessageStore`. Our goal is to reproduce the acceptance test failure at the unit level, so that we know exactly what this unit needs to do to accomplish our overall goal.

Red: Expected store.count() to be 1 but was 0

This failed assertion is exactly the same problem we see at the acceptance level, so now we're ready to implement this behavior.


### Increase message count when `create()` is called [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/2b344d0c4441892b6ede2e5c75e96027fff50538)

#### Learn TDD in Cocoa Touch/Message.swift

```diff
{% raw %}+class Message {
+    
+}{% endraw %}
```


#### Learn TDD in Cocoa Touch/MessageStore.swift

```diff
{% raw %} class MessageStore {
 
+    private var messages = [Message]()
+
     var count: Int {
         get {
-            return 0
+            return messages.count
         }
     }
 
     func create() {
-        
+        let message = Message()
+        messages.append(message)
     }
     
 }{% endraw %}
```

To get the message count to increase when `create()` is called, we _could_ just add an Int property and increment it. However, taking such a small step doesn't add a lot of value. It's often more useful to "write the code we wish we had." In this case, we know the `MessageStore` is going to have a list of `Message` objects, so it seems safe to go ahead and have the `MessageStore` keep an array of `Message`s, add a new `Message` every time `create()` is called, and delegate the `MessageStore`'s `count` property to the array's `count`. The compiler requires us to go ahead and create a `Message` class, but we don't add anything else to it at this point: we wait until the tests drive us to add data and functionality to it.

This gets our unit test passing, and moves our acceptance test past its current error to a new one.

Inner green
Outer red: UITableView…failed to obtain a cell from its dataSource

The table view is trying to create a cell, which means we succeeded in increasing the row count when the user clicks "Add." But now the table view needs to know how to create a cell.


### Set up cell for table view [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/fdc13c8b288d2b33ab54fad60cc171478edf1506)

#### Learn TDD in Cocoa Touch/MessagesViewController.swift

```diff
{% raw %}         return store.count
     }
     
+    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
+        let cell = tableView.dequeueReusableCellWithIdentifier("Cell", forIndexPath: indexPath)
+        return cell
+    }
     
     @IBAction func addMessage(sender: AnyObject) {
         store.create(){% endraw %}
```

We do the minimum necessary to get past the current acceptance test error: we implement `tableView(_:cellForRowAtIndexPath:)` to dequeue a cell with the identifier "Cell" (we only need one kind of cell), and we mark the prototype cell in our storyboard with that identifier.

Red: Expected cell label to be 'Hello, test!', was '(null)'

Now the cell is retrieved, but our assertion about the content of the cell's label is failing. Because we didn't customize the cell at all, it doesn't have a label by default.


### Pass text along into message [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/086f4b14464b33ba23fe3d6fad61a89a3c13d53e)

#### Learn TDD in Cocoa Touch/MessagesViewController.swift

```diff
{% raw %}     
     var store: MessageStore!
     
+    @IBOutlet var messageField: UITextField!
+    
     override func viewDidLoad() {
         tableView.accessibilityIdentifier = "Messages Table"
         store = MessageStore()
...
     
     override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
         let cell = tableView.dequeueReusableCellWithIdentifier("Cell", forIndexPath: indexPath)
+        let message = store.find(indexPath.row)
+        
+        cell.textLabel?.text = message.text
+        
         return cell
     }
     
     @IBAction func addMessage(sender: AnyObject) {
-        store.create()
-        tableView.reloadData()
+        if let text = messageField.text {
+            store.create(["text": text])
+            tableView.reloadData()
+        }
     }
     
 }{% endraw %}
```

To get the right text to show up in the cell, when a message is saved we need to retrieve the text from the text field, and pass it into the `MessageStore`'s `create()` method. Then, when we're displaying the cell, we need to retrieve a `Message` from the `MessageStore` and use its `text` value for the cell's label.

To accomplish this, we add a dictionary parameter to `create()`, and we add a `find()` method to retrieve a `Message`.

First Red: Value of type `MessageStore` has no member `find`

The first compilation error we get is that there is no `find()` method on `MessageStore`.


### Add find method [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/03a55b174150a503e752e47368d1197ceec18e38)

#### Learn TDD in Cocoa Touch/MessageStore.swift

```diff
{% raw %}         messages.append(message)
     }
     
+    func find(index: Int) -> Message {
+        return Message()
+    }
+    
 }{% endraw %}
```

Rather than dropping down to the unit level yet, we fix the compilation error right away, because until our code compiles we can't get any other feedback from tests. We simply add a `find()` method that takes an `Int` parameter and returns a `Message`. To do the minimum necessary to satisfy the compiler, we just instantiate and return a new empty `Message`.

Red: Value of type `Message` has no member `text`

Now our `Message` is being returned to the view controller, but when it tries to access the `text` property, there isn't one.


### Add text property to message [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/519378e22670895ea40cebe4cee807303b6be3b4)

#### Learn TDD in Cocoa Touch/Message.swift

```diff
{% raw %} class Message {
     
+    var text: String?
+    
 }{% endraw %}
```

We add a simple `text` property to `Message` that will store our message string. This gets us to our next unrelated compilation error:

Red: Argument passed to a call that takes no arguments

Previously `create()` didn't have any arguments because all it needed to do was result in an incremented `count`. Now that our view controller is passing a dictionary into it with the message string, we need to update our other code to match.


### Add message data param [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/f2b709355a81d873e2265e754ba46d31feff1b5e)

#### Learn TDD in Cocoa Touch/MessageStore.swift

```diff
{% raw %}         }
     }
 
-    func create() {
+  func create(messageData: [String:String]) {
         let message = Message()
         messages.append(message)
     }{% endraw %}
```


#### Unit Tests/MessageStoreTests.swift

```diff
{% raw %}     }
     
     func testItReturnsACountOfOneAfterCreating() {
-        store.create()
+        store.create([:])
         
         let count = store.count
         {% endraw %}
```

We add a dictionary argument to the `create()` method, as well as updating all references to it (in this case, just one in the `MessageStoreTests`). This gets us past our last compilation error, and now we get an acceptance test failure:

Red: Expected cell label to be 'Hello, test!', was '(null)'

Like last time, this is the same acceptance test failure we were getting previously. We've added the parameters and properties to pass the message along from the text field into the cell label, but we haven't actually persisted it: in our `find()` method, we just return an empty `Message`.


### Add store unit test for find [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/a7b1fe55edd6e0ecdb2ab0d706a6c7e55a1a5bda)

#### Unit Tests/MessageStoreTests.swift

```diff
{% raw %}         
         XCTAssertEqual(count, 1, "Expected store.count() to be 1 but was \(count)")
     }
+    
+    func testItAllowsRetrievingAPostByRow() {
+        let testMessage = "test message"
+        store.create(["text": testMessage])
+        
+        let message = store.find(0)
+        XCTAssertEqual(message.text, testMessage)
+    }
 }{% endraw %}
```

We add a `MessageStore` unit test showing the behavior we need: when `create()` is called with a certain text key, the message we later `find()` should have that same message.

Red: (“nil”) is not equal to (“Optional(“test message”)”)

With this unit test failure, we've reproduced the problem we're seeing at the acceptance test level.


### Save and retrieve message with data [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/cocoa-touch/commit/5447ebf4e0e31cdfe231f3d3eba4423d26fee3fe)

#### Learn TDD in Cocoa Touch/MessageStore.swift

```diff
{% raw %} 
   func create(messageData: [String:String]) {
         let message = Message()
+        message.text = messageData["text"]
         messages.append(message)
     }
     
     func find(index: Int) -> Message {
-        return Message()
+        return messages[index]
     }
     
 }{% endraw %}
```

We check for the "text" key in the dictionary passed into `create()` and save it on the `Message` that's created. Now we actually need to retrieve that same `Message` in the `find()` method, and we do so. This causes the unit test to pass, and our acceptance test is passing as well!

Inner green
Outer green

We've successfully used Test-Driven Development to drive out our feature.
