/**
 * Utilité:
 *   Modifie le nom automatiquement en fonction du contenu des champs sélectionnés.
 *   Le nom n'est modifié que si il commence par un caractère précis, il est donc possible d'entrer un nom manuellement si on le souhaite.
 *   Voilà un exemple de nom automatique:
 *       < Facture | Protocol SA | Matériel | 200-9441
 *   Si un champ est vide, il ne s'affiche pas dans le nom:
 *       < Facture | Protocol SA | 200-9441
 *   Pour que le nom devienne automatique, il suffit d'entrer le préfix:
 *       <
 *        -appuie TAB-
 *       < Acte authentique | John Smith & Co.
 * 
 * Configuration:
 *   "AutoName": {
 *       "fields": ["TYPE_DOCUMENT", "CORRESPONDANT", "SUJET", "NO_REFERENCE"]
 *   }
 * 
 * Configuration optionnelle:
 *   "AutoName": {
 *       "fields": ["TYPE_DOCUMENT", "CORRESPONDANT", "SUJET", "NO_REFERENCE"],
 *       "prefix": "<",
 *       "separator": " | ",
 *       "valueExclusion": "_Indéfini"
 *
 *   }
 */
 
 /**
* Description in English
* This util automatically fills the Name field, by content in "fields" from .config file
* The script works only if the name field starts from special symbol named "prefix" from .config file
* Values in the name from fields will be separated by special symbol names "separator" from .config file
* If you don't want to autofill name, remove prefix symbol. If you want to do it, write prefix and press TAB
* You can add exclusion word, which won't be filled automaticaly, using "valueExclusion" in .config
*
* Configuration examples:
*
* "AutoName": {
*       "fields": ["TYPE_DOCUMENT", "CORRESPONDANT", "SUJET", "NO_REFERENCE"]
*   }
*
* "AutoName": {
*       "fields": ["TYPE_DOCUMENT", "CORRESPONDANT", "SUJET", "NO_REFERENCE"],
*       "prefix": "<",
*       "separator": " | ",
*		"valueExclusion": "_Indéfini"
*   }
*/

//@include lib_Class
//@include lib_sol.common.ObjectUtils
//@include lib_proto.pack.jc.PackFunction

sol.define("AutoName", {
    extend: "proto.pack.jc.PackFunction",
	
	// Class initialize event
    initialize(config) {
		// Read values from config on initialize
        this.fields = config.fields || []
        this.prefix = config.prefix || "<" // If prefix isn't selected in config, set "<" as default prefix
        this.separator = config.separator || " | " // If separator isn't selected in config, set "|" as default separator
		this.valueExclusion = config.valueExclusion || ""
        this.field1 = config.field1 || ""
        this.field2 = config.field2 || ""
		
		// Read debug config
		this.debug = shouldWriteLogsGlobal // Take global value
		
		// The local config is more powerful than global
		if(config.shouldWriteLogs === false){
			this.debug = false
		}
		
		if(config.shouldWriteLogs === true){
			this.debug = true
		}
		
		 log.info("AutoName.Debug: " + this.debug)
    },


	// Event called on IndexDialog initialize
    onInit: function (indexDialog) {
		printDebugLog("AutoName.OnInit",this.debug)
		
		// Check incorrect fields
		let fields = []
        let flag = false
	    // Run throw all fields from config file
        this.fields.forEach(f => {
				// Get values from input field
				try{
                    let value = indexDialog.getObjKeyValue(f)
                    printDebugLog("AutoName.onInit: Field" + f + "exists",this.debug)
				}
				catch(e){
					 fields.push(f)
					 printDebugLog("AutoName.onInit: " + e,this.debug)
					 flag = true
				}
            });
			
		// Check has at least one wrong field
		if(flag){
			// Creates warning 	
			showDebugBox("AutoName", "Warning: Next input fields don't exist: " + fields,this.debug)		
		}
		
		// Check is it a new entry
        //if (indexDialog.isNewEntry())
			// If it is new, set the prefix as a name
            indexDialog.setName(this.prefix)
			
		// Process auto name one time on start
        this.process(indexDialog)
    },
	
	// Event called on leaving focus from input field
    onFieldExit(indexDialog, fieldName) {
		 printDebugLog("AutoName.onFieldExit",this.debug)
		// If you leave focus from input field, there is an probability what you have changed value in field from config file
		// It means you need to update the name, because it could have to been changed
        this.process(indexDialog)
    },
	
	// Event called on indexDialog exit
    onNameExit(indexDialog) {
		printDebugLog("AutoName.onNameExit",this.debug)
		// Process name on close
        this.process(indexDialog)
    },

	// The main method of utils. Processing the name from fields
    process(indexDialog) {     
		// Check if name starts from prefix to continue
        if (String(indexDialog.getName()).startsWith(this.prefix)) {
			printDebugLog("AutoName.process",this.debug)
            let new_name = this.prefix + " "
            let field_list = this.fields

            let valueField1 = indexDialog.getObjKeyValue(this.field1)
			let valueField2 = indexDialog.getObjKeyValue(this.field2)

            // Create an array for
            let field_values = Array()

			// Run throw all fields
            field_list.forEach(f => {
				try{
				// Try to get value from field if it exists
                    let value = indexDialog.getObjKeyValue(f)
				// Check if value isn't empty
                if (value && String(value) !== ""){
					// Check if value isn't equals to the exclusion word
                    if(String(value) !== this.valueExclusion){
                        field_values.push(value) // If everything is correct push this word into array
                    }
                }}
				catch(e){
					printDebugLog("AutoName.process: " + e,this.debug)
				}
            });


            //Delete field1 from name if field2 isn't empty
            if (String(valueField2) !== "") {
                for (let i = 0; i < field_values.length; i++) {
                    if (String(field_values[i]) === String(valueField1)) {
                        field_values.splice(i, 1);
                    }
                }
            }

            // Generate new name using values and the separator
            new_name += field_values.join(this.separator)
            let oldName = indexDialog.getName()
			printDebugLog("AutoName.process.new_name : " + oldName)
            indexDialog.setName(new_name) // Set the new name
			printDebugLog("AutoName.process.new_name : " + new_name)
        }
    },
})