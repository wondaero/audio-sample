export function Audio1(obj) {
    const t = this;

    const exeFnc = fnc => (fnc && typeof fnc === 'function') ? fnc(t.list[t.curIdx], t) : '';

    t.curIdx = 0;
    t.list = [];
    t.raf = '';

    function constructor(){
        let allAudioReady = 0;

        obj.list.forEach((audio, idx) => {
            const newAudio = new Audio(audio.audioUrl);

            newAudio.onloadeddata = () => {
                t.list[idx] = {
                    idx: idx,
                    audio: newAudio,
                    title: audio.title,
                    subtitle: audio.subtitle
                }

                allAudioReady++;
                if(obj.list.length == allAudioReady){
                    // console.log(idx, '성공');

                    exeFnc(obj.audioAllLoaded);

                    allAudioReady = 0;
                }
            }
        })
    }

    constructor();

    t.playPause = (pp) => {
        const target = t.list[t.curIdx].audio;
        const isPaused = target.paused;

        if(pp === undefined) target[target.paused ? 'play' : 'pause']();
        else if(pp === 'play' || pp === 'pause') target[pp]();

        if(!target.paused) playing();
        else window.cancelAnimationFrame(t.raf);
    }
    t.stop = () => {
        const target = t.list[t.curIdx].audio;
        target.pause();
        target.currentTime = 0;
        window.cancelAnimationFrame(t.raf);
    }

    t.skip = (dir, sec) => {
        const target = t.list[t.curIdx].audio;
        target.currentTime += (sec * (dir === 'prev' ? -1 : dir === 'next' ? 1 : 0));

        exeFnc(obj.skip);
    }

    
    t.skipTrack = (dir) => {
        const target = t.list[t.curIdx].audio;
        const isPaused = target.paused;
        let tmpIdx = t.curIdx;
        tmpIdx += (dir === 'prev' ? -1 : dir === 'next' ? 1 : 0);

        if(tmpIdx < 0){
            tmpIdx = 0;
            alert('이전트랙이 없습니다.');
            return;
        }
        if(tmpIdx > t.list.length - 1){
            tmpIdx = t.list.length - 1;
            alert('다음트랙이 없습니다.');
            return;
        }

        t.list.forEach(audio => {
            audio.audio.pause();
            audio.audio.currentTime = 0;
        });

        t.curIdx = tmpIdx;

        if(!isPaused) t.playPause();

        exeFnc(obj.skipTrack);


    }

    function playing(){
        const target = t.list[t.curIdx].audio;
        exeFnc(obj.audioPlaying);

        t.raf = window.requestAnimationFrame(playing);
    }
}