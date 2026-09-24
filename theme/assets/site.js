// CUDA. Colour mode, page chrome, and the two diagrams lessons can drop in as tags:
//   <cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>
//   <sm-scheduler blocks="6" sms="3"></sm-scheduler>

(function(){
  var KEY = "cuda-mode", btn = document.getElementById("mode-toggle");
  function apply(mode){
    if (mode === "light") { document.documentElement.setAttribute("data-mode", "light"); }
    else { document.documentElement.removeAttribute("data-mode"); }
    if (btn) { btn.textContent = mode === "light" ? "dark" : "light"; }
    try { localStorage.setItem(KEY, mode); } catch (e) {}
  }
  apply(document.documentElement.getAttribute("data-mode") === "light" ? "light" : "dark");
  if (btn) btn.addEventListener("click", function(){
    apply(document.documentElement.getAttribute("data-mode") === "light" ? "dark" : "light");
  });
})();

(function(){
  var nav = document.querySelector("nav");
  if (!nav) { return; }
  var bar = nav.appendChild(document.createElement("div")), queued = false;
  bar.className = "progress";
  function draw(){
    queued = false;
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? Math.min(1, scrollY / h) * 100 : 0) + "%";
  }
  addEventListener("scroll", function(){ if (!queued) { queued = true; requestAnimationFrame(draw); } }, { passive: true });
  draw();
})();

document.querySelectorAll(".prose .highlight").forEach(function(box){
  var b = box.appendChild(document.createElement("button"));
  b.type = "button"; b.className = "copy"; b.textContent = "copy";
  b.addEventListener("click", function(){
    navigator.clipboard.writeText(box.querySelector("code").innerText).then(function(){
      b.textContent = "copied";
      setTimeout(function(){ b.textContent = "copy"; }, 1200);
    });
  });
});

// Every block is drawn as rows of 32 lanes, one row per warp, so a launch that
// is not a multiple of 32 shows the lanes the hardware still pays for.
var STEPS = [1, 2, 4, 8, 16, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024, 1536, 2048];
customElements.define("cuda-launch", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var el = this, fn = el.getAttribute("fn") || "kernel";
    var B = +el.getAttribute("blocks") || 1, T = +el.getAttribute("threads") || 1;
    var steps = STEPS.indexOf(T) < 0 ? STEPS.concat(T).sort(function(a, b){ return a - b; }) : STEPS;
    el.classList.add("dg");
    el.innerHTML =
      '<div class="dg-head"><code class="dg-call"></code><div class="dg-ctl">' +
      '<label>blocks <input type="range" min="1" max="8" value="' + B + '"></label>' +
      '<label>threads / block <input type="range" min="0" max="' + (steps.length - 1) + '" value="' + steps.indexOf(T) + '"></label>' +
      '</div></div><div class="dg-stats"></div><div class="dg-grid"></div>' +
      '<div class="dg-legend"><span><i style="background:var(--accent)"></i><i style="background:var(--cool)"></i><i style="background:#e3b341"></i><i style="background:#bc8cff"></i>warps 0 1 2 3, repeating</span><span><i style="background:var(--border)"></i>idle lane</span><span>one row = one warp = 32 lanes</span></div>' +
      '<div class="dg-read"></div>';
    var ins = el.querySelectorAll("input"), grid = el.querySelector(".dg-grid"), read = el.querySelector(".dg-read");
    var idle = "Hover or tap a lane to see the IDs that thread reads.";

    function draw(){
      B = +ins[0].value; T = steps[+ins[1].value];
      var W = Math.ceil(T / 32);
      el.querySelector(".dg-call").innerHTML = '<span class="fn">' + fn + '</span>&lt;&lt;&lt;<span class="n">' + B +
        '</span>, <span class="n">' + T + '</span>&gt;&gt;&gt;();';
      el.querySelector(".dg-stats").innerHTML = T > 1024 ? "<span>gridDim.x <b>" + B + "</b></span><span>blockDim.x <b>" + T + "</b></span>" :
        "<span>gridDim.x <b>" + B + "</b></span><span>blockDim.x <b>" + T + "</b></span><span>threads <b>" + B * T +
        "</b></span><span>warps <b>" + B * W + "</b></span><span>idle lanes <b>" + B * (W * 32 - T) + "</b></span>";
      read.innerHTML = idle;
      if (T > 1024) {
        grid.innerHTML = '<div class="dg-err"><b>launch dropped.</b> ' + T + ' threads per block is over the 1024 limit. ' +
          'It compiles, then the driver rejects it at runtime: no output, no crash. <code>cudaGetLastError()</code> returns <code>cudaErrorInvalidConfiguration</code>.</div>';
        return;
      }
      var html = "";
      for (var b = 0; b < B; b++) {
        html += '<div class="dg-block"><div class="dg-bh"><b>block ' + b + '</b><span>blockIdx.x = ' + b + '</span></div><div class="dg-cells" data-b="' + b + '">';
        for (var t = 0; t < W * 32; t++) {
          html += t < T ? '<i class="a w' + ((t >> 5) & 3) + '" data-t="' + t + '"></i>' : '<i data-t="' + t + '"></i>';
        }
        html += "</div></div>";
      }
      grid.innerHTML = html;
    }
    function clear(){
      el.querySelectorAll(".same").forEach(function(c){ c.classList.remove("same"); });
      el.querySelectorAll(".mate,.hot").forEach(function(c){ c.classList.remove("mate", "hot"); });
    }
    function point(e){
      var cell = e.target.closest("i[data-t]");
      if (!cell) { return; }
      clear();
      var cells = cell.parentNode, b = +cells.dataset.b, t = +cell.dataset.t, w = t >> 5, l = t & 31;
      cells.classList.add("same");
      for (var k = w * 32; k < w * 32 + 32; k++) { cells.children[k].classList.add("mate"); }
      cell.classList.add("hot");
      read.innerHTML = t >= T
        ? "block <b>" + b + "</b> · warp <b>" + w + "</b> · lane <b>" + l + "</b> is <em>idle</em>: the warp is scheduled as 32 lanes, but only " + (T - w * 32) + " of them have a thread."
        : "blockIdx.x <b>" + b + "</b> · threadIdx.x <b>" + t + "</b> · warp <b>" + t + " / 32 = " + w + "</b> · lane <b>" + t + " % 32 = " + l + "</b><br>" +
          "global id = blockIdx.x × blockDim.x + threadIdx.x = " + b + " × " + T + " + " + t + " = <em>" + (b * T + t) + "</em>";
    }
    grid.addEventListener("mouseover", point);
    grid.addEventListener("click", point);
    grid.addEventListener("mouseleave", function(){ clear(); read.innerHTML = idle; });
    ins.forEach(function(i){ i.addEventListener("input", draw); });
    draw();
  }
});

// Blocks wait in a queue and each SM takes the next one when it is free. Run
// times are random, so the order blocks finish in changes from run to run.
customElements.define("sm-scheduler", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var el = this, N = +el.getAttribute("blocks") || 4, S = +el.getAttribute("sms") || 2, runs = 0;
    var sms = "";
    for (var s = 0; s < S; s++) { sms += '<div class="dg-sm"><span>SM ' + s + '</span></div>'; }
    el.classList.add("dg");
    el.innerHTML = '<div class="dg-head"><code class="dg-call">' + N + ' blocks → ' + S + ' SMs</code>' +
      '<button class="dg-btn" type="button">launch</button></div><div class="dg-sched"><div class="dg-queue"></div>' +
      '<div class="dg-sms">' + sms + '</div><div class="dg-out">Press launch. Each line is a block finishing and flushing its output.</div></div>';
    var btn = el.querySelector(".dg-btn"), queue = el.querySelector(".dg-queue"), out = el.querySelector(".dg-out");
    var slots = el.querySelectorAll(".dg-sm");

    btn.addEventListener("click", function(){
      runs++;
      btn.disabled = true;
      out.innerHTML = "run " + runs + "<br>";
      queue.innerHTML = "";
      for (var b = 0; b < N; b++) {
        var c = queue.appendChild(document.createElement("span"));
        c.className = "dg-chip"; c.dataset.b = b; c.textContent = "block " + b;
      }
      var left = N;
      function feed(s){
        var c = queue.firstChild;
        if (!c) { return; }
        slots[s].appendChild(c);
        var d = 600 + Math.random() * 1600;
        c.style.setProperty("--d", d + "ms");
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ c.style.setProperty("--p", "100%"); }); });
        setTimeout(function(){
          c.remove();
          out.innerHTML += "<b>block " + c.dataset.b + "</b> done on SM " + s + "<br>";
          if (--left === 0) { btn.disabled = false; btn.textContent = "run again"; }
          feed(s);
        }, d);
      }
      for (var s = 0; s < S; s++) { setTimeout(feed.bind(null, s), Math.random() * 350); }
    });
  }
});

(function(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !window.IntersectionObserver) { return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) { return; }
      io.unobserve(e.target);
      setTimeout(function(){ e.target.classList.add("revealed"); }, Math.min((e.target.dataset.revealIndex || 0) * 45, 260));
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  document.querySelectorAll("section:not(.hero) > .wrap > *, .lessons > *").forEach(function(el, i){
    if (el.getBoundingClientRect().top < innerHeight) { return; }
    el.dataset.revealIndex = i % 8;
    el.classList.add("reveal");
    io.observe(el);
  });
})();

document.querySelectorAll(".side details").forEach(function(d){ if (matchMedia("(max-width:900px)").matches) { d.open = false; } });
