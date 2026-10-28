// RV Reviews - mostra estrelas e avaliacoes na pagina do produto.
// Le o arquivo <nome-do-produto>.json hospedado de graca (GitHub Pages).
(function () {
  if (window.__rvReviews) return;
  window.__rvReviews = true;
  var LOG = function (m) { try { console.log("[RV Reviews v2] " + m); } catch (e) {} };
  LOG("script carregado em " + location.pathname);

  // Endereco do GitHub Pages onde ficam os arquivos de avaliacoes (termina com barra)
  var BASE = window.RV_REVIEWS_BASE || "https://rvreviews.github.io/rv-reviews/";
  var POR_VEZ = 12;
  var COR = "#f9b600";

  // so roda em pagina de produto: /produtos/nome-do-produto/
  var partes = location.pathname.split("/").filter(Boolean);
  var idx = partes.indexOf("produtos");
  if (idx === -1 || !partes[idx + 1]) { LOG("nao e pagina de produto, saindo"); return; }
  var slug = decodeURIComponent(partes[idx + 1]).toLowerCase();

  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function numBr(n, casas) { return n.toFixed(casas).replace(".", ","); }

  function estrelas(nota) {
    var cheias = Math.round(nota);
    var s = el("span", "rv-estrelas");
    s.setAttribute("aria-label", numBr(nota, 1) + " de 5 estrelas");
    for (var k = 1; k <= 5; k++) s.appendChild(el("span", k <= cheias ? "rv-on" : "rv-off", "★"));
    return s;
  }

  var CORES = ["#e53935", "#8e24aa", "#3949ab", "#039be5", "#00897b", "#43a047", "#f4511e", "#6d4c41"];
  function corDe(nome) {
    var h = 0;
    for (var i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) % 997;
    return CORES[h % CORES.length];
  }

  function estilo() {
    var css =
      ".rv-bloco{margin:40px 0;font-family:inherit;color:inherit;clear:both}" +
      ".rv-bloco *{box-sizing:border-box}" +
      ".rv-resumo{text-align:center;margin-bottom:24px}" +
      ".rv-media{font-size:4.5em;font-weight:700;line-height:1}" +
      ".rv-resumo .rv-estrelas{font-size:2em;display:block;margin:6px 0}" +
      ".rv-total{opacity:.7}" +
      ".rv-estrelas{letter-spacing:2px;white-space:nowrap}" +
      ".rv-on{color:" + COR + "}.rv-off{color:#d0d0d0}" +
      ".rv-barras{max-width:560px;margin:0 auto 24px}" +
      ".rv-linha{display:flex;align-items:center;gap:10px;margin:8px 0;cursor:pointer}" +
      ".rv-linha .rv-n{width:34px;display:flex;align-items:center;gap:4px}" +
      ".rv-linha .rv-n span:first-child{color:" + COR + "}" +
      ".rv-trilho{flex:1;height:10px;background:rgba(128,128,128,.2);border-radius:99px;overflow:hidden}" +
      ".rv-trilho i{display:block;height:100%;background:" + COR + ";border-radius:99px}" +
      ".rv-cont{min-width:40px;text-align:center;border:1px solid rgba(128,128,128,.35);padding:3px 6px;font-size:.9em}" +
      ".rv-filtro{display:block;width:100%;margin:0 0 20px;padding:14px 18px;border:0;border-radius:99px;background:rgba(128,128,128,.15);color:inherit;font:inherit;cursor:pointer}" +
      ".rv-grade{column-count:2;column-gap:14px}" +
      "@media(min-width:900px){.rv-grade{column-count:3}}" +
      ".rv-card{break-inside:avoid;background:#fff;color:#444;border-radius:18px;overflow:hidden;margin:0 0 14px;box-shadow:0 1px 4px rgba(0,0,0,.08)}" +
      ".rv-mid{position:relative;display:grid;gap:2px;background:#fff}" +
      ".rv-mid.n1{grid-template-columns:1fr;aspect-ratio:1/1}" +
      ".rv-mid.n2{grid-template-columns:1fr 1fr;aspect-ratio:1/1}" +
      ".rv-mid.n3{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;aspect-ratio:1/1.1}" +
      ".rv-mid.n3 .rv-f:first-child{grid-row:1/3}" +
      ".rv-f{position:relative;overflow:hidden;cursor:pointer;background:#eee}" +
      ".rv-f img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}" +
      ".rv-mais-n{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.4em;font-weight:700;background:rgba(0,0,0,.35)}" +
      ".rv-pilula{position:absolute;left:10px;bottom:10px;max-width:calc(100% - 20px);display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.95);border-radius:99px;padding:4px 14px 4px 4px;font-weight:700;color:#333}" +
      ".rv-pilula b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
      ".rv-av{flex:none;width:28px;height:28px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:.9em}" +
      ".rv-corpo{padding:14px 16px 16px}" +
      ".rv-corpo .rv-estrelas{font-size:1.15em}" +
      ".rv-data{opacity:.55;font-size:.8em;margin-left:8px}" +
      ".rv-texto{margin:8px 0 0;line-height:1.5;white-space:pre-line;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;cursor:pointer}" +
      ".rv-texto.aberto{display:block;-webkit-line-clamp:unset}" +
      ".rv-sem-foto .rv-pilula{position:static;background:transparent;padding:0;margin-bottom:8px}" +
      ".rv-mais{display:block;margin:12px auto 0;padding:12px 26px;border:1px solid currentColor;background:transparent;color:inherit;border-radius:99px;cursor:pointer;font:inherit}" +
      ".rv-mini{display:inline-flex;align-items:center;gap:6px;margin:6px 0;font-size:.95em;color:inherit;text-decoration:none}" +
      ".rv-zoom{position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:99999;display:flex;align-items:center;justify-content:center}" +
      ".rv-zoom img{max-width:92vw;max-height:84vh;border-radius:8px}" +
      ".rv-zoom button{position:absolute;background:rgba(255,255,255,.2);color:#fff;border:0;font-size:2em;width:48px;height:48px;border-radius:50%;cursor:pointer}" +
      ".rv-zoom .rv-x{top:16px;right:16px}.rv-zoom .rv-ant{left:12px;top:50%}.rv-zoom .rv-prox{right:12px;top:50%}" +
      ".rv-zoom .rv-cnt{position:absolute;bottom:18px;color:#fff}";
    var s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
  }

  function ampliar(fotos, inicio) {
    var pos = inicio;
    var f = el("div", "rv-zoom");
    var im = document.createElement("img");
    var cnt = el("div", "rv-cnt");
    var x = el("button", "rv-x", "×");
    var ant = el("button", "rv-ant", "‹");
    var prox = el("button", "rv-prox", "›");
    function mostrar() {
      im.src = fotos[pos];
      cnt.textContent = (pos + 1) + " / " + fotos.length;
      ant.style.display = prox.style.display = fotos.length > 1 ? "block" : "none";
    }
    function fechar() { f.remove(); document.removeEventListener("keydown", tecla); }
    function tecla(e) {
      if (e.key === "Escape") fechar();
      else if (e.key === "ArrowRight") { pos = (pos + 1) % fotos.length; mostrar(); }
      else if (e.key === "ArrowLeft") { pos = (pos - 1 + fotos.length) % fotos.length; mostrar(); }
    }
    ant.addEventListener("click", function (e) { e.stopPropagation(); pos = (pos - 1 + fotos.length) % fotos.length; mostrar(); });
    prox.addEventListener("click", function (e) { e.stopPropagation(); pos = (pos + 1) % fotos.length; mostrar(); });
    x.addEventListener("click", fechar);
    f.addEventListener("click", function (e) { if (e.target === f) fechar(); });
    document.addEventListener("keydown", tecla);
    [im, x, ant, prox, cnt].forEach(function (n) { f.appendChild(n); });
    document.body.appendChild(f);
    mostrar();
  }

  function cartao(a) {
    var nome = a.nome || "Cliente";
    var card = el("div", "rv-card");
    var fotos = (a.fotos || []).slice();
    var pilula = el("div", "rv-pilula");
    var av = el("span", "rv-av", nome.charAt(0).toUpperCase());
    av.style.background = corDe(nome);
    pilula.appendChild(av);
    pilula.appendChild(el("b", null, nome));

    if (fotos.length) {
      var n = Math.min(3, fotos.length);
      var mid = el("div", "rv-mid n" + n);
      for (var i = 0; i < n; i++) {
        (function (i) {
          var f = el("div", "rv-f");
          var im = document.createElement("img");
          im.src = fotos[i];
          im.loading = "lazy";
          im.alt = "Foto da avaliação";
          f.appendChild(im);
          if (i === 2 && fotos.length > 3) f.appendChild(el("div", "rv-mais-n", "+" + (fotos.length - 3)));
          f.addEventListener("click", function () { ampliar(fotos, i); });
          mid.appendChild(f);
        })(i);
      }
      mid.appendChild(pilula);
      card.appendChild(mid);
    } else {
      card.className += " rv-sem-foto";
    }

    var corpo = el("div", "rv-corpo");
    if (!fotos.length) corpo.appendChild(pilula);
    var topo = el("div");
    topo.appendChild(estrelas(Number(a.nota) || 5));
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(a.data || "");
    if (m) topo.appendChild(el("span", "rv-data", m[3] + "/" + m[2] + "/" + m[1]));
    corpo.appendChild(topo);
    if (a.texto) {
      var t = el("p", "rv-texto", a.texto);
      t.addEventListener("click", function () { t.classList.toggle("aberto"); });
      corpo.appendChild(t);
    }
    card.appendChild(corpo);
    return card;
  }

  function montar(dados) {
    var todas = (dados && dados.avaliacoes) || [];
    if (!todas.length) return;
    estilo();

    var soma = 0;
    var cont = [0, 0, 0, 0, 0, 0];
    todas.forEach(function (a) {
      var n = Math.min(5, Math.max(1, Math.round(Number(a.nota) || 5)));
      cont[n]++;
      soma += n;
    });
    var media = soma / todas.length;
    var mediaTxt = Math.abs(media - Math.round(media)) < 0.05 ? String(Math.round(media)) : numBr(media, 1);
    var totalTxt = todas.length + (todas.length === 1 ? " avaliação" : " avaliações");

    var bloco = el("section", "rv-bloco");
    bloco.id = "rv-avaliacoes";

    var resumo = el("div", "rv-resumo");
    resumo.appendChild(el("div", "rv-media", mediaTxt));
    resumo.appendChild(estrelas(media));
    resumo.appendChild(el("div", "rv-total", totalTxt));
    bloco.appendChild(resumo);

    var filtro = el("select", "rv-filtro");
    filtro.setAttribute("aria-label", "Filtrar avaliações");
    [["todas", "Todas"], ["fotos", "Com fotos"], ["5", "5 estrelas"], ["4", "4 estrelas"], ["3", "3 estrelas"], ["2", "2 estrelas"], ["1", "1 estrela"]].forEach(function (o) {
      var op = document.createElement("option");
      op.value = o[0];
      op.textContent = o[1];
      filtro.appendChild(op);
    });

    var barras = el("div", "rv-barras");
    for (var s = 5; s >= 1; s--) {
      (function (s) {
        var l = el("div", "rv-linha");
        var n = el("span", "rv-n");
        n.appendChild(el("span", null, "★"));
        n.appendChild(el("span", null, String(s)));
        var trilho = el("div", "rv-trilho");
        var i = document.createElement("i");
        i.style.width = (cont[s] / todas.length * 100) + "%";
        trilho.appendChild(i);
        l.appendChild(n);
        l.appendChild(trilho);
        l.appendChild(el("span", "rv-cont", String(cont[s])));
        l.addEventListener("click", function () { filtro.value = String(s); aplicar(); });
        barras.appendChild(l);
      })(s);
    }
    bloco.appendChild(barras);
    bloco.appendChild(filtro);

    var grade = el("div", "rv-grade");
    bloco.appendChild(grade);
    var botao = el("button", "rv-mais", "Ver mais avaliações");
    botao.type = "button";
    bloco.appendChild(botao);

    var atual = todas;
    var mostradas = 0;
    function maisUm() {
      atual.slice(mostradas, mostradas + POR_VEZ).forEach(function (a) { grade.appendChild(cartao(a)); });
      mostradas = Math.min(atual.length, mostradas + POR_VEZ);
      botao.style.display = mostradas >= atual.length ? "none" : "block";
    }
    function aplicar() {
      var v = filtro.value;
      atual = todas.filter(function (a) {
        if (v === "todas") return true;
        if (v === "fotos") return a.fotos && a.fotos.length;
        return Math.round(Number(a.nota) || 5) === Number(v);
      });
      grade.innerHTML = "";
      mostradas = 0;
      maisUm();
    }
    filtro.addEventListener("change", aplicar);
    botao.addEventListener("click", maisUm);
    maisUm();

    // lugar do bloco: logo abaixo da descricao; se nao achar, antes do rodape
    var alvo = document.querySelector('[data-store="product-description"], #product-description, .product-description, [class*="product-description"]');
    if (!alvo) {
      // plano B: acha o titulo "Descricao" da pagina e usa a caixa dele
      var tit = Array.prototype.slice.call(document.querySelectorAll("h1,h2,h3,h4,h5,h6,div,span,p,summary")).filter(function (n) {
        return n.children.length === 0 && /^\s*Descri[\u00e7c][\u00e3a]o\s*$/i.test(n.textContent) && n.parentElement && n.parentElement !== document.body;
      })[0];
      if (tit) alvo = tit.parentElement;
    }
    if (alvo && alvo.parentNode) alvo.parentNode.insertBefore(bloco, alvo.nextSibling);
    else {
      var rod = document.querySelector("footer");
      if (rod && rod.parentNode) rod.parentNode.insertBefore(bloco, rod);
      else document.body.appendChild(bloco);
    }

    // estrelinhas pequenas junto do titulo; clicar leva para as avaliacoes
    var h1 = document.querySelector("h1");
    if (h1 && h1.parentNode) {
      var mini = el("a", "rv-mini");
      mini.href = "#rv-avaliacoes";
      mini.appendChild(estrelas(media));
      mini.appendChild(el("span", "rv-total", mediaTxt + " (" + todas.length + ")"));
      h1.parentNode.insertBefore(mini, h1.nextSibling);
    }
  }

  function iniciar() {
    LOG("buscando " + BASE + encodeURIComponent(slug) + ".json");
    fetch(BASE + encodeURIComponent(slug) + ".json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { LOG("arquivo lido: " + ((d && d.avaliacoes && d.avaliacoes.length) || 0) + " avaliacoes"); montar(d); })
      .catch(function (e) { LOG("sem avaliacoes para este produto (" + (e && e.message) + ")"); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
