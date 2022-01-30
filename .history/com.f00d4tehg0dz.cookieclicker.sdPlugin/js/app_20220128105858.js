let intervals = {};
    if ($SD) {
        const actionName = "com.f00d4tehg0dz.dogecoin.action";

        $SD.on("connected", function (jsonObj) {
            console.log("Connected!");
      
        });
        
        $SD.on(actionName + ".willAppear", function (jsonObj) {
            let settings = jsonObj.payload.settings;
            if(settings.automaticRefresh){
                initiateStatus(jsonObj.context, jsonObj.payload.settings);
            }  
        });

        $SD.on(actionName + ".sendToPlugin", function (jsonObj) {
            $SD.api.setSettings(jsonObj.context, jsonObj.payload);
            initiateStatus(jsonObj.context, jsonObj.payload);
        });

        // When pressed, DogeCoin status gets updated!
        $SD.on(actionName + ".keyUp", function (jsonObj) {
          
            initiateStatus(jsonObj.context, jsonObj.payload.settings);
            console.log();
        });
    
        function initiateStatus(context, settings) {
            if (intervals[context]) {
                let interval = intervals[context];
                clearInterval(interval);
            }

            // Initial call for the first time
            setTitleStatus(context, settings);

            // Start Canvas
            canvas = document.createElement('canvas');  
            canvas.width = 144;
            canvas.height = 144;
            block = new Block(canvas);
            ctx = canvas.getContext('2d');

            // Set the text font styles
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = "white";
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

             // Schedule for every 1 hours.
            intervals[context] = setInterval(() => {
                    let clonedSettings = {};
                    // Just making sure we are not hurt by closure.
                    Object.assign(clonedSettings, settings);
                    setTitleStatus(context, clonedSettings);
                },
                moment.duration(1, 'hours').asMilliseconds());
        }

        function setTitleStatus(context, settings) {
            $SD.api.setTitle(context, "Updating");
            getResults(result => resultCallback(result, context));
                
        }

        function resultCallback(result, context) {
        // Testing with String to see if everything outputted ok
            if (!result.hasOwnProperty("Object")) {

                // Clean up String
                const json = JSON.stringify(result, null, 1);

                // load bg-image
                ctx = canvas.getContext("2d");
                img = document.getElementById("bg");
                ctx.drawImage(img, 0, 0);
                
                // Add to String and Split Lines

                splitlines = ("USD:" + ' ' + result.usd + '\n' + "CAP:" + ' ' + result.usd_market_cap + '\n' + "24:" + ' ' + result.usd_24h_change + '\n' + '')
                // Split Lines
                var lines = splitlines.split('\n');
 
                var arr = [lines.shift(),lines.shift(), lines.shift(),lines.join(' ')];
                const usd = arr[0];
                const market = arr[1];
                const twentyfourhour = arr[2];

                ctx.fillStyle = "#FFFFF"; //green
                ctx.fillText(usd, 5, 35);
                ctx.fillText(market, 5, 70);
                ctx.fillText(twentyfourhour, 5, 105);
                // Null the Title so Nothing Shows
                $SD.api.setTitle(context, '', null);
                $SD.api.setImage(
                    context,
                    block.getImageData()
                );
                return;
            }
        }
        function getResults(updateTitleFn) {
            let endPoint = "https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true";
            $.getJSON(endPoint)
                .done(function (response) {
                    //updateTitleFn(response['dogecoin'].usd)
                    updateTitleFn(
                       response['dogecoin']
                    );                   
                })
                .fail(function (jqxhr, textStatus, error) {
                    if (jqxhr.status === 503) {
                        updateTitleFn("Exceeded...!")
                    } else {
                        updateTitleFn(error);
                    }
                });
        }
    }