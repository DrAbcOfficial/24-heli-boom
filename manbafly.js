let g_iGameDifficty = 0;

class CMissile extends Phaser.Physics.Arcade.Image {
    m_pFlare;
    constructor(scene, x, y, texture, particle) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.m_pFlare = particle;
        this.m_pFlare.startFollow(this);
    }
    destroy()
    {
        this.m_pFlare.destroy();
        super.destroy();
    }
}

class LaodaFly extends Phaser.Scene
{
    m_iFreeBird = 250;
    m_iMissileInterv = 1000;
    m_iAngleY = 100;
    m_iScore = 0;

    m_iLastPointerX = 0;
    m_iLastPointerY = 0;
    m_flLastManSound = 0.0;

    m_pScore;
    m_pLaoda;
    m_pHelicopter;
    m_pSky;
    m_p10KHint;
    m_p100KHint;

    m_aryMissiles = [];

    m_pFreeBird;
    m_pManbaout;
    m_pMan;
    m_pWhatCanISay;
    m_pLaugh;

    m_pMissileTimer;

    m_bPause = false;
    preload ()
    {
        this.load.image('sky', './img/sky.jpg');
        this.load.image("laoda", "./img/laoda.png");
        this.load.image("missile", "./img/missile.png");
        this.load.image("flare", "./img/flare.gif");
        this.load.audio('freebird', './audio/freebird_loop.mp3');
        this.load.audio('manbaout', './audio/manbaout.mp3');
        this.load.audio('man', './audio/man.mp3');
        this.load.audio('whatcanisay', './audio/whatcanisay.mp3');
        this.load.audio('laugh', './audio/laugh.mp3');
    }
    create ()
    {
        this.m_pSky = this.add.tileSprite(0, 0, window.innerWidth, window.innerHeight, 'sky');
        this.m_pSky.setOrigin(0, 0);
        
        this.m_pScore = this.add.text(10, 10, '000000000000', { fontSize: '72px', fill: '#fff' });
        this.m_p10KHint = this.add.text(10, 10, '一万分！', { fontSize: '64px', fill: '#fff' });
        this.m_p10KHint.setAlpha(0);
        this.m_p100KHint = this.add.text(10, 10, '十万分！', { fontSize: '64px', fill: '#fff' });
        this.m_p100KHint.setAlpha(0);

        this.m_pLaoda = this.physics.add.image(window.innerWidth/2, window.innerHeight/2,"laoda")
        this.m_pLaoda.setScale(0.1,0.1);
        this.m_pHelicopter = this.add.text(0, 0, '🚁', { fontSize: '96px', fill: '#fff' });
        this.m_pHelicopter.setScale(-1, 1);

        this.m_pLaoda.setDepth(2);
        this.m_pHelicopter.setDepth(1);

        this.m_pLaoda.body.immovable = true;

        this.m_pFreeBird = this.sound.add('freebird');
        this.m_pFreeBird.setVolume(0);
        this.m_pFreeBird.play({ loop: true });
        this.m_pManbaout = this.sound.add("manbaout");
        this.m_pMan = this.sound.add("man");
        this.m_pMan.setVolume(0.3);
        this.m_pWhatCanISay = this.sound.add("whatcanisay");
        this.m_pWhatCanISay.setVolume(0.8);
        this.m_pLaugh = this.sound.add("laugh");
        this.m_pLaugh.setVolume(0.8);

        this.m_pMissileTimer = this.time.addEvent({
            delay: this.m_iMissileInterv / (g_iGameDifficty + 1) / 2,
            callback: this.createRandomMissile,
            callbackScope: this,
            loop: true
        });
        this.time.addEvent({
            delay: 10,
            callback: this.updateCurposition,
            callbackScope: this,
            loop: true
        });

        let object = this;
        this.input.on('pointermove', function (pointer) {
            if(object.m_bPause)
                return;
            object.m_pHelicopter.x = pointer.x + 48;
            object.m_pHelicopter.y = pointer.y - 48;
            object.m_pLaoda.x = object.m_pHelicopter.x - 40;
            object.m_pLaoda.y = object.m_pHelicopter.y + 40;

            let deltaY = pointer.y - object.m_iLastPointerY;
            
            let rotationSpeed = Math.min(1.0, deltaY / object.m_iAngleY);
            object.m_pHelicopter.setAngle(rotationSpeed * 90);
        });

        this.physics.world.on('worldbounds', function(body) {
            if (body.gameObject instanceof CMissile) {
                body.gameObject.destroy();
                let index = object.m_aryMissiles.indexOf(body.gameObject);
                if (index > -1) {
                    object.m_aryMissiles.splice(index, 1);
                }
            }
        });
    }
    update () 
    {
        if(this.m_bPause)
            return;
        this.m_pSky.tilePositionX += 2 * (1 + g_iGameDifficty);

        let pointer = this.input.activePointer;
        let maxDis = this.m_iFreeBird;
        let nereast = maxDis;
        for(let i = 0; i < this.m_aryMissiles.length; i++){
            let disX = this.m_aryMissiles[i].x - pointer.x;
            let disY = this.m_aryMissiles[i].y - pointer.y;
            let d = Math.sqrt(Math.pow(disX, 2) + Math.pow(disY, 2));
            if(d < nereast)
                nereast = d;
        }
        if(nereast < maxDis){
            let ratio = (maxDis - nereast) / maxDis;
            this.m_pFreeBird.setVolume(ratio);
        }
        if(nereast <= 128){
            let time = this.time.now;
            if(time > this.m_flLastManSound){
                this.m_pMan.play({ loop: false });
                this.m_flLastManSound = time + 1.0;
            }
        }
        this.m_iScore++;
        this.m_pScore.setText(this.m_iScore.toString().padStart(12, '0'));
        if(this.m_iScore % 10000 == 0)
        {
            this.m_pWhatCanISay.play();
            this.m_p10KHint.setAlpha(1);
            this.m_p10KHint.x = this.m_pHelicopter.x;
            this.m_p10KHint.y = this.m_pHelicopter.y;
            this.tweens.add({
                targets: this.m_p10KHint,
                alpha: 0,
                duration: 2000,
                ease: 'Linear'
            });
        }
        if(this.m_iScore % 100000 == 0)
            {
                this.m_pLaugh.play();
                this.m_p100KHint.setAlpha(1);
                this.m_p100KHint.x = this.m_pHelicopter.x;
                this.m_p100KHint.y = this.m_pHelicopter.y;
                this.tweens.add({
                    targets: this.m_p100KHint,
                    alpha: 0,
                    duration: 2000,
                    ease: 'Linear'
                });
            }
            
    }
    createMissile(x, y, vx, vy)
    {
        let missile = new CMissile(this, x, y, "missile", this.add.particles(0, 0, 'flare', {
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        }));
        missile.setScale(0.5,0.5);
        missile.x = window.innerWidth - missile.getBounds().width;
        missile.body.setSize(48, 48);
        missile.body.setOffset(96, 0);
        missile.setCollideWorldBounds(true);
        let randomflag = Math.floor(Math.random() * 10) % 2;
        if(g_iGameDifficty > 0 && randomflag == 0){
            missile.setVelocity(vx, vy);
            let rotate = Math.atan2(vy, vx) * (180 / Math.PI) + 180;
            missile.setAngle(rotate);
        }
        else{
            missile.setVelocity(vx, 0);
        }
        missile.body.onWorldBounds = true;
        let object = this;
        this.physics.add.collider(missile, this.m_pLaoda, function(missile, laoda) {
            if (missile instanceof CMissile) {
                object.m_pManbaout.play();
                missile.setVelocity(0,0);
                object.m_aryMissiles.forEach((m)=>{
                    m.body.checkCollision.none = true;
                });
                object.m_pMissileTimer.remove();
                object.m_bPause = true;
                let laoda = object.physics.add.image(object.m_pLaoda.x, object.m_pLaoda.y, 'laoda');
                laoda.setVelocity(100, 200);
                laoda.setBounce(1, 1);
                laoda.setCollideWorldBounds(true);
                laoda.setScale(0.25,0.25);
                laoda.setAngularDrag(0.5);
                object.m_pLaoda.destroy();
                EndGame(object.m_iScore, object.time.now);
            }
        });
        this.m_aryMissiles.push(missile);
    }
    createRandomMissile()
    {
        let startY = Math.random() * window.innerHeight;
        let speedmax = 1000 * (g_iGameDifficty + 1);
        let speedmin = 200 * (g_iGameDifficty + 1);
        let speedy = 500 * (g_iGameDifficty + 1);
        let vx = -speedmax * Math.random() + -speedmin;
        let vy = Math.random() * (speedy - -speedy + 1) + -speedy;
        this.createMissile(0, startY, vx, vy);

        if(g_iGameDifficty >= 2)
        {
            startY = Math.random() * window.innerHeight;
            vx = this.m_pHelicopter.x - 0; // 修正vx的计算
            vy = this.m_pHelicopter.y - startY; // 修正vy的计算
            let mod = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
            vx = vx / mod * speedmin;
            vy = vy / mod * speedmin;
            this.createMissile(0, startY, -vx, vy);
        }
        
    }
    updateCurposition()
    {
        let pointer = this.input.activePointer;
        this.m_iLastPointerX = pointer.x;
        this.m_iLastPointerY = pointer.y;
    }
}

const config = {
    type: Phaser.AUTO,
    scene: LaodaFly,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

function StartGame(){
    let option = document.getElementById('option_md');
    if (option.checked){
        g_iGameDifficty = 1;
    }
    else{
        option = document.getElementById('option_hd');
        if (option.checked){
            g_iGameDifficty = 2;
        }
    }

    let music = document.getElementById("musicda");
        music.volume = 0.3;
        music.play();

    const game = new Phaser.Game(config);

    window.addEventListener('resize', () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
    });
}
function EndGame(score, milliseconds){
    let element = document.getElementById('endPage.score');
    element.textContent = element.textContent.replace("{SCORE}", score);
    let hours = Math.floor(milliseconds / (1000 * 60 * 60));
    let minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    let intervalString = `${hours}小时 ${minutes}分钟 ${seconds}秒`;
    element = document.getElementById('endPage.time');
    element.textContent = element.textContent.replace("{TIME}", intervalString);
    element = document.getElementById('endPage.difficulty');
    let difficulty = "简单";
    switch(g_iGameDifficty){
        case 2: difficulty = "困难";break;
        case 1: difficulty = "中等";break;
        case 0:
        default: difficulty = "简单";break;
    }
    element.textContent = element.textContent.replace("{DIFFICULTY}", difficulty);
    element = document.getElementById('endPage');
    element.style.visibility = 'visible';
}
start.addEventListener('click',()=>{
    StartGame();
    let start = document.getElementById("startPage");
    start.remove();
});
refresh.addEventListener('click',()=>{
    location.reload();
});