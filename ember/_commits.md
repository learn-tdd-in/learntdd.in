### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/b761d00dda0aef2b561bf08f2a570d7428369722)

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
+    assert.ok(
+      this.element.querySelector('.js-post-detail-title').textContent.includes('Test Post'),
+      'Title not found'
+    );
+    assert.ok(
+      this.element.querySelector('.js-post-detail-body').textContent.includes('This post is a test!'),
+      'Body not found'
+    );
   });
 });{% endraw %}
```

We set up the entire acceptance test at once. This test will guide us through the rest of the unit testing and implementation of the feature.

Red: UnrecognizedURLError: /posts/new


### Add new blog post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/732f9d0d51e0ea9b42755b4129dded13849f0d43)

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


### Add post-form component scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/7670d9f18ff48d869b0f990e9f7b15c9003ba128)

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


### Specify form component should render the form [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/61fa018cd74944bc26ebacf8ead8266a17057780)

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
+    const title = this.element.querySelectorAll('.js-post-form-title');
+    assert.equal(title.length, 1, 'Element .js-post-form-title not found');
 
-    assert.equal(this.element.textContent.trim(), 'template block text');
+    const body = this.element.querySelectorAll('.js-post-form-body');
+    assert.equal(body.length, 1, 'Element .js-post-form-body not found');
   });
 });{% endraw %}
```

We create a component test that reproduces the acceptance test error.

We also go ahead and specify the body field as well, even though that's not strictly necessary to reproduce the current acceptance error. We're pretty sure it'll error out on that field missing too, so this is a case where it's safe to go ahead and specify it at the unit level.

Inner red:
Element .js-post-form-title not found
Element .js-post-form-body not found


### Add form component markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/330bf1461b4a08d69ff6f920aa148f2f064ac220)

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


### Specify the component should call the save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/1db5e174083d6042f510c04d2258732c6771aede)

#### tests/integration/components/post-form-test.js

```diff
{% raw %} import { module, test } from 'qunit';
 import { setupRenderingTest } from 'ember-qunit';
-import { render } from '@ember/test-helpers';
+import { render, click } from '@ember/test-helpers';
 import hbs from 'htmlbars-inline-precompile';
 
 module('Integration | Component | post-form', function(hooks) {
...
     const body = this.element.querySelectorAll('.js-post-form-body');
     assert.equal(body.length, 1, 'Element .js-post-form-body not found');
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


### Add submitForm action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/755414d7e3b99771183be8c24acd4d6d152cde93)

#### app/components/post-form.js

```diff
{% raw %} import Component from '@ember/component';
 
 export default Component.extend({
+  actions: {
+    submitForm() {
+      this.get('submitHandler')();
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

Inner green; outer red: TypeError: this.get(...) is not a function

Now our component test is able to verify that the submit handler is called. Now the acceptance test errors out because submitting the form expects a submitHandler to be passed in, and there isn't one.


### Add new post controller for save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/ede36fdf6795519c470e9994b05997a1d74298cb)

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


### Transition to show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/7b87d2d99790040146a5893f4dabc7a643b45277)

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


### Add posts.show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/23025f00fdded33c5bfb520abee5bad4185930af)

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

Outer red: Title not found

Now the acceptance test is able to display the `posts.show` route, but it can't find the post's title on the page, because we aren't rendering anything to the screen yet.


### Add detail component scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/67181f218de50df340131dc64d913aee7a11321b)

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


### Specify detail component should display model fields [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/6a67efb7180afc545c97f2c8d6f08da71a93e5a2)

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
+    assert.ok(
+      this.element.querySelector('.js-post-detail-title').textContent.includes('Test Title'),
+      'Title not found'
+    );
+    assert.ok(
+      this.element.querySelector('.js-post-detail-body').textContent.includes('This is a test post!'),
+      'Body not found'
+    );
   });
 });{% endraw %}
```

We add a component test that reproduces the acceptance test error: we specify that the component displays the post's title. And we go ahead and specify that it displays the body, too, because that seems safe in this case.

Inner red: Cannot read property 'textContent' of null

This means that the title field was not found, to be able to retrieve the textContent from it.


### Add post detail display markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/9ec5be666a8cdfcf1446af992f13cf110f23036e)

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

Inner green; outer red: Title not found

The acceptance test still has the same error! Why's that? Well, we're not actually saving the post when we click save, and we aren't loading the post on the show page.


### Hook routes into post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/cf816074d8211dd6f78636d0b5fd6e1a1848f616)

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


### Add post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/7016c8b3072bea28576b44a4d35e1489b4dcb381)

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


### Add post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/a66744bd7fb558955d586ae5e5c8710676cc45d3)

#### mirage/config.js

```diff
{% raw %} export default function() {
+  this.post('/posts');
 }{% endraw %}
```

Outer red: Your Ember app tried to GET '/posts/1', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file. Did you forget to add your namespace?

The next error is in Mirage again: we now get to the post show page, but Mirage isn't configured to retrieve a post by ID.


### Add mirage get post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/082f3fdf03d090be222da66c66616b113a2451ab)

#### mirage/config.js

```diff
{% raw %} export default function() {
   this.post('/posts');
+  this.get('/posts/:id');
 }{% endraw %}
```

We configure Mirage to return a post retrieved by ID. This allows the post detail screen to be displayed.

Outer Red: Title not found.

The title is not shown because the data from our create post form isn't actually submitted.


### Specify form should send the form data [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/620b53e09f7061bd13851d22b16f22f406853eb2)

#### tests/integration/components/post-form-test.js

```diff
{% raw %} import { module, test } from 'qunit';
 import { setupRenderingTest } from 'ember-qunit';
-import { render, click } from '@ember/test-helpers';
+import { render, fillIn, click } from '@ember/test-helpers';
 import hbs from 'htmlbars-inline-precompile';
 
 module('Integration | Component | post-form', function(hooks) {
...
     assert.equal(body.length, 1, 'Element .js-post-form-body not found');
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


### Send post form data to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/2a82ba4d545e4a76c2e92fd1a0bb92a9b20212d9)

#### app/components/post-form.js

```diff
{% raw %} export default Component.extend({
   actions: {
     submitForm() {
-      this.get('submitHandler')();
+      const postData = {
+        title: this.get('title'),
+        body: this.get('body'),
+      };
+      this.get('submitHandler')(postData);
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


### Specify show page should display model from the database [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/c2ebc11f5b0cb917c268f75faf5bf77e60428a5c)

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
+    assert.ok(
+      this.element.querySelector('.js-post-detail-title').textContent.includes('Test Post'),
+      'Title not found'
+    );
+    assert.ok(
+      this.element.querySelector('.js-post-detail-body').textContent.includes('This post is a test!'),
+      'Body not found'
+    );
+  });
+});{% endraw %}
```

Outer red: Title not found

We create a new acceptance test for viewing a page. We use Mirage's `server.create()` method to create a test post directly in our fake backend. We specify
that, when the post view page is shown, the post's title and body are visible.

The test fails because no title is being outputted on the page. This is the problem that happens when we don't define attributes on our model.


### Add attributes to model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/6b18216ab377218b3e179ef32509edd8036e0abf)

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

