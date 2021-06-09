var g_cache = {
	logined: false,
	list: {},
	queryList: [],
	unread: 0,
	b_history: false,
	parse: {},
}
var _audio2;
var connection;
//var socket_url = 'ws://192.168.23.1:8000';
var socket_url = 'wss://japanese-typing-server1.glitch.me';
// var socket_url = 'ws://127.0.0.1:8000';
function recon() {
	if(g_cache.logined){
		setTimeout(() => {initWebsock()}, 1000);
		/*if(confirm('是否重连?')){
			window.location.reload();
		}*/
	}
}
initWebsock();
function initWebsock(){
	connection = new WebSocket(socket_url);
	connection.onopen = () => {
		g_cache.logined = true;
		console.log('连接成功');
		if(_GET['search']){
			if(_GET['room']){
				queryMsg({type: 'getRoomIdByName', search: _GET['room']})
			}else
			if(_GET['owner']){
				queryMsg({type: 'getRoomIdByOwner', search: _GET['owner']})
			}
		}else
		if(_GET['room']){
			doAction('getRoomSetting', {id: _GET['room']});
		}
	}

	connection.onclose = () => {
	    recon();
	}

	connection.onerror = (error) => {
	    recon();
	}

	connection.onmessage = (e) => {
		reviceMsg(JSON.parse(e.data));
	}
}

$(function() {
	$(window).
	resize(function(event) {
		resizeTextArea();
	});
	$('.content-wrapper').scroll(function(e) {
        var validH = this.scrollHeight;
        var scrollH = this.scrollTop + this.offsetHeight;
        var result = (scrollH / validH * 100).toFixed(2);
        $('.progress-bar').css('width', result + '%');
    });
	$('body').on('click', '[data-action]', function(e){
		doAction($(this).attr('data-action'), this);
	})

	
	initNovalList();
	initSetting();
	$('#switch-darkMode').prop('checked', halfmoon.darkModeOn);

	// doAction('openUserDialog');
});

function resizeTextArea(){
	return $('.text-input').each(function(i, dom){
			var span = $(this).parent().find('b');
			$(dom).css({
				width: span.width() + 5 + 'px',
				height: span.height() + 4 + 'px',
				});
		});
}
  
	var g_activeDiv;
	var g_timer = {time: 0, timer: 0};
	function parseContent(title, content){
		clearInterval(g_timer.timer);
		g_timer.timer = setInterval(() => {
			$('#time').html(getTime(g_timer.time++));
		}, 1000);

		var html = `<div id="flot-icon-list"></div><div class="content">`;
    var list = content.split("\n");
    var length = 0;
		for(var i=0;i<list.length;i++){
			if(list[i] != ''){
				var words = list[i].trim().split('');
				var s = '';
				for(var i1 = 0; i1<words.length;i1++){
					s += '<span data-index='+length+' data-wordIndex="'+i1+'">' + words[i1] + '</span>';
					length++;
				}
				html += '<div data-index="'+i+'"><p><b onclick="onClickText(event);">' + s + '</b></p>';
				html += `<textarea class="text-input"></textarea></hr></div>`;
			}
		}
		html += '</div>';
		$('.reading-content').html(html);

		resizeTextArea()
		.on('input', function(event){
			var div = $(this).parent();
			var span = div.find('b');
			var words = this.value.split('');
			var answer = span.text().split('');
			var html = '';
			var word_start = '';
			var word_start_length = 0;
			var cnt = 0;
			var right = '';
			var last = -1;
			for(var i = 0; i<answer.length;i++){
				if(i >= words.length){
					cls = '';
					if(word_start == ''){ // 还未输入的单词
						word_start = answer[i];
						word_start_length = i;
					}
				}else
				if(words[i] == answer[i]){
					cls = 'text-success';
					right += words[i];
					last = i;
				}else{
					cls = 'text-danger';
					cnt++;
				}
				div.find('[data-wordIndex='+i+']').attr('class', cls);
			}
			if(last != -1 && g_cache.logined){
				queryMsg({
					type: 'iconMove',
					index: div.find('[data-wordIndex='+last+']').attr('data-index'),
				});
			}
			if(cnt == 0){
				if(false){
					var length = 0;
					for(var i1=0;i1<g_speaker.words.length;i1++){
						var word = g_speaker.words[i1];
						length+=word.split('').length;
						if(word.indexOf(word_start) != -1 && length >= word_start_length){
							g_speaker.speak(word　+ (i1 != g_speaker.words.length -1 ?g_speaker.words[i1+1] : ''), false);
								break;
						}
					}
				}else{

					var id = div.attr('data-index');
					if(g_cache.parse[id] != undefined){
						var str = '';
						var b = false;
						for(var d of g_cache.parse[id]){
							if(right == '' || b && d[1] != null){
								$('#tip').html(d[0] + (d[1] != null ? '</br>' + d[1] : '')).parents('#FTmenu').fadeIn('fast');
								g_speaker.speak(typeof(d) == 'string' && d[1].indexOf('/') != -1 ? d[1].replaceAll('/', ' 、 ') : d[0], false);
								return;
							}
							str += d[0];
							b = str == right;
						}
					$('#FTmenu').fadeOut('fast');

					}
				}
			}
			updateStatus();
		})
		.on('focus', function(event){
			var text = $(this.previousElementSibling).find('b').text();
			if(g_speaker.text != text){
				g_activeDiv = $(this).parent();
				var index =  g_activeDiv.attr('data-index');
				g_speaker.speak(text);
				if(g_cache.parse[index] == undefined){
						$.post(g_s_api+'japanese.php', { q: text, i: index}, function(data, textStatus, xhr) {
	        if (textStatus == 'success') {
	            g_data = JSON.parse(data);
	        		g_cache.parse[g_data['index']] = g_data.res;
					}
				});
				}
			}
		}).
		on('keydown', function(event){
			if(event.keyCode === 13 ){
				var span = $(this).parent().find('b');
				var index = parseInt($(this).parent().attr('data-index'));
				g_history.list[index] = this.value;
				local_saveJson('history', g_history);

				if(span.text() == this.value){
					var next = $(this).parent().next();
					var textarea = next.find('textarea');
					if(next.length) scrollTo(getElementPagePosition(textarea.focus()[0]).y - (window.innerHeight - next.height()) / 2, '.content-wrapper', 500);
				}
				event.preventDefault();
				event.stopPropagation();
			}
		});
		if(g_history.content == content){
			var div;
			g_cache.b_history = true;
			for(var index in g_history.list){
				div = $('div[data-index='+index+']');
				div.find('textarea').val(g_history.list[index]).trigger('input');
			}
			g_cache.b_history = false;
			if(div){
				var next = div.next();
				if(next.length) scrollTo(next.find('textarea').focus().offset().top - (window.innerHeight - next.height()) / 2);

			}
		}else{
			g_history.list = {};
		}


		$('#title').html(title);
		g_history.title = title;
		g_history.content = content;
		g_history.indexLength = length;

		local_saveJson('history', g_history);
	}

	function updateStatus(){
		if(!g_cache.b_history){
					var i = parseInt($('.text-success').length / g_history.indexLength * 100);
					queryMsg({
						type: 'status',
						content: i + '%',
						class: i == 100 ? 'badge-success' : 'badge-primary'
					});
			}
	}


	function soundTip(url) {
	    $('#audio_tip')[0].src = url;
	    $('#audio_tip')[0].play();
	}


	function queryMsg(data, debug = false){
		data.username = g_config.user.name;
		var msg = JSON.stringify(data);
		//reviceMsg(data);
		if(g_cache.queryList.indexOf(msg) == -1){
			g_cache.queryList.push(msg);
		}
		if(connection.readyState){
			for(var query of g_cache.queryList){
				connection.send(query);
    		if (debug) console.log(query);
			}
			g_cache.queryList = [];
		}
	}

	function reviceMsg(data){
		if(data.type != 'status' && data.type != 'iconMove') console.log(data);
		switch(data.type){
			case 'rooms':
				var h = '';
				var room;
				// <div class="row">
    //       <div class="col-md-8 offset-md-2">

    //       </div>
    //     </div>
				for(var id in data.rooms){
					room = data.rooms[id];
					h += `<div class="w-400 mw-full">
					  <div class="card">
					    <h2 class="card-title">
					      `+room.name+`
					    </h2>
					    <p class="text-muted">
					      owner: `+room.owner+`</br>
					      players: `+room.players+(room.maxPlayer ? `/`+room.maxPlayer : '')+`
					    </p>
					    <div class="text-right">
					      <a href="javascript: doAction('getRoomSetting', '{id: \\`+id+`\\}');halfmoon.toggleModal('dialog_rooms');" class="btn">Join</a>
					    </div>
					  </div>
					</div>`;
				}
				$('#dialog_rooms .container').html(h);
				halfmoon.toggleModal('dialog_rooms');
				break;
			case 'setContent':
				parseContent(data.title, data.content);
				setTimeout(() => {updateStatus()}, 1000);
				break;
			case 'roomKey':
				g_config.room.key = data.key;
				g_config.room.id = data.id;
				local_saveJson('config', g_config);
				initRoomSetting();
				break;
			case 'msg':
			var date = new Date();
			var float = data.username == g_config.user.name ? 'right' : 'left';
			var con = $('#chat_list').append(`
					<div class="position-relative"> 
  			<div class="position-absolute `+float+`-0 text-`+float+`">
      		<img src="`+getUserIcon(data.username) +`" class="img-fluid rounded-circle user-icon" alt="rounded circle image">
      		<div class="msg alert" role="alert">
					  `+data.msg+`</br>
					  <small>`+date.getHours()+':'+date.getMinutes()+`</small>
					</div>
  			</div> 
				</div>
				<div class="space"></div>
				`);

    	if(!$('#dropdown_chat').hasClass('show')){
    		g_cache.unread++;
    		$('#unread').html(g_cache.unread).show();;
    	}else{
    		con.animate({ scrollTop: con[0].scrollHeight + 'px' }, 0);
    	}
    	soundTip('./res/pop.mp3');
			break;
			case 'iconMove':
				var span = $('span[data-index='+data.index+']');
				if(span.length){
					var img = $('img[data-user1="'+data.username+'"]');
					if(!img.length) img = $('#flot-icon-list').append(`
						<img data-user1="`+data.username+`" src="`+ getUserIcon(data.username) +`" class="img-fluid rounded-circle user-icon-sm float-icon" alt="`+data.username+`">
						`);
						var parent =  $('.reading-content').offset();
					img.css({
						top: span.offset().top - img.height() - parent.top + 'px',
						left: span.offset().left - parent.left + 'px',
					});
				}
				break;
			case 'status':
			 	var badge = $('.user-list[data-user="'+data.username+'"]').find('.badge').html(data.content);
			 	if(badge.attr('data-class')){
			 		badge.removeClass(badge.attr('data-class'));
			 	}
			 	badge.addClass(data.class);
			 	badge.attr('data-class', data.class);
			 	break;

		case 'tip':
			switch(data.color){
				case 'error':
					toastPrimaryAlert(data.msg, data.title, data.time);
					break;

				case 'success':
					toastSuccessAlert(data.msg, data.title, data.time);
					break;

				case 'default':
					toastSecondaryAlert(data.msg, data.title, data.time);
					break;

				case 'error':
					toastDangerAlert(data.msg, data.title, data.time);
					break;
			}
			break;

			case 'join':
				console.log(data.username+'加入了房间');
				reviceMsg({type: 'status', username: data.username, content: 'Online', class: 'badge-primary'});
				if(data.username == g_config.user.name){
					reviceMsg({type: 'tip',  color: 'success', msg: '房间加入成功.', title: '加入成功'});
			 		queryMsg({type: 'getContent', id: data.id});
				}else{
    			soundTip('./res/pop.mp3');
				}
			 	queryMsg({type: 'list', id: data.id});
				break;

			case 'input':
				switch(data.type1){
					case 'roomPassword':
						var password = prompt('请输入密码', '');
						if(password != null){
							doAction('getRoomSetting', {id: data.id, password: password});
						}
						break;
				}
				break;

			case 'roomSetting':
				g_config.room.owner = data.username;
				g_config.roomSetting = data;
				local_saveJson('config', g_config);
				initRoomSetting();
				break;

			case 'joinRoom':
				doAction('getRoomSetting', {id: data.id});
				break;

			 case 'getRoomSetting':
			 	g_config.room = data;
			 	queryMsg({type: 'list', id: data.id});
			 	break;

			 case 'list':
			 if(typeof(data.list) != 'object') return;
			 $('#chat_title').html('聊天室('+Object.keys(data.list).length+'人)');
			 g_cache.list = data.list;
			 	var h = '';
			 	for(var name in data.list){
			 		detail = data.list[name];
			 		h += `<div class="user-list" data-user="`+detail.name+`">
      		<div>
      		<img src="`+detail.img+`" class="img-fluid rounded-circle user-icon" title="`+detail.name+`">
      		</div>
      		<span class="badge `+detail.class+`">`+detail.status+`</span>
      	</div>`
			 	}
			 	$('#list_icon').html(h);
			 	break;
		}
	}

	function getUserIcon(name){
		return g_cache.list[name] != undefined ? g_cache.list[name].img : (['maki', 'chisato'].indexOf(name) != -1 ? './img/'+name+'.jpg' : './img/default.jpg');
	}

	function onClickText(event){
		var selected = getSelectionText();
		if(selected == ''){
			event.srcElement.parentElement.nextElementSibling.focus();
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		g_speaker.speak(selected, false);
	}

	function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function initNovalList(){
	var html = '';
	for(var name in g_noval.list){
		var detail = g_noval.list[name];
		html += `<a href="#" class="sidebar-link sidebar-link-with-icon active">
    	<details class="collapse-panel w-400 mw-full mt-20" open>
  <summary class="collapse-header without-arrow">
    <span class="hidden-collapse-open text-muted">&plus;</span>
    <span class="hidden-collapse-closed text-muted">&minus;</span>
    <span class="ml-5">`+detail['name']+`</span> 
  </summary>
  <div class="collapse-content">
  	<ol>
  	`;
  	for(var caption of detail['list']){
  		html += `<li>
  			<span>`+caption['name']+`</span>
  			<small class='float-right'>0%</small>
  		</li>`;
  	}
	}
	html += `
  	</ol>
  </div>
</details>
    </a>`;
	$('#noval-list').html(html);
	
}

function doAction(action, params = {}){
	switch(action){
		case 'showRooms':
			queryMsg({type: 'getRooms'})
			break;
		case 'setContent':
			var title = prompt('title', '');
			if(title != null){
				var content = prompt('content', '');
				if(content != null){
					if(!connection.readyState) return parseContent(title, content);
					queryMsg({type: 'setContent', title: title, content: content, id: g_config.room.id, key: g_config.room.key});
				}
			}
			break;
		case 'sendMsg':
		var msg = $('#chat_input input').val();
		queryMsg({
			type: 'msg',
			msg: msg
		});
		$('#chat_input input').val('');
		break;
			break;
		case 'reset':
			if(confirm('Are you sure?')){
				$('textarea').val('');
			}
			break;

		case 'dialog_room':
			if(g_config.room.owner && g_config.room.owner != g_config.user.name){
				return toastDangerAlert('你没有权限更改房间,请自己创建房间', '警告', 2000);
			}
			halfmoon.toggleModal('dialog_room');
			break;

		case 'openUserDialog':
			halfmoon.toggleModal('dialog_user');
			break;

		case 'saveRoomSetting':
			var data = {
				id: $('#room_name input').val(),
				maxPlayer: $('#room_maxPlayer input').val(),
				password: $('#room_password input').val(),
				bgImg: $('#room_bgImg input').val() || './img/bg.jpg'
			};
			if(data.id == ''){
				return alert('请输入名字');
			}
			g_config.roomSetting = data;
			data.key = g_config.room.key;
			data.type = 'roomSetting';
			queryMsg(data);

			local_saveJson('config', g_config);
			halfmoon.toggleModal('dialog_room');
			toastSuccessAlert('success saved!', 'Save', 2000);
			break;

		case 'saveUserSetting':
			g_config.user = {
				icon: $('#user_icon img').attr('src'),
				name: $('#user_name input').val(),
				country: $('#user_country input').val(),
				desc: $('#user_desc textarea').val(),
			}
			local_saveJson('config', g_config);
			halfmoon.toggleModal('dialog_user');
			toastSuccessAlert('success saved!', 'Save', 2000);
			break;

		case 'getRoomSetting':
		var data = {
				type: 'getRoomSetting',
				id: params.id,
				img: g_config.user.icon,
			};
			if(params.password != undefined){
				data.password = params.password;
			}
			queryMsg(data);
			break;
	}

}


function initSetting(){
	$('#user_icon img').attr('src', g_config.user.icon || './img/maki.jpg');
	$('#user_name input').val(g_config.user.name || '');
	$('#user_country input').val(g_config.user.country || '');
	$('#user_desc textarea').val(g_config.user.desc || '');
	$('img[data-action="openUserDialog"]').attr('src', g_config.user.icon || './img/maki.jpg');
}

function initRoomSetting(){
	$('#room_name input').val(g_config.room.id);
	$('#room_title').html(g_config.roomSetting.name);
	$('#room_password input').val(g_config.roomSetting.password || '');
	$('#room_maxPlayer input').val(g_config.roomSetting.maxPlayer || 5);
	document.body.style.cssText =  'background-image: url('+g_config.roomSetting.bgImg+') !important';
}