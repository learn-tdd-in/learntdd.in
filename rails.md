---
layout: page
title: Learn TDD in Rails
---

Test-Driven Development (TDD) is an approach to automated software testing that involves writing a failing test before writing the production code to make it pass. TDD helps you develop a robust test suite to catch bugs, as well as guiding you to more modular, flexible code.

To see how TDD works in Rails, let's walk through a simple real-world example of building a feature. We'll be using RSpec, one of the most popular test frameworks for Ruby. You can follow along in this article, or take a look at the [Git repository](https://github.com/learntdd/learn-tdd-in-rails) that shows the process step-by-step.

The feature we'll build is the age-old tutorial feature: creating a blog post. Right away we run into a question:

### Question: Do I write the test or production code first?

And TDD has an answer:

### Answer: Write tests first.

Writing tests first makes sure your code is easy to test and is fully covered by tests. But now we immediately have a few other questions:

### (Q) When do I write acceptance tests? (A) Every time you have a new scenario for a user interacting with your system.

OK, so how do I go about writing that acceptance test? Specifically:

### (Q) How much acceptance test code do I write at a time? (A) A complete test for one feature.

Here's our complete acceptance test for the "creating a blog post" feature.

```ruby
# spec/features/creating_a_blog_post_spec.rb
require 'rails_helper'

describe 'Creating a blog post' do

  it 'saves and displays the resulting blog post' do
    visit '/blog_posts/new'

    fill_in 'Title', with: 'Hello, World!'
    fill_in 'Body', with: 'Hello, I say!'

    click_on 'Create Blog Post'

    blog_post = BlogPost.order("id").last
    expect(blog_post.title).to eq('Hello, World!')
    expect(blog_post.body).to eq('Hello, I say!')

    expect(page).to have_content('Hello, World!')
    expect(page).to have_content('Hello, I say!')
  end

end
```

This test illustrates the answer to another question as well:

### (Q) How much do I use test doubles? (A) In acceptance tests, don’t use them.

Notice that we use the real `BlogPost` class, and we really hit the database. Acceptance tests should exercise the whole stack of your system to make sure everything works together.

Now that we have an acceptance test, we run it and watch it fail, to know what to implement first.

```
# rspec spec/features/creating_a_blog_post_spec.rb
F

Failures:

  1) Creating a blog post saves and displays the resulting blog post
     Failure/Error: visit '/blog_posts/new'

     ActionController::RoutingError:
       No route matches [GET] "/blog_posts/new"
```

We're getting an error because there is no route set up for the `new` page we want to visit. Do I need to write a unit test to specifically check that that route is present? Well:

### (Q) Do I test every line of code and configuration? (A) No, you can fix trivial errors directly.

Some would disagee, but I'll argue that this error is small enough to fix directly. So let's just add that route:

```ruby
# config/routes.rb
Rails.application.routes.draw do
  resources :blog_posts
end
```

We can be pretty sure there will be an error when we add a route without the corresponding controller, so should we write that code too?

### (Q) How much production code do I write at a time? (A) Just enough to fix the current error.

The idea is to let the tests guide each step of your implementation. This is a key part of the Red-Green-Refactor cycle:

- Red: write just enough test to fail.
- Green: write *just enough production code to fix the current error*. If the test isn't passing after that, repeat for the *next* error.
- Refactor: see if there's anything you can do to improve your test or production code.
- Repeat.

A note about refactoring: we won't be doing any in this post because the example feature is so trivial. But that doesn't mean it's okay to skip for real apps--it's essential.

Now that we've written the code we think will fix the current error, let's rerun the test to confirm that it did:

```
# rspec spec/features/creating_a_blog_post_spec.rb
F

Failures:

  1) Creating a blog post saves and displays the resulting blog post
     Failure/Error: visit '/blog_posts/new'

     ActionController::RoutingError:
       uninitialized constant BlogPostsController
```

We're past the missing route error, and we get another one. It's the error we expected: a missing controller. Let's add it:

```ruby
# app/controllers/blog_posts_controller.rb
class BlogPostsController < ApplicationController
end
```

But wait--didn't I just write more code than was needed to make the test pass? The test failure doesn't say anything about subclassing ApplicationController. Why did I add that code in?

### (Q) How much production code do I write at a time? (A) Sometimes, more than enough to fix the current error.

In this case, I'm so sure this class will have `ApplicationController` as a parent that there's no real benefit to me starting without it.

Now that we have a controller class, we're ready to rerun the test to make sure we're past the missing-controller error:

```
# rspec spec/features/creating_a_blog_post_spec.rb
F

Failures:

  1) Creating a blog post saves and displays the resulting blog post
     Failure/Error: visit '/blog_posts/new'

     AbstractController::ActionNotFound:
       The action 'new' could not be found for BlogPostsController
```

Rails can find the controller now, but it can't find a `new` method that corresponds to our route. Let's add it:

```ruby
# app/controllers/blog_posts_controller.rb
class BlogPostsController < ApplicationController
  def new
  end
end
```

Rerun:

```
# rspec spec/features/creating_a_blog_post_spec.rb
F

Failures:

  1) Creating a blog post saves and displays the resulting blog post
     Failure/Error: visit '/blog_posts/new'

     ActionView::MissingTemplate:
       Missing template blog_posts/new
```

Now we're missing the view template that Rails automatically renders for this controller action. To make the test pass, let's add the empty template file (plus a comment to show where the file lives):

```
<%# app/views/blog_posts/new.html.erb %>
```

Rerun:

```
# rspec spec/features/creating_a_blog_post_spec.rb
F

Failures:

  1) Creating a blog post saves and displays the resulting blog post
     Failure/Error: fill_in 'Title', with: 'Hello, World!'

     Capybara::ElementNotFound:
       Unable to find field "Title"
```

Now the test can't find a form element it's looking for, because the template output is blank. This is another case where we can safely add more than just the one missing field. Let's add the whole form:

```
<%# app/views/blog_posts/new.html.erb %>
<%= form_for @blog_post do |f| %>
  <div>
    <%= f.label :title %>
    <%= f.text_field :title %>
  </div>
  <div>
    <%= f.label :body %>
    <%= f.text_area :body %>
  </div>
  <%= f.submit 'Create Blog Post' %>
<% end %>
```

Rerun:

```
# rspec spec/features/creating_a_blog_post_spec.rb
F

Failures:

  1) Creating a blog post saves and displays the resulting blog post
     Failure/Error: <%= form_for @blog_post do |f| %>

     ActionView::Template::Error:
       First argument in form cannot contain nil or be empty
```

This isn't as clear an error message as the previous ones, but the problem is that the `@blog_post` variable passed into the `form_for` helper is `nil`, but it should be a model instance. Should we go ahead and add the behavior to the controller's `new` action to create that model? Well:

### (Q) When do I write unit tests? (A) Step down to a unit test whenever there is a behavioral error.

When I say "behavioral" error, I mean an error with what the code should actually *do*. Up until now, all of the errors have been "structural" errors: missing routes, classes, and methods. Those are fine to test at the acceptance level, but behavioral errors are better to test at the unit level.

So now, instead of implementing production code, let's step down to the unit test level and write a test for the controller. Now we need to re-ask a question we asked before, but this time about unit tests rather than acceptance tests:

### (Q) How much unit test code do I write at a time? (A) Only enough to expose the logic error.

The answer is different for unit tests than for acceptance tests. We don't write a comprehensive test; we write just enough expose the logic error our acceptance test is showing us. So let's write just enough unit test to check that the new method should return a blog post.

```ruby
# spec/controllers/blog_posts_controller_spec.rb
require 'rails_helper'

describe BlogPostsController do

  describe '#new' do
    it 'assigns a blog post' do
      blog_post = instance_double(BlogPost)
      expect(BlogPost).to receive(:new).and_return(blog_post)
      get :new
      expect(assigns[:blog_post]).to eq(blog_post)
    end
  end

end
```

This test illustrates the answer to another question:

### (Q) How much do I use test doubles? (A) In unit tests, use test doubles in place of any collaborators.

Unlike in the acceptance test, we aren't calling real methods on production code. Instead, we're mocking out the `BlogPost` class method and using a test double for the instance. In the context of this unit test, we don't care about the `BlogPost` class at all; all we care about is whether the controller the controller calls `new` on the `BlogPost` class and adds the result to the `assigns`.

Now that we've specified some behavior in our unit test, let's run the it and watch it fail:

```
# rspec spec/controllers/blog_posts_controller_spec.rb
F

Failures:

  1) BlogPostsController#new returns a blog post
     Failure/Error: blog_post = instance_double(BlogPost)

     NameError:
       uninitialized constant BlogPost
```

We're getting this error because, in RSpec's mocking framework, `instance_double` actually checks that a real `BlogPost` class exists. Since it doesn't, we need to create it, and we'll follow the principle again of writing a *bit* more code than strictly necessary. Let's make it an Active Record model and add the `title` and `body` fields to the database:

```ruby
# app/models/blog_post.rb
class BlogPost < ActiveRecord::Base
end
```

```ruby
# db/migrate/20160223100510_create_blog_posts.rb
class CreateBlogPosts < ActiveRecord::Migration
  def change
    create_table :blog_posts do |t|
      t.string :title
      t.text :body
    end
  end
end
```

Rerun the unit test:

```
# rspec spec/controllers/blog_posts_controller_spec.rb
F

Failures:

  1) BlogPostsController#new returns a blog post
     Failure/Error: expect(assigns[:blog_post]).to eq(blog_post)

       expected: #<InstanceDouble(BlogPost) (anonymous)>
            got: nil

       (compared using ==)
```

Now we've reproduced the acceptance test's error in our unit test: we were expecting a blog post to be assigned, but nothing was assigned. Now that our unit test is specifying that behavior, we can implement it:

```ruby
# app/controllers/blog_posts_controller.rb
class BlogPostsController < ApplicationController
  def new
    @blog_post = BlogPost.new
  end
end
```

Rerun:

```
# rspec spec/controllers/blog_posts_controller_spec.rb
.

Finished in 0.03134 seconds (files took 1.46 seconds to load)
1 example, 0 failures
```

And now our unit test passed--great! What's next?

### (Q) How often do I run which tests? (A) When the unit test passes, step back up to the acceptance test.

This is idea of outside-in testing: you should have *two* Red-Green-Refactor loops:

- Red: write an acceptance test and watch it fail.
- Green: implement the code, by:
  - Red: write a unit test and watch it fail.
  - Green: implement the code to make the unit test pass.
  - Refactor.
  - Repeat until the acceptance test passes.
- Refactor.
- Repeat for the next bit of functionality you need.

Since it's been a while since we've seen our acceptance test, here's a reminder of what it looks like:

```ruby
# spec/features/creating_a_blog_post_spec.rb
require 'rails_helper'

describe 'Creating a blog post' do

  it 'saves and displays the resulting blog post' do
    visit '/blog_posts/new'

    fill_in 'Title', with: 'Hello, World!'
    fill_in 'Body', with: 'Hello, I say!'

    click_on 'Create Blog Post'

    blog_post = BlogPost.order("id").last
    expect(blog_post.title).to eq('Hello, World!')
    expect(blog_post.body).to eq('Hello, I say!')

    expect(page).to have_content('Hello, World!')
    expect(page).to have_content('Hello, I say!')
  end

end
```

Last time we ran the acceptance test, the error we got was that the `@blog_post` variable was `nil`. Our passing unit test says that behavior should work now, so let's rerun the acceptance test and make sure we're past that error:

```
# rspec spec/features/creating_a_blog_post_spec.rb
F

Failures:

  1) Creating a blog post saves and displays the resulting blog post
     Failure/Error: click_on 'Create Blog Post'

     AbstractController::ActionNotFound:
       The action 'create' could not be found for BlogPostsController
```

Sure enough, we're on to the next error. The test is now able to load the form page and fill it out. When it attempts to post the form, however, the `create` action can't be found on the controller.

We haven't finished our feature yet, but at this point we've illustrated the main process of TDD. So rather than finish this feature together, I'd encourage you to try it out yourself! Download [a repo of the code up until this point](https://github.com/learntdd/learn-tdd-in-rails/tree/in-progress) and then try to implement the rest of this feature, as specified in the acceptance test, using TDD. The `in-progress` branch leaves off where this article does, and the `master` branch shows the rest of the steps.

If you have any questions or suggestions, reach out to [@learn_tdd](https://twitter.com/learn_tdd) on Twitter or <tdd@need-bee.com> and we'll be glad to help!
