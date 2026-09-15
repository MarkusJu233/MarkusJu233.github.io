"use strict";
(function () {
  var body = document.body;
  if (!body.classList.contains("home-page")) return;

  var hero = document.querySelector(".home-hero");
  var chapters = Array.from(document.querySelectorAll("[data-chapter]"));
  var chapterLinks = Array.from(document.querySelectorAll(".chapter-nav a"));
  var motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  var framePending = false;
  var chapterTops = [];
  var heroDistance = 1;
  var documentEnd = 1;
  var activeIndex = -1;
  var lens = document.querySelector(".lens-track");
  var lensTopics = Array.from(document.querySelectorAll(".lens-topic"));
  var lensLabels = Array.from(document.querySelectorAll(".lens-labels span"));
  var lensTop = 0;
  var lensDistance = 1;
  var activeTopic = -1;

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function measure() {
    body.classList.toggle("motion-ready", !motionPreference.matches);
    var scrollY = window.scrollY;
    chapterTops = chapters.map(function (section) {
      return section.getBoundingClientRect().top + scrollY;
    });
    heroDistance = Math.max(1, hero.offsetHeight - hero.firstElementChild.offsetHeight);
    lensTop = lens.getBoundingClientRect().top + scrollY;
    lensDistance = Math.max(1, lens.offsetHeight - lens.firstElementChild.offsetHeight);
    documentEnd = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    requestFrame();
  }

  function paint() {
    framePending = false;
    var y = window.scrollY;
    // The chapter rail tracks reading position, not animation timing.
    var readingY = y + window.innerHeight * 0.32;
    var current = 0;
    chapterTops.forEach(function (top, index) {
      if (readingY >= top) current = index;
    });
    if (y >= documentEnd - 8) current = chapterTops.length - 1;
    if (current !== activeIndex) {
      chapterLinks.forEach(function (link, index) {
        if (index === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      activeIndex = current;
    }
    body.classList.toggle("has-scrolled", y > 24);
    body.style.setProperty("--read-progress", clamp(y / documentEnd, 0, 1).toFixed(4));

    if (motionPreference.matches) {
      body.style.setProperty("--hero-progress", "0");
      lensTopics.forEach(function (topic) {
        topic.removeAttribute("aria-hidden");
        topic.removeAttribute("style");
      });
      activeTopic = -1;
      return;
    }

    var nextTop = chapterTops[current + 1] || documentEnd + window.innerHeight;
    var fraction = clamp((readingY - chapterTops[current]) / Math.max(1, nextTop - chapterTops[current]), 0, 1);
    var depth = clamp((current + fraction) * 4 / (chapters.length - 1), 0, 4);
    body.style.setProperty("--hero-progress", clamp(y / heroDistance, 0, 1).toFixed(4));
    body.style.setProperty("--depth-turn", (-24 + depth * 26).toFixed(2) + "deg");
    body.style.setProperty("--depth-scale", (1 + depth * 0.065).toFixed(4));
    body.style.setProperty("--depth-shift", (-depth * 22).toFixed(2) + "px");
    body.style.setProperty("--layer-two", clamp(depth, 0.12, 1).toFixed(3));
    body.style.setProperty("--layer-three", clamp(depth - 0.8, 0, 1).toFixed(3));
    body.style.setProperty("--layer-four", clamp(depth - 1.8, 0, 1).toFixed(3));
    body.style.setProperty("--layer-five", clamp(depth - 2.8, 0, 1).toFixed(3));

    // A three-part, scroll-scrubbed shot. No timers or autoplay.
    var lensProgress = clamp((y - lensTop) / lensDistance, 0, 1);
    var rawPosition = lensProgress * (lensTopics.length - 1);
    var interval = Math.floor(rawPosition);
    // Hold each title in crisp focus before easing into the next depth plane.
    var blend = clamp((rawPosition - interval - 0.2) / 0.6, 0, 1);
    var topicPosition = interval + blend * blend * (3 - 2 * blend);
    lens.style.setProperty("--lens-turn", (-24 + lensProgress * 145).toFixed(2) + "deg");
    lens.style.setProperty("--lens-tilt", (56 - lensProgress * 40).toFixed(2) + "deg");
    lens.style.setProperty("--lens-scale", (0.88 + lensProgress * 0.2).toFixed(3));
    lensTopics.forEach(function (topic, index) {
      var distance = index - topicPosition;
      topic.style.setProperty("--topic-y", (distance * 130).toFixed(2) + "px");
      topic.style.setProperty("--topic-scale", Math.max(0.82, 1 - Math.abs(distance) * 0.14).toFixed(3));
      topic.style.setProperty("--topic-opacity", clamp(1 - Math.abs(distance) * 1.7, 0, 1).toFixed(3));
      topic.style.setProperty("--topic-blur", Math.min(8, Math.abs(distance) * 5).toFixed(2) + "px");
    });
    var topicIndex = Math.round(topicPosition);
    if (activeTopic !== topicIndex) {
      lensTopics.forEach(function (topic, index) { topic.setAttribute("aria-hidden", String(index !== topicIndex)); });
      lensLabels.forEach(function (label, index) { label.classList.toggle("is-active", index === topicIndex); });
      activeTopic = topicIndex;
    }
  }

  function requestFrame() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(paint);
  }

  // Never intercept wheel/touch events: anchors, keyboard and browser history work normally.
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("pageshow", measure);
  motionPreference.addEventListener("change", measure);
  if ("ResizeObserver" in window) {
    new ResizeObserver(measure).observe(document.getElementById("index"));
  }
  if (document.fonts) document.fonts.ready.then(measure);
  measure();
})();
