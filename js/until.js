

String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

var _GET = getGETArray();
var g_s_api = location.host == '127.0.0.1' ? './api/' : 'https://neysummer-api.glitch.me/';

var g_localKey = 'reading_';
// 本地储存前缀
var g_config;
initConfig();
function initConfig(){
    g_config = local_readJson('config', {
        patch: 1,
        rate: 1,
        voice: 1,
        room: {
            id: '',
            key: '',
            owner: '',
        },
        user: {
            name: '無名',
            country: 'china',
            desc: '',
            icon: './img/default.jpg'
        }
    });
}

var g_manga = local_readJson('manga', {});
var g_noval = local_readJson('noval', {
    list: {}
});
var g_history = local_readJson('history', {
    title: '',
    content: '',
    list: {},
    parse: {},
});

if(_GET['user']){
    g_config.user.name = _GET['user'];
    g_config.user.icon = _GET['icon'] || './img/'+_GET['user']+'.jpg';
}
function local_saveJson(key, data) {
    if (window.localStorage) {
        key = g_localKey + key;
        data = JSON.stringify(data);
        if (data == undefined) data = '[]';
        return localStorage.setItem(key, data);
    }
    return false;
}

function local_readJson(key, defaul = '') {
    if (!window.localStorage) return defaul;
    key = g_localKey + key;
    var r = JSON.parse(localStorage.getItem(key));
    return r === null ? defaul : r;
}

function getGETArray() {
    var a_result = [], a_exp;
    var a_params = window.location.search.slice(1).split('&');
    for (var k in a_params) {
        a_exp = a_params[k].split('=');
        if (a_exp.length > 1) {
            a_result[a_exp[0]] = decodeURIComponent(a_exp[1]);
        }
    }
    return a_result;
}

function _s1(s, j = '') {
    s = parseInt(s);
    return (s == 0 ? '' : (s < 10 ? '0' + s : s) + j);
}

function _s2(s, j = '') {
    s = parseInt(s);
    return (s == 0 ? '' : s + j);
}


function _s(i, j = '') {
    return (i < 10 ? '0' + i : i) + j;
}

function scrollTo(y, dom, ms = 600) {
    console.log(y, dom);
    $(dom || "html, body").stop(true, true).animate({
        scrollTop: y + 'px',
    }, ms);
}

// 获取元素的绝对位置坐标（像对于页面左上角）
function getElementPagePosition(element){
  //计算x坐标
  var actualLeft = element.offsetLeft;
  var current = element.offsetParent;
  while (current !== null){
    actualLeft += current.offsetLeft;
    current = current.offsetParent;
  }
  //计算y坐标
  var actualTop = element.offsetTop;
  var current = element.offsetParent;
  while (current !== null){
    actualTop += (current.offsetTop+current.clientTop);
    current = current.offsetParent;
  }
  //返回结果
  return {x: actualLeft, y: actualTop}
}

// 获取元素的绝对位置坐标（像对于浏览器视区左上角）
function getElementViewPosition(element){
  //计算x坐标
  var actualLeft = element.offsetLeft;
  var current = element.offsetParent;
  while (current !== null){
    actualLeft +=  (current.offsetLeft+current.clientLeft);
    current = current.offsetParent;
  }
  if (document.compatMode == "BackCompat"){
    var elementScrollLeft=document.body.scrollLeft;
  } else {
    var elementScrollLeft=document.documentElement.scrollLeft;
  }
  var left = actualLeft - elementScrollLeft;
  //计算y坐标
  var actualTop = element.offsetTop;
  var current = element.offsetParent;
  while (current !== null){
    actualTop += (current.offsetTop+current.clientTop);
    current = current.offsetParent;
  }
  if (document.compatMode == "BackCompat"){
    var elementScrollTop=document.body.scrollTop;
  } else {
    var elementScrollTop=document.documentElement.scrollTop;
  }
  var right = actualTop-elementScrollTop;
  //返回结果
  return {x: left, y: right}
}

function getTime(s) {
    s = Number(s);
    var h = 0,
        m = 0;
    if (s >= 3600) {
        h = parseInt(s / 3600);
        s %= 3600;
    }
    if (s >= 60) {
        m = parseInt(s / 60);
        s %= 60;
    }
    return _s1(h, ':') + _s(m, ':') + _s(s);
}

$(function() {

       /* parseContent('１　プロローグ', `勇者と魔王の戦い。

　それは、この世界で幾度となく繰り返されてきたものだ。

　魔族を統べる魔王。

　彼らは一つの時代に必ず一人いる。

　今代の魔王が倒された時、魔族や魔物の中でも特に強い力を持ったものが、次代の魔王として進化する。

　そう、世界によって決められている。

　故に、魔王は滅びることはあっても、絶えることはない。

　その性質は千差万別。

　剛力により拳で地面を割り砕き、谷を作ったとされる魔王。

　魔導を極め、千の術を操ったとされる魔王。

　そうした魔王たちに共通しているのは、人族に敵対し、いずれも強力であるということ。

　勇者はそんな魔王と戦う、人族の希望。

　勇者と魔王の戦いは、まさに一進一退。

　勇者が魔王を討ち滅ぼすこともあれば、魔王が勇者を退けることもあった。

　しかし、魔王が絶えぬように、勇者もまた、絶えぬ存在だった。

　両者の戦いは、代を超え、連綿と続いている。

　それはこの世界の宿命。

　悲劇があるとすれば、その代の勇者と魔王は、互いに相性が良すぎた。

　双方ともに、希少な次元魔法の使い手。

　次元と時空すら操る神にも匹敵する魔法。

　彼らは己の宿命に従い、その魔法を行使した。

　二つの魔法がぶつかり合い、世界が悲鳴を上げる。

　勇者と魔王は、己の魔法の力に耐えられずに滅びた。

　その余波は、時空をも超えて別世界に届いてしまう。

　その時空の大爆発は、地球という名の世界の、日本という国の、とある高校の教室で炸裂した。

　教室内にいた、総勢２６人の生徒と教師は、魔法の直撃を受け、あっけなく命を落とした。

　その事件は、謎の大爆発と報道された。

　だが、死んでしまった彼らがその放送を知ることはない。

　たとえ生まれ変わっても、ない。

　なぜならば、彼らの魂は、時空を渡り、勇者と魔王が争う世界に逆流してしまったからだ。

　彼らの魂は、新たな世界で飛散し、それぞれが新しい命として生まれ変わる。

　これは、そんな彼らのうちの一人の物語。





　＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊





　うぐおがー！



　意味不明のうめき声をあげたつもりだったんだけど、うめき声も出やしない。

　それだけ今の私の体はやばい状態なのか？



　ＯＫ、落ち着け私。

　体に痛みはない。

　国語の授業中に、いきなりものすごい激痛に襲われたところまでは覚えてる。

　多分それで気を失ってたんだと思うんだけど、今はどこも痛まない。

　けど、目を開けても真っ暗でここがどこだかもわかりゃしない。

　というか、まるで体を何かに覆われているみたいな感じで動かせない。



　これはまさか、植物人間状態！？

　うわー。

　否定したいけど、状況的にその可能性が高い。

　何があったのかは分からないけど、どうやら私は植物人間になってしまったっぽい。

　ないわー。

　意識だけあって体も動かせない、五感もないとか…。

　発狂コース確定じゃないですかー。

　ないわー。



　と、思ったら、何やらカサカサという音が微かに聞こえる。

　聞こえるってことは、聴覚は生きてるわけだ。

　うーん。

　けど、音が聞こえるだけってのも辛いことに変わりないよね。



　ガンッ！

　あ痛！？

　なになに？

　なんかぶつかった？

　ん？

　痛いってことは触覚も生きてる？

　あれあれ？

　もう一度落ち着け私。



　冷静になってみれば、なんか違和感あるけど、体の感覚あるじゃん！

　いやー、植物人間とか早とちりだったっぽい。

　さっきは体が何かに覆われてるみたいって言ったけど、そのものずばりそのままの状態だったわけだ。

　あはは。



　いや、笑いごとじゃなくね！？

　え、何この状況？

　麻袋に入れられて拉致？

　イヤイヤ。

　私みたいな最底辺女誰が攫って得するよ？

　とにかく、脱出せねば。



　ピシッ！

　お、体に力を入れて踏ん張ってみたら、私を覆っている何かが壊れ始めた。

　麻袋じゃなかったっぽい。

　なんだろうこれ？

　柔らかいような、硬いような、不思議な感触。

　まあ、壊れるならそれに越したことはない。

　このまま壊していざ脱出！



　パカッ！

　開いたー！

　頭から這い出す。

　これで私は自由だー！



　目の前に大量の蜘蛛がウヨウヨしてた。



　ホワィッ！？

　ウエェェェイェ！？

　キショッ！？

　なにこの巨大蜘蛛軍団！？

　一匹一匹が私と同じくらいでかいんですけど！？

　え、なんか卵みたいなものから次々出てくる！

　さっきカサカサ聞こえてたのはこれかー！！



　思わず後ずさる。

　足に何かがあたって振り向く。

　うん？

　これは、あれか？

　私がさっき這い出してきたものか？

　なーんか、蜘蛛軍団の卵に似てるように見えるのは気のせいか？

　似てるというか、そのものじゃね？



　改めて自分の姿を見直す。

　首が動かない。

　けど、視界の端に私の足らしきものが映った。

　蜘蛛の足が。



　おおおおおおぉぉぉおおおお落ちちちち付けけけ！！！

　こ、これは、まさかのあれか！？

　あれなのか！？

　今ネットで流行のあれなのか！？

　イヤイヤイヤ！

　ほら、小説とかだと、神様的なやつに特典とか貰うじゃん？

　私もらってないしきっと違うはず！

　神様出てこないパターンもあるけど、いくらなんでもねえ。

　男の場合勇者候補とか、女の場合悪役令嬢とかそういうパターンもあるけどさ。



　もう一度チラッと横を見る。

　周りにワサワサいる蜘蛛と同じ、細い針金のような足があった。

　意識して足を動かしてみる。

　私の思い通りに動いた。



　うむ。

　現実逃避は大の得意だけど、ここは潔く認めなければならない。



　どうやら私は、蜘蛛に転生してしまったらしい。`);*/
});
