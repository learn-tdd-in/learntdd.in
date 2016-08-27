### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/8cb0341a8b58b73cf8e602cd29ab2f55ed2923ab)

#### tests/acceptance/creating-a-blog-post-test.js

```diff
{% raw %}+/* jshint expr:true */
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
+});{% endraw %}
```

We set up the entire acceptance test at once. This test will guide us through the rest of the unit testing and implementation of the feature.

Red: The URL '/posts/new' did not match any routes in your application


### Add new blog post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/29930d87c3ff519b36b3839df707aa844dac64a2)

#### app/router.js

```diff
{% raw %} });
 
 Router.map(function() {
+  this.route('posts', function() {
+    this.route('new');
+  });
 });
 
 export default Router;{% endraw %}
```


#### app/routes/posts/new.js

```diff
{% raw %}+import Ember from 'ember';
+
+export default Ember.Route.extend({
+});{% endraw %}
```


#### app/templates/posts/new.hbs

```diff
{% raw %}+{{outlet}}{% endraw %}
```


#### tests/unit/routes/posts/new-test.js

```diff
{% raw %}+/* jshint expr:true */
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
+);{% endraw %}
```

We only change enough code to get to the next error message. Getting past the "no route" error only requires creating the route in the routes file.

Red: Element .post-title-input not found.

The next error is simple: no `.post-title-input` field is found to fill text into.


### Add form component and unit test [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/5d1438d5240d2ddc7428d97352291e36c6af2feb)

#### app/components/post-form.js

```diff
{% raw %}+import Ember from 'ember';
+
+export default Ember.Component.extend({
+});{% endraw %}
```


#### app/templates/components/post-form.hbs

```diff
{% raw %}+{{yield}}{% endraw %}
```


#### app/templates/posts/new.hbs

```diff
{% raw %}-{{outlet}}
+<h1>New Post</h1>
+
+{{post-form}}{% endraw %}
```


#### tests/integration/components/post-form-test.js

```diff
{% raw %}+/* jshint expr:true */
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
+);{% endraw %}
```

Rather than just getting the test to pass by putting a form input on the route's template, we "write the code we wish we had." In this case, we wish we had a `post-form` component to use that would provide the form inputs for us.

We also go ahead and specify the body field as well, even though that's not strictly necessary to reproduce the current acceptance error. We're pretty sure it'll error out on that field missing too, so this is a case where it's safe to go ahead and specify it at the unit level.

We create the component, then create a unit tests for it that reproduce the acceptance test error.

Inner red: Text input .post-title-input not found: expected 0 to equal 1

The default error message isn't the same because the Ember component tests use a different framework than acceptance tests, so we write a custom error message to match more closely.


### Add form component markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/b733d54719611a88c6b7a57c337a050fc85f7675)

#### app/templates/components/post-form.hbs

```diff
{% raw %}-{{yield}}
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
+</form>{% endraw %}
```

Inner green; outer test hangs after submitting form

Now that we're rendering markup for the component, its unit test is able to find the title field and fill it in. The acceptance test also gets past the point of filling in the title, and now it hangs after clicking the save button. I'm not sure why, but I think it has to do with the fact that, since that form isn't wired up to any Ember behavior, the form is actually submitted in the browser, which closes down the Ember app. In any case, we need to get Ember handling the form submission.


### Specify the component should call the save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/9031beea47374257902db419c26cece28361baa3)

#### tests/acceptance/creating-a-blog-post-test.js

```diff
{% raw %} /* jshint expr:true */
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
 
...
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
 });{% endraw %}
```


#### tests/integration/components/post-form-test.js

```diff
{% raw %}              'Textarea .post-body-input not found'
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
 );{% endraw %}
```

Inner test hangs after submitting form

We reproduce the acceptance test error at the component level, which is unfortunately that the test hangs.

In order to get clear test output from the component test, we temporarily disable the acceptance test so it's only the component test causing the suite to hang.


### Call save handler from post form [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/857684e218013d074e87f879a658b42d49482ed4)

#### app/components/post-form.js

```diff
{% raw %} import Ember from 'ember';
 
 export default Ember.Component.extend({
+  actions: {
+    save() {  
+      this.get('save')();
+    }
+  }
 });{% endraw %}
```


#### app/templates/components/post-form.hbs

```diff
{% raw %}-<form>
+<form {{action 'save' on='submit'}}>
   <div>
     <label for="post-title-input">Title</label>
     <input type="text" class="post-title-input" />{% endraw %}
```


#### tests/acceptance/creating-a-blog-post-test.js

```diff
{% raw %} /* jshint expr:true */
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
 
...
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
 });{% endraw %}
```

We make the component test pass by setting the form to run the `save` action upon submit, and the `save` action of the component to run the passed-in `save` action closure.

We also re-enable the acceptance test, and confirm that it's no longer hanging:

Outer red: undefined is not a constructor (evaluating 'this.get('save')()')

Now it errors out because we aren't passing a save action closure into the component.


### Add new post controller for save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/e91b0f5d5b526ed68909c248e191e6285c9026cd)

#### app/controllers/posts/new.js

```diff
{% raw %}+import Ember from 'ember';
+
+export default Ember.Controller.extend({
+  actions: {
+    userSavedPost() {
+      this.transitionToRoute("posts.show");
+    }
+  }
+});{% endraw %}
```


#### app/templates/posts/new.hbs

```diff
{% raw %} <h1>New Post</h1>
 
-{{post-form}}
+{{post-form save=(action "userSavedPost")}}{% endraw %}
```


#### tests/unit/controllers/posts/new-test.js

```diff
{% raw %}+/* jshint expr:true */
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
+);{% endraw %}
```

We implement a save handler by adding a new post controller to put it in, adding the handler, then passing it into the form component.

Outer red: The route posts.show was not found

Now the acceptance test successfully attempts to transition to the `posts.show` route, but it doesn't yet exist.


### Add posts.show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/1c3e180613a02548f0eee4088c7614db74cb925c)

#### app/router.js

```diff
{% raw %} Router.map(function() {
   this.route('posts', function() {
     this.route('new');
+    this.route('show');
   });
 });
 {% endraw %}
```


#### app/routes/posts/show.js

```diff
{% raw %}+import Ember from 'ember';
+
+export default Ember.Route.extend({
+});{% endraw %}
```


#### app/templates/posts/show.hbs

```diff
{% raw %}+{{outlet}}{% endraw %}
```


#### tests/unit/routes/posts/show-test.js

```diff
{% raw %}+/* jshint expr:true */
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
+);{% endraw %}
```

Outer red: expected '' to equal 'Test Post'

Now the acceptance test is able to display the `posts.show` route, but it can't find the post's title on the page, because we aren't rendering anything to the screen yet.


### Add detail component and unit test [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/c087dcbb197d1685c93b71b3cf940af9bf7ba754)

#### app/components/post-detail.js

```diff
{% raw %}+import Ember from 'ember';
+
+export default Ember.Component.extend({
+});{% endraw %}
```


#### app/templates/components/post-detail.hbs

```diff
{% raw %}+{{yield}}{% endraw %}
```


#### app/templates/posts/show.hbs

```diff
{% raw %}-{{outlet}}
+<h1>Post</h1>
+
+{{post-detail post=model}}{% endraw %}
```


#### tests/integration/components/post-detail-test.js

```diff
{% raw %}+/* jshint expr:true */
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
+);{% endraw %}
```

Again, instead of making the acceptance test pass as quickly as possible, we "write the code we wish we had": a post display component. We create it and add a component test that reproduces the acceptance test error; we specify that the component displays the post's title. And we go ahead and specify that it displays the body, too, because that seems safe in this case.

Inner red: expected '' to equal 'Test Title'


### Add post detail display markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/1adc7ccce95f03be71d26459a08615079a0a22b3)

#### app/templates/components/post-detail.hbs

```diff
{% raw %}-{{yield}}
+<h1 class="post-title">{{post.title}}</h1>
+
+<div class="post-body">
+  {{post.body}}
+</div>{% endraw %}
```

We make the component test pass by adding markup to display the post.

Inner green; outer red: expected '' to equal 'Test Post'

The acceptance test still has the same error, because we aren't passing the model into the component.


### Hook routes into post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/89b5303e82a134d7813471607cba7e70d4ec0e66)

#### app/controllers/posts/new.js

```diff
{% raw %} 
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
 });{% endraw %}
```


#### app/router.js

```diff
{% raw %} Router.map(function() {
   this.route('posts', function() {
     this.route('new');
-    this.route('show');
+    this.route('show', { path: ':postId' });
   });
 });
 {% endraw %}
```


#### app/routes/posts/show.js

```diff
{% raw %} import Ember from 'ember';
 
 export default Ember.Route.extend({
+  model(params) {
+    return this.store.findRecord('post', params.postId);
+  }
 });{% endraw %}
```

This acceptance test error drives a lot of logic: to display the post's title on the show page, we need to save the post on the new page, include the ID in the transition to the show route, then load the post on the show page's model hook.

Outer red: No model was found for 'post'

With this logic added, the acceptance test errors out quickly: there _is_ no `post` model.


### Add post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/1b333c1352de3b319e32e41f2ef2ebf6a2c9a0ac)

#### app/models/post.js

```diff
{% raw %}+import DS from 'ember-data';
+
+export default DS.Model.extend({
+
+});{% endraw %}
```


#### tests/unit/models/post-test.js

```diff
{% raw %}+/* jshint expr:true */
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
+);{% endraw %}
```

Outer red: Your Ember app tried to POST '/posts', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file.

Next we get an error from Mirage, our fake server. It needs a corresponding post creation endpoint created.


### Add mirage create post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/2b7762d13a830988f798b780dd0df58d82410ea3)

#### mirage/config.js

```diff
{% raw %} export default function() {
+  this.post('/posts');
 }{% endraw %}
```

Outer red: Pretender intercepted POST /posts but encountered an error: Mirage: The route handler for /posts is trying to access the post model, but that model doesn't exist. Create it using 'ember g mirage-model post'.

Now that Mirage has an endpoint, it returns another error: a Mirage model for `post` needs to be added too.


### Add mirage model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/30902aca56f403c77f01e083fe2a179c669f40bc)

#### mirage/models/post.js

```diff
{% raw %}+import { Model } from 'ember-cli-mirage';
+
+export default Model.extend({
+});{% endraw %}
```

Outer red: Pretender intercepted POST /posts but encountered an error: Mirage: You're using a shorthand or #normalizedRequestAttrs, but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.0-beta.9/serializers/#normalizejson

The next error is pretty obscure. What's happening is that no attributes are being sent in the create request, and Mirage is erroring out right away. We do want the `title` attribute to be sent, so this is a valid error situation.


### Specify the form data should be sent to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/ab537f955f3b447680bf4250cb02111dd4f30f41)

#### tests/integration/components/post-form-test.js

```diff
{% raw %}              ).to.equal(1);
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
 
       this.render(hbs`{{post-form save=(action verifySaveHandlerCalled)}}`);{% endraw %}
```

This is another case where we're reproducing the acceptance test situation, if not the actual error message. We specify that the post form component should pass the data for the model to the save action closure.

Inner red: undefined is not an object (evaluating 'post.title')

We check that the title and body fields come back on that object, but since no value comes back at all, we get an error that it's not an object.


### Send post form data to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/c8e8be260d11db92b6733c575122debb12b4875d)

#### app/components/post-form.js

```diff
{% raw %} 
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
 });{% endraw %}
```


#### app/templates/components/post-form.hbs

```diff
{% raw %} <form {{action 'save' on='submit'}}>
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
 
   <button type="submit" class="save-post">Save</button>{% endraw %}
```

We get the component test to pass by making the input an Ember input helper, retrieving the saved value in it, and sending that in an object to the `save` action closure.

Inner green; outer red: Pretender intercepted POST /posts but encountered an error: Mirage: You're using a shorthand or #normalizedRequestAttrs, but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.0-beta.9/serializers/#normalizejson

Now the acceptance test still gives the same error, and in this case the tests aren't that helpful to guide us to why. What's going on is that the Ember Data `post` model doesn't have any fields defined on it, so it isn't saved and retrieved by the show page.


### Add fields to post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/55ef9b2bce1b698a8aad524ebba301374a7d38ff)

#### app/models/post.js

```diff
{% raw %} import DS from 'ember-data';
 
 export default DS.Model.extend({
-
+  title: DS.attr(),
+  body: DS.attr(),
 });{% endraw %}
```

We add the title and body fields to the post model, so now it's saved by the new page.

Outer red: Your Ember app tried to GET '/posts/1', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file.

The next error is in Mirage again: we now get to the post show page, but Mirage isn't configured to retrieve a post by ID.


### Add mirage get post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/b6d04b0daf6bc9ae33e9209226a470dfe975c6a5)

#### mirage/config.js

```diff
{% raw %} export default function() {
+  this.get('/posts/:id');
   this.post('/posts');
 }{% endraw %}
```

Outer green

We configure Mirage to return a post retrieved by ID, and the acceptance test passes. We've successfully let our acceptance test drive out the behavior of this feature!

