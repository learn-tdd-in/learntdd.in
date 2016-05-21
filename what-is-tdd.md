---
layout: page
title: What is Test-Driven Development?
---

Test-Driven Development (TDD) is an approach to automated software testing that involves writing a failing test before writing the production code to make it pass.

The order of steps is usually described is:

* Red: write just enough test to make it fail.
* Green: write just enough production code to make it pass.
* Refactor: look over your code to see if there's anything you can do to improve it.

## This Site's Approach

There are a few different schools TDD, and this site follows the London school. There are a few closely-related terms.

- **Isolation Testing**: referring to the fact that it tests each class in complete isolation from your other classes.
- **Mockist TDD**: referring to mocks, a type of test double used to isolate units.
- **Outside-in Testing**: referring to the fact that you first test the outside of your system the way a user interacts with it, then you test individual classes inside your system.
- **Behavior-Driven Development** (BDD): referring to the mindset being less about testing for correctness and more about specifying the behavior of the system. However, BDD includes a broader scope than the testing this site addresses, such as interacting with the client via user stories.

## Resources

* [The Wikipedia article](https://en.wikipedia.org/wiki/Test-driven_development) on TDD
* [*Test-Driven Development by Example*](http://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530), the original work on TDD, which corresponds to another school of TDD: the classicist school
* [*Growing Object-Oriented Software, Guided by Tests*](http://www.informit.com/store/growing-object-oriented-software-guided-by-tests-9780321503626), the authoritative work on mockist/outside-in testing
