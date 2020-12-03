const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let score;
let scoreText;
let highscore;
let highscoreText;
let sailor;
let gravity;
let monsters = [];
let gameSpeed;
let roses;
let rosesText;
let keys = {};
var usagi = new Image();
usagi.src = './usagi.png';
var enemy = new Image();
enemy.src = './enemy.png';
var jumping = new Audio('Jump.mp3');
var gameover = new Audio('GameOver.mp3');
var theme = new Audio('SailorMoon.mp3');

document.addEventListener('keydown', function (evt)
{
    keys[evt.code] = true;
});

document.addEventListener('keyup', function (evt)
{
    keys[evt.code] = false;
});

class Sailor
{
    constructor(xPosition, yPosition, width, height, roses)  
    {
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.width = width;
        this.height = height;
        this.roses = roses;

        this.yDirection = 0; 
        this.jumpForce = 15;
        this.grounded = false;
        this.jumpTimer = 0;
    } 

    AnimateSailor()
    {
        if(keys['Space'])
        {
            this.JumpSailor();
            jumping.play();
            console.log('Sailor Jumped.');
        }
        else
        {
            this.jumpTimer = 0;
        }

        this.yPosition += this.yDirection;
        
        if(this.yPosition + this.height < canvas.height)
        {
            this.yDirection  += gravity;
            this.grounded = false;
        }
        else
        {
            this.yDirection = 0;
            this.grounded = true;
            this.yPosition = canvas.height - this.height; //check on this.
        }

        this.DrawSailor();
    }

    JumpSailor()
    {
        if(this.grounded && this.jumpTimer == 0)
        {
            this.jumpTimer = 1;
            this.yDirection = -this.jumpForce;
        }
        else if(this.jumpTimer > 0 && this.jumpTimer < 25) //25 max jump height
        {
            this.jumpTimer++;
            this.yDirection = -this.jumpForce - (this.jumpTimer / 50);
        }
    }

    DrawSailor()
    {
        ctx.beginPath();
        ctx.drawImage(usagi, 0, 0, 488, 325, this.xPosition, this.yPosition, this.width, this.height);
        ctx.closePath();
    }
}

class Monster
{
    constructor(xPosition, yPosition, width, height)
    {
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.width = width;
        this.height = height;

        this.xDirection = -gameSpeed;
    }

    UpdateMonster()
    {
        this.xPosition += this.xDirection;
        this.DrawMonster();
        this.xDirection =- gameSpeed;
    }

    DrawMonster()
    {
        ctx.beginPath();
        ctx.drawImage(enemy, 0, 0, 820, 1029, this.xPosition, this.yPosition, this.width, this.height);
        ctx.closePath();
    }
}

class Text
{
    constructor(text, xPosition, yPosition, alignment, color, size)
    {
        this.text = text;
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.alignment = alignment;
        this.color = color;
        this.size = size;
    }
    
    DrawText()
    {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.font = this.size+"px sans-serif";
        ctx.textAlign = this.alignment;
        ctx.fillText(this.text, this.xPosition, this.yPosition);
        ctx.closePath();
    }
}

function SpawnMonster()
{
    let size = RandomInt(80, 100);
    let monster = new Monster(canvas.width+size, canvas.height-size, size, size);
    
    monsters.push(monster);
}

SpawnMonster();

function RandomInt(min, max)
{
    return(Math.round(Math.random() *(max - min)+ min));
}

function EndGame()
{
    localStorage.clear();
    gameSpeed = 3;
    gravity = 1;
    roses = 3;
    score = 0;
    highscore = 0;
}


function StartGame()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.font = "20px sans-serif";

    gameSpeed = 3;
    gravity = 1;
    roses = 3;
    score = 0;
    highscore = 0;

    if(localStorage.getItem('highscore'))
    {
        highscore = localStorage.getItem('highscore');
    }

    sailor = new Sailor(25, 0, 175, 150, 3);

    scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
    highscoreText = new Text("Highscore: " + highscore, 600, 25, "right", "#212121", "20");
    rosesText = new Text("Roses: " + highscore, canvas.width - 50, 25, "right", "#212121", "20");

    requestAnimationFrame(UpdateSailor);
}

let initialSpawnTimer = 200;
let spawnTimer = initialSpawnTimer;

function UpdateSailor()
{
    theme.play();
    requestAnimationFrame(UpdateSailor);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--;
    if(spawnTimer <= 0)
    {
        SpawnMonster();
        console.log(monsters);
        spawnTimer = initialSpawnTimer-gameSpeed*8;

        if(spawnTimer < 60)
        {
            spawnTimer = 60;
        }
    }

    for(let i = 0; i < monsters.length; i++)
    {
        let m = monsters[i];

        if(m.xPosition + m.width < 0)
        {
            monsters.splice(i, 1);
        }
        //collision
        if(sailor.xPosition < m.xPosition + m.width && sailor.xPosition + sailor.width > m.xPosition && sailor.yPosition < m.yPosition + m.height && sailor.yPosition + sailor.height > m.yPosition)
        {
            theme.pause();
            gameover.play();

            roses = roses - 1;
                //if roses = 0, tuxedo mask will save you on the next enemy that hits you. after the next hit, the game ends.
                console.log("Roses:");
                console.log(roses);

                if(roses == 0)
                {
                    EndGame();
                    // StartGame();
                }

            monsters = [];
            score = 0;
            spawnTimer = initialSpawnTimer;
            gameSpeed = 3;
            window.localStorage.setItem('highscore', highscore);
        }
        m.UpdateMonster();
    }
    sailor.AnimateSailor();

    rosesText.text = "Roses: " + roses;
    rosesText.DrawText();

    score++;
    scoreText.text = "Score: " + score;
    scoreText.DrawText();

    if(score > highscore)
    {
        highscore = score;
        highscoreText.text = "Highscore: " + highscore;
    }
    highscoreText.DrawText();
    gameSpeed += 0.008;
}

StartGame();
