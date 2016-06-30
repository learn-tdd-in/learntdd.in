### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/b0777fb9e0e358025fc0a43f1ceff5e17d7db6f9)

#### tests/features/CreatingABlogPostTest.php

```diff
@@ -0,0 +1,28 @@
+<?php
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
+}
```

Red: A request to [http://localhost/blog-posts/create] failed. Received status code [404].

We start by writing out an acceptance test for the full feature we want to implement. In this case, we want to visit a blog post creation page, enter a title and body, save it, and then see on the results page that title and body, as well as confirming it's in the database.

The first error we get is that there is no `blog-posts/create` route.


### Add blog posts resource route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/936f16b0246fc7fceedf58f9e0c440ace70525b5)

#### app/Http/routes.php

```diff
@@ -14,3 +14,5 @@
 Route::get('/', function () {
     return view('welcome');
 });
+
+Route::resource('blog-posts', 'BlogPostsController');
```

Red: Class App\Http\Controllers\BlogPostsController does not exist

We add the route, but we don't just write the simplest code possible to get the test to pass; we "write the code we wish we had." In this case, we wish we had a blog posts controller, so we create a resource route and point to that controller by name. The next error we get is that that controller doesn't exist.


### Add empty blog posts controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/8a0f9bc59a5acab57a1948551476e27882f4994c)

#### app/Http/Controllers/BlogPostsController.php

```diff
@@ -0,0 +1,7 @@
+<?php
+
+namespace App\Http\Controllers;
+
+class BlogPostsController extends Controller {
+  
+}
```

Red: Method App\Http\Controllers\BlogPostsController::create() does not exist

We add an empty controller that inherits from our app's base controller class. We could have gotten past this error message by creating a class that didn't inherit from anything, but in this case we're so sure we'll inherit from the base controller class that we can go ahead and do it.

The acceptance test can now find the controller, but not a create action on it.


### Add `create` action to blog posts controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/2ec29866538a62229d736a720f6fe49afee004cf)

#### app/Http/Controllers/BlogPostsController.php

```diff
@@ -3,5 +3,9 @@
 namespace App\Http\Controllers;
 
 class BlogPostsController extends Controller {
-  
+
+  function create() {
+    
+  }
+
 }
```

Red: Nothing matched the filter [Title] CSS query provided

Laravel is now able to render the create page, but when the test looks for a "Title" field to fill in, it can't find one, because we haven't rendered any output yet.


### Add form template with fields and submit button [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/e67c029be8a86f2818ea0b7be5a3d44fa3f7ed59)

#### app/Http/Controllers/BlogPostsController.php

```diff
@@ -5,7 +5,7 @@
 class BlogPostsController extends Controller {
 
   function create() {
-    
+    return view('blog-posts.create');
   }
 
 }
```


#### composer.json

```diff
@@ -6,7 +6,8 @@
     "type": "project",
     "require": {
         "php": ">=5.5.9",
-        "laravel/framework": "5.2.*"
+        "laravel/framework": "5.2.*",
+        "laravelcollective/html": "5.2.*"
     },
     "require-dev": {
         "fzaninotto/faker": "~1.4",
```


#### config/app.php

```diff
@@ -156,6 +156,10 @@
         App\Providers\EventServiceProvider::class,
         App\Providers\RouteServiceProvider::class,
 
+       /*
+        * Third party service providers
+        */
+       Collective\Html\HtmlServiceProvider::class,
     ],
 
     /*
@@ -202,6 +206,11 @@
         'Validator' => Illuminate\Support\Facades\Validator::class,
         'View' => Illuminate\Support\Facades\View::class,
 
+        /*
+         * Third party aliases
+         */
+        'Form' => Collective\Html\FormFacade::class,
+        'Html' => Collective\Html\HtmlFacade::class,
     ],
 
 ];
```


#### resources/views/blog-posts/create.blade.php

```diff
@@ -0,0 +1,11 @@
+{!! Form::model($post, ['route' => 'blog-posts.store']) !!}
+    <div>
+      {!! Form::label('title') !!}
+      {!! Form::text('title') !!}
+    </div>
+    <div>
+      {!! Form::label('body') !!}
+      {!! Form::textarea('body') !!}
+    </div>
+    {!! Form::submit('Create Blog Post') !!}
+{!! Form::close() !!}
```

Red: Undefined variable: post

Instead of just adding the title field, we go ahead and add the entire form, including the body field and the submit button. This is more than is strictly necessary to get the current error to pass, but it seems reasonable. You'll never have acceptance tests drive out every detail of your template markup anyway. We also go ahead and use Laravel Collective's form helpers instead of creating the markup by hand.

The next error we get is that the `$post` variable we attempt to pass into the form doesn't exist.


### Add blog post variable assignment in controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/27dc161694d34f118300fc2f0f304553f5f20732)

#### app/Http/Controllers/BlogPostsController.php

```diff
@@ -1,11 +1,12 @@
 <?php
 
 namespace App\Http\Controllers;
+use App\BlogPost;
 
 class BlogPostsController extends Controller {
 
   function create() {
-    return view('blog-posts.create');
+    return view('blog-posts.create', ['post' => new BlogPost]);
   }
 
 }
```

Red: Class 'App\BlogPost' not found

We pass a `$post` variable into the view from the controller, sending it a `BlogPost` instance. Next we get an error that the `BlogPost` class doesn't exist yet.


### Add blog post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/e4898970df3032269b9bb8ec792c1dca394034b2)

#### app/BlogPost.php

```diff
@@ -0,0 +1,10 @@
+<?php
+
+namespace App;
+
+use Illuminate\Database\Eloquent\Model;
+
+class BlogPost extends Model
+{
+    //
+}
```

Red: Method App\Http\Controllers\BlogPostsController::store() does not exist

Now that the BlogPost model exists, the controller is able to render the view, and the test is able to submit the form to the `store` route. The next error is that there is no `store` action configured on the controller.


### Add store method to blog posts controller [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/8ce1dc27efa6e88fa60198cf55d80333f65d2ad3)

#### app/Http/Controllers/BlogPostsController.php

```diff
@@ -9,4 +9,8 @@ function create() {
     return view('blog-posts.create', ['post' => new BlogPost]);
   }
 
+  function store() {
+    
+  }
+
 }
```

Red: The current node list is empty.

There is now a `store` action on the controller, but when the test attempts to look for content on the page, there is no content rendered.


### Render store page [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/fcaa6b0249af755f4e36f83e94c30b71a4236d38)

#### app/Http/Controllers/BlogPostsController.php

```diff
@@ -10,7 +10,7 @@ function create() {
   }
 
   function store() {
-    
+    return view('blog-posts.store');
   }
 
 }
```


#### resources/views/blog-posts/store.blade.php

```diff
@@ -0,0 +1 @@
+hi
```

Red: Failed asserting that the page contains the HTML [Hello, World!]

We do just enough to get past the current error: we add a store view with some dummy content, and render it from the `store` action. Normally you would redirect from a `store` action to another route, but for the purposes of this test we'll just render content directly.

Now that content is showing up, the test fails when it can't find the post title on the page.


### Render blog post on store page [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/a10118cd49de340d3a936c13942e007903d9671b)

#### resources/views/blog-posts/store.blade.php

```diff
@@ -1 +1,5 @@
-hi
+<h1>{{ $blogPost->title }}</h1>
+
+<div>
+  {{ $blogPost->body }}
+</div>
```

Red: Undefined variable: blogPost

We add markup to output the blog post's title and body, but we get an error that there is no `$blogPost` variable sent to the view template.


### Creates blog post for the view [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/80027bcb1ee88519ab251f7f7261af7b95358289)

#### app/Http/Controllers/BlogPostsController.php

```diff
@@ -1,6 +1,7 @@
 <?php
 
 namespace App\Http\Controllers;
+use Illuminate\Http\Request;
 use App\BlogPost;
 
 class BlogPostsController extends Controller {
@@ -9,8 +10,9 @@ function create() {
     return view('blog-posts.create', ['post' => new BlogPost]);
   }
 
-  function store() {
-    return view('blog-posts.store');
+  function store(Request $request) {
+    $blogPost = new BlogPost($request->only(['title', 'body']));
+    return view('blog-posts.store', ['blogPost' => $blogPost]);
   }
 
 }
```

Red: Illuminate\Database\Eloquent\MassAssignmentException: title

We create a BlogPost instance with the submitted form data and pass it to the view. We do mass assignment since that's the most convenient approach, but the model throws an exception because by default it disallows mass assignment for all fields.


### Specify the model should allow mass assignment [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/bfedbfc863a854d399c446260fb92c50f3dc5bce)

#### tests/models/BlogPostTest.php

```diff
@@ -0,0 +1,19 @@
+<?php
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
+}
```

Inner Red: Illuminate\Database\Eloquent\MassAssignmentException: title

Since enabling fields for mass assignment is a logic change to the BlogPost class, we create a unit test for it to specify this behavior. We reproduce the error happening at the acceptance level.


### Allow title and body to be mass-assigned [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/197e5133cc1bf7aa249e77449201f580409d4a00)

#### app/BlogPost.php

```diff
@@ -6,5 +6,5 @@
 
 class BlogPost extends Model
 {
-    //
+    protected $fillable = ['title', 'body'];
 }
```


#### tests/models/BlogPostTest.php

```diff
@@ -1,9 +1,11 @@
 <?php
 
+use Illuminate\Foundation\Testing\DatabaseMigrations;
 use App\BlogPost;
 
 class BlogPostTest extends TestCase
 {
+  use DatabaseMigrations;
 
   /** @test */
   public function itAllowsAssigningAllPublicFields()
```

Inner green; outer red: PDOException: SQLSTATE[42S02]: Base table or view not found: 1146 Table 'laravel-tdd-testing.blog_posts' doesn't exist

We add mass assignment support for the title and body fields, satisfying the unit test. Now the acceptance test throws an exception that the table for the model is not found. We're finally hitting the database!


### Create blog posts table [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/37e90adbf24ee71186c0590c6094f6d7ba26e4ec)

#### database/migrations/2016_06_10_205256_create_blog_posts_table.php

```diff
@@ -0,0 +1,34 @@
+<?php
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
+}
```

Outer red: Trying to get property of non-object

Now that the acceptance test is able to access a `blog_posts` table, it gives this unhelpful message. What's going on is that the `BlogPost::first()` call returns null, because no post is actually saved to the database.


### Save blog post to database [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/75e2edc442e180613d0c8349f7b1747ff9cf08fc)

#### app/Http/Controllers/BlogPostsController.php

```diff
@@ -11,7 +11,7 @@ function create() {
   }
 
   function store(Request $request) {
-    $blogPost = new BlogPost($request->only(['title', 'body']));
+    $blogPost = BlogPost::create($request->only(['title', 'body']));
     return view('blog-posts.store', ['blogPost' => $blogPost]);
   }
 
```

Outer green

We change the `store` action to not only instantiate a `BlogPost`, but also save it to the database. With that, all our tests are passing and our feature is done. We've successfully used an acceptance test to drive our design of this feature!

