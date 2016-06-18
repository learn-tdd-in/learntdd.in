---
layout: page
title: What is Test-Driven Development? | Learn TDD
---

Test-Driven Development (TDD) is an approach to automated software testing that involves writing a failing test before writing the production code to make it pass.

The order of steps is usually described is:

* Red: write just enough test to make it fail.
* Green: write just enough production code to make it pass.
* Refactor: look over your code to see if there's anything you can do to improve it.

## Why Use TDD?

Test-Driven Development has a number of benefits:

- **Focus**: TDD helps you stick to working on a single user-visible feature at a time. This helps you deliver features more quickly to get feedback, in contrast to a waterfall approach of working on one layer at a time. It also helps prevent Big Design Up-Front and building features You Aren't Gonna Need.
- **Design**: TDD helps guide you toward creating reusable components, because using them in a test *is* a form of reuse. Tests guide you to components with a clear propose (high cohesion) and well-defined dependencies (low coupling).
- **Adaptability**: when you have a suite of tests creates via TDD, you can be confident you aren't breaking existing features as you add new ones. You're also free to refactor your code to account for changing needs, preventing your code from getting bogged down in history.

## This Site's Approach

There are a few different schools TDD, and this site follows the London school. There are a few closely-related terms.

- **Isolation Testing**: referring to the fact that it tests each class in complete isolation from your other classes.
- **Mockist TDD**: referring to mocks, a type of test double used to isolate units.
- **Outside-in Testing**: referring to the fact that you first test the outside of your system the way a user interacts with it, then you test individual classes inside your system.
- **Behavior-Driven Development** (BDD): referring to the mindset being less about testing for correctness and more about specifying the behavior of the system. However, BDD includes a broader scope than the testing this site addresses, such as interacting with the client via user stories.

For more information on the different schools of TDD, see [Approaches to Testing: A Survey](http://codingitwrong.com/2016/02/08/approaches-to-testing-a-survey.html).

## Resources

* [The Wikipedia article](https://en.wikipedia.org/wiki/Test-driven_development) on TDD
* [*Test-Driven Development by Example*](http://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530), the original work on TDD, which corresponds to another school of TDD: the classicist school
* [*Growing Object-Oriented Software, Guided by Tests*](http://www.informit.com/store/growing-object-oriented-software-guided-by-tests-9780321503626), the authoritative work on mockist/outside-in testing
