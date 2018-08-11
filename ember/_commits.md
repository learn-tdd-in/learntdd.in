### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/9f2c03460cd4ac745a951fd5c3b4f2e5c3201fd7)

#### tests/acceptance/creating-a-blog-post-test.js

```diff
{% raw %} import { module, test } from 'qunit';
-import { visit, currentURL } from '@ember/test-helpers';
+import { visit, fillIn, click, currentRouteName } from '@ember/test-helpers';
 import { setupApplicationTest } from 'ember-qunit';
+import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
 
 module('Acceptance | creating a blog post', function(hooks) {
   setupApplicationTest(hooks);
+  setupMirage(hooks);
 
-  test('visiting /creating-a-blog-post', async function(assert) {
-    await visit('/creating-a-blog-post');
+  test('creating a blog post', async function(assert) {
+    await visit('/posts/new');
 
-    assert.equal(currentURL(), '/creating-a-blog-post');
+    await fillIn('.js-post-form-title', 'Test Post');
+    await fillIn('.js-post-form-body', 'This post is a test!');
+    await click('.js-post-form-save');
+
+    assert.equal(currentRouteName(), 'posts.show');
+    assert.dom('.js-post-detail-title').hasText('Test Post');
+    assert.dom('.js-post-detail-body').hasText('This post is a test!');
   });
 });{% endraw %}
```

We set up the entire acceptance test at once. This test will guide us through the rest of the unit testing and implementation of the feature.

Red: UnrecognizedURLError: /posts/new


### Add new blog post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/96911c4643815fdebfc58805297e226b5a59530a)

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
{% raw %}+import Route from '@ember/routing/route';
+
+export default Route.extend({
+});{% endraw %}
```


#### app/templates/posts/new.hbs

```diff
{% raw %}+{{outlet}}{% endraw %}
```

`ember g route posts/new`

We only change enough code to get to the next error message. Getting past the "no route" error only requires creating the route in the routes file.

Red: Element not found when calling `fillIn('.js-post-form-title')`

The next error is simple: no title form field is found to fill text into.


### Add post-form component scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/0f2d008c7e7157778500dc1a1bfd74de9c419870)

#### app/components/post-form.js

```diff
{% raw %}+import Component from '@ember/component';
+
+export default Component.extend({
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
{% raw %}+import { module, test } from 'qunit';
+import { setupRenderingTest } from 'ember-qunit';
+import { render } from '@ember/test-helpers';
+import hbs from 'htmlbars-inline-precompile';
+
+module('Integration | Component | post-form', function(hooks) {
+  setupRenderingTest(hooks);
+
+  test('it renders', async function(assert) {
+    // Set any properties with this.set('myProperty', 'value');
+    // Handle any actions with this.set('myAction', function(val) { ... });
+
+    await render(hbs`{{post-form}}`);
+
+    assert.equal(this.element.textContent.trim(), '');
+
+    // Template block usage:
+    await render(hbs`
+      {{#post-form}}
+        template block text
+      {{/post-form}}
+    `);
+
+    assert.equal(this.element.textContent.trim(), 'template block text');
+  });
+});{% endraw %}
```

`ember g component post-form`

Rather than just getting the test to pass by putting a form input on the route's template, we "write the code we wish we had." In this case, we wish we had a `post-form` component to use that would provide the form inputs for us. We generate it and go ahead and render it in our route template.


### Specify form component should render the form [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/475f54e69e0ca1d26ef256be085d3c5420cdb850)

#### tests/integration/components/post-form-test.js

```diff
{% raw %} module('Integration | Component | post-form', function(hooks) {
   setupRenderingTest(hooks);
 
-  test('it renders', async function(assert) {
-    // Set any properties with this.set('myProperty', 'value');
-    // Handle any actions with this.set('myAction', function(val) { ... });
-
+  test('it renders the form', async function(assert) {
     await render(hbs`{{post-form}}`);
 
-    assert.equal(this.element.textContent.trim(), '');
-
-    // Template block usage:
-    await render(hbs`
-      {{#post-form}}
-        template block text
-      {{/post-form}}
-    `);
-
-    assert.equal(this.element.textContent.trim(), 'template block text');
+    assert.dom('.js-post-form-title').exists();
+    assert.dom('.js-post-form-body').exists();
   });
 });{% endraw %}
```

We create a component test that reproduces the acceptance test error.

We also go ahead and specify the body field as well, even though that's not strictly necessary to reproduce the current acceptance error. We're pretty sure it'll error out on that field missing too, so this is a case where it's safe to go ahead and specify it at the unit level.

Inner red:
✘ Element .js-post-form-title exists
✘ Element .js-post-form-body exists


### Add form component markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/330db19d80377bfbfa2ab5f5a115ecd0dd94729c)

#### app/templates/components/post-form.hbs

```diff
{% raw %}-{{yield}}
+<form>
+  <div>
+    <label for="js-post-form-title">Title</label>
+    <input type="text" class="js-post-form-title" />
+  </div>
+  <div>
+    <label for="js-post-form-body">Body</label>
+    <textarea class="js-post-form-body" />
+  </div>
+
+  <button type="button" class="js-post-form-save">Save</button>
+</form>{% endraw %}
```

Inner green
Outer red: expected posts.show, actual posts.new

Now that we're rendering markup for the component, its unit test is able to find the title field and fill it in. The acceptance test also gets past the point of filling in the title, and now it reports that it expected to end up at the posts.show route, but it was still on the posts.new route. This is because we haven't told the component to do anything when the save button is clicked. We need to get Ember handling the form submission.


### Specify the component should call the save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/47c4960c01804fda2808b941dee01a2344008552)

#### tests/integration/components/post-form-test.js

```diff
{% raw %} import { module, test } from 'qunit';
 import { setupRenderingTest } from 'ember-qunit';
-import { render } from '@ember/test-helpers';
+import { render, click } from '@ember/test-helpers';
 import hbs from 'htmlbars-inline-precompile';
 
 module('Integration | Component | post-form', function(hooks) {
...
     assert.dom('.js-post-form-title').exists();
     assert.dom('.js-post-form-body').exists();
   });
+
+  test('it calls the submit handler', async function(assert) {
+    let submitHandlerCalled = false;
+    this.set('testSubmitHandler', () => {
+      submitHandlerCalled = true;
+    });
+
+    await render(hbs`{{post-form submitHandler=(action testSubmitHandler)}}`);
+
+    await click('.js-post-form-save');
+
+    assert.ok(submitHandlerCalled,
+          "Expected submit handler to be called");
+  });
 });{% endraw %}
```

We reproduce the acceptance test error at the component level:

Inner Red: Expected submit handler to be called

Our code doesn't refer to this submitHandler attribute yet, so it's never called.


### Add submitForm action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/94c0aba8a04c1d9d44e6f5b2598b6b837c7a416d)

#### app/components/post-form.js

```diff
{% raw %} import Component from '@ember/component';
 
 export default Component.extend({
+  actions: {
+    submitForm() {
+      this.submitHandler();
+    }
+  }
 });{% endraw %}
```


#### app/templates/components/post-form.hbs

```diff
{% raw %}     <textarea class="js-post-form-body" />
   </div>
 
-  <button type="button" class="js-post-form-save">Save</button>
+  <button type="button" class="js-post-form-save" onclick={{action 'submitForm'}}>Save</button>
 </form>{% endraw %}
```

To get the submitHandler called, we add a submitForm action on the component, so that it will be called when the form is submitted. Then we retrieve the "submitHandler" property of the component, and call it as a function.

Inner green; outer red: TypeError: this.submitHandler is not a function

Now our component test is able to verify that the submit handler is called. Now the acceptance test errors out because submitting the form expects a submitHandler to be passed in, and there isn't one.


### Add new post controller for save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/44468a4d5067fa4c500e8380cecea0dabaf37aa3)

#### app/controllers/posts/new.js

```diff
{% raw %}+import Controller from '@ember/controller';
+
+export default Controller.extend({
+  actions: {
+    savePost() {
+    }
+  }
+});{% endraw %}
```


#### app/templates/posts/new.hbs

```diff
{% raw %} <h1>New Post</h1>
 
-{{post-form}}
+{{post-form submitHandler=(action 'savePost')}}{% endraw %}
```

`ember g controller posts/new`

We implement a save handler by adding a new post controller to put it in, adding the handler, then passing it into the form component.

Outer red: expected posts.show, actual posts.new

Now the acceptance tests reports that the user isn't being transitioned to the posts.show route


### Transition to show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/cd0e7353854f5f2c2c6633dd01fc71cf75150a2e)

#### app/controllers/posts/new.js

```diff
{% raw %} export default Controller.extend({
   actions: {
     savePost() {
+      this.transitionToRoute('posts.show');
     }
   }
 });{% endraw %}
```

Outer red: The route posts.show was not found

Now the acceptance test successfully attempts to transition to the `posts.show` route, but it doesn't yet exist.


### Add posts.show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/b447ef4efc3258ae4f82f7a2a5e7ef140f8a5167)

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
{% raw %}+import Route from '@ember/routing/route';
+
+export default Route.extend({
+});{% endraw %}
```


#### app/templates/posts/show.hbs

```diff
{% raw %}+{{outlet}}{% endraw %}
```

`ember g route posts/show`

Outer red:
✘ Element .js-post-detail-title exists
✘ Element .js-post-detail-body exists

Now the acceptance test is able to display the `posts.show` route, but it can't find the post's title on the page, because we aren't rendering anything to the screen yet.


### Add detail component scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/247db55ffc40a8406988bcfb0ff1a3a06905b219)

#### app/components/post-detail.js

```diff
{% raw %}+import Component from '@ember/component';
+
+export default Component.extend({
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
{% raw %}+import { module, test } from 'qunit';
+import { setupRenderingTest } from 'ember-qunit';
+import { render } from '@ember/test-helpers';
+import hbs from 'htmlbars-inline-precompile';
+
+module('Integration | Component | post-detail', function(hooks) {
+  setupRenderingTest(hooks);
+
+  test('it renders', async function(assert) {
+    // Set any properties with this.set('myProperty', 'value');
+    // Handle any actions with this.set('myAction', function(val) { ... });
+
+    await render(hbs`{{post-detail}}`);
+
+    assert.equal(this.element.textContent.trim(), '');
+
+    // Template block usage:
+    await render(hbs`
+      {{#post-detail}}
+        template block text
+      {{/post-detail}}
+    `);
+
+    assert.equal(this.element.textContent.trim(), 'template block text');
+  });
+});{% endraw %}
```

`ember g component post-detail`

Again, instead of making the acceptance test pass as quickly as possible, we
 "write the code we wish we had": a post display component.


### Specify detail component should display model fields [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/6f843d868af5a9ff5a6d3a480540e6a5768c83c8)

#### tests/integration/components/post-detail-test.js

```diff
{% raw %} module('Integration | Component | post-detail', function(hooks) {
   setupRenderingTest(hooks);
 
-  test('it renders', async function(assert) {
-    // Set any properties with this.set('myProperty', 'value');
-    // Handle any actions with this.set('myAction', function(val) { ... });
+  test('it displays details for the passed-in post', async function(assert) {
+    this.set('testModel', {
+      title: 'Test Title',
+      body: 'This is a test post!',
+    });
 
-    await render(hbs`{{post-detail}}`);
+    await render(hbs`{{post-detail post=testModel}}`);
 
-    assert.equal(this.element.textContent.trim(), '');
-
-    // Template block usage:
-    await render(hbs`
-      {{#post-detail}}
-        template block text
-      {{/post-detail}}
-    `);
-
-    assert.equal(this.element.textContent.trim(), 'template block text');
+    assert.dom('.js-post-detail-title').hasText('Test Title');
+    assert.dom('.js-post-detail-body').hasText('This is a test post!');
   });
 });{% endraw %}
```

We add a component test that reproduces the acceptance test error: we specify that the component displays the post's title. And we go ahead and specify that it displays the body, too, because that seems safe in this case.

Inner red:
✘ Element .js-post-detail-title exists
✘ Element .js-post-detail-body exists

This means that the title field was not found, to be able to retrieve the textContent from it.


### Add post detail display markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/3c81d8f8712c95228e421c988db58d3efec4c185)

#### app/templates/components/post-detail.hbs

```diff
{% raw %}-{{yield}}
+<h2 class="js-post-detail-title">{{post.title}}</h2>
+
+<div class="js-post-detail-body">
+  {{post.body}}
+</div>{% endraw %}
```

We make the component test pass by adding markup to display the post.

Inner green; outer red:
✘ Element .js-post-detail-title has text "Test Post"
✘ Element .js-post-detail-body has text "This post is a test!"

The acceptance test still has the same error! Why's that? Well, we're not actually saving the post when we click save, and we aren't loading the post on the show page.


### Hook routes into post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/bcfc079235fb72ee103f32c3186ac14220b6c1a4)

#### app/controllers/posts/new.js

```diff
{% raw %} 
 export default Controller.extend({
   actions: {
-    savePost() {
-      this.transitionToRoute('posts.show');
+    async savePost(postData) {
+      let post = this.store.createRecord('post', postData);
+      await post.save();
+      this.transitionToRoute('posts.show', post.id);
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
+    this.route('show', { path: ':id' });
   });
 });
 {% endraw %}
```


#### app/routes/posts/show.js

```diff
{% raw %} import Route from '@ember/routing/route';
 
 export default Route.extend({
+  model({ id }) {
+    return this.store.findRecord('post', id);
+  }
 });{% endraw %}
```

This acceptance test error drives a lot of logic: to display the post's title on the show page, we need to save the post on the new page, include the ID in the transition to the show route, then load the post on the show page's model hook.

Outer red: Uncaught TypeError: Cannot read property 'create' of undefined

This isn't a very descriptive error, but it seems to be related to the fact that there _is_ no `post` model.


### Add post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/410c72d2f9fbd3a65e84e1ec61736d231db3e6ed)

#### app/models/post.js

```diff
{% raw %}+import DS from 'ember-data';
+
+export default DS.Model.extend({
+
+});{% endraw %}
```

`ember g model post`

Outer red: Your Ember app tried to POST '/posts', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file.

Next we get an error from Mirage, our fake server. It needs a corresponding post creation endpoint created.


### Add post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/67bf9ba8b13ad91f617b50b01b16ede490355dae)

#### mirage/config.js

```diff
{% raw %} export default function() {
+  this.post('/posts');
 }{% endraw %}
```

Outer red: Your Ember app tried to GET '/posts/1', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file. Did you forget to add your namespace?

The next error is in Mirage again: we now get to the post show page, but Mirage isn't configured to retrieve a post by ID.


### Add mirage get post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/a432848e13861aac81eba8f2d710b44d619941b3)

#### mirage/config.js

```diff
{% raw %} export default function() {
   this.post('/posts');
+  this.get('/posts/:id');
 }{% endraw %}
```

We configure Mirage to return a post retrieved by ID. This allows the post detail screen to be displayed.

Outer Red:
✘ Element .js-post-detail-title has text "Test Post"
✘ Element .js-post-detail-body has text "This post is a test!"

The title is not shown because the data from our create post form isn't actually submitted.


### Specify form should send the form data [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/50dbf7f0fd41786f35f23f674364a9041bf65a51)

#### tests/integration/components/post-form-test.js

```diff
{% raw %} import { module, test } from 'qunit';
 import { setupRenderingTest } from 'ember-qunit';
-import { render, click } from '@ember/test-helpers';
+import { render, fillIn, click } from '@ember/test-helpers';
 import hbs from 'htmlbars-inline-precompile';
 
 module('Integration | Component | post-form', function(hooks) {
...
     assert.dom('.js-post-form-body').exists();
   });
 
-  test('it calls the submit handler', async function(assert) {
+  test('it calls the submit handler with the form data', async function(assert) {
     let submitHandlerCalled = false;
-    this.set('testSubmitHandler', () => {
+    this.set('testSubmitHandler', postData => {
       submitHandlerCalled = true;
+      assert.equal(postData.title, 'New Title');
+      assert.equal(postData.body, 'New Body');
     });
 
     await render(hbs`{{post-form submitHandler=(action testSubmitHandler)}}`);
 
+    await fillIn('.js-post-form-title', 'New Title');
+    await fillIn('.js-post-form-body', 'New Body');
     await click('.js-post-form-save');
 
     assert.ok(submitHandlerCalled,{% endraw %}
```

We add a component test case specifying that the post form should send the data from the form fields into the submit handler.

Inner red: Cannot read property 'title' of undefined

This means that no postData object is being sent into the submit handler at all.


### Send post form data to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/d50533aaba5ff163b4bfc9bf98ce73a57deeb03c)

#### app/components/post-form.js

```diff
{% raw %} export default Component.extend({
   actions: {
     submitForm() {
-      this.submitHandler();
+      const postData = {
+        title: this.title,
+        body: this.body,
+      };
+      this.submitHandler(postData);
     }
   }
 });{% endraw %}
```


#### app/templates/components/post-form.hbs

```diff
{% raw %} <form>
   <div>
     <label for="js-post-form-title">Title</label>
-    <input type="text" class="js-post-form-title" />
+    {{input type="text" class="js-post-form-title" value=title}}
   </div>
   <div>
     <label for="js-post-form-body">Body</label>
-    <textarea class="js-post-form-body" />
+    {{textarea class="js-post-form-body" value=body}}
   </div>
 
   <button type="button" class="js-post-form-save" onclick={{action 'submitForm'}}>Save</button>{% endraw %}
```

We get the component test to pass by making the input an Ember input helper, retrieving the saved value in it, and sending that in an object to the `save` action closure.

Inner green; outer green

The unit and acceptance test both pass. We've successfully let our acceptance test drive out the behavior of this feature!

Interestingly, note that the tests didn't drive us to actually add attributes to our Post model. Apparently Ember will allow assigning arbitrary attributes to a model in-memory and will preserve them. But we know we need those attributes to be defined.

The TDD way to approach this problem is to find the test that will demonstrate the problem with the attributes not being defined. In this case, a test of the post retrieval page pulling up a post from the backend will show the problem.


### Specify show page should display model from the database [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/95eb67325ac91ce26fc22566f3bf082fb5fa6c1a)

#### tests/acceptance/viewing-a-blog-post-test.js

```diff
{% raw %}+import { module, test } from 'qunit';
+import { visit } from '@ember/test-helpers';
+import { setupApplicationTest } from 'ember-qunit';
+import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
+
+module('Acceptance | viewing a blog post', function(hooks) {
+  setupApplicationTest(hooks);
+  setupMirage(hooks);
+
+  test('viewing a blog post', async function(assert) {
+    let post = server.create('post', {
+      title: 'Test Post',
+      body: 'This post is a test!'
+    });
+    await visit(`/posts/${post.id}`);
+
+    assert.dom('.js-post-detail-title').hasText('Test Post');
+    assert.dom('.js-post-detail-body').hasText('This post is a test!');
+  });
+});{% endraw %}
```

Outer red:
✘ Element .js-post-detail-title has text "Test Post"
✘ Element .js-post-detail-body has text "This post is a test!"

We create a new acceptance test for viewing a page. We use Mirage's `server.create()` method to create a test post directly in our fake backend. We specify
that, when the post view page is shown, the post's title and body are visible.

The test fails because no title is being outputted on the page. This is the problem that happens when we don't define attributes on our model.


### Add attributes to model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/93004e648f6e3a6ad1c0473fa1cad99d54ebd44a)

#### app/models/post.js

```diff
{% raw %} import DS from 'ember-data';
 
 export default DS.Model.extend({
-
+  title: DS.attr(),
+  body: DS.attr(),
 });{% endraw %}
```

Outer green

We add title and body attributes to our model, and now both the title and body are shown on the get page. Our last bug is squashed!

