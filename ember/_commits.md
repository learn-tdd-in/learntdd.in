### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/cddb0e8dbe7c6afa776c40cb539500e924f12aae)

#### tests/acceptance/creating-a-blog-post-test.js

```diff
{% raw %} 
 moduleForAcceptance('Acceptance | creating a blog post');
 
-test('visiting /creating-a-blog-post', function(assert) {
-  visit('/creating-a-blog-post');
+test('creating a blog post', function(assert) {
+  visit('/posts/new');
+
+  fillIn('.js-post-form-title', 'Test Post');
+  fillIn('.js-post-form-body', 'This post is a test!');
+  click('.js-post-form-save');
 
   andThen(function() {
-    assert.equal(currentURL(), '/creating-a-blog-post');
+    assert.equal(currentPath(), 'posts.show');
+    assert.ok(
+      find('.js-post-detail-title').text().includes('Test Post'),
+      'Title not found'
+    );
+    assert.ok(
+      find('.js-post-detail-body').text().includes('This post is a test!'),
+      'Body not found'
+    );
   });
 });{% endraw %}
```

We set up the entire acceptance test at once. This test will guide us through the rest of the unit testing and implementation of the feature.

Red: The URL '/posts/new' did not match any routes in your application


### Add new blog post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/457ec9966de5ccd25e9c5a60632bff33da020a05)

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

Red: Element .js-post-form-title not found.

The next error is simple: no title form field is found to fill text into.


### Add post-form component scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/0ef9bad2a721a723743f9675c201350f234eb7e3)

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
{% raw %}+import { moduleForComponent, test } from 'ember-qunit';
+import hbs from 'htmlbars-inline-precompile';
+
+moduleForComponent('post-form', 'Integration | Component | post form', {
+  integration: true
+});
+
+test('it renders', function(assert) {
+  // Set any properties with this.set('myProperty', 'value');
+  // Handle any actions with this.on('myAction', function(val) { ... });
+
+  this.render(hbs`{{post-form}}`);
+
+  assert.equal(this.$().text().trim(), '');
+
+  // Template block usage:
+  this.render(hbs`
+    {{#post-form}}
+      template block text
+    {{/post-form}}
+  `);
+
+  assert.equal(this.$().text().trim(), 'template block text');
+});{% endraw %}
```

`ember g component post-form`

Rather than just getting the test to pass by putting a form input on the route's template, we "write the code we wish we had." In this case, we wish we had a `post-form` component to use that would provide the form inputs for us. We generate it and go ahead and render it in our route template.


### Specify form component should render the form [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/55038ce5575e472b2b7a79a8edec7d8d79dbe0ec)

#### tests/integration/components/post-form-test.js

```diff
{% raw %}   integration: true
 });
 
-test('it renders', function(assert) {
-  // Set any properties with this.set('myProperty', 'value');
-  // Handle any actions with this.on('myAction', function(val) { ... });
-
+test('renders the form', function(assert) {
   this.render(hbs`{{post-form}}`);
 
-  assert.equal(this.$().text().trim(), '');
-
-  // Template block usage:
-  this.render(hbs`
-    {{#post-form}}
-      template block text
-    {{/post-form}}
-  `);
+  const title = this.$('.js-post-form-title');
+  assert.equal(title.length, 1, 'Element .js-post-form-title not found');
 
-  assert.equal(this.$().text().trim(), 'template block text');
+  const body = this.$('.js-post-form-body');
+  assert.equal(body.length, 1, 'Element .js-post-form-body not found');
 });{% endraw %}
```

We create a unit test for the component that reproduces the acceptance test error.

We also go ahead and specify the body field as well, even though that's not strictly necessary to reproduce the current acceptance error. We're pretty sure it'll error out on that field missing too, so this is a case where it's safe to go ahead and specify it at the unit level.

Inner red:
Element .js-post-form-title not found
Element .js-post-form-body not found


### Add form component markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/0b89ea9a17b8e8ae0517731a2de999097ec2952d)

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

Inner green; outer test hangs after submitting form

Now that we're rendering markup for the component, its unit test is able to find the title field and fill it in. The acceptance test also gets past the point of filling in the title, and now it hangs after clicking the save button. I'm not sure why, but I think it has to do with the fact that, since that form isn't wired up to any Ember behavior, the form is actually submitted in the browser, which closes down the Ember app. In any case, we need to get Ember handling the form submission.


### Specify the component should call the save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/290fc140accaa4948a87e7e2b96ba6b6b00a72b6)

#### tests/integration/components/post-form-test.js

```diff
{% raw %}   const body = this.$('.js-post-form-body');
   assert.equal(body.length, 1, 'Element .js-post-form-body not found');
 });
+
+test('calls the submit handler', function(assert) {
+  let submitHandlerCalled = false;
+  this.set('testSubmitHandler', () => {
+    submitHandlerCalled = true;
+  });
+
+  this.render(hbs`{{post-form submitHandler=(action testSubmitHandler)}}`);
+
+  this.$('.js-post-form-save').click();
+
+  assert.ok(submitHandlerCalled,
+         "Expected submit handler to be called");
+});{% endraw %}
```

We reproduce the acceptance test error at the component level:

Inner Red: Expected submit handler to be called

Ember doesn't complain about the fact that we don't actually have a "submitForm" action on the component; it just proceeds on its way. So our test's submit handler is never called.


### Add submitForm action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/11a3ba5a3e69b86c9f293b711d5e7430f40d50b5)

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


### Add new post controller for save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/8c898f0d6ab4a08d732a5a6028b69cc8f14137fd)

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


### Transition to show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/c047db742e2cf4c4462415c212c7ea488af30e92)

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


### Add posts.show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/49bfc972dcf33da2ade003dc2576c5fd347d9d3f)

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


### Add detail component scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/4bbcb91e84fecbe883ba4133eb108360744d7a63)

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
{% raw %}+import { moduleForComponent, test } from 'ember-qunit';
+import hbs from 'htmlbars-inline-precompile';
+
+moduleForComponent('post-detail', 'Integration | Component | post detail', {
+  integration: true
+});
+
+test('it renders', function(assert) {
+  // Set any properties with this.set('myProperty', 'value');
+  // Handle any actions with this.on('myAction', function(val) { ... });
+
+  this.render(hbs`{{post-detail}}`);
+
+  assert.equal(this.$().text().trim(), '');
+
+  // Template block usage:
+  this.render(hbs`
+    {{#post-detail}}
+      template block text
+    {{/post-detail}}
+  `);
+
+  assert.equal(this.$().text().trim(), 'template block text');
+});{% endraw %}
```

`ember g component post-detail`

Again, instead of making the acceptance test pass as quickly as possible, we
 "write the code we wish we had": a post display component.


### Specify detail component should display model fields [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/49e4a914c757fe3554e62f92bdc444b2a7f470b2)

#### tests/integration/components/post-detail-test.js

```diff
{% raw %}   integration: true
 });
 
-test('it renders', function(assert) {
-  // Set any properties with this.set('myProperty', 'value');
-  // Handle any actions with this.on('myAction', function(val) { ... });
+test('displays details for the passed-in post', function(assert) {
+  this.set('testModel', {title: 'Test Title', body: 'This is a test post!'});
 
-  this.render(hbs`{{post-detail}}`);
+  this.render(hbs`{{post-detail post=testModel}}`);
 
-  assert.equal(this.$().text().trim(), '');
-
-  // Template block usage:
-  this.render(hbs`
-    {{#post-detail}}
-      template block text
-    {{/post-detail}}
-  `);
-
-  assert.equal(this.$().text().trim(), 'template block text');
+  assert.ok(
+    this.$('.js-post-detail-title').text().includes('Test Title'),
+    'Title not found'
+  );
+  assert.ok(
+    this.$('.js-post-detail-body').text().includes('This is a test post!'),
+    'Body not found'
+  );
 });{% endraw %}
```

We add a component test that reproduces the acceptance test error: we specify that the component displays the post's title. And we go ahead and specify that it displays the body, too, because that seems safe in this case.

Inner red: Title not found


### Add post detail display markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/cdfc232dd2fe529a3922ba233c246a4fa7cdf594)

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


### Hook routes into post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/306ca7e2741fefc3f9837ef773e549b39e46dbb5)

#### app/controllers/posts/new.js

```diff
{% raw %} 
 export default Controller.extend({
   actions: {
-    savePost() {
-      this.transitionToRoute('posts.show');
+    savePost(postData) {
+      let post = this.store.createRecord('post', postData);
+      post.save().then((post) => {
+        this.transitionToRoute('posts.show', post.id);
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
+    this.route('show', { path: ':id' });
   });
 });
 {% endraw %}
```


#### app/routes/posts/show.js

```diff
{% raw %} import Route from '@ember/routing/route';
 
 export default Route.extend({
+  model(params) {
+    return this.store.findRecord('post', params.id);
+  }
 });{% endraw %}
```

This acceptance test error drives a lot of logic: to display the post's titl
e on the show page, we need to save the post on the new page, include the ID in
the transition to the show route, then load the post on the show page's model ho
ok.

Outer red: No model was found for 'post'

With this logic added, the acceptance test errors out quickly: there _is_ no
 `post` model.


### Add post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/e41c4c01a521e3b5aee1099da9dbd2467cf46451)

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


### Add post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/7726fc79205f158b64fc75380e72f262788f44f7)

#### mirage/config.js

```diff
{% raw %} export default function() {
+  this.post('/posts');
 }{% endraw %}
```

Outer red: Your Ember app tried to GET '/posts/1', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file. Did you forget to add your namespace?

The next error is in Mirage again: we now get to the post show page, but Mirage isn't configured to retrieve a post by ID.


### Add mirage get post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/6afb0f5e1efbc34a82f763d2a7d8fa85dc5d515b)

#### mirage/config.js

```diff
{% raw %} export default function() {
   this.post('/posts');
+  this.get('/posts/:id');
 }{% endraw %}
```

We configure Mirage to return a post retrieved by ID. This allows the post detail screen to be displayed, but no title is shown. This is because the data from our create post form isn't actually submitted.


### Specify form should send the form data [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/ef71fa1a2007e6d66bce9993cf6064e8fc4139a4)

#### tests/integration/components/post-form-test.js

```diff
{% raw %}   assert.equal(body.length, 1, 'Element .js-post-form-body not found');
 });
 
-test('calls the submit handler', function(assert) {
+test('calls the submit handler with the form data', function(assert) {
   let submitHandlerCalled = false;
-  this.set('testSubmitHandler', () => {
+  this.set('testSubmitHandler', (postData) => {
     submitHandlerCalled = true;
+    assert.equal(postData.title, 'New Title');
+    assert.equal(postData.body, 'New Body');
   });
 
   this.render(hbs`{{post-form submitHandler=(action testSubmitHandler)}}`);
 
+  this.$('.js-post-form-title').val('New Title').blur();
+  this.$('.js-post-form-body').val('New Body').blur();
   this.$('.js-post-form-save').click();
 
   assert.ok(submitHandlerCalled,{% endraw %}
```

We add a component test case specifying that the post form should send the data from the form fields into the submit handler.

Inner red: Cannot read property 'title' of undefined

This means that no postData object is being sent into the submit handler at all.


### Send post form data to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/20d880054a0fc5849b6bcec5a33857df18ef4a0a)

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


### Specify show page should display model from the database [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/b246cf06f9faa60a129e985fb8be21590db3b65a)

#### tests/acceptance/viewing-a-blog-post-test.js

```diff
{% raw %}+import { test } from 'qunit';
+import moduleForAcceptance from 'ember-tdd/tests/helpers/module-for-acceptance';
+
+moduleForAcceptance('Acceptance | viewing a blog post');
+
+test('viewing a blog post', function(assert) {
+  let post = window.server.create('post', {
+    title: 'Test Post',
+    body: 'This post is a test!'
+  });
+  visit(`/posts/${post.id}`);
+
+  return andThen(() => {
+    assert.ok(
+      find('.js-post-detail-title').text().includes('Test Post'),
+      'Title not found'
+    );
+    assert.ok(
+      find('.js-post-detail-body').text().includes('This post is a test!'),
+      'Body not found'
+    );
+  });
+});{% endraw %}
```

Outer red: expected '' to include 'Test Post'

We create a new acceptance test for viewing a page. We use Mirage's `server.create()` method to create a test post directly in our fake backend. We specify
that, when the post view page is shown, the post's title and body are visible.

The test fails because no title is being outputted on the page. This is the problem that happens when we don't define attributes on our model.


### Add attributes to model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/f5e207338f3e4860495e1a310b87f35799c7ed97)

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

