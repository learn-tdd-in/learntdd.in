---
title: Why Test-Driven Development?
---

Test-Driven Development (TDD) is an approach to automated software testing that involves writing a failing test before writing the production code to make it pass.

The order of steps is usually described is:

* **Red**: write just enough test to make it fail.
* **Green**: write just enough production code to make it pass.
* **Refactor**: look over your code to see if there's anything you can do to improve it while keeping the tests green.

## This Site's Approach

There are a few different schools of TDD, and this site follows the London school. There are a few terms closely related to the London school:

- **Behavior Specification**: referring to the mindset being less about testing for correctness and more about defining the behavior of the system.
- **Outside-In Testing**: referring to the fact that you first test the outside of your system the way a user interacts with it, then you let that test lead you to the individual classes inside your system you need to specify and build.
- **Isolation Testing**: referring to the fact that it tests each class in complete isolation from other classes.
- **Mockist TDD**: referring to mocks, a type of test double used to isolate units and provide visibility into the messages your application sends between its objects.

For more information on the different schools of TDD, see [Approaches to Testing: A Survey](http://codingitwrong.com/2016/02/08/approaches-to-testing-a-survey.html).

## Reasons to Try TDD

There are several reasons I would recommend outside-in TDD:

### 1. Outside-in TDD helps you get started testing.

When you've written some code and you need to decide how to test it, there are a lot of decisions to make. Do you want to do unit testing, integration testing, end-to-end testing, or a combination of them? If a combination, how many of each type do you want to do: do you want to follow the test pyramid, the test trophy, the test eagle?

Outside-in TDD answers these questions for you, but not by giving you a percentage of each type of test to write. Instead, it gives you a *process* to walk through, writing different tests at different times, as you have different needs. Because you don't have to focus on judgment calls about what types of test to write, you can instead focus on writing high-quality test and production code.

### 2. Outside-in TDD helps you avoid testing the implementation.

When writing tests after you write your production code, it can be easy to accidentally couple your tests to implementation details, because they are fresh on your mind. Sometimes the test can even look almost like a copy-paste of the production code, leaving you to wonder if they are adding any value. Even if you don't have this problem, you can end up with tests that need to change every time any change is made to your production code. This adds extra work and removes any regression safety you might have otherwise had from your test suite, because you can't continue running the same tests during a refactoring.

With outside-in TDD, writing the test first means thinking about the *usage* of your code before you think about how it's implemented. This helps you focus on the interface, or contract, of your code: what outputs it will provide given certain inputs. How these details are handled internally in your unit of code is the implementation, and it can change over time. This means your tests are less fragile and will only break when something *really* goes wrong, not just when you're cleaning up the code. It also means you can refactor with confidence.

### 3. Outside-in TDD helps you achieve simple design.

This point will take a little explanation.

When you first start developing on a project, or in your career in general, you most likely **focus on functionality.** You don't have anything working, so you want to get something working! Once one thing is working, you want to move on to the next thing.

This is fine for a while, but over time **focusing on functionality leads to spaghetti code**. You get the right result, but it's hard to understand how the code gets you there. All the concerns are mixed together. It's difficult to understand and almost impossible to change without breaking something.

When you're faced with spaghetti code, the natural response is to **focus on design.** Let's really think about how to structure our code! Let's apply the Single Responsibility Principle; let's minimize coupling and maximize cohesion. Let's really think about how our app needs to work and design it right from the start.

This is a good intention, but if your app lasts for any period of time, **the design you focused on will deteriorate**. The requirements weren't quite what you understood at first. Or maybe they were, but the requirements changed. Or the whole business model changed! Or maybe the app was so successful that you need to add significant new features that you never planned for. Whatever the reason, now you have features to build that don't fit the design. So they end up forming little clumps of spaghetti all over again!

If focusing on design up front doesn't solve the problem, maybe we can **focus on flexibility.** Let's make everything configurable! Everything's a config option or a pluggable slot.

The problem with this is that **focusing on flexibility leads to overdesign.** There's a cost associated with all this flexibility: complexity. Things are indirect, and it's hard to get a sense of the big picture. For a lot of those flexibility points, you'll never need to change them, so this cost comes without any benefit. And you likely still won't get it right: there will be other things you need to change that you didn't design for. So the spaghetti will strike again.

So if we get problems from focusing on features, on design, or on flexibility, what's the alternative? Well, one way to summarize it is with two guidelines:

1. **Build the bare minimum you need right now.** And I don't mean for your first release. I mean for that one story you're working on, build just enough to satisfy the requirements of that story.
2. **Make the code easy to change for when you need something else.** I don't mean build it "flexibly" with a lot of extension points; I mean writing simple code that's easy to change.

You could summarize it by saying we want **minimal, changeable code.** This is what will help you escape the spaghetti. And the secret is that minimal, changeable code is the goal of Test-Driven Development. Sure, you get great test coverage and confidence that your system works today. But you also get a system that you can change over time to fit the changing needs of your business or market.

## Ready?

If this has gotten you curious enough to try Test-Driven Development, [pick a framework](/) and let's get started!

## Resources

* [*Growing Object-Oriented Software, Guided by Tests*](http://www.informit.com/store/growing-object-oriented-software-guided-by-tests-9780321503626), the authoritative work on the London school of TDD
* [*Test-Driven Development by Example*](http://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530), the original work on TDD, which corresponds to another school of TDD: the classicist school
