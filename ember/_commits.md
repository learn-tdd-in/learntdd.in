### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/9efbf887fcfc56c661a348c098c5f95bd98c9f31)

#### tests/acceptance/creating-a-blog-post-test.js

```diff
@@ -0,0 +1,36 @@
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
+    click('.save-post');
+
+    andThen(function() {
+      expect(currentPath()).to.equal('posts.show');
+
+      const title = find('.post-title');
+      expect(title.text()).to.equal('Test Post');
+    });
+  });
+});
```

Red: The URL '/posts/new' did not match any routes in your application

We set up the entire acceptance test at once. This test will guide us through the rest of the unit testing and implementation of the feature.


### Add new blog post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/765d0dc071e175a5e09fcc48b3b02b8851df7f8d)

#### app/router.js

```diff
@@ -6,6 +6,9 @@ const Router = Ember.Router.extend({
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
@@ -0,0 +1,4 @@
+import Ember from 'ember';
+
+export default Ember.Route.extend({
+});
```


#### app/templates/posts/new.hbs

```diff
@@ -0,0 +1 @@
+{{outlet}}
```


#### tests/unit/routes/posts/new-test.js

```diff
@@ -0,0 +1,21 @@
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

Red: Element .post-title-input not found.

We only change enough code to get to the next error message. Getting past the "no route" error only requires creating the route in the routes file.

The next error is simple: no `.post-title-input` field is found to fill text into.


### Add form component and unit test [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/8bd6f0a1134410958d040ad57a50973fe0b995f2)

#### app/components/post-form.js

```diff
@@ -0,0 +1,4 @@
+import Ember from 'ember';
+
+export default Ember.Component.extend({
+});
```


#### app/templates/components/post-form.hbs

```diff
@@ -0,0 +1 @@
+{{yield}}
```


#### app/templates/posts/new.hbs

```diff
@@ -1 +1,3 @@
-{{outlet}}
+<h1>New Post</h1>
+
+{{post-form}}
```


#### tests/integration/components/post-form-test.js

```diff
@@ -0,0 +1,25 @@
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
+      var postInput = this.$('input[type=text].post-title-input');
+      expect(postInput.length,
+             'Text input .post-title-input not found'
+             ).to.equal(1);
+    });
+  }
+);
```

Inner red: expected 0 to equal 1

Rather than just getting the test to pass by putting a form input on the route's template, we "write the code we wish we had." In this case, we wish we had a `post-form` component to use that would provide the input for us.

We create the component, then create a unit tests for it that reproduce the acceptance test error. The default error message isn't the same because the Ember component tests use a different framework than acceptance tests, so we write a custom error message to match more closely.


### Add form component markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/421dbdf08088d8f69d359d617af04bf9d0fe3226)

#### app/templates/components/post-form.hbs

```diff
@@ -1 +1,8 @@
-{{yield}}
+<form>
+  <div>
+    <label for="post-title">Title</label>
+    <input type="text" class="post-title-input" />
+  </div>
+
+  <button class="save-post">Save</button>
+</form>
```

Inner green; outer test hangs after submitting form

Now that we're rendering markup for the component, its unit test is able to find the title field and fill it in. The acceptance test also gets past the point of filling in the title, and now it hangs after clicking the save button. I'm not sure why, but I think it has to do with the fact that, since that form isn't wired up to any Ember behavior, the form is actually submitted in the browser, which closes down the Ember app. In any case, we need to get Ember handling the form submission.


### Specify the component should call the save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/a901d04beb0436c9a5167f77cc047ab0ec44f552)

#### tests/acceptance/creating-a-blog-post-test.js

```diff
@@ -1,11 +1,11 @@
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
 
@@ -20,17 +20,17 @@ describe('Acceptance: CreatingABlogPost', function() {
     destroyApp(application);
   });
 
-  it('can create a blog post', function() {
-    visit('/posts/new');
-
-    fillIn('.post-title-input', 'Test Post');
-    click('.save-post');
-
-    andThen(function() {
-      expect(currentPath()).to.equal('posts.show');
-
-      const title = find('.post-title');
-      expect(title.text()).to.equal('Test Post');
-    });
-  });
+  // it('can create a blog post', function() {
+  //   visit('/posts/new');
+  //
+  //   fillIn('.post-title-input', 'Test Post');
+  //   click('.save-post');
+  //
+  //   andThen(function() {
+  //     expect(currentPath()).to.equal('posts.show');
+  //
+  //     const title = find('.post-title');
+  //     expect(title.text()).to.equal('Test Post');
+  //   });
+  // });
 });
```


#### tests/integration/components/post-form-test.js

```diff
@@ -21,5 +21,19 @@ describeComponent(
              'Text input .post-title-input not found'
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


### Call save handler from post form [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/592478f52cf6466339a4c0117c6aa239fbf6cd22)

#### app/components/post-form.js

```diff
@@ -1,4 +1,9 @@
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
@@ -4,5 +4,5 @@
     <input type="text" class="post-title-input" />
   </div>
 
-  <button class="save-post">Save</button>
+  <button class="save-post" {{action 'save'}}>Save</button>
 </form>
```


#### tests/acceptance/creating-a-blog-post-test.js

```diff
@@ -1,11 +1,11 @@
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
 
@@ -20,17 +20,17 @@ describe('Acceptance: CreatingABlogPost', function() {
     destroyApp(application);
   });
 
-  // it('can create a blog post', function() {
-  //   visit('/posts/new');
-  //
-  //   fillIn('.post-title-input', 'Test Post');
-  //   click('.save-post');
-  //
-  //   andThen(function() {
-  //     expect(currentPath()).to.equal('posts.show');
-  //
-  //     const title = find('.post-title');
-  //     expect(title.text()).to.equal('Test Post');
-  //   });
-  // });
+  it('can create a blog post', function() {
+    visit('/posts/new');
+
+    fillIn('.post-title-input', 'Test Post');
+    click('.save-post');
+
+    andThen(function() {
+      expect(currentPath()).to.equal('posts.show');
+
+      const title = find('.post-title');
+      expect(title.text()).to.equal('Test Post');
+    });
+  });
 });
```

Outer red: undefined is not a constructor (evaluating 'this.get('save')()')

We make the component test pass by setting the form to run the `save` action upon submit, and the `save` action of the component to run the passed-in `save` action closure.

We also re-enable the acceptance test, and confirm that it's no longer hanging. Now it errors out because we aren't passing a save action closure into the component.


### Add new post controller for save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/97f774b0305a5b248fb80a64aef2959c20e46596)

#### app/controllers/posts/new.js

```diff
@@ -0,0 +1,9 @@
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
@@ -1,3 +1,3 @@
 <h1>New Post</h1>
 
-{{post-form}}
+{{post-form save=(action "userSavedPost")}}
```


#### tests/unit/controllers/posts/new-test.js

```diff
@@ -0,0 +1,22 @@
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

Outer red: The route posts.show was not found

We implement a save handler by adding a new post controller to put it in, adding the handler, then passing it into the form component. Now the acceptance test successfully attempts to transition to the `posts.show` route, but it doesn't yet exist.


### Add posts.show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/f8a1e4fb192f850c4b03bf79abc71912fdbb8a5d)

#### app/router.js

```diff
@@ -8,6 +8,7 @@ const Router = Ember.Router.extend({
 Router.map(function() {
   this.route('posts', function() {
     this.route('new');
+    this.route('show');
   });
 });
 
```


#### app/routes/posts/show.js

```diff
@@ -0,0 +1,4 @@
+import Ember from 'ember';
+
+export default Ember.Route.extend({
+});
```


#### app/templates/posts/show.hbs

```diff
@@ -0,0 +1 @@
+{{outlet}}
```


#### tests/unit/routes/posts/show-test.js

```diff
@@ -0,0 +1,21 @@
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


### Add detail component and unit test [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/cbaf9c1174289df43b759161baa20600f1ce6936)

#### app/components/post-detail.js

```diff
@@ -0,0 +1,4 @@
+import Ember from 'ember';
+
+export default Ember.Component.extend({
+});
```


#### app/templates/components/post-detail.hbs

```diff
@@ -0,0 +1 @@
+{{yield}}
```


#### app/templates/posts/show.hbs

```diff
@@ -1 +1,3 @@
-{{outlet}}
+<h1>Post</h1>
+
+{{post-detail post=model}}
```


#### tests/integration/components/post-detail-test.js

```diff
@@ -0,0 +1,23 @@
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
+      this.set('testModel', {title: 'Test Title'});
+
+      this.render(hbs`{{post-detail post=testModel}}`);
+      expect(this.$('.post-title').text()).to.equal('Test Title');
+    });
+  }
+);
```

Inner red: expected '' to equal 'Test Title'

Again, instead of making the acceptance test pass as quickly as possible, we "write the code we wish we had": a post display component. We create it and add a component test that reproduces the acceptance test error; we specify that the component displays the post's title.


### Add post detail display markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/21b1867e2c92f24242770e6a0ada151c24136190)

#### app/templates/components/post-detail.hbs

```diff
@@ -1 +1,3 @@
-{{yield}}
+<div>
+  Title: <span class="post-title">{{post.title}}</span>
+</div>
```

Inner green; outer red: expected '' to equal 'Test Post'

We make the component test pass by adding markup to display the post, but the acceptance test still has the same error, because we aren't passing the model into the component.


### Hook routes into post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/130b47d0a29073c7f838d4c758f8e76297efe097)

#### app/controllers/posts/new.js

```diff
@@ -2,8 +2,11 @@ import Ember from 'ember';
 
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
@@ -8,7 +8,7 @@ const Router = Ember.Router.extend({
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
@@ -1,4 +1,7 @@
 import Ember from 'ember';
 
 export default Ember.Route.extend({
+  model(params) {
+    return this.store.findRecord('post', params.postId);
+  }
 });
```

Outer red: No model was found for 'post'

This acceptance test error drives a lot of logic: to display the post's title on the show page, we need to save the post on the new page, include the ID in the transition to the show route, then load the post on the show page's model hook.

With this logic added, the acceptance test errors out quickly: there _is_ no `post` model.


### Add post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/1aba499b73ebacd0999f3532de793298106cfafe)

#### app/models/post.js

```diff
@@ -0,0 +1,7 @@
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
@@ -0,0 +1,20 @@
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

We add the Ember Data `post` model, and next we get an error from Mirage, our fake server. It needs a corresponding post creation endpoint created.


### Add mirage create post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/2274dcce3db99d5c7e76ff7f9814f062a21307ca)

#### mirage/config.js

```diff
@@ -1,26 +1,5 @@
 export default function() {
 
-  // These comments are here to help you get started. Feel free to delete them.
+  this.post('/posts');
 
-  /*
-    Config (with defaults).
-
-    Note: these only affect routes defined *after* them!
-  */
-
-  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
-  // this.namespace = '';    // make this `api`, for example, if your API is namespaced
-  // this.timing = 400;      // delay for each request, automatically set to 0 during testing
-
-  /*
-    Shorthand cheatsheet:
-
-    this.get('/posts');
-    this.post('/posts');
-    this.get('/posts/:id');
-    this.put('/posts/:id'); // or this.patch
-    this.del('/posts/:id');
-
-    http://www.ember-cli-mirage.com/docs/v0.2.0-beta.7/shorthands/
-  */
 }
```

Outer red: Pretender intercepted POST /posts but encountered an error: Mirage: The route handler for /posts is trying to access the post model, but that model doesn't exist. Create it using 'ember g mirage-model post'.

Now that Mirage has an endpoint, it returns another error: a Mirage model for `post` needs to be added too.


### Add mirage model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/ba5cc3a167a564b7efa2ce42cbac4a646a056a56)

#### mirage/models/post.js

```diff
@@ -0,0 +1,4 @@
+import { Model } from 'ember-cli-mirage';
+
+export default Model.extend({
+});
```

Outer red: Pretender intercepted POST /posts but encountered an error: Mirage: You're using a shorthand or #normalizedRequestAttrs, but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.0-beta.9/serializers/#normalizejson

When we add the Mirage `post` model, the next error is pretty obscure. What's happening is that no attributes are being sent in the create request, and Mirage is erroring out right away. We do want the `title` attribute to be sent, so this is a valid error situation.


### Specify the form data shound be sent to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/2d9c5d572a807d0ff979a35d3eeec99d5baa9baa)

#### tests/integration/components/post-form-test.js

```diff
@@ -22,10 +22,11 @@ describeComponent(
              ).to.equal(1);
     });
 
-    it('calls the save action', function() {
+    it('calls the save action with the model data', function() {
       let saveHandlerCalled = false;
-      this.set('verifySaveHandlerCalled', () => {
+      this.set('verifySaveHandlerCalled', (post) => {
         saveHandlerCalled = true;
+        expect(post.title).to.equal('New Title');
       });
 
       this.render(hbs`{{post-form save=(action verifySaveHandlerCalled)}}`);
```

Inner red: undefined is not an object (evaluating 'post.title')

This is another case where we're reproducing the acceptance test situation, if not the actual error message. We specify that the post form component should pass the data for the model to the save action closure. We check that a title field comes back on that object, but since no value comes back at all, we get an error that it's not an object.


### Send post form data to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/dd9de29dd4afabb26104310202058b240846cf09)

#### app/components/post-form.js

```diff
@@ -2,8 +2,9 @@ import Ember from 'ember';
 
 export default Ember.Component.extend({
   actions: {
-    save() {  
-      this.get('save')();
+    save() {
+      let postData = { title: this.get('title') };
+      this.get('save')(postData);
     }
   }
 });
```


#### app/templates/components/post-form.hbs

```diff
@@ -1,7 +1,7 @@
 <form>
   <div>
     <label for="post-title">Title</label>
-    <input type="text" class="post-title-input" />
+    {{input type="text" class="post-title-input" value=title}}
   </div>
 
   <button class="save-post" {{action 'save'}}>Save</button>
```

Inner green; outer red: Pretender intercepted POST /posts but encountered an error: Mirage: You're using a shorthand or #normalizedRequestAttrs, but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.0-beta.9/serializers/#normalizejson

We get the component test to pass by making the input an Ember input helper, retrieving the saved value in it, and sending that in an object to the `save` action closure.

Now the acceptance test still gives the same error, and in this case the tests aren't that helpful to guide us to why. What's going on is that the Ember Data `post` model doesn't have a title field, so it isn't saved and retrieved by the show page.


### Add title field to post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/00d21a62862309cb6d351a532324b3320644b582)

#### app/models/post.js

```diff
@@ -1,7 +1,7 @@
 import Model from 'ember-data/model';
-// import attr from 'ember-data/attr';
+import attr from 'ember-data/attr';
 // import { belongsTo, hasMany } from 'ember-data/relationships';
 
 export default Model.extend({
-
+  title: attr(),
 });
```

Outer red: Your Ember app tried to GET '/posts/1', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file.

We add the title field to the post model, so now it's saved by the new page. The next error is in Mirage again: we now get to the post show page, but Mirage isn't configured to retrieve a post by ID.


### Add mirage get post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/3294a878f868824307820cb4e7ff8f92f389cae8)

#### mirage/config.js

```diff
@@ -1,5 +1,6 @@
 export default function() {
 
+  this.get('/posts/:id')
   this.post('/posts');
 
 }
```

Outer green

We configure Mirage to return a post retrieved by ID, and the acceptance test passes. We've successfully let our acceptance test drive out the behavior of this feature!

