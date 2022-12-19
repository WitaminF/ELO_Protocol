/**
 * Utilité:
 *   Lance un workflow, définit depuis un champ.
 *
 * Configuration:
 *   "StartWorkflow": {
 *       "field": "WORKFLOW"
 *   }
 */

/**
 * Description in English
 * This util starts the Workflow with name inputed in special field
 * To define the input field name use "field" in .config
 */

//@include lib_Class
//@include lib_sol.common.WfUtils
//@include lib_proto.pack.jc.PackFunction

sol.define("StartWorkflow", {
    extend: "proto.pack.jc.PackFunction",

    // Class initialize event
    initialize(config) {
        if (!config.field){
            throw "StartWorkflow error: missing `field` config!"
		}
        this.field = config.field
		
		// Read debug config
		this.debug = shouldWriteLogsGlobal // Take global value
		
		// The local config is more powerful than global
		if(config.shouldWriteLogs == false){
			this.debug = false
		}
		
		if(config.shouldWriteLogs == true){ 
			this.debug = true
		}
		
		 log.info("StartWorkflow.Debug: " + this.debug)
    },
	
	onInit(indexDialogAdapter){
		printDebugLog("StartWorkflow.onInit",this.debug)
	// Check for correct input field
		try{
			var value = indexDialogAdapter.getObjKeyValue(this.field)
		}
		catch(e){
			// Creates warning 
			printDebugLog("StartWorkflow.onInit: " + e,this.debug)
			showDebugBox("StartWorkflow", "Warning: Next input field doesn't exist: " + this.field,this.debug);
		}
	},

    // Event called on indexDialog finish
    onFinish(indexDialogAdapter, id) {
		printDebugLog("StartWorkflow.onFinish",this.debug)
        this.startWorkflow(indexDialogAdapter, id)
    },

    // This function starts the workflow
    startWorkflow(indexDialogAdapter, id) {
		printDebugLog("StartWorkflow.startWorkflow",this.debug)
        try {
            var fieldText = String(indexDialogAdapter.getObjKeyValue(this.field)) // Read workflow name from input field
                if (fieldText != "") { // Check if name isn't empty
                    sol.common.WfUtils.startWorkflow(fieldText, fieldText + ": " + indexDialogAdapter.getName(), id) // Starts workflow
                    indexDialogAdapter.setObjKeyValue(this.field, "")
                }
        } catch (e) {
            printDebugLog("StartWorkflow.startWorkflow: " + this.field + "doesn't exist",this.debug)
        }
    }
})
