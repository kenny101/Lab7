// script.js

import { router } from "./router.js"; // Router imported so you can use it to manipulate your SPA app here
const setState = router.setState;


const settingsButton = document
  .querySelector("body")
  .querySelector("header")
  .querySelector("img");

const h1 = document.querySelector("h1");
const body = document.querySelector("body");

settingsButton.addEventListener("click", (event) => {
  if(history.state == null){
    setState("journal", "settings");
  }else{
    setState("single-entry", "settings");
  }
});

h1.addEventListener("click", (event) => {
  if(history.state.page == "settings"){
    setState("settings", "journal");
  }else{
    setState("single-entry", "journal");
  }
});


// Make sure you register your service worker here too
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

var CACHE_NAME = 'journal-entries';
var urlsToCache = [
  "https://cse110lab6.herokuapp.com/entries",
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});



self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

var journalEntries = document.querySelector("main").childNodes;

document.addEventListener("DOMContentLoaded", () => {
  fetch("https://cse110lab6.herokuapp.com/entries")
    .then((response) => response.json())
    .then((entries) => {
      entries.forEach((entry) => {
        let newPost = document.createElement("journal-entry");
        newPost.entry = entry;
        newPost.addEventListener("click", () => {

          for (var i = 0; i < journalEntries.length; i++) {
            if(newPost === journalEntries[i]){
              body.setAttribute("class", "single-entry");
              document.querySelector("entry-page").entry = newPost.entry;
              setState("journal", "single-entry", i+1);
            }
          }


        });
        document.querySelector("main").appendChild(newPost);
      });
    });
});
