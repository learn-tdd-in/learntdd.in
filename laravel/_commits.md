### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/eb338bbad7e41cb0972acc2469a0eb189a658d2c) Specify the feature for creating a blog post

Red: A request to [http://localhost/blog-posts/create] failed. Received status code [404].

We start by writing out an acceptance test for the full feature we want to implement. In this case, we want to visit a blog post creation page, enter a title and body, save it, and then see on the results page that title and body, as well as confirming it's in the database.

We also configure the testing environment to use a different database than the development environment, so that it won't overwrite development data.

The first error we get is that there is no `blog-posts/create` route.

#### .env.testing

```diff
@@ -0,0 +1,26 @@
+APP_ENV=local
+APP_DEBUG=true
+APP_KEY=base64:mpiRgjLlPqdGpsLxSLazw/w7a5TpAEzsUHglECLOfUk=
+APP_URL=http://localhost
+
+DB_CONNECTION=mysql
+DB_HOST=127.0.0.1
+DB_PORT=3306
+DB_DATABASE=laravel-tdd-testing
+DB_USERNAME=homestead
+DB_PASSWORD=secret
+
+CACHE_DRIVER=file
+SESSION_DRIVER=file
+QUEUE_DRIVER=sync
+
+REDIS_HOST=127.0.0.1
+REDIS_PASSWORD=null
+REDIS_PORT=6379
+
+MAIL_DRIVER=smtp
+MAIL_HOST=mailtrap.io
+MAIL_PORT=2525
+MAIL_USERNAME=null
+MAIL_PASSWORD=null
+MAIL_ENCRYPTION=null
```


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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/8aeb8dd17e9112ca726a82b4208ffdbc34004b4b) Add blog posts resource route

Red: Class App\Http\Controllers\BlogPostsController does not exist

We add the route, but we don't just write the simplest code possible to get the test to pass; we "write the code we wish we had." In this case, we wish we had a blog posts controller, so we create a resource route and point to that controller by name. The next error we get is that that controller doesn't exist.

#### app/Http/routes.php

```diff
@@ -14,3 +14,5 @@
 Route::get('/', function () {
     return view('welcome');
 });
+
+Route::resource('blog-posts', 'BlogPostsController');
```

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/4f4d2579f54c6565a7c4930ee05c629db108798f) Add empty blog posts controller

Red: Method App\Http\Controllers\BlogPostsController::create() does not exist

We add an empty controller that inherits from our app's base controller class. We could have gotten past this error message by creating a class that didn't inherit from anything, but in this case we're so sure we'll inherit from the base controller class that we can go ahead and do it.

The acceptance test can now find the controller, but not a create action on it.

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/ea3991e6f9ee2f507b1df92df479e95b9a920500) Add `create` action to blog posts controller

Red: Nothing matched the filter [Title] CSS query provided

Laravel is now able to render the create page, but when the test looks for a "Title" field to fill in, it can't find one, because we haven't rendered any output yet.

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/01554c412ad384d4044ce386dc55f21a46d64fe7) Add form template with fields and submit button

Red: Undefined variable: post

Instead of just adding the title field, we go ahead and add the entire form, including the body field and the submit button. This is more than is strictly necessary to get the current error to pass, but it seems reasonable. You'll never have acceptance tests drive out every detail of your template markup anyway. We also go ahead and use Laravel Collective's form helpers instead of creating the markup by hand.

The next error we get is that the `$post` variable we attempt to pass into the form doesn't exist.

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


#### composer.lock

```diff
@@ -4,8 +4,8 @@
         "Read more about it at https://getcomposer.org/doc/01-basic-usage.md#composer-lock-the-lock-file",
         "This file is @generated automatically"
     ],
-    "hash": "c284a9c122da36c99a8b6597bdce7aa6",
-    "content-hash": "8b1485987e7c5949da82435d403e52e8",
+    "hash": "e9a8339d51c94a365c1193414479294f",
+    "content-hash": "0feb6af5bef0e094e776fba476c27e7c",
     "packages": [
         {
             "name": "classpreloader/classpreloader",
@@ -436,6 +436,60 @@
             "time": "2016-06-06 15:18:48"
         },
         {
+            "name": "laravelcollective/html",
+            "version": "v5.2.4",
+            "source": {
+                "type": "git",
+                "url": "https://github.com/LaravelCollective/html.git",
+                "reference": "3a312d39ffe37da0f57b602618b61fd07c1fcec5"
+            },
+            "dist": {
+                "type": "zip",
+                "url": "https://api.github.com/repos/LaravelCollective/html/zipball/3a312d39ffe37da0f57b602618b61fd07c1fcec5",
+                "reference": "3a312d39ffe37da0f57b602618b61fd07c1fcec5",
+                "shasum": ""
+            },
+            "require": {
+                "illuminate/http": "5.2.*",
+                "illuminate/routing": "5.2.*",
+                "illuminate/session": "5.2.*",
+                "illuminate/support": "5.2.*",
+                "illuminate/view": "5.2.*",
+                "php": ">=5.5.9"
+            },
+            "require-dev": {
+                "illuminate/database": "5.2.*",
+                "mockery/mockery": "~0.9",
+                "phpunit/phpunit": "~4.0"
+            },
+            "type": "library",
+            "autoload": {
+                "psr-4": {
+                    "Collective\\Html\\": "src/"
+                },
+                "files": [
+                    "src/helpers.php"
+                ]
+            },
+            "notification-url": "https://packagist.org/downloads/",
+            "license": [
+                "MIT"
+            ],
+            "authors": [
+                {
+                    "name": "Taylor Otwell",
+                    "email": "taylorotwell@gmail.com"
+                },
+                {
+                    "name": "Adam Engebretson",
+                    "email": "adam@laravelcollective.com"
+                }
+            ],
+            "description": "HTML and Form Builders for the Laravel Framework",
+            "homepage": "http://laravelcollective.com",
+            "time": "2016-01-27 22:29:54"
+        },
+        {
             "name": "league/flysystem",
             "version": "1.0.24",
             "source": {
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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/b0342f94cf6ec9207bbc747a4a12894113078340) Add blog post variable assignment in controller

Red: Class 'App\BlogPost' not found

We pass a `$post` variable into the view from the controller, sending it a `BlogPost` instance. Next we get an error that the `BlogPost` class doesn't exist yet.

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/985ddcb8e908c76ed6f71173d4f6114c2b253c40) Add blog post model

Red: Method App\Http\Controllers\BlogPostsController::store() does not exist

Now that the BlogPost model exists, the controller is able to render the view, and the test is able to submit the form to the `store` route. The next error is that there is no `store` action configured on the controller.

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/9d69e40315259ef9e554201a3d6460c5289f3a35) Add store method to blog posts controller

Red: The current node list is empty.

There is now a `store` action on the controller, but when the test attempts to look for content on the page, there is no content rendered.

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/d925ed9f2ffd71790201bd2c41db4161b24a9c1f) Render store page

Red: Failed asserting that the page contains the HTML [Hello, World!]

We do just enough to get past the current error: we add a store view with some dummy content, and render it from the `store` action. Normally you would redirect from a `store` action to another route, but for the purposes of this test we'll just render content directly.

Now that content is showing up, the test fails when it can't find the post title on the page.

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/57437cfa62d2f5d7f6e8f1d1bd1b70fc0ea81efe) Render blog post on store page

Red: Undefined variable: blogPost

We add markup to output the blog post's title and body, but we get an error that there is no `$blogPost` variable sent to the view template.

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/b253d9bbe22a5112ff74ff6ec4b068637626b34c) Creates blog post for the view

Red: Illuminate\Database\Eloquent\MassAssignmentException: title

We create a BlogPost instance with the submitted form data and pass it to the view. We do mass assignment since that's the most convenient approach, but the model throws an exception because by default it disallows mass assignment for all fields.

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/557d697bb6a0d6c209b98b1d521c46773edc979c) Specify the model should allow mass assignment

Inner Red: Illuminate\Database\Eloquent\MassAssignmentException: title

Since enabling fields for mass assignment is a logic change to the BlogPost class, we create a unit test for it to specify this behavior. We reproduce the error happening at the acceptance level.

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/1ff43118e76fe33058c929959bc57f1f22181685) Allow title and body to be mass-assigned

Inner green; outer red: PDOException: SQLSTATE[42S02]: Base table or view not found: 1146 Table 'laravel-tdd-testing.blog_posts' doesn't exist

We add mass assignment support for the title and body fields, satisfying the unit test. Now the acceptance test throws an exception that the table for the model is not found. We're finally hitting the database!

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/979b7fe0de7b30a613d350d4a47ce3b6674b1b02) Create blog posts table

Outer red: Trying to get property of non-object

Now that the acceptance test is able to access a `blog_posts` table, it gives this unhelpful message. What's going on is that the `BlogPost::first()` call returns null, because no post is actually saved to the database.

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

### [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/laravel/commit/6f79261d7624799a6f87297ff8f1cf926513fe74) Save blog post to database

Outer green

We change the `store` action to not only instantiate a `BlogPost`, but also save it to the database. With that, all our tests are passing and our feature is done. We've successfully used an acceptance test to drive our design of this feature!

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
