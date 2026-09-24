// Diagrams for the GPU track. Each one is a tag a lesson drops in, e.g. <arch-timeline focus="Volta"></arch-timeline>.

function def(name, build){
  customElements.define(name, class extends HTMLElement {
    connectedCallback(){
      if (this.ready) { return; }
      this.ready = true;
      this.classList.add("dg");
      build(this, this.querySelector.bind(this));
    }
  });
}
function tabs(items, on){
  return '<div class="dg-tabs">' + items.map(function(t, i){
    return '<button type="button" data-i="' + i + '"' + (i === on ? ' class="on"' : "") + ">" + t + "</button>";
  }).join("") + "</div>";
}
function onTabs(box, fn){
  box.querySelectorAll("button").forEach(function(b){
    b.addEventListener("click", function(){
      box.querySelectorAll("button").forEach(function(x){ x.classList.toggle("on", x === b); });
      fn(+b.dataset.i);
    });
  });
}
function pick(el, fn){
  el.addEventListener("click", function(e){
    var b = e.target.closest("[data-k]");
    if (!b || !el.contains(b)) { return; }
    el.querySelectorAll("[data-k].on").forEach(function(x){ x.classList.remove("on"); });
    b.classList.add("on");
    fn(b.dataset.k, b);
  });
}

// A horizontal timeline: click a node to read it. Shared by the history and architecture lessons.
function timeline(el, title, items, focus, card){
  var eras = [];
  items.forEach(function(it){ if (!eras.length || eras[eras.length - 1].n !== it.era) { eras.push({ n: it.era, c: 0 }); } eras[eras.length - 1].c++; });
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + title + '</span><span class="dg-note">click a node</span></div>' +
    '<div class="dg-tl"><div class="dg-eras">' + eras.map(function(e, i){ return '<span class="e' + i + '" style="flex:' + e.c + '">' + e.n + "</span>"; }).join("") + "</div>" +
    '<div class="dg-nodes">' + items.map(function(it, i){
      return '<button type="button" data-k="' + i + '"' + (it.dim ? ' class="dim"' : "") + "><b>" + it.n + "</b><span>" + it.y + "</span>" + (it.bar ? '<i style="--h:' + it.bar + '"></i>' : "") + "</button>";
    }).join("") + '</div></div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".dg-nodes"), function(k){ info.innerHTML = card(items[+k]); });
  var start = Math.max(0, items.findIndex(function(it){ return it.n === focus; }));
  el.querySelectorAll(".dg-nodes button")[start].click();
}

def("gpu-history", function(el){
  var items = [
    { n: "Founded", y: "1993", era: "graphics", t: "NVIDIA is founded, one of many tech companies started in the early 90s." },
    { n: "NV1", y: "1995", era: "graphics", t: "The first product. Tiny memory, little bandwidth, almost no parallelism by today's standards." },
    { n: "RIVA 128", y: "1997", era: "graphics", t: "Real 3D acceleration for a wide audience, not just specialists. Adoption takes off." },
    { n: "GeForce 256", y: "1999", era: "graphics", t: "The GeForce line begins, sold as the first GPU. GPUs become widely accessible." },
    { n: "CUDA", y: "2007", era: "compute", t: "CUDA 1.0 ships. GPUs can now be programmed for general computation, not only graphics." },
    { n: "AlexNet", y: "2012", era: "AI", t: "A neural network trained on two GeForce GTX 580 cards wins ImageNet. Deep learning moves to GPUs." },
    { n: "Today", y: "2020s", era: "AI", t: "Gaming, AI infrastructure, cloud and HPC. GPUs are compute platforms and drive modern AI systems." }
  ];
  timeline(el, "From graphics card to compute platform", items, "GeForce 256", function(it){
    return "<b>" + it.n + " · " + it.y + "</b><br>" + it.t;
  });
});

var ARCHS = [
  { n: "Fermi", y: "2010", era: "graphics & general compute", cc: "2.x", tc: 0, chip: "GF100", tr: 3.0, t: "Graphics and general compute in one design, with a real L1/L2 cache hierarchy." },
  { n: "Kepler", y: "2012", era: "graphics & general compute", cc: "3.x", tc: 0, chip: "GK110", tr: 7.1, t: "More cores per SM and better performance per watt. Warp shuffle arrives." },
  { n: "Maxwell", y: "2014", era: "graphics & general compute", cc: "5.x", tc: 0, chip: "GM200", tr: 8.0, t: "Efficiency first: a redesigned SM for performance per watt." },
  { n: "Pascal", y: "2016", era: "graphics & general compute", cc: "6.x", tc: 0, chip: "GP100", tr: 15.3, t: "HBM2 and NVLink on P100, but still a general-purpose compute design." },
  { n: "Volta", y: "2017", era: "AI becomes central", cc: "7.0", tc: 1, chip: "GV100", tr: 21.1, t: "Tensor Cores arrive. INT and FP run in parallel. NVLink 2. The point where GPUs turn toward AI." },
  { n: "Turing", y: "2018", era: "AI becomes central", cc: "7.5", tc: 2, chip: "TU102", tr: 18.6, t: "RT cores for ray tracing, and Tensor Cores reach GeForce.", dim: true },
  { n: "Ampere", y: "2020", era: "AI becomes central", cc: "8.x", tc: 3, chip: "GA100", tr: 54.2, t: "Stronger Tensor Cores, TF32, structured sparsity and more memory bandwidth." },
  { n: "Ada", y: "2022", era: "AI becomes central", cc: "8.9", tc: 4, chip: "AD102", tr: 76.3, t: "Ada Lovelace: the consumer and workstation line, with FP8 Tensor Cores.", dim: true },
  { n: "Hopper", y: "2022", era: "AI becomes central", cc: "9.0", tc: 4, chip: "GH100", tr: 80, t: "Transformer Engine with FP8. Built for training large models in data centers." },
  { n: "Blackwell", y: "2024", era: "AI becomes central", cc: "10.0 · 12.0", tc: 5, chip: "B200", tr: 208, t: "5th-gen Tensor Cores and NVFP4. Two dies act as one GPU. Gains depend on workload and precision." },
  { n: "Rubin", y: "2026", era: "next", cc: "·", t: "Entering deployment: newer Tensor Cores, HBM4, very high SM counts." },
  { n: "Rubin Ultra", y: "2027", era: "next", cc: "·", t: "On the roadmap: pushes Rubin further." },
  { n: "Feynman", y: "2028", era: "next", cc: "·", t: "On the roadmap. The direction stays the same: larger, more specialised AI systems." }
];
ARCHS.forEach(function(a){ if (a.tr) { a.bar = Math.sqrt(a.tr / 208).toFixed(3); } });

def("arch-timeline", function(el){
  timeline(el, "NVIDIA architectures, and what each one changed", ARCHS, el.getAttribute("focus") || "Volta", function(a){
    var dots = "";
    for (var i = 1; i <= 5; i++) { dots += '<i class="' + (i <= a.tc ? "on" : "") + '"></i>'; }
    return "<b>" + a.n + " · " + a.y + "</b>" + (a.cc !== "·" ? " · compute capability <b>" + a.cc + "</b>" : "") + "<br>" + a.t +
      (a.chip ? '<div class="dg-facts"><span>flagship chip <b>' + a.chip + "</b></span><span>transistors <b>" + a.tr + " B</b></span>" +
        '<span>Tensor Core gen <b class="dg-dots">' + dots + "</b> " + (a.tc || "none") + "</span></div>" : "");
  });
});

def("cpu-vs-gpu", function(el){
  var devs = [{ n: "CPU", cores: 8, t: 1, d: "8 fast cores · 1 tick per piece" }, { n: "GPU", cores: 64, t: 4, d: "64 slower cores · 4 ticks per piece" }];
  var tasks = [{ n: "64 independent pieces", p: 64, chain: false }, { n: "8 steps, each needs the last", p: 8, chain: true }];
  var task = tasks[0], raf = 0;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">Same work, two designs</span>' + tabs(tasks.map(function(t){ return t.n; }), 0) + "</div>" +
    devs.map(function(d){
      var c = ""; for (var i = 0; i < d.cores; i++) { c += "<i></i>"; }
      return '<div class="dg-dev"><div class="dg-dev-h"><b>' + d.n + "</b><span>" + d.d + '</span></div><div class="dg-cores ' + d.n + '">' + c +
        '</div><div class="dg-track"><i></i><span></span></div></div>';
    }).join("") + '<div class="dg-head"><button class="dg-btn" type="button">run</button><span class="dg-note"></span></div>';
  var rows = el.querySelectorAll(".dg-dev"), note = el.querySelector(".dg-note");
  function total(d){ return task.chain ? task.p * d.t : Math.ceil(task.p / d.cores) * d.t; }
  function frame(now){
    devs.forEach(function(d, k){
      var T = total(d), done = now >= T, round = Math.floor(now / d.t);
      var active = done ? 0 : task.chain ? 1 : Math.min(d.cores, task.p - round * d.cores);
      rows[k].querySelectorAll(".dg-cores i").forEach(function(c, i){ c.classList.toggle("a", i < active); });
      rows[k].querySelector(".dg-track i").style.width = Math.min(100, now / T * 100) + "%";
      rows[k].querySelector(".dg-track span").textContent = done ? T + " ticks" : "";
    });
  }
  function run(){
    cancelAnimationFrame(raf);
    var end = Math.max.apply(null, devs.map(total)), t0 = performance.now();
    note.textContent = "";
    (function step(ts){
      var now = Math.min(end, (ts - t0) / 110);
      frame(now);
      if (now < end) { raf = requestAnimationFrame(step); return; }
      var c = total(devs[0]), g = total(devs[1]);
      note.textContent = g < c ? "GPU wins, " + g + " vs " + c + " ticks: many slow cores beat a few fast ones when the work splits."
        : "CPU wins, " + c + " vs " + g + " ticks: when each step waits on the last, only core speed matters.";
    })(t0);
  }
  onTabs(el.querySelector(".dg-tabs"), function(i){ task = tasks[i]; run(); });
  el.querySelector(".dg-btn").addEventListener("click", run);
  frame(0);
});

def("gpu-anatomy", function(el){
  var P = {
    cpu: ["CPU and system RAM", "Runs the program and decides what the GPU does. Its memory is separate from the GPU's, so data has to be copied over."],
    pcie: ["PCIe", "The link between CPU and GPU. Data goes to the GPU, gets processed, results come back. If that flow is handled badly, it becomes the bottleneck."],
    sm: ["Streaming Multiprocessor (SM)", "A small processing unit inside the GPU. The GPU is many SMs working together, and every block of threads runs on one SM."],
    l2: ["L2 cache", "Shared by every SM on the chip. Larger but slower than L1 and shared memory, and it saves trips out to VRAM."],
    vram: ["VRAM", "The GPU's own memory: GDDR on consumer cards, HBM on data center parts. The largest and slowest level the GPU reads."],
    sched: ["Warp schedulers", "Control units that decide which warp of 32 threads runs next, and when."],
    reg: ["Registers", "The fastest storage there is, private to each thread."],
    fp: ["FP32 units", "Floating-point math, the bulk of graphics and AI work."],
    int: ["INT32 units", "Integer math: array indexes, addresses, loop counters."],
    tc: ["Tensor Cores", "Specialised for matrix math, the heart of AI workloads."],
    sfu: ["Special function units", "Harder math such as sin, cos, exp and reciprocal square root."],
    ldst: ["Load / store units", "Move data between memory and the compute units."],
    smem: ["Shared memory and L1", "Fast memory inside the SM. Shared memory lets the threads of a block cooperate, and is one of the main optimisation tools."]
  };
  var sms = ""; for (var i = 0; i < 12; i++) { sms += '<button type="button" data-k="sm">SM ' + i + "</button>"; }
  el.innerHTML = '<div class="dg-head"><span class="dg-title">What sits where</span><span class="dg-note">click any part</span></div>' +
    '<div class="dg-anat"><div class="dg-col"><span class="dg-lbl">host</span><button type="button" data-k="cpu" class="tall">CPU<br>system RAM</button></div>' +
    '<button type="button" data-k="pcie" class="dg-link">PCIe<br>⇄</button>' +
    '<div class="dg-col dg-gpu"><span class="dg-lbl">GPU</span><div class="dg-sms">' + sms + '</div><button type="button" data-k="l2">L2 cache · shared by all SMs</button><button type="button" data-k="vram">VRAM</button></div>' +
    '<div class="dg-col dg-smx"><span class="dg-lbl">inside one SM</span><button type="button" data-k="sched">warp schedulers</button><button type="button" data-k="reg">register file</button>' +
    '<div class="dg-units"><button type="button" data-k="fp">FP32</button><button type="button" data-k="int">INT32</button><button type="button" data-k="tc">Tensor</button><button type="button" data-k="sfu">SFU</button><button type="button" data-k="ldst">LD/ST</button></div>' +
    '<button type="button" data-k="smem">shared memory / L1</button></div></div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".dg-anat"), function(k){ info.innerHTML = "<b>" + P[k][0] + "</b><br>" + P[k][1]; });
  el.querySelector('[data-k="sm"]').click();
});

def("arch-matrix", function(el){
  var cols = [["Tegra · Jetson", "mobile, embedded"], ["GeForce", "gaming, creators"], ["RTX pro", "workstations"], ["Data Center", "AI, HPC, cloud"]];
  var rows = [["Ampere", ["Jetson Orin", "RTX 3090", "RTX A6000", "A100"]], ["Ada Lovelace", ["", "RTX 4090", "RTX 6000 Ada", "L40S"]],
    ["Hopper", ["", "", "", "H100"]], ["Blackwell", ["Jetson Thor", "RTX 5090", "RTX PRO 6000", "B200"]]];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">Architecture × generation</span><span class="dg-note">click a GPU</span></div>' +
    '<div class="dg-scroll"><table class="dg-mx"><tr><th><span>how it is built ↓</span><span>where it is used →</span></th>' +
    cols.map(function(c){ return "<th>" + c[0] + "<small>" + c[1] + "</small></th>"; }).join("") + "</tr>" +
    rows.map(function(r, i){
      return '<tr><th>' + r[0] + "</th>" + r[1].map(function(g, j){
        return "<td>" + (g ? '<button type="button" data-k="' + i + "," + j + '">' + g + "</button>" : '<span class="dg-none">·</span>') + "</td>";
      }).join("") + "</tr>";
    }).join("") + '</table></div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".dg-mx"), function(k){
    var ij = k.split(",").map(Number), r = rows[ij[0]], name = r[1][ij[1]];
    el.querySelectorAll(".dg-mx td,.dg-mx th").forEach(function(c){ c.classList.remove("row", "col"); });
    el.querySelectorAll(".dg-mx tr")[ij[0] + 1].querySelectorAll("td").forEach(function(c){ c.classList.add("row"); });
    el.querySelectorAll(".dg-mx tr").forEach(function(tr, i){ if (i) { tr.children[ij[1] + 1].classList.add("col"); } });
    var mates = r[1].filter(function(g){ return g && g !== name; });
    info.innerHTML = "<b>" + name + "</b>: architecture <em>" + r[0] + "</em> (how it is built) · generation <em>" + cols[ij[1]][0] + "</em> (where it is used)." +
      (mates.length ? "<br>Same design, other worlds: " + mates.join(", ") + "." : "<br>" + r[0] + " only ships in this one world.");
  });
  el.querySelector('[data-k="0,1"]').click();
});

def("gpu-compare", function(el){
  var rows = [["Chip", "GA102", "GA100"], ["Architecture", "Ampere", "Ampere"], ["Generation", "GeForce", "Data Center"],
    ["FP32 CUDA cores", "10,496", "6,912"], ["Tensor Cores", "328, 3rd gen", "432, 3rd gen"], ["FP64 speed", "1/64 of FP32", "1/2 of FP32"],
    ["Memory", "24 GB GDDR6X", "40 GB HBM2"], ["Bandwidth", "936 GB/s", "1,555 GB/s"], ["Display outputs", "HDMI, DisplayPort", "none"],
    ["Cooling", "fans on the card", "passive, server airflow"]];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">RTX 3090 vs A100</span>' + tabs(["everything", "what is the same", "what differs"], 0) + "</div>" +
    '<table class="dg-cmp"><tr><th></th><th>RTX 3090</th><th>A100 40 GB</th></tr>' + rows.map(function(r){
      return '<tr class="' + (r[1] === r[2] ? "same" : "diff") + '"><th>' + r[0] + "</th><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>";
    }).join("") + "</table>" +
    '<div class="dg-bars"><div><span>RTX 3090</span><i style="width:100%"></i><b>10,496</b></div><div><span>A100</span><i style="width:65.9%"></i><b>6,912</b></div></div>' +
    '<p class="dg-note">The headline core count is FP32 cores only. The A100 has fewer of them, yet more Tensor Cores, far faster FP64 and 66% more bandwidth. Same architecture is not the same purpose.</p>';
  var cmp = el.querySelector(".dg-cmp");
  onTabs(el.querySelector(".dg-tabs"), function(i){ cmp.className = "dg-cmp" + ["", " only-same", " only-diff"][i]; });
});

def("chip-vs-gpu", function(el){
  var kinds = [
    { chip: "GA102", vram: "GDDR6X chips around the die", pwr: "power stages + 12-pin connector", io: "HDMI · DisplayPort", cool: "heatsink + fans" },
    { chip: "GA100", vram: "HBM2 stacks on the package", pwr: "power from the server board", io: "no display outputs", cool: "passive heatsink, server fans" }
  ];
  var steps = ["chip", "+ VRAM", "+ power", "+ outputs", "+ cooling"], step = 0, kind = 0;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">GPU = chip + everything to make it usable</span>' + tabs(["GeForce card", "Data center module"], 0) + "</div>" +
    tabs(steps, 0) + '<div class="dg-board"><div class="p cool" data-s="4"></div><div class="p vram" data-s="1"></div><div class="p chip" data-s="0"></div>' +
    '<div class="p vram v2" data-s="1"></div><div class="p pwr" data-s="2"></div><div class="p io" data-s="3"></div></div><div class="dg-info"></div>';
  var tb = el.querySelectorAll(".dg-tabs");
  function draw(){
    var k = kinds[kind];
    el.querySelector(".dg-board").classList.toggle("dc", kind === 1);
    el.querySelectorAll(".dg-board .p").forEach(function(p){
      var s = +p.dataset.s, key = ["chip", "vram", "pwr", "io", "cool"][s];
      p.classList.toggle("off", s > step);
      p.innerHTML = s === 0 ? "<b>GPU chip</b><small>" + k.chip + "</small>" : "<small>" + k[key] + "</small>";
    });
    el.querySelector(".dg-info").innerHTML = step === 0
      ? "<b>The chip alone:</b> the silicon where every computation happens. No memory, no power, no cooling. Architecture describes this part."
      : "<b>The GPU:</b> " + ["the chip", "VRAM", "power delivery", "outputs", "cooling"].slice(0, step + 1).join(" + ") + "." +
        (kind === 1 && step >= 3 ? " A data center module skips the fans and the display outputs, because the server rack handles cooling and nobody plugs in a monitor." : "");
  }
  onTabs(tb[0], function(i){ kind = i; draw(); });
  onTabs(tb[1], function(i){ step = i; draw(); });
  draw();
});

def("arch-family", function(el){
  var fams = [
    { n: "Ada Lovelace", aim: "consumer and workstation first", chips: [
      { c: "AD102", full: 144, p: [["RTX 4090", 128, "GeForce"], ["L40S", 142, "Data Center"]] },
      { c: "AD103", full: 80, p: [["RTX 4080", 76, "GeForce"]] },
      { c: "AD104", full: 60, p: [["RTX 4070 Ti", 60, "GeForce"]] }] },
    { n: "Hopper", aim: "data center AI only", chips: [{ c: "GH100", full: 144, p: [["H100 SXM", 132, "Data Center"]] }] }
  ];
  var fam = 0;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">One architecture, many chips</span>' + tabs(fams.map(function(f){ return f.n; }), 0) + '</div><div class="dg-tree"></div><div class="dg-info"></div>';
  var tree = el.querySelector(".dg-tree"), info = el.querySelector(".dg-info");
  function draw(){
    var f = fams[fam];
    tree.innerHTML = '<div class="dg-lvl"><span class="dg-lbl">architecture</span><div class="dg-node arch"><b>' + f.n + "</b><small>" + f.aim + "</small></div></div>" +
      '<div class="dg-lvl"><span class="dg-lbl">chips</span>' + f.chips.map(function(c, i){
        return '<div class="dg-branch"><div class="dg-node"><b>' + c.c + "</b><small>" + c.full + " SMs on the full die</small></div>" +
          '<div class="dg-leaves">' + c.p.map(function(p, j){ return '<button type="button" data-k="' + i + "," + j + '"><b>' + p[0] + "</b><small>" + p[2] + "</small></button>"; }).join("") + "</div></div>";
      }).join("") + "</div>";
    tree.querySelector("[data-k]").click();
  }
  pick(tree, function(k){
    var ij = k.split(",").map(Number), f = fams[fam], c = f.chips[ij[0]], p = c.p[ij[1]], cells = "";
    for (var s = 0; s < c.full; s++) { cells += '<i class="' + (s < p[1] ? "a" : "") + '"></i>'; }
    info.innerHTML = "<b>" + p[0] + "</b> uses <b>" + c.c + "</b> with <em>" + p[1] + " of " + c.full + "</em> SMs enabled" +
      (p[1] < c.full ? ". Same chip, some units switched off, so it behaves differently from other " + c.c + " products." : ", the full die.") +
      '<div class="dg-smgrid">' + cells + "</div>" +
      (p[2] === "GeForce" ? "Board partners such as ASUS, MSI and Gigabyte then build their own cards around it, with their own cooling, power limits and boost clocks." :
        "Data center parts ship as modules for servers, so there is no vendor cooler layer on top.");
  });
  onTabs(el.querySelector(".dg-tabs"), function(i){ fam = i; draw(); });
  draw();
});

def("bandwidth-sim", function(el){
  var CORES = 4, JOBS = 3, WORK = 1;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">4 cores, one memory</span><div class="dg-ctl"><label>memory feeds <b class="n">4</b> core(s) per tick <input type="range" min="1" max="4" value="1"></label></div></div>' +
    '<div class="dg-gantt"></div><div class="dg-legend"><span><i class="L"></i>receiving data</span><span><i class="C"></i>computing</span><span><i class="W"></i>waiting for memory</span></div><div class="dg-info"></div>';
  var input = el.querySelector("input");
  function sim(N){
    var rows = [], left = [], free = [], queue = [];
    for (var c = 0; c < CORES; c++) { rows.push([]); left.push(JOBS); free.push(0); queue.push(c); }
    for (var t = 0; t < 60; t++) {
      if (left.every(function(x){ return !x; }) && free.every(function(f){ return f <= t; })) { return { rows: rows, T: t }; }
      var ready = queue.filter(function(c){ return left[c] && free[c] <= t; }), served = ready.slice(0, N);
      served.forEach(function(c){
        rows[c][t] = "L";
        for (var w = 1; w <= WORK; w++) { rows[c][t + w] = "C"; }
        free[c] = t + 1 + WORK; left[c]--;
        queue.splice(queue.indexOf(c), 1); queue.push(c);
      });
      ready.slice(N).forEach(function(c){ rows[c][t] = "W"; });
    }
  }
  function draw(){
    var N = +input.value, r = sim(N), busy = 0, html = "";
    el.querySelector(".n").textContent = N;
    r.rows.forEach(function(row, c){
      html += "<div><span>core " + c + "</span>";
      for (var t = 0; t < 14; t++) { html += '<i class="' + (row[t] || "") + '"></i>'; if (row[t] === "C") { busy++; } }
      html += "</div>";
    });
    el.querySelector(".dg-gantt").innerHTML = html;
    el.querySelector(".dg-info").innerHTML = "Done after <b>" + r.T + " ticks</b>. Cores spent <em>" + Math.round(busy / (CORES * r.T) * 100) + "%</em> of the time computing." +
      (N === 1 ? " Memory serves one core at a time, so the other three mostly wait: a memory bottleneck." : N === 4 ? " Every core is fed at once. No waiting, all four run in parallel." : "");
  }
  input.addEventListener("input", draw);
  draw();
});

def("bandwidth-calc", function(el){
  var presets = [["RTX 3090", 384, 19.5, "GDDR6X"], ["RTX 4090", 384, 21, "GDDR6X"], ["A100 40 GB", 5120, 2.43, "HBM2"], ["H100 SXM", 5120, 5.24, "HBM3"], ["B200", 8192, 8, "HBM3e"]];
  var widths = [128, 192, 256, 320, 384, 512, 1024, 2048, 3072, 4096, 5120, 6144, 8192];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">bandwidth = bus width × speed per pin</span>' + tabs(presets.map(function(p){ return p[0]; }), 0) + "</div>" +
    '<div class="dg-ctl"><label>bus width <b class="w"></b> <input type="range" min="0" max="' + (widths.length - 1) + '"></label>' +
    '<label>speed per pin <b class="s"></b> <input type="range" min="1" max="32" step="0.01"></label></div>' +
    '<div class="dg-road"><div class="lanes"></div></div><div class="dg-big"><b></b> GB/s <span></span></div>';
  var ins = el.querySelectorAll("input"), tech = "";
  function draw(){
    var w = widths[+ins[0].value], s = +ins[1].value, gb = w * s / 8;
    el.querySelector(".w").textContent = w + "-bit";
    el.querySelector(".s").textContent = s + " Gb/s";
    el.querySelector(".dg-big b").textContent = Math.round(gb).toLocaleString("en-US");
    el.querySelector(".dg-big span").textContent = tech;
    var lanes = el.querySelector(".lanes");
    lanes.style.setProperty("--n", Math.max(2, Math.round(w / 128)));
    lanes.style.setProperty("--speed", (6 / s).toFixed(2) + "s");
  }
  function preset(i){
    var p = presets[i]; tech = p[3] + " · " + p[0];
    ins[0].value = widths.indexOf(p[1]); ins[1].value = p[2]; draw();
  }
  ins.forEach(function(i){ i.addEventListener("input", function(){ tech = "custom"; draw(); }); });
  onTabs(el.querySelector(".dg-tabs"), preset);
  preset(0);
});

def("cores-clock", function(el){
  var OPS = 200;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">200 operations, two GPUs</span></div>' + ["A", "B"].map(function(n, i){
    return '<div class="dg-dev"><div class="dg-dev-h"><b>GPU ' + n + '</b><div class="dg-ctl"><label>cores <b class="c"></b><input type="range" min="50" max="400" step="50" value="' + (i ? 200 : 100) + '"></label>' +
      '<label>seconds per round <b class="t"></b><input type="range" min="1" max="5" value="' + (i ? 4 : 1) + '"></label></div></div><div class="dg-rounds"></div></div>';
  }).join("") + '<div class="dg-info"></div>';
  var devs = el.querySelectorAll(".dg-dev");
  function draw(){
    var res = [];
    devs.forEach(function(d){
      var ins = d.querySelectorAll("input"), c = +ins[0].value, t = +ins[1].value;
      d.querySelector(".c").textContent = c; d.querySelector(".t").textContent = t + " s";
      res.push({ r: Math.ceil(OPS / c), t: t });
    });
    var max = Math.max(res[0].r * res[0].t, res[1].r * res[1].t);
    devs.forEach(function(d, k){
      var r = res[k], bar = "";
      for (var i = 0; i < r.r; i++) { bar += '<i style="width:' + (r.t / max * 88) + '%">R' + (i + 1) + "</i>"; }
      d.querySelector(".dg-rounds").innerHTML = bar + "<b>" + r.r * r.t + " s</b>";
    });
    var a = res[0].r * res[0].t, b = res[1].r * res[1].t;
    el.querySelector(".dg-info").innerHTML = a === b ? "A tie." : "GPU <b>" + (a < b ? "A" : "B") + "</b> finishes first. " +
      "Cores set how many operations run per round, clock speed sets how long a round takes. Either one can hold the other back.";
  }
  el.querySelectorAll("input").forEach(function(i){ i.addEventListener("input", draw); });
  draw();
});

def("spec-reader", function(el){
  var gpus = [
    ["RTX 3090", "GA102", "Ampere", "GeForce", "gaming, creators, personal workstations", true],
    ["A100", "GA100", "Ampere", "Data Center", "AI training, HPC, cloud", false],
    ["RTX 4090", "AD102", "Ada Lovelace", "GeForce", "gaming, creators", true],
    ["L40S", "AD102", "Ada Lovelace", "Data Center", "inference and graphics in servers", false],
    ["H100", "GH100", "Hopper", "Data Center", "training large AI models", false],
    ["RTX 5090", "GB202", "Blackwell", "GeForce", "gaming, creators, local AI", true]
  ];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">Three questions for any spec page</span>' + tabs(gpus.map(function(g){ return g[0]; }), 0) + '</div><div class="dg-qa"></div>';
  function draw(i){
    var g = gpus[i];
    el.querySelector(".dg-qa").innerHTML =
      '<div><span>1 · What architecture?</span><b>' + g[2] + "</b><small>chip " + g[1] + ", how it is built</small></div>" +
      '<div><span>2 · What category?</span><b>' + g[3] + "</b><small>where it is used</small></div>" +
      '<div><span>3 · Built for what?</span><b>' + g[4] + "</b><small>the problem it solves</small></div>" +
      '<div class="clue ' + (g[5] ? "fan" : "") + '"><span>visual clue</span><b>' + (g[5] ? "big fans" : "no fans") + "</b><small>" +
      (g[5] ? "cools itself, so it lives in a desktop" : "cooled by the server, so it lives in a rack") + "</small></div>";
  }
  onTabs(el.querySelector(".dg-tabs"), draw);
  draw(0);
});

def("cc-explorer", function(el){
  var cc = [
    ["Maxwell", "5.x", ["no*", "no", "no", "no"], "6.5"], ["Pascal", "6.x", ["yes", "no", "no", "no"], "8.0"],
    ["Volta", "7.0", ["yes", "1st gen", "no", "no"], "9.0"], ["Ampere", "8.x", ["yes", "3rd gen", "no", "no"], "11.0"],
    ["Hopper", "9.0", ["yes", "4th gen", "yes", "no"], "11.8"], ["Blackwell", "10.0 · 12.0", ["yes", "5th gen", "yes", "yes"], "12.8"]
  ];
  var feats = ["FP16 math", "Tensor Cores", "FP8", "NVFP4"];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">What does my GPU support?</span>' + tabs(cc.map(function(c){ return c[0] + " " + c[1]; }), 3) + "</div>" +
    '<div class="dg-ccnum"></div><div class="dg-feats"></div><p class="dg-note">* CC 5.0 and 5.2 have no FP16 math. Missing hardware has no workaround: the unit is either on the chip or not.</p>';
  function draw(i){
    var c = cc[i], v = c[1].split(" ")[0].split(".");
    el.querySelector(".dg-ccnum").innerHTML = "<span><b>" + v[0] + "</b><small>major: the architecture</small></span><span class='dot'>.</span><span><b>" + v[1] + "</b><small>minor: a revision of it</small></span>" +
      "<span class='need'>needs CUDA<b>≥ " + c[3] + "</b></span>";
    el.querySelector(".dg-feats").innerHTML = feats.map(function(f, k){
      var ok = c[2][k].indexOf("no") !== 0;
      return '<div class="' + (ok ? "ok" : "") + '"><span>' + (ok ? "✓" : "✕") + "</span><b>" + f + "</b><small>" + c[2][k] + "</small></div>";
    }).join("");
  }
  onTabs(el.querySelector(".dg-tabs"), draw);
  draw(3);
});

def("whitepaper-map", function(el){
  var parts = [
    ["Key features", "Start here. Short, and it tells you what the architecture is trying to do. Volta's says: built for AI."],
    ["SM design", "The section that matters most. CUDA cores, Tensor Cores, scheduling and memory access all meet in the SM. Compare it with the previous generation."],
    ["Performance", "Comparisons against the previous architecture. Useful, but read them as 'what changed', not as a benchmark for your workload."],
    ["Specifications", "The tables: SM counts, memory, bandwidth, transistors. The same tables return in every white paper, so generations line up side by side."]
  ];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">How every NVIDIA white paper is laid out</span><span class="dg-note">search: chip name + "white paper", open the official PDF</span></div>' +
    '<div class="dg-steps">' + parts.map(function(p, i){ return '<button type="button" data-k="' + i + '"><span>' + (i + 1) + "</span>" + p[0] + (i === 1 ? " ★" : "") + "</button>"; }).join("") +
    '</div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".dg-steps"), function(k){ info.innerHTML = "<b>" + parts[k][0] + "</b><br>" + parts[k][1]; });
  el.querySelector('[data-k="1"]').click();
});

def("volta-shift", function(el){
  var stream = ["FP", "INT", "FP", "FP", "INT", "FP", "INT", "INT", "FP", "FP"];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">Mixed FP and INT work, cycle by cycle</span>' + tabs(["Pascal", "Volta"], 0) + '</div><div class="dg-lanes"></div><div class="dg-info"></div>' +
    '<div class="dg-title sub">Transistors per flagship chip</div><div class="dg-bars tr">' +
    [["GP100 · Pascal", 15.3], ["GV100 · Volta", 21.1], ["GA100 · Ampere", 54.2], ["GH100 · Hopper", 80], ["B200 · Blackwell", 208]].map(function(b){
      return "<div><span>" + b[0] + '</span><i style="width:' + (b[1] / 208 * 100) + '%"></i><b>' + b[1] + " B</b></div>";
    }).join("") + "</div>";
  function lane(name, ops){ return "<div><span>" + name + "</span>" + ops.map(function(o){ return '<i class="' + o + '">' + o + "</i>"; }).join("") + "</div>"; }
  function draw(v){
    var fp = stream.filter(function(o){ return o === "FP"; }), it = stream.filter(function(o){ return o === "INT"; });
    el.querySelector(".dg-lanes").innerHTML = v ? lane("FP32 path", fp) + lane("INT32 path", it) : lane("shared path", stream);
    el.querySelector(".dg-info").innerHTML = v
      ? "<b>" + Math.max(fp.length, it.length) + " cycles.</b> Volta gives integer and floating-point work separate paths, so they issue side by side. Tensor Cores also arrive here."
      : "<b>" + stream.length + " cycles.</b> On Pascal, integer and floating-point instructions share one path and take turns.";
  }
  onTabs(el.querySelector(".dg-tabs"), draw);
  draw(0);
});

def("nvcc-pipeline", function(el){
  el.innerHTML = '<div class="dg-head"><span class="dg-title">nvcc -arch=sm_89 app.cu</span>' + tabs(["run on L40S (sm_89)", "run on a newer GPU"], 0) + "</div>" +
    '<div class="dg-flow"><div class="st src">app.cu<small>host + device code</small></div><div class="st">nvcc<small>splits the file</small></div>' +
    '<div class="fork"><div class="path"><div class="st">host code</div><div class="st">g++ / MSVC</div><div class="st">CPU machine code</div></div>' +
    '<div class="path"><div class="st">device code</div><div class="st ptx">PTX<small>virtual ISA, kept in the binary</small></div><div class="st sass">SASS sm_89<small>real instructions</small></div></div></div>' +
    '<div class="st">executable<small>fatbinary: SASS + PTX</small></div><div class="st drv">driver<small></small></div><div class="st gpu">GPU</div></div><div class="dg-info"></div>';
  function draw(i){
    var f = el.querySelector(".dg-flow");
    f.classList.toggle("jit", i === 1);
    f.querySelector(".drv small").textContent = i ? "JIT-compiles PTX for the new GPU" : "loads the matching SASS";
    el.querySelector(".dg-info").innerHTML = i
      ? "No SASS matches the new GPU, so the driver compiles the stored <b>PTX</b> on first launch. The program still runs, which is why PTX is kept. It will not use the new hardware's features."
      : "The binary already holds <b>SASS for sm_89</b>, so the driver loads it directly. Compiling for the right architecture is what gets you its instructions and data types.";
  }
  onTabs(el.querySelector(".dg-tabs"), draw);
  draw(0);
});

function stack(el, title, layers, first){
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + title + '</span><span class="dg-note">click a layer</span></div><div class="dg-stack">' +
    layers.map(function(l, i){ return '<button type="button" data-k="' + i + '"' + (l[3] ? ' class="' + l[3] + '"' : "") + "><b>" + l[0] + "</b><small>" + l[1] + "</small></button>"; }).join("") +
    '</div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".dg-stack"), function(k){ info.innerHTML = "<b>" + layers[k][0] + "</b><br>" + layers[k][2]; });
  el.querySelector('[data-k="' + (first || 0) + '"]').click();
}

def("toolchain-stack", function(el){
  stack(el, "You write code at the top, the GPU runs it at the bottom", [
    ["CLion", "where you work", "Write and organise the project. Building just calls CMake. Nothing hidden."],
    ["CMake", "the project definition", "Describes the build without tying it to one machine or IDE, so the same project builds anywhere."],
    ["nvcc · CUDA Toolkit", "compiler, runtime, libraries", "The foundation. The toolkit version decides which architectures, instructions and precisions your code can use."],
    ["host compiler", "g++ on Linux, MSVC on Windows", "nvcc hands host code to it. That is why Visual Studio must be installed on Windows even if you never open it."],
    ["NVIDIA driver", "must be new enough", "CUDA runs on top of the driver. An old one can compile fine and then fail at runtime in confusing ways."],
    ["GPU", "runs the kernels", "The hardware. Its compute capability sets what the layers above can use.", "hw"]
  ], 2);
});

def("wsl-layers", function(el){
  el.innerHTML = '<div class="dg-head"><span class="dg-title">Where each piece is installed</span>' + tabs(["WSL2", "WSL1"], 0) + '</div><div class="dg-wsl"></div><div class="dg-info"></div>';
  function draw(v1){
    el.querySelector(".dg-wsl").innerHTML =
      '<div class="box linux' + (v1 ? " off" : "") + '"><span class="dg-lbl">Linux distro in WSL' + (v1 ? "1" : "2") + '</span><b>own users, own file system</b>' +
      "<div class='ok'>✓ CUDA Toolkit from the wsl-ubuntu repo</div><div class='no'>✕ no NVIDIA driver here</div></div>" +
      '<div class="arrow">' + (v1 ? "✕ no GPU path" : "↓ uses the host driver") + "</div>" +
      '<div class="box win"><span class="dg-lbl">Windows host</span><div class="ok">✓ NVIDIA driver installed here, once</div></div><div class="arrow">↓</div><div class="box gpu">GPU</div>';
    el.querySelector(".dg-info").innerHTML = v1
      ? "WSL1 translates Linux calls instead of running a real kernel, and has no meaningful GPU acceleration. Use WSL2."
      : "WSL2 runs a real Linux kernel in a lightweight VM and reaches the GPU through the Windows driver. Installing a Linux driver inside WSL breaks this.";
  }
  onTabs(el.querySelector(".dg-tabs"), draw);
  draw(0);
});

def("install-steps", function(el){
  var steps = [
    ["GPU is visible", "nvidia-smi", "If this fails, stop and fix the driver first. CUDA cannot work without it."],
    ["Add NVIDIA's WSL repository", "wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb\nsudo dpkg -i cuda-keyring_1.1-1_all.deb", "Not apt install nvidia-cuda-toolkit: that package is outdated."],
    ["Install the toolkit", "sudo apt-get update\nsudo apt-get -y install cuda-toolkit-13-2", "Installs nvcc, the runtime and core libraries. Not a driver."],
    ["Check the compiler", "nvcc --version", "Should report CUDA 13.x."],
    ["Fix PATH if nvcc is missing", "export PATH=/usr/local/cuda/bin:$PATH", "Add the line to .bashrc or .zshrc to keep it."]
  ];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">Install checklist</span><span class="dg-note"><b class="n">0</b> / ' + steps.length + ' done</span></div><div class="dg-prog"><i></i></div>' +
    '<ol class="dg-check">' + steps.map(function(s, i){
      return '<li><button type="button" data-k="' + i + '" aria-label="mark done">✓</button><div><b>' + s[0] + "</b><pre><code>" + s[1] + "</code></pre><small>" + s[2] + "</small></div></li>";
    }).join("") + "</ol>";
  el.querySelector(".dg-check").addEventListener("click", function(e){
    var b = e.target.closest("button");
    if (!b) { return; }
    b.parentNode.classList.toggle("done");
    var n = el.querySelectorAll(".done").length;
    el.querySelector(".n").textContent = n;
    el.querySelector(".dg-prog i").style.width = n / steps.length * 100 + "%";
  });
});
