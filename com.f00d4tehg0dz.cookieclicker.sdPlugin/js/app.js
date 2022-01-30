if ($SD) {
	const actionName = "com.f00d4tehg0dz.cookieclicker.action";
	var num = 0;
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
		$SD.api.setSettings(jsonObj.context, jsonObj.payload);
		initiateStatus(jsonObj.context, jsonObj.payload);
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
        var resultString = result.number,
        textWidth = ctx.measureText(resultString).width;
        ctx.font = 'bold 48px Arial';
		ctx.textAlign = 'left';
        ctx.fillStyle = "#deff00";
		return resultString
        // ctx.fill();
        // ctx.fillText(resultString , (canvas.width/2) - (textWidth / 2), 80);
    }

    function titleBoard(result) {
        var resultString = result.title,
        textWidth = ctx.measureText(resultString).width;
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

			textWidth = ctx.measureText(numbersBoard(result)).width;
			ctx.fillText(numbersBoard(result, context), (canvas.width/2) - (textWidth / 2), 80);
            
			textWidth = ctx.measureText(titleBoard(result)).width;
			ctx.fillText(titleBoard(result, context), (canvas.width/2) - (textWidth / 2), 120);
            
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
        if (num >= 0) {
			num += 1;
            updateTitleFn(JSON.parse(JSON.stringify({
                "number": num,
                "title": "Grandma",
            })));  
		}

		// 2x
		if (num >= 30) {
			num += 2;
			updateTitleFn(JSON.parse(JSON.stringify({
                "number": num,
                "title": "Baker",
            })));  
		}

		// 10x
		if (num >= 500) {
			num += 10;
			updateTitleFn(JSON.parse(JSON.stringify({
                "number": num,
                "title": "Factory",
            })));  
		}

		// 30x
		if (num >= 1000) {
			num += 30;
			updateTitleFn(JSON.parse(JSON.stringify({
                "number": num,
                "title": "Plant",
            })));  
		}

		// 1000x
		if (num >= 100000) {
			num += 1000;
            updateTitleFn(JSON.parse(JSON.stringify({
                "number": num,
                "title": "Super-Plant",
            })));      
		}       
	
	}
}