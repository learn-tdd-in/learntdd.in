# Learn TDD in Rails

<img src="../images/rails.svg" alt="Rails logo" class="page-logo" />

Test-Driven Development (TDD) is an approach to automated software testing that involves writing a failing test before writing the production code to make it pass. TDD helps you develop a robust test suite to catch bugs, as well as guiding you to more modular, flexible code.

To see how TDD works in Rails, let's walk through a simple real-world example of building a feature. We'll be using Rails 5.2 and RSpec, one of the most popular test frameworks for Ruby. Each section of the article is linked to a corresponding commit in the [Git repo](https://github.com/learn-tdd-in/rails) that shows the process step-by-step. This tutorial assumes you have some [familiarity with Rails](http://guides.rubyonrails.org/) and with [automated testing concepts](/concepts).

You can also watch a [meetup presentation video](https://youtu.be/fXlLbhuIc34) of this tutorial.

The feature we'll build is the age-old tutorial feature: creating a blog post.

### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/a5cea8f9c947f8f417a39d55c34b4b0393d18d40)

#### spec/features/creating_a_blog_post_spec.rb

```ruby
require 'rails_helper'

describe 'Creating a blog post' do

  it 'saves and displays the resulting blog post' do
    visit '/blog_posts/new'

    fill_in 'Title', with: 'Hello, World!'
    fill_in 'Body', with: 'Hello, I say!'

    click_on 'Create Blog Post'

    expect(page).to have_content('Hello, World!')
    expect(page).to have_content('Hello, I say!')

    blog_post = BlogPost.order("id").last
    expect(blog_post.title).to eq('Hello, World!')
    expect(blog_post.body).to eq('Hello, I say!')
  end

end
```

We start by writing out an acceptance test for the full feature we want to implement. In this case, we want to visit a blog post creation page, enter a title and body, save it, and then see on the results page that title and body, as well as confirming it’s in the database.

Red: No route matches [GET] "/blog_posts/new"

The first error we get is that there is no blog-posts/new route.


### Add blog posts resource route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/650c1a5d9598c1d61d17d0172ef01f66b01dfb23)

#### config/routes.rb

```diff
 Rails.application.routes.draw do
+  resources :blog_posts
 end
```

We add the route, but we don’t just write the simplest code possible to get the test to pass; we “write the code we wish we had.” In this case, we wish we had a resourceful blog posts controller, so we create a resource route, which corresponds to a resourceful controller of the same name..

Rails allows you to "unit test" routes, but for trivial configuration like this, it's fine to let the acceptance test cover it without stepping down to the unit level.

Red: uninitialized constant BlogPostsController

The next error we get is that that controller doesn’t exist.


### Add empty blog posts controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/61f863fb0c9ed9030a5952608374dff7b35b9a5e)

#### app/controllers/blog_posts_controller.rb

```diff
+class BlogPostsController < ApplicationController
+end
```

We add an empty controller that inherits from our app’s base controller class. We could have gotten past this error message by creating a class that didn’t inherit from anything, but in this case we’re so sure we’ll inherit from the base controller class that we can go ahead and do it.

Red: The action 'new' could not be found for BlogPostsController

The acceptance test can now find the controller, but not a "new" action on it.


### Add `new` action to blog posts controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/8772d7d5f3ae39bfff6380d9e00fc8fca2241e5a)

#### app/controllers/blog_posts_controller.rb

```diff
 class BlogPostsController < ApplicationController
+  def new
+  end
 end
```

Again, we only add enough code to get the test to pass.

```sh
Red: BlogPostsController#new is missing a template for this request format and
variant.

  request.formats: ["text/html"]
  request.variant: []
```

Even though we didn't ask to render a template, Rails' default behavior for a controller action is to render a corresponding template, so that's the error it's running across next.


### Add new blog post template [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/48b6da6ead51b73818e23a7b7138c88fc3433fec)

#### app/views/blog_posts/new.html.erb

```diff
+<%# empty view %>
```

Red: Unable to find field "Title"

The acceptance test is finally able to successfully `visit '/blog_posts/new'` and move on to attempt the next step, which is `fill_in 'Title', with: 'Hello, World!'`.


### Add fields and submit button to form template [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/7144bb1974d136762e16f0b398a1a3eb2902e0ba)

#### app/views/blog_posts/new.html.erb

```diff
-<%# empty view %>
+<%= form_for @blog_post do |f| %>
+  <div>
+    <%= f.label :title %>
+    <%= f.text_field :title %>
+  </div>
+  <div>
+    <%= f.label :body %>
+    <%= f.text_area :body %>
+  </div>
+  <%= f.submit 'Create Blog Post' %>
+<% end %>
```

This is another case where all we needed to add to get the test to pass was the title field. But this is a reasonable case where you know what the form will consist of, so you can go ahead and create it all. Plus, your tests will never drive out the full markup of your templates, so you'll need to do that by hand anyway.

Red: First argument in form cannot contain nil or be empty

<%= form_for @blog_post do |f| %>

In other words, @blog_post is nil but needs to be a model.


### Assign blog post in controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/6eb92b24f90c4663de45c685f23b32f14cb6a4ea)

#### app/controllers/blog_posts_controller.rb

```diff
 class BlogPostsController < ApplicationController
   def new
+    @blog_post = BlogPost.new
   end
 end
```

We attempt to make the acceptance test pass by assigning the @blog_post instance variable in the controller. Note that we don't create a unit test for the controller. Many developers discourage controller tests because controller behavior is so closely related to acceptance test cases. Also, Rails 5 removes some controller test features that result in limiting how effective they can be.

Red: uninitialized constant BlogPostsController::BlogPost

The line of code we added isn't actually able to succeed because there is no class named BlogPost defined yet.


### Add blog post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/259c646650e79f95d3ea16535d71f0999d309df3)

#### app/models/blog_post.rb

```diff
+class BlogPost < ApplicationRecord
+end
```

We add the BlogPost model class. Although we don't strictly need to subclass `ApplicationRecord` to get the acceptance test error to pass, we're sure enough that this will be an Active Record model that it's safe for us to go ahead and subclass it.

Note that we will soon step down from our acceptance test to create a model test, but we don't do it just yet. We write model tests and other lower-level tests to specify behavior, but we haven't reached a behavioral error yet. This is just a structural error: there is no `BlogPost` class. That's simple enough that we can just implement it directly.

Red: PG::UndefinedTable: ERROR:  relation "blog_posts" does not exist

Because we subclass `ApplicationRecord`, our call to `BlogPost.new` checks for the existence of a `blog_posts` table (a "relation"), and doesn't find one.


### Specify model should be instantiable [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/2dbc3e6df70403f5f1d098603f746a2e9e42186f)

#### spec/models/blog_post_spec.rb

```diff
+require 'rails_helper'
+
+describe BlogPost do
+
+  it "is instantiable" do
+    expect{ blog_post = BlogPost.new }.not_to raise_error
+  end
+
+end
```

The previous error wasn't enough for us to want to create a `BlogPost` model test, because it was just a structural error: there was no `BlogPost` class. But now we have an error that a `BlogPost` can't be instantiated, which is a logic error: and that means we should create a model test. It's not strictly a unit test because it's not isolated from the database, but it _is_ following the outside-in-testing principle of stepping down from the acceptance test to the test of an individual class.

We reproduce the error that occurred in the acceptance test in the model test: the error of being unable to find the `blog_posts` table when creating a new instance.

Inner red: PG::UndefinedTable: ERROR:  relation "blog_posts" does not exist


### Create blog posts table [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/0301d014e5a06d42a5bcad57c335247646c38c31)

#### db/migrate/20180110120127_create_blog_posts.rb

```diff
+class CreateBlogPosts < ActiveRecord::Migration[5.1]
+  def change
+    create_table :blog_posts do |t|
+    end
+  end
+end
```

We fix the model test error by creating the `blog_posts` table.

```
Inner green; outer red: undefined method `title' for #<BlogPost id: nil>
```

Now the `BlogPost` can be instantiated, so the model test passes. We step back up to the acceptance test level and rerun it, and it's gotten past that error.

The next acceptance test error occurs when Rails attempts to render the form. The form helper tries to get the current value of the `title` field on the model, but there is no `title` method to retrieve it. Since we want `title` to be a database-persisted field on our model, the problem is that there is no `title` column in our database table.


### Specify blog post accessors [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/ebca7c3cebe62a3d225ef8aee012cfc2f294400b)

#### spec/models/blog_post_spec.rb

```diff
     expect{ blog_post = BlogPost.new }.not_to raise_error
   end

+  it "defaults fields to nil" do
+    blog_post = BlogPost.new
+
+    expect(blog_post.title).to be_nil
+    expect(blog_post.body).to be_nil
+  end
+
 end
```

Once again, rather than fixing the acceptance error directly, we drop down to the model test level to reproduce the error. We specify that we want a `title` field--as well as a `body` field, since we know we'll need that and it feels safe to go ahead and add it. The behavior we want is that we want those fields to be `nil` for a new model instance.

```
Inner red: undefined method `title' for #<BlogPost id: nil>
```

With this specification, we've reproduced the error from the acceptance test.


### Add columns to blog posts [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/ca241c13493d5d7b242163b898684cf07c96d81e)

#### db/migrate/20160614163119_add_title_and_body_to_blog_posts.rb

```diff
+class AddTitleAndBodyToBlogPosts < ActiveRecord::Migration[5.1]
+  def change
+    add_column :blog_posts, :title, :string, null: false
+    add_column :blog_posts, :body, :text, null: false
+  end
+end
```

We create a new migration to add the title and body column to the blog posts table.

Inner green; outer red: The action 'create' could not be found for BlogPostsController

With this, the model test passes, so we step back up to the acceptance test level and rerun it. The acceptance test moves on to the next error: the form is rendered, the fields are populated, it submits the form, but Rails doesn't find a `create` action on the controller to submit it to.


### Add create method to blog post controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/3a3c51755b7b77d34662abaaff1753e52392b310)

#### app/controllers/blog_posts_controller.rb

```diff
   def new
     @blog_post = BlogPost.new
   end
+
+  def create
+  end
 end
```

We add the `create` method to the blog post controller directly, then rerun the acceptance test.

Outer red: Unable to find xpath "/html"

The error we get is a bit obscure, but effectively it means the acceptance test can't even find an HTML document returned to search within. Unlike with the `new` action, with the `create` action, if no explicit render or redirect happens, Rails 5 does not return an error that a template is missing; it just returns empty content.


### Add blog post create template [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/f1f3772463e4e7a86155e093c02c837cb1280b45)

#### app/views/blog_posts/create.html.erb

```diff
+<%# empty view %>
```

Usually a `create` action would redirect to another route instead of rendering a template directly. But for the sake of keeping this tutorial simple, we'll just go ahead and render it--so we add a `create` template file. We leave it empty since that's all we need to do to get past the current error.

Outer red: expected to find text "Hello, World!" in ""

The next error is that, after submitting the blog post, the acceptance test expects to see the title of the post somewhere on the page, but it doesn't see it--because we haven't actually rendered any content at all.


### Render blog post on create page [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/edfcb21d7b7028517adc000cc246a6646ccfcde7)

#### app/controllers/blog_posts_controller.rb

```diff
   end

   def create
+    @blog_post = BlogPost.new(params[:blog_post])
   end
 end
```


#### app/views/blog_posts/create.html.erb

```diff
-<%# empty view %>
+<h1><%= @blog_post.title %></h1>
+
+<div>
+  <%= @blog_post.body %>
+</div>
```

To get the blog post content rendered in the view, we attempt to create a new BlogPost instance with the passed-in form params.

We don't yet attempt to save it to the database because the acceptance test hasn't led us there yet. All it's said is that we need an object on the `create` page that responds to a `title` method (and a `body` method). That doesn't require us to save anything to the database: all that requires is us instantiating an object.

Outer red: ActiveModel::ForbiddenAttributesError

Attempting to instantiate a BlogPost leads to a new error: Rails' "strong parameters" security feature means that we can't just pass user-submitted params directly into a model; that could result in users hacking our system by setting fields they shouldn't be able to, like the user a post belongs to.


### Switch to strong params for blog post creation [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/a900a09bfa56b9b8e9bdbebc548464bd46941a82)

#### app/controllers/blog_posts_controller.rb

```diff
   end

   def create
-    @blog_post = BlogPost.new(params[:blog_post])
+    @blog_post = BlogPost.new(blog_post_params)
+  end
+
+  private
+
+  def blog_post_params
+    params.require(:blog_post).permit(:title, :body)
   end
 end
```

We fix the error by using the conventional Rails strong parameters approach of creating a private controller method that specifies which parameters are permitted. Because this is conventionally done in the controller, we don't need to step down to any kind of unit test--letting the acceptance test drive this code is fine.

Outer red: undefined method `title' for nil:NilClass

The next error isn't quite as readable as most we've gotten. What's going on is that the acceptance test attempts to load the last-saved `BlogPost` from the database, but none are saved, so we get `nil` back instead. When we try to check the `title` field, we get an error that there is no `title` method on `nil`. So the actual error is that no blog post is found in the database.


### Save blog post to database [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/40ffedd91944fbb675ae72ec16d2e8e51ce15650)

#### app/controllers/blog_posts_controller.rb

```diff
   end

   def create
-    @blog_post = BlogPost.new(blog_post_params)
+    @blog_post = BlogPost.create(blog_post_params)
   end

   private
```

We fix this error by `create`ing a `BlogPost` in the database instead of just instantiating one in memory.

Outer green

With thise, our acceptance test is passing. We've successfully allowed the acceptance test to drive us through implementing a complete feature!

## More Resources

To learn more about TDD, I recommend:

* [_Effective Testing with RSpec 3_](https://pragprog.com/book/rspec3/effective-testing-with-rspec-3)
* [*Growing Object-Oriented Software, Guided by Tests*](http://www.informit.com/store/growing-object-oriented-software-guided-by-tests-9780321503626) - The original work on the style of TDD we describe here, mockist TDD. It has a lot of great detail, not just about testing, but also how it influences design and project methodology.
* [_Rails 5 Test Prescriptions_](https://pragprog.com/titles/nrtest3/rails-5-test-prescriptions/) by Noel Rappin

If you have any questions or suggestions, reach out to [@CodingItWrong](https://twitter.com/CodingItWrong) on Twitter or <tdd@codingitwrong.com> and we'll be glad to help!
