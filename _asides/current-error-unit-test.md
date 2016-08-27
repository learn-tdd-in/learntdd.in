### Why only write enough unit test to reproduce the current acceptance test error?

The answer is different for unit tests than for acceptance tests. We don't write a comprehensive test; we write just enough expose the behavioral error our acceptance test is showing us. This ensures we don't add functionality to the object that isn't yet needed to satisfy the feature.