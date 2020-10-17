---
title: Why Test-Driven Development?
permalink: /why-tdd/
---

Test-Driven Development is the practice of writing a test for functionality before you write the functionality itself. It follows the “Red-Green-Refactor Cycle:” first you write a failing test, then you write the minimum functionality to pass the test, then you rearrange the code if necessary to be simpler and clearer while still passing the test. Then the cycle begins again.

Why would you want to practice Test-Driven Development? Let’s talk about a few extremely common problems in programming that Test-Driven Development addresses in a unique way.

If you'd rather watch a video, [James Shore's Assert(js) 2019 talk "Thinking in Tests"](https://www.youtube.com/watch?v=UOOuW5tqT8M&feature=share) hits a lot of similar points.

## Regression Safety
As you add new features and change existing features, you need a way to make sure you don’t change any functionality except what you intend. Manual retesting is impractical as the application grows larger and larger, so an automated test suite is needed. The common practice is to write these tests after the code is written, but this "test-after development" approach has several downsides.

First, with test-after development, some of your code can be difficult to write a test for. This can happen if it has a complex interface or lots of dependencies on the rest of your application. Many developers respond to this situation by reaching for complex testing approaches that make the tests fragile, or giving up on the goal of testing this code. Instead, it’s better to rearrange the code to make it more testable. Even if a developer understands this, though, it can be unmotivating to do that if the code is already confirmed to be working, and changing it without tests would require more manual testing.

Second, with test-after development it’s difficult to write a test suite that fully specifies your functionality. Test coverage metrics attempt to guide you toward fully specifying your application. They *are* able to indicate when a line of code is not executed by a test at all, but they can’t measure if the behavior of that line is fully specified. When you add tests based on coverage metrics, it’s easy to end up with tests that don’t actually help specify behavior but just get additional lines of code executed.

**Using Test-Driven Development results in a test suite that fully protects your application’s functionality from regressions.** It results in 100% test coverage *by definition:* every line of code you have is the result of a failing test that drove you to write that line. Because of this, you can be sure that if you make an unintentional change it will be caught by the tests. Also, each of your tests adds value: it was required to get some bit of functionality added. There is no situation where you have code that can’t be tested, because the test is what resulted in that code being written.

## Robust Tests
Although we see the value of unit tests in theory, in practice our tests can often have a cost that outweighs the value. It can seem like whenever we make the smallest production change, we need to change the tests as well—and the test changes take more time than the production changes. Tests are supposed to ensure our changes don’t break anything, but if the test fails when we make a change, are we really getting that much assurance?

When a test needs to change any time its production code changes, this is a sign of an over-specified test. The test is specifying details of the implementation of the production code. Instead, what we want is a test of the *interface* or *contract* of the production code. Given a certain set of inputs, what are the outputs and effects visible to the rest of the application? We don’t care about what’s happening *inside* the block of code as long as what’s happening *outside* of it stays consistent. Testing the contract is what allows you to make production changes without updating your test code: it enables changes to the implementation that don’t affect the contract.

**Test-Driven Development guides you toward testing the interface rather than the implementation,** because there *is* no implementation yet at the time you’re writing the test. At that time, it’s easy to visualize the inputs and outputs of the production code you want to write, and it’s harder to visualize the implementation: internal state, helper function calls, etc. Because you can’t visualize the implementation, you can’t write a test that’s coupled to it; instead, your test specifies only the interface of the code.

By guiding you to test the contract, Test-Driven Development helps you build up a test suite that is less fragile, that doesn’t need to change every time production code changes. This increases its value for regression safety, and removes the pain points that make testing so expensive.

## Speed of Development
As many applications grow over time, the speed of development gets slower and slower. There is more code, so when you need to make a change, more existing code is affected. There is an increasing (sometimes, exponentially-increasing) amount of effort needed to add functionality. You can even reach the point where it takes all the developers’ effort just to keep the system working, and adding new functionality is impossible.

Why does this slowdown happen? Because when you wrote the code in the first place, your understanding of the needs of the application was different than it is now. The code was never designed to handle this new requirement. So to make this new feature fit, you put a workaround in place. Then another. And as these workarounds multiply, you end up with code that is very difficult to understand and change. The amount of effort to follow what even one massive function is doing can be overwhelming.

To keep your development speed up, you need to adjust the code as you go so that it’s always the simplest representation of the requirements as they stand right now. If you have a regression test suite that gives you 100% confidence, you can make adjustments at any time. But if you have even a *little bit* of doubt in your test suite, you’ll hesitate. It will be safer to just leave the workaround in place. After an accumulation of thousands of such decisions, you can end up with a codebase that is a mess of giant functions with deeply-nested conditional logic.

**With Test-Driven Development, because you have a regression test suite you know you can trust, you can clean up the code any time with very little friction.** You can make the code just a bit clearer or simpler, and if the tests are green you have a high degree of confidence that you haven't broken anything. Over time these tiny improvements add up to a codebase that looks like it was designed from the start knowing what you know now. And this simple, clear code helps your development speed stay fast.

Another cause of development slowdown is dependencies. If each bit of your code talks to many many other bits of code, then one change is likely to have a ripple effect across many places in your codebase, resulting in much more development effort to make a change. Code that is easy to change is loosely-coupled, only having minimal dependencies on other bits of code. The problem is that it’s difficult to see the dependencies in your code in production use. Your application is arranged just so, and all the bits are accessible where your code needs them—for now. But when things need to change, the number of very specific dependencies your code requires will become painfully clear.

Writing tests helps expose the dependencies in your application because your code is now being reused in a second context: the context of the test. You can see if the code is easy to instantiate or if it requires all the rest of your application to exist as well. This gives you visibility into dependency problems, but if you’re writing this test after the production code, it doesn’t help you *solve* those problems. You’ll still need to refactor your code while it’s not under test to break these dependencies.

**Test-Driven Development helps you avoid writing code with too many dependencies in the first place.** Because you’re writing the test code to call your production code first, you can see if too many dependencies are required and change your strategy before you even write the production code. So you’ll end up with code with minimal dependencies. This means that changes you make in one bit of code will be less likely to require changes in many other places in your app, allowing you to develop faster.

## Summary
As applications grow, you need to be able to make changes without breaking existing functionality and without requiring significant rework for each little change. Test-Driven Development helps you do this by giving you a regression suite that is guaranteed to fully specify your functionality, that does not specify implementation details, and that guides you into writing loosely-coupled code. These are the major benefits of Test-Driven Development.

## When Not TDD?
When would you not want to use Test-Driven Development? I think it would benefit far more projects than are using it today. But here are some cases when it might not make sense—and cautions about those cases.

- **Throwaway code:** there is no need for reliability or evolving your code because it will be tried and discarded. If you know for sure the code won’t be used on an ongoing basis, this is fine. However, many programmers are familiar with the occurrence of a proof-of-concept system going to production, against all intentions. If there is a chance of this happening, you will already be started down the path of having code that isn’t well-specified by tests.
- **Rapidly-changing organizations:** for example, in a startup that is pivoting frequently. In systems built for such a startup, you may still want some end-to-end tests that provide stability. But internal code will be more likely to be replaced than evolved, so thoroughly testing it to prepare for changes is wasted effort. It makes sense to avoid TDD in that case. But what about when the business settles down and needs to start evolving on a stable base? At this point the code will already be written and it will be difficult to add test coverage you can have confidence in.
- **Systems that won't change:** the system isn’t something that is going to be evolving much over time, because the needs are well understood. It’s a system with a known end state. Once that state is reached, further changes will be minimal. So if you think really hard about the right design and don't make any mistakes, you won't need to make changes. I’ve worked on systems like this. But I would share a caution. Humans find a lot of comfort in certainty, so it’s easy to *think* that things are certain and will never change. But many programmers’ experience backs up the fact that there are often more changes than you anticipate. And again, in this case, you will have backed yourself into a corner where you don’t have the test coverage ready to support that unexpected change.
- **Spikes:** You have a feature you want to implement but you don't know how you want it to work. You want to play around with different alternatives to see how they work before you commit to one. In this approach, you don't *know* what to specify in a test, and if you did specify something it would likely be thrown out 15 minutes later. This approach is called a spike, and it's looked upon favorably in TDD circles. The question is, once you settle on a final approach, do you keep your untested code as-is? Or do you try to retrofit tests around it? I would recommend a third option: for all the reasons above, treat the spike as a learning process, and start over to TDD the code with the approach you settled on. Now, if your application is *all* spikes like this it could be a significant amount of effort, but the alternative is code you don't have confident tests around.

## Human Limitations
One significant objection to Test-Driven Development is that you can *theoretically* get all the same benefits just by knowing the above software design principles and being disciplined about them. Think about the dependencies of each piece of code carefully and don't give in to the temptation to hard-code. Be extremely careful in each test you write to make sure every edge case is covered. That should give you a test suite that's as good as one TDD would give you.

But is this approach practical? I would ask, have you ever worked with a developer who isn't that careful all the time? I think most of us would agree we've worked with many such developers. Do you want to write your code in such a way that *none* of those developers can work on your codebase? This is how we end up with an industry that demands senior developers for everything and has no way to train juniors.

Let me ask a more personal question: are *you* always that careful? *Always?* Even when management is demanding three number-one priorities before the end of the day? When you're sick? When a major stressful life event happens to you?

Programming allows us to create incredibly powerful software with relative ease. As a result, programmers are tempted to think of ourselves as having unlimited abilities. But programmers are still human. We have limited energy, attention, and patience (especially patience). We can't perform at our peak capacity 100% of the time.

The more we programmers embrace our limited capacities, the more we will lean on techniques that acknowledge and support those limitations. Test-Driven Development is one such technique. If you find yourself experiencing development slowdown and bugs making their way to production, I would encourage you to give Test-Driven Development some time to learn it, to see if it helps.

## Ready?

If this has gotten you curious enough to try Test-Driven Development, [pick a framework](/) and let's get started!