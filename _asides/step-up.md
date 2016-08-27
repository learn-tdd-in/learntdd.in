### Why step back up after the unit test passes?

This is idea of outside-in testing: you should have *two* Red-Green-Refactor loops:

- Red: write an acceptance test and watch it fail.
- Green: implement the code, by:
  - Red: write a unit test and watch it fail.
  - Green: implement the code to make the unit test pass.
  - Refactor.
  - Repeat until the acceptance test passes.
- Refactor.
- Repeat for the next bit of functionality you need.