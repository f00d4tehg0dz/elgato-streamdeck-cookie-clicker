if ($SD) {
    const actionName = "com.f00d4tehg0dz.cookieclicker.action";
    // Ensure score is initialized in localStorage
    if (localStorage.getItem("score") === null) {
        localStorage.setItem("score", "0");
    }

    $SD.on("connected", function(jsonObj) {
        requestChallenge();
    });

    $SD.on(actionName + ".willAppear", function(jsonObj) {
		let uuid = jsonObj.context;
		displayCurrentScore(uuid); // Correctly display the current score without updating.
	});

	function displayCurrentScore(uuid) {
		let currentTitleFn;
		let title = "Grandma"; // Default title
		const currentScore = localStorage.getItem("score") || "0";
		// Check if the score has reached the end condition
		if (currentScore >= 100000000) {
			// Set the title to "Quantum Baker" and stop increasing the score
			currentTitleFn({
				number: 'End',
				title: "Quantum Baker"
			});
			return; // Stop further execution
		}

		// Assuming 'progression' is accessible here
		for (let i = 0; i < progression.length; i++) {
			if (currentScore >= progression[i].minScore && currentScore <= progression[i].maxScore) {
				title = progression[i].title;
				break;
			}
		}

		// Prepare the data as expected by resultCallback
		const resultData = { number: currentScore.toString(), title: title };
		resultCallback(resultData, uuid, {}); // The last parameter is settings, adjust as needed.
	}

	// Global variable to track user actions
	let isUserAction = false;

	// When pressed, Cookie Clicker Activates!
	$SD.on(actionName + ".keyUp", function(jsonObj) {
        updateScoreAndTitle((result) => {
            resultCallback(result, jsonObj.context, jsonObj.payload.settings);
        });
    });

		
	$SD.on(actionName + ".sendToPlugin", function(jsonObj) {
		let uuid = jsonObj.context;
		let settings = jsonObj.payload;
	
		// Check if the reset button was pressed
		if (settings.resetKey === true) {
			// Reset the score
			localStorage.setItem("score", "0");
			localStorage.score = 0;
	
			// Update the leaderboard with the reset score
			setLeaderBoardScore({ ...settings, score: 0 }, uuid);
	
			// Update the display
			initiateStatus(uuid, { ...settings, score: 0 });
			resultCallback({ number: "0", title: "Grandma" }, uuid, settings);
			$SD.api.setSettings(uuid, { ...settings, score: 0 });
		} else {
			// Handle other settings updates
			if (settings.nameKey) {
				localStorage.setItem("nameKey", settings.nameKey);
				localStorage.nameKey = settings.nameKey;
			}
	
			// Update settings, leaderboard, and display
			$SD.api.setSettings(uuid, settings);
			setLeaderBoardScore(settings, uuid);
			initiateStatus(uuid, settings);
		}
	});

	// Utility function to handle AJAX requests
	function makeRequest({method, url, data, onSuccess, onError}) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					try {
						const response = JSON.parse(xhr.responseText);
						onSuccess(response);
					} catch (e) {
						console.error("Error parsing response:", e);
					}
				} else {
					onError(xhr.responseText);
				}
			}
		};
		xhr.send(JSON.stringify(data));
	}

	// requests a challenge from the server.	
	function requestChallenge() {
		makeRequest({
			method: 'GET',
			url: 'https://f00d.me/cookieapi/getChallenge',
			onSuccess: function(response) {
				handleChallenge(response.uuid, response.challenge);
			},
			onError: function(error) {
				console.error('Challenge request failed:', error);
			}
		});
	}

	// sends the challenge response back to the server and handles the JWT token
	function handleChallenge(uuid, challenge) {
		const response = CryptoJS.SHA256(challenge).toString(CryptoJS.enc.Hex);
		sendChallengeResponse(uuid, response);
	}

	// responds to the challenge
	function sendChallengeResponse(uuid, response) {
		makeRequest({
			method: 'POST',
			url: 'https://f00d.me/cookieapi/verifyChallenge',
			data: { uuid, response },
			onSuccess: function(response) {
				const jwtToken = response.accessToken; // Assuming the server responds with accessToken
				if (jwtToken) {
					localStorage.setItem('jwtToken', jwtToken);
				} else {
					console.error("Token not found in response:", response);
				}
			},
			onError: function(error) {
				console.error('Challenge response failed:', error);
			}
		});
	}

	// Function to check if the JWT token has expired
	function isTokenExpired() {
		const jwtToken = localStorage.getItem('jwtToken');
		if (jwtToken) {
			const payload = JSON.parse(atob(jwtToken.split('.')[1]));
			const currentTime = Math.floor(Date.now() / 1000);
			return currentTime > payload.exp;
		}
		return true; // Assume expired or not set
	}

	function withValidToken(action) {
		if (isTokenExpired()) {
			requestChallenge(action);
		} else {
			action();
		}
	}

	// Function to handle token expiration
	function handleTokenExpiration(callback) {
		if (isTokenExpired()) {
			requestChallenge(callback);
		} else {
			callback();
		}
	}

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
		// Retrieve the current score from localStorage or default to "0"
		const currentScore = localStorage.getItem("score") || "0";
		console.log(currentScore)
		// Set the title to the current score
		updateScoreAndTitle(result => resultCallback(result, context, settings));
		//$SD.api.setTitle(context, currentScore);
	}	

	function setNumberIncrease(context, settings) {
		if (isUserAction) { // Only update if this is a user action
			// Your existing logic to increase the score
			$SD.api.setTitle(context, "Updating");
			updateScoreAndTitle(result => resultCallback(result, context, settings));
		} else {
			// If not a user action, just display the current score
			const currentScore = localStorage.getItem("score") || "0";
			$SD.api.setTitle(context, currentScore);
		}
	}

	function setLeaderBoardScore(settings, uuid, retry = false) {
		handleTokenExpiration(function() {
			var jwtToken = localStorage.getItem('jwtToken');
		if (!jwtToken) {
			requestChallenge(); // Request a new token
			return; // Exit the function and wait for the new token
		}

		// Determine whether to use POST or PUT
		var method = retry ? "PUT" : (uuidExists(uuid) ? "PUT" : "POST");
		var url = `https://f00d.me/cookieapi/leaderboard/${method === "PUT" ? uuid : ''}`;

		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader('Authorization', `Bearer ${jwtToken}`);

		let data = JSON.stringify({
			"_id": uuid,
			"name": settings.nameKey,
			"score": localStorage.score
		});

		xhr.onload = function() {
			if (xhr.status >= 200 && xhr.status < 300) {
				// Success - Update stored UUIDs if it's a new entry
				if (method === "POST") {
					updateStoredUuids(uuid);
				}
				// console.log("Success:", xhr.responseText);
			} else if (xhr.status === 500) {
				// Check for duplicate key error
				const response = JSON.parse(xhr.responseText);
				if (response.message && response.message.includes("E11000 duplicate key error")) {
					// Switch to PUT and retry
					setLeaderBoardScore(settings, uuid, true); // Add a third parameter to indicate a retry
				} else {
					// console.error("Error:", xhr.responseText);
				}
			} else {
				//console.error("Error:", xhr.responseText);
			}
		};
		xhr.send(data);
	});
	}


	function uuidExists(uuid) {
		var storedUuids = JSON.parse(localStorage.getItem('storedUuids')) || [];
		return storedUuids.includes(uuid);
	}

	function updateStoredUuids(uuid) {
		var storedUuids = JSON.parse(localStorage.getItem('storedUuids')) || [];
		storedUuids.push(uuid);
		localStorage.setItem('storedUuids', JSON.stringify(storedUuids));
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
		{ title: "JScript Console", multiplier: 80, minScore: 245760, maxScore: 491519 },
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

	function resultCallback(result, context, settings) {
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
			ctx.lineJoin = 'miter';
    		ctx.miterLimit = 2;
			ctx.lineWidth = 20;

			numberText(ctx, result.number, canvas.width/2, 72, maxWidth, lineHeight, numberSize, 10, 30, 1, 0.2);

			// Draw title
			ctx.font = 'bold ' + titleSize + 'px Nunito';
			ctx.lineJoin = 'miter';
    		ctx.miterLimit = 2;
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
			$SD.api.setImage(context, block.getImageData());

			return;
		}
	}

		function updateScoreAndTitle (updateTitleFn) {

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