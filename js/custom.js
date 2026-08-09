"use strict";
(function ($) {
  document.documentElement.classList.add("js");

  var brandTitle = document.querySelector(".header-title .title a");
  var brandSubtitle = document.querySelector(".header-title .subtitle");
  var sidebarName = document.querySelector(".author-name");
  var footerAuthor = document.querySelector(".footer .copyright .author");
  var themeColor = document.querySelector('meta[name="theme-color"]');
  var archiveCount = document.querySelector(".archives-count a");
  var categoryCount = document.querySelector(".categories-count a");
  var tagCount = document.querySelector(".tags-count a");

  if (brandTitle) brandTitle.textContent = "CHANGHAO / JU";
  if (brandSubtitle) brandSubtitle.textContent = "Computer Science · BUAA";
  if (sidebarName) sidebarName.textContent = "琚长昊 · Changhao";
  if (footerAuthor) footerAuthor.textContent = "Changhao Ju";
  if (themeColor) themeColor.setAttribute("content", "#17352f");
  if (archiveCount) archiveCount.textContent = "8";
  if (categoryCount) categoryCount.textContent = "4";
  if (tagCount) tagCount.textContent = "5";
  document.title = document.title.replace("Game & Coding - 随便写写", "Changhao Ju · Personal Website");

  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px" });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  var copyrightYear = document.querySelector(".footer .copyright .year");
  if (copyrightYear) {
    copyrightYear.innerHTML = '<i class="far fa-copyright"></i>2024 - ' + new Date().getFullYear();
  }


})(jQuery);
