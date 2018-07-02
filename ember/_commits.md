### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/1137f607951104e4a815a4d92a28590059a44b66)

#### tests/acceptance/creating-a-blog-post-test.js

```diff
{% raw %} import { module, test } from 'qunit';
-import { visit, currentURL } from '@ember/test-helpers';
+import { visit, fillIn, click, find, currentRouteName } from '@ember/test-helpers';
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
+      find('.js-post-detail-title').textContent.includes('Test Post'),
+      'Title not found'
+    );
+    assert.ok(
+      find('.js-post-detail-body').textContent.includes('This post is a test!'),
+      'Body not found'
+    );
   });
 });{% endraw %}
```

We set up the entire acceptance test at once. This test will guide us through the rest of the unit testing and implementation of the feature.

Red: UnrecognizedURLError: /posts/new


### Add new blog post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/c9778e18842d60be7def88b85684f99d2141b5cf)

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


### Add post-form component scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/5ab4f451cadf9180806f1733c7248d53eeca037a)

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


### Specify form component should render the form [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/91d8563f4e6363a9ec629a19dbd1ea04616900b1)

#### tests/integration/components/post-form-test.js

```diff
{% raw %} import { module, test } from 'qunit';
 import { setupRenderingTest } from 'ember-qunit';
-import { render } from '@ember/test-helpers';
+import { render, findAll } from '@ember/test-helpers';
 import hbs from 'htmlbars-inline-precompile';
 
 module('Integration | Component | post-form', function(hooks) {
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
+    const title = findAll('.js-post-form-title');
+    assert.equal(title.length, 1, 'Element .js-post-form-title not found');
 
-    assert.equal(this.element.textContent.trim(), 'template block text');
+    const body = findAll('.js-post-form-body');
+    assert.equal(body.length, 1, 'Element .js-post-form-body not found');
   });
 });{% endraw %}
```

We create a component test that reproduces the acceptance test error.

We also go ahead and specify the body field as well, even though that's not strictly necessary to reproduce the current acceptance error. We're pretty sure it'll error out on that field missing too, so this is a case where it's safe to go ahead and specify it at the unit level.

Inner red:
Element .js-post-form-title not found
Element .js-post-form-body not found


### Add form component markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/82c30146c25863e80f89c3ce37677f017b651287)

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


### Specify the component should call the save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/c7dd2fc107d991a164b384bb96f3bf75b8e59d4e)

#### tests/integration/components/post-form-test.js

```diff
{% raw %} import { module, test } from 'qunit';
 import { setupRenderingTest } from 'ember-qunit';
-import { render, findAll } from '@ember/test-helpers';
+import { render, findAll, click } from '@ember/test-helpers';
 import hbs from 'htmlbars-inline-precompile';
 
 module('Integration | Component | post-form', function(hooks) {
...
     const body = findAll('.js-post-form-body');
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


### Add submitForm action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/ef2a4d2ccf9d56998b2a58472d920f57503a7f1a)

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

Inner green; outer red: TypeError: this.get(...) is not a function

Now our component test is able to verify that the submit handler is called. Now the acceptance test errors out because submitting the form expects a submitHandler to be passed in, and there isn't one.


### Add new post controller for save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/25246a9c230e2eb8e489cb79947e3de0e4069ffa)

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


### Transition to show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/d25d5214d98945c23010877c1ed13882529b2c49)

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


### Add posts.show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/23745d6a2743972e64ffe1958225d7bbe1ac10c3)

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


### Add detail component scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/8cbc01260453c92edfd156d576a01a1369f8a228)

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


### Specify detail component should display model fields [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/a32dbdcffa027688b464a0b18aba5dedbfa8f23d)

#### tests/integration/components/post-detail-test.js

```diff
{% raw %} import { module, test } from 'qunit';
 import { setupRenderingTest } from 'ember-qunit';
-import { render } from '@ember/test-helpers';
+import { render, find } from '@ember/test-helpers';
 import hbs from 'htmlbars-inline-precompile';
 
 module('Integration | Component | post-detail', function(hooks) {
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
+      find('.js-post-detail-title').textContent.includes('Test Title'),
+      'Title not found'
+    );
+    assert.ok(
+      find('.js-post-detail-body').textContent.includes('This is a test post!'),
+      'Body not found'
+    );
   });
 });{% endraw %}
```

We add a component test that reproduces the acceptance test error: we specify that the component displays the post's title. And we go ahead and specify that it displays the body, too, because that seems safe in this case.

Inner red: Cannot read property 'textContent' of null

This means that the title field was not found, to be able to retrieve the textContent from it.


### Add post detail display markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/0a8de4786f16d8190e891cd952e2fc1f07daedca)

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


### Hook routes into post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/b88d51014b55457e633291068f358a6df4def845)

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


### Add post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/e7379742d1bab8a5e7c992aedfdaef3db2ede9f5)

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


### Add post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/e321178c8354480836929e13cd5c7ee838f6ed77)

#### mirage/config.js

```diff
{% raw %} export default function() {
+  this.post('/posts');
 }{% endraw %}
```

Outer red: Your Ember app tried to GET '/posts/1', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file. Did you forget to add your namespace?

The next error is in Mirage again: we now get to the post show page, but Mirage isn't configured to retrieve a post by ID.


### Add mirage get post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/10d489f9611aeb648b64069ca34953bd0f2ac276)

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


### Specify form should send the form data [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/730f5a0fb930adee5ef9890c5e176815084689be)

#### tests/integration/components/post-form-test.js

```diff
{% raw %} import { module, test } from 'qunit';
 import { setupRenderingTest } from 'ember-qunit';
-import { render, findAll, click } from '@ember/test-helpers';
+import { render, findAll, fillIn, click } from '@ember/test-helpers';
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


### Send post form data to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/0c0d1975d9d69d84fb82c2577a61e34658202e5c)

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


### Specify show page should display model from the database [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/065519ccb0923a80e57b255cbac16fd0d33bde9b)

#### tests/acceptance/viewing-a-blog-post-test.js

```diff
{% raw %}+import { module, test } from 'qunit';
+import { visit, find } from '@ember/test-helpers';
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
+      find('.js-post-detail-title').textContent.includes('Test Post'),
+      'Title not found'
+    );
+    assert.ok(
+      find('.js-post-detail-body').textContent.includes('This post is a test!'),
+      'Body not found'
+    );
+  });
+});{% endraw %}
```

Outer red: Title not found

We create a new acceptance test for viewing a page. We use Mirage's `server.create()` method to create a test post directly in our fake backend. We specify
that, when the post view page is shown, the post's title and body are visible.

The test fails because no title is being outputted on the page. This is the problem that happens when we don't define attributes on our model.


### Add attributes to model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/e02a08912dc2e68c3fca5bffba074480b5763244)

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

