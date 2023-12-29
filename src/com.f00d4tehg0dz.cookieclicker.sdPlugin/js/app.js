if ($SD) {
	const actionName = "com.f00d4tehg0dz.cookieclicker.action";
	if (localStorage.getItem("score") === null) {
		var scores = 0;
		localStorage.setItem("score", scores.toString());
		localStorage.score = 0
	  }
	  else {
		// localStorage.score = 0
	  }

	$SD.on("connected", function(jsonObj) {
	});

	$SD.on(actionName + ".willAppear", function(jsonObj) {
		let uuid = jsonObj.context;
		let settings = jsonObj.payload;
		// setLeaderBoardScore(settings, uuid);
		setTitleStatus(uuid, settings)
		if (settings.nameKey)  {
			initiateStatus(jsonObj.context, jsonObj.payload.settings);
		}
	});


	$SD.on(actionName + ".sendToPlugin", function(jsonObj) {
		let uuid = jsonObj.context;
		let settings = jsonObj.payload;

		if (!settings.saveBtn == true)  {
			if (localStorage.getItem("nameKey") === null) {	
				localStorage.setItem("nameKey", jsonObj.payload.nameKey.toString());
				localStorage.nameKey = jsonObj.payload.nameKey
			  }
			  else {
				//localStorage.setItem("nameKey", jsonObj.payload.nameKey.toString());
			  }
			$SD.api.setSettings(jsonObj.context, jsonObj.payload);
			setLeaderBoardScore(settings, uuid);
			initiateStatus(jsonObj.context, jsonObj.payload);
		}
		else {
			if (localStorage.getItem("nameKey") === null) {	
				localStorage.setItem("nameKey", jsonObj.payload.nameKey.toString());
				localStorage.nameKey = jsonObj.payload.nameKey
			  }
			  else {
				//localStorage.setItem("nameKey", jsonObj.payload.nameKey.toString());
			  }
			initiateStatus(jsonObj.context, jsonObj.payload.settings);
			$SD.api.setSettings(jsonObj.context, jsonObj.payload);
		}

	});


	// When pressed, Cookie Clicker Activates!
	$SD.on(actionName + ".keyUp", function(jsonObj) {
		setNumberIncrease(jsonObj.context, jsonObj.payload.settings)
	});


// Declare the canvas variable at the top of your script
var canvas;

function initiateStatus(context, settings) {
    // Check if the canvas is already initialized
    if (!canvas) {
        // If not, create the canvas element
        canvas = document.createElement('canvas');
        canvas.width = 144;
        canvas.height = 144;
        block = new Block(canvas);
    }

    // The rest of your code remains unchanged
    ctx = canvas.getContext('2d');
    img = document.getElementById("bg");
    ctx.drawImage(img, 0, 0);
    ctx.font = 'bold 20px Nunito';
    ctx.fillStyle = "white";
    ctx.textAlign = 'left';
}

	function setTitleStatus(context, settings) {
		$SD.api.setTitle(context, "Updating");
        updateScoreAndTitle(result => resultCallback(result, context, settings));
	}

	function setNumberIncrease(context, settings) {
		$SD.api.setTitle(context, "Updating");
        updateScoreAndTitle (result => resultCallback(result, context, settings));
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
				xhr.setRequestHeader('x-access-token', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJmdWNrIiwiaWF0IjoxNjYyMzM5NTE4fQ.x-CrvDNdUYu4Okgb1xt1ONg7DHIx9swkrlnUeD2QAoc");


				const name = settings.nameKey;
				let data = `{
					"_id": "${uuid}",
					"name": "${name}",
					"score": ${localStorage.score}
				}`;

				xhr.send(data);

			} else {
				// Runs when it's not
				xhr.open("POST", "https://f00d.me/api/leaderboard/");

				xhr.setRequestHeader("Accept", "application/json");
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.setRequestHeader('x-access-token', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJmdWNrIiwiaWF0IjoxNjYyMzM5NTE4fQ.x-CrvDNdUYu4Okgb1xt1ONg7DHIx9swkrlnUeD2QAoc");


				const name = settings.nameKey;
				xhr.onload = () => console.log(xhr.responseText);
				let data = `{
					"_id": "${uuid}",
					"name": "${name}",
					"score": ${localStorage.score}
				}`;

				xhr.send(data);

			}

		};

		// Create and send a GET request
		// The first argument is the post type (GET, POST, PUT, DELETE, etc.)
		// The second argument is the endpoint URL
		xhr.open('GET', `https://f00d.me/api/leaderboard/${uuid}`);

		xhr.send();
	}

	function numberText(context, text, x, y, maxWidth, lineHeight, initialFontSize, resizeAmount, minFontSize, lineWidthReduction, opacityReduction) {
		text = text.toString(); // Ensure text is a string
		var fontSize = initialFontSize;
		var opacityValue = 0.7; // Initial opacity
		var didShrink = false;

		do {
			context.font = 'bold ' + fontSize + 'px Nunito'; // Set font size
			var words = text.split(' ');
			var line = '';
			var needShrink = false;

			if (context.measureText(text).width > maxWidth && !didShrink && fontSize > minFontSize) {
				fontSize -= resizeAmount; // Reduce font size
				ctx.lineWidth -= lineWidthReduction;
				opacityValue -= opacityReduction; // Reduce opacity
				opacityValue = Math.max(opacityValue, 0); // Ensure opacity is not less than 0
				didShrink = true;
				continue; // Recheck with new font size
			}

			for (var n = 0; n < words.length; n++) {
				var testLine = line + words[n] + ' ';
				var metrics = context.measureText(testLine);
				var testWidth = metrics.width;

				if (testWidth > maxWidth && n > 0 && fontSize > minFontSize) {
					needShrink = true;
					break;
				} else {
					line = testLine;
				}
			}

			if (needShrink && !didShrink) {
				fontSize -= resizeAmount; // Reduce font size
				ctx.lineWidth -= lineWidthReduction;
				opacityValue -= opacityReduction; // Reduce opacity
				opacityValue = Math.max(opacityValue, 0); // Ensure opacity is not less than 0
				didShrink = true;
			}

			// Set stroke style outside the shrinking condition
			context.strokeStyle = `rgba(0, 16, 21, ${opacityValue})`; // Update stroke style

			context.strokeText(line, x, y); // Draw stroke first
			context.fillText(line, x, y);   // Then fill
			y += lineHeight;
			break;
		} while (true);
	}

	function wrapText(context, text, x, y, maxWidth, lineHeight, initialFontSize, resizeAmount, minFontSize, lineWidthReduction, opacityReduction) {
		text = text.toString(); // Ensure text is a string
		var fontSize = initialFontSize;
		var opacityValue = 0.7; // Initial opacity
		context.font = 'bold ' + fontSize + 'px Nunito'; // Set initial font size

		var lines = [];
		var words = text.split(' ');
		var currentLine = words[0];

		for (var i = 1; i < words.length; i++) {
			var word = words[i];
			var width = context.measureText(currentLine + " " + word).width;
			if (width < maxWidth) {
				currentLine += " " + word;
				fontSize -= resizeAmount; // Reduce font size
				opacityValue -= opacityReduction;
				opacityValue = Math.max(opacityValue, 0); // Ensure opacity is not less than 0
				context.lineWidth -= lineWidthReduction;
				context.font = 'bold ' + fontSize + 'px Nunito'; // Set initial font size
			} else {
				lines.push(currentLine);
				currentLine = word;
				fontSize -= resizeAmount; // Reduce font size
				opacityValue -= opacityReduction;
				opacityValue = Math.max(opacityValue, 0); // Ensure opacity is not less than 0
				context.lineWidth -= lineWidthReduction;
				context.font = 'bold ' + fontSize + 'px Nunito'; // Set initial font size

			}
		}
		lines.push(currentLine); // Push the last line

		// Check if resizing is needed
		if (lines.length * lineHeight > canvas.height && fontSize > minFontSize) {
			fontSize -= resizeAmount;
			context.font = 'bold ' + fontSize + 'px Nunito'; // Update font size
			opacityValue -= opacityReduction;
			opacityValue = Math.max(opacityValue, 0); // Ensure opacity is not less than 0
			context.lineWidth -= lineWidthReduction;
			return wrapText(context, text, x, y, maxWidth, lineHeight, fontSize, resizeAmount, minFontSize, lineWidthReduction, opacityReduction); // Recursively call function with updated font size
		}

		// Draw the text
		for (var line of lines) {
			context.strokeStyle = `rgba(0, 16, 21, ${opacityValue})`;
			context.strokeText(line, x, y);
			context.fillText(line, x, y);
			y += lineHeight;
		}
	}
	function numbersBoard(result) {
		var resultString = result.number;
		return resultString;
	}

	function resultCallback(result, context) {
		if (!result.hasOwnProperty("Object")) {
			canvas = document.createElement('canvas');
			canvas.width = 144;
			canvas.height = 144;
			block = new Block(canvas);
			ctx = canvas.getContext("2d");

			// Set background color
			ctx.fillStyle = "#cfae72";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw the cookie image
			img = document.getElementById("bg");
			ctx.drawImage(img, 0, 0);

			var maxWidth = 144;
			var lineHeight = 30;
			var numberSize = 45;
			var titleSize = 25;

			// Draw numbers
			ctx.font = 'bold ' + numberSize + 'px Nunito';
			ctx.textAlign = 'center';
			ctx.fillStyle = "#ffcf00";
			ctx.strokeStyle = "rgba(0, 16, 21, opacityValue)";
			ctx.lineWidth = 20;

			numberText(ctx, result.number, canvas.width/2, 72, maxWidth, lineHeight, numberSize, 10, 30, 1, 0.2);

			// Draw title
			ctx.font = 'bold ' + titleSize + 'px Nunito';
			ctx.lineWidth = 12;

			// Draw title with different resizing parameters
			wrapText(ctx, result.title.toUpperCase(), canvas.width/2, 105, maxWidth, lineHeight, titleSize, 3.0, 25, 0.1, 0.09);


			// ==== Unused ====
            // ctx.font = 'normal 30px Nunito';
		    // ctx.fillStyle = "#ffcf00";
		    // ctx.textAlign = 'left';
			// ctx.strokeStyle = "#00101f"; // Blue stroke color
			// ctx.lineWidth = 0.75; // Thin stroke
		    //ctx.textBaseline = 'middle';

            //ctx.fill();
            // textWidth = ctx.measureText("🍪").width;
            //ctx.fillText("🍪", (canvas.width/2) - (textWidth / 2), 35);

            $SD.api.setTitle(context, '', null);
            $SD.api.setImage(
                context,
                block.getImageData()
            );

			return;
		}
	}

	function updateScoreAndTitle (updateTitleFn) {
		// Define the progression
		const progression = [
			{ title: "Grandma", multiplier: 1, minScore: 0, maxScore: 29 },
			{ title: "Baker", multiplier: 2, minScore: 30, maxScore: 59 },
			{ title: "Factory", multiplier: 5, minScore: 60, maxScore: 119 },
			{ title: "Plant", multiplier: 10, minScore: 120, maxScore: 239 },
			{ title: "S. Plant", multiplier: 15, minScore: 240, maxScore: 479 },
			{ title: "Mine", multiplier: 20, minScore: 480, maxScore: 959 },
			{ title: "Shipment", multiplier: 25, minScore: 960, maxScore: 1919 },
			{ title: "Alchemy Lab", multiplier: 30, minScore: 1920, maxScore: 3839 },
			{ title: "Portal", multiplier: 35, minScore: 3840, maxScore: 7679 },
			{ title: "Time Machine", multiplier: 40, minScore: 7680, maxScore: 15359 },
			{ title: "A-Condenser", multiplier: 50, minScore: 15360, maxScore: 30719 },
			{ title: "Prism", multiplier: 60, minScore: 30720, maxScore: 61439 },
			{ title: "Chancemaker", multiplier: 70, minScore: 61440, maxScore: 122879 },
			{ title: "Fractal Engine", multiplier: 75, minScore: 122880, maxScore: 245759 },
			{ title: "Jscript Console", multiplier: 80, minScore: 245760, maxScore: 491519 },
			{ title: "Idleverse", multiplier: 90, minScore: 491520, maxScore: 983039 },
			{ title: "Wizard Tower", multiplier: 95, minScore: 983040, maxScore: 1966079 },
			{ title: "Temple", multiplier: 100, minScore: 1966080, maxScore: 3932159 },
			{ title: "Bank", multiplier: 110, minScore: 3932160, maxScore: 7864319 },
			{ title: "C. Click God", multiplier: 120, minScore: 7864320, maxScore: 15728639 },
			{ title: "Galactic Bakery", multiplier: 130, minScore: 15728640, maxScore: 31457279 },
			{ title: "Black Hole", multiplier: 140, minScore: 31457280, maxScore: 62914559 },
			{ title: "Universe Brain", multiplier: 150, minScore: 62914560, maxScore: 72914559 },
			{ title: "C. Elemental", multiplier: 200, minScore: 72914559, maxScore: 85914559 },
			{ title: "Quantum Baker", multiplier: 220, minScore: 85914559, maxScore: 100000000 }
		];

	  // Get the current score
	  let currentScore = parseInt(localStorage.getItem("score")) || 0;

	  // Check if the score has reached the end condition
	  if (currentScore >= 100000000) {
		  // Set the title to "Quantum Baker" and stop increasing the score
		  updateTitleFn({
			  number: 'End',
			  title: "Quantum Baker"
		  });
		  return; // Stop further execution
	  }

	  // Find the appropriate title and multiplier based on the current score
	  for (let i = 0; i < progression.length; i++) {
		  if (currentScore >= progression[i].minScore && currentScore <= progression[i].maxScore) {
			  // Update the score
			  currentScore += progression[i].multiplier;
			  localStorage.setItem("score", currentScore.toString());

			  // Update the title
			  updateTitleFn({
				  number: currentScore,
				  title: progression[i].title
			  });
			  break;
		  }
	  }
   }
}