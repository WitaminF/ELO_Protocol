/**
 * Utilité :
 *   Sépare le contenu d'un champ dans plusieurs champs.
 * 
 * Configuration:
 *   "Split": {
 *       "pairs": [
 *           ["TYPE_CORRESP", "ID_CORRESP"],
 *           ["TYPE_SUJET", "ID_SUJET"]
 *       ]
 *   }
 * 
 * Configuration optionnelle:
 *   "Split": {
 *       "split": ":",
 *       "pairs": [
 *           ["TYPE_CORRESP", "ID_CORRESP"],
 *           ["TYPE_SUJET", "ID_SUJET"]
 *       ]
 *   }
 */

/**
* Description in English
* This utils helps you to fill values in field groups
* For insntance you can create a group of three fields, input in ONE FIELD values with special separator inputed in "split" in the .config file
* Like: apple:car:house , and the values will be splited and filled in three different input fields
* Use "pairs" to set input field pairs in the .config
*/


//@include lib_Class
//@include lib_sol.common.ObjectUtils
//@include lib_proto.pack.jc.PackFunction

sol.define("Split", {
    extend: "proto.pack.jc.PackFunction",

	// Class initialize event
    initialize(config) {
        this.split = config.split || ":"
        this.pairs = config.fields || [[]]
		
		// Read debug config
		this.debug = shouldWriteLogsGlobal // Take global value
		
		// The local config is more powerful than global
		if(config.shouldWriteLogs === false){
			this.debug = false
		}
		
		if(config.shouldWriteLogs === true){
			this.debug = true
		}
		
		 log.info("Split.Debug: " + this.debug)
    },
	
	onInit(indexDialogAdapter){
		printDebugLog("Split.onInit",this.debug)
		
	// Check has at least one wrong input field
		let flag = false
		let fields = Array()
		
		// Run throw all pairs
		this.pairs.forEach(pair => {
				// Run throw all fields in pair
				pair.forEach(field => {
					try{
						let value = indexDialogAdapter.getObjKeyValue(field)
						printDebugLog("Split.onInit: Field" + field + "exists",this.debug)
					}
					catch(e){
						fields.push(field)
						printDebugLog("Split.onInit: " + e,this.debug)
						flag = true
					}
				})
            });
		
		if(flag){
			// Creates warning 
			showDebugBox("Split", "Warning: Next input fields don't exist: " + fields,this.debug);
		}
	},

	// Event called on leaving focus from input field
    onFieldExit(indexDialogAdapter, fieldName) {

		// Run throw all config pairs and try to find a pair for current field
        let a = this.pairs.find((pairElem) => {
            return (pairElem[0] === fieldName)
        })

		// Check if tha pair was found 
        if (a) {

			// Read value from current field
            let val = String(indexDialogAdapter.getObjKeyValue(fieldName))

			if (val.includes(this.split) || val === "") {
				// Split the value on parts by separator
				let parts = val.split(this.split)

				// Run throw all fields in the pair and fill inside splited values
				for (let i = 0; i < a.length || i < parts.length; i++) {

					parts[i] === undefined ? indexDialogAdapter.setObjKeyValue(a[i], "") : indexDialogAdapter.setObjKeyValue(a[i], parts[i])
				}
			}
        }
    },
})