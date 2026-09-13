(function () {
  "use strict";

  var TONE_KEY = "hrushike_tone";
  var DEFAULT_TONE = "dry";

  var toneData = {};
  try {
    var el = document.getElementById("tone-data");
    if (el) toneData = JSON.parse(el.textContent);
  } catch (e) {}

  function applyTone(name) {
    document.documentElement.setAttribute("data-tone", name);
    try {
      localStorage.setItem(TONE_KEY, name);
    } catch (e) {}
    var pack = toneData[name] || {};
    var nodes = document.querySelectorAll("[data-tone-text]");
    for (var j = 0; j < nodes.length; j++) {
      var key = nodes[j].getAttribute("data-tone-text");
      if (pack[key] != null) nodes[j].textContent = pack[key];
    }
  }

  applyTone(DEFAULT_TONE);

  var overlay = document.getElementById("shortcuts");
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  }

  document.addEventListener("keydown", function (e) {
    var tag = e.target && e.target.tagName;
    var typing = tag === "INPUT" || tag === "TEXTAREA";

    if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey && !typing) {
      e.preventDefault();
      if (overlay) overlay.classList.toggle("open");
    }
    if (e.key === "Escape" && overlay) overlay.classList.remove("open");
  });

  // —— On this day (one fact + plate) ——
  var otd = document.getElementById("on-this-day");
  if (otd) {
    var dateEl = document.getElementById("otd-date");
    var headsEl = document.getElementById("otd-heads");
    var photoEl = document.getElementById("otd-photo");
    var imgEl = document.getElementById("otd-img");
    var capEl = document.getElementById("otd-cap");
    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var today = new Date();
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var dd = String(today.getDate()).padStart(2, "0");

    if (dateEl) {
      dateEl.textContent = MONTHS[today.getMonth()] + " " + today.getDate();
    }

    function stripHtml(s) {
      return String(s || "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    function scoreEvent(ev) {
      var s = 0;
      if (ev.year && ev.year < 2000) s += 2;
      if (ev.year && ev.year < 1950) s += 2;
      if (ev.pages && ev.pages[0] && ev.pages[0].thumbnail) s += 8;
      if (ev.text && ev.text.length > 60) s += 1;
      return s;
    }

    fetch("https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/" + mm + "/" + dd, {
      headers: { Accept: "application/json", "Api-User-Agent": "hrushike.sh (personal site)" },
    })
      .then(function (r) {
        if (!r.ok) throw new Error("otd");
        return r.json();
      })
      .then(function (data) {
        var list = (data.selected || data.events || []).slice().sort(function (a, b) {
          return scoreEvent(b) - scoreEvent(a);
        });
        var pick =
          list.filter(function (ev) {
            return ev.pages && ev.pages[0] && ev.pages[0].thumbnail;
          })[0] || list[0];

        if (!pick) {
          headsEl.innerHTML = "<p class='mono'>wire silent — try refresh</p>";
          return;
        }

        var page = pick.pages && pick.pages[0];
        var title = page ? stripHtml(page.displaytitle) : "";
        var text = String(pick.text || "")
          .replace(/\s+/g, " ")
          .trim();

        if (page && photoEl && imgEl && capEl) {
          var src =
            (page.thumbnail && page.thumbnail.source) ||
            (page.originalimage && page.originalimage.source) ||
            "";
          if (src) {
            imgEl.referrerPolicy = "no-referrer";
            imgEl.src = src;
            imgEl.alt = title || "historical plate";
            capEl.textContent = (pick.year != null ? pick.year + " · " : "") + (title || "archive plate");
            photoEl.hidden = false;
          }
        }

        headsEl.innerHTML = "";
        var art = document.createElement("article");
        art.className = "headline";
        var dateline = document.createElement("div");
        dateline.className = "dateline";
        dateline.textContent = pick.year != null ? String(pick.year) : "????";
        var h = document.createElement("h3");
        h.className = "hed";
        if (page && page.content_urls && page.content_urls.desktop) {
          var a = document.createElement("a");
          a.href = page.content_urls.desktop.page;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = text;
          h.appendChild(a);
        } else {
          h.textContent = text;
        }
        art.appendChild(dateline);
        art.appendChild(h);
        headsEl.appendChild(art);
      })
      .catch(function () {
        headsEl.innerHTML = "<p class='mono'>wire silent — try refresh</p>";
      });
  }
})();
