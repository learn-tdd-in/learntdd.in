### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/3589775872c38dba6c067ffaf3cec87ca9aad53e)

#### tests/features/CreatingABlogPostTest.php

```diff
{% raw %}+<?php
+
+use Illuminate\Foundation\Testing\DatabaseMigrations;
+use App\BlogPost;
+
+class CreatingABlogPostTest extends TestCase
+{
+  use DatabaseMigrations;
+
+  /**
+   * A basic functional test example.
+   *
+   * @return void
+   */
+  public function testCreatingABlogPost()
+  {
+    $this->visit('/blog-posts/create')
+         ->type('Hello, World!', 'title')
+         ->type('Hello, I say!', 'body')
+         ->press('Create Blog Post')
+         ->see('Hello, World!')
+         ->see('Hello, I say!');
+
+    $post = BlogPost::first();
+    $this->assertEquals($post->title, 'Hello, World!');
+    $this->assertEquals($post->body, 'Hello, I say!');
+  }
+}{% endraw %}
```

We start by writing out an acceptance test for the full feature we want to implement. In this case, we want to visit a blog post creation page, enter a title and body, save it, and then see on the results page that title and body, as well as confirming it's in the database.

Red: A request to [http://localhost/blog-posts/create] failed. Received status code [404].

The first error we get is that there is no `blog-posts/create` route.


### Add blog posts resource route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/7a0980626f4f716350003ce4b2449e4bb56c42f4)

#### app/Http/routes.php

```diff
{% raw %} Route::get('/', function () {
     return view('welcome');
 });
+
+Route::resource('blog-posts', 'BlogPostsController');{% endraw %}
```

We add the route, but we don't just write the simplest code possible to get the test to pass; we "write the code we wish we had." In this case, we wish we had a blog posts controller, so we create a resource route and point to that controller by name.

Red: Class App\Http\Controllers\BlogPostsController does not exist

The next error we get is that that controller doesn't exist.


### Add empty blog posts controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/421d2f5bedc6f1f104424eb6de6975fc602e19b0)

#### app/Http/Controllers/BlogPostsController.php

```diff
{% raw %}+<?php
+
+namespace App\Http\Controllers;
+
+class BlogPostsController extends Controller {
+  
+}{% endraw %}
```

We add an empty controller that inherits from our app's base controller class. We could have gotten past this error message by creating a class that didn't inherit from anything, but in this case we're so sure we'll inherit from the base controller class that we can go ahead and do it.

Red: Method App\Http\Controllers\BlogPostsController::create() does not exist

The acceptance test can now find the controller, but not a create action on it.


### Add `create` action to blog posts controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/947989d9275408808e7068882e7172b3e79467ef)

#### app/Http/Controllers/BlogPostsController.php

```diff
{% raw %} namespace App\Http\Controllers;
 
 class BlogPostsController extends Controller {
-  
+
+  function create() {
+    
+  }
+
 }{% endraw %}
```

Red: Nothing matched the filter [Title] CSS query provided

Laravel is now able to render the create page, but when the test looks for a "Title" field to fill in, it can't find one, because we haven't rendered any output yet.


### Add form template with fields and submit button [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/056c2ebe6e3b980d02474de7b2300a30d1fe9ccd)

#### app/Http/Controllers/BlogPostsController.php

```diff
{% raw %} class BlogPostsController extends Controller {
 
   function create() {
-    
+    return view('blog-posts.create');
   }
 
 }{% endraw %}
```


#### composer.json

```diff
{% raw %}     "type": "project",
     "require": {
         "php": ">=5.5.9",
-        "laravel/framework": "5.2.*"
+        "laravel/framework": "5.2.*",
+        "laravelcollective/html": "5.2.*"
     },
     "require-dev": {
         "fzaninotto/faker": "~1.4",{% endraw %}
```


#### config/app.php

```diff
{% raw %}         App\Providers\EventServiceProvider::class,
         App\Providers\RouteServiceProvider::class,
 
+       /*
+        * Third party service providers
+        */
+       Collective\Html\HtmlServiceProvider::class,
     ],
 
     /*
...
         'Validator' => Illuminate\Support\Facades\Validator::class,
         'View' => Illuminate\Support\Facades\View::class,
 
+        /*
+         * Third party aliases
+         */
+        'Form' => Collective\Html\FormFacade::class,
+        'Html' => Collective\Html\HtmlFacade::class,
     ],
 
 ];{% endraw %}
```


#### resources/views/blog-posts/create.blade.php

```diff
{% raw %}+{!! Form::model($post, ['route' => 'blog-posts.store']) !!}
+    <div>
+      {!! Form::label('title') !!}
+      {!! Form::text('title') !!}
+    </div>
+    <div>
+      {!! Form::label('body') !!}
+      {!! Form::textarea('body') !!}
+    </div>
+    {!! Form::submit('Create Blog Post') !!}
+{!! Form::close() !!}{% endraw %}
```

Instead of just adding the title field, we go ahead and add the entire form, including the body field and the submit button. This is more than is strictly necessary to get the current error to pass, but it seems reasonable. You'll never have acceptance tests drive out every detail of your template markup anyway. We also go ahead and use Laravel Collective's form helpers instead of creating the markup by hand.

Red: Undefined variable: post

The next error we get is that the `$post` variable we attempt to pass into the form doesn't exist.


### Add blog post variable assignment in controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/061eea7b53853769472bb05d7ca9cec1b9cb52ca)

#### app/Http/Controllers/BlogPostsController.php

```diff
{% raw %} <?php
 
 namespace App\Http\Controllers;
+use App\BlogPost;
 
 class BlogPostsController extends Controller {
 
   function create() {
-    return view('blog-posts.create');
+    return view('blog-posts.create', ['post' => new BlogPost]);
   }
 
 }{% endraw %}
```

We pass a `$post` variable into the view from the controller, sending it a `BlogPost` instance.

Red: Class 'App\BlogPost' not found

Next we get an error that the `BlogPost` class doesn't exist yet.


### Add blog post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/e215897ecfc595a17b5d2c05cd3f046262b9e663)

#### app/BlogPost.php

```diff
{% raw %}+<?php
+
+namespace App;
+
+use Illuminate\Database\Eloquent\Model;
+
+class BlogPost extends Model
+{
+    //
+}{% endraw %}
```

Now that the BlogPost model exists, the controller is able to render the view, and the test is able to submit the form to the `store` route.

Red: Method App\Http\Controllers\BlogPostsController::store() does not exist

The next error is that there is no `store` action configured on the controller.


### Add store method to blog posts controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/ce2943f92df5fe3e67a73d7d5fd74edb7db20177)

#### app/Http/Controllers/BlogPostsController.php

```diff
{% raw %}     return view('blog-posts.create', ['post' => new BlogPost]);
   }
 
+  function store() {
+    
+  }
+
 }{% endraw %}
```

Red: The current node list is empty.

There is now a `store` action on the controller, but when the test attempts to look for content on the page, there is no content rendered.


### Render store page [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/5a0d49205b72c2beb5dc17c38eb84e1ba96efd8f)

#### app/Http/Controllers/BlogPostsController.php

```diff
{% raw %}   }
 
   function store() {
-    
+    return view('blog-posts.store');
   }
 
 }{% endraw %}
```


#### resources/views/blog-posts/store.blade.php

```diff
{% raw %}+hi{% endraw %}
```

We do just enough to get past the current error: we add a store view with some dummy content, and render it from the `store` action. Normally you would redirect from a `store` action to another route, but for the purposes of this test we'll just render content directly.

Red: Failed asserting that the page contains the HTML [Hello, World!]

Now that content is showing up, the test fails when it can't find the post title on the page.


### Render blog post on store page [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/ee272c3d35d594e61a4ec7d49fdef15685ac9000)

#### resources/views/blog-posts/store.blade.php

```diff
{% raw %}-hi
+<h1>{{ $blogPost->title }}</h1>
+
+<div>
+  {{ $blogPost->body }}
+</div>{% endraw %}
```

We add markup to output the blog post's title and body.

Red: Undefined variable: blogPost

Now we get an error that there is no `$blogPost` variable sent to the view template.


### Creates blog post for the view [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/f5fbb6c81b51bd1f6eb141bd815c5ef93297b8d1)

#### app/Http/Controllers/BlogPostsController.php

```diff
{% raw %} <?php
 
 namespace App\Http\Controllers;
+use Illuminate\Http\Request;
 use App\BlogPost;
 
 class BlogPostsController extends Controller {
...
     return view('blog-posts.create', ['post' => new BlogPost]);
   }
 
-  function store() {
-    return view('blog-posts.store');
+  function store(Request $request) {
+    $blogPost = new BlogPost($request->only(['title', 'body']));
+    return view('blog-posts.store', ['blogPost' => $blogPost]);
   }
 
 }{% endraw %}
```

We create a BlogPost instance with the submitted form data and pass it to the view. We do mass assignment since that's the most convenient approach.

Red: Illuminate\Database\Eloquent\MassAssignmentException: title

There's a problem with the mass assignment, though: the model throws an exception because by default it disallows mass assignment for all fields.


### Specify the model should allow mass assignment [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/c866611d841968207a3f53fa24ea6ee7bd6de722)

#### tests/models/BlogPostTest.php

```diff
{% raw %}+<?php
+
+use App\BlogPost;
+
+class BlogPostTest extends TestCase
+{
+
+  /** @test */
+  public function itAllowsAssigningAllPublicFields()
+  {
+    $fields = [ 'title' => 'My Title', 'body' => 'This is the body.' ];
+
+    $post = new BlogPost($fields);
+
+    $this->assertEquals('My Title', $post->title);
+    $this->assertEquals('This is the body.', $post->body);
+  }
+
+}{% endraw %}
```

Since enabling fields for mass assignment is a logic change to the BlogPost class, we create a unit test for it to specify this behavior. We reproduce the error happening at the acceptance level.

Inner Red: Illuminate\Database\Eloquent\MassAssignmentException: title


### Allow title and body to be mass-assigned [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/d8774a938563723ea0f350f5ca566d3f012c7d8b)

#### app/BlogPost.php

```diff
{% raw %} 
 class BlogPost extends Model
 {
-    //
+    protected $fillable = ['title', 'body'];
 }{% endraw %}
```


#### tests/models/BlogPostTest.php

```diff
{% raw %} <?php
 
+use Illuminate\Foundation\Testing\DatabaseMigrations;
 use App\BlogPost;
 
 class BlogPostTest extends TestCase
 {
+  use DatabaseMigrations;
 
   /** @test */
   public function itAllowsAssigningAllPublicFields(){% endraw %}
```

We add mass assignment support for the title and body fields.

Inner green; outer red: PDOException: SQLSTATE[42S02]: Base table or view not found: 1146 Table 'laravel-tdd-testing.blog_posts' doesn't exist

Now the unit test is satisfied, and the acceptance test throws an exception that the table for the model is not found. We're finally hitting the database!


### Create blog posts table [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/df201c3ee56665757ede848278e6688e72c2d226)

#### database/migrations/2016_06_10_205256_create_blog_posts_table.php

```diff
{% raw %}+<?php
+
+use Illuminate\Database\Schema\Blueprint;
+use Illuminate\Database\Migrations\Migration;
+
+class CreateBlogPostsTable extends Migration
+{
+    /**
+     * Run the migrations.
+     *
+     * @return void
+     */
+    public function up()
+    {
+        Schema::create('blog_posts', function (Blueprint $table) {
+            $table->increments('id');
+
+            $table->string('title');
+            $table->text('body');
+
+            $table->timestamps();
+        });
+    }
+
+    /**
+     * Reverse the migrations.
+     *
+     * @return void
+     */
+    public function down()
+    {
+        Schema::drop('blog_posts');
+    }
+}{% endraw %}
```

Outer red: Trying to get property of non-object

Now that the acceptance test is able to access a `blog_posts` table, it gives this unhelpful message. What's going on is that the `BlogPost::first()` call returns null, because no post is actually saved to the database.


### Save blog post to database [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/da088e4b3693319efcc66cf0c7b7f93da8c6b48d)

#### app/Http/Controllers/BlogPostsController.php

```diff
{% raw %}   }
 
   function store(Request $request) {
-    $blogPost = new BlogPost($request->only(['title', 'body']));
+    $blogPost = BlogPost::create($request->only(['title', 'body']));
     return view('blog-posts.store', ['blogPost' => $blogPost]);
   }
 {% endraw %}
```

We change the `store` action to not only instantiate a `BlogPost`, but also save it to the database.

Outer green

With that, all our tests are passing and our feature is done. We've successfully used an acceptance test to drive our design of this feature!

