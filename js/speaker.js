var g_speaker = {
    synth: window.speechSynthesis,
    text: '',
    log: true,
    words: [],
    utterThis: 0,
    init: () => {
        speechSynthesis.onvoiceschanged = () => {
            voices = g_speaker.synth.getVoices();
            for (i = 0; i < voices.length; i++) {
                if (voices[i].lang == 'ja-JP') {
                    g_speaker.utterThis = new SpeechSynthesisUtterance();
                    g_speaker.utterThis.onend = function(event) {
                        $('.speaking_word').removeClass('speaking_word');
                        if(g_speaker.log){
                            g_activeDiv.find('textarea').trigger('input');
                        }
                    }
                    g_speaker.utterThis.onerror = function(event) {}
                    g_speaker.utterThis.onboundary = function(event) {
                        if(g_speaker.log){
                            var word = event.target.text.substr(event.charIndex, event.charLength);
                            g_speaker.words.push(word);
                            $('.speaking_word').removeClass('speaking_word');
                            for(let i = 0; i<event.charLength; i++){
                                g_activeDiv.find('span[data-wordIndex='+(event.charIndex+i)+']').addClass('speaking_word');
                            }
                        }
                    }
                    g_speaker.utterThis.voice = voices[i];
                    g_speaker.utterThis.pitch = g_config.patch;
                    g_speaker.utterThis.rate = g_config.rate;
                    g_speaker.utterThis.volume = 1;
                    return true;
                }
            }
            return false;
        };
    },

    setPatch: (value) => {
    	g_config.patch = value;
    	local_saveJson('config', g_config);
    },

    setRate: (value) => {
    	g_config.rate = value;
    	local_saveJson('config', g_config);
    },

    speak: (text, log = true) => {
        $('.speaking_word').removeClass('speaking_word');
        if (g_speaker.synth.speaking) {
            g_speaker.synth.cancel()
        }
        g_speaker.log = log;
        if(log){
            g_speaker.text = text;
            g_speaker.words = [];
        }
        g_speaker.utterThis.text = text;
        g_speaker.synth.speak(g_speaker.utterThis);
    }
}
g_speaker.init();