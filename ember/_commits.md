### Add acceptance test scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/5b8d472ccbcaeb2997d11e5fa288b053010b44d8)

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
+  it('can visit /creating-a-blog-post', function() {
+    visit('/creating-a-blog-post');
+
+    andThen(function() {
+      expect(currentPath()).to.equal('creating-a-blog-post');
+    });
+  });
+});{% endraw %}
```

`ember g acceptance-test creating-a-blog-post`


### Specify the feature for creating a blog post [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/48f8f9ce0ea79b0007fe6b8d0eedfcb67a35212f)

#### tests/acceptance/creating-a-blog-post-test.js

```diff
{% raw %}     destroyApp(application);
   });
 
-  it('can visit /creating-a-blog-post', function() {
-    visit('/creating-a-blog-post');
+  it('can create a blog post', function() {
+    visit('/posts/new');
+
+    fillIn('.js-post-form-title', 'Test Post');
+    fillIn('.js-post-form-body', 'This post is a test!');
+    click('.js-post-form-save');
 
     andThen(function() {
-      expect(currentPath()).to.equal('creating-a-blog-post');
+      expect(currentPath()).to.equal('posts.show');
+
+      expect(find('.js-post-detail-title').text()).to.include('Test Post');
+      expect(find('.js-post-detail-body').text()).to.include('This post is a test!');
     });
   });
 });{% endraw %}
```

We set up the entire acceptance test at once. This test will guide us through the rest of the unit testing and implementation of the feature.

Red: The URL '/posts/new' did not match any routes in your application


### Add new blog post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/447b3b9c0a70ff1158d51191183965110b401a91)

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

`ember g route posts/new`

We only change enough code to get to the next error message. Getting past the "no route" error only requires creating the route in the routes file.

Red: Element .post-title-input not found.

The next error is simple: no `.post-title-input` field is found to fill text into.


### Add post-form component scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/5e7621a281644d80ff84d95a726fc1ac54feca0c)

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
+    it('renders', function() {
+      // Set any properties with this.set('myProperty', 'value');
+      // Handle any actions with this.on('myAction', function(val) { ... });
+      // Template block usage:
+      // this.render(hbs`
+      //   {{#post-form}}
+      //     template content
+      //   {{/post-form}}
+      // `);
+
+      this.render(hbs`{{post-form}}`);
+      expect(this.$()).to.have.length(1);
+    });
+  }
+);{% endraw %}
```

`ember g component post-form`

Rather than just getting the test to pass by putting a form input on the route's template, we "write the code we wish we had." In this case, we wish we had a `post-form` component to use that would provide the form inputs for us. We generate it and go ahead and render it in our route template.


### Specify form component should render the form [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/9a190f012e408eb770da8f1f9d7e7903e3500ad9)

#### tests/integration/components/post-form-test.js

```diff
{% raw %}     integration: true
   },
   function() {
-    it('renders', function() {
-      // Set any properties with this.set('myProperty', 'value');
-      // Handle any actions with this.on('myAction', function(val) { ... });
-      // Template block usage:
-      // this.render(hbs`
-      //   {{#post-form}}
-      //     template content
-      //   {{/post-form}}
-      // `);
-
+    it('renders the form', function() {
       this.render(hbs`{{post-form}}`);
-      expect(this.$()).to.have.length(1);
+
+      var title = this.$('.js-post-form-title');
+      expect(title.length,
+             'Element .js-post-form-title not found'
+             ).to.equal(1);
+
+      var body = this.$('.js-post-form-body');
+      expect(body.length,
+             'Element .js-post-form-body not found'
+             ).to.equal(1);
     });
   }
 );{% endraw %}
```

We create a unit test for the component that reproduces the acceptance test error.

We also go ahead and specify the body field as well, even though that's not strictly necessary to reproduce the current acceptance error. We're pretty sure it'll error out on that field missing too, so this is a case where it's safe to go ahead and specify it at the unit level.

Inner red: Element .post-title-input not found: expected 0 to equal 1

The default error message isn't the same because the Ember component tests use a different framework than acceptance tests, so we write a custom error message to match more closely.


### Add form component markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/f5b0315b2916d3913212f5cf53bf9c3e269a40e5)

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
+  <button type="submit" class="js-post-form-save">Save</button>
+</form>{% endraw %}
```

Inner green; outer test hangs after submitting form

Now that we're rendering markup for the component, its unit test is able to find the title field and fill it in. The acceptance test also gets past the point of filling in the title, and now it hangs after clicking the save button. I'm not sure why, but I think it has to do with the fact that, since that form isn't wired up to any Ember behavior, the form is actually submitted in the browser, which closes down the Ember app. In any case, we need to get Ember handling the form submission.


### Specify the component should call the save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/434666f6fd7f908039c62e29660093405cd2a567)

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
 
+  /*
   it('can create a blog post', function() {
     visit('/posts/new');
 
...
       expect(find('.js-post-detail-body').text()).to.include('This post is a test!');
     });
   });
+  */
 });{% endraw %}
```


#### tests/integration/components/post-form-test.js

```diff
{% raw %}              'Element .js-post-form-body not found'
              ).to.equal(1);
     });
+
+    it('calls the submit handler', function() {
+      let submitHandlerCalled = false;
+      this.set('testSubmitHandler', () => {
+        submitHandlerCalled = true;
+      });
+
+      this.render(hbs`{{post-form submitHandler=(action testSubmitHandler)}}`);
+
+      this.$('.save-post').click();
+
+      expect(submitHandlerCalled,
+             "Expected submit handler to be called").to.be.true;
+    });
   }
 );{% endraw %}
```

Inner test hangs after submitting form

We reproduce the acceptance test error at the component level, which is unfortunately that the test hangs.

In order to get clear test output from the component test, we temporarily disable the acceptance test so it's only the component test causing the suite to hang.


### Call save handler from post form [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/e2166b7fa70364f7f72f2b4d0e3fabec4a0efa0f)

#### app/components/post-form.js

```diff
{% raw %} import Ember from 'ember';
 
 export default Ember.Component.extend({
+  actions: {
+    submitForm() {  
+      this.get('submitHandler')();
+    }
+  }
 });{% endraw %}
```


#### app/templates/components/post-form.hbs

```diff
{% raw %}-<form>
+<form {{action 'submitForm' on='submit'}}>
   <div>
     <label for="js-post-form-title">Title</label>
     <input type="text" class="js-post-form-title" />{% endraw %}
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
 
-  /*
   it('can create a blog post', function() {
     visit('/posts/new');
 
...
       expect(find('.js-post-detail-body').text()).to.include('This post is a test!');
     });
   });
-  */
 });{% endraw %}
```

We make the component test pass by setting the form to run the `save` action upon submit, and the `save` action of the component to run the passed-in `save` action closure.

We also re-enable the acceptance test, and confirm that it's no longer hanging:

Outer red: undefined is not a constructor (evaluating 'this.get('save')()')

Now it errors out because we aren't passing a save action closure into the component.


### Add new post controller for save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/e92ba857eb3b8f7c42b8204d4b1193c3b17ee581)

#### app/controllers/posts/new.js

```diff
{% raw %}+import Ember from 'ember';
+
+export default Ember.Controller.extend({
+  actions: {
+    savePost() {
+      this.transitionToRoute("posts.show");
+    }
+  }
+});{% endraw %}
```


#### app/templates/posts/new.hbs

```diff
{% raw %} <h1>New Post</h1>
 
-{{post-form}}
+{{post-form submitHandler=(action "savePost")}}{% endraw %}
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

`ember g controller posts/new`

We implement a save handler by adding a new post controller to put it in, adding the handler, then passing it into the form component.

Outer red: The route posts.show was not found

Now the acceptance test successfully attempts to transition to the `posts.show` route, but it doesn't yet exist.


### Add posts.show route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/708cf647e20a07a7a1f639364ef9f3453c8ab8c3)

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

`ember g route posts/show`

Outer red: expected '' to equal 'Test Post'

Now the acceptance test is able to display the `posts.show` route, but it can't find the post's title on the page, because we aren't rendering anything to the screen yet.


### Add detail component scaffold [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/80ab3405ecd0101ecb83be0d7d640a004f602380)

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
+    it('renders', function() {
+      // Set any properties with this.set('myProperty', 'value');
+      // Handle any actions with this.on('myAction', function(val) { ... });
+      // Template block usage:
+      // this.render(hbs`
+      //   {{#post-detail}}
+      //     template content
+      //   {{/post-detail}}
+      // `);
+
+      this.render(hbs`{{post-detail}}`);
+      expect(this.$()).to.have.length(1);
+    });
+  }
+);{% endraw %}
```

`ember g component post-detail`

Again, instead of making the acceptance test pass as quickly as possible, we "write the code we wish we had": a post display component.


### Specify detail component should display model fields [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/38f0753e6768e767aefaefabc20e632e089c5565)

#### tests/integration/components/post-detail-test.js

```diff
{% raw %}     integration: true
   },
   function() {
-    it('renders', function() {
-      // Set any properties with this.set('myProperty', 'value');
-      // Handle any actions with this.on('myAction', function(val) { ... });
-      // Template block usage:
-      // this.render(hbs`
-      //   {{#post-detail}}
-      //     template content
-      //   {{/post-detail}}
-      // `);
+    it('displays details for the passed-in post', function() {
+      this.set('testModel', {title: 'Test Title', body: 'This is a test post!'});
 
-      this.render(hbs`{{post-detail}}`);
-      expect(this.$()).to.have.length(1);
+      this.render(hbs`{{post-detail post=testModel}}`);
+      expect(this.$('.js-post-detail-title').text()).to.include('Test Title');
+      expect(this.$('.js-post-detail-body').text()).to.include('This is a test post!');
     });
   }
 );{% endraw %}
```

We add a component test that reproduces the acceptance test error: we specify that the component displays the post's title. And we go ahead and specify that it displays the body, too, because that seems safe in this case.

Inner red: expected '' to equal 'Test Title'


### Add post detail display markup [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/6b59744d5bc97bbeb16f9d8ce56f33d1076d5a4f)

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

Inner green; outer red: expected '' to equal 'Test Post'

The acceptance test still has the same error, because we aren't passing the model into the component.


### Hook routes into post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/045a9b40a028dda7e7fe6edafe10a4b9534e021f)

#### app/controllers/posts/new.js

```diff
{% raw %} 
 export default Ember.Controller.extend({
   actions: {
-    savePost() {
-      this.transitionToRoute("posts.show");
+    savePost(postData) {
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


### Add post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/bd8f5a399e48c69f5706760ecf4946cdc95feeba)

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

`ember g model post`

Outer red: Your Ember app tried to POST '/posts', but there was no route defined to handle this request. Define a route that matches this path in your mirage/config.js file.

Next we get an error from Mirage, our fake server. It needs a corresponding post creation endpoint created.


### Add mirage create post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/c71f84bb323f1fb361ad936ce9d67a1faab41598)

#### mirage/config.js

```diff
{% raw %} export default function() {
+  this.post('/posts');
 }{% endraw %}
```

Outer red: Pretender intercepted POST /posts but encountered an error: Mirage: The route handler for /posts is trying to access the post model, but that model doesn't exist. Create it using 'ember g mirage-model post'.

Now that Mirage has an endpoint, it returns another error: a Mirage model for `post` needs to be added too.


### Add mirage model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/bf770a5ef1b3834aa936f919e165860d8ffbe6db)

#### mirage/models/post.js

```diff
{% raw %}+import { Model } from 'ember-cli-mirage';
+
+export default Model.extend({
+});{% endraw %}
```

`ember g mirage-model post`

Outer red: Pretender intercepted POST /posts but encountered an error: Mirage: You're using a shorthand or #normalizedRequestAttrs, but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.x/serializers/#normalizejson

The next error is pretty obscure. What's happening is that no attributes are being sent in the create request, and Mirage is erroring out right away. We do want the `title` attribute to be sent, so this is a valid error situation.


### Specify form should send the form data [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/551be91eb2d89d10390b8388881501809e74ffa9)

#### tests/integration/components/post-form-test.js

```diff
{% raw %}              ).to.equal(1);
     });
 
-    it('calls the submit handler', function() {
+    it('calls the submit handler with the form data', function() {
       let submitHandlerCalled = false;
-      this.set('testSubmitHandler', () => {
+      this.set('testSubmitHandler', (postData) => {
         submitHandlerCalled = true;
+        expect(postData.title).to.equal('New Title');
+        expect(postData.body).to.equal('New Body');
       });
 
       this.render(hbs`{{post-form submitHandler=(action testSubmitHandler)}}`);
 
-      this.$('.save-post').click();
+      this.$('.js-post-form-title').val('New Title').blur();
+      this.$('.js-post-form-body').val('New Body').blur();
+      this.$('.js-post-form-save').click();
 
       expect(submitHandlerCalled,
              "Expected submit handler to be called").to.be.true;{% endraw %}
```

We add a component test case specifying that the post form should send the data from the form fields into the submit handler.

Inner red: undefined is not an object (evaluating 'postData.title')

This means that no postData object is being sent into the submit handler at all.


### Send post form data to save action [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/617a5694b0a54bf1ad5f931535aa9405aa980464)

#### app/components/post-form.js

```diff
{% raw %} 
 export default Ember.Component.extend({
   actions: {
-    submitForm() {  
-      this.get('submitHandler')();
+    submitForm() {
+      let postData = {
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
{% raw %} <form {{action 'submitForm' on='submit'}}>
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
 
   <button type="submit" class="js-post-form-save">Save</button>{% endraw %}
```

We get the component test to pass by making the input an Ember input helper, retrieving the saved value in it, and sending that in an object to the `save` action closure.

Inner green; outer red: Pretender intercepted POST /posts but encountered an error: Mirage: You're using a shorthand or #normalizedRequestAttrs, but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.0-beta.9/serializers/#normalizejson

Now the acceptance test still gives the same error, and in this case the tests aren't that helpful to guide us to why. What's going on is that the Ember Data `post` model doesn't have any fields defined on it, so it isn't saved and retrieved by the show page.


### Add fields to post model [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/b3f4eb34e701c8f2d94c975655298285ee8c00ac)

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


### Add mirage get post route [<span class="octicon octicon-mark-github"></span>](https://github.com/learn-tdd-in/ember/commit/d60e43f6219aab69a0339a87dfd5b445065f2b40)

#### mirage/config.js

```diff
{% raw %} export default function() {
+  this.get('/posts/:id');
   this.post('/posts');
 }{% endraw %}
```

Outer green

We configure Mirage to return a post retrieved by ID, and the acceptance test passes. We've successfully let our acceptance test drive out the behavior of this feature!

