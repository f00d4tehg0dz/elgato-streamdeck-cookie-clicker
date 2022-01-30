let intervals = {};
    if ($SD) {
        const actionName = "com.f00d4tehg0dz.cookieclicker.action";

        $SD.on("connected", function (jsonObj) {
            console.log("Connected!");
      
        });
        
        $SD.on(actionName + ".willAppear", function (jsonObj) {
            let settings = jsonObj.payload.settings;
            if(settings.updateClick){
                initiateStatus(jsonObj.context, jsonObj.payload.settings);
            }  
        });

        $SD.on(actionName + ".sendToPlugin", function (jsonObj) {
            $SD.api.setSettings(jsonObj.context, jsonObj.payload);
            initiateStatus(jsonObj.context, jsonObj.payload);
        });

        // When pressed, CookeClicker status gets updated!
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

           
            
        }

        function setTitleStatus(context, settings) {
            $SD.api.setTitle(context, "Updating");
                
        } 
    }