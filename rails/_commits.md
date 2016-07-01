### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/010ce8c6728bb03094281be2a245105325ff0e14)

#### spec/features/creating_a_blog_post_spec.rb

```diff
+require 'rails_helper'
+
+describe 'Creating a blog post' do
+
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
+
+end
```

Red: No route matches [GET] "/blog_posts/new"

We set up the entire acceptance test at once. This test will guide us through the rest of the unit testing and implementation of the feature.


### Add blog posts resource route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/c609ca3441d16db76fe342c2bbc2375162dfb3f2)

#### config/routes.rb

```diff
 # config/routes.rb
 Rails.application.routes.draw do
+  resources :blog_posts
 end
```

Red: uninitialized constant BlogPostsController

We only change enough code to get to the next error message. Getting past the "no route" error only requires creating the route in the routes file.

Rails allows you to "unit test" routes, but for trivial configuration like this, it's fine to let the acceptance test cover it without stepping down to the unit level.


### Add empty blog posts controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/949d13c84d4fde9ba4911382226e18038bdd70c4)

#### app/controllers/blog_posts_controller.rb

```diff
+class BlogPostsController < ApplicationController
+end
```

Red: The action 'new' could not be found for BlogPostsController

We didn't technically need to subclass ApplicationController to get the test to pass; all we needed was a BlogPostsController class. But since we're sure that BlogPostsController will extend ApplicationController, we can safely go ahead and add that code as well.


### Add `new` action to blog posts controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/46826aa7c1a9aeae8579f00765a2a54502c7234f)

#### app/controllers/blog_posts_controller.rb

```diff
 class BlogPostsController < ApplicationController
+  def new
+  end
 end
```

Red: Missing template blog_posts/new

Again, we only add enough code to get the test to pass.

Even though we didn't ask to render a template, Rails' default behavior for a controller action is to render a corresponding template, so that's the error it's running across next.


### Add new blog post template [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/1b60e9bd52a352505605e1a4fa3eb6b9cb1afc5b)

#### app/views/blog_posts/new.html.erb

```diff
+<%# empty view %>
```

Red: Unable to find field "Title"

The acceptance test is finally able to successfully `visit '/blog_posts/new'` and move on to attempt the next step, which is `fill_in 'Title', with: 'Hello, World!'`.


### Add fields and submit button to form template [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/ae35f50c6c5b5cc6fc50c4e4c451bd98dc6e8530)

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

Red: First argument in form cannot contain nil or be empty

<%= form_for @blog_post do |f| %>

In other words, @blog_post is nil but needs to be a model.

This is another case where all we needed to add to get the test to pass was the title field. But this is a reasonable case where you know what the form will consist of, so you can go ahead and create it all. Plus, your tests will never drive out the full markup of your templates, so you'll need to do that by hand anyway.


### Assign blog post in controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/b485af1f7d86256f37c74e210ffbec64758b2a15)

#### app/controllers/blog_posts_controller.rb

```diff
 class BlogPostsController < ApplicationController
   def new
+    @blog_post = BlogPost.new
   end
 end
```

Red: uninitialized constant BlogPostsController::BlogPost

We attempt to make the acceptance test pass by assigning the @blog_post instance variable in the controller. Note that we don't create a unit test for the controller. Many developers discourage controller tests because controller behavior is so closely related to acceptance test cases. Also, Rails 5 removes some controller test features that result in limiting how effective they can be.

The line of code we added isn't actually able to succeed because there is no class named BlogPost defined yet.


### Add blog post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/004876ae8dfefee35c3c8ed7500277b1d0cd04d1)

#### app/models/blog_post.rb

```diff
+class BlogPost < ApplicationRecord
+end
```

Red: PG::UndefinedTable: ERROR:  relation "blog_posts" does not exist

We add the BlogPost model class. Although we don't strictly need to subclass `ApplicationRecord` to get the acceptance test error to pass, we're sure enough that this will be an Active Record model that it's safe for us to go ahead and subclass it.

Note that we will soon step down from our acceptance test to create a model test, but we don't do it just yet. We write model tests and other lower-level tests to specify behavior, but we haven't reached a behavioral error yet. This is just a structural error: there is no `BlogPost` class. That's simple enough that we can just implement it directly.

Because we subclass `ApplicationRecord`, our call to `BlogPost.new` checks for the existence of a `blog_posts` table (a "relation"), and doesn't find one.


### Specify model should be instantiable [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/25c974c62f24eb8ae9c76a71ae831b417062fbb8)

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

Inner red: PG::UndefinedTable: ERROR:  relation "blog_posts" does not exist

The previous error wasn't enough for us to want to create a `BlogPost` model test, because it was just a structural error: there was no `BlogPost` class. But now we have an error that a `BlogPost` can't be instantiated, which is a logic error: and that means we should create a model test. It's not strictly a unit test because it's not isolated from the database, but it _is_ following the outside-in-testing principle of stepping down from the acceptance test to the test of an individual class.

We reproduce the error that occurred in the acceptance test in the model test: the error of being unable to find the `blog_posts` table when creating a new instance.


### Create blog posts table [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/0f0ec82abcab829dcb08f42e2b4517bc4923cdc6)

#### db/migrate/20160614162712_create_blog_posts.rb

```diff
+class CreateBlogPosts < ActiveRecord::Migration
+  def change
+    create_table :blog_posts do |t|
+    end
+  end
+end
```


#### db/schema.rb

```diff
 #
 # It's strongly recommended that you check this file into your version control system.
 
-ActiveRecord::Schema.define(version: 0) do
+ActiveRecord::Schema.define(version: 20160614162712) do
 
   # These are extensions that must be enabled in order to support this database
   enable_extension "plpgsql"
 
+  create_table "blog_posts", force: :cascade do |t|
+  end
+
 end
```

Inner green; outer red: undefined method `title' for #<BlogPost id: nil>

We fix the model test error by creating the `blog_posts` table. Now the `BlogPost` can be instantiated, so the model test passes. We rerun the acceptance test and it's gotten past that error.

The next acceptance test error occurs when Rails attempts to render the form. The form helper tries to get the current value of the `title` field on the model, but there is no `title` method to retrieve it. Since we want `title` to be a database-persisted field on our model, the problem is that there is no `title` column in our database table.


### Specify blog post accessors [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/7737e86ace6248f5a9ebe1d0004202136f149afe)

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

Inner red: undefined method `title' for #<BlogPost id: nil>

Once again, rather than fixing the acceptance error directly, we drop down to the model test level to reproduce the error. We specify that we want a `title` field--as well as a `body` field, since we know we'll need that and it feels safe to go ahead and add it. The behavior we want is that we want those fields to be `nil` for a new model instance.

With this specification, we've reproduced the error from the acceptance test.


### Add columns to blog posts [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/2ec02e3c71b85ea86543d3e0cb99fdf3d0dc7dc1)

#### db/migrate/20160614163119_add_title_and_body_to_blog_posts.rb

```diff
+class AddTitleAndBodyToBlogPosts < ActiveRecord::Migration
+  def change
+    add_column :blog_posts, :title, :string, null: false
+    add_column :blog_posts, :body, :text, null: false
+  end
+end
```


#### db/schema.rb

```diff
 #
 # It's strongly recommended that you check this file into your version control system.
 
-ActiveRecord::Schema.define(version: 20160614162712) do
+ActiveRecord::Schema.define(version: 20160614163119) do
 
   # These are extensions that must be enabled in order to support this database
   enable_extension "plpgsql"
 
   create_table "blog_posts", force: :cascade do |t|
+    t.string "title", null: false
+    t.text   "body",  null: false
   end
 
 end
```

Inner green; outer red: The action 'create' could not be found for BlogPostsController

We get the model test to pass by creating a new migration to add the title and body column to the blog posts table. With this, the model test passes, and the acceptance test moves on to the next error. The form is rendered, the fields are populated, it submits the form, but Rails doesn't find a `create` action on the controller to submit it to.


### Add create method to blog post controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/1faa431c29d002cb0f686f25eee297138c00e505)

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

Outer red: Missing template blog_posts/create

We add the `create` method to the blog post controller directly, then rerun the acceptance test. The next error is that, like with the `new` action, the `create` action attempts to render a template with the matching name, but doesn't find it.


### Add blog post create template [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/d248c1d843ffa79503713316d1a6da7359ca73f3)

#### app/views/blog_posts/create.html.erb

```diff
+<%# empty view %>
```

Outer red: expected to find text "Hello, World!" in ""

Usually a `create` action would redirect to another route instead of rendering a template directly. But for the sake of keeping this tutorial simple, we'll just go ahead and render it--so we add a `create` template file. We leave it empty since that's all we need to do to get past the current error.

The next error is that, after submitting the blog post, the acceptance test expects to see the title of the post somewhere on the page, but it doesn't see it--because we haven't actually rendered any content at all.


### Render blog post on create page [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/8f484d67fbaf4eaad289ed8ca63dd660dd823e4e)

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

Outer red: ActiveModel::ForbiddenAttributesError

To get the blog post content rendered in the view, we attempt to create a new BlogPost instance with the passed-in form params.

We don't yet attempt to save it to the database because the acceptance test hasn't led us there yet. All it's said is that we need an object on the `create` page that responds to a `title` method (and a `body` method). That doesn't require us to save anything to the database: all that requires is us instantiating an object.

Attempting to instantiate a BlogPost leads to a new error: Rails' "strong parameters" security feature means that we can't just pass user-submitted params directly into a model; that could result in users hacking our system by setting fields they shouldn't be able to, like the user a post belongs to.


### Switch to strong params for blog post creation [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/cf3e40f6b86902950b206741a02e9c795ccac439)

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

Outer red: undefined method `title' for nil:NilClass

We fix the error by using the conventional Rails strong parameters approach of creating a private controller method that specifies which parameters are permitted. Because this is conventionally done in the controller, we don't need to step down to any kind of unit test--letting the acceptance test drive this code is fine.

The next error isn't quite as readable as most we've gotten. What's going on is that the acceptance test attempts to load the last-saved `BlogPost` from the database, but none are saved, so we get `nil` back instead. When we try to check the `title` field, we get an error that there is no `title` method on `nil`. So the actual error is that no blog post is found in the database.


### Save blog post to database [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/rails/commit/36b5a90f4a4d805f0ff770d5876a8bf44137be45)

#### app/controllers/blog_posts_controller.rb

```diff
   end
 
   def create
-    @blog_post = BlogPost.new(blog_post_params)
+    @blog_post = BlogPost.create(blog_post_params)
   end
 
   private
```

Outer green

We fix this error by `create`ing a `BlogPost` in the database instead of just instantiating one in memory. With thise, our acceptance test is passing. We've successfully allowed the acceptance test to drive us through implementing a complete feature!

