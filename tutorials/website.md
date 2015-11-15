### How to build a website with Malibu

Hello! This tutorial will show you how all Malibu sites work. The Malibu framework is very loose and doesn't make you do things in any particular way. However, there is a set of best practices described below and a few tools that should help developing a stable one-page app.

A typical web page is composed of three different types of code, all interacting with one another: Javascript, CSS and HTML. Each of them has it's strengths and weaknesses. The method tries to use all three in the most effective way. 

##HTML

Everything starts with HTML. Many web apps these days tend to bypass the HTML document and generate the entire content and look of the website in Javascript. We prefer to use the HTML structure a bit more than that, because a static HTML document with a hierarchy of tags and content is SEO friendly and because it is easily editable even by non-programmers.

However in many cases, keeping the HTML minimal and generating the content in JS is a better solution. One such case is if the content comes from external CMS (in form of a JSON file for example), or if the website is designed to be adapted to multiple language versions. This needs to be decisions taken on a case-by-case basis.

Working with Malibu the only thing we need to do in HTML is to define a set of sections. Typically a view in HTML is represented by a section tag with an id, ex:
```
<section id='home-page'></section>
```
Depending on the strategy we adopt above, we will fill this tag with HTML content or leave it empty, to be populated dynamically in JS, or anything in between. In other cases a `header` or `footer` or `nav` tag can also be used. 

In Malibu those sections tags together with a CSS style sheet and a Javascript class form the basic building block: a __view__.

##Views

Each project consists of a number sections that can be considered spearate __views__. There is an art in making good decisons on how to split the website into views and sometimes the initial plan needs to be changed afterwards - a big view needs to be split into smaller one, or two small views need to be grouped into one larger.

A typical approach consists of treating each section of a site as a separate view and additionally creating views for such elements as footers, headers & menus. Larger sections can also be split into serveral views. Then, depending on the design, sometimes it makes sense to have a background as a separate view or an overlay video player, etc...

What is important is to take a moment to think each project through and take desicions based on the specific needs of the project.

However the views end up being organized there is one primary rule that should always be observed: in code, no view should ever hold a reference to another view. In fact, no reference to the views should exist anywhere in the code.

Here's a base pattern to build a view class in Malibu:
```
var SomeView = function($) {
    var container = EXT.select('#someView');
    Application.route.on(function(current, last) {
        if(current.lastPart == 'someView') {
            container.ext.show();
        } else if(last.lastPart == 'someView') {
            container.ext.hide();
        }
    });
}
```

Now, in the main class, or wherever in code the site is booted, we can create an instance of the view like this:

```
SomeView($);
```

Note that a reference to the object is not even kept - the is now `var view =  ` at the beginning of each line. We just call the function and do not save the return value. This helps to keep things organized - if you do not have a reference to an object, you can't pass it around a create a mess of cross references, right?

##Communication

Now that we have views perfectly separated from each other, we need to establish a way for the to send and receive messages and talk to each other.

_The `$` object is called a state object, nothing to do with jQuery. We'll get back to this one shortly._

####Application

There is a routing system that is built into the framework. It exists in the global `Application` object as a value called `route` and trigger called `navigate`. To move to another page of the site, just trigger `navigate`:

```
Application.navigate.trigger('home');
```

To listen to the routing changes, use  `route`:

```
Application.route.on(function(current, last) {
        if(current.lastPart == 'home') {
            // Chewy, we're home!
        } else if(last.lastPart == 'home') {
            // We just left home.
        }
    });
}
```

_Please refer to the documentation of the [Value](Value.html) and [Trigger](Trigger.html) classes for details._

####State

The other way to establish communication in the app is through a state object. A state object doesn't have any specific type or structure, but is typically named `$` and is a loose collection of Values, Triggers and primitive values such as numbers, booleans or strings.

With all this in mind, our typical startup code will look something like this:

```
var $ = {
    onVideoStarted: new Trigger(),
    onVideoEnded: new Trigger(),
    soundVolume: new Value(1),
    menuOpen: new Value(false),
    introPlayed: false
}

Menu($);
Header($);
Footer($);
HomePage($);
SubPage($);

Application.init();
```

As you can see, there is a state object that declares two triggers, a value and a simple boolean. It is then passed as argument to each view constructor. 

_One more rule that is worth keeping in mind is that the state object should not be altered inside the views - no properties should be added to it outside of this startup declaration._

At the end we call `Application.init()` which starts the app and initializes the routing.

####Changing the state and managing the state changes

Each view is free to alter the values of the state object and expect other views to listen to those changes. For example, a video player view, when the video starts could trigger the property from the example above like this:

```
$.onVideoStarted.trigger()
```

Then, to continue the example, another view, that has some sort of background sound playing, can listen to this change an act accordingly:

```
$.onVideoStarted.on(function() {
    backgroundSound.mute();
});
```

Of course other views, that do not play any sounds are free to ignore this event and not even listen to when it changes. 

Most views will need to listen to routing changes however, to be able to see which page of the app we are on and if they should do anything about it. A view that prepresents a page will oviously show up or hide based on the routing value. A navigation view can use this infomration ot highlight the current section. Yet, a footer view for example can sometimes ignore the routing info, if the footer is persisten across all pages. 

Another example is an event that tells the views when the user opens some sort of overlay navigation (ex. user clicks on a hamburger menu icon to open a dock). Very often the current section needs to react somehow - pause a video if it is playing, maybe disable some mouse effects or fade in a black overlay on it's content. This is a good use case to create a value in the stage object:

```
$.menuOpen = new Value(false)
```

Then views representing the pages, can listen to this even like this:

```
$.menuOpen.on(function(current) {
    if(current) // Menu is open
    else // Menu is closed
});
```

The navgation view, or any other view that has a functionality to either open or close the navigation dock, can then just change the value of this object:

```
$.menuOpen.value = true; // or false...
```











