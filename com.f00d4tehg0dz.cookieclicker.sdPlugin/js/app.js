if ($SD) {
	const actionName = "com.f00d4tehg0dz.cookieclicker.action";
	var num = 0;
	if (localStorage.getItem("score") === null) {
		var scores = 0;
		localStorage.setItem("score", scores.toString());
		localStorage.score = 0
	  }
	  else {
		num = localStorage.score
	  }
	
	$SD.on("connected", function(jsonObj) {
		console.log("Connected!");

	});

	$SD.on(actionName + ".willAppear", function(jsonObj) {
		let settings = jsonObj.payload.settings;

		if (settings.automaticRefresh) {
			initiateStatus(jsonObj.context, jsonObj.payload.settings);
		}
		
	});

	$SD.on(actionName + ".sendToPlugin", function(jsonObj) {
		let uuid = jsonObj.context;
		let settings = jsonObj.payload;
		setLeaderBoardScore(settings, uuid);
		//$SD.api.setSettings(jsonObj.context, jsonObj.payload);
		//initiateStatus(jsonObj.context, jsonObj.payload);
	});

	// When pressed, Cookie Clicker Activates!
	$SD.on(actionName + ".keyUp", function(jsonObj) {
		initiateStatus(jsonObj.context, jsonObj.payload.settings);
		console.log();
	});

	

	function initiateStatus(context, settings) {

		// Initial call for the first time
		setTitleStatus(context, settings);

		// Start Canvas
		canvas = document.createElement('canvas');
		canvas.width = 144;
		canvas.height = 144;
		block = new Block(canvas);
		ctx = canvas.getContext('2d');
        img = document.getElementById("bg");
        ctx.drawImage(img, 0, 0);
		// Set the text font styles
		ctx.font = 'bold 20px Arial';
		ctx.fillStyle = "white";
		ctx.textAlign = 'left';
		
	}

	function setTitleStatus(context, settings) {
		$SD.api.setTitle(context, "Updating");
        getResults(result => resultCallback(result, context, settings));
	}
   
    function numbersBoard(result) {
        var resultString = result.number;
        ctx.font = 'bold 48px Arial';
		ctx.textAlign = 'left';
        ctx.fillStyle = "#deff00";
		return resultString
        // ctx.fill();
        // ctx.fillText(resultString , (canvas.width/2) - (textWidth / 2), 80);
    }

	function setLeaderBoardScore(settings,uuid) {
		// Set up our HTTP request
		var xhr = new XMLHttpRequest();

		// Setup our listener to process completed requests
		xhr.onload = function () {

			// Process our return data
			if (xhr.status >= 200 && xhr.status < 300) {
				// Runs when the request is successful
				xhr.open("PUT", `https://f00d.me/api/leaderboard/${uuid}`);

				xhr.setRequestHeader("Accept", "application/json");
				xhr.setRequestHeader("Content-Type", "application/json");

				xhr.onload = () => console.log(xhr.responseText);
				const name = settings.nameKey;
				let data = `{
					"_id": "${uuid}",
					"name": "${name}",
					"score": ${localStorage.score}
				}`;

				xhr.send(data);
				console.log(xhr.responseText);
			} else {
				// Runs when it's not
				xhr.open("POST", "https://f00d.me/api/leaderboard");
				
				xhr.setRequestHeader("Accept", "application/json");
				xhr.setRequestHeader("Content-Type", "application/json");
				const name = settings.nameKey;
				xhr.onload = () => console.log(xhr.responseText);
				let data = `{
					"_id": "${uuid}",
					"name": "${name}",
					"score": ${localStorage.score}
				}`;
			
				xhr.send(data);
				console.log(xhr.responseText);
			}

		};

		// Create and send a GET request
		// The first argument is the post type (GET, POST, PUT, DELETE, etc.)
		// The second argument is the endpoint URL
		xhr.open('GET', `https://f00d.me/api/leaderboard/${uuid}`);
		xhr.send();
	}

    function titleBoard(result) {
        var resultString = result.title;
        ctx.font = 'bold 30px Arial';
		ctx.textAlign = 'left';
        ctx.fillStyle = "#deff00";
		return resultString

        // ctx.fill();
        // ctx.fillText(resultString , (canvas.width/2) - (textWidth / 2), 120);
    }

	function resultCallback(result, context) {
		
		if (!result.hasOwnProperty("Object")) {

            // load bg-image
            canvas = document.createElement('canvas');
            canvas.width = 144;
            canvas.height = 144;
            block = new Block(canvas);
            ctx = canvas.getContext("2d");
            img = document.getElementById("bg");
            ctx.drawImage(img, 0, 0);
			ctx.lineWidth=1.3;

			textWidth = ctx.measureText(numbersBoard(result)).width;
			ctx.fillText(numbersBoard(result, context), (canvas.width/2) - (textWidth / 2), 80);
            ctx.strokeText(numbersBoard(result, context), (canvas.width/2) - (textWidth / 2), 80);

			textWidth = ctx.measureText(titleBoard(result)).width;
			ctx.fillText(titleBoard(result, context), (canvas.width/2) - (textWidth / 2), 120);
			ctx.strokeText(titleBoard(result, context), (canvas.width/2) - (textWidth / 2), 120);
            
            ctx.font = 'bold 30px Arial';
		    ctx.fillStyle = "#deff00";
		    ctx.textAlign = 'left';
		    ctx.textBaseline = 'middle';

            ctx.fill();
            textWidth = ctx.measureText("🍪").width;
            ctx.fillText("🍪", (canvas.width/2) - (textWidth / 2), 20);
	
            $SD.api.setTitle(context, '', null);
            $SD.api.setImage(
                context,
                block.getImageData()
            );

			return;
		}
	}

    function destroyCanvas() {
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

	function getResults(updateTitleFn) {
        
        // 1x
        if (localStorage.score >= 0) {
			var scores = (parseInt(localStorage.getItem("score"))+1);
			localStorage.setItem("score", scores.toString());
            updateTitleFn(JSON.parse(JSON.stringify({
                "number": localStorage.score,
                "title": "Grandma",
            })));  
		}

		// 2x
		if (localStorage.score >= 30) {
			var scores = (parseInt(localStorage.getItem("score"))+2);
			localStorage.setItem("score", scores.toString());
			updateTitleFn(JSON.parse(JSON.stringify({
                "number": localStorage.score,
                "title": "Baker",
            })));  
		}

		// 10x
		if (localStorage.score >= 500) {
			var scores = (parseInt(localStorage.getItem("score"))+10);
			localStorage.setItem("score", scores.toString());
			updateTitleFn(JSON.parse(JSON.stringify({
                "number": localStorage.score,
                "title": "Factory",
            })));  
		}

		// 30x
		if (localStorage.score >= 1000) {
			var scores = (parseInt(localStorage.getItem("score"))+50);
			localStorage.setItem("score", scores.toString());
			updateTitleFn(JSON.parse(JSON.stringify({
                "number": localStorage.score,
                "title": "Plant",
            })));  
		}

		// 1000x
		if (localStorage.score >= 100000) {
			var scores = (parseInt(localStorage.getItem("score"))+1000);
			localStorage.setItem("score", scores.toString());
            updateTitleFn(JSON.parse(JSON.stringify({
                "number": localStorage.score,
                "title": "S. Plant",
            })));      
		}
	
	}
}