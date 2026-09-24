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

document.querySelectorAll(".prose .highlight:not(.language-text)").forEach(function(box){
  var b = box.appendChild(document.createElement("button"));
  b.type = "button"; b.className = "copy"; b.textContent = "copy";
  b.addEventListener("click", function(){
    navigator.clipboard.writeText(box.querySelector("code").innerText).then(function(){
      b.textContent = "copied";
      setTimeout(function(){ b.textContent = "copy"; }, 1200);
    });
  });
});

document.querySelectorAll(".prose .language-text code").forEach(function(c){
  c.innerHTML = c.innerHTML.split("\n").map(function(l){
    return /^\s*\.\.\.\s*$/.test(l) ? '<span class="o-dim">' + l + "</span>"
      : l.replace(/(&lt;-.*)$/, '<span class="o-note">$1</span>').replace(/\b\d+\b(?![^<]*>)/g, function(n){ return /ID|Idx|Dim|warpSize/.test(l) ? '<span class="o-num">' + n + "</span>" : n; });
  }).join("\n");
});

// GitHub alert syntax (> [!NOTE], > [!TIP], > [!WARNING]) becomes titled callouts.
// Markdown merges back-to-back quotes, so each marked paragraph starts its own box.
document.querySelectorAll(".prose blockquote").forEach(function(q){
  var cur = null, names = { NOTE: "Note", TIP: "Hint", WARNING: "Watch out" };
  [].slice.call(q.children).forEach(function(k){
    var m = k.tagName === "P" && k.innerHTML.match(/^\s*\[!(NOTE|TIP|WARNING)\]\s*(<br>)?\s*/);
    if (m) {
      cur = document.createElement("blockquote");
      cur.className = "callout " + m[1].toLowerCase();
      cur.innerHTML = '<b class="callout-t">' + names[m[1]] + "</b>";
      k.innerHTML = k.innerHTML.slice(m[0].length);
      q.parentNode.insertBefore(cur, q);
    }
    if (cur) { cur.appendChild(k); }
  });
  if (cur && !q.children.length) { q.remove(); }
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
      '<button class="dg-btn" type="button">run</button></div></div><div class="dg-stats"></div><div class="dg-grid"></div>' +
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
    var timer = 0, btn = el.querySelector(".dg-btn");
    // Warps light up one at a time: all 32 lanes of a warp run together, blocks take turns in any order.
    btn.addEventListener("click", function(){
      clearInterval(timer);
      var rows = [];
      el.querySelectorAll(".dg-cells").forEach(function(cells){
        cells.querySelectorAll("i.ran").forEach(function(c){ c.classList.remove("ran"); });
        for (var w = 0; w < cells.children.length / 32; w++) { rows.push([cells, w]); }
      });
      if (!rows.length) { return; }
      rows.sort(function(){ return Math.random() - .5; });
      grid.classList.add("running");
      var i = 0, step = Math.max(12, 2400 / rows.length);
      timer = setInterval(function(){
        var r = rows[i++];
        for (var k = r[1] * 32; k < r[1] * 32 + 32; k++) { r[0].children[k].classList.add("ran"); }
        read.innerHTML = "block <b>" + r[0].dataset.b + "</b> · warp <b>" + r[1] + "</b> runs. All 32 lanes of a warp run together.";
        if (i === rows.length) { clearInterval(timer); setTimeout(function(){ grid.classList.remove("running"); read.innerHTML = idle; }, 900); }
      }, step);
    });
    ins.forEach(function(i){ i.addEventListener("input", function(){ clearInterval(timer); grid.classList.remove("running"); draw(); }); });
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

// Grid, blocks, (warps) and threads as nested boxes. Click a level on the right to highlight it.
customElements.define("cuda-hierarchy", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var el = this, warps = this.hasAttribute("warps");
    var levels = [["grid", "Grid", "All blocks of one kernel launch."], ["block", "Block", "A group of threads on one SM. They can share memory."]]
      .concat(warps ? [["warp", "Warp", "32 threads that always run together."]] : [])
      .concat([["thread", "Thread", "Runs one copy of the kernel."]]);
    var blocks = "";
    for (var b = 0; b < 3; b++) {
      var inner = "";
      if (warps) {
        for (var w = 0; w < 2; w++) {
          var dots = ""; for (var t = 0; t < 32; t++) { dots += "<i></i>"; }
          inner += '<div class="hw"><span>warp ' + w + '</span><div class="dots" style="--d:' + (b * 2 + w) * .45 + 's">' + dots + "</div></div>";
        }
      } else {
        for (var t = 0; t < 3; t++) { inner += '<div class="ht">thread ' + t + "</div>"; }
        inner += '<div class="ht more">…</div>';
      }
      blocks += '<div class="hb"><span>block ' + b + "</span>" + inner + "</div>";
    }
    el.classList.add("dg");
    el.innerHTML = '<div class="dg-hier"><div class="hg"><span>grid · one kernel launch</span><div class="hbs">' + blocks + "</div></div>" +
      '<div class="hl">' + levels.map(function(l){ return '<button type="button" data-k="' + l[0] + '"><b>' + l[1] + "</b><small>" + l[2] + "</small></button>"; }).join("") + "</div></div>";
    el.querySelector(".hl").addEventListener("click", function(e){
      var b = e.target.closest("button");
      if (!b) { return; }
      var on = !b.classList.contains("on");
      el.querySelectorAll(".hl button").forEach(function(x){ x.classList.remove("on"); });
      el.querySelector(".dg-hier").dataset.focus = on ? b.dataset.k : "";
      if (on) { b.classList.add("on"); }
    });
  }
});

// Compute capability across data center generations: what grew and what stayed the same.
customElements.define("cc-progress", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var gens = [["Pascal", "6.0", 64, 64], ["Volta", "7.0", 64, 96], ["Ampere", "8.0", 64, 164], ["Hopper", "9.0", 128, 228], ["Blackwell", "10.0", 128, 228]];
    var same = ["32 threads per warp", "64 warps per SM", "2048 threads per SM", "65,536 registers per SM", "1024 threads per block"];
    this.classList.add("dg");
    this.innerHTML = '<div class="dg-head"><span class="dg-title">Compute capability over time</span><span class="dg-note">data center GPUs, per SM</span></div>' +
      '<div class="dg-ccp">' + gens.map(function(g){
        return '<div><b>' + g[0] + '</b><span class="cc">CC ' + g[1] + "</span>" +
          '<div class="bar"><small>FP32 cores</small><i style="--w:' + (g[2] / 128 * 100) + '%"></i><em>' + g[2] + "</em></div>" +
          '<div class="bar sm"><small>shared memory</small><i style="--w:' + (g[3] / 228 * 100) + '%"></i><em>' + g[3] + " KB</em></div></div>";
      }).join("") + '</div><div class="dg-title sub">Did not change since CC 6.0</div><div class="dg-facts">' +
      same.map(function(x){ return "<span>" + x + "</span>"; }).join("") + "</div>";
  }
});

// The CPU does not wait for a kernel. Without cudaDeviceSynchronize() the program can end before the GPU prints.
customElements.define("kernel-sync", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var el = this, cmd = el.getAttribute("cmd") || "./first_kernel", out = (el.getAttribute("out") || "Block ID: 0  ===  Thread ID: 0").split("|");
    var sync = 0, timers = [];
    el.classList.add("dg");
    el.innerHTML = '<div class="dg-head"><span class="dg-title">Who waits for whom?</span><div class="dg-tabs"><button type="button" data-i="0" class="on">without sync</button><button type="button" data-i="1">with cudaDeviceSynchronize()</button></div></div>' +
      '<div class="dg-sync"></div><div class="dg-term"></div><div class="dg-head"><button class="dg-btn" type="button">run</button><span class="dg-note"></span></div>';
    var lanes = el.querySelector(".dg-sync"), term = el.querySelector(".dg-term"), note = el.querySelector(".dg-note");
    function steps(){
      return sync
        ? [["cpu", "launch kernel"], ["gpu", "kernel starts"], ["cpu", "cudaDeviceSynchronize() waits", "wait"], ["gpu", "threads call printf"], ["gpu", "kernel ends, output flushed"], ["out"], ["cpu", "return 0"]]
        : [["cpu", "launch kernel"], ["gpu", "kernel starts"], ["cpu", "return 0, program ends"], ["gpu", "cut off before printing", "dead"]];
    }
    function reset(){
      timers.forEach(clearTimeout); timers = [];
      var st = steps();
      lanes.innerHTML = ["cpu", "gpu"].map(function(l){
        return '<div><span>' + l.toUpperCase() + '</span>' + st.map(function(x, i){ return x[0] === l ? '<i data-i="' + i + '" class="' + (x[2] || "") + '">' + x[1] + "</i>" : ""; }).join("") + "</div>";
      }).join("");
      term.innerHTML = "$ " + cmd;
      note.textContent = "";
    }
    function run(){
      reset();
      steps().forEach(function(x, i){
        timers.push(setTimeout(function(){
          var seg = lanes.querySelector('[data-i="' + i + '"]');
          if (seg) { seg.classList.add("on"); }
          if (x[0] === "out") { term.innerHTML += out.map(function(l){ return "<br>" + l; }).join(""); }
        }, 250 + i * 650));
      });
      timers.push(setTimeout(function(){
        term.innerHTML += "<br>$";
        note.textContent = sync ? "The CPU waited, so every line arrived." : "The CPU did not wait. The program ended before the GPU could print.";
      }, 400 + steps().length * 650));
    }
    el.querySelectorAll(".dg-tabs button").forEach(function(b){
      b.addEventListener("click", function(){
        el.querySelectorAll(".dg-tabs button").forEach(function(x){ x.classList.toggle("on", x === b); });
        sync = +b.dataset.i; run();
      });
    });
    el.querySelector(".dg-btn").addEventListener("click", run);
    reset();
  }
});

// Each thread writes its line into a buffer when it finishes. The buffer prints in that order, which changes every run.
customElements.define("printf-order", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var el = this, N = +el.getAttribute("threads") || 4, runs = 0;
    el.classList.add("dg");
    var th = "";
    for (var t = 0; t < N; t++) { th += '<span class="dg-chip" data-t="' + t + '">thread ' + t + "</span>"; }
    el.innerHTML = '<div class="dg-head"><span class="dg-title">printf order is not fixed</span><button class="dg-btn" type="button">run</button></div>' +
      '<div class="dg-pf"><div><span class="dg-lbl">threads</span><div class="th">' + th + '</div></div><div><span class="dg-lbl">printf buffer</span><div class="buf"></div></div></div>' +
      '<div class="dg-term">$ ./first_kernel</div>';
    var btn = el.querySelector(".dg-btn"), buf = el.querySelector(".buf"), term = el.querySelector(".dg-term");
    btn.addEventListener("click", function(){
      runs++; btn.disabled = true; buf.innerHTML = ""; term.innerHTML = "$ ./first_kernel";
      el.querySelectorAll(".th .dg-chip").forEach(function(c){ c.classList.remove("done"); });
      var order = [];
      for (var t = 0; t < N; t++) { order.push(t); }
      order.sort(function(){ return Math.random() - .5; });
      order.forEach(function(t, i){
        setTimeout(function(){
          el.querySelector('.th [data-t="' + t + '"]').classList.add("done");
          buf.innerHTML += "<div>Thread ID: " + t + "</div>";
        }, 300 + i * 450);
      });
      setTimeout(function(){
        term.innerHTML += order.map(function(t){ return "<br>Block ID: 0  ===  Thread ID: " + t; }).join("") + "<br>$ <span class='dg-note'>run " + runs + ", order " + order.join(" ") + "</span>";
        btn.disabled = false; btn.textContent = "run again";
      }, 500 + N * 450);
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
  document.querySelectorAll("section:not(.hero) > .wrap > *").forEach(function(el, i){
    if (el.getBoundingClientRect().top < innerHeight) { return; }
    el.dataset.revealIndex = i % 8;
    el.classList.add("reveal");
    io.observe(el);
  });
})();

document.querySelectorAll(".side details").forEach(function(d){ if (matchMedia("(max-width:900px)").matches) { d.open = false; } });
