### What do I need to unit test?

Unit test classes you need to design.

- For other libraries' classes, you can't change their design, so unit tests don't add value.
- Routes are trivial configuration, so can't be designed, so usually don't need to be unit tested. Acceptance tests confirm they work.
- Templates are a visual issue, and can't usually productively be unit tested.
- Controllers' input can't be designed, and their output should ideally be simple calls on business objects. And their cases are generally covered by acceptance tests.
- Models: it depends. If you have methods you add to them with logic, probably test. Validations, maybe—it depends on if you consider those something you're designing, or if it's just configuration of the framework.