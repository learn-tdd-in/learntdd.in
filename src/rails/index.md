# Learn TDD in Rails

<img src="../images/rails.svg" alt="Rails logo" class="page-logo" />

Test-Driven Development (TDD) is an approach to automated software testing that involves writing a failing test before writing the production code to make it pass. TDD helps you develop a robust test suite to catch bugs, as well as guiding you to more modular, flexible code.

To see how TDD works in Rails, let's walk through a simple real-world example of building a feature. We'll be using Rails 6.0 along with RSpec and Capybara, two popular test libraries for Ruby. Each section of the article is linked to a corresponding commit in the [Git repo](https://github.com/learn-tdd-in/rails) that shows the process step-by-step. This tutorial assumes you have some [familiarity with Rails](http://guides.rubyonrails.org/) and with [automated testing concepts](https://rspec.info/documentation/3.10/rspec-core/#basic-structure).

You can also watch a [meetup presentation video](https://youtu.be/fXlLbhuIc34) of this tutorial.

The feature we'll build is the age-old tutorial feature: creating a blog post.

## Setup

First, create the new Rails app:

```sh
$ rails new --skip-test learn_tdd_in_rails
$ cd learn_tdd_in_rails
```

Next, we need to add some testing gems. Add the following to your `Gemfile`:

```diff
 group :development, :test do
   # Call 'byebug' anywhere in the code to stop execution and get a debugger console
   gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
+  gem 'rspec-rails'
 end
+
+group :test do
+  gem 'capybara'
+  gem 'selenium-webdriver'
+end

 group :development do
```

Install the gems:

```sh
$ bundle install
```

Then set up RSpec:

```sh
$ rails generate rspec:install
```

## The Feature Test

When performing outside-in TDD, our first step is to **create an end-to-end test describing the feature we want users to be able to do.** For our simple messaging app, the first feature we want is to be able to enter a message, send it, and see it in the list.

In Rails, end-to-end tests are referred to as system tests. Generate a new system test:

```sh
$ rails g rspec:system creating_blog_posts
```

This will create a file `spec/system/creating_blog_posts_spec.rb`. Open it and make the following changes:

```diff
 require 'rails_helper'

 RSpec.describe "CreatingBlogPosts", type: :system do
   before do
     driven_by(:rack_test)
   end

-  pending "add some scenarios (or delete) #{__FILE__}"
+  it 'saves and displays the resulting blog post' do
+    visit '/blog_posts/new'
+
+    fill_in 'Title', with: 'Hello, World!'
+    fill_in 'Body', with: 'Hello, I say!'
+
+    click_on 'Create Blog Post'
+
+    expect(page).to have_content('Hello, World!')
+    expect(page).to have_content('Hello, I say!')
+
+    blog_post = BlogPost.order("id").last
+    expect(blog_post.title).to eq('Hello, World!')
+    expect(blog_post.body).to eq('Hello, I say!')
+  end
 end
```

The code describes the steps a user would take interacting with our app:

- Visiting the new blog post page
- Entering a title and body into form fields
- Clicking a "Create Blog Post" button
- Confirming that the blog post appears on the screen

We also confirm that the blog post is saved into the database, to make sure we aren't just displaying the data on the screen but that we've also persisted it.

After we've created our test, the next step in TDD is to **run the test and watch it fail.**  This test will fail (be "red") at first because we haven't yet implemented the functionality.

Run the test:

```sh
$ rspec
```

You should see the following error:

```sh
F

Failures:

  1) CreatingBlogPosts saves and displays the resulting blog post
     Failure/Error: visit '/blog_posts/new'

     ActionController::RoutingError:
       No route matches [GET] "/blog_posts/new"



     # ./spec/system/creating_blog_posts_spec.rb:9:in `block (2 levels) in <top (required)>'

Finished in 0.03064 seconds (files took 0.89609 seconds to load)
1 example, 1 failure

Failed examples:

rspec ./spec/system/creating_blog_posts_spec.rb:8 # CreatingBlogPosts saves and displays the resulting blog post
```

## Write The Code You Wish You Had

The next step of TDD is to **write only enough production code to fix the current error or test failure.** In our case, all we need to do is add a route for `/blog_posts/new`.

A common principle in TDD is to **write the code you wish you had.** We could add a `get 'blog_posts/new'` route to implment just this one route. But say we want to stick with Rails conventions and create a resourceful controller instead. In `config/routes.rb`, let's add a more standard `resources` instead:

```diff
 Rails.application.routes.draw do
   # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
+  resources :blog_posts
 end
```

Rails allows you to "unit test" routes, but for trivial configuration like this, it's fine to let the acceptance test cover it without stepping down to the unit level.

Rerun the test. Now we get a new error:

```sh
1) CreatingBlogPosts saves and displays the resulting blog post
   Failure/Error: visit '/blog_posts/new'

   ActionController::RoutingError:
     uninitialized constant BlogPostsController
```

The error says that the controller doesn’t exist. To write only enough production code to fix this error, let's create an empty controller class. In `app/controllers/`, create a `blog_posts_controller.rb` file and add the following contents:

```ruby
class BlogPostsController < ApplicationController
end
```

We add an empty controller that inherits from our app’s base controller class. We could have gotten past this error message by creating a class that didn’t inherit from anything, but in this case we’re so sure we’ll inherit from the base controller class that we can go ahead and do it.

Rerun the tests and the next error we get is:

```sh
Failure/Error: visit '/blog_posts/new'

AbstractController::ActionNotFound:
  The action 'new' could not be found for BlogPostsController
```

Let's add it:

```diff
 class BlogPostsController < ApplicationController
+  def new
+  end
 end
```

The next error we get is:

```sh
Failure/Error: visit '/blog_posts/new'

ActionController::MissingExactTemplate:
  BlogPostsController#new is missing a template for request formats: text/html
```

Even though we didn't ask to render a template, Rails' default behavior for a controller action is to render a corresponding template, so that's the error it's running across next.

In `app/views/`, create a `blog_posts` folder, then add an empty `new.html.erb` file.

The next error is:

```sh
Failure/Error: fill_in 'Title', with: 'Hello, World!'

Capybara::ElementNotFound:
  Unable to find field "Title" that is not disabled
```

The acceptance test is finally able to successfully `visit '/blog_posts/new'` and move on to attempt the next step, which is `fill_in 'Title', with: 'Hello, World!'`.

The simplest code that would fix this error would be to add a plain `<input>` tag to the form. But, once again following the principle of writing the code we wish we had, we want to use Rails' form helpers, so let's do so. Enter the following contents in `new.html.erb`:

```erb
<%= form_with do |f| %>
  <div>
    <%= f.label :title %>
    <%= f.text_field :title %>
  </div>
<% end %>
```

Rerun the tests and now they are able to fill in that field, and we get the next error:

```sh
Failure/Error: fill_in 'Body', with: 'Hello, I say!'

Capybara::ElementNotFound:
  Unable to find field "Body" that is not disabled
```

So let's add the body field to the form as well:

```diff
 <%= form_with do |f| %>
   <div>
     <%= f.label :title %>
     <%= f.text_field :title %>
   </div>
+  <div>
+    <%= f.label :body %>
+    <%= f.text_area :body %>
+  </div>
 <% end %>
```

The next error is:

```sh
Failure/Error: click_on 'Create Blog Post'

Capybara::ElementNotFound:
  Unable to find link or button "Create Blog Post"
```

Let's add a submit button:

```diff
   <div>
     <%= f.label :body %>
     <%= f.text_area :body %>
   </div>
+  <%= f.submit 'Create Blog Post' %>
 <% end %>
```

Our next error is:

```sh
Failure/Error: click_on 'Create Blog Post'

ActionController::RoutingError:
  No route matches [POST] "/blog_posts/new"
```

What's going on here is that the default form submission behavior for Rails' form helper is to POST back to the current route you're on. The app is attempting to do that, and isn't finding a route that accepts a POST at that URL. This is because resourceful controllers accept a POST at the collection URL, in this case `/blog_posts`.

Usually with Rails form helpers we get this behavior by passing a model object in. Let's instantiate a model in the controller action. We don't actually have a `BlogPost` model class yet, but let's write the code we wish we had:

```diff
 class BlogPostsController < ApplicationController
   def new
+    @blog_post = BlogPost.new
   end
 end
```

Then in the template we pass the model instance into the form helper:

```diff
-<%= form_with do |f| %>
+<%= form_with model: @blog_post do |f| %>
   <div>
     <%= f.label :title %>
```

Now we get the error:

```sh
Failure/Error: @blog_post = BlogPost.new

NameError:
  uninitialized constant BlogPostsController::BlogPost
```

By writing the code we wish we had, we got our tests to tell us that we don't have a `BlogPost` model yet. So let's generate it to get past the error. We could create it with no fields, but generating a Rails model with initial fields specified is so typical that we can go ahead and do that:

```sh
$ rails g model BlogPost title:string body:text
```

We get the following output:

```sh
invoke  active_record
create    db/migrate/20201020122843_create_blog_posts.rb
create    app/models/blog_post.rb
invoke    rspec
create      spec/models/blog_post_spec.rb
```

Notice that a blog post model test was generated. We won't need it for this exercise because our use of the model is so trivial; you can delete it. We would use it if we were adding more complex methods to the model.

Go ahead and migrate the database:

```sh
$ rails db:migrate
```

Rerun the tests and we get this error:

```sh
Failure/Error: click_on 'Create Blog Post'

AbstractController::ActionNotFound:
  The action 'create' could not be found for BlogPostsController
```

Now that the form is provided with a model object, it is successfully POSTing to the route that corresponds to the `create` action. But our controller doesn't have that action yet. Let's add it:

```diff
 class BlogPostsController < ApplicationController
   def new
     @blog_post = BlogPost.new
   end
+
+  def create
+  end
 end
```

The next error is:

```sh
Failure/Error: expect(page).to have_content('Hello, World!')

Capybara::ElementNotFound:
  Unable to find xpath "/html"
```

This error message isn't the most obvious, but what it means is that no HTML was rendered in response to the action. There is no default rendering for `create` actions.

Usually a `create` action would redirect to another route instead of rendering a template directly. But for the sake of keeping this tutorial simple, we'll just go ahead and render it. Create a `create.html.erb` file in `app/views/blog_posts`.

Rerun the tests and we get this error:

```sh
Failure/Error: expect(page).to have_content('Hello, World!')
  expected to find text "Hello, World!" in ""
```

The test is now able to successfully POST the form submission. After that, the test expects to see the title of the post somewhere on the page, but it doesn't see it--because we haven't actually rendered any content at all.

The simplest way to get past this failure is actually to *not* save the blog post to the database, but just instantiate it in-memory. Let's do that; we'll see later how we ensure it's persisted.

In the `create` we create the blog post:

```diff
   def create
+    @blog_post = BlogPost.new(params[:blog_post])
   end
 end
```

Then in the template we render out the title:

```erb
<h1><%= @blog_post.title %></h1>
```

We rerun the test and now the error is:

```sh
Failure/Error: @blog_post = BlogPost.new(params[:blog_post])

ActiveModel::ForbiddenAttributesError:
  ActiveModel::ForbiddenAttributesError
```

Rails' "strong parameters" security feature means that we can't just pass user-submitted params directly into a model; that could result in users hacking our system by setting fields they shouldn't be able to, like the user a post belongs to. Instead, we need to permit the params that are allowed. We'll just permit the title for now:

```diff
   end

   def create
-    @blog_post = BlogPost.new(params[:blog_post])
+    @blog_post = BlogPost.new(blog_post_params)
   end
+
+  private
+
+  def blog_post_params
+    params.require(:blog_post).permit(:title)
+  end
 end
```

We use the conventional Rails strong parameters approach of creating a private controller method that specifies which parameters are permitted. Because this is a common pattern, we don't need to step down to any kind of controller unit test--letting the acceptance test drive this code is fine.

The next error is:

```
Failure/Error: expect(page).to have_content('Hello, I say!')
  expected to find text "Hello, I say!" in "Hello, World!"
```

Now we need to pass the blog post body through to the view as well. In the controller:

```diff
 def blog_post_params
-  params.require(:blog_post).permit(:title)
+  params.require(:blog_post).permit(:title, :body)
 end
```

And in the view:

```diff
 <h1><%= @blog_post.title %></h1>
+
+<div>
+  <%= @blog_post.body %>
+</div>
```

The next error is:

```sh
Failure/Error: expect(blog_post.title).to eq('Hello, World!')

NoMethodError:
  undefined method `title' for nil:NilClass
```

Now we've successfully found the title and body displayed on the page, but when the test checks for the record in the database, the record is `nil`. This means it hasn't been saved. This is just a small change to make in the `create` action:

```diff
   end

   def create
-    @blog_post = BlogPost.new(blog_post_params)
+    @blog_post = BlogPost.create(blog_post_params)
   end

   private
```

With this, our acceptance test is passing. Notice that the check of the `body` field passed as soon as we got the `title` field passed as well. This is fine, and is extra safety.

We've successfully allowed the acceptance test to drive us through implementing a complete feature!

## More Resources

To learn more about TDD, I recommend:

* [_Effective Testing with RSpec 3_](https://pragprog.com/book/rspec3/effective-testing-with-rspec-3)
* <a href="https://click.linksynergy.com/link?id=JlUaUff9Alw&offerid=145238.681793&type=2&murl=https%3A%2F%2Fwww.informit.com%2Ftitle%2F9780321503626"><em>Growing Object-Oriented Software, Guided by Tests</em></a><IMG border=0 width=1 height=1 src="https://ad.linksynergy.com/fs-bin/show?id=JlUaUff9Alw&bids=145238.681793&type=2&subid=0" /> - The original work on the style of TDD we describe here, mockist TDD. It has a lot of great detail, not just about testing, but also how it influences design and project methodology.
* [_Rails 5 Test Prescriptions_](https://pragprog.com/titles/nrtest3/rails-5-test-prescriptions/) by Noel Rappin

If you have any questions or suggestions, reach out to <tdd@codingitwrong.com> or any contact mechanism on [codingitwrong.](https://codingitwrong.com) and we'll be glad to help!
