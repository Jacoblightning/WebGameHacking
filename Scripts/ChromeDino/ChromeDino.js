// For https://chromedino.com
// noinspection JSUnresolvedReference

// I couldn't beat their encapsulation so instead, I went the stupid route

// We need to inject out code into the page before theirs. :) Yay
{
    // Delete the whole page
    document.getRootNode().documentElement.remove()

    // Give an informative message
    {
        let ht = document.createElement("html");
        document.appendChild(ht);
        let elem = document.createElement("body");
        elem.innerHTML = "<h1>Please wait... We have to inject our script into the website</h1>"
        document.getRootNode().documentElement.appendChild(elem);
    }
    fetch("/")
        .then(r => r.text())
        .then(r => {
            // Here we have 2 options, we could go the MutationObserver route (https://stackoverflow.com/a/59424277)
            // Or we could just replace the text.
            // Here, I opted to go with the latter

            // Delete the main script loader.
            // Now we are responsible for loading the script
            let new_text = r.replace(
                /<script src="\/js\/game.js\?v=\d+?"><\/script>/,
                "");
            document.getRootNode().documentElement.remove();
            document.appendChild(document.createElement("html")).innerHTML = new_text;
            fetch("/js/game.js")
                .then(r => r.text())
                .then(r => {
                    // YAY. We now have source access to the JS before it is loaded and run
                    let newscript = r.replace(
                        // This is what we are going to pivot off of
                        "window['Runner'] = Runner;",
                        // Same code but including our hack
                        "window['Runner'] = Runner;\n" + getInjectCode()
                    )
                    let script = document.createElement("script");
                    script.type = "text/javascript";
                    script.innerHTML = newscript;
                    document.body.appendChild(script);

                    setup();
                    alert("Sorry if this broke dark mode for you.");
                })
        })
}

// If other mod frameworks want, they can overwrite this function to modify what gets exported.
function getInjectCode() {
    let injectcode = "";
    // Generally useful for a lot of other things. Also, other modding frameworks can work off of this.
    // All the exports will be prefixed with CDMOD
    injectcode += "window['CDMOD_closureAccessFunc'] = function(d){return eval(d);}\n"
    injectcode += "window['CDMOD_GOP']               = GameOverPanel;\n"
    injectcode += "window['CDMOD_TREX']              = Trex;\n"
    return injectcode;
}

// The actual setup for the mod
function setup() {
    // We back this up os we are going to overwrite it later
    let oldhandler_real = Runner.prototype.gameOver

    // We need this to check if the user has submitted a fraudulent score to enable guilt mode
    function oldhandler() {
        let locreload = location.reload;
        location.reload = function () {
        }

        //oldhandler_real();
        // Temp for testing. (Because I'm a good person :) (Ignore the fact that I accidentally got myself banned and have to use tor now)
        newhandler();
        user_name = "Anon"

        location.reload = locreload;

        enableGuilt();
    }


    // this is the same version as on the website but without the server/high-score code and with this replaced with Runner.instance_. Further explained in the README.
    let newhandler = function () {
        // This doesn't work for some reason
        // this.playSound(this.soundFx.HIT);
        CDMOD_closureAccessFunc("vibrate")(200);
        this.stop();
        this.crashed = true;
        this.distanceMeter.acheivement = false;
        var cscr = document.getElementById("currentScore");
        cscr.innerText = currentScore;
        var sb = document.getElementById("shareBlock");
        sb.style.display = 'none'; // block
        this.tRex.update(100, CDMOD_TREX.status.CRASHED);
        if (!this.gameOverPanel) {
            this.gameOverPanel = new CDMOD_GOP(this.canvas, this.spriteDef.TEXT_SPRITE, this.spriteDef.RESTART, this.dimensions)
        } else {
            this.gameOverPanel.draw()
        }
        if (this.distanceRan > this.highestScore) {
            this.highestScore = Math.ceil(this.distanceRan);
            this.distanceMeter.setHighScore(this.highestScore);
            currentScore = Math.round(this.highestScore * 0.025);
            cscr.innerText = currentScore;
        }
        this.time = getTimeStamp();
    }.bind(Runner.instance_)

    // To re-focus the canvas after performing an action. (Otherwise, space would re-trigger it)
    function afterAction() {
        Runner.instance_.canvas.focus()
    }

    // Here the buttons are created in reverse (right to left) order as each time we add a new button at the start

    let old_first_child = document.body.firstChild;

    // Enable/Disable server high-scores
    {
        let toggleHSbutton = document.createElement("button");

        function enableHS() {
            Runner.prototype.gameOver = oldhandler;
            Runner.instance_.gameOver = oldhandler;
            alert("You are enabling sending your high scores to the server. I don't recommend this but it's ultimately your choice. If you send a high score too high, you WILL be banned.\n\nLast thing: if you end up feeling guilty, a new delete my high scores/ban me button has been added.")
            // We just use closure vars here as it's simpler
            toggleHSbutton.onclick = disableHS;
            toggleHSbutton.innerHTML = "Disable HighScore Sync";
            afterAction();
        }

        function disableHS() {
            Runner.prototype.gameOver = newhandler;
            Runner.instance_.gameOver = newhandler;
            toggleHSbutton.onclick = enableHS
            toggleHSbutton.innerHTML = "Enable HighScore Sync (Not Recommended)";
            afterAction();
        }

        // Disable HS by default
        disableHS();

        document.body.insertBefore(toggleHSbutton, document.body.firstChild);
    }


    // Changing speed
    {
        let changespeedbutton = document.createElement("button");
        changespeedbutton.onclick = function () {
            Runner.instance_.setSpeed(prompt("Speed?"))
        };
        changespeedbutton.innerHTML = "Change Speed";
        document.body.insertBefore(changespeedbutton, document.body.firstChild);
        afterAction();
    }


    let guilt_button_on = false;


    function enableGuilt() {
        if (user_name !== "" && !guilt_button_on) {
            // The user has submitted a fradulent score

            // Only allow Runner.instance_ to be called once
            guilt_button_on = true;

            let guiltbutton = document.createElement("button");

            guiltbutton.onclick = function () {
                // Proceed with guilt trip
                let confirmation = confirm("Are you sure you want ot do Runner.instance_? Runner.instance_ will (possibly permanently) ban your IP. (Do the right thing " + user_name + ")")
                if (confirmation) {
                    const xhr = new XMLHttpRequest();
                    // Make it a big number just to be sure
                    xhr.open('GET', '/inc/set.php?name=' + user_name + '&score=' + 100000000, false);
                    xhr.send();
                    location.reload();
                } else {
                    alert("... Fine");
                }
            }

            guiltbutton.innerHTML = "Delete my High Scores / Ban Me";

            document.body.insertBefore(guiltbutton, old_first_child);
        }
    }
}