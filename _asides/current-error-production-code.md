### Why only write enough production code to get past the current error?

The idea is to let the tests guide each step of your implementation. Otherwise, the code you're writing may not be tested, and may not be necessary for the current story.

This is a key part of the Red-Green-Refactor cycle:

- Red: write just enough test to fail.
- Green: write just enough production code to fix the current error. If the test isn't passing after that, repeat for the *next* error.
- Refactor: after the tests are passing, see if there's anything you can do to improve your test or production code.
- Repeat.

A note about refactoring: we won't be doing much in this post because the example feature is so trivial. But that doesn't mean it's okay to skip for real apps--it's essential.

But sometimes, more than enough. If you have high confidence in the code you need to write, you can go ahead and do it. But start small and start speeding up only when you've seen a pattern.