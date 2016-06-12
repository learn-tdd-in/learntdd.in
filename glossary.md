---
layout: page
title: Glossary
---

* **Acceptance Test**: a test that confirms that the system correctly implements a user-visible feature. Often accomplished with end-to-end testing.
* **Assertion**: a check within a test that ensure a given condition is true, and report an error message if not.
* **Behavior**: the messages sent by an object-oriented program. Behavior verification involves checking what messages were sent by a program, not the results of those messages in terms of data stored.
* **Behavior-Driven Development (BDD)**: an approach to software development that involves working with the user to specify the behavior of a system and build it in terms of those specifications. BDD is closely related to Mockist TDD, but whereas Mockist TDD usually begins with features already defined, BDD includes the process of coming up with the features list.
* **Characterization Test**: tests written against a pre-existing system to document its current behavior, bugs and all
* **Classical TDD**: the original form of TDD proposed by Kent Beck. It focused on middle-out testing, unit tests against real collaborators, stubbing, verifying state, and "test case" and "assertion" terminology.
* **Collaborate**: for an object to work with another object to accomplish its goals.
* **Dependency**: knowledge that an object has about another object. An object must have some dependencies on its collaborators, but it's possible for an object to have more dependencies on another object that necessary.
* **Dummy**: a test double that is not actually used for anything other than to fill in an argument list.
* **End-to-End Test**: a test that accesses the entire system from the outside, e.g. through the user interface or HTTP requests. Often used to accomplish acceptance testing.
* **Example**: the "spec"-style equivalent of a test case. An example writes out something a piece of code should do, and can be run to determine whether the system actually does it.
* **Expectation**: the "spec"-style testing equivalent of an assertion. Indicates that a certain condition is expected to be true. When the spec is run, if the condition is not true, an error will be shown.
* **Exploratory Test**: a test written directly against third-party code to verify one's understanding of how it should be used.
* **Fake**: a test double that has real behavior implemented in a simple way. For example, a fake equivalent of a database connection might store data in-memory.
* **Functional Test**: a test of a controller in an MVC application.
* **Integration Test**: multiple usages:
	* A test that exercises more than one production class; the opposite of an isolation test.
	* A test that checks that the application's code works correctly with third-party code.
* **Isolation Test**: a test that exercises only one production class. Any dependencies of that class are replaced by test doubles.
* **Middle-Out Testing**: an approach to testing that begins with domain objects and works from there out to user-facing code.
* **Mock**: a test double that allows specifying in advance the messages it must receive, which are then verified at the end of a test case. Mocks and spies are the primary methods of behavior verification.
* **Mockist TDD**: a refinement of classical TDD proposed by the London TDD community. Mockist TDD focuses on mock objects, behavior verification, outside-in testing, and isolation testing.
* **Outside-in Testing**: an approach to testing that begins with the outside of the system, i.e. with end-to-end tests, and then writes isolation tests as needed to specify classes needed to satisfy the end-to-end test.
* **Red-Green-Refactor**: a cycle of steps followed in TDD. First, a failing test is written and run to confirm that it fails ("red"). Then, production code is written to make the test pass ("green"). Finally, as necessary, the test and production code are refactored to improve their design, while the test is repeatedly run to make sure it is still green.
* **Refactor**: improving the design of a piece of code through small transformations without changing its behavior.
* **Regression**: the reintroduction of an error in code that was previously working correctly. One of the main goals of testing is to catch regressions.
* **Request Test**: a test of a request sent into a system, such as an HTTP request to a server-rendered web application or a web service.
* **Specification (Spec)**: a test, considered primarily as a way to indicate the desired behavior of a system, rather than to confirm the behavior of an existing system. Used in Mockist TDD.
* **Spy**: a test double that records messages it receives, which can then be tested against at the end of a test case. Spies and mocks are the primary methods of behavior verification.
* **State**: the data constructs in a program. State verification involves checking the results of operations in terms of data, not checking that the operations themselves happened.
* **Stub**: a test double with hard-coded method responses.
* **Subject**: the object being tested in a given context.
* **Test Case**: the smallest unit of a test suite that can be run on its own.
* **Test Double**: an object that stands in for a production object during testing. Includes dummies, fakes, mocks, spies, and stubs.
* **Test Suite**: a collection of test cases.
* **Unit Test**: multiple usages:
	* A test that exercises only one production class; equivalent to "isolation test." This is the definition used in Mockist TDD.
	* A test of a class and all its real collaborators. Called a "unit" test because it can be run in isolation without affecting or being affected by any other tests. This is he definition used in Classical TDD.

---

##  References

* [*Growing Object-Oriented Software, Guided by Tests*](http://www.informit.com/store/growing-object-oriented-software-guided-by-tests-9780321503626)
* ["Introducing BDD"](https://dannorth.net/introducing-bdd/), DanNorth.net
* ["Mocks Aren't Stubs"](http://martinfowler.com/articles/mocksArentStubs.html), MartinFowler.com
* [*Practical Object-Oriented Design in Ruby*](http://www.poodr.com/)
* ["Test Doubles"](http://www.martinfowler.com/bliki/TestDouble.html), MartinFowler.com
* [*Test-Driven Development by Example*](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)