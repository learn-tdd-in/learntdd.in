### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/e64efbc3eacca7ad333000a68d9a225b88cc9917)

#### tests/acceptance/creating-a-blog-post-test.js

```diff
+/* jshint expr:true */
+import {
+  describe,
+  it,
+  beforeEach,
+  afterEach
+} from 'mocha';
+import { expect } from 'chai';
+import startApp from '../helpers/start-app';
+import destroyApp from '../helpers/destroy-app';
+
+describe('Acceptance: CreatingABlogPost', function() {
+  let application;
+
+  beforeEach(function() {
+    application = startApp();
+  });
+
+  afterEach(function() {
+    destroyApp(application);
+  });
+
+  it('can create a blog post', function() {
+    visit('/posts/new');
+
+    fillIn('.post-title-input', 'Test Post');
+    fillIn('.post-body-input', 'This post is a test!');
+    click('.save-post');
+
+    andThen(function() {
+      expect(currentPath()).to.equal('posts.show');
+
+      expect(find('.post-title').text()).to.include('Test Post');
+      expect(find('.post-body').text()).to.include('This post is a test!');
+    });
+  });
+});
```

We set up the entire acceptance test at once. This test will guide us through the rest of the unit testing and implementation of the feature.

Red: The URL '/posts/new' did not match any routes in your application


### Add new blog post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/466cf57d98c0f56d5de8135eb6fa0cae35927804)

#### app/router.js

```diff
 });
 
 Router.map(function() {
+  this.route('posts', function() {
+    this.route('new');
+  });
 });
 
 export default Router;
```


#### app/routes/posts/new.js

```diff
+import Ember from 'ember';
+
+export default Ember.Route.extend({
+});
```


#### app/templates/posts/new.hbs

```diff
+{{outlet}}
```


#### tests/unit/routes/posts/new-test.js

```diff
+/* jshint expr:true */
+import { expect } from 'chai';
+import {
+  describeModule,
+  it
+} from 'ember-mocha';
+
+describeModule(
+  'route:posts/new',
+  'PostsNewRoute',
+  {
+    // Specify the other units that are required for this test.
+    // needs: ['controller:foo']
+  },
+  function() {
+    it('exists', function() {
+      let route = this.subject();
+      expect(route).to.be.ok;
+    });
+  }
+);
```

We only change enough code to get to the next error message. Getting past the "no route" error only requires creating the route in the routes file.

Red: Element .post-title-input not found.

The next error is simple: no `.post-title-input` field is found to fill text into.


### Add form component and unit test [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/463bf47a7d7a26569d9e5614960308b4e5cd8e7e)

#### app/components/post-form.js

```diff
+import Ember from 'ember';
+
+export default Ember.Component.extend({
+});
```


#### app/templates/components/post-form.hbs

```diff
+{{yield}}
```


#### app/templates/posts/new.hbs

```diff
-{{outlet}}
+<h1>New Post</h1>
+
+{{post-form}}
```


#### tests/integration/components/post-form-test.js

```diff
+/* jshint expr:true */
+import { expect } from 'chai';
+import {
+  describeComponent,
+  it
+} from 'ember-mocha';
+import hbs from 'htmlbars-inline-precompile';
+
+describeComponent(
+  'post-form',
+  'Integration: PostFormComponent',
+  {
+    integration: true
+  },
+  function() {
+    it('renders the form', function() {
+      this.render(hbs`{{post-form}}`);
+
+      var titleInput = this.$('input[type=text].post-title-input');
+      expect(titleInput.length,
+             'Text input .post-title-input not found'
+             ).to.equal(1);
+
+      var bodyInput = this.$('textarea.post-body-input');
+      expect(bodyInput.length,
+             'Textarea .post-body-input not found'
+             ).to.equal(1);
+    });
+  }
+);
```

Rather than just getting the test to pass by putting a form input on the route's template, we "write the code we wish we had." In this case, we wish we had a `post-form` component to use that would provide the form inputs for us.

We also go ahead and specify the body field as well, even though that's not strictly necessary to reproduce the current acceptance error. We're pretty sure it'll error out on that field missing too, so this is a case where it's safe to go ahead and specify it at the unit level.

We create the component, then create a unit tests for it that reproduce the acceptance test error.

Inner red: Text input .post-title-input not found: expected 0 to equal 1

The default error message isn't the same because the Ember component tests use a different framework than acceptance tests, so we write a custom error message to match more closely.


### Add form component markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/1d4f994babfe841c57f48a96f74d53ba1b19bab4)

#### app/templates/components/post-form.hbs

```diff
-{{yield}}
+<form>
+  <div>
+    <label for="post-title-input">Title</label>
+    <input type="text" class="post-title-input" />
+  </div>
+  <div>
+    <label for="post-body-input">Body</label>
+    <textarea class="post-body-input" />
+  </div>
+
+  <button type="submit" class="save-post">Save</button>
+</form>
```

Inner green; outer test hangs after submitting form

Now that we're rendering markup for the component, its unit test is able to find the title field and fill it in. The acceptance test also gets past the point of filling in the title, and now it hangs after clicking the save button. I'm not sure why, but I think it has to do with the fact that, since that form isn't wired up to any Ember behavior, the form is actually submitted in the browser, which closes down the Ember app. In any case, we need to get Ember handling the form submission.


### Specify the component should call the save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/cf529a2e473533d031d3f6617a819a3cedfeb6bd)

#### tests/acceptance/creating-a-blog-post-test.js

```diff
 /* jshint expr:true */
 import {
   describe,
-  it,
+  // it,
   beforeEach,
   afterEach
 } from 'mocha';
-import { expect } from 'chai';
+// import { expect } from 'chai';
 import startApp from '../helpers/start-app';
 import destroyApp from '../helpers/destroy-app';
 
@@ -20,18 +20,18 @@ describe('Acceptance: CreatingABlogPost', function() {
     destroyApp(application);
   });
 
-  it('can create a blog post', function() {
-    visit('/posts/new');
-
-    fillIn('.post-title-input', 'Test Post');
-    fillIn('.post-body-input', 'This post is a test!');
-    click('.save-post');
-
-    andThen(function() {
-      expect(currentPath()).to.equal('posts.show');
-
-      expect(find('.post-title').text()).to.include('Test Post');
-      expect(find('.post-body').text()).to.include('This post is a test!');
-    });
-  });
+  // it('can create a blog post', function() {
+  //   visit('/posts/new');
+  //
+  //   fillIn('.post-title-input', 'Test Post');
+  //   fillIn('.post-body-input', 'This post is a test!');
+  //   click('.save-post');
+  //
+  //   andThen(function() {
+  //     expect(currentPath()).to.equal('posts.show');
+  //
+  //     expect(find('.post-title').text()).to.include('Test Post');
+  //     expect(find('.post-body').text()).to.include('This post is a test!');
+  //   });
+  // });
 });
```


#### tests/integration/components/post-form-test.js

```diff
              'Textarea .post-body-input not found'
              ).to.equal(1);
     });
+
+    it('calls the save action', function() {
+      let saveHandlerCalled = false;
+      this.set('verifySaveHandlerCalled', () => {
+        saveHandlerCalled = true;
+      });
+
+      this.render(hbs`{{post-form save=(action verifySaveHandlerCalled)}}`);
+
+      this.$('.post-title-input').val('New Title').blur();
+      this.$('.post-body-input').val('New Body').blur();
+      this.$('.save-post').click();
+
+      expect(saveHandlerCalled).to.be.true;
+    });
   }
 );
```

Inner test hangs after submitting form

We reproduce the acceptance test error at the component level, which is unfortunately that the test hangs.

In order to get clear test output from the component test, we temporarily disable the acceptance test so it's only the component test causing the suite to hang.


### Call save handler from post form [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/fa08f8d271cfa1a89be20b51c66482491d0a3e65)

#### app/components/post-form.js

```diff
 import Ember from 'ember';
 
 export default Ember.Component.extend({
+  actions: {
+    save() {  
+      this.get('save')();
+    }
+  }
 });
```


#### app/templates/components/post-form.hbs

```diff
-<form>
+<form {{action 'save' on='submit'}}>
   <div>
     <label for="post-title-input">Title</label>
     <input type="text" class="post-title-input" />
```


#### tests/acceptance/creating-a-blog-post-test.js

```diff
 /* jshint expr:true */
 import {
   describe,
-  // it,
+  it,
   beforeEach,
   afterEach
 } from 'mocha';
-// import { expect } from 'chai';
+import { expect } from 'chai';
 import startApp from '../helpers/start-app';
 import destroyApp from '../helpers/destroy-app';
 
@@ -20,18 +20,18 @@ describe('Acceptance: CreatingABlogPost', function() {
     destroyApp(application);
   });
 
-  // it('can create a blog post', function() {
-  //   visit('/posts/new');
-  //
-  //   fillIn('.post-title-input', 'Test Post');
-  //   fillIn('.post-body-input', 'This post is a test!');
-  //   click('.save-post');
-  //
-  //   andThen(function() {
-  //     expect(currentPath()).to.equal('posts.show');
-  //
-  //     expect(find('.post-title').text()).to.include('Test Post');
-  //     expect(find('.post-body').text()).to.include('This post is a test!');
-  //   });
-  // });
+  it('can create a blog post', function() {
+    visit('/posts/new');
+
+    fillIn('.post-title-input', 'Test Post');
+    fillIn('.post-body-input', 'This post is a test!');
+    click('.save-post');
+
+    andThen(function() {
+      expect(currentPath()).to.equal('posts.show');
+
+      expect(find('.post-title').text()).to.include('Test Post');
+      expect(find('.post-body').text()).to.include('This post is a test!');
+    });
+  });
 });
```

We make the component test pass by setting the form to run the `save` action upon submit, and the `save` action of the component to run the passed-in `save` action closure.

We also re-enable the acceptance test, and confirm that it's no longer hanging:

Outer red: undefined is not a constructor (evaluating 'this.get('save')()')

Now it errors out because we aren't passing a save action closure into the component.


### Add new post controller for save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/0e8a83ba6353dfdccca85cfb7b97ddb0454e7617)

#### app/controllers/posts/new.js

```diff
+import Ember from 'ember';
+
+export default Ember.Controller.extend({
+  actions: {
+    userSavedPost() {
+      this.transitionToRoute("posts.show");
+    }
+  }
+});
```


#### app/templates/posts/new.hbs

```diff
 <h1>New Post</h1>
 
-{{post-form}}
+{{post-form save=(action "userSavedPost")}}
```


#### tests/unit/controllers/posts/new-test.js

```diff
+/* jshint expr:true */
+import { expect } from 'chai';
+import {
+  describeModule,
+  it
+} from 'ember-mocha';
+
+describeModule(
+  'controller:posts/new',
+  'PostsNewController',
+  {
+    // Specify the other units that are required for this test.
+    // needs: ['controller:foo']
+  },
+  function() {
+    // Replace this with your real tests.
+    it('exists', function() {
+      let controller = this.subject();
+      expect(controller).to.be.ok;
+    });
+  }
+);
```

We implement a save handler by adding a new post controller to put it in, adding the handler, then passing it into the form component.

Outer red: The route posts.show was not found

Now the acceptance test successfully attempts to transition to the `posts.show` route, but it doesn't yet exist.


### Add posts.show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/bad7e70e33e1a9ec6210de1effb1b847954faadb)

#### app/router.js

```diff
 Router.map(function() {
   this.route('posts', function() {
     this.route('new');
+    this.route('show');
   });
 });
 
```


#### app/routes/posts/show.js

```diff
+import Ember from 'ember';
+
+export default Ember.Route.extend({
+});
```


#### app/templates/posts/show.hbs

```diff
+{{outlet}}
```


#### tests/unit/routes/posts/show-test.js

```diff
+/* jshint expr:true */
+import { expect } from 'chai';
+import {
+  describeModule,
+  it
+} from 'ember-mocha';
+
+describeModule(
+  'route:posts/show',
+  'PostsShowRoute',
+  {
+    // Specify the other units that are required for this test.
+    // needs: ['controller:foo']
+  },
+  function() {
+    it('exists', function() {
+      let route = this.subject();
+      expect(route).to.be.ok;
+    });
+  }
+);
```

Outer red: expected '' to equal 'Test Post'

Now the acceptance test is able to display the `posts.show` route, but it can't find the post's title on the page, because we aren't rendering anything to the screen yet.


### Add detail component and unit test [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/59bcb903062192b9187dba4f0a360ac90cd016d0)

#### app/components/post-detail.js

```diff
+import Ember from 'ember';
+
+export default Ember.Component.extend({
+});
```


#### app/templates/components/post-detail.hbs

```diff
+{{yield}}
```


#### app/templates/posts/show.hbs

```diff
-{{outlet}}
+<h1>Post</h1>
+
+{{post-detail post=model}}
```


#### tests/integration/components/post-detail-test.js

```diff
+/* jshint expr:true */
+import { expect } from 'chai';
+import {
+  describeComponent,
+  it
+} from 'ember-mocha';
+import hbs from 'htmlbars-inline-precompile';
+
+describeComponent(
+  'post-detail',
+  'Integration: PostDetailComponent',
+  {
+    integration: true
+  },
+  function() {
+    it('displays details for the passed-in post', function() {
+      this.set('testModel', {title: 'Test Title', body: 'This is a test post!'});
+
+      this.render(hbs`{{post-detail post=testModel}}`);
+      expect(this.$('.post-title').text()).to.include('Test Title');
+      expect(this.$('.post-body').text()).to.include('This is a test post!');
+    });
+  }
+);
```

Again, instead of making the acceptance test pass as quickly as possible, we "write the code we wish we had": a post display component. We create it and add a component test that reproduces the acceptance test error; we specify that the component displays the post's title. And we go ahead and specify that it displays the body, too, because that seems safe in this case.

Inner red: expected '' to equal 'Test Title'


### Add post detail display markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/4ff6a1d2ad041a3391c327c9dba33897f91c2582)

#### app/templates/components/post-detail.hbs

```diff
-{{yield}}
+<h1 class="post-title">{{post.title}}</h1>
+
+<div class="post-body">
+  {{post.body}}
+</div>
```

We make the component test pass by adding markup to display the post.

Inner green; outer red: expected '' to equal 'Test Post'

The acceptance test still has the same error, because we aren't passing the model into the component.


### Hook routes into post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/4d43ef124a19e69e0bdf3b43ae9a153200233cb4)

#### app/controllers/posts/new.js

```diff
 
 export default Ember.Controller.extend({
   actions: {
-    userSavedPost() {
-      this.transitionToRoute("posts.show");
+    userSavedPost(postData) {
+      let post = this.store.createRecord('post', postData);
+      post.save().then((post) => {
+        this.transitionToRoute("posts.show", post.id);
+      });
     }
   }
 });
```


#### app/router.js

```diff
 Router.map(function() {
   this.route('posts', function() {
     this.route('new');
-    this.route('show');
+    this.route('show', { path: ':postId' });
   });
 });
 
```


#### app/routes/posts/show.js

```diff
 import Ember from 'ember';
 
 export default Ember.Route.extend({
+  model(params) {
+    return this.store.findRecord('post', params.postId);
+  }
 });
```

This acceptance test error drives a lot of logic: to display the post's title on the show page, we need to save the post on the new page, include the ID in the transition to the show route, then load the post on the show page's model hook.

Outer red: No model was found for 'post'

With this logic added, the acceptance test errors out quickly: there _is_ no `post` model.


### Add post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/91410c55c2dc83af06a18183712e3d0b18d3aea5)

#### app/models/post.js

```diff
+import Model from 'ember-data/model';
+// import attr from 'ember-data/attr';
+// import { belongsTo, hasMany } from 'ember-data/relationships';
+
+export default Model.extend({
+
+});
```


#### tests/unit/models/post-test.js

```diff
+/* jshint expr:true */
+import { expect } from 'chai';
+import { describeModel, it } from 'ember-mocha';
+
+describeModel(
+  'post',
+  'Unit | Model | post',
+  {
+    // Specify the other units that are required for this test.
+      needs: []
+  },
+  function() {
+    // Replace this with your real tests.
+    it('exists', function() {
+      let model = this.subject();
+      // var store = this.store();
+      expect(model).to.be.ok;
+    });
+  }
+);
```

Outer red: Your Ember app tried to POST '/posts', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file.

Next we get an error from Mirage, our fake server. It needs a corresponding post creation endpoint created.


### Add mirage create post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/c56b067ff9d960c8c378d3cd91a8479cfbc2eb06)

#### mirage/config.js

```diff
 export default function() {
+  this.post('/posts');
 }
```

Outer red: Pretender intercepted POST /posts but encountered an error: Mirage: The route handler for /posts is trying to access the post model, but that model doesn't exist. Create it using 'ember g mirage-model post'.

Now that Mirage has an endpoint, it returns another error: a Mirage model for `post` needs to be added too.


### Add mirage model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/228775d9ef8be495b8d12f09109b8e4a96f4f8fa)

#### mirage/models/post.js

```diff
+import { Model } from 'ember-cli-mirage';
+
+export default Model.extend({
+});
```

Outer red: Pretender intercepted POST /posts but encountered an error: Mirage: You're using a shorthand or #normalizedRequestAttrs, but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.0-beta.9/serializers/#normalizejson

The next error is pretty obscure. What's happening is that no attributes are being sent in the create request, and Mirage is erroring out right away. We do want the `title` attribute to be sent, so this is a valid error situation.


### Specify the form data should be sent to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/e50c0885f1010e02c71fa6c2b2bb48ff26cb3c40)

#### tests/integration/components/post-form-test.js

```diff
              ).to.equal(1);
     });
 
-    it('calls the save action', function() {
+    it('calls the save action with the model data', function() {
       let saveHandlerCalled = false;
-      this.set('verifySaveHandlerCalled', () => {
+      this.set('verifySaveHandlerCalled', (post) => {
         saveHandlerCalled = true;
+        expect(post.title).to.equal('New Title');
+        expect(post.body).to.equal('New Body');
       });
 
       this.render(hbs`{{post-form save=(action verifySaveHandlerCalled)}}`);
```

This is another case where we're reproducing the acceptance test situation, if not the actual error message. We specify that the post form component should pass the data for the model to the save action closure.

Inner red: undefined is not an object (evaluating 'post.title')

We check that the title and body fields come back on that object, but since no value comes back at all, we get an error that it's not an object.


### Send post form data to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/f336e1bc81a2e0d1453786f1d216653357ad9907)

#### app/components/post-form.js

```diff
 
 export default Ember.Component.extend({
   actions: {
-    save() {  
-      this.get('save')();
+    save() {
+      let postData = {
+        title: this.get('title'),
+        body: this.get('body'),
+      };
+      this.get('save')(postData);
     }
   }
 });
```


#### app/templates/components/post-form.hbs

```diff
 <form {{action 'save' on='submit'}}>
   <div>
     <label for="post-title-input">Title</label>
-    <input type="text" class="post-title-input" />
+    {{input type="text" class="post-title-input" value=title}}
   </div>
   <div>
     <label for="post-body-input">Body</label>
-    <textarea class="post-body-input" />
+    {{textarea class="post-body-input" value=body}}
   </div>
 
   <button type="submit" class="save-post">Save</button>
```

We get the component test to pass by making the input an Ember input helper, retrieving the saved value in it, and sending that in an object to the `save` action closure.

Inner green; outer red: Pretender intercepted POST /posts but encountered an error: Mirage: You're using a shorthand or #normalizedRequestAttrs, but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.0-beta.9/serializers/#normalizejson

Now the acceptance test still gives the same error, and in this case the tests aren't that helpful to guide us to why. What's going on is that the Ember Data `post` model doesn't have any fields defined on it, so it isn't saved and retrieved by the show page.


### Add fields to post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/a1320ec336a5c9d3c90d09d7610bcfd134e3879d)

#### app/models/post.js

```diff
 import Model from 'ember-data/model';
-// import attr from 'ember-data/attr';
+import attr from 'ember-data/attr';
 // import { belongsTo, hasMany } from 'ember-data/relationships';
 
 export default Model.extend({
-
+  title: attr(),
+  body: attr(),
 });
```

We add the title and body fields to the post model, so now it's saved by the new page.

Outer red: Your Ember app tried to GET '/posts/1', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file.

The next error is in Mirage again: we now get to the post show page, but Mirage isn't configured to retrieve a post by ID.


### Add mirage get post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/971aa78235e0a2e8913e54cf40ff1953f3286f35)

#### mirage/config.js

```diff
 export default function() {
+  this.get('/posts/:id')
   this.post('/posts');
 }
```

Outer green

We configure Mirage to return a post retrieved by ID, and the acceptance test passes. We've successfully let our acceptance test drive out the behavior of this feature!

